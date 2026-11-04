<?php

namespace Tests\Feature;

use App\Models\GuruPiket;
use App\Models\JamPelajaran;
use App\Models\Kelas;
use App\Models\KodePengganti;
use App\Models\Mapel;
use App\Models\Sesi;
use App\Models\TahunAjaran;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PiketEndToEndTest extends TestCase
{
    use RefreshDatabase;

    public function test_full_piket_replacement_and_unlock_lifecycle(): void
    {
        $todayIso = Carbon::now()->dayOfWeekIso;
        $todayDate = Carbon::today()->toDateString();

        // 1. Setup Admin, Guru Pengampu, dan Guru Piket
        $admin = User::factory()->create([
            'role' => 'admin',
            'aktif' => true,
        ]);

        $guruPengampu = User::factory()->create([
            'nama' => 'Ibu Siti Guru Utama',
            'role' => 'guru',
            'aktif' => true,
            'no_wa' => '081111111111',
        ]);

        $guruPiket = User::factory()->create([
            'nama' => 'Bapak Budi Guru Piket',
            'role' => 'guru_piket',
            'aktif' => true,
            'no_wa' => '08222222222',
        ]);

        $tahunAjaran = TahunAjaran::create([
            'nama' => '2026/2027',
            'semester' => 'Ganjil',
            'tanggal_mulai' => '2026-07-15',
            'tanggal_selesai' => '2026-12-20',
            'aktif' => true,
        ]);

        $kelas = Kelas::create([
            'nama' => 'VIII-A',
            'tingkat' => 8,
            'tahun_ajaran_id' => $tahunAjaran->id,
            'wali_kelas_id' => $guruPengampu->id,
        ]);

        $jamPelajaran = JamPelajaran::create([
            'jam_ke' => 1,
            'mulai' => '07:00:00',
            'selesai' => '23:59:59',
            'kelompok_hari' => 'senin-kamis',
        ]);

        $mapel = Mapel::create([
            'kode' => 'MAT-8',
            'nama' => 'Matematika Terapan',
            'kelompok_kurikulum' => 'Umum',
        ]);

        $sesi = Sesi::create([
            'tanggal' => $todayDate,
            'kelas_id' => $kelas->id,
            'jam_pelajaran_id' => $jamPelajaran->id,
            'mapel_id' => $mapel->id,
            'guru_id' => $guruPengampu->id,
            'status' => 'terjadwal',
        ]);

        // LANGKAH 1: Admin mengatur penugasan piket (Task P1)
        $adminResponse = $this->actingAs($admin)->post(route('admin.guru-piket.store'), [
            'tahun_ajaran_id' => $tahunAjaran->id,
            'hari' => $todayIso,
            'user_id' => $guruPiket->id,
        ]);
        $adminResponse->assertRedirect(route('admin.guru-piket.index', ['tahun_ajaran_id' => $tahunAjaran->id]));
        $this->assertDatabaseHas('guru_piket', [
            'tahun_ajaran_id' => $tahunAjaran->id,
            'hari' => $todayIso,
            'user_id' => $guruPiket->id,
        ]);

        // LANGKAH 2: Guru melihat daftar guru piket hari ini dan nomor WA siap dihubungi (Task P2)
        $guruDashboardResponse = $this->actingAs($guruPengampu)->get(route('dashboard'));
        $guruDashboardResponse->assertStatus(200);
        $guruDashboardResponse->assertInertia(fn ($page) => $page
            ->component('Guru/Dashboard')
            ->has('piketHariIni', 1)
            ->where('piketHariIni.0.id', $guruPiket->id)
            ->where('piketHariIni.0.nama', 'Bapak Budi Guru Piket')
            ->where('piketHariIni.0.wa_phone', '628222222222')
            ->has('sesiHariIni', 1)
        );

        // LANGKAH 3: Di dashboard Guru Piket, sesi kelas masih terkunci (Task P3)
        $piketInitialResponse = $this->actingAs($guruPiket)->get(route('dashboard'));
        $piketInitialResponse->assertStatus(200);
        $piketInitialResponse->assertInertia(fn ($page) => $page
            ->component('Piket/Dashboard')
            ->has('sesiHariIni', 1)
            ->where('sesiHariIni.0.id', $sesi->id)
            ->where('sesiHariIni.0.status_kunci', 'terkunci')
            ->where('stats.total_terkunci', 1)
            ->where('stats.total_terbuka', 0)
        );

        // LANGKAH 4: Guru berhalangan hadir dan men-generate kode unik 6 digit (Task P4)
        $generateCodeResponse = $this->actingAs($guruPengampu)->post(route('sesi.generate-kode', $sesi->id));
        $generateCodeResponse->assertSessionHas('generated_kode');

        $kodeRecord = KodePengganti::where('sesi_id', $sesi->id)->first();
        $this->assertNotNull($kodeRecord);
        $this->assertEquals(6, strlen($kodeRecord->kode));
        $this->assertEquals('aktif', $kodeRecord->status);
        $this->assertEquals($guruPengampu->id, $kodeRecord->dibuat_oleh);

        // LANGKAH 5: Guru Piket mengklaim kode unik 6-digit tersebut (Task P5)
        $claimResponse = $this->actingAs($guruPiket)->post(route('piket.klaim-kode'), [
            'kode' => $kodeRecord->kode,
        ]);
        $claimResponse->assertSessionHas('success');

        // Status kode menjadi terpakai & tercatat siapa yang mengklaim
        $this->assertDatabaseHas('kode_pengganti', [
            'id' => $kodeRecord->id,
            'status' => 'terpakai',
            'diklaim_oleh' => $guruPiket->id,
        ]);

        // Sesi kelas ter-unlock dan status digantikan
        $this->assertDatabaseHas('sesi', [
            'id' => $sesi->id,
            'guru_pengganti_id' => $guruPiket->id,
            'status' => 'digantikan',
        ]);

        // LANGKAH 6: Verifikasi status ter-unlock di Piket Dashboard & status terupdate di Guru Dashboard (Task P6)
        $piketUpdatedResponse = $this->actingAs($guruPiket)->get(route('dashboard'));
        $piketUpdatedResponse->assertInertia(fn ($page) => $page
            ->component('Piket/Dashboard')
            ->where('sesiHariIni.0.id', $sesi->id)
            ->where('sesiHariIni.0.status_kunci', 'terbuka')
            ->where('sesiHariIni.0.guru_pengganti.id', $guruPiket->id)
            ->where('stats.total_terbuka', 1)
            ->where('stats.total_terkunci', 0)
        );

        // Status di dashboard guru setelah polling data
        $guruUpdatedResponse = $this->actingAs($guruPengampu)->get(route('dashboard'));
        $guruUpdatedResponse->assertInertia(fn ($page) => $page
            ->component('Guru/Dashboard')
            ->where('sesiHariIni.0.id', $sesi->id)
            ->where('sesiHariIni.0.status', 'digantikan')
            ->where('sesiHariIni.0.guru_pengganti.id', $guruPiket->id)
            ->where('sesiHariIni.0.guru_pengganti.nama', 'Bapak Budi Guru Piket')
        );
    }
}
