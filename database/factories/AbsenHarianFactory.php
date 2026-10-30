<?php

namespace Database\Factories;

use App\Models\AbsenHarian;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AbsenHarian>
 */
class AbsenHarianFactory extends Factory
{
    protected $model = AbsenHarian::class;

    public function definition(): array
    {
        $waktuMasuk = now('Asia/Jakarta')->setTime(6, 45, 0);

        return [
            'user_id' => User::factory()->state([
                'role' => 'guru',
                'jenis_pegawai' => 'guru',
            ]),
            'tanggal' => $waktuMasuk->toDateString(),
            'waktu_masuk' => $waktuMasuk,
            'waktu_pulang' => null,
            'waktu_ambil' => $waktuMasuk,
            'foto_path' => 'absen-harian/'.$waktuMasuk->toDateString().'/sample-live.jpg',
            'sumber' => 'live',
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Mozilla/5.0',
            'status' => 'tepat waktu',
            'keterangan' => 'Sesi Pagi Reguler',
        ];
    }
}
