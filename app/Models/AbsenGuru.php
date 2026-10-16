<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Table('absen_guru')]
#[Fillable([
    'sesi_id',
    'guru_id',
    'waktu',
    'waktu_ambil',
    'foto_path',
    'sumber',
    'ip_address',
    'user_agent',
    'status',
    'catatan',
    'diverifikasi_oleh',
])]
class AbsenGuru extends Model
{
    protected function casts(): array
    {
        return [
            'waktu' => 'datetime',
            'waktu_ambil' => 'datetime',
        ];
    }

    public function sesi(): BelongsTo
    {
        return $this->belongsTo(Sesi::class);
    }

    public function guru(): BelongsTo
    {
        return $this->belongsTo(User::class, 'guru_id');
    }

    public function diverifikasiOleh(): BelongsTo
    {
        return $this->belongsTo(User::class, 'diverifikasi_oleh');
    }
}
