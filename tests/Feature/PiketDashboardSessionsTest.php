<?php

namespace Tests\Feature;

use App\Models\JamPelajaran;
use App\Models\Kelas;
use App\Models\Mapel;
use App\Models\Sesi;
use App\Models\TahunAjaran;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PiketDashboardSessionsTest extends TestCase
{
    use RefreshDatabase;

    protected User $guruPiket;
    protected User $guruPengampu;
    protected TahunAjaran $tahunAjaran;
    protected Kelas $kelas;
    protected JamPelajaran $jamPelajaran;
    protected Mapel $mapel;

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

        // 2. User Guru Piket & Guru Pengampu
        $this->guruPiket = User::factory()->create([
            'role' => 'guru_piket',
            'aktif' => true,
            'no_wa' => '081234567890',
        ]);

        $this->guruPengampu = User::factory()->create([
            'role' => 'guru',
            'aktif' => true,
        ]);

        // 3. Kelas, Jam, Mapel
        $this->kelas = Kelas::create([
            'nama' => 'VII-A',
            'tingkat' => 7,
            'tahun_ajaran_id' => $this->tahunAjaran->id,
            'wali_kelas_id' => $this->guruPengampu->id,
        ]);

        $this->jamPelajaran = JamPelajaran::create([
            'jam_ke' => 1,
            'mulai' => '07:00:00',
            'selesai' => '08:30:00',
            'kelompok_hari' => 'senin-kamis',
        ]);

        $this->mapel = Mapel::create([
            'kode' => 'MAT-7',
            'nama' => 'Matematika',
            'kelompok_kurikulum' => 'Umum',
        ]);
    }

    public function test_piket_dashboard_displays_today_sessions_with_locked_status_by_default(): void
    {
        $today = Carbon::today()->toDateString();

        // Buat sesi pembelajaran untuk hari ini
        $sesi = Sesi::create([
            'tanggal' => $today,
            'kelas_id' => $this->kelas->id,
            'jam_pelajaran_id' => $this->jamPelajaran->id,
            'mapel_id' => $this->mapel->id,
            'guru_id' => $this->guruPengampu->id,
            'status' => 'terjadwal',
        ]);

        $response = $this->actingAs($this->guruPiket)->get(route('dashboard'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Piket/Dashboard')
            ->has('sesiHariIni', 1)
            ->where('sesiHariIni.0.id', $sesi->id)
            ->where('sesiHariIni.0.status_kunci', 'terkunci')
            ->where('sesiHariIni.0.kelas.nama', 'VII-A')
            ->where('sesiHariIni.0.mapel.nama', 'Matematika')
            ->where('sesiHariIni.0.guru.id', $this->guruPengampu->id)
            ->where('stats.total_terkunci', 1)
            ->where('stats.total_terbuka', 0)
        );
    }

    public function test_session_becomes_unlocked_when_claimed_by_current_guru_piket(): void
    {
        $today = Carbon::today()->toDateString();

        // Sesi yang sudah diklaim oleh guru piket yang sedang login
        $sesiClaimed = Sesi::create([
            'tanggal' => $today,
            'kelas_id' => $this->kelas->id,
            'jam_pelajaran_id' => $this->jamPelajaran->id,
            'mapel_id' => $this->mapel->id,
            'guru_id' => $this->guruPengampu->id,
            'guru_pengganti_id' => $this->guruPiket->id,
            'status' => 'digantikan',
        ]);

        $response = $this->actingAs($this->guruPiket)->get(route('dashboard'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Piket/Dashboard')
            ->has('sesiHariIni', 1)
            ->where('sesiHariIni.0.id', $sesiClaimed->id)
            ->where('sesiHariIni.0.status_kunci', 'terbuka')
            ->where('stats.total_terbuka', 1)
            ->where('stats.total_terkunci', 0)
        );
    }

    public function test_sessions_from_other_dates_do_not_appear_on_piket_dashboard(): void
    {
        $yesterday = Carbon::yesterday()->toDateString();

        Sesi::create([
            'tanggal' => $yesterday,
            'kelas_id' => $this->kelas->id,
            'jam_pelajaran_id' => $this->jamPelajaran->id,
            'mapel_id' => $this->mapel->id,
            'guru_id' => $this->guruPengampu->id,
            'status' => 'selesai',
        ]);

        $response = $this->actingAs($this->guruPiket)->get(route('dashboard'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Piket/Dashboard')
            ->has('sesiHariIni', 0)
        );
    }
}

