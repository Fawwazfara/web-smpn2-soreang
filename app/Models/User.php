<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable([
    'username',
    'nama',
    'email',
    'no_wa',
    'password',
    'role',
    'jenis_pegawai',
    'wajib_ganti_password',
    'aktif',
])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, mixed>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'wajib_ganti_password' => 'boolean',
            'aktif' => 'boolean',
        ];
    }

    public function piket(): HasMany
    {
        return $this->hasMany(GuruPiket::class);
    }

    public function kelasDiwali(): HasMany
    {
        return $this->hasMany(Kelas::class, 'wali_kelas_id');
    }

    public function jadwalSlot(): HasMany
    {
        return $this->hasMany(JadwalSlot::class, 'guru_id');
    }

    public function sesiTerjadwal(): HasMany
    {
        return $this->hasMany(Sesi::class, 'guru_id');
    }

    public function sesiPengganti(): HasMany
    {
        return $this->hasMany(Sesi::class, 'guru_pengganti_id');
    }

    public function absenGuru(): HasMany
    {
        return $this->hasMany(AbsenGuru::class, 'guru_id');
    }

    public function pengumuman(): HasMany
    {
        return $this->hasMany(Pengumuman::class, 'dibuat_oleh');
    }

    public function auditLog(): HasMany
    {
        return $this->hasMany(AuditLog::class, 'user_id');
    }
}
