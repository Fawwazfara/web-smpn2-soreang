<?php

namespace Tests\Feature;

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

class KodePenggantiTest extends TestCase
{
    use RefreshDatabase;

    protected User $guruPemilik;
    protected User $guruLain;
    protected User $guruPiket;
    protected TahunAjaran $tahunAjaran;
    protected Kelas $kelas;
    protected JamPelajaran $jamPelajaran;
    protected Mapel $mapel;
    protected Sesi $sesi;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tahunAjaran = TahunAjaran::create([
            'nama' => '2026/2027',
            'semester' => 'Ganjil',
            'tanggal_mulai' => '2026-07-15',
            'tanggal_selesai' => '2026-12-20',
            'aktif' => true,
        ]);

        $this->guruPemilik = User::factory()->create([
            'role' => 'guru',
            'aktif' => true,
        ]);

        $this->guruLain = User::factory()->create([
            'role' => 'guru',
            'aktif' => true,
        ]);

        $this->guruPiket = User::factory()->create([
            'role' => 'guru_piket',
            'aktif' => true,
            'no_wa' => '081234567890',
        ]);

        $this->kelas = Kelas::create([
            'nama' => 'VII-B',
            'tingkat' => 7,
            'tahun_ajaran_id' => $this->tahunAjaran->id,
        ]);

        $this->jamPelajaran = JamPelajaran::create([
            'jam_ke' => 2,
            'mulai' => '08:30:00',
            'selesai' => '23:59:59', // Masih berlaku untuk hari ini
            'kelompok_hari' => 'senin-kamis',
        ]);

        $this->mapel = Mapel::create([
            'kode' => 'IPA-7',
            'nama' => 'Ilmu Pengetahuan Alam',
            'kelompok_kurikulum' => 'Umum',
        ]);

        $this->sesi = Sesi::create([
            'tanggal' => Carbon::today()->toDateString(),
            'kelas_id' => $this->kelas->id,
            'jam_pelajaran_id' => $this->jamPelajaran->id,
            'mapel_id' => $this->mapel->id,
            'guru_id' => $this->guruPemilik->id,
            'status' => 'terjadwal',
        ]);
    }

    public function test_only_session_owner_can_generate_replacement_code(): void
    {
        // Guru lain mencoba generate kode untuk sesi milik guruPemilik
        $response = $this->actingAs($this->guruLain)->post(route('sesi.generate-kode', $this->sesi->id));
        $response->assertStatus(403);

        // Guru pemilik berhasil generate kode
        $responseOwner = $this->actingAs($this->guruPemilik)->post(route('sesi.generate-kode', $this->sesi->id));
        $responseOwner->assertSessionHas('generated_kode');

        $this->assertDatabaseHas('kode_pengganti', [
            'sesi_id' => $this->sesi->id,
            'dibuat_oleh' => $this->guruPemilik->id,
            'status' => 'aktif',
        ]);
    }

    public function test_generated_code_format_is_exactly_6_numeric_digits(): void
    {
        $this->actingAs($this->guruPemilik)->post(route('sesi.generate-kode', $this->sesi->id));

        $kodeRecord = KodePengganti::where('sesi_id', $this->sesi->id)->first();
        $this->assertNotNull($kodeRecord);
        $this->assertEquals(6, strlen($kodeRecord->kode));
        $this->assertMatchesRegularExpression('/^[0-9]{6}$/', $kodeRecord->kode);
    }

    public function test_expired_code_cannot_be_claimed(): void
    {
        // Kode yang berlaku_sampai-nya sudah lewat
        $expiredKode = KodePengganti::create([
            'sesi_id' => $this->sesi->id,
            'kode' => '123456',
            'dibuat_oleh' => $this->guruPemilik->id,
            'berlaku_sampai' => Carbon::now()->subMinutes(10),
            'status' => 'aktif',
        ]);

        $response = $this->actingAs($this->guruPiket)->post(route('piket.klaim-kode'), [
            'kode' => '123456',
        ]);

        $response->assertSessionHasErrors('kode');
        $this->assertDatabaseHas('kode_pengganti', [
            'id' => $expiredKode->id,
            'status' => 'aktif',
            'diklaim_oleh' => null,
        ]);
    }

    public function test_guru_piket_can_claim_valid_code_and_unlock_session(): void
    {
        $validKode = KodePengganti::create([
            'sesi_id' => $this->sesi->id,
            'kode' => '654321',
            'dibuat_oleh' => $this->guruPemilik->id,
            'berlaku_sampai' => Carbon::now()->addHours(2),
            'status' => 'aktif',
        ]);

        $response = $this->actingAs($this->guruPiket)->post(route('piket.klaim-kode'), [
            'kode' => '654321',
        ]);

        $response->assertSessionHas('success');

        // Status kode menjadi terpakai
        $this->assertDatabaseHas('kode_pengganti', [
            'id' => $validKode->id,
            'kode' => '654321',
            'status' => 'terpakai',
            'diklaim_oleh' => $this->guruPiket->id,
        ]);

        // Sesi tercatat memiliki guru_pengganti_id dan status digantikan
        $this->assertDatabaseHas('sesi', [
            'id' => $this->sesi->id,
            'guru_pengganti_id' => $this->guruPiket->id,
            'status' => 'digantikan',
        ]);
    }

    public function test_code_cannot_be_claimed_twice_single_use(): void
    {
        $singleUseKode = KodePengganti::create([
            'sesi_id' => $this->sesi->id,
            'kode' => '999888',
            'dibuat_oleh' => $this->guruPemilik->id,
            'diklaim_oleh' => $this->guruPiket->id,
            'berlaku_sampai' => Carbon::now()->addHours(1),
            'diklaim_pada' => Carbon::now(),
            'status' => 'terpakai',
        ]);

        $anotherPiket = User::factory()->create([
            'role' => 'guru_piket',
            'aktif' => true,
        ]);

        $response = $this->actingAs($anotherPiket)->post(route('piket.klaim-kode'), [
            'kode' => '999888',
        ]);

        $response->assertSessionHasErrors('kode');
    }
}

