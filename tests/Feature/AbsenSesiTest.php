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
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AbsenSesiTest extends TestCase
{
    use RefreshDatabase;

    protected User $guru;
    protected User $guruLain;
    protected User $admin;
    protected Sesi $sesi;
    protected Kelas $kelas;
    protected Siswa $siswa1;
    protected Siswa $siswa2;

    protected function setUp(): void
    {
        parent::setUp();

        $ta = TahunAjaran::create([
            'nama'           => '2026/2027',
            'semester'       => 'Ganjil',
            'tanggal_mulai'  => '2026-07-15',
            'tanggal_selesai'=> '2026-12-20',
            'aktif'          => true,
        ]);

        $this->guru = User::factory()->create(['role' => 'guru', 'aktif' => true]);
        $this->guruLain = User::factory()->create(['role' => 'guru', 'aktif' => true]);
        $this->admin = User::factory()->create(['role' => 'admin', 'aktif' => true]);

        $this->kelas = Kelas::create([
            'nama'           => 'VIII-A',
            'tingkat'        => 8,
            'tahun_ajaran_id'=> $ta->id,
        ]);

        $mapel = Mapel::create(['kode_mapel' => 'MTK', 'nama_mapel' => 'Matematika', 'kelompok_kurikulum' => 'A']);

        $jam = JamPelajaran::create([
            'jam_ke'       => 1,
            'waktu_mulai'  => '07:00',
            'waktu_selesai'=> '07:45',
            'kelompok_hari'=> 'senin-kamis',
        ]);

        $this->sesi = Sesi::create([
            'tanggal'        => now()->toDateString(),
            'kelas_id'       => $this->kelas->id,
            'jam_pelajaran_id'=> $jam->id,
            'mapel_id'       => $mapel->id,
            'guru_id'        => $this->guru->id,
            'status'         => 'terjadwal',
        ]);

        $this->siswa1 = Siswa::create(['nis' => '001', 'nama' => 'Andi', 'kelas_id' => $this->kelas->id, 'aktif' => true]);
        $this->siswa2 = Siswa::create(['nis' => '002', 'nama' => 'Budi', 'kelas_id' => $this->kelas->id, 'aktif' => true]);
    }

    public function test_guru_can_view_absen_sesi_show_page(): void
    {
        $response = $this->actingAs($this->guru)
            ->get(route('guru.absen-sesi.show', $this->sesi));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Guru/AbsenSiswa/Index'));
    }

    public function test_guru_lain_cannot_view_absen_sesi(): void
    {
        $response = $this->actingAs($this->guruLain)
            ->get(route('guru.absen-sesi.show', $this->sesi));

        $response->assertStatus(403);
    }

    public function test_admin_can_view_absen_sesi(): void
    {
        $response = $this->actingAs($this->admin)
            ->get(route('guru.absen-sesi.show', $this->sesi));

        $response->assertStatus(200);
    }

    public function test_guru_can_store_absen(): void
    {
        $response = $this->actingAs($this->guru)
            ->post(route('guru.absen-sesi.store', $this->sesi), [
                'absen' => [
                    ['siswa_id' => $this->siswa1->id, 'status' => 'H', 'catatan' => ''],
                    ['siswa_id' => $this->siswa2->id, 'status' => 'A', 'catatan' => 'tanpa keterangan'],
                ],
                'jurnal_kbm' => 'Pembahasan bab 3',
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('absen_siswa', ['sesi_id' => $this->sesi->id, 'siswa_id' => $this->siswa1->id, 'status' => 'H']);
        $this->assertDatabaseHas('absen_siswa', ['sesi_id' => $this->sesi->id, 'siswa_id' => $this->siswa2->id, 'status' => 'A']);
    }

    public function test_status_sakit_generates_konfirmasi_token(): void
    {
        $this->actingAs($this->guru)
            ->post(route('guru.absen-sesi.store', $this->sesi), [
                'absen' => [
                    ['siswa_id' => $this->siswa1->id, 'status' => 'S', 'catatan' => 'Sakit demam'],
                ],
            ]);

        $absen = AbsenSiswa::where('sesi_id', $this->sesi->id)->where('siswa_id', $this->siswa1->id)->first();
        $this->assertNotNull($absen->konfirmasi_token);
        $this->assertEquals('menunggu', $absen->status_konfirmasi);
        $this->assertNotNull($absen->token_berlaku_sampai);
        $this->assertTrue($absen->token_berlaku_sampai->isFuture());
    }

    public function test_status_izin_generates_konfirmasi_token(): void
    {
        $this->actingAs($this->guru)
            ->post(route('guru.absen-sesi.store', $this->sesi), [
                'absen' => [
                    ['siswa_id' => $this->siswa2->id, 'status' => 'I', 'catatan' => 'Dispensasi lomba'],
                ],
            ]);

        $absen = AbsenSiswa::where('sesi_id', $this->sesi->id)->where('siswa_id', $this->siswa2->id)->first();
        $this->assertNotNull($absen->konfirmasi_token);
        $this->assertEquals('menunggu', $absen->status_konfirmasi);
    }

    public function test_existing_token_is_preserved_on_re_mark_si(): void
    {
        // First mark as S
        $this->actingAs($this->guru)
            ->post(route('guru.absen-sesi.store', $this->sesi), [
                'absen' => [['siswa_id' => $this->siswa1->id, 'status' => 'S', 'catatan' => '']],
            ]);

        $firstToken = AbsenSiswa::where('sesi_id', $this->sesi->id)->where('siswa_id', $this->siswa1->id)->value('konfirmasi_token');

        // Re-mark as I — token should be preserved (still valid)
        $this->actingAs($this->guru)
            ->post(route('guru.absen-sesi.store', $this->sesi), [
                'absen' => [['siswa_id' => $this->siswa1->id, 'status' => 'I', 'catatan' => '']],
            ]);

        $secondToken = AbsenSiswa::where('sesi_id', $this->sesi->id)->where('siswa_id', $this->siswa1->id)->value('konfirmasi_token');
        $this->assertEquals($firstToken, $secondToken);
    }

    public function test_marking_hadir_clears_token(): void
    {
        // Mark S first
        $this->actingAs($this->guru)
            ->post(route('guru.absen-sesi.store', $this->sesi), [
                'absen' => [['siswa_id' => $this->siswa1->id, 'status' => 'S', 'catatan' => '']],
            ]);

        // Then mark H
        $this->actingAs($this->guru)
            ->post(route('guru.absen-sesi.store', $this->sesi), [
                'absen' => [['siswa_id' => $this->siswa1->id, 'status' => 'H', 'catatan' => '']],
            ]);

        $absen = AbsenSiswa::where('sesi_id', $this->sesi->id)->where('siswa_id', $this->siswa1->id)->first();
        $this->assertNull($absen->konfirmasi_token);
    }

    public function test_guru_pengganti_can_store_absen(): void
    {
        $this->sesi->update(['guru_pengganti_id' => $this->guruLain->id]);

        $response = $this->actingAs($this->guruLain)
            ->post(route('guru.absen-sesi.store', $this->sesi), [
                'absen' => [
                    ['siswa_id' => $this->siswa1->id, 'status' => 'H', 'catatan' => ''],
                ],
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('absen_siswa', ['sesi_id' => $this->sesi->id, 'status' => 'H']);
    }

    public function test_guru_lain_cannot_store_absen(): void
    {
        $response = $this->actingAs($this->guruLain)
            ->post(route('guru.absen-sesi.store', $this->sesi), [
                'absen' => [['siswa_id' => $this->siswa1->id, 'status' => 'H', 'catatan' => '']],
            ]);

        $response->assertStatus(403);
    }

    public function test_unauthenticated_user_cannot_access_absen(): void
    {
        $this->get(route('guru.absen-sesi.show', $this->sesi))->assertRedirect('/login');
        $this->post(route('guru.absen-sesi.store', $this->sesi))->assertRedirect('/login');
    }
}

