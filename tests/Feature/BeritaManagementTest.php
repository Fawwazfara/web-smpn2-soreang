<?php

namespace Tests\Feature;

use App\Models\Pengumuman;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class BeritaManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_landing_page_can_be_viewed(): void
    {
        $response = $this->get('/');

        $response->assertOk();
    }

    public function test_public_landing_page_only_shows_published_news(): void
    {
        $admin = User::factory()->admin()->create();

        $published = Pengumuman::create([
            'judul' => 'Berita Terbit Pertama',
            'slug' => 'berita-terbit-pertama',
            'kategori' => 'Prestasi Siswa',
            'ringkasan' => 'Ringkasan berita terbit',
            'isi' => 'Konten lengkap berita terbit',
            'tanggal' => now()->toDateString(),
            'status' => 'terbit',
            'dibuat_oleh' => $admin->id,
        ]);

        $draft = Pengumuman::create([
            'judul' => 'Berita Draf Rahasia',
            'slug' => 'berita-draf-rahasia',
            'kategori' => 'Internal',
            'ringkasan' => 'Ringkasan berita draf',
            'isi' => 'Konten rahasia draf',
            'tanggal' => now()->toDateString(),
            'status' => 'draf',
            'dibuat_oleh' => $admin->id,
        ]);

        $response = $this->get('/');

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Welcome')
            ->has('berita', 1)
            ->where('berita.0.id', $published->id)
            ->where('berita.0.judul', 'Berita Terbit Pertama')
        );
    }

    public function test_guest_cannot_access_admin_berita(): void
    {
        $this->get('/admin/berita')->assertRedirect(route('login'));
    }

    public function test_non_admin_cannot_access_admin_berita(): void
    {
        $guru = User::factory()->create(['role' => 'guru']);

        $this->actingAs($guru)->get('/admin/berita')->assertForbidden();
    }

    public function test_admin_can_view_admin_berita_list(): void
    {
        $admin = User::factory()->admin()->create();

        Pengumuman::create([
            'judul' => 'Berita Terbit',
            'slug' => 'berita-terbit',
            'kategori' => 'Prestasi Siswa',
            'ringkasan' => 'Ringkasan',
            'isi' => 'Konten',
            'tanggal' => now()->toDateString(),
            'status' => 'terbit',
            'dibuat_oleh' => $admin->id,
        ]);

        Pengumuman::create([
            'judul' => 'Berita Draf',
            'slug' => 'berita-draf',
            'kategori' => 'Internal',
            'ringkasan' => 'Ringkasan draf',
            'isi' => 'Konten draf',
            'tanggal' => now()->toDateString(),
            'status' => 'draf',
            'dibuat_oleh' => $admin->id,
        ]);

        $response = $this->actingAs($admin)->get('/admin/berita');

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Berita/Index')
            ->has('berita', 2)
        );
    }

    public function test_admin_can_create_published_berita(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->post('/admin/berita', [
            'judul' => 'Siswa SMPN 2 Soreang Juara 1 Robotik',
            'slug' => 'siswa-smpn-2-soreang-juara-1-robotik',
            'kategori' => 'Prestasi Siswa',
            'ringkasan' => 'Prestasi membanggakan tim robotik sekolah.',
            'isi' => 'Tim robotik SMPN 2 Soreang meraih juara pertama tingkat provinsi.',
            'gambar_path' => 'https://example.com/robotik.jpg',
            'tanggal' => '2026-10-28',
            'status' => 'terbit',
        ]);

        $response->assertRedirect(route('admin.berita.index'));

        $this->assertDatabaseHas('pengumuman', [
            'judul' => 'Siswa SMPN 2 Soreang Juara 1 Robotik',
            'slug' => 'siswa-smpn-2-soreang-juara-1-robotik',
            'status' => 'terbit',
            'dibuat_oleh' => $admin->id,
        ]);
    }

    public function test_admin_can_create_draft_berita(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->post('/admin/berita', [
            'judul' => 'Draf Berita Kegiatan Tengah Semester',
            'slug' => 'draf-berita-kegiatan-tengah-semester',
            'kategori' => 'Agenda Akademik',
            'ringkasan' => 'Draf agenda tengah semester.',
            'isi' => 'Konten persiapan ujian tengah semester.',
            'tanggal' => '2026-10-28',
            'status' => 'draf',
        ]);

        $response->assertRedirect(route('admin.berita.index'));

        $this->assertDatabaseHas('pengumuman', [
            'slug' => 'draf-berita-kegiatan-tengah-semester',
            'status' => 'draf',
        ]);

        // Verify draft does not appear on landing page
        $landing = $this->get('/');
        $landing->assertInertia(fn (Assert $page) => $page
            ->component('Welcome')
            ->has('berita', 0)
        );
    }

    public function test_admin_can_update_berita(): void
    {
        $admin = User::factory()->admin()->create();

        $berita = Pengumuman::create([
            'judul' => 'Judul Awal Berita',
            'slug' => 'judul-awal-berita',
            'kategori' => 'Umum',
            'ringkasan' => 'Ringkasan awal',
            'isi' => 'Konten awal',
            'tanggal' => '2026-10-28',
            'status' => 'draf',
            'dibuat_oleh' => $admin->id,
        ]);

        $response = $this->actingAs($admin)->post("/admin/berita/{$berita->id}", [
            'judul' => 'Judul Berita Telah Diperbarui',
            'slug' => 'judul-berita-telah-diperbarui',
            'kategori' => 'Inovasi Sekolah',
            'ringkasan' => 'Ringkasan diperbarui',
            'isi' => 'Konten diperbarui',
            'tanggal' => '2026-10-28',
            'status' => 'terbit',
        ]);

        $response->assertRedirect(route('admin.berita.index'));

        $this->assertDatabaseHas('pengumuman', [
            'id' => $berita->id,
            'judul' => 'Judul Berita Telah Diperbarui',
            'slug' => 'judul-berita-telah-diperbarui',
            'status' => 'terbit',
        ]);
    }

    public function test_admin_can_delete_berita(): void
    {
        $admin = User::factory()->admin()->create();

        $berita = Pengumuman::create([
            'judul' => 'Berita Yang Akan Dihapus',
            'slug' => 'berita-yang-akan-dihapus',
            'kategori' => 'Umum',
            'ringkasan' => 'Ringkasan',
            'isi' => 'Konten',
            'tanggal' => '2026-10-28',
            'status' => 'terbit',
            'dibuat_oleh' => $admin->id,
        ]);

        $response = $this->actingAs($admin)->delete("/admin/berita/{$berita->id}");

        $response->assertRedirect(route('admin.berita.index'));

        $this->assertDatabaseMissing('pengumuman', [
            'id' => $berita->id,
        ]);
    }

    public function test_validation_errors_when_required_fields_are_missing(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->post('/admin/berita', []);

        $response->assertSessionHasErrors(['judul', 'slug', 'kategori', 'isi', 'tanggal', 'status']);
    }

    public function test_slug_must_be_unique(): void
    {
        $admin = User::factory()->admin()->create();

        Pengumuman::create([
            'judul' => 'Berita Pertama',
            'slug' => 'berita-unik',
            'kategori' => 'Umum',
            'ringkasan' => 'Ringkasan',
            'isi' => 'Konten',
            'tanggal' => '2026-10-28',
            'status' => 'terbit',
            'dibuat_oleh' => $admin->id,
        ]);

        $response = $this->actingAs($admin)->post('/admin/berita', [
            'judul' => 'Berita Kedua',
            'slug' => 'berita-unik',
            'kategori' => 'Umum',
            'isi' => 'Konten lain',
            'tanggal' => '2026-10-28',
            'status' => 'terbit',
        ]);

        $response->assertSessionHasErrors(['slug']);
    }
}

