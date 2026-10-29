<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Table('mapel')]
class Mapel extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'kode',
        'nama',
        'kelompok_kurikulum',
        'kode_mapel',
        'nama_mapel',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array<int, string>
     */
    protected $appends = [
        'kode_mapel',
        'nama_mapel',
    ];

    /**
     * Interact with the kode_mapel attribute.
     */
    protected function kodeMapel(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->attributes['kode'] ?? null,
            set: fn ($value) => ['kode' => $value],
        );
    }

    /**
     * Interact with the nama_mapel attribute.
     */
    protected function namaMapel(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->attributes['nama'] ?? null,
            set: fn ($value) => ['nama' => $value],
        );
    }

    public function jadwalSlot(): HasMany
    {
        return $this->hasMany(JadwalSlot::class, 'mapel_id');
    }

    public function sesi(): HasMany
    {
        return $this->hasMany(Sesi::class, 'mapel_id');
    }
}
