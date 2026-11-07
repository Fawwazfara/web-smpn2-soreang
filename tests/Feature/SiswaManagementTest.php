<?php

namespace Tests\Feature;

use App\Models\Kelas;
use App\Models\Siswa;
use App\Models\TahunAjaran;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SiswaManagementTest extends TestCase
{
    use RefreshDatabase;

    private function tahunAjaran(): TahunAjaran
    {
        return TahunAjaran::create([
            'nama'           => '2026/2027',
            'semester'       => 'Ganjil',
            'tanggal_mulai'  => '2026-07-01',
            'tanggal_selesai'=> '2026-12-31',
            'aktif'          => true,
        ]);
    }

    private function kelas(TahunAjaran $ta): Kelas
    {
        return Kelas::create([
            'nama'            => 'VII-A',
            'tingkat'         => 7,
            'tahun_ajaran_id' => $ta->id,
        ]);
    }

    // ── Access Control ────────────────────────────────────────────────────────

    public function test_admin_can_view_siswa_index(): void
    {
        $admin = User::factory()->admin()->create();
        $this->tahunAjaran();

        $this->actingAs($admin)->get('/admin/siswa')->assertOk();
    }

    public function test_non_admin_cannot_access_siswa(): void
    {
        $guru = User::factory()->create(['role' => 'guru']);

        $this->actingAs($guru)->get('/admin/siswa')->assertForbidden();
    }

    public function test_guest_is_redirected_from_siswa(): void
    {
        $this->get('/admin/siswa')->assertRedirect('/login');
    }

    // ── Store ─────────────────────────────────────────────────────────────────

    public function test_admin_can_create_siswa(): void
    {
        $admin = User::factory()->admin()->create();
        $kelas = $this->kelas($this->tahunAjaran());

        $this->actingAs($admin)->post('/admin/siswa', [
            'nis'        => '24250001',
            'nama'       => 'Budi Santoso',
            'kelas_id'   => $kelas->id,
            'no_hp_ortu' => '081234567890',
            'aktif'      => true,
        ])->assertRedirect(route('admin.siswa.index'));

        $this->assertDatabaseHas('siswa', ['nis' => '24250001', 'nama' => 'Budi Santoso']);
    }

    public function test_admin_can_create_siswa_without_optional_fields(): void
    {
        $admin = User::factory()->admin()->create();
        $this->tahunAjaran();

        $this->actingAs($admin)->post('/admin/siswa', [
            'nis'   => '24250002',
            'nama'  => 'Siti Aminah',
            'aktif' => true,
        ])->assertRedirect(route('admin.siswa.index'));

        $this->assertDatabaseHas('siswa', ['nis' => '24250002']);
    }

    public function test_store_requires_nis(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->post('/admin/siswa', [
            'nama'  => 'Test Siswa',
            'aktif' => true,
        ])->assertSessionHasErrors('nis');
    }

    public function test_store_requires_nama(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->post('/admin/siswa', [
            'nis'   => '24250003',
            'aktif' => true,
        ])->assertSessionHasErrors('nama');
    }

    public function test_store_rejects_duplicate_nis(): void
    {
        $admin = User::factory()->admin()->create();
        $ta    = $this->tahunAjaran();

        Siswa::create(['nis' => '24250099', 'nama' => 'Existing', 'aktif' => true]);

        $this->actingAs($admin)->post('/admin/siswa', [
            'nis'   => '24250099',
            'nama'  => 'Baru Siswa',
            'aktif' => true,
        ])->assertSessionHasErrors('nis');
    }

    public function test_store_rejects_invalid_phone(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->post('/admin/siswa', [
            'nis'        => '24250004',
            'nama'       => 'Phone Test',
            'no_hp_ortu' => '12345',
            'aktif'      => true,
        ])->assertSessionHasErrors('no_hp_ortu');
    }

    public function test_store_accepts_valid_phone_formats(): void
    {
        $admin = User::factory()->admin()->create();

        // Format 08...
        $this->actingAs($admin)->post('/admin/siswa', [
            'nis'        => '24250005',
            'nama'       => 'Siswa A',
            'no_hp_ortu' => '081234567890',
            'aktif'      => true,
        ])->assertRedirect(route('admin.siswa.index'));

        // Format +62...
        $this->actingAs($admin)->post('/admin/siswa', [
            'nis'        => '24250006',
            'nama'       => 'Siswa B',
            'no_hp_ortu' => '+6281234567890',
            'aktif'      => true,
        ])->assertRedirect(route('admin.siswa.index'));
    }

    // ── Update ────────────────────────────────────────────────────────────────

    public function test_admin_can_update_siswa(): void
    {
        $admin = User::factory()->admin()->create();
        $ta    = $this->tahunAjaran();
        $siswa = Siswa::create(['nis' => '24250010', 'nama' => 'Lama', 'aktif' => true]);

        $this->actingAs($admin)->patch("/admin/siswa/{$siswa->id}", [
            'nis'   => '24250010',
            'nama'  => 'Nama Baru',
            'aktif' => true,
        ])->assertRedirect(route('admin.siswa.index'));

        $this->assertDatabaseHas('siswa', ['id' => $siswa->id, 'nama' => 'Nama Baru']);
    }

    public function test_update_allows_same_nis_for_same_siswa(): void
    {
        $admin = User::factory()->admin()->create();
        $siswa = Siswa::create(['nis' => '24250020', 'nama' => 'Original', 'aktif' => true]);

        $this->actingAs($admin)->patch("/admin/siswa/{$siswa->id}", [
            'nis'   => '24250020',
            'nama'  => 'Updated Name',
            'aktif' => true,
        ])->assertRedirect(route('admin.siswa.index'));

        $this->assertDatabaseHas('siswa', ['id' => $siswa->id, 'nama' => 'Updated Name']);
    }

    public function test_update_rejects_duplicate_nis_of_other_siswa(): void
    {
        $admin  = User::factory()->admin()->create();
        $siswa1 = Siswa::create(['nis' => '24250030', 'nama' => 'Siswa 1', 'aktif' => true]);
        $siswa2 = Siswa::create(['nis' => '24250031', 'nama' => 'Siswa 2', 'aktif' => true]);

        $this->actingAs($admin)->patch("/admin/siswa/{$siswa2->id}", [
            'nis'   => '24250030',
            'nama'  => 'Siswa 2',
            'aktif' => true,
        ])->assertSessionHasErrors('nis');
    }

    // ── Toggle Status ─────────────────────────────────────────────────────────

    public function test_admin_can_toggle_siswa_status(): void
    {
        $admin = User::factory()->admin()->create();
        $siswa = Siswa::create(['nis' => '24250040', 'nama' => 'Toggle Test', 'aktif' => true]);

        $this->actingAs($admin)
            ->patch("/admin/siswa/{$siswa->id}/toggle-status")
            ->assertRedirect(route('admin.siswa.index'));

        $this->assertDatabaseHas('siswa', ['id' => $siswa->id, 'aktif' => false]);

        // Toggle back
        $this->actingAs($admin)
            ->patch("/admin/siswa/{$siswa->id}/toggle-status");

        $this->assertDatabaseHas('siswa', ['id' => $siswa->id, 'aktif' => true]);
    }

    // ── Destroy ───────────────────────────────────────────────────────────────

    public function test_admin_can_delete_siswa_without_absensi(): void
    {
        $admin = User::factory()->admin()->create();
        $siswa = Siswa::create(['nis' => '24250050', 'nama' => 'Delete Test', 'aktif' => true]);

        $this->actingAs($admin)
            ->delete("/admin/siswa/{$siswa->id}")
            ->assertRedirect(route('admin.siswa.index'));

        $this->assertDatabaseMissing('siswa', ['id' => $siswa->id]);
    }

    // ── Search & Filter ───────────────────────────────────────────────────────

    public function test_siswa_index_returns_paginated_data(): void
    {
        $admin = User::factory()->admin()->create();
        $ta    = $this->tahunAjaran();

        Siswa::create(['nis' => '001', 'nama' => 'Alpha', 'aktif' => true]);
        Siswa::create(['nis' => '002', 'nama' => 'Beta',  'aktif' => true]);

        $response = $this->actingAs($admin)->get('/admin/siswa');
        $response->assertOk();
        $response->assertInertia(fn ($page) =>
            $page->component('Admin/Siswa/Index')
                 ->has('siswa')
                 ->has('kelasList')
                 ->has('stats')
        );
    }

    public function test_siswa_index_can_search_by_nis(): void
    {
        $admin = User::factory()->admin()->create();

        Siswa::create(['nis' => '11111', 'nama' => 'Alpha', 'aktif' => true]);
        Siswa::create(['nis' => '22222', 'nama' => 'Beta',  'aktif' => true]);

        $response = $this->actingAs($admin)->get('/admin/siswa?search=11111');
        $response->assertOk();
        $response->assertInertia(fn ($page) =>
            $page->has('siswa.data', 1)
        );
    }

    public function test_siswa_index_can_filter_by_kelas(): void
    {
        $admin = User::factory()->admin()->create();
        $kelas = $this->kelas($this->tahunAjaran());

        Siswa::create(['nis' => '33333', 'nama' => 'In Kelas',  'kelas_id' => $kelas->id, 'aktif' => true]);
        Siswa::create(['nis' => '44444', 'nama' => 'No Kelas',  'aktif' => true]);

        $response = $this->actingAs($admin)->get("/admin/siswa?kelas_id={$kelas->id}");
        $response->assertOk();
        $response->assertInertia(fn ($page) =>
            $page->has('siswa.data', 1)
        );
    }
}

