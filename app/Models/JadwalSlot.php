<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Table('jadwal_slot')]
#[Fillable(['versi_id', 'hari', 'jam_pelajaran_id', 'kelas_id', 'mapel_id', 'guru_id'])]
class JadwalSlot extends Model
{
    protected function casts(): array
    {
        return [
            'hari' => 'integer',
        ];
    }

    public function versi(): BelongsTo
    {
        return $this->belongsTo(JadwalVersi::class, 'versi_id');
    }

    public function jamPelajaran(): BelongsTo
    {
        return $this->belongsTo(JamPelajaran::class);
    }

    public function kelas(): BelongsTo
    {
        return $this->belongsTo(Kelas::class);
    }

    public function mapel(): BelongsTo
    {
        return $this->belongsTo(Mapel::class);
    }

    public function guru(): BelongsTo
    {
        return $this->belongsTo(User::class, 'guru_id');
    }

    public function sesi(): HasMany
    {
        return $this->hasMany(Sesi::class, 'slot_id');
    }
}
