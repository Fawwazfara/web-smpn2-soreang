<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\HariLibur;
use App\Models\JamPelajaran;
use App\Models\JadwalSlot;
use App\Models\JadwalVersi;
use App\Models\Kelas;
use App\Models\Mapel;
use App\Models\Sesi;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class JadwalController extends Controller
{
    /**
     * Display a listing of schedule versions and matrix.
     */
    public function index(Request $request): Response
    {
        $versions = JadwalVersi::query()
            ->withCount('jadwalSlot')
            ->orderByDesc('berlaku_mulai')
            ->orderByDesc('id')
            ->get();

        $activeVersionId = $request->query('versi_id') ?? $versions->where('status', 'aktif')->first()?->id ?? $versions->first()?->id;

        $selectedVersion = null;
        $slots = [];
        if ($activeVersionId) {
            $selectedVersion = JadwalVersi::with([
                'jadwalSlot.jamPelajaran',
                'jadwalSlot.kelas',
                'jadwalSlot.mapel',
                'jadwalSlot.guru:id,nama,username',
            ])->find($activeVersionId);

            if ($selectedVersion) {
                $slots = $selectedVersion->jadwalSlot;
            }
        }

        $kelasList = Kelas::orderBy('tingkat')->orderBy('nama')->get();
        $mapelList = Mapel::orderBy('nama')->get();
        $guruList = User::where('role', 'guru')->orderBy('nama')->get();
        $jamList = JamPelajaran::orderBy('kelompok_hari')->orderBy('jam_ke')->get();

        return Inertia::render('Admin/Jadwal/Index', [
            'versions' => $versions,
            'selectedVersion' => $selectedVersion,
            'slots' => $slots,
            'kelasList' => $kelasList,
            'mapelList' => $mapelList,
            'guruList' => $guruList,
            'jamList' => $jamList,
            'flash' => [
                'message' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    /**
     * Store a newly created schedule version.
     */
    public function storeVersion(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nama' => ['required', 'string', 'max:255'],
            'berlaku_mulai' => ['required', 'date'],
            'berlaku_sampai' => ['required', 'date', 'after_or_equal:berlaku_mulai'],
        ]);

        $validated['status'] = 'draf';

        $versi = JadwalVersi::create($validated);

        return redirect()->route('admin.jadwal.index', ['versi_id' => $versi->id])
            ->with('success', 'Versi jadwal baru berhasil dibuat (Draf).');
    }

    /**
     * Update schedule version details.
     */
    public function updateVersion(Request $request, JadwalVersi $jadwalVersi): RedirectResponse
    {
        $validated = $request->validate([
            'nama' => ['required', 'string', 'max:255'],
            'berlaku_mulai' => ['required', 'date'],
            'berlaku_sampai' => ['required', 'date', 'after_or_equal:berlaku_mulai'],
        ]);

        $jadwalVersi->update($validated);

        return redirect()->route('admin.jadwal.index', ['versi_id' => $jadwalVersi->id])
            ->with('success', 'Versi jadwal berhasil diperbarui.');
    }

    /**
     * Publish a schedule version (archives currently active versions).
     */
    public function publishVersion(JadwalVersi $jadwalVersi): RedirectResponse
    {
        // Archive any other active versions
        JadwalVersi::where('status', 'aktif')->update(['status' => 'arsip']);

        // Set this version to active
        $jadwalVersi->update(['status' => 'aktif']);

        return redirect()->route('admin.jadwal.index', ['versi_id' => $jadwalVersi->id])
            ->with('success', "Versi jadwal '{$jadwalVersi->nama}' resmi diterbitkan sebagai Jadwal Aktif.");
    }

    /**
     * Copy slots from another version into this draf version.
     */
    public function copyVersion(Request $request, JadwalVersi $jadwalVersi): RedirectResponse
    {
        if ($jadwalVersi->status !== 'draf') {
            return back()->with('error', 'Hanya versi dengan status draf yang dapat menerima salinan slot.');
        }

        $validated = $request->validate([
            'source_versi_id' => ['required', 'exists:jadwal_versi,id'],
        ]);

        $sourceVersiId = $validated['source_versi_id'];
        if ($sourceVersiId == $jadwalVersi->id) {
            return back()->with('error', 'Tidak dapat menyalin dari versi yang sama.');
        }

        $sourceSlots = JadwalSlot::where('versi_id', $sourceVersiId)->get();

        // Clear existing slots in target draf if needed or append? Usually clear or sync. Let's delete existing or skip duplicates.
        // Let's delete existing slots in target version to get a clean copy
        JadwalSlot::where('versi_id', $jadwalVersi->id)->delete();

        foreach ($sourceSlots as $slot) {
            JadwalSlot::create([
                'versi_id' => $jadwalVersi->id,
                'hari' => $slot->hari,
                'jam_pelajaran_id' => $slot->jam_pelajaran_id,
                'kelas_id' => $slot->kelas_id,
                'mapel_id' => $slot->mapel_id,
                'guru_id' => $slot->guru_id,
            ]);
        }

        return redirect()->route('admin.jadwal.index', ['versi_id' => $jadwalVersi->id])
            ->with('success', 'Slot jadwal berhasil disalin dari versi sumber.');
    }

    /**
     * Delete a schedule version (only if draf).
     */
    public function destroyVersion(JadwalVersi $jadwalVersi): RedirectResponse
    {
        if ($jadwalVersi->status === 'aktif') {
            return back()->with('error', 'Versi jadwal yang sedang aktif tidak dapat dihapus.');
        }

        $jadwalVersi->delete();

        return redirect()->route('admin.jadwal.index')
            ->with('success', 'Versi jadwal berhasil dihapus.');
    }

    /**
     * Store or update a jadwal slot (grid cell).
     */
    public function storeSlot(Request $request, JadwalVersi $jadwalVersi): RedirectResponse
    {
        $validated = $request->validate([
            'hari' => ['required', 'integer', 'min:1', 'max:6'],
            'jam_pelajaran_id' => ['required', 'exists:jam_pelajaran,id'],
            'kelas_id' => ['required', 'exists:kelas,id'],
            'mapel_id' => ['required', 'exists:mapel,id'],
            'guru_id' => ['required', 'exists:users,id'],
        ]);

        // Check teacher conflict: Is this teacher already teaching another class at the same day and jam_pelajaran_id in this version?
        $teacherConflict = JadwalSlot::where('versi_id', $jadwalVersi->id)
            ->where('hari', $validated['hari'])
            ->where('jam_pelajaran_id', $validated['jam_pelajaran_id'])
            ->where('guru_id', $validated['guru_id'])
            ->where('kelas_id', '!=', $validated['kelas_id'])
            ->exists();

        if ($teacherConflict) {
            return back()->with('error', 'Bentrok Guru: Guru tersebut sudah dijadwalkan mengajar di kelas lain pada hari dan jam pelajaran yang sama.');
        }

        JadwalSlot::updateOrCreate(
            [
                'versi_id' => $jadwalVersi->id,
                'hari' => $validated['hari'],
                'jam_pelajaran_id' => $validated['jam_pelajaran_id'],
                'kelas_id' => $validated['kelas_id'],
            ],
            [
                'mapel_id' => $validated['mapel_id'],
                'guru_id' => $validated['guru_id'],
            ]
        );

        return redirect()->route('admin.jadwal.index', ['versi_id' => $jadwalVersi->id])
            ->with('success', 'Slot jadwal berhasil disimpan.');
    }

    /**
     * Delete a jadwal slot.
     */
    public function destroySlot(JadwalSlot $jadwalSlot): RedirectResponse
    {
        $versiId = $jadwalSlot->versi_id;
        $jadwalSlot->delete();

        return redirect()->route('admin.jadwal.index', ['versi_id' => $versiId])
            ->with('success', 'Slot jadwal berhasil dihapus.');
    }

    /**
     * Generate daily sessions from active schedule version.
     */
    public function generateSesi(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'tanggal_mulai' => ['required', 'date'],
            'tanggal_selesai' => ['required', 'date', 'after_or_equal:tanggal_mulai'],
        ]);

        $startDate = Carbon::parse($validated['tanggal_mulai']);
        $endDate = Carbon::parse($validated['tanggal_selesai']);

        // Find active version covering or overlapping range, or the currently active version
        $activeVersion = JadwalVersi::where('status', 'aktif')->first();
        if (!$activeVersion) {
            return back()->with('error', 'Tidak ada versi jadwal yang berstatus AKTIF. Terbitkan versi jadwal terlebih dahulu sebelum generate sesi.');
        }

        $slots = $activeVersion->jadwalSlot()->get();
        if ($slots->isEmpty()) {
            return back()->with('error', 'Versi jadwal aktif tidak memiliki slot jadwal.');
        }

        $generatedCount = 0;
        $current = $startDate->copy();

        while ($current->lte($endDate)) {
            // Check if day is Sunday (Carbon dayOfWeek: 0 = Sunday, 1 = Monday ... 6 = Saturday)
            // In our system, hari: 1 = Senin, 2 = Selasa, 3 = Rabu, 4 = Kamis, 5 = Jumat, 6 = Sabtu, 7/0 = Minggu.
            $dayOfWeek = $current->dayOfWeekIso; // 1 (Monday) to 7 (Sunday)

            // Skip Sunday or holidays
            $isHoliday = HariLibur::whereDate('tanggal', $current->toDateString())->exists();

            if ($dayOfWeek >= 1 && $dayOfWeek <= 6 && !$isHoliday) {
                // Find slots for this day of week
                $daySlots = $slots->where('hari', $dayOfWeek);

                foreach ($daySlots as $slot) {
                    Sesi::firstOrCreate(
                        [
                            'tanggal' => $current->toDateString(),
                            'kelas_id' => $slot->kelas_id,
                            'jam_pelajaran_id' => $slot->jam_pelajaran_id,
                        ],
                        [
                            'mapel_id' => $slot->mapel_id,
                            'guru_id' => $slot->guru_id,
                            'slot_id' => $slot->id,
                            'status' => 'terjadwal',
                        ]
                    );
                    $generatedCount++;
                }
            }

            $current->addDay();
        }

        return redirect()->route('admin.jadwal.index', ['versi_id' => $activeVersion->id])
            ->with('success', "Berhasil men-generate {$generatedCount} sesi harian dari tanggal {$startDate->format('d/m/Y')} s.d. {$endDate->format('d/m/Y')}.");
    }
}
