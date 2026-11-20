<?php

namespace App\Jobs;

use App\Models\AbsenSiswa;
use App\Models\NotifikasiWa;
use App\Models\Siswa;
use App\Services\FonnteService;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class SendWhatsAppNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $siswaId;
    public string $status;
    public ?string $token;
    public ?int $absenSiswaId;
    public ?int $userId;
    public int $delaySeconds;
    public int $randomVariation;
    public Carbon $scheduledAt;

    /**
     * Patokan waktu terakhir untuk penjadwalan berurutan dalam satu request/batch.
     */
    public static ?Carbon $lastScheduledTime = null;

    /**
     * Create a new job instance.
     */
    public function __construct(
        Siswa|AbsenSiswa|int $siswa,
        ?string $status = null,
        ?string $token = null,
        AbsenSiswa|int|null $absenSiswa = null,
        ?int $userId = null
    ) {
        if ($siswa instanceof AbsenSiswa) {
            $this->siswaId = $siswa->siswa_id;
            $this->status = strtoupper((string) ($status ?? $siswa->status));
            $this->token = $token ?? $siswa->konfirmasi_token;
            $this->absenSiswaId = $siswa->id;
            $this->userId = $userId ?? $siswa->dicatat_oleh;
        } else {
            $this->siswaId = $siswa instanceof Siswa ? $siswa->id : (int) $siswa;
            $this->status = strtoupper((string) $status);
            $this->token = $token;
            $this->absenSiswaId = $absenSiswa instanceof AbsenSiswa ? $absenSiswa->id : $absenSiswa;
            $this->userId = $userId;
        }

        // Hitung jadwal antrean anti-ban: ~30 detik + variasi acak 1-5 detik
        $schedule = static::calculateSchedule();
        $this->scheduledAt = $schedule['scheduled_at'];
        $this->delaySeconds = $schedule['delay_from_base'];
        $this->randomVariation = $schedule['random_variation'];

        $this->delay($this->scheduledAt);
    }

    /**
     * Hitung waktu eksekusi berikutnya berdasarkan nilai available_at terbesar pada tabel jobs
     * untuk antrean yang belum dieksekusi (atau now() jika kosong / lewat), ditambah 30 detik + acak 1-5 detik.
     *
     * @return array{scheduled_at: Carbon, delay_from_base: int, random_variation: int}
     */
    public static function calculateSchedule(): array
    {
        $now = now();
        $candidateTimestamp = 0;

        if (Schema::hasTable('jobs')) {
            $maxDb = DB::table('jobs')
                ->whereNull('reserved_at')
                ->max('available_at');

            if ($maxDb) {
                $candidateTimestamp = (int) $maxDb;
            }
        }

        if (static::$lastScheduledTime && static::$lastScheduledTime->getTimestamp() > $candidateTimestamp) {
            $candidateTimestamp = static::$lastScheduledTime->getTimestamp();
        }

        // Jika kosong atau sudah lewat dari now(), gunakan now() sebagai patokan awal
        $patokanWaktu = ($candidateTimestamp > $now->getTimestamp())
            ? Carbon::createFromTimestamp($candidateTimestamp)
            : $now->copy();

        $randomVariation = random_int(1, 5);
        $delayFromBase = 30 + $randomVariation;
        $scheduledAt = $patokanWaktu->copy()->addSeconds($delayFromBase);

        // Jadikan waktu hasil perhitungan sebagai patokan untuk siswa berikutnya
        static::$lastScheduledTime = $scheduledAt;

        return [
            'scheduled_at' => $scheduledAt,
            'delay_from_base' => $delayFromBase,
            'random_variation' => $randomVariation,
        ];
    }

    /**
     * Reset patokan waktu terakhir (berguna untuk testing).
     */
    public static function resetSchedule(): void
    {
        static::$lastScheduledTime = null;
    }

    /**
     * Cek apakah murid sudah dikirimi blast WA hari ini.
     */
    public static function hasBeenSentToday(int $siswaId, ?string $date = null): bool
    {
        $date = $date ?? now()->toDateString();

        return NotifikasiWa::where('siswa_id', $siswaId)
            ->whereDate('waktu', $date)
            ->whereIn('status', ['terkirim', 'antrian'])
            ->exists();
    }

    /**
     * Execute the job.
     */
    public function handle(?FonnteService $fonnteService = null): ?NotifikasiWa
    {
        $fonnteService = $fonnteService ?? app(FonnteService::class);

        // Hanya blast untuk status A, S, I
        if (!in_array($this->status, ['A', 'S', 'I'])) {
            return null;
        }

        $todayDate = now()->toDateString();

        // Filter Deduplikasi: Maksimal 1 blast per murid per hari.
        // Cek log notifikasi_wa hari ini sebelum mengirim.
        if (self::hasBeenSentToday($this->siswaId, $todayDate)) {
            return null;
        }

        $siswa = Siswa::with('kelas')->find($this->siswaId);
        if (!$siswa) {
            return null;
        }

        $noWa = $siswa->no_hp_ortu;
        $jenisPesan = match ($this->status) {
            'A' => 'alfa',
            'S' => 'sakit',
            'I' => 'izin',
            default => strtolower($this->status),
        };

        $isiPesan = $this->buildMessage($siswa);

        // Jika nomor HP orang tua kosong, catat log gagal tanpa request ke gateway
        if (empty($noWa)) {
            return NotifikasiWa::create([
                'siswa_id' => $siswa->id,
                'absen_siswa_id' => $this->absenSiswaId,
                'user_id' => $this->userId,
                'tujuan' => '-',
                'no_wa' => '-',
                'tipe' => $jenisPesan,
                'jenis_pesan' => $jenisPesan,
                'pesan' => $isiPesan,
                'isi_pesan' => $isiPesan,
                'status' => 'gagal',
                'status_delivery' => 'gagal',
                'provider' => 'fonnte',
                'provider_message_id' => null,
                'response_payload' => ['error' => 'Nomor HP orang tua / wali tidak ditemukan'],
                'waktu' => now(),
            ]);
        }

        // Kirim via Fonnte
        $result = $fonnteService->sendMessage($noWa, $isiPesan);

        $statusDelivery = $result['success'] ? 'terkirim' : 'gagal';

        // Catat hasil response HTTP ke tabel notifikasi_wa
        return NotifikasiWa::create([
            'siswa_id' => $siswa->id,
            'absen_siswa_id' => $this->absenSiswaId,
            'user_id' => $this->userId,
            'tujuan' => $noWa,
            'no_wa' => $noWa,
            'tipe' => $jenisPesan,
            'jenis_pesan' => $jenisPesan,
            'pesan' => $isiPesan,
            'isi_pesan' => $isiPesan,
            'status' => $statusDelivery,
            'status_delivery' => $statusDelivery,
            'provider' => 'fonnte',
            'provider_message_id' => $result['message_id'],
            'response_payload' => $result['response_payload'],
            'waktu' => now(),
        ]);
    }

    /**
     * Susun template isi pesan presensi.
     */
    public function buildMessage(Siswa $siswa): string
    {
        $nama = $siswa->nama;
        $kelas = $siswa->kelas?->nama ?? '-';
        $tanggal = now()->locale('id')->translatedFormat('d F Y');
        $baseUrl = rtrim(config('app.url', 'http://localhost:8000'), '/');

        if ($this->status === 'A') {
            return "📢 *Pemberitahuan Presensi SMP Negeri 2 Soreang*\n\n"
                . "Yth. Orang Tua/Wali dari {$nama} ({$kelas})\n"
                . "Diberitahukan bahwa siswa yang bersangkutan tercatat *ALFA* (tidak hadir tanpa keterangan) pada hari ini, {$tanggal}.\n\n"
                . "Mohon konfirmasi atau hubungi pihak sekolah jika terdapat kendala.\n\n"
                . "Terima kasih.";
        }

        $statusLabel = $this->status === 'S' ? 'SAKIT' : 'IZIN';
        $keteranganSurat = $this->status === 'S' ? 'dokter/sakit' : 'izin';
        $token = $this->token ?? '';
        $link = "{$baseUrl}/konfirmasi/{$token}";

        return "📢 *Pemberitahuan Presensi SMP Negeri 2 Soreang*\n\n"
            . "Yth. Orang Tua/Wali dari {$nama} ({$kelas})\n"
            . "Diberitahukan bahwa siswa yang bersangkutan tercatat *{$statusLabel}* pada hari ini, {$tanggal}.\n\n"
            . "Mohon kesediaan Bapak/Ibu untuk mengunggah bukti surat keterangan {$keteranganSurat} melalui tautan berikut:\n"
            . "👉 *Klik untuk Konfirmasi:*\n"
            . "{$link}\n\n"
            . "⚠️ Tautan konfirmasi berlaku selama 7 hari.\n\n"
            . "Terima kasih.";
    }
}
