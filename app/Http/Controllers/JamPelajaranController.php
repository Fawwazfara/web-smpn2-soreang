<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreJamPelajaranRequest;
use App\Http\Requests\UpdateJamPelajaranRequest;
use App\Models\JamPelajaran;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;

class JamPelajaranController extends Controller
{
    /**
     * Store a newly created time slot.
     */
    public function store(StoreJamPelajaranRequest $request): RedirectResponse
    {
        JamPelajaran::create($request->validated());

        return redirect()->route('mapel.index', ['tab' => 'jam'])
            ->with('message', 'Slot jam pelajaran berhasil ditambahkan.');
    }

    /**
     * Update the specified time slot.
     */
    public function update(UpdateJamPelajaranRequest $request, JamPelajaran $jamPelajaran): RedirectResponse
    {
        $jamPelajaran->update($request->validated());

        return redirect()->route('mapel.index', ['tab' => 'jam'])
            ->with('message', 'Slot jam pelajaran berhasil diperbarui.');
    }

    /**
     * Remove the specified time slot.
     */
    public function destroy(JamPelajaran $jamPelajaran): RedirectResponse
    {
        if ($jamPelajaran->jadwalSlot()->exists() || $jamPelajaran->sesi()->exists()) {
            throw ValidationException::withMessages([
                'jam_pelajaran' => 'Slot jam pelajaran tidak dapat dihapus karena masih digunakan dalam jadwal atau sesi.',
            ]);
        }

        $jamPelajaran->delete();

        return redirect()->route('mapel.index', ['tab' => 'jam'])
            ->with('message', 'Slot jam pelajaran berhasil dihapus.');
    }
}

