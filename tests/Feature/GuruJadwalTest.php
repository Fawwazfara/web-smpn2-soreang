<?php

namespace Tests\Feature;

use App\Models\GuruPiket;
use App\Models\JadwalSlot;
use App\Models\JadwalVersi;
use App\Models\JamPelajaran;
use App\Models\Kelas;
use App\Models\Mapel;
use App\Models\TahunAjaran;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class GuruJadwalTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_to_login(): void
    {
        $response = $this->get(route('guru.jadwal.index'));

        $response->assertRedirect(route('login'));
    }

    public function test_non_guru_role_cannot_access_guru_jadwal(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'aktif' => true,
        ]);

        $response = $this->actingAs($admin)->get(route('guru.jadwal.index'));

        // Middleware role:guru,guru_piket redirects or throws 403
        $this->assertTrue(in_array($response->status(), [302, 403]));
    }

    public function test_guru_can_access_jadwal_page_with_valid_props(): void
    {
        $guru = User::factory()->create([
            'role' => 'guru',
            'aktif' => true,
        ]);

        $tahunAjaran = TahunAjaran::create([
            'nama' => '2026/2027',
            'semester' => 'Ganjil',
            'tanggal_mulai' => '2026-07-01',
            'tanggal_selesai' => '2026-12-31',
            'aktif' => true,
        ]);

        $response = $this->actingAs($guru)->get(route('guru.jadwal.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Guru/Jadwal/Index')
            ->has('jadwalMingguan')
            ->has('jadwalHariIni')
            ->has('piketHariIni')
            ->has('tahunAjaranAktif')
            ->has('hariIniIso')
        );
    }

    public function test_only_slots_belonging_to_logged_in_guru_and_active_version_are_loaded(): void
    {
        $guruA = User::factory()->create(['role' => 'guru', 'aktif' => true]);
        $guruB = User::factory()->create(['role' => 'guru', 'aktif' => true]);

        $tahunAjaran = TahunAjaran::create([
            'nama' => '2026/2027',
            'semester' => 'Ganjil',
            'tanggal_mulai' => '2026-07-01',
            'tanggal_selesai' => '2026-12-31',
            'aktif' => true,
        ]);

        $versiAktif = JadwalVersi::create([
            'nama' => 'Jadwal Reguler V1',
            'berlaku_mulai' => '2026-07-01',
            'berlaku_sampai' => '2026-12-31',
            'status' => 'aktif',
        ]);

        $versiDraf = JadwalVersi::create([
            'nama' => 'Jadwal Uji Coba',
            'berlaku_mulai' => '2026-07-01',
            'berlaku_sampai' => '2026-12-31',
            'status' => 'draf',
        ]);

        $kelas = Kelas::create([
            'nama' => 'VII-A',
            'tingkat' => 7,
            'tahun_ajaran_id' => $tahunAjaran->id,
        ]);

        $mapelA = Mapel::create([
            'kode' => 'MAT01',
            'nama' => 'Matematika',
            'kelompok_kurikulum' => 'A',
        ]);

        $mapelB = Mapel::create([
            'kode' => 'IPA01',
            'nama' => 'Ilmu Pengetahuan Alam',
            'kelompok_kurikulum' => 'A',
        ]);

        $jam1 = JamPelajaran::create([
            'jam_ke' => 1,
            'mulai' => '07:00:00',
            'selesai' => '07:40:00',
            'kelompok_hari' => 'senin-kamis',
        ]);

        $jam2 = JamPelajaran::create([
            'jam_ke' => 2,
            'mulai' => '07:40:00',
            'selesai' => '08:20:00',
            'kelompok_hari' => 'senin-kamis',
        ]);

        // Slot 1: Guru A, versi aktif (Harus muncul)
        JadwalSlot::create([
            'versi_id' => $versiAktif->id,
            'hari' => 1,
            'jam_pelajaran_id' => $jam1->id,
            'kelas_id' => $kelas->id,
            'mapel_id' => $mapelA->id,
            'guru_id' => $guruA->id,
            'durasi' => 1,
        ]);

        // Slot 2: Guru B, versi aktif (Tidak boleh muncul untuk Guru A)
        JadwalSlot::create([
            'versi_id' => $versiAktif->id,
            'hari' => 1,
            'jam_pelajaran_id' => $jam2->id,
            'kelas_id' => $kelas->id,
            'mapel_id' => $mapelB->id,
            'guru_id' => $guruB->id,
            'durasi' => 1,
        ]);

        // Slot 3: Guru A, versi draf (Tidak boleh muncul karena status bukan aktif)
        JadwalSlot::create([
            'versi_id' => $versiDraf->id,
            'hari' => 2,
            'jam_pelajaran_id' => $jam1->id,
            'kelas_id' => $kelas->id,
            'mapel_id' => $mapelA->id,
            'guru_id' => $guruA->id,
            'durasi' => 1,
        ]);

        $response = $this->actingAs($guruA)->get(route('guru.jadwal.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Guru/Jadwal/Index')
            ->has('jadwalMingguan.1', 1) // Hari 1 hanya ada 1 slot milik Guru A
            ->where('jadwalMingguan.1.0.mapel.kode', 'MAT01')
            ->has('jadwalMingguan.2', 0) // Hari 2 versi draf tidak masuk
        );
    }

    public function test_piket_hari_ini_is_loaded_with_clean_wa_and_link(): void
    {
        $guru = User::factory()->create(['role' => 'guru', 'aktif' => true]);
        $hariIniIso = Carbon::now()->dayOfWeekIso;

        $tahunAjaran = TahunAjaran::create([
            'nama' => '2026/2027',
            'semester' => 'Ganjil',
            'tanggal_mulai' => '2026-07-01',
            'tanggal_selesai' => '2026-12-31',
            'aktif' => true,
        ]);

        $guruPiket = User::factory()->create([
            'nama' => 'Pak Ahmad Piket',
            'role' => 'guru_piket',
            'no_wa' => '0812-3456-7890',
            'aktif' => true,
        ]);

        GuruPiket::create([
            'user_id' => $guruPiket->id,
            'hari' => $hariIniIso,
            'tahun_ajaran_id' => $tahunAjaran->id,
        ]);

        $response = $this->actingAs($guru)->get(route('guru.jadwal.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Guru/Jadwal/Index')
            ->has('piketHariIni', 1)
            ->where('piketHariIni.0.user.clean_wa', '6281234567890')
            ->where('piketHariIni.0.user.wa_link', 'https://wa.me/6281234567890')
        );
    }
}

