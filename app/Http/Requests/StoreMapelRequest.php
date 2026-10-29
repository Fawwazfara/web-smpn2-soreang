<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMapelRequest extends FormRequest
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
            'kode' => $this->input('kode') ?? $this->input('kode_mapel'),
            'nama' => $this->input('nama') ?? $this->input('nama_mapel'),
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'kode' => ['required', 'string', 'max:50', Rule::unique('mapel', 'kode')],
            'nama' => ['required', 'string', 'max:255'],
            'kelompok_kurikulum' => ['required', 'string', 'max:255'],
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'kode' => 'kode mapel',
            'nama' => 'nama mata pelajaran',
            'kelompok_kurikulum' => 'kelompok kurikulum',
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
            'kode.unique' => 'Kode mata pelajaran sudah digunakan.',
            'kode.required' => 'Kode mata pelajaran wajib diisi.',
            'nama.required' => 'Nama mata pelajaran wajib diisi.',
            'kelompok_kurikulum.required' => 'Kelompok kurikulum wajib dipilih.',
        ];
    }
}

