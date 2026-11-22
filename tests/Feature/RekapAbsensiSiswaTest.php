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
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class RekapAbsensiSiswaTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $kepsek;
    protected User $guru;
    protected TahunAjaran $tahunAjaran;
    protected Kelas $kelas;
    protected Siswa $siswa1;
    protected Siswa $siswa2;
    protected Sesi $sesi;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'role' => 'admin',
            'aktif' => true,
        ]);

        $this->kepsek = User::factory()->create([
            'role' => 'kepsek',
            'aktif' => true,
        ]);

        $this->guru = User::factory()->create([
            'role' => 'guru',
            'aktif' => true,
        ]);

        $this->tahunAjaran = TahunAjaran::create([
            'nama' => '2026/2027',
            'semester' => 'Ganjil',
            'tanggal_mulai' => '2026-07-01',
            'tanggal_selesai' => '2026-12-31',
            'aktif' => true,
        ]);

        $this->kelas = Kelas::create([
            'nama' => '7-A',
            'tingkat' => 7,
            'tahun_ajaran_id' => $this->tahunAjaran->id,
            'wali_kelas_id' => $this->guru->id,
        ]);

        $this->siswa1 = Siswa::create([
            'nis' => '1001',
            'nama' => 'Ahmad Siswa',
            'kelas_id' => $this->kelas->id,
            'no_hp_ortu' => '081234567890',
            'aktif' => true,
        ]);

        $this->siswa2 = Siswa::create([
            'nis' => '1002',
            'nama' => 'Budi Siswa',
            'kelas_id' => $this->kelas->id,
            'no_hp_ortu' => '081234567891',
            'aktif' => true,
        ]);

        $jamPelajaran = JamPelajaran::create([
            'jam_ke' => 1,
            'mulai' => '07:00:00',
            'selesai' => '07:40:00',
            'kelompok_hari' => 'senin-kamis',
        ]);

        $mapel = Mapel::create([
            'kode' => 'MAT-7',
            'nama' => 'Matematika',
            'kelompok_kurikulum' => 'Umum',
        ]);

        $this->sesi = Sesi::create([
            'tanggal' => Carbon::today()->toDateString(),
            'kelas_id' => $this->kelas->id,
            'jam_pelajaran_id' => $jamPelajaran->id,
            'mapel_id' => $mapel->id,
            'guru_id' => $this->guru->id,
            'status' => 'selesai',
        ]);

        AbsenSiswa::create([
            'sesi_id' => $this->sesi->id,
            'siswa_id' => $this->siswa1->id,
            'status' => 'H',
            'waktu' => Carbon::now(),
            'status_konfirmasi' => 'tidak perlu',
        ]);

        AbsenSiswa::create([
            'sesi_id' => $this->sesi->id,
            'siswa_id' => $this->siswa2->id,
            'status' => 'S',
            'waktu' => Carbon::now(),
            'status_konfirmasi' => 'menunggu',
        ]);
    }

    public function test_admin_can_access_rekap_absensi_siswa(): void
    {
        $response = $this->actingAs($this->admin)
            ->get('/admin/rekap-absensi/siswa');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/RekapAbsensi/Siswa')
            ->has('kelasList')
            ->has('selectedKelas')
            ->has('filters')
            ->has('siswaRekap', 2)
            ->has('ringkasanKelas')
            ->where('ringkasanKelas.total_hadir', 1)
            ->where('ringkasanKelas.total_sakit', 1)
            ->where('ringkasanKelas.total_izin', 0)
            ->where('ringkasanKelas.total_alfa', 0)
        );
    }

    public function test_kepsek_can_access_rekap_absensi_siswa(): void
    {
        $response = $this->actingAs($this->kepsek)
            ->get('/kepsek/rekap-absensi/siswa');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Kepsek/RekapAbsensi/Siswa')
            ->has('kelasList')
            ->has('selectedKelas')
            ->has('filters')
            ->has('siswaRekap', 2)
            ->has('ringkasanKelas')
        );
    }

    public function test_other_roles_cannot_access_rekap_absensi_siswa(): void
    {
        $responseAdminRoute = $this->actingAs($this->guru)
            ->get('/admin/rekap-absensi/siswa');
        $responseAdminRoute->assertStatus(403);

        $responseKepsekRoute = $this->actingAs($this->guru)
            ->get('/kepsek/rekap-absensi/siswa');
        $responseKepsekRoute->assertStatus(403);
    }

    public function test_filter_by_kelas_and_tanggal(): void
    {
        $response = $this->actingAs($this->admin)
            ->get('/admin/rekap-absensi/siswa?kelas_id=' . $this->kelas->id . '&tanggal_mulai=' . Carbon::today()->toDateString() . '&tanggal_selesai=' . Carbon::today()->toDateString());

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->where('filters.kelas_id', $this->kelas->id)
            ->where('ringkasanKelas.total_hadir', 1)
            ->where('ringkasanKelas.total_sakit', 1)
        );
    }
}
