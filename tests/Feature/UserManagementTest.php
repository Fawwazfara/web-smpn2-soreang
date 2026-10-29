<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_user_management_page(): void
    {
        $admin = User::factory()->admin()->create();
        User::factory()->create(['role' => 'guru']);

        $response = $this->actingAs($admin)->get('/users');

        $response->assertOk();
    }

    public function test_non_admin_can_not_access_user_management(): void
    {
        $guru = User::factory()->create(['role' => 'guru']);

        $this->actingAs($guru)->get('/users')->assertForbidden();
    }

    public function test_kepsek_can_not_access_user_management(): void
    {
        $kepsek = User::factory()->create(['role' => 'kepsek']);

        $this->actingAs($kepsek)->get('/users')->assertForbidden();
    }

    public function test_admin_can_create_guru(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->post('/users', [
            'username' => '198001012005011001',
            'nama' => 'Budi Santoso',
            'email' => 'budi@example.com',
            'role' => 'guru',
            'jenis_pegawai' => 'guru',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertRedirect(route('users.index'));

        $this->assertDatabaseHas('users', [
            'username' => '198001012005011001',
            'role' => 'guru',
            'jenis_pegawai' => 'guru',
            'wajib_ganti_password' => true,
        ]);
    }

    public function test_admin_can_create_kepsek_without_jenis_pegawai(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->post('/users', [
            'username' => 'kepsek01',
            'nama' => 'Kepala Sekolah',
            'role' => 'kepsek',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])->assertRedirect(route('users.index'));

        $this->assertDatabaseHas('users', [
            'username' => 'kepsek01',
            'role' => 'kepsek',
            'jenis_pegawai' => null,
        ]);
    }

    public function test_admin_can_not_create_admin(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->post('/users', [
            'username' => 'admin02',
            'nama' => 'Admin Baru',
            'role' => 'admin',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertSessionHasErrors('role');
        $this->assertDatabaseMissing('users', ['username' => 'admin02']);
    }

    public function test_create_requires_unique_username(): void
    {
        $admin = User::factory()->admin()->create();
        User::factory()->create(['username' => 'duplikat']);

        $response = $this->actingAs($admin)->post('/users', [
            'username' => 'duplikat',
            'nama' => 'Budi',
            'role' => 'guru',
            'jenis_pegawai' => 'guru',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertSessionHasErrors('username');
    }

    public function test_admin_can_update_user(): void
    {
        $admin = User::factory()->admin()->create();
        $guru = User::factory()->create(['role' => 'guru']);

        $this->actingAs($admin)->patch("/users/{$guru->id}", [
            'username' => $guru->username,
            'nama' => 'Nama Diubah',
            'role' => 'guru_piket',
            'no_wa' => '6281234567890',
            'aktif' => false,
        ])->assertRedirect(route('users.index'));

        $guru->refresh();

        $this->assertSame('Nama Diubah', $guru->nama);
        $this->assertSame('guru_piket', $guru->role);
        $this->assertSame('6281234567890', $guru->no_wa);
        $this->assertNull($guru->jenis_pegawai);
        $this->assertFalse($guru->aktif);
    }

    public function test_admin_can_delete_user(): void
    {
        $admin = User::factory()->admin()->create();
        $guru = User::factory()->create(['role' => 'guru']);

        $this->actingAs($admin)
            ->delete("/users/{$guru->id}")
            ->assertRedirect(route('users.index'));

        $this->assertDatabaseHas('users', [
            'id' => $guru->id,
            'aktif' => false,
        ]);
    }

    public function test_admin_can_not_manage_another_admin(): void
    {
        $admin = User::factory()->admin()->create();
        $other = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->delete("/users/{$other->id}")
            ->assertForbidden();
    }
}
