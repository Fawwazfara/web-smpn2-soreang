<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Table('jam_pelajaran')]
class JamPelajaran extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'jam_ke',
        'mulai',
        'selesai',
        'kelompok_hari',
        'waktu_mulai',
        'waktu_selesai',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array<int, string>
     */
    protected $appends = [
        'waktu_mulai',
        'waktu_selesai',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'jam_ke' => 'integer',
        ];
    }

    /**
     * Interact with the waktu_mulai attribute.
     */
    protected function waktuMulai(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->attributes['mulai'] ?? null,
            set: fn ($value) => ['mulai' => $value],
        );
    }

    /**
     * Interact with the waktu_selesai attribute.
     */
    protected function waktuSelesai(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->attributes['selesai'] ?? null,
            set: fn ($value) => ['selesai' => $value],
        );
    }

    public function jadwalSlot(): HasMany
    {
        return $this->hasMany(JadwalSlot::class, 'jam_pelajaran_id');
    }

    public function sesi(): HasMany
    {
        return $this->hasMany(Sesi::class, 'jam_pelajaran_id');
    }
}
