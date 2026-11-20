<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Table('notifikasi_wa')]
class NotifikasiWa extends Model
{
    use HasFactory;

    protected $fillable = [
        'siswa_id',
        'absen_siswa_id',
        'user_id',
        'tujuan',
        'no_wa',
        'tipe',
        'jenis_pesan',
        'pesan',
        'isi_pesan',
        'status',
        'status_delivery',
        'provider',
        'provider_message_id',
        'response_payload',
        'waktu',
    ];

    protected function casts(): array
    {
        return [
            'waktu' => 'datetime',
            'response_payload' => 'array',
        ];
    }

    public function siswa(): BelongsTo
    {
        return $this->belongsTo(Siswa::class);
    }

    public function absenSiswa(): BelongsTo
    {
        return $this->belongsTo(AbsenSiswa::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    protected function noWa(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => $value ?? ($this->attributes['tujuan'] ?? null),
            set: fn ($value) => [
                'no_wa' => $value,
                'tujuan' => $this->attributes['tujuan'] ?? $value,
            ]
        );
    }

    protected function tujuan(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => $value ?? ($this->attributes['no_wa'] ?? null),
            set: fn ($value) => [
                'tujuan' => $value,
                'no_wa' => $this->attributes['no_wa'] ?? $value,
            ]
        );
    }

    protected function jenisPesan(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => $value ?? ($this->attributes['tipe'] ?? null),
            set: fn ($value) => [
                'jenis_pesan' => $value,
                'tipe' => $this->attributes['tipe'] ?? $value,
            ]
        );
    }

    protected function tipe(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => $value ?? ($this->attributes['jenis_pesan'] ?? null),
            set: fn ($value) => [
                'tipe' => $value,
                'jenis_pesan' => $this->attributes['jenis_pesan'] ?? $value,
            ]
        );
    }

    protected function isiPesan(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => $value ?? ($this->attributes['pesan'] ?? null),
            set: fn ($value) => [
                'isi_pesan' => $value,
                'pesan' => $this->attributes['pesan'] ?? $value,
            ]
        );
    }

    protected function pesan(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => $value ?? ($this->attributes['isi_pesan'] ?? null),
            set: fn ($value) => [
                'pesan' => $value,
                'isi_pesan' => $this->attributes['isi_pesan'] ?? $value,
            ]
        );
    }

    protected function statusDelivery(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => $value ?? ($this->attributes['status'] ?? null),
            set: fn ($value) => [
                'status_delivery' => $value,
                'status' => $this->attributes['status'] ?? $value,
            ]
        );
    }

    protected function status(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => $value ?? ($this->attributes['status_delivery'] ?? null),
            set: fn ($value) => [
                'status' => $value,
                'status_delivery' => $this->attributes['status_delivery'] ?? $value,
            ]
        );
    }
}

