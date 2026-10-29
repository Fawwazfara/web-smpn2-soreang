<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMapelRequest;
use App\Http\Requests\UpdateMapelRequest;
use App\Models\JamPelajaran;
use App\Models\Mapel;
use App\Models\TahunAjaran;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class MapelController extends Controller
{
    /**
     * Display a listing of subjects and time slots.
     */
    public function index(Request $request): Response
    {
        $mapel = Mapel::query()
            ->with(['jadwalSlot.guru:id,nama,username'])
            ->orderBy('kode')
            ->get();

        $jamPelajaran = JamPelajaran::query()
            ->orderBy('kelompok_hari')
            ->orderBy('jam_ke')
            ->get();

        $tahunAjaranAktif = TahunAjaran::query()
            ->where('aktif', true)
            ->first(['id', 'nama', 'semester', 'aktif']);

        $gurus = User::query()
            ->where('role', 'guru')
            ->where('aktif', true)
            ->orderBy('nama')
            ->get(['id', 'nama', 'username']);

        return Inertia::render('Admin/Mapel/Index', [
            'mapel' => $mapel,
            'jamPelajaran' => $jamPelajaran,
            'tahunAjaranAktif' => $tahunAjaranAktif,
            'gurus' => $gurus,
            'flash' => [
                'message' => session('message'),
            ],
        ]);
    }

    /**
     * Store a newly created subject.
     */
    public function store(StoreMapelRequest $request): RedirectResponse
    {
        Mapel::create($request->validated());

        return redirect()->route('mapel.index')
            ->with('message', 'Mata pelajaran berhasil ditambahkan.');
    }

    /**
     * Update the specified subject.
     */
    public function update(UpdateMapelRequest $request, Mapel $mapel): RedirectResponse
    {
        $mapel->update($request->validated());

        return redirect()->route('mapel.index')
            ->with('message', 'Mata pelajaran berhasil diperbarui.');
    }

    /**
     * Remove the specified subject.
     */
    public function destroy(Mapel $mapel): RedirectResponse
    {
        if ($mapel->jadwalSlot()->exists() || $mapel->sesi()->exists()) {
            throw ValidationException::withMessages([
                'mapel' => 'Mata pelajaran tidak dapat dihapus karena masih digunakan dalam jadwal atau sesi.',
            ]);
        }

        $mapel->delete();

        return redirect()->route('mapel.index')
            ->with('message', 'Mata pelajaran berhasil dihapus.');
    }
}

