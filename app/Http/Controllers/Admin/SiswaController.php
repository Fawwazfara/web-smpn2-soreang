<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSiswaRequest;
use App\Http\Requests\UpdateSiswaRequest;
use App\Models\Kelas;
use App\Models\Siswa;
use App\Models\TahunAjaran;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class SiswaController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Siswa::query()->with([
            'kelas:id,nama,tahun_ajaran_id',
            'kelas.tahunAjaran:id,nama,semester',
        ]);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nis', 'like', "%{$search}%")
                  ->orWhere('nama', 'like', "%{$search}%");
            });
        }

        if ($kelasId = $request->input('kelas_id')) {
            $query->where('kelas_id', $kelasId);
        }

        $siswa = $query->orderBy('nama')->paginate(15)->withQueryString();

        $kelasList = Kelas::query()
            ->with('tahunAjaran:id,nama,semester,aktif')
            ->orderBy('nama')
            ->get(['id', 'nama', 'tahun_ajaran_id']);

        $tahunAjaranAktif = TahunAjaran::where('aktif', true)
            ->first(['id', 'nama', 'semester']);

        $stats = [
            'total'        => Siswa::count(),
            'aktif'        => Siswa::where('aktif', true)->count(),
            'nonaktif'     => Siswa::where('aktif', false)->count(),
            'kontak_valid' => Siswa::whereNotNull('no_hp_ortu')
                ->where('no_hp_ortu', '!=', '')
                ->count(),
        ];

        return Inertia::render('Admin/Siswa/Index', [
            'siswa'            => $siswa,
            'kelasList'        => $kelasList,
            'tahunAjaranAktif' => $tahunAjaranAktif,
            'stats'            => $stats,
            'filters'          => $request->only(['search', 'kelas_id']),
        ]);
    }

    public function store(StoreSiswaRequest $request): RedirectResponse
    {
        Siswa::create($request->validated());

        return redirect()->route('admin.siswa.index');
    }

    public function update(UpdateSiswaRequest $request, Siswa $siswa): RedirectResponse
    {
        $siswa->update($request->validated());

        return redirect()->route('admin.siswa.index');
    }

    public function toggleStatus(Siswa $siswa): RedirectResponse
    {
        $siswa->update(['aktif' => ! $siswa->aktif]);

        return redirect()->route('admin.siswa.index');
    }

    public function destroy(Siswa $siswa): RedirectResponse
    {
        if ($siswa->absenSiswa()->exists()) {
            throw ValidationException::withMessages([
                'siswa' => 'Siswa tidak dapat dihapus karena sudah memiliki data absensi.',
            ]);
        }

        $siswa->delete();

        return redirect()->route('admin.siswa.index');
    }
}
