<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSiswaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nis'        => ['required', 'string', 'max:20', Rule::unique('siswa', 'nis')],
            'nama'       => ['required', 'string', 'max:255'],
            'kelas_id'   => ['nullable', 'integer', Rule::exists('kelas', 'id')],
            'no_hp_ortu' => ['nullable', 'string', 'regex:/^(\+?62|0)8[1-9][0-9]{7,11}$/'],
            'aktif'      => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'nis.unique'         => 'NIS sudah terdaftar. Gunakan NIS yang berbeda.',
            'no_hp_ortu.regex'   => 'Format nomor HP tidak valid. Gunakan: 08xxxxxxxxxx atau +62xxxxxxxxxx.',
        ];
    }
}

