<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Table('pengumuman')]
#[Fillable(['judul', 'slug', 'kategori', 'ringkasan', 'isi', 'gambar_path', 'tanggal', 'status', 'is_pinned', 'pinned_at', 'dibuat_oleh'])]
class Pengumuman extends Model
{
    protected function casts(): array
    {
        return [
            'tanggal' => 'date',
        ];
    }

    public function dibuatOleh(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dibuat_oleh');
    }
}
