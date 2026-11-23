<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Table('kelas')]
#[Fillable(['nama', 'nama_kelas', 'tingkat', 'tahun_ajaran_id', 'wali_kelas_id'])]
class Kelas extends Model
{
    protected $appends = [
        'nama_kelas',
    ];

    protected function casts(): array
    {
        return [
            'tingkat' => 'integer',
        ];
    }

    protected function namaKelas(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->attributes['nama'] ?? null,
            set: fn ($value) => ['nama' => $value],
        );
    }

    public function tahunAjaran(): BelongsTo
    {
        return $this->belongsTo(TahunAjaran::class);
    }

    public function waliKelas(): BelongsTo
    {
        return $this->belongsTo(User::class, 'wali_kelas_id');
    }

    public function siswa(): HasMany
    {
        return $this->hasMany(Siswa::class);
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
