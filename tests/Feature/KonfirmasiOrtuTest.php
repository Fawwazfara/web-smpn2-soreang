<?php

namespace Tests\Feature;

use App\Models\AbsenSiswa;
use App\Models\JamPelajaran;
use App\Models\Kelas;
use App\Models\Mapel;
use App\Models\Sesi;
use App\Models\Siswa;
use App\Models\TahunAjaran;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class KonfirmasiOrtuTest extends TestCase
{
    use RefreshDatabase;

    protected TahunAjaran $tahunAjaran;
    protected Kelas $kelas;
    protected Siswa $siswa;
    protected User $guru;
    protected JamPelajaran $jamPelajaran;
    protected Mapel $mapel;
    protected Sesi $sesi;

    protected function setUp(): void
    {
        parent::setUp();

        // 1. Setup Master Data
        $this->tahunAjaran = TahunAjaran::create([
            'nama' => '2026/2027',
            'semester' => 'Ganjil',
            'tanggal_mulai' => '2026-07-15',
            'tanggal_selesai' => '2026-12-20',
            'aktif' => true,
        ]);

        $this->guru = User::factory()->create([
            'nama' => 'Ibu Guru Ani, S.Pd.',
            'role' => 'guru',
            'aktif' => true,
        ]);

        $this->kelas = Kelas::create([
            'nama' => 'VIII-B',
            'tingkat' => 8,
            'tahun_ajaran_id' => $this->tahunAjaran->id,
            'wali_kelas_id' => $this->guru->id,
        ]);

        $this->siswa = Siswa::create([
            'nis' => '12345678',
            'nama' => 'Ahmad Fauzi',
            'kelas_id' => $this->kelas->id,
            'no_hp_ortu' => '081234567890',
            'aktif' => true,
        ]);

        $this->jamPelajaran = JamPelajaran::create([
            'jam_ke' => 1,
            'mulai' => '07:15:00',
            'selesai' => '08:35:00',
            'kelompok_hari' => 'senin-kamis',
        ]);

        $this->mapel = Mapel::create([
            'kode' => 'IPA-8',
            'nama' => 'Ilmu Pengetahuan Alam',
            'kelompok_kurikulum' => 'Umum',
        ]);

        $this->sesi = Sesi::create([
            'tanggal' => Carbon::today()->toDateString(),
            'kelas_id' => $this->kelas->id,
            'jam_pelajaran_id' => $this->jamPelajaran->id,
            'mapel_id' => $this->mapel->id,
            'guru_id' => $this->guru->id,
            'status' => 'berlangsung',
        ]);
    }

    public function test_public_user_can_view_active_confirmation_page_with_valid_token(): void
    {
        $token = 'valid_token_test_1234567890abcdef';
        $absen = AbsenSiswa::create([
            'sesi_id' => $this->sesi->id,
            'siswa_id' => $this->siswa->id,
            'status' => 'S',
            'catatan' => 'Sakit demam',
            'dicatat_oleh' => $this->guru->id,
            'waktu' => now(),
            'konfirmasi_token' => $token,
            'token_berlaku_sampai' => now()->addDays(7),
            'status_konfirmasi' => 'menunggu',
        ]);

        $response = $this->get(route('konfirmasi.show', $token));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Konfirmasi/Index')
            ->where('state', 'active')
            ->where('token', $token)
            ->where('dataSiswa.nama', 'Ahmad Fauzi')
            ->where('dataSiswa.nis', '12345678')
            ->where('dataSiswa.status', 'S')
            ->where('dataSiswa.status_label', 'Sakit')
            ->where('dataSiswa.catatan_guru', 'Sakit demam')
        );
    }

    public function test_public_user_sees_not_found_state_with_invalid_token(): void
    {
        $response = $this->get(route('konfirmasi.show', 'token_ngawur_pasti_tidak_ada'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Konfirmasi/Index')
            ->where('state', 'not_found')
        );
    }

    public function test_public_user_sees_expired_state_when_token_is_older_than_1_week(): void
    {
        $token = 'expired_token_1234567890abcdef';
        $absen = AbsenSiswa::create([
            'sesi_id' => $this->sesi->id,
            'siswa_id' => $this->siswa->id,
            'status' => 'I',
            'catatan' => 'Izin keperluan keluarga',
            'dicatat_oleh' => $this->guru->id,
            'waktu' => now()->subDays(8),
            'konfirmasi_token' => $token,
            'token_berlaku_sampai' => now()->subDay(), // Expired
            'status_konfirmasi' => 'menunggu',
        ]);

        $response = $this->get(route('konfirmasi.show', $token));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Konfirmasi/Index')
            ->where('state', 'expired')
            ->where('dataSiswa.status', 'I')
            ->where('dataSiswa.status_label', 'Izin')
        );

        // Database status should be updated to kadaluarsa, but attendance status remains 'I'
        $absen->refresh();
        $this->assertEquals('kadaluarsa', $absen->status_konfirmasi);
        $this->assertEquals('I', $absen->status);
    }

    public function test_parent_can_upload_valid_evidence_image_and_token_becomes_confirmed(): void
    {
        Storage::fake('public');

        $token = 'upload_token_test_1234567890abcd';
        $absen = AbsenSiswa::create([
            'sesi_id' => $this->sesi->id,
            'siswa_id' => $this->siswa->id,
            'status' => 'S',
            'catatan' => 'Sakit',
            'dicatat_oleh' => $this->guru->id,
            'waktu' => now(),
            'konfirmasi_token' => $token,
            'token_berlaku_sampai' => now()->addDays(7),
            'status_konfirmasi' => 'menunggu',
        ]);

        $file = UploadedFile::fake()->create('surat_dokter.jpg', 150, 'image/jpeg');

        $response = $this->post(route('konfirmasi.store', $token), [
            'bukti' => $file,
            'keterangan' => 'Surat keterangan dokter terlampir.',
        ]);

        $response->assertRedirect(route('konfirmasi.show', $token));

        $absen->refresh();
        $this->assertEquals('terkonfirmasi', $absen->status_konfirmasi);
        $this->assertNotNull($absen->bukti_path);
        $this->assertEquals('Surat keterangan dokter terlampir.', $absen->keterangan_konfirmasi);
        $this->assertNotNull($absen->bukti_diunggah_pada);

        Storage::disk('public')->assertExists($absen->bukti_path);

        // Accessing the page now displays already_used state
        $pageResponse = $this->get(route('konfirmasi.show', $token));
        $pageResponse->assertInertia(fn (Assert $page) => $page
            ->component('Konfirmasi/Index')
            ->where('state', 'already_used')
            ->where('dataSiswa.status_konfirmasi', 'terkonfirmasi')
        );
    }

    public function test_parent_can_upload_pdf_document(): void
    {
        Storage::fake('public');

        $token = 'pdf_token_test_1234567890abcdef';
        $absen = AbsenSiswa::create([
            'sesi_id' => $this->sesi->id,
            'siswa_id' => $this->siswa->id,
            'status' => 'I',
            'dicatat_oleh' => $this->guru->id,
            'waktu' => now(),
            'konfirmasi_token' => $token,
            'token_berlaku_sampai' => now()->addDays(7),
            'status_konfirmasi' => 'menunggu',
        ]);

        $file = UploadedFile::fake()->create('surat_izin.pdf', 1024, 'application/pdf');

        $response = $this->post(route('konfirmasi.store', $token), [
            'bukti' => $file,
            'keterangan' => 'Surat permohonan izin dari orang tua.',
        ]);

        $response->assertRedirect(route('konfirmasi.show', $token));

        $absen->refresh();
        $this->assertEquals('terkonfirmasi', $absen->status_konfirmasi);
        $this->assertNotNull($absen->bukti_path);
        Storage::disk('public')->assertExists($absen->bukti_path);
    }

    public function test_upload_syncs_to_other_waiting_sessions_of_same_student_on_same_date(): void
    {
        Storage::fake('public');

        // Sesi kedua pada hari yang sama
        $jam2 = JamPelajaran::create([
            'jam_ke' => 2,
            'mulai' => '08:40:00',
            'selesai' => '10:00:00',
            'kelompok_hari' => 'senin-kamis',
        ]);

        $sesi2 = Sesi::create([
            'tanggal' => $this->sesi->tanggal,
            'kelas_id' => $this->kelas->id,
            'jam_pelajaran_id' => $jam2->id,
            'mapel_id' => $this->mapel->id,
            'guru_id' => $this->guru->id,
            'status' => 'berlangsung',
        ]);

        $token1 = 'token_sesi_1_sync_test';
        $token2 = 'token_sesi_2_sync_test';

        $absen1 = AbsenSiswa::create([
            'sesi_id' => $this->sesi->id,
            'siswa_id' => $this->siswa->id,
            'status' => 'S',
            'dicatat_oleh' => $this->guru->id,
            'waktu' => now(),
            'konfirmasi_token' => $token1,
            'token_berlaku_sampai' => now()->addDays(7),
            'status_konfirmasi' => 'menunggu',
        ]);

        $absen2 = AbsenSiswa::create([
            'sesi_id' => $sesi2->id,
            'siswa_id' => $this->siswa->id,
            'status' => 'S',
            'dicatat_oleh' => $this->guru->id,
            'waktu' => now(),
            'konfirmasi_token' => $token2,
            'token_berlaku_sampai' => now()->addDays(7),
            'status_konfirmasi' => 'menunggu',
        ]);

        $file = UploadedFile::fake()->create('surat_dokter_all_day.jpg', 150, 'image/jpeg');

        $this->post(route('konfirmasi.store', $token1), [
            'bukti' => $file,
            'keterangan' => 'Sakit panas seharian',
        ]);

        $absen1->refresh();
        $absen2->refresh();

        $this->assertEquals('terkonfirmasi', $absen1->status_konfirmasi);
        $this->assertEquals('terkonfirmasi', $absen2->status_konfirmasi);
        $this->assertEquals($absen1->bukti_path, $absen2->bukti_path);
        $this->assertEquals('Sakit panas seharian', $absen2->keterangan_konfirmasi);
    }

    public function test_token_is_single_use_and_rejects_subsequent_uploads(): void
    {
        Storage::fake('public');

        $token = 'single_use_token_1234567890';
        $absen = AbsenSiswa::create([
            'sesi_id' => $this->sesi->id,
            'siswa_id' => $this->siswa->id,
            'status' => 'S',
            'dicatat_oleh' => $this->guru->id,
            'waktu' => now(),
            'konfirmasi_token' => $token,
            'token_berlaku_sampai' => now()->addDays(7),
            'status_konfirmasi' => 'terkonfirmasi',
            'bukti_path' => 'bukti_absen/dummy.jpg',
        ]);

        $file = UploadedFile::fake()->create('second_upload.jpg', 150, 'image/jpeg');

        $response = $this->from(route('konfirmasi.show', $token))->post(route('konfirmasi.store', $token), [
            'bukti' => $file,
        ]);

        $response->assertRedirect(route('konfirmasi.show', $token));
        $response->assertSessionHas('error');
    }

    public function test_upload_rejects_invalid_file_format_and_oversized_file(): void
    {
        Storage::fake('public');

        $token = 'validation_fail_token_123';
        AbsenSiswa::create([
            'sesi_id' => $this->sesi->id,
            'siswa_id' => $this->siswa->id,
            'status' => 'S',
            'dicatat_oleh' => $this->guru->id,
            'waktu' => now(),
            'konfirmasi_token' => $token,
            'token_berlaku_sampai' => now()->addDays(7),
            'status_konfirmasi' => 'menunggu',
        ]);

        // File format .txt tidak diperbolehkan
        $invalidFile = UploadedFile::fake()->create('dokumen.txt', 100, 'text/plain');

        $response = $this->post(route('konfirmasi.store', $token), [
            'bukti' => $invalidFile,
        ]);

        $response->assertSessionHasErrors('bukti');

        // File lebih dari 5MB tidak diperbolehkan
        $oversizedFile = UploadedFile::fake()->create('big_file.jpg', 6000, 'image/jpeg');

        $response2 = $this->post(route('konfirmasi.store', $token), [
            'bukti' => $oversizedFile,
        ]);

        $response2->assertSessionHasErrors('bukti');
    }

    public function test_upload_attempt_on_expired_token_is_rejected(): void
    {
        Storage::fake('public');

        $token = 'expired_upload_attempt_token';
        AbsenSiswa::create([
            'sesi_id' => $this->sesi->id,
            'siswa_id' => $this->siswa->id,
            'status' => 'S',
            'dicatat_oleh' => $this->guru->id,
            'waktu' => now()->subDays(8),
            'konfirmasi_token' => $token,
            'token_berlaku_sampai' => now()->subHour(),
            'status_konfirmasi' => 'menunggu',
        ]);

        $file = UploadedFile::fake()->create('surat_telat.jpg', 150, 'image/jpeg');

        $response = $this->from(route('konfirmasi.show', $token))->post(route('konfirmasi.store', $token), [
            'bukti' => $file,
        ]);

        $response->assertRedirect(route('konfirmasi.show', $token));
        $response->assertSessionHas('error');
    }
}
