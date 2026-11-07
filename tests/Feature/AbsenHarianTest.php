<?php

namespace Tests\Feature;

use App\Models\AbsenHarian;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AbsenHarianTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    protected function validLiveCaptureDataUri(): string
    {
        return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
    }

    /**
     * @return array<int, float>
     */
    protected function sampleFaceDescriptor(float $phase = 0.25): array
    {
        $vector = [];
        for ($i = 0; $i < 128; $i++) {
            $vector[] = round(sin(($i * 0.17) + $phase) * 0.18, 6);
        }

        return $vector;
    }

    /**
     * @return array<int, float>
     */
    protected function differentFaceDescriptor(): array
    {
        $vector = [];
        for ($i = 0; $i < 128; $i++) {
            $vector[] = round(cos(($i * 0.31) + 2.4) * 0.22, 6);
        }

        return $vector;
    }

    public function test_guru_can_view_absen_harian_page(): void
    {
        $guru = User::factory()->create([
            'role' => 'guru',
            'jenis_pegawai' => 'guru',
        ]);

        $response = $this->actingAs($guru)->get(route('absen-harian.index'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('AbsenHarian/Index')
            ->has('aturanJam')
            ->has('ringkasanBulanIni')
        );
    }

    public function test_admin_and_kepsek_are_excluded_from_absen_harian(): void
    {
        Storage::fake('public');

        $admin = User::factory()->admin()->create();
        $kepsek = User::factory()->create(['role' => 'kepsek']);

        $payload = [
            'foto_capture' => $this->validLiveCaptureDataUri(),
            'waktu_ambil' => now()->toIso8601String(),
            'sumber' => 'live',
            'face_descriptor' => $this->sampleFaceDescriptor(),
        ];

        $this->actingAs($admin)->get(route('absen-harian.index'))->assertForbidden();
        $this->actingAs($admin)->post(route('absen-harian.store'), $payload)->assertForbidden();

        $this->actingAs($kepsek)->get(route('absen-harian.index'))->assertForbidden();
        $this->actingAs($kepsek)->post(route('absen-harian.store'), $payload)->assertForbidden();
    }

    public function test_guru_tenaga_kependidikan_and_guru_piket_can_submit_live_camera_attendance(): void
    {
        Storage::fake('public');
        Carbon::setTestNow(Carbon::create(2026, 10, 30, 6, 48, 16, 'Asia/Jakarta'));

        $pegawaiList = [
            User::factory()->create(['role' => 'guru', 'jenis_pegawai' => 'guru']),
            User::factory()->create(['role' => 'guru', 'jenis_pegawai' => 'tenaga_kependidikan']),
            User::factory()->create(['role' => 'guru_piket', 'no_wa' => '6281234567890']),
        ];

        foreach ($pegawaiList as $pegawai) {
            $response = $this->actingAs($pegawai)
                ->withHeaders(['User-Agent' => 'SiSADA-TestBrowser/1.0'])
                ->post(route('absen-harian.store'), [
                    'foto_capture' => $this->validLiveCaptureDataUri(),
                    'waktu_ambil' => Carbon::now('UTC')->toIso8601String(),
                    'sumber' => 'live',
                    'face_descriptor' => $this->sampleFaceDescriptor(),
                    'latitude' => -7.02614,
                    'longitude' => 107.51928,
                ]);

            $response->assertRedirect(route('absen-harian.index'));

            $record = AbsenHarian::where('user_id', $pegawai->id)->first();
            $this->assertNotNull($record);
            $this->assertSame('2026-10-30', $record->tanggal->toDateString());
            $this->assertSame('live', $record->sumber);
            $this->assertSame('tepat waktu', $record->status);
            $this->assertNotNull($record->waktu_ambil);
            $this->assertNotEmpty($record->ip_address);
            $this->assertSame('SiSADA-TestBrowser/1.0', $record->user_agent);
            $this->assertNotNull($record->foto_path);
            Storage::disk('public')->assertExists($record->foto_path);
        }
    }

    public function test_cutoff_0715_wib_marks_tepat_waktu_and_after_0715_marks_terlambat(): void
    {
        Storage::fake('public');

        $guruTepat = User::factory()->create(['role' => 'guru', 'jenis_pegawai' => 'guru']);
        $guruTelat = User::factory()->create(['role' => 'guru', 'jenis_pegawai' => 'guru']);

        Carbon::setTestNow(Carbon::create(2026, 10, 30, 7, 15, 0, 'Asia/Jakarta'));
        $this->actingAs($guruTepat)->post(route('absen-harian.store'), [
            'foto_capture' => $this->validLiveCaptureDataUri(),
            'waktu_ambil' => Carbon::now('UTC')->toIso8601String(),
            'sumber' => 'live',
            'face_descriptor' => $this->sampleFaceDescriptor(),
        ])->assertRedirect(route('absen-harian.index'));

        $this->assertDatabaseHas('absen_harian', [
            'user_id' => $guruTepat->id,
            'status' => 'tepat waktu',
        ]);

        Carbon::setTestNow(Carbon::create(2026, 10, 30, 7, 16, 0, 'Asia/Jakarta'));
        $this->actingAs($guruTelat)->post(route('absen-harian.store'), [
            'foto_capture' => $this->validLiveCaptureDataUri(),
            'waktu_ambil' => Carbon::now('UTC')->toIso8601String(),
            'sumber' => 'live',
            'face_descriptor' => $this->sampleFaceDescriptor(),
        ])->assertRedirect(route('absen-harian.index'));

        $this->assertDatabaseHas('absen_harian', [
            'user_id' => $guruTelat->id,
            'status' => 'terlambat',
        ]);
    }

    public function test_user_cannot_submit_duplicate_absen_harian_on_same_date(): void
    {
        Storage::fake('public');
        Carbon::setTestNow(Carbon::create(2026, 10, 30, 6, 50, 0, 'Asia/Jakarta'));

        $guru = User::factory()->create(['role' => 'guru', 'jenis_pegawai' => 'guru']);

        $payload = [
            'foto_capture' => $this->validLiveCaptureDataUri(),
            'waktu_ambil' => Carbon::now('UTC')->toIso8601String(),
            'sumber' => 'live',
            'face_descriptor' => $this->sampleFaceDescriptor(),
        ];

        $this->actingAs($guru)->post(route('absen-harian.store'), $payload)
            ->assertRedirect(route('absen-harian.index'));

        $secondResponse = $this->actingAs($guru)->post(route('absen-harian.store'), $payload);
        $secondResponse->assertSessionHasErrors('absen');

        $this->assertSame(1, AbsenHarian::where('user_id', $guru->id)->count());
    }

    public function test_endpoint_rejects_file_upload_gallery_source_and_stale_capture(): void
    {
        Storage::fake('public');
        Carbon::setTestNow(Carbon::create(2026, 10, 30, 7, 0, 0, 'Asia/Jakarta'));

        $guru = User::factory()->create(['role' => 'guru', 'jenis_pegawai' => 'guru']);

        // 1. Tolak multipart file upload (galeri)
        $fileUploadResponse = $this->actingAs($guru)->post(route('absen-harian.store'), [
            'foto' => UploadedFile::fake()->create('galeri.jpg', 50, 'image/jpeg'),
            'foto_capture' => $this->validLiveCaptureDataUri(),
            'waktu_ambil' => Carbon::now('UTC')->toIso8601String(),
            'sumber' => 'live',
            'face_descriptor' => $this->sampleFaceDescriptor(),
        ]);
        $fileUploadResponse->assertSessionHasErrors('foto_capture');

        // 2. Tolak sumber selain 'live'
        $nonLiveResponse = $this->actingAs($guru)->post(route('absen-harian.store'), [
            'foto_capture' => $this->validLiveCaptureDataUri(),
            'waktu_ambil' => Carbon::now('UTC')->toIso8601String(),
            'sumber' => 'galeri',
            'face_descriptor' => $this->sampleFaceDescriptor(),
        ]);
        $nonLiveResponse->assertSessionHasErrors('sumber');

        // 3. Tolak tangkapan kamera yang sudah kedaluwarsa (replay lama)
        $staleResponse = $this->actingAs($guru)->post(route('absen-harian.store'), [
            'foto_capture' => $this->validLiveCaptureDataUri(),
            'waktu_ambil' => Carbon::now('UTC')->subMinutes(20)->toIso8601String(),
            'sumber' => 'live',
            'face_descriptor' => $this->sampleFaceDescriptor(),
        ]);
        $staleResponse->assertSessionHasErrors('waktu_ambil');

        $this->assertSame(0, AbsenHarian::count());
    }

    public function test_absen_pulang_only_allowed_starting_1430_wib_after_absen_masuk(): void
    {
        Storage::fake('public');
        $guru = User::factory()->create(['role' => 'guru', 'jenis_pegawai' => 'guru']);

        // Absen masuk pagi pukul 06:55 WIB
        Carbon::setTestNow(Carbon::create(2026, 10, 30, 6, 55, 0, 'Asia/Jakarta'));
        $this->actingAs($guru)->post(route('absen-harian.store'), [
            'foto_capture' => $this->validLiveCaptureDataUri(),
            'waktu_ambil' => Carbon::now('UTC')->toIso8601String(),
            'sumber' => 'live',
            'face_descriptor' => $this->sampleFaceDescriptor(),
        ])->assertRedirect(route('absen-harian.index'));

        // Coba absen pulang sebelum 14:30 WIB -> ditolak
        Carbon::setTestNow(Carbon::create(2026, 10, 30, 13, 0, 0, 'Asia/Jakarta'));
        $earlyPulang = $this->actingAs($guru)->post(route('absen-harian.pulang'), [
            'foto_capture' => $this->validLiveCaptureDataUri(),
            'waktu_ambil' => Carbon::now('UTC')->toIso8601String(),
            'sumber' => 'live',
            'face_descriptor' => $this->sampleFaceDescriptor(),
        ]);
        $earlyPulang->assertSessionHasErrors('absen');

        $record = AbsenHarian::where('user_id', $guru->id)->firstOrFail();
        $this->assertNull($record->waktu_pulang);

        // Absen pulang pukul 14:35 WIB -> berhasil
        Carbon::setTestNow(Carbon::create(2026, 10, 30, 14, 35, 0, 'Asia/Jakarta'));
        $validPulang = $this->actingAs($guru)->post(route('absen-harian.pulang'), [
            'foto_capture' => $this->validLiveCaptureDataUri(),
            'waktu_ambil' => Carbon::now('UTC')->toIso8601String(),
            'sumber' => 'live',
            'face_descriptor' => $this->sampleFaceDescriptor(),
        ]);
        $validPulang->assertRedirect(route('absen-harian.index'));

        $record->refresh();
        $this->assertNotNull($record->waktu_pulang);

        $this->actingAs($guru)
            ->get(route('absen-harian.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('AbsenHarian/Index')
                ->where('absenHariIni.jam_masuk', '06:55 WIB')
                ->where('absenHariIni.jam_pulang', '14:35 WIB')
            );

        // Coba absen pulang kedua kali -> ditolak
        $duplicatePulang = $this->actingAs($guru)->post(route('absen-harian.pulang'), [
            'foto_capture' => $this->validLiveCaptureDataUri(),
            'waktu_ambil' => Carbon::now('UTC')->toIso8601String(),
            'sumber' => 'live',
            'face_descriptor' => $this->sampleFaceDescriptor(),
        ]);
        $duplicatePulang->assertSessionHasErrors('absen');
    }

    public function test_selfie_photo_preview_authorization(): void
    {
        Storage::fake('public');
        Carbon::setTestNow(Carbon::create(2026, 10, 30, 6, 45, 0, 'Asia/Jakarta'));

        $owner = User::factory()->create(['role' => 'guru', 'jenis_pegawai' => 'guru']);
        $otherGuru = User::factory()->create(['role' => 'guru', 'jenis_pegawai' => 'guru']);
        $kepsek = User::factory()->create(['role' => 'kepsek']);

        $this->actingAs($owner)->post(route('absen-harian.store'), [
            'foto_capture' => $this->validLiveCaptureDataUri(),
            'waktu_ambil' => Carbon::now('UTC')->toIso8601String(),
            'sumber' => 'live',
            'face_descriptor' => $this->sampleFaceDescriptor(),
        ]);

        $absen = AbsenHarian::where('user_id', $owner->id)->firstOrFail();

        $this->actingAs($owner)->get(route('absen-harian.foto', $absen))->assertOk();
        $this->actingAs($kepsek)->get(route('absen-harian.foto', $absen))->assertOk();
        $this->actingAs($otherGuru)->get(route('absen-harian.foto', $absen))->assertForbidden();
    }

    public function test_admin_and_kepsek_can_monitor_rekap_absen_harian_while_guru_cannot(): void
    {
        Storage::fake('public');
        Carbon::setTestNow(Carbon::create(2026, 10, 30, 6, 50, 0, 'Asia/Jakarta'));

        $admin = User::factory()->admin()->create();
        $kepsek = User::factory()->create(['role' => 'kepsek']);
        $guruHadir = User::factory()->create(['role' => 'guru', 'jenis_pegawai' => 'guru']);
        $tendikBelum = User::factory()->create(['role' => 'guru', 'jenis_pegawai' => 'tenaga_kependidikan']);
        $piket = User::factory()->create(['role' => 'guru_piket', 'no_wa' => '6281234567890']);

        $this->actingAs($guruHadir)->post(route('absen-harian.store'), [
            'foto_capture' => $this->validLiveCaptureDataUri(),
            'waktu_ambil' => Carbon::now('UTC')->toIso8601String(),
            'sumber' => 'live',
            'face_descriptor' => $this->sampleFaceDescriptor(),
            'redirect_to' => 'dashboard',
        ])->assertRedirect(route('dashboard'));

        foreach ([$admin, $kepsek] as $monitorUser) {
            $this->actingAs($monitorUser)
                ->get(route('absen-harian.rekap'))
                ->assertOk()
                ->assertInertia(fn (Assert $page) => $page
                    ->component('AbsenHarian/Rekap')
                    ->where('ringkasan.total_wajib_absen', 3)
                    ->where('ringkasan.total_hadir', 1)
                    ->where('ringkasan.tepat_waktu', 1)
                    ->where('ringkasan.belum_absen', 2)
                    ->where('ringkasan.wajah_terdaftar', 1)
                );
        }

        // Filter hanya yang belum absen
        $this->actingAs($admin)
            ->get(route('absen-harian.rekap', ['status' => 'belum_absen']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('AbsenHarian/Rekap')
                ->has('rows', 2)
            );

        // Guru & Guru Piket tidak boleh membuka halaman rekap semua pegawai
        $this->actingAs($guruHadir)->get(route('absen-harian.rekap'))->assertForbidden();
        $this->actingAs($tendikBelum)->get(route('absen-harian.rekap'))->assertForbidden();
        $this->actingAs($piket)->get(route('absen-harian.rekap'))->assertForbidden();

        // Dashboard Admin, Kepsek, Guru, dan Piket tersambung ke data AbsenHarian nyata
        $this->actingAs($admin)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Dashboard')
                ->where('stats.total_wajib_absen', 3)
                ->where('stats.hadir_hari_ini', 1)
                ->where('stats.belum_absen_hari_ini', 2)
                ->has('absenGuruTerbaru', 1)
            );

        $this->actingAs($kepsek)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Kepsek/Dashboard')
                ->where('stats.total_wajib_absen', 3)
                ->where('stats.hadir_hari_ini', 1)
                ->has('absenGuruTerbaru', 1)
            );

        $this->actingAs($guruHadir)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Guru/Dashboard')
                ->where('absenHariIni.status', 'tepat waktu')
                ->where('faceProfile.registered', true)
                ->has('logPekanIni', 3)
            );

        $this->actingAs($piket)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Piket/Dashboard')
                ->where('absenHariIni', null)
            );
    }

    public function test_face_recognition_one_to_one_verification_and_admin_only_reset(): void
    {
        Storage::fake('public');
        Carbon::setTestNow(Carbon::create(2026, 10, 30, 6, 40, 0, 'Asia/Jakarta'));

        $guru = User::factory()->create(['role' => 'guru', 'jenis_pegawai' => 'guru']);
        $admin = User::factory()->admin()->create();
        $kepsek = User::factory()->create(['role' => 'kepsek']);

        // 1. Pendaftaran wajah pertama via endpoint standalone
        $ownerDescriptor = $this->sampleFaceDescriptor(0.35);
        $this->actingAs($guru)
            ->post(route('absen-harian.enroll-face'), [
                'sumber' => 'live',
                'face_descriptor' => $ownerDescriptor,
            ])
            ->assertRedirect(route('absen-harian.index'));

        $guru->refresh();
        $this->assertNotNull($guru->face_descriptor);
        $this->assertCount(128, $guru->face_descriptor);
        $this->assertNotNull($guru->face_registered_at);

        // Raw face_descriptor wajib disembunyikan dari serialisasi User
        $this->assertArrayNotHasKey('face_descriptor', $guru->toArray());

        // 2. Pegawai tidak boleh menimpa/mendaftarkan ulang wajahnya sendiri setelah terkunci
        $this->actingAs($guru)
            ->post(route('absen-harian.enroll-face'), [
                'sumber' => 'live',
                'face_descriptor' => $this->differentFaceDescriptor(),
            ])
            ->assertSessionHasErrors('absen');

        // 3. Absen masuk dengan wajah orang lain (distance > 0.55) wajib ditolak
        $this->actingAs($guru)
            ->post(route('absen-harian.store'), [
                'foto_capture' => $this->validLiveCaptureDataUri(),
                'waktu_ambil' => Carbon::now('UTC')->toIso8601String(),
                'sumber' => 'live',
                'face_descriptor' => $this->differentFaceDescriptor(),
            ])
            ->assertSessionHasErrors('absen');

        $this->assertSame(0, AbsenHarian::where('user_id', $guru->id)->count());

        // 4. Absen masuk dengan wajah pemilik akun yang cocok (sedikit variasi <= 0.55) berhasil
        $slightlyVariedDescriptor = $this->sampleFaceDescriptor(0.37);
        $this->actingAs($guru)
            ->post(route('absen-harian.store'), [
                'foto_capture' => $this->validLiveCaptureDataUri(),
                'waktu_ambil' => Carbon::now('UTC')->toIso8601String(),
                'sumber' => 'live',
                'face_descriptor' => $slightlyVariedDescriptor,
            ])
            ->assertRedirect(route('absen-harian.index'));

        $this->assertSame(1, AbsenHarian::where('user_id', $guru->id)->count());

        // 5. Kepsek dan Guru tidak boleh mereset wajah (403 Forbidden), hanya Admin yang boleh
        $this->actingAs($kepsek)
            ->delete(route('absen-harian.reset-face', $guru))
            ->assertForbidden();

        $this->actingAs($guru)
            ->delete(route('absen-harian.reset-face', $guru))
            ->assertForbidden();

        $this->actingAs($admin)
            ->delete(route('absen-harian.reset-face', $guru))
            ->assertRedirect(route('absen-harian.rekap'));

        $guru->refresh();
        $this->assertNull($guru->face_descriptor);
        $this->assertNull($guru->face_registered_at);
    }
}
