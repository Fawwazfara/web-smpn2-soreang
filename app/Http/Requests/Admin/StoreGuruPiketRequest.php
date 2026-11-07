<?php

namespace App\Http\Requests\Admin;

use App\Models\TahunAjaran;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreGuruPiketRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $tahunAjaranId = $this->input('tahun_ajaran_id');

        return [
            'tahun_ajaran_id' => ['required', 'exists:tahun_ajaran,id'],
            'hari' => ['required', 'integer', 'between:1,6'],
            'user_id' => [
                'required',
                Rule::exists('users', 'id')->where(function ($query) {
                    $query->where('role', 'guru_piket')
                        ->where('aktif', true)
                        ->whereNotNull('no_wa')
                        ->where('no_wa', '!=', '');
                }),
                Rule::unique('guru_piket', 'user_id')->where(function ($query) use ($tahunAjaranId) {
                    return $query->where('hari', $this->input('hari'))
                        ->where('tahun_ajaran_id', $tahunAjaranId);
                }),
            ],
        ];
    }

    /**
     * Custom validation messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'tahun_ajaran_id.required' => 'Tahun ajaran wajib dipilih.',
            'tahun_ajaran_id.exists' => 'Tahun ajaran tidak valid.',
            'hari.required' => 'Hari piket wajib dipilih.',
            'hari.between' => 'Hari piket harus di antara Senin (1) sampai Sabtu (6).',
            'user_id.required' => 'Guru piket wajib dipilih.',
            'user_id.exists' => 'Guru yang dipilih harus berstatus aktif dengan role guru piket dan memiliki nomor WhatsApp valid.',
            'user_id.unique' => 'Guru piket tersebut sudah ditugaskan pada hari dan tahun ajaran ini.',
        ];
    }
}

