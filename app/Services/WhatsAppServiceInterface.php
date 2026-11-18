<?php

namespace App\Services;

interface WhatsAppServiceInterface
{
    /**
     * Send a WhatsApp message to a target number.
     *
     * @param string $target Target phone number
     * @param string $message Message text
     * @return array
     */
    public function sendMessage(string $target, string $message): array;
}

