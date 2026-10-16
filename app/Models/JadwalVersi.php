<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Table('jadwal_versi')]
#[Fillable(['nama', 'berlaku_mulai', 'berlaku_sampai', 'status'])]
class JadwalVersi extends Model
{
    protected function casts(): array
    {
        return [
            'berlaku_mulai' => 'date',
            'berlaku_sampai' => 'date',
        ];
    }

    public function jadwalSlot(): HasMany
    {
        return $this->hasMany(JadwalSlot::class, 'versi_id');
    }
}
