<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FonnteService implements WhatsAppServiceInterface
{
    protected string $token;
    protected string $url;

    public function __construct(?string $token = null, ?string $url = null)
    {
        $this->token = (string) ($token ?? config('services.fonnte.token') ?? env('FONNTE_TOKEN', ''));
        $this->url = (string) ($url ?? config('services.fonnte.url') ?? env('FONNTE_URL', 'https://api.fonnte.com/send'));
    }

    /**
     * Kirim pesan WhatsApp melalui Fonnte Gateway.
     *
     * @param string $target Nomor tujuan
     * @param string $message Isi pesan
     * @return array
     */
    public function send(string $target, string $message): array
    {
        return $this->sendMessage($target, $message);
    }

    /**
     * Kirim pesan WhatsApp melalui Fonnte Gateway.
     *
     * @param string $target Nomor tujuan
     * @param string $message Isi pesan
     * @return array
     */
    public function sendMessage(string $target, string $message): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => $this->token,
            ])->timeout(15)->post($this->url, [
                'target' => $target,
                'message' => $message,
                'countryCode' => '62',
            ]);

            $json = $response->json();
            $isSuccess = $response->successful() && (
                ($json['status'] ?? false) === true ||
                ($json['status'] ?? false) === 'true'
            );

            $messageId = null;
            if (isset($json['id'])) {
                $messageId = is_array($json['id']) ? ($json['id'][0] ?? null) : $json['id'];
            }

            return [
                'success' => $isSuccess,
                'status_code' => $response->status(),
                'message_id' => $messageId ? (string) $messageId : null,
                'response_payload' => $json ?? ['raw' => $response->body()],
            ];
        } catch (\Throwable $e) {
            Log::error('FonnteService error: ' . $e->getMessage());

            return [
                'success' => false,
                'status_code' => 500,
                'message_id' => null,
                'response_payload' => ['error' => $e->getMessage()],
            ];
        }
    }

    public function getToken(): string
    {
        return $this->token;
    }

    public function getUrl(): string
    {
        return $this->url;
    }
}

