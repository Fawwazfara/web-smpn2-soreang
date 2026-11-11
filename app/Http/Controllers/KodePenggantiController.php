<?php

namespace App\Http\Controllers;

use App\Models\KodePengganti;
use App\Models\Sesi;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Validator;

class KodePenggantiController extends Controller
{
    protected const MAX_CLAIM_ATTEMPTS = 5;

    protected const DECAY_SECONDS = 60;

    public function generate(Request $request, Sesi $sesi): RedirectResponse
    {
        $user = $request->user();

        if ($sesi->guru_id !== $user->id) {
            abort(403, 'Anda hanya dapat men-generate kode pengganti untuk sesi mengajar milik Anda sendiri.');
        }

        if ($sesi->guru_pengganti_id !== null || $sesi->status === 'digantikan') {
            return back()->with('error', 'Sesi ini sudah memiliki guru pengganti.');
        }

        if (in_array($sesi->status, ['selesai', 'dibatalkan', 'libur'], true)) {
            return back()->with('error', 'Kode pengganti tidak dapat dibuat untuk sesi yang sudah selesai, dibatalkan, atau libur.');
        }

        if ($sesi->tanggal->isBefore(Carbon::today())) {
            return back()->with('error', 'Jam pelajaran untuk sesi ini telah selesai.');
        }

        $sesiDate = $sesi->tanggal->toDateString();
        $jamSelesai = $sesi->jamPelajaran?->selesai ?? '15:00:00';
        $berlakuSampai = Carbon::parse("{$sesiDate} {$jamSelesai}");

        if ($berlakuSampai->isPast()) {
            $berlakuSampai = Carbon::now()->endOfDay();
        }

        KodePengganti::query()
            ->where('sesi_id', $sesi->id)
            ->where('status', 'aktif')
            ->update(['status' => 'kadaluarsa']);

        do {
            $kode = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        } while (KodePengganti::where('kode', $kode)->exists());

        $kodePengganti = KodePengganti::create([
            'sesi_id' => $sesi->id,
            'kode' => $kode,
            'dibuat_oleh' => $user->id,
            'berlaku_sampai' => $berlakuSampai,
            'status' => 'aktif',
        ]);

        $sesi->loadMissing(['kelas:id,nama', 'mapel:id,nama', 'jamPelajaran:id,jam_ke']);

        return back()->with([
            'success' => 'Kode pengganti 6-digit berhasil dibuat.',
            'generated_kode' => [
                'sesi_id' => $sesi->id,
                'kode' => $kodePengganti->kode,
                'berlaku_sampai' => $kodePengganti->berlaku_sampai->toIso8601String(),
                'kelas' => $sesi->kelas?->nama,
                'mapel' => $sesi->mapel?->nama,
                'jam_ke' => $sesi->jamPelajaran?->jam_ke,
            ],
        ]);
    }

    public function klaim(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->role !== 'guru_piket' && $user->role !== 'admin') {
            abort(403, 'Hanya petugas guru piket yang berhak mengklaim kode pengganti.');
        }

        $throttleKey = $this->claimThrottleKey($request);

        if (RateLimiter::tooManyAttempts($throttleKey, self::MAX_CLAIM_ATTEMPTS)) {
            $seconds = RateLimiter::availableIn($throttleKey);

            return back()->withErrors([
                'kode' => "Terlalu banyak percobaan input kode. Silakan tunggu {$seconds} detik sebelum mencoba kembali.",
            ]);
        }

        $validator = Validator::make($request->all(), [
            'kode' => ['required', 'string', 'size:6', 'regex:/^[0-9]{6}$/'],
            'sesi_id' => ['nullable', 'integer'],
        ], [
            'kode.required' => 'Kode unik 6-digit wajib diisi.',
            'kode.size' => 'Kode unik harus tepat 6 digit numerik.',
            'kode.regex' => 'Kode unik harus berupa angka.',
        ]);

        if ($validator->fails()) {
            RateLimiter::hit($throttleKey, self::DECAY_SECONDS);

            return back()->withErrors($validator)->withInput();
        }

        $kodeInput = (string) $request->input('kode');

        $kodeRecord = KodePengganti::query()
            ->with(['sesi.jamPelajaran', 'sesi.kelas', 'sesi.mapel', 'sesi.guru'])
            ->where('kode', $kodeInput)
            ->first();

        if (! $kodeRecord) {
            RateLimiter::hit($throttleKey, self::DECAY_SECONDS);

            return back()->withErrors(['kode' => 'Kode unik tidak ditemukan atau tidak valid.']);
        }

        if ($kodeRecord->status === 'terpakai' || $kodeRecord->diklaim_oleh !== null) {
            RateLimiter::hit($throttleKey, self::DECAY_SECONDS);

            return back()->withErrors(['kode' => 'Kode unik ini sudah pernah digunakan (sekali pakai).']);
        }

        if ($kodeRecord->status !== 'aktif') {
            RateLimiter::hit($throttleKey, self::DECAY_SECONDS);

            return back()->withErrors(['kode' => 'Kode unik sudah tidak aktif.']);
        }

        if (Carbon::now()->isAfter($kodeRecord->berlaku_sampai)) {
            RateLimiter::hit($throttleKey, self::DECAY_SECONDS);

            return back()->withErrors(['kode' => 'Kode unik telah kadaluarsa karena jam pelajaran sesi ini telah selesai.']);
        }

        $sesi = $kodeRecord->sesi;
        if (! $sesi) {
            RateLimiter::hit($throttleKey, self::DECAY_SECONDS);

            return back()->withErrors(['kode' => 'Sesi terkait kode ini tidak ditemukan.']);
        }

        if ($request->filled('sesi_id') && (int) $kodeRecord->sesi_id !== (int) $request->input('sesi_id')) {
            RateLimiter::hit($throttleKey, self::DECAY_SECONDS);

            return back()->withErrors([
                'kode' => 'Kode unik ini hanya berlaku untuk sesi terkait dan tidak dapat digunakan untuk membuka sesi atau kelas lain.',
            ]);
        }

        if ($sesi->guru_pengganti_id !== null) {
            RateLimiter::hit($throttleKey, self::DECAY_SECONDS);

            return back()->withErrors(['kode' => 'Sesi ini sudah memiliki guru pengganti.']);
        }

        RateLimiter::clear($throttleKey);

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

    protected function claimThrottleKey(Request $request): string
    {
        return 'klaim-kode:'.($request->user()?->id ?? 'guest').'|'.$request->ip();
    }
}

