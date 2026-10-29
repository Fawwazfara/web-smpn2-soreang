<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class RoleDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_is_directed_to_admin_dashboard(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->get('/dashboard');

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Dashboard')
        );
    }

    public function test_guru_is_directed_to_guru_dashboard(): void
    {
        $guru = User::factory()->create([
            'role' => 'guru',
            'jenis_pegawai' => 'guru',
        ]);

        $response = $this->actingAs($guru)->get('/dashboard');

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Guru/Dashboard')
        );
    }

    public function test_guru_piket_is_directed_to_piket_dashboard(): void
    {
        $piket = User::factory()->create([
            'role' => 'guru_piket',
            'no_wa' => '6281234567890',
        ]);

        $response = $this->actingAs($piket)->get('/dashboard');

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Piket/Dashboard')
        );
    }

    public function test_kepsek_is_directed_to_kepsek_dashboard(): void
    {
        $kepsek = User::factory()->create([
            'role' => 'kepsek',
        ]);

        $response = $this->actingAs($kepsek)->get('/dashboard');

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Kepsek/Dashboard')
        );
    }

    public function test_inactive_user_cannot_login(): void
    {
        $inactive = User::factory()->create([
            'username' => 'inactiveuser',
            'password' => 'password123',
            'aktif' => false,
        ]);

        $response = $this->post('/login', [
            'username' => 'inactiveuser',
            'password' => 'password123',
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors('username');
    }

    public function test_inactive_authenticated_user_is_redirected_to_login(): void
    {
        $inactive = User::factory()->create([
            'aktif' => false,
        ]);

        $response = $this->actingAs($inactive)->get('/dashboard');

        $this->assertGuest();
        $response->assertRedirect(route('login'));
    }
}
