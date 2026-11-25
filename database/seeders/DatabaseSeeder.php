<?php

namespace Database\Seeders;

use App\Models\AbsenHarian;
use App\Models\AbsenSiswa;
use App\Models\GuruPiket;
use App\Models\JadwalSlot;
use App\Models\JadwalVersi;
use App\Models\JamPelajaran;
use App\Models\Kelas;
use App\Models\Mapel;
use App\Models\NotifikasiWa;
use App\Models\Pengumuman;
use App\Models\Sesi;
use App\Models\Siswa;
use App\Models\TahunAjaran;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database with end-to-end demo data for all 4 roles.
     */
    public function run(): void
    {
        $accounts = [
            [
                'username' => 'admin',
                'nama' => 'Hj. Endang S., S.AP',
                'email' => 'admin@smpn2soreang.sch.id',
                'no_wa' => '628112000100',
                'role' => 'admin',
                'jenis_pegawai' => null,
            ],
            [
                'username' => 'guru',
                'nama' => 'Dra. Hj. Nining S., M.Pd.',
                'email' => 'guru@smpn2soreang.sch.id',
                'no_wa' => '6281122334455',
                'role' => 'guru',
                'jenis_pegawai' => 'guru',
            ],
            [
                'username' => '198203142008011002',
                'nama' => 'Ahmad Fauzi, S.Pd., M.Hum.',
                'email' => 'ahmad.fauzi@smpn2soreang.sch.id',
                'no_wa' => '6281223344556',
                'role' => 'guru',
                'jenis_pegawai' => 'guru',
            ],
            [
                'username' => '198507212010012005',
                'nama' => 'Dra. Sri Wahyuni',
                'email' => 'sri.wahyuni@smpn2soreang.sch.id',
                'no_wa' => '6281223344557',
                'role' => 'guru',
                'jenis_pegawai' => 'guru',
            ],
            [
                'username' => '199011082015031003',
                'nama' => 'Rizky Pratama, A.Md.',
                'email' => 'rizky.tendik@smpn2soreang.sch.id',
                'no_wa' => '6281223344558',
                'role' => 'guru',
                'jenis_pegawai' => 'tenaga_kependidikan',
            ],
            [
                'username' => 'gurupiket',
                'nama' => 'Bpk. Budi Santoso, S.Pd.',
                'email' => 'gurupiket@smpn2soreang.sch.id',
                'no_wa' => '6281234567890',
                'role' => 'guru_piket',
                'jenis_pegawai' => null,
            ],
            [
                'username' => '198705192011012008',
                'nama' => 'Siti Nurhaliza, S.Pd.',
                'email' => 'siti.piket@smpn2soreang.sch.id',
                'no_wa' => '6281398765432',
                'role' => 'guru_piket',
                'jenis_pegawai' => null,
            ],
            [
                'username' => 'kepsek',
                'nama' => 'Drs. H. Asep Suryana, M.M.Pd.',
                'email' => 'kepsek@smpn2soreang.sch.id',
                'no_wa' => '628112000999',
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

        $adminUser = User::where('username', 'admin')->first();
        $guruUser = User::where('username', 'guru')->first();
        $guruAhmad = User::where('username', '198203142008011002')->first();
        $guruSri = User::where('username', '198507212010012005')->first();
        $piketUser = User::where('username', 'gurupiket')->first();
        $piketSiti = User::where('username', '198705192011012008')->first();

        TahunAjaran::updateOrCreate(
            ['nama' => '2024/2025', 'semester' => 'Genap'],
            [
                'tanggal_mulai' => '2025-01-06',
                'tanggal_selesai' => '2025-06-21',
                'aktif' => false,
            ],
        );

        $tahunAjaran = TahunAjaran::updateOrCreate(
            ['nama' => '2025/2026', 'semester' => 'Ganjil'],
            [
                'tanggal_mulai' => '2025-07-14',
                'tanggal_selesai' => '2026-12-20',
                'aktif' => true,
            ],
        );

        $kelasData = [
            ['nama' => 'VII-A', 'tingkat' => 7, 'wali' => $guruUser?->id],
            ['nama' => 'VII-B', 'tingkat' => 7, 'wali' => $guruAhmad?->id],
            ['nama' => 'VIII-A', 'tingkat' => 8, 'wali' => $guruSri?->id],
            ['nama' => 'IX-A', 'tingkat' => 9, 'wali' => $guruUser?->id],
        ];

        $kelasModels = [];
        foreach ($kelasData as $kd) {
            $kelasModels[$kd['nama']] = Kelas::updateOrCreate(
                ['nama' => $kd['nama'], 'tahun_ajaran_id' => $tahunAjaran->id],
                [
                    'tingkat' => $kd['tingkat'],
                    'wali_kelas_id' => $kd['wali'],
                ],
            );
        }

        // Seed Siswa per Kelas
        $siswaPerKelas = [
            'VII-A' => [
                ['nis' => '2507001', 'nama' => 'Aditya Pratama Putra', 'no_hp_ortu' => '628121000001'],
                ['nis' => '2507002', 'nama' => 'Aisyah Putri Ramadhani', 'no_hp_ortu' => '628121000002'],
                ['nis' => '2507003', 'nama' => 'Bagas Dwi Saputra', 'no_hp_ortu' => '628121000003'],
                ['nis' => '2507004', 'nama' => 'Citra Lestari Ningsih', 'no_hp_ortu' => '628121000004'],
                ['nis' => '2507005', 'nama' => 'Dimas Arya Nugraha', 'no_hp_ortu' => '628121000005'],
                ['nis' => '2507006', 'nama' => 'Fajar Siddiq Maulana', 'no_hp_ortu' => '628121000006'],
            ],
            'VII-B' => [
                ['nis' => '2507007', 'nama' => 'Gita Permata Sari', 'no_hp_ortu' => '628121000007'],
                ['nis' => '2507008', 'nama' => 'Hafiz Abdurrahman', 'no_hp_ortu' => '628121000008'],
                ['nis' => '2507009', 'nama' => 'Indah Kusuma Wardhani', 'no_hp_ortu' => '628121000009'],
                ['nis' => '2507010', 'nama' => 'Kelvin Saputra Wijaya', 'no_hp_ortu' => '628121000010'],
                ['nis' => '2507011', 'nama' => 'Luthfi Hakim Alfarizi', 'no_hp_ortu' => '628121000011'],
                ['nis' => '2507012', 'nama' => 'Meylani Putri Azhari', 'no_hp_ortu' => '628121000012'],
            ],
            'VIII-A' => [
                ['nis' => '2408001', 'nama' => 'Naufal Dzaki Kurniawan', 'no_hp_ortu' => '628121000013'],
                ['nis' => '2408002', 'nama' => 'Putri Amelia Zahra', 'no_hp_ortu' => '628121000014'],
                ['nis' => '2408003', 'nama' => 'Rafi Ahmad Hidayat', 'no_hp_ortu' => '628121000015'],
                ['nis' => '2408004', 'nama' => 'Salmaadia Nurul Aini', 'no_hp_ortu' => '628121000016'],
                ['nis' => '2408005', 'nama' => 'Taufik Hidayatullah', 'no_hp_ortu' => '628121000017'],
                ['nis' => '2408006', 'nama' => 'Vina Panduwinata Setiawan', 'no_hp_ortu' => '628121000018'],
            ],
            'IX-A' => [
                ['nis' => '2309001', 'nama' => 'Muhammad Rayhan Pratama', 'no_hp_ortu' => '628121000019'],
                ['nis' => '2309002', 'nama' => 'Siti Aisyah Humaira', 'no_hp_ortu' => '628121000020'],
                ['nis' => '2309003', 'nama' => 'Reza Rahadian Putra', 'no_hp_ortu' => '628121000021'],
                ['nis' => '2309004', 'nama' => 'Nadya Shafira Azzahra', 'no_hp_ortu' => '628121000022'],
                ['nis' => '2309005', 'nama' => 'Zidan Alamsyah', 'no_hp_ortu' => '628121000023'],
                ['nis' => '2309006', 'nama' => 'Tiara Andini Kusumah', 'no_hp_ortu' => '628121000024'],
            ],
        ];

        foreach ($siswaPerKelas as $namaKelas => $daftarSiswa) {
            $kelasModel = $kelasModels[$namaKelas] ?? null;
            if (! $kelasModel) {
                continue;
            }
            foreach ($daftarSiswa as $sData) {
                Siswa::updateOrCreate(
                    ['nis' => $sData['nis']],
                    [
                        'nama' => $sData['nama'],
                        'kelas_id' => $kelasModel->id,
                        'no_hp_ortu' => $sData['no_hp_ortu'],
                        'aktif' => true,
                    ],
                );
            }
        }

        $mapelData = [
            ['kode' => 'MAT', 'nama' => 'Matematika', 'kelompok_kurikulum' => 'Umum'],
            ['kode' => 'IPA', 'nama' => 'Ilmu Pengetahuan Alam', 'kelompok_kurikulum' => 'Umum'],
            ['kode' => 'BIN', 'nama' => 'Bahasa Indonesia', 'kelompok_kurikulum' => 'Umum'],
            ['kode' => 'IPS', 'nama' => 'Ilmu Pengetahuan Sosial', 'kelompok_kurikulum' => 'Umum'],
            ['kode' => 'ING', 'nama' => 'Bahasa Inggris', 'kelompok_kurikulum' => 'Umum'],
        ];

        $mapelModels = [];
        foreach ($mapelData as $md) {
            $mapelModels[$md['kode']] = Mapel::updateOrCreate(
                ['kode' => $md['kode']],
                [
                    'nama' => $md['nama'],
                    'kelompok_kurikulum' => $md['kelompok_kurikulum'],
                ],
            );
        }

        $jamData = [
            ['jam_ke' => 1, 'mulai' => '07:00:00', 'selesai' => '08:30:00', 'kelompok_hari' => 'senin-kamis'],
            ['jam_ke' => 2, 'mulai' => '08:30:00', 'selesai' => '10:00:00', 'kelompok_hari' => 'senin-kamis'],
            ['jam_ke' => 3, 'mulai' => '10:15:00', 'selesai' => '11:45:00', 'kelompok_hari' => 'senin-kamis'],
            ['jam_ke' => 4, 'mulai' => '12:30:00', 'selesai' => '14:30:00', 'kelompok_hari' => 'senin-kamis'],
        ];

        $jamModels = [];
        foreach ($jamData as $jd) {
            $jamModels[$jd['jam_ke']] = JamPelajaran::updateOrCreate(
                [
                    'sesi' => 'pagi',
                    'hari' => 1,
                    'jam_ke' => $jd['jam_ke'],
                ],
                [
                    'mulai' => $jd['mulai'],
                    'selesai' => $jd['selesai'],
                    'kelompok_hari' => $jd['kelompok_hari'],
                    'jenis_kegiatan' => 'kbm',
                ],
            );
        }

        if ($piketUser) {
            for ($hari = 1; $hari <= 5; $hari++) {
                GuruPiket::updateOrCreate([
                    'tahun_ajaran_id' => $tahunAjaran->id,
                    'hari' => $hari,
                    'user_id' => $piketUser->id,
                ]);
            }
        }

        if ($piketSiti) {
            foreach ([1, 3, 5] as $hari) {
                GuruPiket::updateOrCreate([
                    'tahun_ajaran_id' => $tahunAjaran->id,
                    'hari' => $hari,
                    'user_id' => $piketSiti->id,
                ]);
            }
        }

        $jadwalVersi = JadwalVersi::updateOrCreate(
            ['nama' => 'Jadwal Reguler Semester Ganjil'],
            [
                'berlaku_mulai' => '2025-07-14',
                'berlaku_sampai' => '2026-12-20',
                'status' => 'aktif',
            ],
        );

        $todayDate = Carbon::today()->toDateString();
        $todayIso = min(5, max(1, Carbon::now()->dayOfWeekIso));

        if ($guruUser) {
            $slotConfigs = [
                ['kelas' => 'VII-A', 'jam_ke' => 1, 'mapel' => 'MAT', 'guru' => $guruUser->id],
                ['kelas' => 'VII-B', 'jam_ke' => 2, 'mapel' => 'MAT', 'guru' => $guruUser->id],
                ['kelas' => 'VIII-A', 'jam_ke' => 3, 'mapel' => 'IPA', 'guru' => $guruUser->id],
                ['kelas' => 'IX-A', 'jam_ke' => 4, 'mapel' => 'BIN', 'guru' => $guruUser->id],
            ];

            for ($hari = 1; $hari <= 5; $hari++) {
                foreach ($slotConfigs as $cfg) {
                    JadwalSlot::updateOrCreate(
                        [
                            'versi_id' => $jadwalVersi->id,
                            'hari' => $hari,
                            'kelas_id' => $kelasModels[$cfg['kelas']]->id,
                            'jam_pelajaran_id' => $jamModels[$cfg['jam_ke']]->id,
                        ],
                        [
                            'mapel_id' => $mapelModels[$cfg['mapel']]->id,
                            'guru_id' => $cfg['guru'],
                        ],
                    );
                }
            }

            foreach ($slotConfigs as $cfg) {
                $slot = JadwalSlot::where('versi_id', $jadwalVersi->id)
                    ->where('hari', $todayIso)
                    ->where('kelas_id', $kelasModels[$cfg['kelas']]->id)
                    ->where('jam_pelajaran_id', $jamModels[$cfg['jam_ke']]->id)
                    ->first();

                $existingSesi = Sesi::query()
                    ->whereDate('tanggal', $todayDate)
                    ->where('kelas_id', $kelasModels[$cfg['kelas']]->id)
                    ->where('jam_pelajaran_id', $jamModels[$cfg['jam_ke']]->id)
                    ->first();

                if (! $existingSesi) {
                    Sesi::create([
                        'tanggal' => $todayDate,
                        'kelas_id' => $kelasModels[$cfg['kelas']]->id,
                        'jam_pelajaran_id' => $jamModels[$cfg['jam_ke']]->id,
                        'mapel_id' => $mapelModels[$cfg['mapel']]->id,
                        'guru_id' => $cfg['guru'],
                        'slot_id' => $slot?->id,
                        'status' => 'terjadwal',
                    ]);
                }
            }
        }

        // Seed Absen Harian Demo untuk hari ini
        $absenHarianDemos = [
            ['user' => $guruUser, 'jam' => '06:52:00', 'status' => 'tepat waktu', 'ket' => 'Kamera Live Terverifikasi'],
            ['user' => $guruAhmad, 'jam' => '06:58:00', 'status' => 'tepat waktu', 'ket' => 'Kamera Live Terverifikasi'],
            ['user' => $guruSri, 'jam' => '07:22:00', 'status' => 'terlambat', 'ket' => 'Kamera Live Terverifikasi'],
            ['user' => $piketUser, 'jam' => '06:45:00', 'status' => 'tepat waktu', 'ket' => 'Petugas Piket Siaga'],
        ];

        foreach ($absenHarianDemos as $demo) {
            if (! $demo['user']) {
                continue;
            }
            $existsAbsen = AbsenHarian::query()
                ->where('user_id', $demo['user']->id)
                ->whereDate('tanggal', $todayDate)
                ->exists();

            if (! $existsAbsen) {
                $waktuMasuk = Carbon::parse("{$todayDate} {$demo['jam']}");
                AbsenHarian::create([
                    'user_id' => $demo['user']->id,
                    'tanggal' => $todayDate,
                    'waktu_masuk' => $waktuMasuk,
                    'waktu_ambil' => $waktuMasuk,
                    'foto_path' => 'demo/selfie-terverifikasi.jpg',
                    'sumber' => 'live',
                    'ip_address' => '127.0.0.1',
                    'user_agent' => 'SISADA-DemoSeeder/1.0',
                    'status' => $demo['status'],
                    'keterangan' => $demo['ket'],
                ]);
            }
        }

        // Seed Sample Absen Siswa & Notifikasi WA pada Sesi Pertama Kelas VII-A
        $sesiPertama = Sesi::query()
            ->whereDate('tanggal', $todayDate)
            ->where('kelas_id', $kelasModels['VII-A']->id)
            ->first();

        if ($sesiPertama && $guruUser) {
            $siswaViiA = Siswa::where('kelas_id', $kelasModels['VII-A']->id)->orderBy('nis')->get();
            $sampleStatuses = ['H', 'H', 'H', 'S', 'I', 'A'];

            foreach ($siswaViiA as $idx => $siswa) {
                $st = $sampleStatuses[$idx] ?? 'H';
                $isSI = in_array($st, ['S', 'I'], true);
                $token = $isSI ? 'demo-token-konfirmasi-'.$siswa->nis.'-'.substr(md5($siswa->nis), 0, 12) : null;

                $absenRecord = AbsenSiswa::updateOrCreate(
                    [
                        'sesi_id' => $sesiPertama->id,
                        'siswa_id' => $siswa->id,
                    ],
                    [
                        'status' => $st,
                        'catatan' => $st === 'S' ? 'Demam tinggi (menunggu surat dokter)' : ($st === 'I' ? 'Izin kegiatan keluarga' : ($st === 'A' ? 'Tanpa keterangan' : null)),
                        'dicatat_oleh' => $guruUser->id,
                        'waktu' => Carbon::now(),
                        'status_konfirmasi' => $isSI ? 'menunggu' : 'tidak perlu',
                        'konfirmasi_token' => $token,
                        'token_berlaku_sampai' => $isSI ? Carbon::now()->addDays(7) : null,
                    ],
                );

                if (in_array($st, ['S', 'I', 'A'], true)) {
                    $tipeMap = ['S' => 'sakit', 'I' => 'izin', 'A' => 'alfa'];
                    NotifikasiWa::updateOrCreate(
                        [
                            'siswa_id' => $siswa->id,
                            'absen_siswa_id' => $absenRecord->id,
                        ],
                        [
                            'user_id' => $guruUser->id,
                            'tujuan' => $siswa->no_hp_ortu,
                            'tipe' => $tipeMap[$st],
                            'pesan' => "Informasi Presensi SMPN 2 Soreang: Ananda {$siswa->nama} tercatat berstatus {$st} pada sesi hari ini.",
                            'status' => 'terkirim',
                            'provider' => 'fonnte',
                            'provider_message_id' => 'demo-fonnte-'.$siswa->nis,
                            'waktu' => Carbon::now(),
                        ],
                    );
                }
            }
        }

        $articles = [
            [
                'judul' => 'Siswa SMPN 2 Soreang Raih Medali Emas Olimpiade Sains Nasional (OSN) Tingkat Jawa Barat 2025',
                'slug' => 'siswa-smpn-2-soreang-raih-medali-emas-osn-jabar-2025',
                'kategori' => 'Prestasi Siswa',
                'ringkasan' => 'Prestasi membanggakan kembali dipersembahkan oleh ananda Muhammad Rayhan (Kelas 9-A) dan Siti Aisyah (Kelas 9-D) yang berhasil menyabet gelar Juara 1 OSN Bidang IPA Terpadu dan Matematika. Keduanya resmi melaju sebagai perwakilan daerah ke ajang tingkat Nasional.',
                'isi' => "Prestasi membanggakan kembali dipersembahkan oleh ananda Muhammad Rayhan (Kelas 9-A) dan Siti Aisyah (Kelas 9-D) yang berhasil menyabet gelar Juara 1 OSN Bidang IPA Terpadu dan Matematika tingkat Jawa Barat tahun 2025.\n\nKeberhasilan ini merupakan buah dari kerja keras, bimbingan intensif dewan guru pembina olimpiade sains, serta doa dan dukungan seluruh civitas akademika SMP Negeri 2 Soreang. Keduanya resmi melaju sebagai perwakilan daerah Jawa Barat ke ajang tingkat Nasional yang akan diselenggarakan akhir tahun ini.",
                'tanggal' => '2025-11-18',
                'status' => 'terbit',
                'is_pinned' => true,
                'pinned_at' => Carbon::parse('2025-11-18 08:00:00'),
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
                'is_pinned' => true,
                'pinned_at' => Carbon::parse('2025-11-14 09:00:00'),
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
                'is_pinned' => false,
                'pinned_at' => null,
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
                'is_pinned' => false,
                'pinned_at' => null,
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
                'is_pinned' => false,
                'pinned_at' => null,
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
