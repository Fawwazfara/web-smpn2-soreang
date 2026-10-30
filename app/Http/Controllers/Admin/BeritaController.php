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

        // Handle pin: max 3 pinned articles
        if ($request->boolean('is_pinned')) {
            $pinnedCount = Pengumuman::where('is_pinned', true)->count();
            if ($pinnedCount >= 3) {
                return back()->withErrors(['is_pinned' => 'Maksimal 3 berita yang bisa disematkan. Lepas pin berita lain dulu.'])->withInput();
            }
            $data['pinned_at'] = now();
        }

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

        // Handle pin toggle
        $wasPinned = $berita->is_pinned;
        $willBePinned = $request->boolean('is_pinned');

        if ($willBePinned && !$wasPinned) {
            $pinnedCount = Pengumuman::where('is_pinned', true)->count();
            if ($pinnedCount >= 3) {
                return back()->withErrors(['is_pinned' => 'Maksimal 3 berita yang bisa disematkan. Lepas pin berita lain dulu.'])->withInput();
            }
            $data['pinned_at'] = now();
        } elseif (!$willBePinned && $wasPinned) {
            $data['pinned_at'] = null;
        }

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
     * Toggle pin status of a berita (quick action from list).
     */
    public function togglePin(Request $request, Pengumuman $berita): RedirectResponse
    {
        if ($berita->is_pinned) {
            $berita->update(['is_pinned' => false, 'pinned_at' => null]);
            return back()->with('success', 'Pin berita dilepas.');
        }

        $pinnedCount = Pengumuman::where('is_pinned', true)->count();
        if ($pinnedCount >= 3) {
            return back()->withErrors(['is_pinned' => 'Maksimal 3 berita yang bisa disematkan. Lepas pin berita lain dulu.']);
        }

        $berita->update(['is_pinned' => true, 'pinned_at' => now()]);
        return back()->with('success', 'Berita disematkan di slider beranda.');
    }

    /**
     * Remove the specified news article.
     */
    public function destroy(Pengumuman $berita): RedirectResponse
    {
        // Delete image file if exists
        if ($berita->gambar_path && File::exists(public_path($berita->gambar_path))) {
            File::delete(public_path($berita->gambar_path));
        }

        $berita->delete();

        return redirect()->route('admin.berita.index')->with('success', 'Berita berhasil dihapus.');
    }
}

