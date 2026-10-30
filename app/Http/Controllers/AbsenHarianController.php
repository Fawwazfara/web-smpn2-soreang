<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAbsenHarianRequest;
use App\Models\AbsenHarian;
use App\Models\GuruPiket;
use App\Models\HariLibur;
use App\Models\JadwalSlot;
use App\Models\TahunAjaran;
use Carbon\Carbon;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AbsenHarianController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $tz = config('absensi.timezone', 'Asia/Jakarta');
        $now = Carbon::now($tz);
        $todayStr = $now->toDateString();

        $bulanInput = (string) $request->input('bulan', $now->format('Y-m'));
        $bulan = preg_match('/^\d{4}-(0[1-9]|1[0-2])$/', $bulanInput)
            ? $bulanInput
            : $now->format('Y-m');

        $startOfMonth = Carbon::createFromFormat('Y-m-d', $bulan.'-01', $tz)->startOfMonth();
        $endOfMonth = $startOfMonth->copy()->endOfMonth();

        $absenHariIniModel = AbsenHarian::query()
            ->where('user_id', $user->id)
            ->whereDate('tanggal', $todayStr)
            ->first();

        $riwayatModels = AbsenHarian::query()
            ->where('user_id', $user->id)
            ->whereBetween('tanggal', [$startOfMonth->toDateString(), $endOfMonth->toDateString()])
            ->orderByDesc('tanggal')
            ->get();

        $hariKerjaEfektif = $this->hitungHariKerjaEfektif($startOfMonth, $endOfMonth, $now, $riwayatModels->count());
        $hadirTepatWaktu = $riwayatModels->where('status', 'tepat waktu')->count();
        $terlambatCount = $riwayatModels->where('status', 'terlambat')->count();
        $izinCount = $riwayatModels->whereNotIn('status', ['tepat waktu', 'terlambat'])->count();
        $totalHadir = $riwayatModels->count();
        $persentaseKehadiran = $hariKerjaEfektif > 0
            ? round(min(100, ($totalHadir / $hariKerjaEfektif) * 100), 1)
            : 100.0;

        $tahunAjaranAktif = TahunAjaran::query()
            ->where('aktif', true)
            ->first(['id', 'nama', 'semester']);

        $agendaHariIni = JadwalSlot::query()
            ->with([
                'kelas:id,nama,tingkat',
                'mapel:id,nama,kode',
                'jamPelajaran:id,jam_ke,mulai,selesai',
            ])
            ->where('guru_id', $user->id)
            ->where('hari', $now->dayOfWeekIso)
            ->whereHas('versi', fn ($q) => $q->where('status', 'aktif'))
            ->get()
            ->sortBy(fn (JadwalSlot $slot) => $slot->jamPelajaran?->jam_ke ?? 99)
            ->values()
            ->map(fn (JadwalSlot $slot) => [
                'id' => $slot->id,
                'kelas_nama' => $slot->kelas?->nama ?? '-',
                'mapel_nama' => $slot->mapel?->nama ?? '-',
                'jam_ke' => $slot->jamPelajaran?->jam_ke,
                'mulai' => substr((string) ($slot->jamPelajaran?->mulai ?? ''), 0, 5),
                'selesai' => substr((string) ($slot->jamPelajaran?->selesai ?? ''), 0, 5),
            ]);

        $jadwalPiketHariIni = GuruPiket::query()
            ->with('user:id,nama')
            ->where('hari', $now->dayOfWeekIso)
            ->when($tahunAjaranAktif, fn ($q) => $q->where('tahun_ajaran_id', $tahunAjaranAktif->id))
            ->get();

        $sedangTugasPiket = $user->role === 'guru_piket'
            || $jadwalPiketHariIni->contains(fn (GuruPiket $gp) => $gp->user_id === $user->id);

        $rekanPiket = $jadwalPiketHariIni
            ->filter(fn (GuruPiket $gp) => $gp->user_id !== $user->id && $gp->user !== null)
            ->map(fn (GuruPiket $gp) => $gp->user->nama)
            ->values();

        $jamMulaiMasuk = (string) config('absensi.jam_mulai_masuk', '06:30');
        $jamMasuk = (string) config('absensi.jam_masuk', '07:00');
        $toleransiMenit = (int) config('absensi.toleransi_menit', 15);
        $batasTepatWaktuCarbon = Carbon::createFromFormat('Y-m-d H:i', $todayStr.' '.$jamMasuk, $tz)
            ->addMinutes($toleransiMenit);
        $jamPulang = (string) config('absensi.jam_pulang', '14:30');
        $waktuBukaPulang = Carbon::createFromFormat('Y-m-d H:i', $todayStr.' '.$jamPulang, $tz)->setSecond(0);

        $pilihanBulan = collect(range(0, 5))->map(function (int $offset) use ($now) {
            $dt = $now->copy()->startOfMonth()->subMonths($offset);

            return [
                'value' => $dt->format('Y-m'),
                'label' => $this->formatNamaBulanTahun($dt),
            ];
        })->values();

        if (! $pilihanBulan->contains('value', $bulan)) {
            $pilihanBulan->prepend([
                'value' => $bulan,
                'label' => $this->formatNamaBulanTahun($startOfMonth),
            ]);
        }

        return Inertia::render('AbsenHarian/Index', [
            'absenHariIni' => $absenHariIniModel ? $this->formatAbsenRecord($absenHariIniModel, $tz) : null,
            'riwayatBulanIni' => $riwayatModels->map(fn (AbsenHarian $item) => $this->formatAbsenRecord($item, $tz))->values(),
            'ringkasanBulanIni' => [
                'bulan' => $bulan,
                'bulan_label' => $this->formatNamaBulanTahun($startOfMonth),
                'hari_kerja_efektif' => $hariKerjaEfektif,
                'hadir_tepat_waktu' => $hadirTepatWaktu,
                'izin_dinas_luar' => $izinCount,
                'terlambat' => $terlambatCount,
                'persentase_kehadiran' => number_format($persentaseKehadiran, 1, '.', ''),
            ],
            'aturanJam' => [
                'timezone' => $tz,
                'tanggal_hari_ini' => $todayStr,
                'tanggal_hari_ini_label' => $this->formatTanggalLengkapIndo($now),
                'jam_mulai_masuk' => $jamMulaiMasuk,
                'jam_masuk' => $jamMasuk,
                'toleransi_menit' => $toleransiMenit,
                'batas_tepat_waktu' => $batasTepatWaktuCarbon->format('H:i'),
                'jam_pulang' => $jamPulang,
                'bisa_pulang_sekarang' => $now->gte($waktuBukaPulang),
                'server_now_iso' => $now->toIso8601String(),
                'sekolah' => config('absensi.sekolah'),
            ],
            'agendaHariIni' => $agendaHariIni,
            'infoPiketHariIni' => [
                'bertugas' => $sedangTugasPiket,
                'rekan' => $rekanPiket,
            ],
            'pilihanBulan' => $pilihanBulan,
            'flashStatus' => session('status'),
        ]);
    }

    public function store(StoreAbsenHarianRequest $request): RedirectResponse
    {
        $user = $request->user();
        $tz = config('absensi.timezone', 'Asia/Jakarta');
        $now = Carbon::now($tz);
        $tanggal = $now->toDateString();

        $alreadyExists = AbsenHarian::query()
            ->where('user_id', $user->id)
            ->whereDate('tanggal', $tanggal)
            ->exists();

        if ($alreadyExists) {
            throw ValidationException::withMessages([
                'absen' => 'Anda sudah melakukan presensi masuk hari ini.',
            ]);
        }

        $jamMasuk = (string) config('absensi.jam_masuk', '07:00');
        $toleransiMenit = (int) config('absensi.toleransi_menit', 15);
        $batasTepatWaktu = Carbon::createFromFormat('Y-m-d H:i', $tanggal.' '.$jamMasuk, $tz)
            ->addMinutes($toleransiMenit)
            ->setSecond(59);

        $status = $now->lte($batasTepatWaktu) ? 'tepat waktu' : 'terlambat';

        $capture = $request->decodedCapture();
        $fotoPath = sprintf(
            'absen-harian/%s/%d-masuk-%s.%s',
            $tanggal,
            $user->id,
            Str::uuid(),
            $capture['extension']
        );

        Storage::disk('public')->put($fotoPath, $capture['binary']);

        $waktuAmbil = Carbon::parse((string) $request->validated('waktu_ambil'))->setTimezone($tz);
        $keterangan = $this->buildKeteranganLokasi($request);

        try {
            AbsenHarian::create([
                'user_id' => $user->id,
                'tanggal' => $tanggal,
                'waktu_masuk' => $now,
                'waktu_pulang' => null,
                'waktu_ambil' => $waktuAmbil,
                'foto_path' => $fotoPath,
                'sumber' => 'live',
                'ip_address' => $request->ip(),
                'user_agent' => (string) $request->userAgent(),
                'status' => $status,
                'keterangan' => $keterangan,
            ]);
        } catch (UniqueConstraintViolationException) {
            Storage::disk('public')->delete($fotoPath);

            throw ValidationException::withMessages([
                'absen' => 'Anda sudah melakukan presensi masuk hari ini.',
            ]);
        }

        return redirect()
            ->route('absen-harian.index')
            ->with('status', 'Presensi masuk berhasil dicatat pada pukul '.$now->format('H:i').' WIB ('.ucwords($status).').');
    }

    public function pulang(StoreAbsenHarianRequest $request): RedirectResponse
    {
        $user = $request->user();
        $tz = config('absensi.timezone', 'Asia/Jakarta');
        $now = Carbon::now($tz);
        $tanggal = $now->toDateString();

        $absen = AbsenHarian::query()
            ->where('user_id', $user->id)
            ->whereDate('tanggal', $tanggal)
            ->first();

        if (! $absen) {
            throw ValidationException::withMessages([
                'absen' => 'Anda belum melakukan presensi masuk hari ini.',
            ]);
        }

        if ($absen->waktu_pulang !== null) {
            throw ValidationException::withMessages([
                'absen' => 'Anda sudah melakukan presensi pulang hari ini.',
            ]);
        }

        $jamPulang = (string) config('absensi.jam_pulang', '14:30');
        $waktuBukaPulang = Carbon::createFromFormat('Y-m-d H:i', $tanggal.' '.$jamPulang, $tz)->setSecond(0);

        if ($now->lt($waktuBukaPulang)) {
            throw ValidationException::withMessages([
                'absen' => 'Mode presensi pulang baru aktif mulai pukul '.$jamPulang.' WIB.',
            ]);
        }

        $capture = $request->decodedCapture();
        $fotoPulangPath = sprintf(
            'absen-harian/%s/%d-pulang-%s.%s',
            $tanggal,
            $user->id,
            Str::uuid(),
            $capture['extension']
        );

        Storage::disk('public')->put($fotoPulangPath, $capture['binary']);

        $absen->update([
            'waktu_pulang' => $now,
        ]);

        return redirect()
            ->route('absen-harian.index')
            ->with('status', 'Presensi pulang berhasil dicatat pada pukul '.$now->format('H:i').' WIB.');
    }

    public function foto(Request $request, AbsenHarian $absenHarian): StreamedResponse
    {
        $user = $request->user();

        if ($absenHarian->user_id !== $user->id && ! in_array($user->role, ['admin', 'kepsek'], true)) {
            abort(403);
        }

        if (! $absenHarian->foto_path || ! Storage::disk('public')->exists($absenHarian->foto_path)) {
            abort(404);
        }

        return Storage::disk('public')->response($absenHarian->foto_path);
    }

    /**
     * @return array<string, mixed>
     */
    protected function formatAbsenRecord(AbsenHarian $item, string $tz): array
    {
        $tanggalCarbon = Carbon::parse($item->tanggal, $tz);
        $waktuMasuk = $item->waktu_masuk ? Carbon::parse($item->waktu_masuk)->setTimezone($tz) : null;
        $waktuPulang = $item->waktu_pulang ? Carbon::parse($item->waktu_pulang)->setTimezone($tz) : null;
        $waktuAmbil = $item->waktu_ambil ? Carbon::parse($item->waktu_ambil)->setTimezone($tz) : null;

        $sesiLabel = match ($tanggalCarbon->dayOfWeekIso) {
            1 => 'Upacara Bendera Hari Senin',
            5 => 'Sesi Jumat Bersih',
            default => 'Sesi Pagi Reguler',
        };

        return [
            'id' => $item->id,
            'tanggal' => $tanggalCarbon->toDateString(),
            'tanggal_label' => $this->formatTanggalRingkasIndo($tanggalCarbon),
            'sesi_label' => $sesiLabel,
            'jam_masuk' => $waktuMasuk ? $waktuMasuk->format('H:i').' WIB' : '-',
            'jam_masuk_full' => $waktuMasuk ? $waktuMasuk->format('H:i:s').' WIB' : '-',
            'jam_pulang' => $waktuPulang ? $waktuPulang->format('H:i').' WIB' : null,
            'waktu_ambil' => $waktuAmbil ? $waktuAmbil->format('H:i:s').' WIB' : null,
            'status' => $item->status,
            'sumber' => $item->sumber,
            'keterangan' => $item->keterangan ?: 'Kamera Live Terverifikasi',
            'foto_path' => $item->foto_path,
            'foto_url' => $item->foto_path ? route('absen-harian.foto', $item->id) : null,
        ];
    }

    protected function buildKeteranganLokasi(StoreAbsenHarianRequest $request): string
    {
        $custom = trim((string) $request->validated('keterangan', ''));
        if ($custom !== '') {
            return $custom;
        }

        $lat = $request->validated('latitude');
        $lng = $request->validated('longitude');

        if ($lat !== null && $lng !== null) {
            $sekolahLat = (float) config('absensi.sekolah.latitude', -7.02614);
            $sekolahLng = (float) config('absensi.sekolah.longitude', 107.51928);
            $distanceMeters = $this->haversineMeters((float) $lat, (float) $lng, $sekolahLat, $sekolahLng);

            return sprintf(
                'Radius %.1fm (%.4f, %.4f)',
                $distanceMeters,
                (float) $lat,
                (float) $lng
            );
        }

        return 'Kamera Live Terverifikasi';
    }

    protected function haversineMeters(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadius = 6371000.0;
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) ** 2
            + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLon / 2) ** 2;

        return 2 * $earthRadius * asin(min(1.0, sqrt($a)));
    }

    protected function hitungHariKerjaEfektif(
        Carbon $startOfMonth,
        Carbon $endOfMonth,
        Carbon $now,
        int $jumlahHadir
    ): int {
        $batasAkhir = $startOfMonth->isSameMonth($now) && $now->lt($endOfMonth)
            ? $now->copy()->endOfDay()
            : $endOfMonth->copy()->endOfDay();

        if ($batasAkhir->lt($startOfMonth)) {
            return max(1, $jumlahHadir);
        }

        $liburSet = HariLibur::query()
            ->whereBetween('tanggal', [$startOfMonth->toDateString(), $batasAkhir->toDateString()])
            ->pluck('tanggal')
            ->map(fn ($d) => Carbon::parse($d)->toDateString())
            ->flip();

        $hariKerja = 0;
        $cursor = $startOfMonth->copy();

        while ($cursor->lte($batasAkhir)) {
            if ($cursor->dayOfWeekIso <= 5 && ! $liburSet->has($cursor->toDateString())) {
                $hariKerja++;
            }
            $cursor->addDay();
        }

        return max($hariKerja, $jumlahHadir);
    }

    protected function formatTanggalLengkapIndo(Carbon $dt): string
    {
        $hari = [
            1 => 'Senin',
            2 => 'Selasa',
            3 => 'Rabu',
            4 => 'Kamis',
            5 => 'Jumat',
            6 => 'Sabtu',
            7 => 'Minggu',
        ][$dt->dayOfWeekIso] ?? '';

        $bulan = [
            1 => 'Januari',
            2 => 'Februari',
            3 => 'Maret',
            4 => 'April',
            5 => 'Mei',
            6 => 'Juni',
            7 => 'Juli',
            8 => 'Agustus',
            9 => 'September',
            10 => 'Oktober',
            11 => 'November',
            12 => 'Desember',
        ][$dt->month] ?? '';

        return sprintf('%s, %02d %s %d', $hari, $dt->day, $bulan, $dt->year);
    }

    protected function formatTanggalRingkasIndo(Carbon $dt): string
    {
        $hari = [
            1 => 'Senin',
            2 => 'Selasa',
            3 => 'Rabu',
            4 => 'Kamis',
            5 => 'Jumat',
            6 => 'Sabtu',
            7 => 'Minggu',
        ][$dt->dayOfWeekIso] ?? '';

        $bulan = [
            1 => 'Jan',
            2 => 'Feb',
            3 => 'Mar',
            4 => 'Apr',
            5 => 'Mei',
            6 => 'Jun',
            7 => 'Jul',
            8 => 'Agu',
            9 => 'Sep',
            10 => 'Okt',
            11 => 'Nov',
            12 => 'Des',
        ][$dt->month] ?? '';

        return sprintf('%s, %02d %s %d', $hari, $dt->day, $bulan, $dt->year);
    }

    protected function formatNamaBulanTahun(Carbon $dt): string
    {
        $bulan = [
            1 => 'Januari',
            2 => 'Februari',
            3 => 'Maret',
            4 => 'April',
            5 => 'Mei',
            6 => 'Juni',
            7 => 'Juli',
            8 => 'Agustus',
            9 => 'September',
            10 => 'Oktober',
            11 => 'November',
            12 => 'Desember',
        ][$dt->month] ?? '';

        return sprintf('%s %d', $bulan, $dt->year);
    }
}
