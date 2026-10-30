<?php

namespace App\Http\Requests;

use Carbon\Carbon;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreAbsenHarianRequest extends FormRequest
{
    /**
     * @var array{binary: string, extension: string, mime: string}|null
     */
    protected ?array $decodedImage = null;

    public function authorize(): bool
    {
        $user = $this->user();

        return $user !== null && in_array($user->role, ['guru', 'guru_piket'], true);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'foto_capture' => ['required', 'string'],
            'waktu_ambil' => ['required', 'date'],
            'sumber' => ['required', 'string', Rule::in(['live'])],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'akurasi_meter' => ['nullable', 'numeric', 'min:0', 'max:100000'],
            'keterangan' => ['nullable', 'string', 'max:255'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'foto_capture.required' => 'Tangkapan foto kamera live wajib disertakan.',
            'foto_capture.string' => 'Upload file dari galeri tidak diizinkan. Gunakan tangkapan kamera live.',
            'waktu_ambil.required' => 'Waktu pengambilan foto dari perangkat wajib disertakan.',
            'waktu_ambil.date' => 'Format waktu pengambilan foto tidak valid.',
            'sumber.required' => 'Sumber foto wajib berasal dari kamera live.',
            'sumber.in' => 'Sumber foto tidak valid. Upload galeri atau file eksternal ditolak.',
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if (count($this->allFiles()) > 0) {
                    $validator->errors()->add(
                        'foto_capture',
                        'Upload file atau foto dari galeri tidak diizinkan. Gunakan tangkapan kamera live.'
                    );

                    return;
                }

                if ($validator->errors()->isNotEmpty()) {
                    return;
                }

                $rawCapture = (string) $this->input('foto_capture', '');

                if (! preg_match('/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+\/\r\n=]+)$/', $rawCapture, $matches)) {
                    $validator->errors()->add(
                        'foto_capture',
                        'Format tangkapan kamera live tidak valid.'
                    );

                    return;
                }

                $base64Payload = preg_replace('/\s+/', '', $matches[2]) ?? '';
                $binary = base64_decode($base64Payload, true);

                if ($binary === false || strlen($binary) < 32 || strlen($binary) > 5 * 1024 * 1024) {
                    $validator->errors()->add(
                        'foto_capture',
                        'Ukuran atau isi tangkapan foto kamera tidak valid.'
                    );

                    return;
                }

                $imageInfo = @getimagesizefromstring($binary);
                $allowedMimes = [
                    'image/jpeg' => 'jpg',
                    'image/png' => 'png',
                    'image/webp' => 'webp',
                ];

                if (
                    $imageInfo === false
                    || ! isset($imageInfo['mime'], $allowedMimes[$imageInfo['mime']])
                    || $imageInfo[0] < 1
                    || $imageInfo[1] < 1
                ) {
                    $validator->errors()->add(
                        'foto_capture',
                        'Data gambar kamera rusak atau bukan gambar hasil tangkapan kamera yang sah.'
                    );

                    return;
                }

                try {
                    $waktuAmbilUtc = Carbon::parse((string) $this->input('waktu_ambil'))->utc();
                    $nowUtc = Carbon::now('UTC');
                    $ageSeconds = $nowUtc->getTimestamp() - $waktuAmbilUtc->getTimestamp();
                    $maxAge = (int) config('absensi.max_capture_age_seconds', 300);

                    if ($ageSeconds > $maxAge || $ageSeconds < -120) {
                        $validator->errors()->add(
                            'waktu_ambil',
                            'Tangkapan kamera sudah kedaluwarsa. Silakan ambil ulang foto langsung dari kamera.'
                        );

                        return;
                    }
                } catch (\Throwable) {
                    $validator->errors()->add('waktu_ambil', 'Format waktu pengambilan foto tidak valid.');

                    return;
                }

                $this->decodedImage = [
                    'binary' => $binary,
                    'extension' => $allowedMimes[$imageInfo['mime']],
                    'mime' => $imageInfo['mime'],
                ];
            },
        ];
    }

    /**
     * @return array{binary: string, extension: string, mime: string}
     */
    public function decodedCapture(): array
    {
        return $this->decodedImage ?? [
            'binary' => '',
            'extension' => 'jpg',
            'mime' => 'image/jpeg',
        ];
    }
}
