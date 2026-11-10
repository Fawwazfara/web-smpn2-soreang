<?php

namespace Tests\Feature;

use App\Models\AbsenHarian;
use App\Models\GuruPiket;
use App\Models\JamPelajaran;
use App\Models\Kelas;
use App\Models\Mapel;
use App\Models\Sesi;
use App\Models\TahunAjaran;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class KepsekMonitoringTest extends TestCase
{
    use RefreshDatabase;

    protected User $kepsek;
    protected TahunAjaran $tahunAjaran;
    protected Kelas $kelas;
    protected JamPelajaran $jamPelajaran;
    protected Mapel $mapel;
    protected User $guruTerjadwal;
    protected User $guruPiket;

    protected function setUp(): void
    {
        parent::setUp();

        // 1. Tahun Ajaran Aktif
        $this->tahunAjaran = TahunAjaran::create([
            'nama' => '2026/2027',
            'semester' => 'Ganjil',
            'tanggal_mulai' => '2026-07-15',
            'tanggal_selesai' => '2026-12-20',
            'aktif' => true,
        ]);

        // 2. Akun Kepsek
        $this->kepsek = User::factory()->create([
            'nama' => 'Drs. H. Kepala Sekolah, M.Pd.',
            'username' => '197001011995011001',
            'role' => 'kepsek',
            'aktif' => true,
        ]);

        // 3. Guru Pengampu & Guru Piket
        $this->guruTerjadwal = User::factory()->create([
            'nama' => 'Guru Matematika, S.Pd.',
            'username' => '198501012010011002',
            'role' => 'guru',
            'jenis_pegawai' => 'guru',
            'aktif' => true,
        ]);

        $this->guruPiket = User::factory()->create([
            'nama' => 'Guru Piket Hari Ini, S.Pd.',
            'username' => '198801012012012003',
            'role' => 'guru_piket',
            'no_wa' => '081298765432',
            'aktif' => true,
        ]);

        // 4. Data Master: Kelas, Jam, Mapel
        $this->kelas = Kelas::create([
            'nama' => 'VII-A',
            'tingkat' => 7,
            'tahun_ajaran_id' => $this->tahunAjaran->id,
            'wali_kelas_id' => $this->guruTerjadwal->id,
        ]);

        $this->jamPelajaran = JamPelajaran::create([
            'jam_ke' => 1,
            'mulai' => '07:15:00',
            'selesai' => '08:35:00',
            'kelompok_hari' => 'senin-kamis',
        ]);

        $this->mapel = Mapel::create([
            'kode' => 'MAT-7',
            'nama' => 'Matematika Wajib',
            'kelompok_kurikulum' => 'Umum',
        ]);
    }

    public function test_kepsek_can_view_monitoring_dashboard_with_all_props(): void
    {
        $response = $this->actingAs($this->kepsek)->get(route('dashboard'));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Kepsek/Dashboard')
            ->has('stats')
            ->has('kelasList')
            ->has('daftarAbsenHariIni')
            ->has('sesiHariIni')
            ->has('sesiStats')
            ->has('piketHariIni')
            ->has('aturanJam')
        );
    }

    public function test_kepsek_dashboard_displays_real_time_session_status_and_substitutions(): void
    {
        $today = Carbon::today()->toDateString();

        // Buat sesi pembelajaran hari ini yang digantikan oleh guru piket
        $sesi = Sesi::create([
            'tanggal' => $today,
            'kelas_id' => $this->kelas->id,
            'jam_pelajaran_id' => $this->jamPelajaran->id,
            'mapel_id' => $this->mapel->id,
            'guru_id' => $this->guruTerjadwal->id,
            'guru_pengganti_id' => $this->guruPiket->id,
            'status' => 'digantikan',
            'alasan' => 'Izin rapat dinas luar',
        ]);

        $response = $this->actingAs($this->kepsek)->get(route('dashboard'));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Kepsek/Dashboard')
            ->has('sesiHariIni', 1)
            ->where('sesiHariIni.0.id', $sesi->id)
            ->where('sesiHariIni.0.kelas.nama', 'VII-A')
            ->where('sesiHariIni.0.mapel.nama', 'Matematika Wajib')
            ->where('sesiHariIni.0.guru.id', $this->guruTerjadwal->id)
            ->where('sesiHariIni.0.guru_pengganti.id', $this->guruPiket->id)
            ->where('sesiHariIni.0.is_digantikan', true)
            ->where('stats.sesi_digantikan', 1)
            ->where('stats.total_sesi', 1)
        );
    }

    public function test_kepsek_dashboard_displays_all_employee_attendance_statuses(): void
    {
        $today = Carbon::today()->toDateString();
        $tz = config('absensi.timezone', 'Asia/Jakarta');

        // 1. Tendik yang juga wajib absen
        $tendik = User::factory()->create([
            'nama' => 'Staff TU Perpustakaan',
            'username' => '199001012015011004',
            'role' => 'guru',
            'jenis_pegawai' => 'tenaga_kependidikan',
            'aktif' => true,
        ]);

        // 2. Guru terjadwal absen tepat waktu
        AbsenHarian::create([
            'user_id' => $this->guruTerjadwal->id,
            'tanggal' => $today,
            'waktu_masuk' => Carbon::parse($today.' 06:55:00', $tz),
            'waktu_ambil' => Carbon::parse($today.' 06:54:55', $tz),
            'foto_path' => 'absen_harian/guru1.jpg',
            'sumber' => 'live',
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Mozilla/5.0 Chrome',
            'status' => 'tepat waktu',
        ]);

        // 3. Tendik absen terlambat
        AbsenHarian::create([
            'user_id' => $tendik->id,
            'tanggal' => $today,
            'waktu_masuk' => Carbon::parse($today.' 07:35:00', $tz),
            'waktu_ambil' => Carbon::parse($today.' 07:34:50', $tz),
            'foto_path' => 'absen_harian/tendik1.jpg',
            'sumber' => 'live',
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Mozilla/5.0 Chrome',
            'status' => 'terlambat',
        ]);

        // 4. Guru piket belum absen

        $response = $this->actingAs($this->kepsek)->get(route('dashboard'));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Kepsek/Dashboard')
            ->where('stats.total_wajib_absen', 3) // guruTerjadwal + guruPiket + tendik
            ->where('stats.hadir_hari_ini', 2)
            ->where('stats.tepat_waktu_hari_ini', 1)
            ->where('stats.terlambat_hari_ini', 1)
            ->where('stats.belum_absen_hari_ini', 1)
            ->has('daftarAbsenHariIni', 3)
        );
    }

    public function test_kepsek_has_strict_read_only_access_and_cannot_mutate_data(): void
    {
        // 1. Kepsek tidak boleh melakukan absen harian (dikecualikan di PRD)
        $responseAbsen = $this->actingAs($this->kepsek)->get(route('absen-harian.index'));
        $this->assertTrue(in_array($responseAbsen->status(), [403, 302], true));

        // 2. Kepsek tidak boleh membuat akun pengguna
        $responseUser = $this->actingAs($this->kepsek)->post(route('users.store'), [
            'nama' => 'Guru Baru',
            'username' => '199901012024011099',
            'role' => 'guru',
            'jenis_pegawai' => 'guru',
            'password' => 'password123',
        ]);
        $this->assertTrue(in_array($responseUser->status(), [403, 302], true));

        // 3. Kepsek tidak boleh mengklaim kode piket
        $responseKlaim = $this->actingAs($this->kepsek)->post(route('piket.klaim-kode'), [
            'kode' => '123456',
        ]);
        $responseKlaim->assertForbidden();
    }
}

