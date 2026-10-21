<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTahunAjaranRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $tahunAjaran = $this->route('tahunAjaran');

        return [
            'nama' => [
                'required',
                'string',
                'max:255',
                Rule::unique('tahun_ajaran')->where(fn ($query) => $query
                    ->where('nama', $this->input('nama'))
                    ->where('semester', $this->input('semester')))
                    ->ignore($tahunAjaran?->id),
            ],
            'semester' => ['required', Rule::in(['Ganjil', 'Genap'])],
            'tanggal_mulai' => ['required', 'date'],
            'tanggal_selesai' => ['required', 'date', 'after_or_equal:tanggal_mulai'],
            'aktif' => ['boolean'],
        ];
    }
}
