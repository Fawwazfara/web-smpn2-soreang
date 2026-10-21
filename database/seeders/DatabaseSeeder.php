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
    }
}
