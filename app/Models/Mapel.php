<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Table('mapel')]
#[Fillable(['kode', 'nama'])]
class Mapel extends Model
{
    public function jadwalSlot(): HasMany
    {
        return $this->hasMany(JadwalSlot::class);
    }

    public function sesi(): HasMany
    {
        return $this->hasMany(Sesi::class);
    }
}
