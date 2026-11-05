<?php

namespace Tests\Feature;

use App\Models\JadwalSlot;
use App\Models\JadwalVersi;
use App\Models\JamPelajaran;
use App\Models\Kelas;
use App\Models\Mapel;
use App\Models\Sesi;
use App\Models\TahunAjaran;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class JadwalManagementTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $guru;
    protected TahunAjaran $tahunAjaran;
    protected Kelas $kelas;
    protected Mapel $mapel;
    protected JamPelajaran $jamPelajaran;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'role' => 'admin',
            'aktif' => true,
        ]);

        $this->guru = User::factory()->create([
            'role' => 'guru',
            'aktif' => true,
        ]);

        $this->tahunAjaran = TahunAjaran::create([
            'nama' => '2026/2027',
            'semester' => 'Ganjil',
            'aktif' => true,
        ]);

        $this->kelas = Kelas::create([
            'nama' => '7-A',
            'tingkat' => 7,
            'tahun_ajaran_id' => $this->tahunAjaran->id,
        ]);

        $this->mapel = Mapel::create([
            'kode' => 'MAT-01',
            'nama' => 'Matematika',
            'kelompok_kurikulum' => 'A',
        ]);

        $this->jamPelajaran = JamPelajaran::create([
            'jam_ke' => 1,
            'mulai' => '07:00',
            'selesai' => '07:40',
            'kelompok_hari' => 'Senin-Kamis',
        ]);
    }

    public function test_admin_can_view_jadwal_page(): void
    {
        $response = $this->actingAs($this->admin)->get(route('jadwal.index'));
        $response->assertStatus(200);
    }

    public function test_admin_can_create_jadwal_versi_draf(): void
    {
        $response = $this->actingAs($this->admin)->post(route('jadwal.versi.store'), [
            'nama' => 'Versi Draf 1',
            'berlaku_mulai' => '2026-11-01',
            'berlaku_sampai' => '2026-12-31',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('jadwal_versi', [
            'nama' => 'Versi Draf 1',
            'status' => 'draf',
        ]);
    }

    public function test_admin_can_publish_jadwal_versi(): void
    {
        $versi1 = JadwalVersi::create([
            'nama' => 'Versi Lama',
            'berlaku_mulai' => '2026-10-01',
            'berlaku_sampai' => '2026-10-31',
            'status' => 'aktif',
        ]);

        $versi2 = JadwalVersi::create([
            'nama' => 'Versi Baru',
            'berlaku_mulai' => '2026-11-01',
            'berlaku_sampai' => '2026-12-31',
            'status' => 'draf',
        ]);

        $response = $this->actingAs($this->admin)->patch(route('jadwal.versi.publish', $versi2->id));

        $response->assertRedirect();
        $this->assertEquals('arsip', $versi1->fresh()->status);
        $this->assertEquals('aktif', $versi2->fresh()->status);
    }

    public function test_admin_can_store_jadwal_slot(): void
    {
        $versi = JadwalVersi::create([
            'nama' => 'Versi Test',
            'berlaku_mulai' => '2026-11-01',
            'berlaku_sampai' => '2026-12-31',
            'status' => 'draf',
        ]);

        $response = $this->actingAs($this->admin)->post(route('jadwal.slot.store', $versi->id), [
            'hari' => 1,
            'jam_pelajaran_id' => $this->jamPelajaran->id,
            'kelas_id' => $this->kelas->id,
            'mapel_id' => $this->mapel->id,
            'guru_id' => $this->guru->id,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('jadwal_slot', [
            'versi_id' => $versi->id,
            'hari' => 1,
            'kelas_id' => $this->kelas->id,
            'guru_id' => $this->guru->id,
        ]);
    }

    public function test_admin_cannot_assign_same_teacher_to_multiple_classes_at_same_time(): void
    {
        $versi = JadwalVersi::create([
            'nama' => 'Versi Test',
            'berlaku_mulai' => '2026-11-01',
            'berlaku_sampai' => '2026-12-31',
            'status' => 'draf',
        ]);

        $kelas2 = Kelas::create([
            'nama' => '7-B',
            'tingkat' => 7,
            'tahun_ajaran_id' => $this->tahunAjaran->id,
        ]);

        // Slot 1: Guru di Kelas 7-A
        JadwalSlot::create([
            'versi_id' => $versi->id,
            'hari' => 1,
            'jam_pelajaran_id' => $this->jamPelajaran->id,
            'kelas_id' => $this->kelas->id,
            'mapel_id' => $this->mapel->id,
            'guru_id' => $this->guru->id,
        ]);

        // Slot 2: Coba assign guru yang sama di Kelas 7-B pada jam yang sama
        $response = $this->actingAs($this->admin)->post(route('jadwal.slot.store', $versi->id), [
            'hari' => 1,
            'jam_pelajaran_id' => $this->jamPelajaran->id,
            'kelas_id' => $kelas2->id,
            'mapel_id' => $this->mapel->id,
            'guru_id' => $this->guru->id,
        ]);

        $response->assertSessionHas('error');
        $this->assertDatabaseMissing('jadwal_slot', [
            'versi_id' => $versi->id,
            'hari' => 1,
            'kelas_id' => $kelas2->id,
        ]);
    }

    public function test_admin_can_generate_sesi_from_active_version(): void
    {
        $versi = JadwalVersi::create([
            'nama' => 'Versi Aktif Test',
            'berlaku_mulai' => '2026-11-01',
            'berlaku_sampai' => '2026-12-31',
            'status' => 'aktif',
        ]);

        $slot = JadwalSlot::create([
            'versi_id' => $versi->id,
            'hari' => 1, // Senin
            'jam_pelajaran_id' => $this->jamPelajaran->id,
            'kelas_id' => $this->kelas->id,
            'mapel_id' => $this->mapel->id,
            'guru_id' => $this->guru->id,
        ]);

        // 2026-11-02 adalah hari Senin
        $response = $this->actingAs($this->admin)->post(route('jadwal.generate-sesi'), [
            'tanggal_mulai' => '2026-11-02',
            'tanggal_selesai' => '2026-11-02',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('sesi', [
            'tanggal' => '2026-11-02',
            'kelas_id' => $this->kelas->id,
            'jam_pelajaran_id' => $this->jamPelajaran->id,
            'guru_id' => $this->guru->id,
            'status' => 'terjadwal',
        ]);
    }
}
