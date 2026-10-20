<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Table('absen_siswa')]
#[Fillable(['sesi_id', 'siswa_id', 'status', 'catatan', 'bukti_path', 'dicatat_oleh', 'waktu', 'status_konfirmasi', 'konfirmasi_token', 'token_berlaku_sampai', 'bukti_diunggah_pada', 'keterangan_konfirmasi'])]
class AbsenSiswa extends Model
{
    protected function casts(): array
    {
        return [
            'waktu' => 'datetime',
            'token_berlaku_sampai' => 'datetime',
            'bukti_diunggah_pada' => 'datetime',
        ];
    }

    public function sesi(): BelongsTo
    {
        return $this->belongsTo(Sesi::class);
    }

    public function siswa(): BelongsTo
    {
        return $this->belongsTo(Siswa::class);
    }

    public function dicatatOleh(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dicatat_oleh');
    }
}
