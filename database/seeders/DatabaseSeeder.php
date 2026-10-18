<?php

namespace Database\Seeders;

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
                'role' => 'admin',
                'jenis_pegawai' => null,
            ],
            [
                'username' => 'guru',
                'nama' => 'Guru Biasa',
                'email' => 'guru@smpn2soreang.sch.id',
                'role' => 'guru',
                'jenis_pegawai' => 'guru',
            ],
            [
                'username' => 'gurupiket',
                'nama' => 'Guru Piket',
                'email' => 'gurupiket@smpn2soreang.sch.id',
                'role' => 'guru_piket',
                'jenis_pegawai' => null,
            ],
            [
                'username' => 'kepsek',
                'nama' => 'Kepala Sekolah',
                'email' => 'kepsek@smpn2soreang.sch.id',
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
                    'role' => $account['role'],
                    'jenis_pegawai' => $account['jenis_pegawai'],
                    'password' => 'password',
                    'wajib_ganti_password' => false,
                    'aktif' => true,
                ],
            );
        }
    }
}
