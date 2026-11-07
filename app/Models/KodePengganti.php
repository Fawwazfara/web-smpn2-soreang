<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Table('kode_pengganti')]
#[Fillable([
    'sesi_id',
    'kode',
    'dibuat_oleh',
    'diklaim_oleh',
    'berlaku_sampai',
    'diklaim_pada',
    'status',
])]
class KodePengganti extends Model
{
    protected function casts(): array
    {
        return [
            'berlaku_sampai' => 'datetime',
            'diklaim_pada' => 'datetime',
        ];
    }

    public function sesi(): BelongsTo
    {
        return $this->belongsTo(Sesi::class);
    }

    public function pembuat(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dibuat_oleh');
    }

    public function pengklaim(): BelongsTo
    {
        return $this->belongsTo(User::class, 'diklaim_oleh');
    }
}

