<?php

namespace App\Http\Requests;

use App\Models\Siswa;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSiswaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $siswa = $this->route('siswa');
        $id    = $siswa instanceof Siswa ? $siswa->id : $siswa;

        return [
            'nis'        => ['required', 'string', 'max:20', Rule::unique('siswa', 'nis')->ignore($id)],
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

