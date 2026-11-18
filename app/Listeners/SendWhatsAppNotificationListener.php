<?php

namespace App\Listeners;

use App\Events\AbsenSiswaRecorded;
use App\Jobs\SendWhatsAppNotification;

class SendWhatsAppNotificationListener
{
    /**
     * Handle the event.
     */
    public function handle(AbsenSiswaRecorded $event): void
    {
        if (in_array($event->absenSiswa->status, ['A', 'S', 'I'])) {
            SendWhatsAppNotification::dispatch(
                $event->absenSiswa,
                null,
                null,
                null,
                $event->userId
            );
        }
    }
}

