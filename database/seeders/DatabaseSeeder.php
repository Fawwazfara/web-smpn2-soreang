<?php

namespace Database\Seeders;

use App\Models\Pengumuman;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $accounts = [
            [
                'username' => 'admin',
                'nama' => 'Administrator',
                'email' => 'admin@smpn2soreang.sch.id',
                'no_wa' => null,
                'role' => 'admin',
                'jenis_pegawai' => null,
            ],
            [
                'username' => 'guru',
                'nama' => 'Guru Biasa',
                'email' => 'guru@smpn2soreang.sch.id',
                'no_wa' => null,
                'role' => 'guru',
                'jenis_pegawai' => 'guru',
            ],
            [
                'username' => 'gurupiket',
                'nama' => 'Guru Piket',
                'email' => 'gurupiket@smpn2soreang.sch.id',
                'no_wa' => '6281234567890',
                'role' => 'guru_piket',
                'jenis_pegawai' => null,
            ],
            [
                'username' => 'kepsek',
                'nama' => 'Kepala Sekolah',
                'email' => 'kepsek@smpn2soreang.sch.id',
                'no_wa' => null,
                'role' => 'kepsek',
                'jenis_pegawai' => null,
            ],
        ];

        foreach ($accounts as $account) {
            User::updateOrCreate(
                ['username' => $account['username']],
                [
                    'nama' => $account['nama'],
                    'email' => $account['email'],
                    'no_wa' => $account['no_wa'],
                    'role' => $account['role'],
                    'jenis_pegawai' => $account['jenis_pegawai'],
                    'password' => 'password',
                    'wajib_ganti_password' => false,
                    'aktif' => true,
                ],
            );
        }

        $adminUser = User::where('role', 'admin')->first();

        $articles = [
            [
                'judul' => 'Siswa SMPN 2 Soreang Raih Medali Emas Olimpiade Sains Nasional (OSN) Tingkat Jawa Barat 2025',
                'slug' => 'siswa-smpn-2-soreang-raih-medali-emas-osn-jabar-2025',
                'kategori' => 'Prestasi Siswa',
                'ringkasan' => 'Prestasi membanggakan kembali dipersembahkan oleh ananda Muhammad Rayhan (Kelas 9-A) dan Siti Aisyah (Kelas 9-D) yang berhasil menyabet gelar Juara 1 OSN Bidang IPA Terpadu dan Matematika. Keduanya resmi melaju sebagai perwakilan daerah ke ajang tingkat Nasional.',
                'isi' => "Prestasi membanggakan kembali dipersembahkan oleh ananda Muhammad Rayhan (Kelas 9-A) dan Siti Aisyah (Kelas 9-D) yang berhasil menyabet gelar Juara 1 OSN Bidang IPA Terpadu dan Matematika tingkat Jawa Barat tahun 2025.\n\nKeberhasilan ini merupakan buah dari kerja keras, bimbingan intensif dewan guru pembina olimpiade sains, serta doa dan dukungan seluruh civitas akademika SMP Negeri 2 Soreang. Keduanya resmi melaju sebagai perwakilan daerah Jawa Barat ke ajang tingkat Nasional yang akan diselenggarakan akhir tahun ini.",
                'tanggal' => '2025-11-18',
                'status' => 'terbit',
                'gambar_path' => 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=80',
                'dibuat_oleh' => $adminUser?->id,
            ],
            [
                'judul' => 'Peluncuran Sistem Presensi Digital Geofencing & Face Verification untuk Seluruh Civitas Akademika',
                'slug' => 'peluncuran-sistem-presensi-digital-geofencing-face-verification',
                'kategori' => 'Inovasi Sekolah',
                'ringkasan' => 'Mengoptimalkan akuntabilitas kehadiran guru dan siswa dengan fitur live-kamera serta verifikasi kode unik pengganti dari guru piket saat berhalangan hadir.',
                'isi' => "Dalam rangka mewujudkan tatakelola sekolah yang modern dan transparan, SMP Negeri 2 Soreang secara resmi meluncurkan Sistem Presensi Digital Terpadu berbasis Geofencing dan Face Verification.\n\nSistem ini memastikan ketepatan absensi harian guru dan staf tanpa opsi upload galeri serta memudahkan pelaporan presensi berkala secara akurat.",
                'tanggal' => '2025-11-14',
                'status' => 'terbit',
                'gambar_path' => 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
                'dibuat_oleh' => $adminUser?->id,
            ],
            [
                'judul' => 'Jadwal Pelaksanaan Penilaian Akhir Semester (PAS) Genap T.A. 2024/2025',
                'slug' => 'jadwal-pelaksanaan-penilaian-akhir-semester-pas-genap',
                'kategori' => 'Agenda Akademik',
                'ringkasan' => 'Diberitahukan kepada seluruh siswa kelas 7, 8, dan 9 untuk mempersiapkan tata tertib pendukung protokol CBT di lab komputer sekolah.',
                'isi' => "Penilaian Akhir Semester (PAS) Genap Tahun Ajaran 2024/2025 akan diselenggarakan berbasis Computer Based Test (CBT) di laboratorium komputer sekolah.\n\nSeluruh siswa diharapkan memperhatikan jadwal sesi masing-masing dan mematuhi tata tertib pelaksanaan ujian.",
                'tanggal' => '2025-11-10',
                'status' => 'terbit',
                'gambar_path' => 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
                'dibuat_oleh' => $adminUser?->id,
            ],
            [
                'judul' => 'Pembiasaan Shalat Dhuha Berjamaah & Literasi Al-Qur\'an Jumat Berkah',
                'slug' => 'pembiasaan-shalat-dhuha-berjamaah-dan-literasi-al-quran',
                'kategori' => 'Kegiatan & Religi',
                'ringkasan' => 'Membangun karakter spiritualitas siswa melalui pembiasaan ibadah rutin bersama para guru pengajar dan pembina OSIS di selasar koridor utama.',
                'isi' => "Sebagai wujud pembentukan budi pekerti dan karakter religius, kegiatan Shalat Dhuha berjamaah dan tadarus Al-Qur'an diadakan setiap Jumat pagi.\n\nKegiatan ini diikuti oleh seluruh siswa dan dewan guru dengan khidmat sebelum kegiatan belajar mengajar dimulai.",
                'tanggal' => '2025-11-07',
                'status' => 'terbit',
                'gambar_path' => 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=800&q=80',
                'dibuat_oleh' => $adminUser?->id,
            ],
            [
                'judul' => 'Rencana Pembangunan Ruang Terbuka Hijau & Pojok Baca Taman Sekolah',
                'slug' => 'rencana-pembangunan-ruang-terbuka-hijau-pojok-baca',
                'kategori' => 'Fasilitas',
                'ringkasan' => 'Draf proposal peremajaan area taman belakang untuk pojok baca luar ruangan siswa.',
                'isi' => "Proposal penataan ruang terbuka hijau dan gazebo literasi sekolah saat ini masih dalam tahap penyusunan dan peninjauan komite sekolah.",
                'tanggal' => '2025-11-20',
                'status' => 'draf',
                'gambar_path' => 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
                'dibuat_oleh' => $adminUser?->id,
            ],
        ];

        foreach ($articles as $article) {
            Pengumuman::updateOrCreate(
                ['slug' => $article['slug']],
                $article,
            );
        }
    }
}
