<?php

namespace App\Http\Requests;

use App\Models\JamPelajaran;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateJamPelajaranRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'mulai' => $this->input('mulai') ?? $this->input('waktu_mulai'),
            'selesai' => $this->input('selesai') ?? $this->input('waktu_selesai'),
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $jamPelajaran = $this->route('jamPelajaran') ?? $this->route('jam_pelajaran') ?? $this->route('timeSlot') ?? $this->route('time_slot');
        $id = $jamPelajaran instanceof JamPelajaran ? $jamPelajaran->id : $jamPelajaran;

        return [
            'jam_ke' => [
                'required',
                'integer',
                'min:1',
                'max:20',
                Rule::unique('jam_pelajaran')
                    ->where(fn ($q) => $q->where('kelompok_hari', $this->input('kelompok_hari')))
                    ->ignore($id),
            ],
            'mulai' => ['required', 'date_format:H:i'],
            'selesai' => ['required', 'date_format:H:i'],
            'kelompok_hari' => ['required', 'string', Rule::in(['senin-kamis', 'jumat'])],
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $jamPelajaran = $this->route('jamPelajaran') ?? $this->route('jam_pelajaran') ?? $this->route('timeSlot') ?? $this->route('time_slot');
        $jamPelajaranId = $jamPelajaran instanceof JamPelajaran ? $jamPelajaran->id : $jamPelajaran;

        $validator->after(function ($validator) use ($jamPelajaranId) {
            $mulai = $this->input('mulai');
            $selesai = $this->input('selesai');
            $kelompokHari = $this->input('kelompok_hari');

            if ($mulai && $selesai) {
                if ($selesai <= $mulai) {
                    $validator->errors()->add('selesai', 'Waktu selesai harus lebih besar dari waktu mulai.');
                    return;
                }

                if ($kelompokHari) {
                    $overlap = JamPelajaran::query()
                        ->where('kelompok_hari', $kelompokHari)
                        ->when($jamPelajaranId, fn ($q) => $q->where('id', '!=', $jamPelajaranId))
                        ->where(function ($q) use ($mulai, $selesai) {
                            $q->where('mulai', '<', $selesai)
                              ->where('selesai', '>', $mulai);
                        })
                        ->first();

                    if ($overlap) {
                        $validator->errors()->add('mulai', "Slot jam pelajaran tumpang tindih dengan Jam Ke-{$overlap->jam_ke} ({$overlap->mulai} - {$overlap->selesai}).");
                    }
                }
            }
        });
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'jam_ke' => 'jam ke',
            'mulai' => 'waktu mulai',
            'selesai' => 'waktu selesai',
            'kelompok_hari' => 'kelompok hari',
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'jam_ke.unique' => 'Nomor jam ke tersebut sudah ada pada kelompok hari yang dipilih.',
            'jam_ke.required' => 'Nomor jam pelajaran wajib diisi.',
            'mulai.required' => 'Waktu mulai wajib diisi.',
            'mulai.date_format' => 'Format waktu mulai harus JJ:MM (contoh: 07:00).',
            'selesai.required' => 'Waktu selesai wajib diisi.',
            'selesai.date_format' => 'Format waktu selesai harus JJ:MM (contoh: 07:40).',
            'kelompok_hari.required' => 'Kelompok hari wajib dipilih.',
            'kelompok_hari.in' => 'Kelompok hari harus bernilai senin-kamis atau jumat.',
        ];
    }
}
