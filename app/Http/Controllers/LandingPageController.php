<?php

namespace App\Http\Controllers;

use App\Models\Pengumuman;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class LandingPageController extends Controller
{
    /**
     * Display the public landing page for SMPN 2 Soreang.
     */
    public function index(): Response
    {
        $berita = Pengumuman::query()
            ->where('status', 'terbit')
            ->with('dibuatOleh:id,nama')
            ->orderByDesc('is_pinned')
            ->orderByDesc('pinned_at')
            ->orderByDesc('tanggal')
            ->orderByDesc('id')
            ->limit(10)
            ->get();

        return Inertia::render('Welcome', [
            'berita' => $berita,
            'canLogin' => Route::has('login'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
        ]);
    }
}

