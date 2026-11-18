<?php

namespace App\Events;

use App\Models\AbsenSiswa;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AbsenSiswaRecorded
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public AbsenSiswa $absenSiswa,
        public ?int $userId = null
    ) {}
}

