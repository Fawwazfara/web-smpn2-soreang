<?php

namespace Tests\Feature;

use App\Events\AbsenSiswaRecorded;
use App\Jobs\SendWhatsAppNotification;
use App\Models\AbsenSiswa;
use App\Models\JamPelajaran;
use App\Models\Kelas;
use App\Models\Mapel;
use App\Models\NotifikasiWa;
use App\Models\Sesi;
use App\Models\Siswa;
use App\Models\TahunAjaran;
use App\Models\User;
use App\Services\FonnteService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class NotifikasiWaTest extends TestCase
{
    use RefreshDatabase;

    protected Siswa $siswa;
    protected Kelas $kelas;
    protected User $guru;
    protected Sesi $sesi;

    protected function setUp(): void
    {
        parent::setUp();

        SendWhatsAppNotification::resetSchedule();

        config(['services.fonnte.token' => 'dummy-fonnte-token-123']);
        config(['services.fonnte.url' => 'https://api.fonnte.com/send']);

        $ta = TahunAjaran::create([
            'nama' => '2026/2027',
            'semester' => 'Ganjil',
            'tanggal_mulai' => '2026-07-15',
            'tanggal_selesai' => '2026-12-20',
            'aktif' => true,
        ]);

        $this->guru = User::factory()->create([
            'role' => 'guru',
            'aktif' => true,
            'nama' => 'Guru Pengampu',
        ]);

        $this->kelas = Kelas::create([
            'nama' => 'VIII-B',
            'tingkat' => 8,
            'tahun_ajaran_id' => $ta->id,
        ]);

        $this->siswa = Siswa::create([
            'nis' => '1001',
            'nama' => 'Budi Santoso',
            'kelas_id' => $this->kelas->id,
            'no_hp_ortu' => '081234567890',
            'aktif' => true,
        ]);

        $mapel = Mapel::create([
            'kode' => 'IPA',
            'nama' => 'Ilmu Pengetahuan Alam',
            'kelompok_kurikulum' => 'A',
        ]);

        $jam = JamPelajaran::create([
            'jam_ke' => 1,
            'mulai' => '07:30',
            'selesai' => '08:15',
            'kelompok_hari' => 'senin-kamis',
        ]);

        $this->sesi = Sesi::create([
            'tanggal' => now()->toDateString(),
            'kelas_id' => $this->kelas->id,
            'jam_pelajaran_id' => $jam->id,
            'mapel_id' => $mapel->id,
            'guru_id' => $this->guru->id,
            'status' => 'terjadwal',
        ]);
    }

    public function test_fonnte_service_sends_message_with_correct_payload_and_header(): void
    {
        Http::fake([
            'https://api.fonnte.com/send' => Http::response([
                'status' => true,
                'id' => ['msg-999'],
                'target' => ['081234567890'],
                'detail' => 'success',
            ], 200),
        ]);

        $service = new FonnteService('test-token-abc', 'https://api.fonnte.com/send');
        $result = $service->sendMessage('081234567890', 'Halo orang tua murid');

        $this->assertTrue($result['success']);
        $this->assertEquals(200, $result['status_code']);
        $this->assertEquals('msg-999', $result['message_id']);

        Http::assertSent(function ($request) {
            return $request->hasHeader('Authorization', 'test-token-abc') &&
                $request['target'] === '081234567890' &&
                $request['message'] === 'Halo orang tua murid';
        });
    }

    public function test_fonnte_service_handles_failure_gracefully(): void
    {
        Http::fake([
            'https://api.fonnte.com/send' => Http::response([
                'status' => false,
                'reason' => 'device disconnected',
            ], 400),
        ]);

        $service = new FonnteService();
        $result = $service->sendMessage('081234567890', 'Pesan tes');

        $this->assertFalse($result['success']);
        $this->assertEquals(400, $result['status_code']);
    }

    public function test_job_sends_wa_and_logs_database_for_status_alfa(): void
    {
        Http::fake([
            'https://api.fonnte.com/send' => Http::response([
                'status' => true,
                'id' => ['msg-alfa-123'],
                'detail' => 'success',
            ], 200),
        ]);

        $job = new SendWhatsAppNotification($this->siswa, 'A');
        $log = $job->handle(new FonnteService());

        $this->assertNotNull($log);
        $this->assertEquals($this->siswa->id, $log->siswa_id);
        $this->assertEquals('081234567890', $log->no_wa);
        $this->assertEquals('alfa', $log->jenis_pesan);
        $this->assertEquals('terkirim', $log->status_delivery);
        $this->assertStringContainsString('📢 *Pemberitahuan Presensi SMP Negeri 2 Soreang*', $log->isi_pesan);
        $this->assertStringContainsString('*ALFA*', $log->isi_pesan);
        $this->assertStringContainsString($this->siswa->nama, $log->isi_pesan);
        $this->assertStringContainsString(now()->locale('id')->translatedFormat('d F Y'), $log->isi_pesan);
        $this->assertStringNotContainsString('/konfirmasi/', $log->isi_pesan);

        $this->assertDatabaseHas('notifikasi_wa', [
            'siswa_id' => $this->siswa->id,
            'no_wa' => '081234567890',
            'jenis_pesan' => 'alfa',
            'status_delivery' => 'terkirim',
        ]);
    }

    public function test_job_sends_wa_with_confirmation_link_for_status_sakit_and_izin(): void
    {
        Http::fake([
            'https://api.fonnte.com/send' => Http::response([
                'status' => true,
                'id' => ['msg-sakit-456'],
                'detail' => 'success',
            ], 200),
        ]);

        $token = 'random-token-sakit-777';
        $job = new SendWhatsAppNotification($this->siswa, 'S', $token);
        $log = $job->handle(new FonnteService());

        $this->assertNotNull($log);
        $this->assertEquals('sakit', $log->jenis_pesan);
        $this->assertEquals('terkirim', $log->status_delivery);
        $this->assertStringContainsString('📢 *Pemberitahuan Presensi SMP Negeri 2 Soreang*', $log->isi_pesan);
        $this->assertStringContainsString('*SAKIT*', $log->isi_pesan);
        $this->assertStringContainsString('dokter/sakit', $log->isi_pesan);
        $this->assertStringContainsString('👉 *Klik untuk Konfirmasi:*', $log->isi_pesan);
        $this->assertStringContainsString('⚠️ Tautan konfirmasi berlaku selama 7 hari.', $log->isi_pesan);
        $this->assertStringContainsString("/konfirmasi/{$token}", $log->isi_pesan);

        // Test status Izin
        $tokenIzin = 'random-token-izin-888';
        $jobIzin = new SendWhatsAppNotification($this->siswa, 'I', $tokenIzin);
        $messageIzin = $jobIzin->buildMessage($this->siswa);
        $this->assertStringContainsString('📢 *Pemberitahuan Presensi SMP Negeri 2 Soreang*', $messageIzin);
        $this->assertStringContainsString('*IZIN*', $messageIzin);
        $this->assertStringContainsString('surat keterangan izin', $messageIzin);
        $this->assertStringContainsString('👉 *Klik untuk Konfirmasi:*', $messageIzin);
        $this->assertStringContainsString('⚠️ Tautan konfirmasi berlaku selama 7 hari.', $messageIzin);
        $this->assertStringContainsString("/konfirmasi/{$tokenIzin}", $messageIzin);
    }

    public function test_deduplication_prevents_multiple_blasts_per_student_per_day(): void
    {
        Http::fake([
            'https://api.fonnte.com/send' => Http::response([
                'status' => true,
                'id' => ['msg-first'],
            ], 200),
        ]);

        // Blast pertama hari ini
        $job1 = new SendWhatsAppNotification($this->siswa, 'A');
        $log1 = $job1->handle(new FonnteService());
        $this->assertNotNull($log1);

        // Blast kedua pada hari yang sama untuk murid yang sama (misal di sesi berikutnya)
        $job2 = new SendWhatsAppNotification($this->siswa, 'S', 'token-sesi-berikutnya');
        $log2 = $job2->handle(new FonnteService());

        // Harus diabaikan (null) karena sudah dikirim blast hari ini
        $this->assertNull($log2);

        // Pastikan hanya ada 1 log terkirim hari ini untuk murid ini
        $this->assertEquals(1, NotifikasiWa::where('siswa_id', $this->siswa->id)->count());
        Http::assertSentCount(1);
    }

    public function test_job_has_safe_anti_ban_delay_around_30_seconds_with_random_variation(): void
    {
        $job = new SendWhatsAppNotification($this->siswa, 'A');

        $this->assertGreaterThanOrEqual(31, $job->delaySeconds);
        $this->assertLessThanOrEqual(35, $job->delaySeconds);
        $this->assertGreaterThanOrEqual(1, $job->randomVariation);
        $this->assertLessThanOrEqual(5, $job->randomVariation);
        $this->assertNotNull($job->scheduledAt);
    }

    public function test_jobs_are_scheduled_sequentially_with_30_seconds_gap_plus_random_variation(): void
    {
        $siswa2 = Siswa::create([
            'nis' => '1002',
            'nama' => 'Siti Aminah',
            'kelas_id' => $this->kelas->id,
            'no_hp_ortu' => '081234567891',
            'aktif' => true,
        ]);

        $siswa3 = Siswa::create([
            'nis' => '1003',
            'nama' => 'Rahmat Hidayat',
            'kelas_id' => $this->kelas->id,
            'no_hp_ortu' => '081234567892',
            'aktif' => true,
        ]);

        $job1 = new SendWhatsAppNotification($this->siswa, 'A');
        $job2 = new SendWhatsAppNotification($siswa2, 'S', 'token-s2');
        $job3 = new SendWhatsAppNotification($siswa3, 'I', 'token-s3');

        // Job 2 harus dijadwalkan ~30 detik setelah Job 1
        $diff1To2 = $job2->scheduledAt->getTimestamp() - $job1->scheduledAt->getTimestamp();
        $this->assertGreaterThanOrEqual(31, $diff1To2);
        $this->assertLessThanOrEqual(35, $diff1To2);

        // Job 3 harus dijadwalkan ~30 detik setelah Job 2
        $diff2To3 = $job3->scheduledAt->getTimestamp() - $job2->scheduledAt->getTimestamp();
        $this->assertGreaterThanOrEqual(31, $diff2To3);
        $this->assertLessThanOrEqual(35, $diff2To3);
    }

    public function test_job_scheduling_uses_max_available_at_from_jobs_table_when_pending(): void
    {
        SendWhatsAppNotification::resetSchedule();

        $futureTimestamp = now()->addMinutes(3)->getTimestamp();

        // Simulasikan ada job lain yang belum dieksekusi di tabel jobs
        DB::table('jobs')->insert([
            'queue' => 'default',
            'payload' => json_encode(['job' => 'dummy']),
            'attempts' => 0,
            'reserved_at' => null,
            'available_at' => $futureTimestamp,
            'created_at' => now()->getTimestamp(),
        ]);

        $job = new SendWhatsAppNotification($this->siswa, 'A');

        // Job baru harus dijadwalkan setelah available_at terbesar di tabel jobs + 30-35 detik
        $this->assertGreaterThanOrEqual($futureTimestamp + 31, $job->scheduledAt->getTimestamp());
        $this->assertLessThanOrEqual($futureTimestamp + 35, $job->scheduledAt->getTimestamp());
    }

    public function test_job_scheduling_falls_back_to_now_if_jobs_table_has_past_available_at(): void
    {
        SendWhatsAppNotification::resetSchedule();

        $pastTimestamp = now()->subMinutes(5)->getTimestamp();

        DB::table('jobs')->insert([
            'queue' => 'default',
            'payload' => json_encode(['job' => 'dummy-past']),
            'attempts' => 1,
            'reserved_at' => null,
            'available_at' => $pastTimestamp,
            'created_at' => $pastTimestamp,
        ]);

        $job = new SendWhatsAppNotification($this->siswa, 'A');

        // Karena available_at sudah lewat dari now(), gunakan now() sebagai patokan
        $nowTimestamp = now()->getTimestamp();
        $this->assertGreaterThanOrEqual($nowTimestamp + 31, $job->scheduledAt->getTimestamp());
        $this->assertLessThanOrEqual($nowTimestamp + 36, $job->scheduledAt->getTimestamp());
    }

    public function test_missing_phone_number_records_gagal_without_http_call(): void
    {
        $siswaTanpaHp = Siswa::create([
            'nis' => '1002',
            'nama' => 'Siswa Tanpa HP',
            'kelas_id' => $this->kelas->id,
            'no_hp_ortu' => null,
            'aktif' => true,
        ]);

        Http::fake();

        $job = new SendWhatsAppNotification($siswaTanpaHp, 'A');
        $log = $job->handle(new FonnteService());

        $this->assertNotNull($log);
        $this->assertEquals('gagal', $log->status_delivery);
        $this->assertArrayHasKey('error', $log->response_payload);
        Http::assertNothingSent();
    }

    public function test_status_hadir_does_not_send_wa(): void
    {
        Http::fake();

        $job = new SendWhatsAppNotification($this->siswa, 'H');
        $log = $job->handle(new FonnteService());

        $this->assertNull($log);
        Http::assertNothingSent();
        $this->assertEquals(0, NotifikasiWa::count());
    }

    public function test_absen_sesi_controller_triggers_notification_event_for_absent_students(): void
    {
        Event::fake([AbsenSiswaRecorded::class]);

        $this->actingAs($this->guru)->post(route('guru.absen-sesi.store', $this->sesi), [
            'absen' => [
                ['siswa_id' => $this->siswa->id, 'status' => 'A', 'catatan' => 'Tanpa kabar'],
            ],
        ]);

        Event::assertDispatched(AbsenSiswaRecorded::class, function ($event) {
            return $event->absenSiswa->siswa_id === $this->siswa->id &&
                $event->absenSiswa->status === 'A';
        });
    }

    public function test_absen_siswa_recorded_event_dispatches_notification_job(): void
    {
        Queue::fake();

        $absen = AbsenSiswa::create([
            'sesi_id' => $this->sesi->id,
            'siswa_id' => $this->siswa->id,
            'status' => 'S',
            'waktu' => now(),
            'konfirmasi_token' => 'token-event-test',
            'status_konfirmasi' => 'menunggu',
        ]);

        event(new AbsenSiswaRecorded($absen, $this->guru->id));

        Queue::assertPushed(SendWhatsAppNotification::class, function ($job) {
            return $job->siswaId === $this->siswa->id &&
                $job->status === 'S' &&
                $job->token === 'token-event-test';
        });
    }
}

