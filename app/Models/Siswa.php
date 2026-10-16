<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Table('siswa')]
#[Fillable(['nis', 'nama', 'kelas_id', 'no_hp_ortu', 'aktif'])]
class Siswa extends Model
{
    protected function casts(): array
    {
        return [
            'aktif' => 'boolean',
        ];
    }

    public function kelas(): BelongsTo
    {
        return $this->belongsTo(Kelas::class);
    }

    public function absenSiswa(): HasMany
    {
        return $this->hasMany(AbsenSiswa::class);
    }
}
