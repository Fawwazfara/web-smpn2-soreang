<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBeritaRequest;
use App\Http\Requests\UpdateBeritaRequest;
use App\Models\Pengumuman;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class BeritaController extends Controller
{
    /**
     * Display a listing of news articles for administrators.
     */
    public function index(Request $request): Response
    {
        $search = $request->query('search');
        $status = $request->query('status');
        $kategori = $request->query('kategori');

        $query = Pengumuman::query()->with('dibuatOleh:id,nama');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('judul', 'like', "%{$search}%")
                    ->orWhere('ringkasan', 'like', "%{$search}%")
                    ->orWhere('kategori', 'like', "%{$search}%");
            });
        }

        if ($status && in_array($status, ['draf', 'terbit'])) {
            $query->where('status', $status);
        }

        if ($kategori && $kategori !== 'all') {
            $query->where('kategori', $kategori);
        }

        $berita = $query->orderByDesc('tanggal')->orderByDesc('id')->get();

        $kategoriList = Pengumuman::query()
            ->whereNotNull('kategori')
            ->distinct()
            ->pluck('kategori');

        return Inertia::render('Admin/Berita/Index', [
            'berita' => $berita,
            'filters' => [
                'search' => $search ?? '',
                'status' => $status ?? 'all',
                'kategori' => $kategori ?? 'all',
            ],
            'kategoriList' => $kategoriList,
            'flash' => [
                'message' => session('success'),
            ],
        ]);
    }

    /**
     * Store a newly created news article.
     */
    public function store(StoreBeritaRequest $request): RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('gambar')) {
            $file = $request->file('gambar');
            $filename = time() . '_' . Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) . '.' . $file->getClientOriginalExtension();
            $destination = public_path('uploads/berita');

            if (!File::isDirectory($destination)) {
                File::makeDirectory($destination, 0755, true, true);
            }

            $file->move($destination, $filename);
            $data['gambar_path'] = '/uploads/berita/' . $filename;
        }

        $data['dibuat_oleh'] = $request->user()->id;

        Pengumuman::create($data);

        return redirect()->route('admin.berita.index')->with('success', 'Berita berhasil ditambahkan.');
    }

    /**
     * Update the specified news article.
     */
    public function update(UpdateBeritaRequest $request, Pengumuman $berita): RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('gambar')) {
            $file = $request->file('gambar');
            $filename = time() . '_' . Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) . '.' . $file->getClientOriginalExtension();
            $destination = public_path('uploads/berita');

            if (!File::isDirectory($destination)) {
                File::makeDirectory($destination, 0755, true, true);
            }

            $file->move($destination, $filename);
            $data['gambar_path'] = '/uploads/berita/' . $filename;
        }

        $berita->update($data);

        return redirect()->route('admin.berita.index')->with('success', 'Berita berhasil diperbarui.');
    }

    /**
     * Remove the specified news article.
     */
    public function destroy(Pengumuman $berita): RedirectResponse
    {
        $berita->delete();

        return redirect()->route('admin.berita.index')->with('success', 'Berita berhasil dihapus.');
    }
}

