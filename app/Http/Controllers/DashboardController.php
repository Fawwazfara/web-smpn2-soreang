<?php

namespace App\Http\Controllers;

use App\Models\Kelas;
use App\Models\Siswa;
use App\Models\TahunAjaran;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the dashboard for the authenticated user's role.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $tahunAjaranAktif = TahunAjaran::where('aktif', true)->first(['id', 'nama', 'semester']);

        return match ($user->role) {
            'admin' => Inertia::render('Admin/Dashboard', [
                'stats' => [
                    'total_guru' => User::where('role', 'guru')->count(),
                    'total_guru_piket' => User::where('role', 'guru_piket')->count(),
                    'total_kepsek' => User::where('role', 'kepsek')->count(),
                    'total_kelas' => Kelas::count(),
                    'tahun_ajaran_aktif' => $tahunAjaranAktif,
                ],
            ]),

            'guru_piket' => Inertia::render('Piket/Dashboard', [
                'stats' => [
                    'total_kelas' => Kelas::count(),
                    'tahun_ajaran_aktif' => $tahunAjaranAktif,
                ],
                'kelasList' => Kelas::query()
                    ->when($tahunAjaranAktif, fn ($q) => $q->where('tahun_ajaran_id', $tahunAjaranAktif->id))
                    ->orderBy('nama')
                    ->get(['id', 'nama']),
            ]),

            'kepsek' => Inertia::render('Kepsek/Dashboard', [
                'stats' => [
                    'total_guru' => User::where('role', 'guru')->count(),
                    'total_siswa' => Siswa::count(),
                    'total_kelas' => Kelas::count(),
                    'tahun_ajaran_aktif' => $tahunAjaranAktif,
                ],
            ]),

            default => Inertia::render('Guru/Dashboard', [
                'piketHariIni' => User::query()
                    ->where('role', 'guru_piket')
                    ->where('aktif', true)
                    ->get(['id', 'nama', 'no_wa']),
                'tahunAjaranAktif' => $tahunAjaranAktif,
            ]),
        };
    }
}
