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
use Illuminate\Validation\Rule;
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

        $sesi = $request->query('sesi', 'pagi');
        $hari = $request->query('hari', 1);

        $kelasList = Kelas::orderBy('tingkat')->orderBy('nama')->get();
        $mapelList = Mapel::orderBy('nama')->get();
        $guruList = User::where('role', 'guru')->orderBy('nama')->get();
        $jamList = JamPelajaran::where('sesi', $sesi)
            ->where('hari', $hari)
            ->orderBy('jam_ke')
            ->get();
        $allJamList = JamPelajaran::where('sesi', $sesi)
            ->orderBy('hari')
            ->orderBy('jam_ke')
            ->get();

        return Inertia::render('Admin/Jadwal/Index', [
            'versions' => $versions,
            'selectedVersion' => $selectedVersion,
            'slots' => $slots,
            'kelasList' => $kelasList,
            'mapelList' => $mapelList,
            'guruList' => $guruList,
            'jamList' => $jamList,
            'allJamList' => $allJamList,
            'selectedSesi' => $sesi,
            'selectedHari' => $hari,
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

        return redirect()->route('jadwal.index', ['versi_id' => $versi->id])
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

        return redirect()->route('jadwal.index', ['versi_id' => $jadwalVersi->id])
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

        return redirect()->route('jadwal.index', ['versi_id' => $jadwalVersi->id])
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

        return redirect()->route('jadwal.index', ['versi_id' => $jadwalVersi->id])
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

        return redirect()->route('jadwal.index')
            ->with('success', 'Versi jadwal berhasil dihapus.');
    }

    /**
     * Bulk copy slots from one class to multiple target classes.
     */
    public function bulkCopySlots(Request $request, JadwalVersi $jadwalVersi): RedirectResponse
    {
        // Prevent editing aktif version
        if ($jadwalVersi->status === 'aktif') {
            return back()->with('error', 'Versi jadwal yang sudah AKTIF tidak dapat diedit. Silakan buat versi baru (Draf) untuk melakukan perubahan.');
        }

        $validated = $request->validate([
            'source_kelas_id' => ['required', 'exists:kelas,id'],
            'target_kelas_ids' => ['required', 'array', 'min:1'],
            'target_kelas_ids.*' => ['exists:kelas,id'],
        ]);

        $sourceKelasId = $validated['source_kelas_id'];
        $targetKelasIds = $validated['target_kelas_ids'];

        // Remove source kelas from targets if present
        $targetKelasIds = array_filter($targetKelasIds, fn($id) => $id != $sourceKelasId);

        if (empty($targetKelasIds)) {
            return back()->with('error', 'Pilih minimal satu kelas tujuan yang berbeda dari kelas sumber.');
        }

        // Get all slots from source class
        $sourceSlots = JadwalSlot::where('versi_id', $jadwalVersi->id)
            ->where('kelas_id', $sourceKelasId)
            ->get();

        if ($sourceSlots->isEmpty()) {
            return back()->with('error', 'Kelas sumber tidak memiliki slot jadwal untuk disalin.');
        }

        // Filter out placeholder continuation slots so only primary slots are copied
        $primarySourceSlots = $sourceSlots->filter(function ($slot) use ($sourceSlots) {
            $slotJam = JamPelajaran::find($slot->jam_pelajaran_id);
            if (!$slotJam) return true;
            $parent = $sourceSlots->first(function ($s) use ($slot, $slotJam) {
                if ($s->id === $slot->id || $s->hari !== $slot->hari || ($s->durasi ?? 1) <= 1) return false;
                $pJam = JamPelajaran::find($s->jam_pelajaran_id);
                return $pJam && $slotJam->jam_ke > $pJam->jam_ke && $slotJam->jam_ke < ($pJam->jam_ke + $s->durasi);
            });
            return !$parent;
        });

        $copiedCount = 0;
        $skippedCount = 0;

        foreach ($targetKelasIds as $targetKelasId) {
            foreach ($primarySourceSlots as $slot) {
                // Check if target already has a slot at this time
                $exists = JadwalSlot::where('versi_id', $jadwalVersi->id)
                    ->where('hari', $slot->hari)
                    ->where('jam_pelajaran_id', $slot->jam_pelajaran_id)
                    ->where('kelas_id', $targetKelasId)
                    ->exists();

                if ($exists) {
                    $skippedCount++;
                    continue;
                }

                // Check teacher conflict
                if ($slot->guru_id) {
                    $teacherConflict = JadwalSlot::where('versi_id', $jadwalVersi->id)
                        ->where('hari', $slot->hari)
                        ->where('jam_pelajaran_id', $slot->jam_pelajaran_id)
                        ->where('guru_id', $slot->guru_id)
                        ->where('kelas_id', '!=', $targetKelasId)
                        ->exists();

                    if ($teacherConflict) {
                        $skippedCount++;
                        continue;
                    }
                }

                // Determine all jam_ids for this slot's durasi
                $durasi = $slot->durasi ?? 1;
                $jamIds = [$slot->jam_pelajaran_id];
                $validDurasi = true;
                if ($durasi > 1) {
                    $startJam = JamPelajaran::find($slot->jam_pelajaran_id);
                    if ($startJam) {
                        for ($i = 1; $i < $durasi; $i++) {
                            $nextJam = JamPelajaran::where('sesi', $startJam->sesi)
                                ->where('hari', $startJam->hari)
                                ->where('jam_ke', $startJam->jam_ke + $i)
                                ->first();
                            if ($nextJam) {
                                $jamIds[] = $nextJam->id;
                            } else {
                                $validDurasi = false;
                                break;
                            }
                        }
                    }
                }

                if (!$validDurasi) {
                    $skippedCount++;
                    continue;
                }

                // Delete any existing slots in range for target class
                JadwalSlot::where('versi_id', $jadwalVersi->id)
                    ->where('hari', $slot->hari)
                    ->whereIn('jam_pelajaran_id', $jamIds)
                    ->where('kelas_id', $targetKelasId)
                    ->delete();

                // Create slots for each period
                $primaryCreated = false;
                foreach ($jamIds as $index => $jamId) {
                    JadwalSlot::create([
                        'versi_id' => $jadwalVersi->id,
                        'hari' => $slot->hari,
                        'jam_pelajaran_id' => $jamId,
                        'kelas_id' => $targetKelasId,
                        'mapel_id' => $slot->mapel_id,
                        'guru_id' => $slot->guru_id,
                        'durasi' => $primaryCreated ? 1 : $durasi,
                    ]);
                    $primaryCreated = true;
                }
                $copiedCount++;
            }
        }

        $message = "Berhasil menyalin {$copiedCount} slot jadwal ke " . count($targetKelasIds) . " kelas";
        if ($skippedCount > 0) {
            $message .= " ({$skippedCount} slot dilewati karena bentrok)";
        }

        return redirect()->route('jadwal.index', ['versi_id' => $jadwalVersi->id])
            ->with('success', $message . '.');
    }

    /**
     * Store or update a jadwal slot (grid cell).
     */
    public function storeSlot(Request $request, JadwalVersi $jadwalVersi): RedirectResponse
    {
        // Prevent editing aktif version
        if ($jadwalVersi->status === 'aktif') {
            return back()->with('error', 'Versi jadwal yang sudah AKTIF tidak dapat diedit. Silakan buat versi baru (Draf) untuk melakukan perubahan.');
        }
        $validated = $request->validate([
            'hari' => ['required', 'integer', 'min:1', 'max:6'],
            'jam_pelajaran_id' => ['required', 'exists:jam_pelajaran,id'],
            'kelas_id' => ['required', 'exists:kelas,id'],
            'mapel_id' => ['required', 'exists:mapel,id'],
            'guru_id' => ['nullable', 'exists:users,id'],
            'durasi' => ['sometimes', 'integer', 'min:1', 'max:4'],
        ]);

        $durasi = $validated['durasi'] ?? 1;
        $startJam = JamPelajaran::find($validated['jam_pelajaran_id']);
        if (!$startJam) {
            return back()->with('error', 'Jam pelajaran tidak ditemukan.');
        }

        // Pastikan start jam sinkron dengan hari yang dipilih
        if ($startJam->hari != $validated['hari']) {
            $matchedJam = JamPelajaran::where('sesi', $startJam->sesi)
                ->where('hari', $validated['hari'])
                ->where('jam_ke', $startJam->jam_ke)
                ->first();
            if ($matchedJam) {
                $startJam = $matchedJam;
            }
        }

        // Determine all jam_pelajaran_ids that will be occupied
        $jamIds = [$startJam->id];
        if ($durasi > 1) {
            for ($i = 1; $i < $durasi; $i++) {
                $nextJam = JamPelajaran::where('sesi', $startJam->sesi)
                    ->where('hari', $startJam->hari)
                    ->where('jam_ke', $startJam->jam_ke + $i)
                    ->first();
                if (!$nextJam) {
                    return back()->with('error', "Durasi {$durasi} jam melebihi jam terakhir yang tersedia (Jam ke-{$startJam->jam_ke} s.d. akhir). Maksimal " . ($i) . " jam.");
                }
                $jamIds[] = $nextJam->id;
            }
        }

        // Check teacher conflict for ALL periods this slot spans
        if ($validated['guru_id']) {
            $teacherConflict = JadwalSlot::where('versi_id', $jadwalVersi->id)
                ->where('hari', $validated['hari'])
                ->whereIn('jam_pelajaran_id', $jamIds)
                ->where('guru_id', $validated['guru_id'])
                ->where('kelas_id', '!=', $validated['kelas_id'])
                ->exists();

            if ($teacherConflict) {
                return back()->with('error', 'Bentrok Guru: Guru tersebut sudah dijadwalkan mengajar di kelas lain pada hari dan jam pelajaran yang sama.');
            }
        }

        // Check class conflict (slot already occupied by another mapel)
        $classConflict = JadwalSlot::where('versi_id', $jadwalVersi->id)
            ->where('hari', $validated['hari'])
            ->whereIn('jam_pelajaran_id', $jamIds)
            ->where('kelas_id', $validated['kelas_id'])
            ->where('mapel_id', '!=', $validated['mapel_id'])
            ->exists();

        if ($classConflict) {
            return back()->with('error', 'Bentrok Kelas: Slot tersebut sudah terisi mata pelajaran lain.');
        }

        // Delete any existing slots in the range for this class/hari/versi
        JadwalSlot::where('versi_id', $jadwalVersi->id)
            ->where('hari', $validated['hari'])
            ->whereIn('jam_pelajaran_id', $jamIds)
            ->where('kelas_id', $validated['kelas_id'])
            ->delete();

        // Create the primary slot with durasi, and subsequent slots with durasi=1 (linked)
        $primaryCreated = false;
        foreach ($jamIds as $index => $jamId) {
            if (!$primaryCreated) {
                // Primary slot - stores the full durasi
                JadwalSlot::create([
                    'versi_id' => $jadwalVersi->id,
                    'hari' => $validated['hari'],
                    'jam_pelajaran_id' => $jamId,
                    'kelas_id' => $validated['kelas_id'],
                    'mapel_id' => $validated['mapel_id'],
                    'guru_id' => $validated['guru_id'],
                    'durasi' => $durasi,
                ]);
                $primaryCreated = true;
            } else {
                // Subsequent slots - durasi=1, acts as placeholder
                JadwalSlot::create([
                    'versi_id' => $jadwalVersi->id,
                    'hari' => $validated['hari'],
                    'jam_pelajaran_id' => $jamId,
                    'kelas_id' => $validated['kelas_id'],
                    'mapel_id' => $validated['mapel_id'],
                    'guru_id' => $validated['guru_id'],
                    'durasi' => 1,
                ]);
            }
        }

        return redirect()->route('jadwal.index', ['versi_id' => $jadwalVersi->id])
            ->with('success', 'Slot jadwal berhasil disimpan' . ($durasi > 1 ? " (durasi {$durasi} jam)" : '') . '.');
    }

    /**
     * Delete a jadwal slot.
     */
    public function destroySlot(JadwalSlot $jadwalSlot): RedirectResponse
    {
        // Prevent editing aktif version
        if ($jadwalSlot->versi->status === 'aktif') {
            return back()->with('error', 'Versi jadwal yang sudah AKTIF tidak dapat diedit. Silakan buat versi baru (Draf) untuk melakukan perubahan.');
        }
        $versiId = $jadwalSlot->versi_id;
        $hari = $jadwalSlot->hari;
        $kelasId = $jadwalSlot->kelas_id;
        $mapelId = $jadwalSlot->mapel_id;
        $durasi = $jadwalSlot->durasi;

        // If this is a primary slot (durasi > 1), find and delete all related slots
        if ($durasi > 1) {
            $startJam = JamPelajaran::find($jadwalSlot->jam_pelajaran_id);
            if ($startJam) {
                $jamIds = [$startJam->id];
                for ($i = 1; $i < $durasi; $i++) {
                    $nextJam = JamPelajaran::where('sesi', $startJam->sesi)
                        ->where('hari', $hari)
                        ->where('jam_ke', $startJam->jam_ke + $i)
                        ->first();
                    if ($nextJam) {
                        $jamIds[] = $nextJam->id;
                    }
                }
                // Delete all slots in this range for this class/hari/versi with same mapel
                JadwalSlot::where('versi_id', $versiId)
                    ->where('hari', $hari)
                    ->whereIn('jam_pelajaran_id', $jamIds)
                    ->where('kelas_id', $kelasId)
                    ->where('mapel_id', $mapelId)
                    ->delete();
            } else {
                $jadwalSlot->delete();
            }
        } else {
            // Check if this slot was a placeholder of a multi-period slot
            $startJam = JamPelajaran::find($jadwalSlot->jam_pelajaran_id);
            if ($startJam) {
                $parentSlot = JadwalSlot::where('versi_id', $versiId)
                    ->where('hari', $hari)
                    ->where('kelas_id', $kelasId)
                    ->where('mapel_id', $mapelId)
                    ->where('durasi', '>', 1)
                    ->get()
                    ->first(function ($s) use ($startJam) {
                        $pJam = JamPelajaran::find($s->jam_pelajaran_id);
                        return $pJam && $startJam->jam_ke > $pJam->jam_ke && $startJam->jam_ke < ($pJam->jam_ke + $s->durasi);
                    });
                if ($parentSlot) {
                    return $this->destroySlot($parentSlot);
                }
            }
            $jadwalSlot->delete();
        }

        return redirect()->route('jadwal.index', ['versi_id' => $versiId])
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
            'sesi' => ['sometimes', 'nullable', 'string', Rule::in(['pagi', 'siang'])],
        ]);

        $startDate = Carbon::parse($validated['tanggal_mulai']);
        $endDate = Carbon::parse($validated['tanggal_selesai']);
        $sesi = $validated['sesi'] ?? null;

        // Find active version covering or overlapping range, or the currently active version
        $activeVersion = JadwalVersi::where('status', 'aktif')->first();
        if (!$activeVersion) {
            return back()->with('error', 'Tidak ada versi jadwal yang berstatus AKTIF. Terbitkan versi jadwal terlebih dahulu sebelum generate sesi.');
        }

        $slotsQuery = $activeVersion->jadwalSlot()
            ->join('jam_pelajaran', 'jadwal_slot.jam_pelajaran_id', '=', 'jam_pelajaran.id')
            ->select('jadwal_slot.*');

        if ($sesi) {
            $slotsQuery->where('jam_pelajaran.sesi', $sesi);
        }

        $slots = $slotsQuery->get();

        if ($slots->isEmpty()) {
            return back()->with('error', "Versi jadwal aktif tidak memiliki slot jadwal" . ($sesi ? " untuk sesi {$sesi}." : "."));
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

        $redirectParams = ['versi_id' => $activeVersion->id];
        if ($sesi) {
            $redirectParams['sesi'] = $sesi;
        }

        $sesiText = $sesi ? " (sesi {$sesi})" : "";
        return redirect()->route('jadwal.index', $redirectParams)
            ->with('success', "Berhasil men-generate {$generatedCount} sesi harian{$sesiText} dari tanggal {$startDate->format('d/m/Y')} s.d. {$endDate->format('d/m/Y')}.");
    }
}
