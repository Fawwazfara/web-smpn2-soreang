<?php

namespace App\Http\Controllers;

use App\Models\Pengumuman;
use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class LandingPageController extends Controller
{
    /**
     * Display the public landing page (Beranda) for SMPN 2 Soreang.
     * Shows brief summary of sections + at most 4 pinned news (unpinned only fills if pinned < 4).
     */
    public function index(): Response
    {
        // 1. Prioritize pinned articles (up to 4)
        $pinned = Pengumuman::query()
            ->where('status', 'terbit')
            ->where('is_pinned', true)
            ->with('dibuatOleh:id,nama')
            ->orderByDesc('pinned_at')
            ->orderByDesc('tanggal')
            ->orderByDesc('id')
            ->limit(4)
            ->get();

        // 2. If pinned articles are less than 4, fill remaining slots with latest unpinned articles
        $remainingSlots = 4 - $pinned->count();
        $unpinned = collect();

        if ($remainingSlots > 0) {
            $unpinned = Pengumuman::query()
                ->where('status', 'terbit')
                ->where('is_pinned', false)
                ->with('dibuatOleh:id,nama')
                ->orderByDesc('tanggal')
                ->orderByDesc('id')
                ->limit($remainingSlots)
                ->get();
        }

        $berita = $pinned->concat($unpinned);

        return Inertia::render('Welcome', [
            'berita' => $berita,
            'canLogin' => Route::has('login'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
        ]);
    }

    /**
     * Display full School Profile page (Profil).
     */
    public function profil(): Response
    {
        return Inertia::render('Profil', [
            'canLogin' => Route::has('login'),
        ]);
    }

    /**
     * Display full News & Announcements archive page (Berita).
     */
    public function berita(Request $request): Response
    {
        $query = Pengumuman::query()
            ->where('status', 'terbit')
            ->with('dibuatOleh:id,nama');

        if ($request->filled('q')) {
            $q = trim((string) $request->input('q'));
            $query->where(function ($sub) use ($q) {
                $sub->where('judul', 'like', "%{$q}%")
                    ->orWhere('ringkasan', 'like', "%{$q}%")
                    ->orWhere('isi', 'like', "%{$q}%");
            });
        }

        if ($request->filled('kategori') && $request->input('kategori') !== 'Semua') {
            $query->where('kategori', $request->input('kategori'));
        }

        $berita = $query
            ->orderByDesc('is_pinned')
            ->orderByDesc('pinned_at')
            ->orderByDesc('tanggal')
            ->orderByDesc('id')
            ->get();

        return Inertia::render('Berita', [
            'berita' => $berita,
            'filters' => [
                'q' => $request->input('q', ''),
                'kategori' => $request->input('kategori', 'Semua'),
            ],
            'canLogin' => Route::has('login'),
        ]);
    }

    /**
     * Display full School Gallery page (Galeri).
     */
    public function galeri(): Response
    {
        return Inertia::render('Galeri', [
            'canLogin' => Route::has('login'),
        ]);
    }

    /**
     * Display full Contact & Office Services page (Kontak).
     */
    public function kontak(): Response
    {
        return Inertia::render('Kontak', [
            'canLogin' => Route::has('login'),
        ]);
    }
}
