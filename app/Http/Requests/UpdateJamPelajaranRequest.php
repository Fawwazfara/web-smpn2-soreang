<?php

namespace App\Http\Requests;

use App\Models\JamPelajaran;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateJamPelajaranRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $jamPelajaran = $this->route('jamPelajaran') ?? $this->route('jam_pelajaran') ?? $this->route('timeSlot') ?? $this->route('time_slot');
        $model = $jamPelajaran instanceof JamPelajaran ? $jamPelajaran : JamPelajaran::find($jamPelajaran);

        $kelompokHari = $this->input('kelompok_hari');
        $defaultHari = ($kelompokHari === 'jumat') ? 5 : ($model?->hari ?? 1);

        $this->merge([
            'mulai' => $this->input('mulai') ?? $this->input('waktu_mulai'),
            'selesai' => $this->input('selesai') ?? $this->input('waktu_selesai'),
            'sesi' => $this->input('sesi') ?? ($model?->sesi ?? 'pagi'),
            'hari' => $this->input('hari') ?? $defaultHari,
            'jenis_kegiatan' => $this->input('jenis_kegiatan') ?? ($model?->jenis_kegiatan ?? 'kbm'),
            'kelompok_hari' => $kelompokHari ?? ($this->input('hari') == 5 ? 'jumat' : ($model?->kelompok_hari ?? 'senin-kamis')),
        ]);
    }

    public function rules(): array
    {
        $jamPelajaran = $this->route('jamPelajaran') ?? $this->route('jam_pelajaran') ?? $this->route('timeSlot') ?? $this->route('time_slot');
        $id = $jamPelajaran instanceof JamPelajaran ? $jamPelajaran->id : $jamPelajaran;

        return [
            'sesi' => ['required', 'string', Rule::in(['pagi', 'siang'])],
            'hari' => ['required', 'integer', 'min:1', 'max:5'],
            'kelompok_hari' => ['nullable', 'string', Rule::in(['senin-kamis', 'jumat'])],
            'jam_ke' => [
                'required',
                'integer',
                'min:1',
                'max:20',
                Rule::unique('jam_pelajaran')
                    ->where(fn ($q) => $q
                        ->where('sesi', $this->input('sesi'))
                        ->where('hari', $this->input('hari')))
                    ->ignore($id),
            ],
            'mulai' => ['required', 'date_format:H:i'],
            'selesai' => ['required', 'date_format:H:i'],
            'jenis_kegiatan' => ['required', 'string', Rule::in(['kbm', 'upacara', 'mengaji', 'dhuha', 'istirahat'])],
        ];
    }

    public function withValidator($validator): void
    {
        $jamPelajaran = $this->route('jamPelajaran') ?? $this->route('jam_pelajaran') ?? $this->route('timeSlot') ?? $this->route('time_slot');
        $jamPelajaranId = $jamPelajaran instanceof JamPelajaran ? $jamPelajaran->id : $jamPelajaran;

        $validator->after(function ($validator) use ($jamPelajaranId) {
            $mulai = $this->input('mulai');
            $selesai = $this->input('selesai');
            $sesi = $this->input('sesi');
            $hari = $this->input('hari');

            if ($mulai && $selesai) {
                if ($selesai <= $mulai) {
                    $validator->errors()->add('selesai', 'Waktu selesai harus lebih besar dari waktu mulai.');
                    return;
                }

                if ($sesi && $hari) {
                    $overlap = JamPelajaran::query()
                        ->where('sesi', $sesi)
                        ->where('hari', $hari)
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

    public function attributes(): array
    {
        return [
            'sesi' => 'sesi',
            'hari' => 'hari',
            'jam_ke' => 'jam ke',
            'mulai' => 'waktu mulai',
            'selesai' => 'waktu selesai',
            'jenis_kegiatan' => 'jenis kegiatan',
        ];
    }

    public function messages(): array
    {
        return [
            'jam_ke.unique' => 'Nomor jam ke tersebut sudah ada pada sesi dan hari yang dipilih.',
            'jam_ke.required' => 'Nomor jam pelajaran wajib diisi.',
            'mulai.required' => 'Waktu mulai wajib diisi.',
            'mulai.date_format' => 'Format waktu mulai harus JJ:MM (contoh: 07:00).',
            'selesai.required' => 'Waktu selesai wajib diisi.',
            'selesai.date_format' => 'Format waktu selesai harus JJ:MM (contoh: 07:40).',
            'sesi.required' => 'Sesi wajib dipilih.',
            'sesi.in' => 'Sesi harus pagi atau siang.',
            'hari.required' => 'Hari wajib dipilih.',
            'hari.min' => 'Hari minimal 1 (Senin).',
            'hari.max' => 'Hari maksimal 5 (Jumat).',
            'jenis_kegiatan.required' => 'Jenis kegiatan wajib dipilih.',
            'jenis_kegiatan.in' => 'Jenis kegiatan tidak valid.',
        ];
    }
}