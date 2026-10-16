<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;

#[Table('hari_libur')]
#[Fillable(['tanggal', 'keterangan'])]
class HariLibur extends Model
{
    protected function casts(): array
    {
        return [
            'tanggal' => 'date',
        ];
    }
}
