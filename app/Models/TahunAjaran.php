<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Table('tahun_ajaran')]
#[Fillable(['nama', 'semester', 'tanggal_mulai', 'tanggal_selesai', 'aktif'])]
class TahunAjaran extends Model
{
    protected function casts(): array
    {
        return [
            'tanggal_mulai' => 'date',
            'tanggal_selesai' => 'date',
            'aktif' => 'boolean',
        ];
    }

    public function kelas(): HasMany
    {
        return $this->hasMany(Kelas::class);
    }

    public function piket(): HasMany
    {
        return $this->hasMany(GuruPiket::class);
    }
}
