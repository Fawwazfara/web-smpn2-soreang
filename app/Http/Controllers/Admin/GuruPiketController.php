<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreGuruPiketRequest;
use App\Models\GuruPiket;
use App\Models\TahunAjaran;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GuruPiketController extends Controller
{
    /**
     * Display the list of picket assignments for the active academic year.
     */
    public function index(Request $request): Response
    {
        $tahunAjaranAktif = TahunAjaran::query()->where('aktif', true)->first();

        // Selected academic year can be active by default, or filtered if specified
        $selectedTahunAjaranId = $request->query('tahun_ajaran_id', $tahunAjaranAktif?->id);

        $selectedTahunAjaran = $selectedTahunAjaranId
            ? TahunAjaran::query()->find($selectedTahunAjaranId)
            : $tahunAjaranAktif;

        $semuaTahunAjaran = TahunAjaran::query()
            ->orderByDesc('aktif')
            ->orderByDesc('id')
            ->get(['id', 'nama', 'semester', 'aktif']);

        $jadwalPiket = [];
        if ($selectedTahunAjaran) {
            $jadwalPiket = GuruPiket::query()
                ->with(['user:id,nama,username,no_wa,role,aktif'])
                ->where('tahun_ajaran_id', $selectedTahunAjaran->id)
                ->orderBy('hari')
                ->orderBy('id')
                ->get();
        }

        // Available teachers with role 'guru_piket', aktif=true, and valid no_wa
        $daftarGuruPiket = User::query()
            ->where('role', 'guru_piket')
            ->where('aktif', true)
            ->whereNotNull('no_wa')
            ->where('no_wa', '!=', '')
            ->orderBy('nama')
            ->get(['id', 'nama', 'username', 'no_wa', 'role', 'aktif']);

        return Inertia::render('Admin/GuruPiket/Index', [
            'tahunAjaranAktif' => $tahunAjaranAktif,
            'selectedTahunAjaran' => $selectedTahunAjaran,
            'semuaTahunAjaran' => $semuaTahunAjaran,
            'jadwalPiket' => $jadwalPiket,
            'daftarGuruPiket' => $daftarGuruPiket,
        ]);
    }

    /**
     * Store a new picket assignment.
     */
    public function store(StoreGuruPiketRequest $request): RedirectResponse
    {
        GuruPiket::create($request->validated());

        return redirect()
            ->route('admin.guru-piket.index', ['tahun_ajaran_id' => $request->input('tahun_ajaran_id')])
            ->with('success', 'Penugasan guru piket berhasil ditambahkan.');
    }

    /**
     * Remove the specified picket assignment.
     */
    public function destroy(GuruPiket $guruPiket): RedirectResponse
    {
        $tahunAjaranId = $guruPiket->tahun_ajaran_id;
        $guruPiket->delete();

        return redirect()
            ->route('admin.guru-piket.index', ['tahun_ajaran_id' => $tahunAjaranId])
            ->with('success', 'Penugasan guru piket berhasil dihapus.');
    }
}

