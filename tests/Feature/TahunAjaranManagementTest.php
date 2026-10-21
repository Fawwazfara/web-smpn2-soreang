<?php

namespace Tests\Feature;

use App\Models\Kelas;
use App\Models\TahunAjaran;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TahunAjaranManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_tahun_ajaran_page(): void
    {
        $admin = User::factory()->admin()->create();
        TahunAjaran::create([
            'nama' => '2026/2027',
            'semester' => 'Ganjil',
            'tanggal_mulai' => '2026-07-01',
            'tanggal_selesai' => '2026-12-31',
            'aktif' => true,
        ]);

        $this->actingAs($admin)->get('/tahun-ajaran')->assertOk();
    }

    public function test_non_admin_can_not_access_tahun_ajaran(): void
    {
        $guru = User::factory()->create(['role' => 'guru']);

        $this->actingAs($guru)->get('/tahun-ajaran')->assertForbidden();
    }

    public function test_admin_can_create_tahun_ajaran(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->post('/tahun-ajaran', [
            'nama' => '2026/2027',
            'semester' => 'Ganjil',
            'tanggal_mulai' => '2026-07-01',
            'tanggal_selesai' => '2026-12-31',
            'aktif' => true,
        ])->assertRedirect(route('tahun-ajaran.index'));

        $this->assertDatabaseHas('tahun_ajaran', [
            'nama' => '2026/2027',
            'semester' => 'Ganjil',
            'aktif' => true,
        ]);
    }

    public function test_activating_new_tahun_ajaran_deactivates_previous_active_one(): void
    {
        $admin = User::factory()->admin()->create();
        $lama = TahunAjaran::create([
            'nama' => '2025/2026',
            'semester' => 'Genap',
            'tanggal_mulai' => '2026-01-01',
            'tanggal_selesai' => '2026-06-30',
            'aktif' => true,
        ]);

        $this->actingAs($admin)->post('/tahun-ajaran', [
            'nama' => '2026/2027',
            'semester' => 'Ganjil',
            'tanggal_mulai' => '2026-07-01',
            'tanggal_selesai' => '2026-12-31',
            'aktif' => true,
        ]);

        $this->assertFalse($lama->fresh()->aktif);
        $this->assertSame(1, TahunAjaran::where('aktif', true)->count());
    }

    public function test_admin_can_activate_tahun_ajaran(): void
    {
        $admin = User::factory()->admin()->create();
        $lama = TahunAjaran::create([
            'nama' => '2025/2026',
            'semester' => 'Genap',
            'tanggal_mulai' => '2026-01-01',
            'tanggal_selesai' => '2026-06-30',
            'aktif' => true,
        ]);
        $baru = TahunAjaran::create([
            'nama' => '2026/2027',
            'semester' => 'Ganjil',
            'tanggal_mulai' => '2026-07-01',
            'tanggal_selesai' => '2026-12-31',
            'aktif' => false,
        ]);

        $this->actingAs($admin)
            ->patch(route('tahun-ajaran.activate', $baru))
            ->assertRedirect(route('tahun-ajaran.index'));

        $this->assertTrue($baru->fresh()->aktif);
        $this->assertFalse($lama->fresh()->aktif);
    }

    public function test_admin_can_update_tahun_ajaran(): void
    {
        $admin = User::factory()->admin()->create();
        $tahunAjaran = TahunAjaran::create([
            'nama' => '2026/2027',
            'semester' => 'Ganjil',
            'tanggal_mulai' => '2026-07-01',
            'tanggal_selesai' => '2026-12-31',
            'aktif' => false,
        ]);

        $this->actingAs($admin)
            ->patch(route('tahun-ajaran.update', $tahunAjaran), [
                'nama' => '2026/2027',
                'semester' => 'Genap',
                'tanggal_mulai' => '2027-01-01',
                'tanggal_selesai' => '2027-06-30',
                'aktif' => false,
            ])
            ->assertRedirect(route('tahun-ajaran.index'));

        $this->assertSame('Genap', $tahunAjaran->fresh()->semester);
    }

    public function test_active_tahun_ajaran_can_not_be_deleted(): void
    {
        $admin = User::factory()->admin()->create();
        $tahunAjaran = TahunAjaran::create([
            'nama' => '2026/2027',
            'semester' => 'Ganjil',
            'tanggal_mulai' => '2026-07-01',
            'tanggal_selesai' => '2026-12-31',
            'aktif' => true,
        ]);

        $this->actingAs($admin)
            ->from('/tahun-ajaran')
            ->delete(route('tahun-ajaran.destroy', $tahunAjaran))
            ->assertSessionHasErrors('tahun_ajaran');

        $this->assertDatabaseHas('tahun_ajaran', ['id' => $tahunAjaran->id]);
    }

    public function test_tahun_ajaran_with_kelas_can_not_be_deleted(): void
    {
        $admin = User::factory()->admin()->create();
        $tahunAjaran = TahunAjaran::create([
            'nama' => '2026/2027',
            'semester' => 'Ganjil',
            'tanggal_mulai' => '2026-07-01',
            'tanggal_selesai' => '2026-12-31',
            'aktif' => false,
        ]);
        Kelas::create([
            'nama' => '7A',
            'tingkat' => 7,
            'tahun_ajaran_id' => $tahunAjaran->id,
        ]);

        $this->actingAs($admin)
            ->from('/tahun-ajaran')
            ->delete(route('tahun-ajaran.destroy', $tahunAjaran))
            ->assertSessionHasErrors('tahun_ajaran');

        $this->assertDatabaseHas('tahun_ajaran', ['id' => $tahunAjaran->id]);
    }

    public function test_admin_can_delete_empty_inactive_tahun_ajaran(): void
    {
        $admin = User::factory()->admin()->create();
        $tahunAjaran = TahunAjaran::create([
            'nama' => '2024/2025',
            'semester' => 'Ganjil',
            'tanggal_mulai' => '2024-07-01',
            'tanggal_selesai' => '2024-12-31',
            'aktif' => false,
        ]);

        $this->actingAs($admin)
            ->delete(route('tahun-ajaran.destroy', $tahunAjaran))
            ->assertRedirect(route('tahun-ajaran.index'));

        $this->assertDatabaseMissing('tahun_ajaran', ['id' => $tahunAjaran->id]);
    }
}
