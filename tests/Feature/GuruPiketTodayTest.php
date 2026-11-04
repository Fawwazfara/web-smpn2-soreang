<?php

namespace Tests\Feature;

use App\Models\GuruPiket;
use App\Models\TahunAjaran;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GuruPiketTodayTest extends TestCase
{
    use RefreshDatabase;

    protected User $guru;
    protected TahunAjaran $tahunAjaran;

    protected function setUp(): void
    {
        parent::setUp();

        $this->guru = User::factory()->create([
            'role' => 'guru',
            'aktif' => true,
        ]);

        $this->tahunAjaran = TahunAjaran::create([
            'nama' => '2026/2027',
            'semester' => 'Ganjil',
            'tanggal_mulai' => '2026-07-15',
            'tanggal_selesai' => '2026-12-20',
            'aktif' => true,
        ]);
    }

    public function test_only_assigned_guru_piket_for_today_and_active_year_appears_on_guru_dashboard(): void
    {
        $todayIso = Carbon::now()->dayOfWeekIso;
        $otherDayIso = $todayIso === 6 ? 1 : $todayIso + 1;

        // Guru Piket bertugas hari ini
        $piketToday = User::factory()->create([
            'nama' => 'Guru Piket Hari Ini',
            'role' => 'guru_piket',
            'aktif' => true,
            'no_wa' => '081234567890',
        ]);
        GuruPiket::create([
            'tahun_ajaran_id' => $this->tahunAjaran->id,
            'hari' => $todayIso,
            'user_id' => $piketToday->id,
        ]);

        // Guru Piket bertugas di hari lain
        $piketOtherDay = User::factory()->create([
            'nama' => 'Guru Piket Hari Lain',
            'role' => 'guru_piket',
            'aktif' => true,
            'no_wa' => '081987654321',
        ]);
        GuruPiket::create([
            'tahun_ajaran_id' => $this->tahunAjaran->id,
            'hari' => $otherDayIso,
            'user_id' => $piketOtherDay->id,
        ]);

        // Guru Piket di hari ini tapi tahun ajaran tidak aktif
        $tahunLama = TahunAjaran::create([
            'nama' => '2025/2026',
            'semester' => 'Genap',
            'tanggal_mulai' => '2026-01-05',
            'tanggal_selesai' => '2026-06-20',
            'aktif' => false,
        ]);
        $piketOldTa = User::factory()->create([
            'nama' => 'Guru Piket TA Lama',
            'role' => 'guru_piket',
            'aktif' => true,
            'no_wa' => '081222333444',
        ]);
        GuruPiket::create([
            'tahun_ajaran_id' => $tahunLama->id,
            'hari' => $todayIso,
            'user_id' => $piketOldTa->id,
        ]);

        $response = $this->actingAs($this->guru)->get(route('dashboard'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Guru/Dashboard')
            ->has('piketHariIni', 1)
            ->where('piketHariIni.0.id', $piketToday->id)
            ->where('piketHariIni.0.nama', 'Guru Piket Hari Ini')
            ->where('piketHariIni.0.wa_phone', '6281234567890')
        );
    }

    public function test_inactive_guru_piket_or_missing_wa_does_not_appear(): void
    {
        $todayIso = Carbon::now()->dayOfWeekIso;

        // Inactive piket
        $inactivePiket = User::factory()->create([
            'role' => 'guru_piket',
            'aktif' => false,
            'no_wa' => '081234567891',
        ]);
        GuruPiket::create([
            'tahun_ajaran_id' => $this->tahunAjaran->id,
            'hari' => $todayIso,
            'user_id' => $inactivePiket->id,
        ]);

        // Missing no_wa
        $noWaPiket = User::factory()->create([
            'role' => 'guru_piket',
            'aktif' => true,
            'no_wa' => null,
        ]);
        GuruPiket::create([
            'tahun_ajaran_id' => $this->tahunAjaran->id,
            'hari' => $todayIso,
            'user_id' => $noWaPiket->id,
        ]);

        $response = $this->actingAs($this->guru)->get(route('dashboard'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Guru/Dashboard')
            ->has('piketHariIni', 0)
        );
    }
}

