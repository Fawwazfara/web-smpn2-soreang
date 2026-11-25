<?php

namespace App\Http\Controllers\Guru;

use App\Events\AbsenSiswaRecorded;
use App\Http\Controllers\Controller;
use App\Models\AbsenSiswa;
use App\Models\HariLibur;
use App\Models\JadwalSlot;
use App\Models\Sesi;
use App\Models\TahunAjaran;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AbsenSesiController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $today = Carbon::today()->toDateString();
        $todayIso = Carbon::now()->dayOfWeekIso;

        if ($todayIso >= 1 && $todayIso <= 5 && ! HariLibur::whereDate('tanggal', $today)->exists()) {
            $tahunAjaranAktif = TahunAjaran::where('aktif', true)->first(['id']);
            $activeSlotsToday = JadwalSlot::query()
                ->where('hari', $todayIso)
                ->where('guru_id', $user->id)
                ->when($tahunAjaranAktif, function ($q) use ($tahunAjaranAktif) {
                    $q->whereHas('kelas', fn ($k) => $k->where('tahun_ajaran_id', $tahunAjaranAktif->id));
                })
                ->whereHas('versi', fn ($v) => $v->where('status', 'aktif'))
                ->get();

            foreach ($activeSlotsToday as $slot) {
                $exists = Sesi::query()
                    ->whereDate('tanggal', $today)
                    ->where('kelas_id', $slot->kelas_id)
                    ->where('jam_pelajaran_id', $slot->jam_pelajaran_id)
                    ->exists();

                if (! $exists) {
                    Sesi::create([
                        'tanggal' => $today,
                        'kelas_id' => $slot->kelas_id,
                        'jam_pelajaran_id' => $slot->jam_pelajaran_id,
                        'mapel_id' => $slot->mapel_id,
                        'guru_id' => $slot->guru_id,
                        'slot_id' => $slot->id,
                        'status' => 'terjadwal',
                    ]);
                }
            }
        }

        $sesi = Sesi::with(['kelas', 'mapel', 'jamPelajaran', 'guru', 'guruPengganti'])
            ->whereDate('tanggal', $today)
            ->where(function ($q) use ($user) {
                $q->where('guru_id', $user->id)
                    ->orWhere('guru_pengganti_id', $user->id);
            })
            ->orderBy('jam_pelajaran_id')
            ->first();

        if ($sesi) {
            return redirect()->route('guru.absen-sesi.show', $sesi);
        }

        return Inertia::render('Guru/AbsenSiswa/Index', [
            'sesi' => null,
            'sesiBerjalan' => [],
            'siswas' => [],
            'absenMap' => [],
            'auth' => ['user' => $user],
        ]);
    }

    public function show(Request $request, Sesi $sesi)
    {
        $user = $request->user();
        $this->authorize($user, $sesi);

        $sesi->load([
            'kelas',
            'mapel',
            'jamPelajaran',
            'guru:id,nama,username',
            'guruPengganti:id,nama,username',
            'slot',
            'kodePengganti' => function ($q) {
                $q->where('status', 'aktif')
                    ->where('berlaku_sampai', '>', Carbon::now())
                    ->latest();
            },
        ]);

        $today = $sesi->tanggal ? $sesi->tanggal->toDateString() : Carbon::today()->toDateString();
        $sesiBerjalan = Sesi::with(['kelas', 'mapel', 'jamPelajaran', 'guru:id,nama,username', 'guruPengganti:id,nama,username', 'slot'])
            ->whereDate('tanggal', $today)
            ->where(function ($q) use ($user) {
                $q->where('guru_id', $user->id)
                    ->orWhere('guru_pengganti_id', $user->id);
            })
            ->orderBy('jam_pelajaran_id')
            ->get();

        $siswas = $sesi->kelas
            ? $sesi->kelas->siswa()->where('aktif', true)->orderBy('nama')->get()
            : collect();

        $absenMap = AbsenSiswa::where('sesi_id', $sesi->id)
            ->get()
            ->keyBy('siswa_id');

        return Inertia::render('Guru/AbsenSiswa/Index', [
            'sesi' => $sesi,
            'sesiBerjalan' => $sesiBerjalan,
            'siswas' => $siswas,
            'absenMap' => $absenMap,
            'auth' => ['user' => $user],
        ]);
    }

    public function store(Request $request, Sesi $sesi)
    {
        $user = $request->user();
        $this->authorize($user, $sesi);

        $validated = $request->validate([
            'absen' => ['required', 'array'],
            'absen.*.siswa_id' => ['required', 'integer', 'exists:siswa,id'],
            'absen.*.status' => ['required', 'in:H,S,I,A'],
            'absen.*.catatan' => ['nullable', 'string', 'max:500'],
            'jurnal_kbm' => ['nullable', 'string', 'max:2000'],
        ]);

        foreach ($validated['absen'] as $item) {
            $existing = AbsenSiswa::where('sesi_id', $sesi->id)
                ->where('siswa_id', $item['siswa_id'])
                ->first();

            $konfirmasiToken = null;
            $tokenBerlakuSampai = null;
            $statusKonfirmasi = 'tidak perlu';

            if (in_array($item['status'], ['S', 'I'])) {
                if ($existing && $existing->konfirmasi_token && $existing->token_berlaku_sampai?->isFuture()) {
                    $konfirmasiToken = $existing->konfirmasi_token;
                    $tokenBerlakuSampai = $existing->token_berlaku_sampai;
                    $statusKonfirmasi = $existing->status_konfirmasi ?? 'menunggu';
                } else {
                    $konfirmasiToken = Str::random(32);
                    $tokenBerlakuSampai = now()->addDays(7);
                    $statusKonfirmasi = 'menunggu';
                }
            }

            $absenSiswa = AbsenSiswa::updateOrCreate(
                ['sesi_id' => $sesi->id, 'siswa_id' => $item['siswa_id']],
                [
                    'status' => $item['status'],
                    'catatan' => $item['catatan'] ?? null,
                    'dicatat_oleh' => $user->id,
                    'waktu' => now(),
                    'konfirmasi_token' => $konfirmasiToken,
                    'token_berlaku_sampai' => $tokenBerlakuSampai,
                    'status_konfirmasi' => $statusKonfirmasi,
                ]
            );

            if (in_array($item['status'], ['A', 'S', 'I'])) {
                event(new AbsenSiswaRecorded($absenSiswa, $user->id));
            }
        }

        if (isset($validated['jurnal_kbm'])) {
            $sesi->update(['alasan' => $validated['jurnal_kbm']]);
        }

        return back()->with('success', 'Presensi berhasil disimpan.');
    }

    private function authorize($user, Sesi $sesi): void
    {
        $isAdmin = $user->role === 'admin';
        $isGuru = $user->id === $sesi->guru_id;
        $isPengganti = $user->id === $sesi->guru_pengganti_id;

        if (! $isAdmin && ! $isGuru && ! $isPengganti) {
            abort(403, 'Anda tidak berwenang mengisi presensi sesi ini.');
        }
    }
}

