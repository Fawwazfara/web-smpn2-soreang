<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
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
        $user = $this->route('user');

        return [
            'username' => ['required', 'string', 'max:255', Rule::unique('users', 'username')->ignore($user?->id)],
            'nama' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'string', 'lowercase', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user?->id)],
            'no_wa' => ['nullable', 'string', 'max:20', Rule::requiredIf(fn () => $this->input('role') === 'guru_piket')],
            'role' => ['required', Rule::in(['guru', 'guru_piket', 'kepsek'])],
            'jenis_pegawai' => ['nullable', Rule::requiredIf(fn () => $this->input('role') === 'guru'), Rule::in(['guru', 'tenaga_kependidikan'])],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
            'aktif' => ['boolean'],
        ];
    }
}
