<?php

namespace App\Models;

use Database\Factories\AbsenHarianFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Table('absen_harian')]
#[Fillable([
    'user_id',
    'tanggal',
    'waktu_masuk',
    'waktu_pulang',
    'waktu_ambil',
    'foto_path',
    'sumber',
    'ip_address',
    'user_agent',
    'status',
    'keterangan',
])]
class AbsenHarian extends Model
{
    /** @use HasFactory<AbsenHarianFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'tanggal' => 'date',
            'waktu_masuk' => 'datetime',
            'waktu_pulang' => 'datetime',
            'waktu_ambil' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
