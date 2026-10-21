<?php

namespace Tests\Feature;

use App\Models\Kelas;
use App\Models\Siswa;
use App\Models\TahunAjaran;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class KelasManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function tahunAjaran(bool $aktif = true): TahunAjaran
    {
        return TahunAjaran::create([
            'nama' => '2026/2027',
            'semester' => 'Ganjil',
            'tanggal_mulai' => '2026-07-01',
            'tanggal_selesai' => '2026-12-31',
            'aktif' => $aktif,
        ]);
    }

    public function test_admin_can_view_kelas_page(): void
    {
        $admin = User::factory()->admin()->create();
        $this->tahunAjaran();

        $this->actingAs($admin)->get('/kelas')->assertOk();
    }

    public function test_non_admin_can_not_access_kelas(): void
    {
        $guru = User::factory()->create(['role' => 'guru']);

        $this->actingAs($guru)->get('/kelas')->assertForbidden();
    }

    public function test_admin_can_create_kelas_with_wali_kelas(): void
    {
        $admin = User::factory()->admin()->create();
        $tahunAjaran = $this->tahunAjaran();
        $guru = User::factory()->create([
            'role' => 'guru',
            'jenis_pegawai' => 'guru',
            'aktif' => true,
        ]);

        $this->actingAs($admin)->post('/kelas', [
            'nama' => '7A',
            'tingkat' => 7,
            'tahun_ajaran_id' => $tahunAjaran->id,
            'wali_kelas_id' => $guru->id,
        ])->assertRedirect(route('kelas.index', [
            'tahun_ajaran_id' => $tahunAjaran->id,
        ]));

        $this->assertDatabaseHas('kelas', [
            'nama' => '7A',
            'tingkat' => 7,
            'tahun_ajaran_id' => $tahunAjaran->id,
            'wali_kelas_id' => $guru->id,
        ]);
    }

    public function test_kelas_requires_valid_tahun_ajaran(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->post('/kelas', [
            'nama' => '7A',
            'tingkat' => 7,
            'tahun_ajaran_id' => 999,
        ])->assertSessionHasErrors('tahun_ajaran_id');

        $this->assertDatabaseCount('kelas', 0);
    }

    public function test_wali_kelas_must_be_an_active_guru(): void
    {
        $admin = User::factory()->admin()->create();
        $tahunAjaran = $this->tahunAjaran();
        $kepsek = User::factory()->create(['role' => 'kepsek', 'aktif' => true]);

        $this->actingAs($admin)->post('/kelas', [
            'nama' => '7A',
            'tingkat' => 7,
            'tahun_ajaran_id' => $tahunAjaran->id,
            'wali_kelas_id' => $kepsek->id,
        ])->assertSessionHasErrors('wali_kelas_id');

        $this->assertDatabaseCount('kelas', 0);
    }

    public function test_nama_kelas_must_be_unique_per_tahun_ajaran(): void
    {
        $admin = User::factory()->admin()->create();
        $tahunAjaran = $this->tahunAjaran();
        Kelas::create([
            'nama' => '7A',
            'tingkat' => 7,
            'tahun_ajaran_id' => $tahunAjaran->id,
        ]);

        $this->actingAs($admin)->post('/kelas', [
            'nama' => '7A',
            'tingkat' => 7,
            'tahun_ajaran_id' => $tahunAjaran->id,
        ])->assertSessionHasErrors('nama');
    }

    public function test_admin_can_update_kelas(): void
    {
        $admin = User::factory()->admin()->create();
        $tahunAjaran = $this->tahunAjaran();
        $kelas = Kelas::create([
            'nama' => '7A',
            'tingkat' => 7,
            'tahun_ajaran_id' => $tahunAjaran->id,
        ]);

        $this->actingAs($admin)
            ->patch(route('kelas.update', $kelas), [
                'nama' => '7B',
                'tingkat' => 8,
                'tahun_ajaran_id' => $tahunAjaran->id,
                'wali_kelas_id' => null,
            ])
            ->assertRedirect(route('kelas.index', [
                'tahun_ajaran_id' => $tahunAjaran->id,
            ]));

        $kelas->refresh();

        $this->assertSame('7B', $kelas->nama);
        $this->assertSame(8, $kelas->tingkat);
    }

    public function test_admin_can_delete_empty_kelas(): void
    {
        $admin = User::factory()->admin()->create();
        $tahunAjaran = $this->tahunAjaran();
        $kelas = Kelas::create([
            'nama' => '7A',
            'tingkat' => 7,
            'tahun_ajaran_id' => $tahunAjaran->id,
        ]);

        $this->actingAs($admin)
            ->delete(route('kelas.destroy', $kelas))
            ->assertRedirect(route('kelas.index', [
                'tahun_ajaran_id' => $tahunAjaran->id,
            ]));

        $this->assertDatabaseMissing('kelas', ['id' => $kelas->id]);
    }

    public function test_kelas_with_siswa_can_not_be_deleted(): void
    {
        $admin = User::factory()->admin()->create();
        $tahunAjaran = $this->tahunAjaran();
        $kelas = Kelas::create([
            'nama' => '7A',
            'tingkat' => 7,
            'tahun_ajaran_id' => $tahunAjaran->id,
        ]);
        Siswa::create([
            'nis' => '12345',
            'nama' => 'Siswa Contoh',
            'kelas_id' => $kelas->id,
        ]);

        $this->actingAs($admin)
            ->from('/kelas')
            ->delete(route('kelas.destroy', $kelas))
            ->assertSessionHasErrors('kelas');

        $this->assertDatabaseHas('kelas', ['id' => $kelas->id]);
    }
}
