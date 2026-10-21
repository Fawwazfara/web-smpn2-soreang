<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTahunAjaranRequest;
use App\Http\Requests\UpdateTahunAjaranRequest;
use App\Models\TahunAjaran;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class TahunAjaranController extends Controller
{
    /**
     * Display a listing of the academic years.
     */
    public function index(): Response
    {
        return Inertia::render('Admin/TahunAjaran/Index', [
            'tahunAjaran' => TahunAjaran::query()
                ->orderByDesc('tanggal_mulai')
                ->get(['id', 'nama', 'semester', 'tanggal_mulai', 'tanggal_selesai', 'aktif']),
        ]);
    }

    /**
     * Store a newly created academic year.
     */
    public function store(StoreTahunAjaranRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['aktif'] = $data['aktif'] ?? false;

        TahunAjaran::create($data);

        return redirect()->route('tahun-ajaran.index');
    }

    /**
     * Update the specified academic year.
     */
    public function update(UpdateTahunAjaranRequest $request, TahunAjaran $tahunAjaran): RedirectResponse
    {
        $data = $request->validated();
        $data['aktif'] = $data['aktif'] ?? false;

        $tahunAjaran->update($data);

        return redirect()->route('tahun-ajaran.index');
    }

    /**
     * Activate the specified academic year.
     */
    public function activate(TahunAjaran $tahunAjaran): RedirectResponse
    {
        $tahunAjaran->update(['aktif' => true]);

        return redirect()->route('tahun-ajaran.index');
    }

    /**
     * Remove the specified academic year.
     */
    public function destroy(TahunAjaran $tahunAjaran): RedirectResponse
    {
        if ($tahunAjaran->aktif) {
            throw ValidationException::withMessages([
                'tahun_ajaran' => 'Tahun ajaran aktif tidak dapat dihapus.',
            ]);
        }

        if ($tahunAjaran->kelas()->exists()) {
            throw ValidationException::withMessages([
                'tahun_ajaran' => 'Tahun ajaran yang masih memiliki kelas tidak dapat dihapus.',
            ]);
        }

        $tahunAjaran->delete();

        return redirect()->route('tahun-ajaran.index');
    }
}
