<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserRequest extends FormRequest
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
        return [
            'username' => ['required', 'string', 'max:255', 'unique:users,username'],
            'nama' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'string', 'lowercase', 'email', 'max:255', 'unique:users,email'],
            'role' => ['required', Rule::in(['guru', 'guru_piket', 'kepsek'])],
            'jenis_pegawai' => ['nullable', Rule::requiredIf(fn () => $this->input('role') === 'guru'), Rule::in(['guru', 'tenaga_kependidikan'])],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'aktif' => ['boolean'],
        ];
    }
}
