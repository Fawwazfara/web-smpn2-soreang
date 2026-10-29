<?php

namespace Tests\Feature;

use App\Models\JadwalSlot;
use App\Models\JadwalVersi;
use App\Models\JamPelajaran;
use App\Models\Kelas;
use App\Models\Mapel;
use App\Models\Subject;
use App\Models\TahunAjaran;
use App\Models\TimeSlot;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MapelManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_mapel_page(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->get('/mapel')->assertOk();
    }

    public function test_non_admin_cannot_access_mapel(): void
    {
        $guru = User::factory()->create(['role' => 'guru']);

        $this->actingAs($guru)->get('/mapel')->assertForbidden();
    }

    public function test_admin_can_create_mapel(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->post('/mapel', [
            'kode' => 'MAT-01',
            'nama' => 'Matematika',
            'kelompok_kurikulum' => 'Kelompok A (Wajib)',
        ]);

        $response->assertRedirect(route('mapel.index'));
        $this->assertDatabaseHas('mapel', [
            'kode' => 'MAT-01',
            'nama' => 'Matematika',
            'kelompok_kurikulum' => 'Kelompok A (Wajib)',
        ]);
    }

    public function test_kode_mapel_must_be_unique(): void
    {
        $admin = User::factory()->admin()->create();

        Mapel::create([
            'kode' => 'MAT-01',
            'nama' => 'Matematika',
            'kelompok_kurikulum' => 'Kelompok A (Wajib)',
        ]);

        $response = $this->actingAs($admin)->post('/mapel', [
            'kode' => 'MAT-01',
            'nama' => 'Matematika Lanjut',
            'kelompok_kurikulum' => 'Kelompok A (Wajib)',
        ]);

        $response->assertSessionHasErrors('kode');
        $this->assertDatabaseCount('mapel', 1);
    }

    public function test_admin_can_update_mapel(): void
    {
        $admin = User::factory()->admin()->create();

        $mapel = Mapel::create([
            'kode' => 'MAT-01',
            'nama' => 'Matematika',
            'kelompok_kurikulum' => 'Kelompok A (Wajib)',
        ]);

        $response = $this->actingAs($admin)->patch("/mapel/{$mapel->id}", [
            'kode' => 'MAT-01',
            'nama' => 'Matematika Terapan',
            'kelompok_kurikulum' => 'Kelompok A (Wajib)',
        ]);

        $response->assertRedirect(route('mapel.index'));
        $this->assertDatabaseHas('mapel', [
            'id' => $mapel->id,
            'nama' => 'Matematika Terapan',
        ]);
    }

    public function test_admin_can_delete_mapel_when_unused(): void
    {
        $admin = User::factory()->admin()->create();

        $mapel = Mapel::create([
            'kode' => 'SNB-01',
            'nama' => 'Seni Budaya',
            'kelompok_kurikulum' => 'Kelompok B (Pilihan/Seni)',
        ]);

        $response = $this->actingAs($admin)->delete("/mapel/{$mapel->id}");

        $response->assertRedirect(route('mapel.index'));
        $this->assertDatabaseMissing('mapel', ['id' => $mapel->id]);
    }

    public function test_admin_cannot_delete_mapel_when_used_in_schedule(): void
    {
        $admin = User::factory()->admin()->create();

        $tahunAjaran = TahunAjaran::create([
            'nama' => '2026/2027',
            'semester' => 'Ganjil',
            'tanggal_mulai' => '2026-07-01',
            'tanggal_selesai' => '2026-12-31',
            'aktif' => true,
        ]);

        $kelas = Kelas::create([
            'nama' => '7A',
            'tingkat' => 7,
            'tahun_ajaran_id' => $tahunAjaran->id,
        ]);

        $versi = JadwalVersi::create([
            'nama' => 'Versi 1',
            'berlaku_mulai' => '2026-07-01',
            'berlaku_sampai' => '2026-12-31',
            'status' => 'aktif',
        ]);

        $mapel = Mapel::create([
            'kode' => 'IPA-01',
            'nama' => 'IPA',
            'kelompok_kurikulum' => 'Kelompok A (Wajib)',
        ]);

        $jam = JamPelajaran::create([
            'jam_ke' => 1,
            'mulai' => '07:00',
            'selesai' => '07:40',
            'kelompok_hari' => 'senin-kamis',
        ]);

        $guru = User::factory()->create(['role' => 'guru', 'aktif' => true]);

        JadwalSlot::create([
            'versi_id' => $versi->id,
            'hari' => 1,
            'jam_pelajaran_id' => $jam->id,
            'kelas_id' => $kelas->id,
            'mapel_id' => $mapel->id,
            'guru_id' => $guru->id,
        ]);

        $response = $this->actingAs($admin)->delete("/mapel/{$mapel->id}");

        $response->assertSessionHasErrors('mapel');
        $this->assertDatabaseHas('mapel', ['id' => $mapel->id]);
    }

    public function test_admin_can_create_jam_pelajaran(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->post('/jam-pelajaran', [
            'jam_ke' => 1,
            'mulai' => '07:00',
            'selesai' => '07:40',
            'kelompok_hari' => 'senin-kamis',
        ]);

        $response->assertRedirect(route('mapel.index', ['tab' => 'jam']));
        $slot = JamPelajaran::where('jam_ke', 1)->where('kelompok_hari', 'senin-kamis')->first();
        $this->assertNotNull($slot);
        $this->assertStringStartsWith('07:00', $slot->mulai);
        $this->assertStringStartsWith('07:40', $slot->selesai);
    }

    public function test_jam_pelajaran_rejects_overlapping_time_slots(): void
    {
        $admin = User::factory()->admin()->create();

        JamPelajaran::create([
            'jam_ke' => 1,
            'mulai' => '07:00',
            'selesai' => '07:40',
            'kelompok_hari' => 'senin-kamis',
        ]);

        // Attempt to create overlapping slot (07:30 - 08:10)
        $response = $this->actingAs($admin)->post('/jam-pelajaran', [
            'jam_ke' => 2,
            'mulai' => '07:30',
            'selesai' => '08:10',
            'kelompok_hari' => 'senin-kamis',
        ]);

        $response->assertSessionHasErrors('mulai');
        $this->assertDatabaseCount('jam_pelajaran', 1);
    }

    public function test_jam_pelajaran_allows_adjacent_non_overlapping_slots(): void
    {
        $admin = User::factory()->admin()->create();

        JamPelajaran::create([
            'jam_ke' => 1,
            'mulai' => '07:00',
            'selesai' => '07:40',
            'kelompok_hari' => 'senin-kamis',
        ]);

        // Exact contiguous boundary (07:40 - 08:20) should succeed
        $response = $this->actingAs($admin)->post('/jam-pelajaran', [
            'jam_ke' => 2,
            'mulai' => '07:40',
            'selesai' => '08:20',
            'kelompok_hari' => 'senin-kamis',
        ]);

        $response->assertRedirect(route('mapel.index', ['tab' => 'jam']));
        $this->assertDatabaseCount('jam_pelajaran', 2);
    }

    public function test_jam_pelajaran_allows_same_time_on_different_kelompok_hari(): void
    {
        $admin = User::factory()->admin()->create();

        JamPelajaran::create([
            'jam_ke' => 1,
            'mulai' => '07:00',
            'selesai' => '07:40',
            'kelompok_hari' => 'senin-kamis',
        ]);

        // Same time on 'jumat' group should succeed
        $response = $this->actingAs($admin)->post('/jam-pelajaran', [
            'jam_ke' => 1,
            'mulai' => '07:00',
            'selesai' => '07:40',
            'kelompok_hari' => 'jumat',
        ]);

        $response->assertRedirect(route('mapel.index', ['tab' => 'jam']));
        $this->assertDatabaseCount('jam_pelajaran', 2);
    }

    public function test_jam_pelajaran_rejects_end_time_before_or_equal_to_start_time(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->post('/jam-pelajaran', [
            'jam_ke' => 1,
            'mulai' => '08:00',
            'selesai' => '07:40',
            'kelompok_hari' => 'senin-kamis',
        ]);

        $response->assertSessionHasErrors('selesai');
        $this->assertDatabaseCount('jam_pelajaran', 0);
    }

    public function test_admin_can_update_jam_pelajaran_without_self_overlap(): void
    {
        $admin = User::factory()->admin()->create();

        $jam = JamPelajaran::create([
            'jam_ke' => 1,
            'mulai' => '07:00',
            'selesai' => '07:40',
            'kelompok_hari' => 'senin-kamis',
        ]);

        $response = $this->actingAs($admin)->patch("/jam-pelajaran/{$jam->id}", [
            'jam_ke' => 1,
            'mulai' => '07:05',
            'selesai' => '07:45',
            'kelompok_hari' => 'senin-kamis',
        ]);

        $response->assertRedirect(route('mapel.index', ['tab' => 'jam']));
        $updated = JamPelajaran::find($jam->id);
        $this->assertNotNull($updated);
        $this->assertStringStartsWith('07:05', $updated->mulai);
        $this->assertStringStartsWith('07:45', $updated->selesai);
    }

    public function test_admin_can_delete_unused_jam_pelajaran(): void
    {
        $admin = User::factory()->admin()->create();

        $jam = JamPelajaran::create([
            'jam_ke' => 1,
            'mulai' => '07:00',
            'selesai' => '07:40',
            'kelompok_hari' => 'senin-kamis',
        ]);

        $response = $this->actingAs($admin)->delete("/jam-pelajaran/{$jam->id}");

        $response->assertRedirect(route('mapel.index', ['tab' => 'jam']));
        $this->assertDatabaseMissing('jam_pelajaran', ['id' => $jam->id]);
    }

    public function test_subject_and_timeslot_model_and_route_aliases(): void
    {
        $admin = User::factory()->admin()->create();

        // Test Subject alias route with English field names
        $respSubject = $this->actingAs($admin)->post('/subjects', [
            'kode_mapel' => 'ENG-01',
            'nama_mapel' => 'English Language',
            'kelompok_kurikulum' => 'Kelompok A (Wajib)',
        ]);
        $respSubject->assertRedirect(route('mapel.index'));

        // Check Subject model
        $subject = Subject::where('kode', 'ENG-01')->first();
        $this->assertNotNull($subject);
        $this->assertEquals('ENG-01', $subject->kode_mapel);
        $this->assertEquals('English Language', $subject->nama_mapel);

        // Test TimeSlot alias route with English field names
        $respSlot = $this->actingAs($admin)->post('/time-slots', [
            'jam_ke' => 1,
            'waktu_mulai' => '07:00',
            'waktu_selesai' => '07:40',
            'kelompok_hari' => 'senin-kamis',
        ]);
        $respSlot->assertRedirect(route('mapel.index', ['tab' => 'jam']));

        // Check TimeSlot model
        $timeSlot = TimeSlot::where('jam_ke', 1)->first();
        $this->assertNotNull($timeSlot);
        $this->assertStringStartsWith('07:00', $timeSlot->waktu_mulai);
        $this->assertStringStartsWith('07:40', $timeSlot->waktu_selesai);
    }
}
