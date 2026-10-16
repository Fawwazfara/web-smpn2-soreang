<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Table('jam_pelajaran')]
#[Fillable(['jam_ke', 'mulai', 'selesai', 'kelompok_hari'])]
class JamPelajaran extends Model
{
    protected function casts(): array
    {
        return [
            'jam_ke' => 'integer',
        ];
    }

    public function jadwalSlot(): HasMany
    {
        return $this->hasMany(JadwalSlot::class);
    }

    public function sesi(): HasMany
    {
        return $this->hasMany(Sesi::class);
    }
}
