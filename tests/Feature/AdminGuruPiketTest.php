<?php

namespace Tests\Feature;

use App\Models\GuruPiket;
use App\Models\TahunAjaran;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminGuruPiketTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $guruPiket;
    protected TahunAjaran $tahunAjaran;

    protected function setUp(): void
    {
        parent::setUp();

        // Setup Admin
        $this->admin = User::factory()->create([
            'role' => 'admin',
            'aktif' => true,
        ]);

        // Setup Tahun Ajaran Aktif
        $this->tahunAjaran = TahunAjaran::create([
            'nama' => '2026/2027',
            'semester' => 'Ganjil',
            'tanggal_mulai' => '2026-07-15',
            'tanggal_selesai' => '2026-12-20',
            'aktif' => true,
        ]);

        // Setup User dengan role guru_piket valid
        $this->guruPiket = User::factory()->create([
            'role' => 'guru_piket',
            'aktif' => true,
            'no_wa' => '081234567890',
        ]);
    }

    public function test_admin_can_view_guru_piket_page(): void
    {
        $response = $this->actingAs($this->admin)->get(route('admin.guru-piket.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/GuruPiket/Index')
            ->has('jadwalPiket')
            ->has('daftarGuruPiket')
            ->has('tahunAjaranAktif')
        );
    }

    public function test_non_admin_cannot_access_guru_piket_page(): void
    {
        $guruBiasa = User::factory()->create([
            'role' => 'guru',
            'aktif' => true,
        ]);

        $response = $this->actingAs($guruBiasa)->get(route('admin.guru-piket.index'));
        $response->assertStatus(403);
    }

    public function test_admin_can_assign_guru_piket(): void
    {
        $response = $this->actingAs($this->admin)->post(route('admin.guru-piket.store'), [
            'tahun_ajaran_id' => $this->tahunAjaran->id,
            'hari' => 1, // Senin
            'user_id' => $this->guruPiket->id,
        ]);

        $response->assertRedirect(route('admin.guru-piket.index', ['tahun_ajaran_id' => $this->tahunAjaran->id]));
        $this->assertDatabaseHas('guru_piket', [
            'tahun_ajaran_id' => $this->tahunAjaran->id,
            'hari' => 1,
            'user_id' => $this->guruPiket->id,
        ]);
    }

    public function test_cannot_assign_duplicate_guru_piket_on_same_day_and_academic_year(): void
    {
        GuruPiket::create([
            'tahun_ajaran_id' => $this->tahunAjaran->id,
            'hari' => 1,
            'user_id' => $this->guruPiket->id,
        ]);

        $response = $this->actingAs($this->admin)->post(route('admin.guru-piket.store'), [
            'tahun_ajaran_id' => $this->tahunAjaran->id,
            'hari' => 1,
            'user_id' => $this->guruPiket->id,
        ]);

        $response->assertSessionHasErrors('user_id');
        $this->assertCount(1, GuruPiket::where([
            'tahun_ajaran_id' => $this->tahunAjaran->id,
            'hari' => 1,
            'user_id' => $this->guruPiket->id,
        ])->get());
    }

    public function test_cannot_assign_user_with_role_other_than_guru_piket(): void
    {
        $guruNonPiket = User::factory()->create([
            'role' => 'guru',
            'aktif' => true,
            'no_wa' => '081234567899',
        ]);

        $response = $this->actingAs($this->admin)->post(route('admin.guru-piket.store'), [
            'tahun_ajaran_id' => $this->tahunAjaran->id,
            'hari' => 2,
            'user_id' => $guruNonPiket->id,
        ]);

        $response->assertSessionHasErrors('user_id');
        $this->assertDatabaseMissing('guru_piket', [
            'user_id' => $guruNonPiket->id,
        ]);
    }

    public function test_cannot_assign_inactive_guru_piket(): void
    {
        $inactiveGuru = User::factory()->create([
            'role' => 'guru_piket',
            'aktif' => false,
            'no_wa' => '081234567888',
        ]);

        $response = $this->actingAs($this->admin)->post(route('admin.guru-piket.store'), [
            'tahun_ajaran_id' => $this->tahunAjaran->id,
            'hari' => 3,
            'user_id' => $inactiveGuru->id,
        ]);

        $response->assertSessionHasErrors('user_id');
        $this->assertDatabaseMissing('guru_piket', [
            'user_id' => $inactiveGuru->id,
        ]);
    }

    public function test_cannot_assign_guru_piket_without_no_wa(): void
    {
        $noWaGuru = User::factory()->create([
            'role' => 'guru_piket',
            'aktif' => true,
            'no_wa' => null,
        ]);

        $response = $this->actingAs($this->admin)->post(route('admin.guru-piket.store'), [
            'tahun_ajaran_id' => $this->tahunAjaran->id,
            'hari' => 4,
            'user_id' => $noWaGuru->id,
        ]);

        $response->assertSessionHasErrors('user_id');
        $this->assertDatabaseMissing('guru_piket', [
            'user_id' => $noWaGuru->id,
        ]);
    }

    public function test_admin_can_delete_guru_piket_assignment(): void
    {
        $piket = GuruPiket::create([
            'tahun_ajaran_id' => $this->tahunAjaran->id,
            'hari' => 1,
            'user_id' => $this->guruPiket->id,
        ]);

        $response = $this->actingAs($this->admin)->delete(route('admin.guru-piket.destroy', $piket->id));

        $response->assertRedirect(route('admin.guru-piket.index', ['tahun_ajaran_id' => $this->tahunAjaran->id]));
        $this->assertDatabaseMissing('guru_piket', [
            'id' => $piket->id,
        ]);
    }
}

