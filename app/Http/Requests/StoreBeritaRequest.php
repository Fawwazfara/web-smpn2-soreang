<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBeritaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'judul' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:pengumuman,slug'],
            'kategori' => ['required', 'string', 'max:100'],
            'ringkasan' => ['nullable', 'string', 'max:1000'],
            'isi' => ['required', 'string'],
            'gambar' => ['nullable', 'image', 'mimes:jpeg,png,webp', 'max:2048'],
            'gambar_path' => ['nullable', 'string', 'max:1000'],
            'tanggal' => ['required', 'date'],
            'status' => ['required', 'in:draf,terbit'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'judul.required' => 'Judul berita wajib diisi.',
            'slug.required' => 'Slug URL wajib diisi.',
            'slug.unique' => 'Slug URL sudah digunakan oleh berita lain.',
            'kategori.required' => 'Kategori berita wajib dipilih atau diisi.',
            'isi.required' => 'Konten utama berita wajib diisi.',
            'tanggal.required' => 'Tanggal publikasi wajib diisi.',
            'status.required' => 'Status berita wajib ditentukan.',
            'status.in' => 'Status harus berupa draf atau terbit.',
            'gambar.image' => 'File harus berupa gambar valid (JPEG, PNG, WebP).',
            'gambar.max' => 'Ukuran gambar maksimal adalah 2MB.',
        ];
    }
}

