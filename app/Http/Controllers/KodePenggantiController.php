<?php

namespace App\Http\Controllers;

use App\Models\KodePengganti;
use App\Models\Sesi;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class KodePenggantiController extends Controller
{
    /**
     * Generate 6-digit numeric replacement code for a session owned by the authenticated teacher.
     */
    public function generate(Request $request, Sesi $sesi): RedirectResponse
    {
        $user = $request->user();

        // 1. Authorize: Only session owner (guru_id) can generate code
        if ($sesi->guru_id !== $user->id) {
            abort(403, 'Anda hanya dapat men-generate kode pengganti untuk sesi mengajar milik Anda sendiri.');
        }

        // 2. Validate session is not already completed or replaced
        if ($sesi->guru_pengganti_id !== null) {
            return back()->with('error', 'Sesi ini sudah memiliki guru pengganti.');
        }

        // 3. Determine expiration time: until the session's end time on the session date
        // Format jam_pelajaran: selesai is 'HH:MM:SS'
        $sesiDate = $sesi->tanggal->toDateString();
        $jamSelesai = $sesi->jamPelajaran?->selesai ?? '15:00:00';
        $berlakuSampai = Carbon::parse("{$sesiDate} {$jamSelesai}");

        // If session end time has already passed today
        if ($berlakuSampai->isPast()) {
            return back()->with('error', 'Jam pelajaran untuk sesi ini telah selesai.');
        }

        // 4. Invalidate any existing active code for this session
        KodePengganti::query()
            ->where('sesi_id', $sesi->id)
            ->where('status', 'aktif')
            ->update(['status' => 'dibatalkan']);

        // 5. Generate a unique 6-digit numeric string
        do {
            $kode = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        } while (KodePengganti::where('kode', $kode)->exists());

        // 6. Save new replacement code
        $kodePengganti = KodePengganti::create([
            'sesi_id' => $sesi->id,
            'kode' => $kode,
            'dibuat_oleh' => $user->id,
            'berlaku_sampai' => $berlakuSampai,
            'status' => 'aktif',
        ]);

        return back()->with([
            'success' => 'Kode pengganti 6-digit berhasil dibuat.',
            'generated_kode' => [
                'sesi_id' => $sesi->id,
                'kode' => $kodePengganti->kode,
                'berlaku_sampai' => $kodePengganti->berlaku_sampai->toIso8601String(),
            ],
        ]);
    }

    /**
     * Claim code by authenticated guru_piket to unlock session.
     */
    public function klaim(Request $request): RedirectResponse
    {
        $user = $request->user();

        // 1. Authorize: Only guru_piket (or admin) can claim
        if ($user->role !== 'guru_piket' && $user->role !== 'admin') {
            abort(403, 'Hanya petugas guru piket yang berhak mengklaim kode pengganti.');
        }

        // 2. Validate input
        $request->validate([
            'kode' => ['required', 'string', 'size:6', 'regex:/^[0-9]{6}$/'],
        ], [
            'kode.required' => 'Kode unik 6-digit wajib diisi.',
            'kode.size' => 'Kode unik harus tepat 6 digit numerik.',
            'kode.regex' => 'Kode unik harus berupa angka.',
        ]);

        $kodeInput = $request->input('kode');

        // 3. Find code record
        $kodeRecord = KodePengganti::query()
            ->with(['sesi.jamPelajaran', 'sesi.kelas', 'sesi.mapel', 'sesi.guru'])
            ->where('kode', $kodeInput)
            ->first();

        if (! $kodeRecord) {
            return back()->withErrors(['kode' => 'Kode unik tidak ditemukan atau tidak valid.']);
        }

        // 4. Check if already used
        if ($kodeRecord->status === 'terpakai' || $kodeRecord->diklaim_oleh !== null) {
            return back()->withErrors(['kode' => 'Kode unik ini sudah pernah digunakan (sekali pakai).']);
        }

        // 5. Check if cancelled or inactive
        if ($kodeRecord->status !== 'aktif') {
            return back()->withErrors(['kode' => 'Kode unik sudah tidak aktif.']);
        }

        // 6. Check expiration
        if (Carbon::now()->isAfter($kodeRecord->berlaku_sampai)) {
            return back()->withErrors(['kode' => 'Kode unik telah kadaluarsa karena jam pelajaran sesi ini telah selesai.']);
        }

        $sesi = $kodeRecord->sesi;
        if (! $sesi) {
            return back()->withErrors(['kode' => 'Sesi terkait kode ini tidak ditemukan.']);
        }

        // 7. Process Claim (Unlock session & record replacement teacher)
        $now = Carbon::now();

        $kodeRecord->update([
            'status' => 'terpakai',
            'diklaim_oleh' => $user->id,
            'diklaim_pada' => $now,
        ]);

        $sesi->update([
            'guru_pengganti_id' => $user->id,
            'status' => 'digantikan',
        ]);

        return back()->with('success', "Sesi Kelas {$sesi->kelas?->nama} (Mapel: {$sesi->mapel?->nama}) berhasil dibuka! Anda tercatat sebagai guru pengganti.");
    }
}

