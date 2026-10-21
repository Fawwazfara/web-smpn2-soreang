<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreKelasRequest;
use App\Http\Requests\UpdateKelasRequest;
use App\Models\Kelas;
use App\Models\TahunAjaran;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class KelasController extends Controller
{
    /**
     * Display a listing of the classes.
     */
    public function index(Request $request): Response
    {
        $tahunAjaranId = $request->integer('tahun_ajaran_id')
            ?: TahunAjaran::query()->where('aktif', true)->value('id')
            ?: TahunAjaran::query()->orderByDesc('tanggal_mulai')->value('id');

        return Inertia::render('Admin/Kelas/Index', [
            'kelas' => Kelas::query()
                ->with([
                    'tahunAjaran:id,nama,semester',
                    'waliKelas:id,nama,username',
                ])
                ->when($tahunAjaranId, fn ($query) => $query->where('tahun_ajaran_id', $tahunAjaranId))
                ->orderBy('tingkat')
                ->orderBy('nama')
                ->get(['id', 'nama', 'tingkat', 'tahun_ajaran_id', 'wali_kelas_id']),
            'tahunAjaran' => TahunAjaran::query()
                ->orderByDesc('tanggal_mulai')
                ->get(['id', 'nama', 'semester', 'aktif']),
            'waliKelas' => User::query()
                ->where('role', 'guru')
                ->where('aktif', true)
                ->orderBy('nama')
                ->get(['id', 'nama', 'username']),
            'tahunAjaranId' => $tahunAjaranId,
        ]);
    }

    /**
     * Store a newly created class.
     */
    public function store(StoreKelasRequest $request): RedirectResponse
    {
        $kelas = Kelas::create($request->validated());

        return redirect()->route('kelas.index', [
            'tahun_ajaran_id' => $kelas->tahun_ajaran_id,
        ]);
    }

    /**
     * Update the specified class.
     */
    public function update(UpdateKelasRequest $request, Kelas $kelas): RedirectResponse
    {
        $kelas->update($request->validated());

        return redirect()->route('kelas.index', [
            'tahun_ajaran_id' => $kelas->tahun_ajaran_id,
        ]);
    }

    /**
     * Remove the specified class.
     */
    public function destroy(Kelas $kelas): RedirectResponse
    {
        $tahunAjaranId = $kelas->tahun_ajaran_id;

        if ($kelas->siswa()->exists() || $kelas->jadwalSlot()->exists() || $kelas->sesi()->exists()) {
            throw ValidationException::withMessages([
                'kelas' => 'Kelas yang masih memiliki siswa, jadwal, atau sesi tidak dapat dihapus.',
            ]);
        }

        $kelas->delete();

        return redirect()->route('kelas.index', [
            'tahun_ajaran_id' => $tahunAjaranId,
        ]);
    }
}
