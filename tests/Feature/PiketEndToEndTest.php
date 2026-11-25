<?php

namespace Tests\Feature;

use App\Models\AbsenSiswa;
use App\Models\GuruPiket;
use App\Models\JamPelajaran;
use App\Models\Kelas;
use App\Models\KodePengganti;
use App\Models\Mapel;
use App\Models\Sesi;
use App\Models\Siswa;
use App\Models\TahunAjaran;
use App\Models\User;
use Carbon\Carbon;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class PiketEndToEndTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Carbon::setTestNow(Carbon::create(2026, 11, 16, 8, 0, 0, config('absensi.timezone', 'Asia/Jakarta')));
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
    }

    public function test_full_piket_replacement_and_unlock_lifecycle(): void
    {
        Queue::fake();

        $todayIso = Carbon::now()->dayOfWeekIso;
        $todayDate = Carbon::today()->toDateString();

        // 1. Setup Admin, Guru Pengampu, Guru Piket, dan Kepsek
        $admin = User::factory()->create([
            'role' => 'admin',
            'aktif' => true,
        ]);

        $guruPengampu = User::factory()->create([
            'nama' => 'Ibu Siti Guru Utama',
            'role' => 'guru',
            'jenis_pegawai' => 'guru',
            'aktif' => true,
            'no_wa' => '081111111111',
        ]);

        $guruPiket = User::factory()->create([
            'nama' => 'Bapak Budi Guru Piket',
            'role' => 'guru_piket',
            'aktif' => true,
            'no_wa' => '08222222222',
        ]);

        $kepsek = User::factory()->create([
            'nama' => 'Bapak Kepsek Monitoring',
            'role' => 'kepsek',
            'aktif' => true,
        ]);

        $tahunAjaran = TahunAjaran::create([
            'nama' => '2026/2027',
            'semester' => 'Ganjil',
            'tanggal_mulai' => '2026-07-15',
            'tanggal_selesai' => '2026-12-20',
            'aktif' => true,
        ]);

        $kelas = Kelas::create([
            'nama' => 'VIII-A',
            'tingkat' => 8,
            'tahun_ajaran_id' => $tahunAjaran->id,
            'wali_kelas_id' => $guruPengampu->id,
        ]);

        $siswaHadir = Siswa::create([
            'nis' => '8001',
            'nama' => 'Andi Pratama',
            'kelas_id' => $kelas->id,
            'no_hp_ortu' => '081234567801',
            'aktif' => true,
        ]);

        $siswaSakit = Siswa::create([
            'nis' => '8002',
            'nama' => 'Bunga Citra',
            'kelas_id' => $kelas->id,
            'no_hp_ortu' => '081234567802',
            'aktif' => true,
        ]);

        $jamPelajaran = JamPelajaran::create([
            'jam_ke' => 1,
            'mulai' => '07:00:00',
            'selesai' => '23:59:59',
            'kelompok_hari' => 'senin-kamis',
        ]);

        $mapel = Mapel::create([
            'kode' => 'MAT-8',
            'nama' => 'Matematika Terapan',
            'kelompok_kurikulum' => 'Umum',
        ]);

        $sesi = Sesi::create([
            'tanggal' => $todayDate,
            'kelas_id' => $kelas->id,
            'jam_pelajaran_id' => $jamPelajaran->id,
            'mapel_id' => $mapel->id,
            'guru_id' => $guruPengampu->id,
            'status' => 'terjadwal',
        ]);

        // LANGKAH 1: Admin mengatur penugasan piket (Task P1)
        $adminResponse = $this->actingAs($admin)->post(route('admin.guru-piket.store'), [
            'tahun_ajaran_id' => $tahunAjaran->id,
            'hari' => $todayIso,
            'user_id' => $guruPiket->id,
        ]);
        $adminResponse->assertRedirect(route('admin.guru-piket.index', ['tahun_ajaran_id' => $tahunAjaran->id]));
        $this->assertDatabaseHas('guru_piket', [
            'tahun_ajaran_id' => $tahunAjaran->id,
            'hari' => $todayIso,
            'user_id' => $guruPiket->id,
        ]);

        // LANGKAH 2: Guru melihat daftar guru piket hari ini dan nomor WA siap dihubungi (Task P2)
        $guruDashboardResponse = $this->actingAs($guruPengampu)->get(route('dashboard'));
        $guruDashboardResponse->assertStatus(200);
        $guruDashboardResponse->assertInertia(fn ($page) => $page
            ->component('Guru/Dashboard')
            ->has('piketHariIni', 1)
            ->where('piketHariIni.0.id', $guruPiket->id)
            ->where('piketHariIni.0.nama', 'Bapak Budi Guru Piket')
            ->where('piketHariIni.0.wa_phone', '628222222222')
            ->has('sesiHariIni', 1)
        );

        // LANGKAH 3: Di dashboard Guru Piket, sesi kelas masih terkunci & belum bisa diakses di form absen (Task P3)
        $piketInitialResponse = $this->actingAs($guruPiket)->get(route('dashboard'));
        $piketInitialResponse->assertStatus(200);
        $piketInitialResponse->assertInertia(fn ($page) => $page
            ->component('Piket/Dashboard')
            ->has('sesiHariIni', 1)
            ->where('sesiHariIni.0.id', $sesi->id)
            ->where('sesiHariIni.0.status_kunci', 'terkunci')
            ->where('stats.total_terkunci', 1)
            ->where('stats.total_terbuka', 0)
        );

        // Sebelum klaim kode, guru piket tidak boleh membuka form absen sesi tersebut (403)
        $this->actingAs($guruPiket)
            ->get(route('guru.absen-sesi.show', $sesi->id))
            ->assertStatus(403);

        // LANGKAH 4: Guru berhalangan hadir dan men-generate kode unik 6 digit (Task P4)
        $generateCodeResponse = $this->actingAs($guruPengampu)->post(route('sesi.generate-kode', $sesi->id));
        $generateCodeResponse->assertSessionHas('generated_kode');

        $kodeRecord = KodePengganti::where('sesi_id', $sesi->id)->first();
        $this->assertNotNull($kodeRecord);
        $this->assertEquals(6, strlen($kodeRecord->kode));
        $this->assertEquals('aktif', $kodeRecord->status);
        $this->assertEquals($guruPengampu->id, $kodeRecord->dibuat_oleh);

        // LANGKAH 5: Guru Piket mengklaim kode unik 6-digit tersebut (Task P5)
        $claimResponse = $this->actingAs($guruPiket)->post(route('piket.klaim-kode'), [
            'kode' => $kodeRecord->kode,
        ]);
        $claimResponse->assertSessionHas('success');
        $claimResponse->assertSessionHas('unlocked_sesi_id', $sesi->id);

        // Status kode menjadi terpakai & tercatat siapa yang mengklaim
        $this->assertDatabaseHas('kode_pengganti', [
            'id' => $kodeRecord->id,
            'status' => 'terpakai',
            'diklaim_oleh' => $guruPiket->id,
        ]);

        // Sesi kelas ter-unlock dan status digantikan
        $this->assertDatabaseHas('sesi', [
            'id' => $sesi->id,
            'guru_pengganti_id' => $guruPiket->id,
            'status' => 'digantikan',
        ]);

        // LANGKAH 6: Verifikasi status ter-unlock di Piket Dashboard & status terupdate di Guru Dashboard (Task P6)
        $piketUpdatedResponse = $this->actingAs($guruPiket)->get(route('dashboard'));
        $piketUpdatedResponse->assertInertia(fn ($page) => $page
            ->component('Piket/Dashboard')
            ->where('sesiHariIni.0.id', $sesi->id)
            ->where('sesiHariIni.0.status_kunci', 'terbuka')
            ->where('sesiHariIni.0.guru_pengganti.id', $guruPiket->id)
            ->where('stats.total_terbuka', 1)
            ->where('stats.total_terkunci', 0)
        );

        // Status di dashboard guru setelah polling data
        $guruUpdatedResponse = $this->actingAs($guruPengampu)->get(route('dashboard'));
        $guruUpdatedResponse->assertInertia(fn ($page) => $page
            ->component('Guru/Dashboard')
            ->where('sesiHariIni.0.id', $sesi->id)
            ->where('sesiHariIni.0.status', 'digantikan')
            ->where('sesiHariIni.0.guru_pengganti.id', $guruPiket->id)
            ->where('sesiHariIni.0.guru_pengganti.nama', 'Bapak Budi Guru Piket')
        );

        // LANGKAH 7 (T16 Integrasi T12 -> T10): Guru Piket membuka form absen siswa sebagai guru pengganti
        $piketAbsenIndex = $this->actingAs($guruPiket)->get(route('guru.absen-sesi.index'));
        $piketAbsenIndex->assertRedirect(route('guru.absen-sesi.show', $sesi->id));

        $piketAbsenShow = $this->actingAs($guruPiket)->get(route('guru.absen-sesi.show', $sesi->id));
        $piketAbsenShow->assertStatus(200);
        $piketAbsenShow->assertInertia(fn ($page) => $page
            ->component('Guru/AbsenSiswa/Index')
            ->where('sesi.id', $sesi->id)
            ->where('sesi.guru_pengganti_id', $guruPiket->id)
            ->where('sesi.kelas.nama_kelas', 'VIII-A')
            ->has('siswas', 2)
        );

        // Guru Piket menyimpan presensi siswa sebagai guru pengganti
        $storeAbsenResponse = $this->actingAs($guruPiket)->post(route('guru.absen-sesi.store', $sesi->id), [
            'absen' => [
                ['siswa_id' => $siswaHadir->id, 'status' => 'H', 'catatan' => ''],
                ['siswa_id' => $siswaSakit->id, 'status' => 'S', 'catatan' => 'Sakit demam'],
            ],
            'jurnal_kbm' => 'KBM tetap berjalan kondusif didampingi Guru Piket.',
        ]);
        $storeAbsenResponse->assertSessionHas('success');

        $this->assertDatabaseHas('absen_siswa', [
            'sesi_id' => $sesi->id,
            'siswa_id' => $siswaHadir->id,
            'status' => 'H',
            'dicatat_oleh' => $guruPiket->id,
        ]);

        $absenSakit = AbsenSiswa::where('sesi_id', $sesi->id)
            ->where('siswa_id', $siswaSakit->id)
            ->first();
        $this->assertNotNull($absenSakit);
        $this->assertEquals('S', $absenSakit->status);
        $this->assertEquals($guruPiket->id, $absenSakit->dicatat_oleh);
        $this->assertNotNull($absenSakit->konfirmasi_token);

        // LANGKAH 8: Orang tua membuka halaman konfirmasi token publik (T13)
        $this->get(route('konfirmasi.show', $absenSakit->konfirmasi_token))
            ->assertStatus(200);

        // LANGKAH 9: Kepsek memantau sesi yang digantikan & rekap absensi siswa (Read-Only, T09 & T15)
        $this->actingAs($kepsek)
            ->get(route('dashboard'))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Kepsek/Dashboard')
                ->where('sesiStats.sesi_digantikan', 1)
            );

        $this->actingAs($kepsek)
            ->get(route('kepsek.rekap-absensi.siswa', ['kelas_id' => $kelas->id]))
            ->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('Kepsek/RekapAbsensi/Siswa')
                ->where('ringkasanKelas.total_hadir', 1)
                ->where('ringkasanKelas.total_sakit', 1)
            );

        // Kepsek tidak boleh menyimpan/mengubah absen siswa (Read-Only Strict)
        $this->actingAs($kepsek)
            ->post(route('guru.absen-sesi.store', $sesi->id), [
                'absen' => [
                    ['siswa_id' => $siswaHadir->id, 'status' => 'A', 'catatan' => ''],
                ],
            ])
            ->assertStatus(403);
    }

    public function test_database_seeder_populates_complete_demo_data_for_all_roles(): void
    {
        // Jalankan seeder 2x untuk memastikan idempotensi
        $this->seed(DatabaseSeeder::class);
        $this->seed(DatabaseSeeder::class);

        $this->assertGreaterThanOrEqual(24, Siswa::count());
        $this->assertEquals(4, Kelas::whereHas('tahunAjaran', fn ($q) => $q->where('aktif', true))->count());

        $admin = User::where('username', 'admin')->firstOrFail();
        $guru = User::where('username', 'guru')->firstOrFail();
        $piket = User::where('username', 'gurupiket')->firstOrFail();
        $kepsek = User::where('username', 'kepsek')->firstOrFail();

        // Uji akses end-to-end tiap role menggunakan data hasil seeder
        $this->actingAs($admin)->get(route('dashboard'))->assertOk();
        $this->actingAs($admin)->get(route('admin.rekap-absensi.siswa'))->assertOk();

        $this->actingAs($guru)->get(route('dashboard'))->assertOk();
        $this->actingAs($guru)->get(route('guru.jadwal.index'))->assertOk();
        $sesiGuru = Sesi::where('guru_id', $guru->id)->firstOrFail();
        $this->actingAs($guru)->get(route('guru.absen-sesi.show', $sesiGuru->id))->assertOk();

        $this->actingAs($piket)->get(route('dashboard'))->assertOk();

        $this->actingAs($kepsek)->get(route('dashboard'))->assertOk();
        $this->actingAs($kepsek)->get(route('kepsek.rekap-absensi.siswa'))->assertOk();
    }
}
