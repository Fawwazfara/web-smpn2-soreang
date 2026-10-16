<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Table('sesi')]
#[Fillable([
    'tanggal',
    'kelas_id',
    'jam_pelajaran_id',
    'mapel_id',
    'guru_id',
    'guru_pengganti_id',
    'slot_id',
    'status',
    'alasan',
])]
class Sesi extends Model
{
    protected function casts(): array
    {
        return [
            'tanggal' => 'date',
        ];
    }

    public function kelas(): BelongsTo
    {
        return $this->belongsTo(Kelas::class);
    }

    public function jamPelajaran(): BelongsTo
    {
        return $this->belongsTo(JamPelajaran::class);
    }

    public function mapel(): BelongsTo
    {
        return $this->belongsTo(Mapel::class);
    }

    public function guru(): BelongsTo
    {
        return $this->belongsTo(User::class, 'guru_id');
    }

    public function guruPengganti(): BelongsTo
    {
        return $this->belongsTo(User::class, 'guru_pengganti_id');
    }

    public function slot(): BelongsTo
    {
        return $this->belongsTo(JadwalSlot::class, 'slot_id');
    }

    public function absenGuru(): HasMany
    {
        return $this->hasMany(AbsenGuru::class);
    }

    public function absenSiswa(): HasMany
    {
        return $this->hasMany(AbsenSiswa::class);
    }
}
