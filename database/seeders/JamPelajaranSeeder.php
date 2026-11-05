<?php

namespace Database\Seeders;

use App\Models\JamPelajaran;
use Illuminate\Database\Seeder;

class JamPelajaranSeeder extends Seeder
{
    public function run(): void
    {
        JamPelajaran::query()->delete();

        $data = [
            // ==========================================
            // SESI PAGI
            // ==========================================
            // SENIN (hari=1)
            ['sesi' => 'pagi', 'hari' => 1, 'jam_ke' => 1, 'mulai' => '06:30:00', 'selesai' => '06:55:00', 'jenis_kegiatan' => 'upacara'],
            ['sesi' => 'pagi', 'hari' => 1, 'jam_ke' => 2, 'mulai' => '06:55:00', 'selesai' => '07:20:00', 'jenis_kegiatan' => 'upacara'],
            ['sesi' => 'pagi', 'hari' => 1, 'jam_ke' => 3, 'mulai' => '07:20:00', 'selesai' => '07:50:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'pagi', 'hari' => 1, 'jam_ke' => 4, 'mulai' => '07:50:00', 'selesai' => '08:20:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'pagi', 'hari' => 1, 'jam_ke' => 5, 'mulai' => '08:20:00', 'selesai' => '08:50:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'pagi', 'hari' => 1, 'jam_ke' => 6, 'mulai' => '08:50:00', 'selesai' => '09:15:00', 'jenis_kegiatan' => 'istirahat'],
            ['sesi' => 'pagi', 'hari' => 1, 'jam_ke' => 7, 'mulai' => '09:15:00', 'selesai' => '09:45:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'pagi', 'hari' => 1, 'jam_ke' => 8, 'mulai' => '09:45:00', 'selesai' => '10:15:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'pagi', 'hari' => 1, 'jam_ke' => 9, 'mulai' => '10:15:00', 'selesai' => '10:45:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'pagi', 'hari' => 1, 'jam_ke' => 10, 'mulai' => '10:45:00', 'selesai' => '11:15:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'pagi', 'hari' => 1, 'jam_ke' => 11, 'mulai' => '11:15:00', 'selesai' => '11:45:00', 'jenis_kegiatan' => 'kbm'],

            // SELASA (hari=2)
            ['sesi' => 'pagi', 'hari' => 2, 'jam_ke' => 1, 'mulai' => '06:30:00', 'selesai' => '07:00:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'pagi', 'hari' => 2, 'jam_ke' => 2, 'mulai' => '07:00:00', 'selesai' => '07:30:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'pagi', 'hari' => 2, 'jam_ke' => 3, 'mulai' => '07:30:00', 'selesai' => '08:00:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'pagi', 'hari' => 2, 'jam_ke' => 4, 'mulai' => '08:00:00', 'selesai' => '08:30:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'pagi', 'hari' => 2, 'jam_ke' => 5, 'mulai' => '08:30:00', 'selesai' => '09:00:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'pagi', 'hari' => 2, 'jam_ke' => 6, 'mulai' => '09:00:00', 'selesai' => '09:25:00', 'jenis_kegiatan' => 'istirahat'],
            ['sesi' => 'pagi', 'hari' => 2, 'jam_ke' => 7, 'mulai' => '09:25:00', 'selesai' => '09:55:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'pagi', 'hari' => 2, 'jam_ke' => 8, 'mulai' => '09:55:00', 'selesai' => '10:25:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'pagi', 'hari' => 2, 'jam_ke' => 9, 'mulai' => '10:25:00', 'selesai' => '10:55:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'pagi', 'hari' => 2, 'jam_ke' => 10, 'mulai' => '10:55:00', 'selesai' => '11:25:00', 'jenis_kegiatan' => 'mengaji'],

            // RABU (hari=3)
            ['sesi' => 'pagi', 'hari' => 3, 'jam_ke' => 1, 'mulai' => '06:30:00', 'selesai' => '07:00:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'pagi', 'hari' => 3, 'jam_ke' => 2, 'mulai' => '07:00:00', 'selesai' => '07:30:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'pagi', 'hari' => 3, 'jam_ke' => 3, 'mulai' => '07:30:00', 'selesai' => '08:00:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'pagi', 'hari' => 3, 'jam_ke' => 4, 'mulai' => '08:00:00', 'selesai' => '08:30:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'pagi', 'hari' => 3, 'jam_ke' => 5, 'mulai' => '08:30:00', 'selesai' => '09:00:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'pagi', 'hari' => 3, 'jam_ke' => 6, 'mulai' => '09:00:00', 'selesai' => '09:25:00', 'jenis_kegiatan' => 'istirahat'],
            ['sesi' => 'pagi', 'hari' => 3, 'jam_ke' => 7, 'mulai' => '09:25:00', 'selesai' => '09:55:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'pagi', 'hari' => 3, 'jam_ke' => 8, 'mulai' => '09:55:00', 'selesai' => '10:25:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'pagi', 'hari' => 3, 'jam_ke' => 9, 'mulai' => '10:25:00', 'selesai' => '10:55:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'pagi', 'hari' => 3, 'jam_ke' => 10, 'mulai' => '10:55:00', 'selesai' => '11:55:00', 'jenis_kegiatan' => 'kbm'],

            // KAMIS (hari=4)
            ['sesi' => 'pagi', 'hari' => 4, 'jam_ke' => 1, 'mulai' => '06:30:00', 'selesai' => '07:00:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'pagi', 'hari' => 4, 'jam_ke' => 2, 'mulai' => '07:00:00', 'selesai' => '07:30:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'pagi', 'hari' => 4, 'jam_ke' => 3, 'mulai' => '07:30:00', 'selesai' => '08:00:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'pagi', 'hari' => 4, 'jam_ke' => 4, 'mulai' => '08:00:00', 'selesai' => '08:30:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'pagi', 'hari' => 4, 'jam_ke' => 5, 'mulai' => '08:30:00', 'selesai' => '09:00:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'pagi', 'hari' => 4, 'jam_ke' => 6, 'mulai' => '09:00:00', 'selesai' => '09:25:00', 'jenis_kegiatan' => 'istirahat'],
            ['sesi' => 'pagi', 'hari' => 4, 'jam_ke' => 7, 'mulai' => '09:25:00', 'selesai' => '09:55:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'pagi', 'hari' => 4, 'jam_ke' => 8, 'mulai' => '09:55:00', 'selesai' => '10:25:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'pagi', 'hari' => 4, 'jam_ke' => 9, 'mulai' => '10:25:00', 'selesai' => '10:55:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'pagi', 'hari' => 4, 'jam_ke' => 10, 'mulai' => '10:55:00', 'selesai' => '11:25:00', 'jenis_kegiatan' => 'kbm'],

            // JUMAT (hari=5)
            ['sesi' => 'pagi', 'hari' => 5, 'jam_ke' => 1, 'mulai' => '06:30:00', 'selesai' => '07:00:00', 'jenis_kegiatan' => 'dhuha'],
            ['sesi' => 'pagi', 'hari' => 5, 'jam_ke' => 2, 'mulai' => '07:00:00', 'selesai' => '07:30:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'pagi', 'hari' => 5, 'jam_ke' => 3, 'mulai' => '07:30:00', 'selesai' => '08:00:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'pagi', 'hari' => 5, 'jam_ke' => 4, 'mulai' => '08:00:00', 'selesai' => '08:30:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'pagi', 'hari' => 5, 'jam_ke' => 5, 'mulai' => '08:30:00', 'selesai' => '09:00:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'pagi', 'hari' => 5, 'jam_ke' => 6, 'mulai' => '09:00:00', 'selesai' => '09:25:00', 'jenis_kegiatan' => 'istirahat'],
            ['sesi' => 'pagi', 'hari' => 5, 'jam_ke' => 7, 'mulai' => '09:25:00', 'selesai' => '09:55:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'pagi', 'hari' => 5, 'jam_ke' => 8, 'mulai' => '09:55:00', 'selesai' => '10:25:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'pagi', 'hari' => 5, 'jam_ke' => 9, 'mulai' => '10:25:00', 'selesai' => '10:55:00', 'jenis_kegiatan' => 'kbm'],

            // ==========================================
            // SESI SIANG
            // ==========================================
            // SENIN (hari=1)
            ['sesi' => 'siang', 'hari' => 1, 'jam_ke' => 1, 'mulai' => '12:05:00', 'selesai' => '12:35:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'siang', 'hari' => 1, 'jam_ke' => 2, 'mulai' => '12:35:00', 'selesai' => '13:05:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'siang', 'hari' => 1, 'jam_ke' => 3, 'mulai' => '13:05:00', 'selesai' => '13:35:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'siang', 'hari' => 1, 'jam_ke' => 4, 'mulai' => '13:35:00', 'selesai' => '14:05:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'siang', 'hari' => 1, 'jam_ke' => 5, 'mulai' => '14:05:00', 'selesai' => '14:35:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'siang', 'hari' => 1, 'jam_ke' => 6, 'mulai' => '14:35:00', 'selesai' => '15:05:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'siang', 'hari' => 1, 'jam_ke' => 7, 'mulai' => '15:05:00', 'selesai' => '15:30:00', 'jenis_kegiatan' => 'istirahat'],
            ['sesi' => 'siang', 'hari' => 1, 'jam_ke' => 8, 'mulai' => '15:30:00', 'selesai' => '16:00:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'siang', 'hari' => 1, 'jam_ke' => 9, 'mulai' => '16:00:00', 'selesai' => '16:30:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'siang', 'hari' => 1, 'jam_ke' => 10, 'mulai' => '16:30:00', 'selesai' => '17:00:00', 'jenis_kegiatan' => 'kbm'],

            // SELASA (hari=2)
            ['sesi' => 'siang', 'hari' => 2, 'jam_ke' => 1, 'mulai' => '12:05:00', 'selesai' => '12:35:00', 'jenis_kegiatan' => 'mengaji'],
            ['sesi' => 'siang', 'hari' => 2, 'jam_ke' => 2, 'mulai' => '12:35:00', 'selesai' => '13:05:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'siang', 'hari' => 2, 'jam_ke' => 3, 'mulai' => '13:05:00', 'selesai' => '13:35:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'siang', 'hari' => 2, 'jam_ke' => 4, 'mulai' => '13:35:00', 'selesai' => '14:05:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'siang', 'hari' => 2, 'jam_ke' => 5, 'mulai' => '14:05:00', 'selesai' => '14:35:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'siang', 'hari' => 2, 'jam_ke' => 6, 'mulai' => '14:35:00', 'selesai' => '15:05:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'siang', 'hari' => 2, 'jam_ke' => 7, 'mulai' => '15:05:00', 'selesai' => '15:30:00', 'jenis_kegiatan' => 'istirahat'],
            ['sesi' => 'siang', 'hari' => 2, 'jam_ke' => 8, 'mulai' => '15:30:00', 'selesai' => '16:00:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'siang', 'hari' => 2, 'jam_ke' => 9, 'mulai' => '16:00:00', 'selesai' => '16:30:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'siang', 'hari' => 2, 'jam_ke' => 10, 'mulai' => '16:30:00', 'selesai' => '17:00:00', 'jenis_kegiatan' => 'kbm'],

            // RABU (hari=3) - mulai jam 12:35
            ['sesi' => 'siang', 'hari' => 3, 'jam_ke' => 1, 'mulai' => '12:35:00', 'selesai' => '13:05:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'siang', 'hari' => 3, 'jam_ke' => 2, 'mulai' => '13:05:00', 'selesai' => '13:35:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'siang', 'hari' => 3, 'jam_ke' => 3, 'mulai' => '13:35:00', 'selesai' => '14:05:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'siang', 'hari' => 3, 'jam_ke' => 4, 'mulai' => '14:05:00', 'selesai' => '14:35:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'siang', 'hari' => 3, 'jam_ke' => 5, 'mulai' => '14:35:00', 'selesai' => '15:05:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'siang', 'hari' => 3, 'jam_ke' => 6, 'mulai' => '15:05:00', 'selesai' => '15:30:00', 'jenis_kegiatan' => 'istirahat'],
            ['sesi' => 'siang', 'hari' => 3, 'jam_ke' => 7, 'mulai' => '15:30:00', 'selesai' => '16:00:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'siang', 'hari' => 3, 'jam_ke' => 8, 'mulai' => '16:00:00', 'selesai' => '16:30:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'siang', 'hari' => 3, 'jam_ke' => 9, 'mulai' => '16:30:00', 'selesai' => '17:00:00', 'jenis_kegiatan' => 'kbm'],

            // KAMIS (hari=4) - mulai jam 12:35
            ['sesi' => 'siang', 'hari' => 4, 'jam_ke' => 1, 'mulai' => '12:35:00', 'selesai' => '13:05:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'siang', 'hari' => 4, 'jam_ke' => 2, 'mulai' => '13:05:00', 'selesai' => '13:35:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'siang', 'hari' => 4, 'jam_ke' => 3, 'mulai' => '13:35:00', 'selesai' => '14:05:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'siang', 'hari' => 4, 'jam_ke' => 4, 'mulai' => '14:05:00', 'selesai' => '14:35:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'siang', 'hari' => 4, 'jam_ke' => 5, 'mulai' => '14:35:00', 'selesai' => '15:05:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'siang', 'hari' => 4, 'jam_ke' => 6, 'mulai' => '15:05:00', 'selesai' => '15:30:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'siang', 'hari' => 4, 'jam_ke' => 7, 'mulai' => '15:30:00', 'selesai' => '16:00:00', 'jenis_kegiatan' => 'istirahat'],
            ['sesi' => 'siang', 'hari' => 4, 'jam_ke' => 8, 'mulai' => '16:00:00', 'selesai' => '16:30:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'siang', 'hari' => 4, 'jam_ke' => 9, 'mulai' => '16:30:00', 'selesai' => '17:00:00', 'jenis_kegiatan' => 'kbm'],

            // JUMAT (hari=5)
            ['sesi' => 'siang', 'hari' => 5, 'jam_ke' => 1, 'mulai' => '12:05:00', 'selesai' => '12:35:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'siang', 'hari' => 5, 'jam_ke' => 2, 'mulai' => '12:35:00', 'selesai' => '13:05:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'siang', 'hari' => 5, 'jam_ke' => 3, 'mulai' => '13:05:00', 'selesai' => '13:35:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'siang', 'hari' => 5, 'jam_ke' => 4, 'mulai' => '13:35:00', 'selesai' => '14:05:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'siang', 'hari' => 5, 'jam_ke' => 5, 'mulai' => '14:05:00', 'selesai' => '14:35:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'siang', 'hari' => 5, 'jam_ke' => 6, 'mulai' => '14:35:00', 'selesai' => '15:00:00', 'jenis_kegiatan' => 'istirahat'],
            ['sesi' => 'siang', 'hari' => 5, 'jam_ke' => 7, 'mulai' => '15:00:00', 'selesai' => '15:30:00', 'jenis_kegiatan' => 'istirahat'],
            ['sesi' => 'siang', 'hari' => 5, 'jam_ke' => 8, 'mulai' => '15:30:00', 'selesai' => '16:00:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'siang', 'hari' => 5, 'jam_ke' => 9, 'mulai' => '16:00:00', 'selesai' => '16:30:00', 'jenis_kegiatan' => 'kbm'],
            ['sesi' => 'siang', 'hari' => 5, 'jam_ke' => 10, 'mulai' => '16:30:00', 'selesai' => '17:00:00', 'jenis_kegiatan' => 'kbm'],
        ];

        foreach ($data as $row) {
            JamPelajaran::create($row);
        }

        $this->command->info('Jam Pelajaran seeded: ' . JamPelajaran::count() . ' records (2 sesi x 5 hari)');
    }
}