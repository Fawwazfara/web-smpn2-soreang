<?php

namespace App\Http\Controllers;

use App\Models\GuruPiket;
use App\Models\JadwalSlot;
use App\Models\Kelas;
use App\Models\Sesi;
use App\Models\Siswa;
use App\Models\TahunAjaran;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the dashboard for the authenticated user's role.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $tahunAjaranAktif = TahunAjaran::where('aktif', true)->first(['id', 'nama', 'semester']);

        $kelasAktifList = Kelas::query()
            ->with('waliKelas:id,nama')
            ->withCount('siswa')
            ->when($tahunAjaranAktif, fn ($q) => $q->where('tahun_ajaran_id', $tahunAjaranAktif->id))
            ->orderBy('tingkat')
            ->orderBy('nama')
            ->get(['id', 'nama', 'tingkat', 'wali_kelas_id']);

        return match ($user->role) {
            'admin' => Inertia::render('Admin/Dashboard', [
                'stats' => [
                    'total_guru' => User::where('role', 'guru')->count(),
                    'total_guru_aktif' => User::where('role', 'guru')->where('aktif', true)->count(),
                    'total_guru_pengajar' => User::where('role', 'guru')->where('jenis_pegawai', 'guru')->count(),
                    'total_tendik' => User::where('role', 'guru')->where('jenis_pegawai', 'tenaga_kependidikan')->count(),
                    'total_guru_piket' => User::where('role', 'guru_piket')->count(),
                    'total_kepsek' => User::where('role', 'kepsek')->count(),
                    'total_nonaktif' => User::where('role', '!=', 'admin')->where('aktif', false)->count(),
                    'total_akun' => User::where('role', '!=', 'admin')->count(),
                    'total_siswa' => Siswa::count(),
                    'total_kelas' => $kelasAktifList->count() ?: Kelas::count(),
                    'tahun_ajaran_aktif' => $tahunAjaranAktif,
                ],
                'kelasList' => $kelasAktifList,
            ]),

            'guru_piket' => (function () use ($kelasAktifList, $tahunAjaranAktif, $user) {
                $todayDate = Carbon::today()->toDateString();
                $todayIso = Carbon::now()->dayOfWeekIso;

                // 1. Ambil sesi yang sudah terbuat untuk hari ini
                $sesiHariIni = Sesi::query()
                    ->whereDate('tanggal', $todayDate)
                    ->when($tahunAjaranAktif, function ($q) use ($tahunAjaranAktif) {
                        $q->whereHas('kelas', fn ($k) => $k->where('tahun_ajaran_id', $tahunAjaranAktif->id));
                    })
                    ->with([
                        'kelas:id,nama,tingkat',
                        'jamPelajaran:id,jam_ke,mulai,selesai',
                        'mapel:id,kode,nama',
                        'guru:id,nama,username',
                        'guruPengganti:id,nama,username',
                        'kodePengganti',
                    ])
                    ->get();

                // 2. Jika sesi belum di-generate dari jadwal slot, fallback tampilkan dari slot jadwal aktif hari ini
                $existingSlotIds = $sesiHariIni->pluck('slot_id')->filter()->all();
                $existingClassJamPairs = $sesiHariIni->map(fn ($s) => $s->kelas_id.'_'.$s->jam_pelajaran_id)->all();

                $slotsHariIni = JadwalSlot::query()
                    ->where('hari', $todayIso)
                    ->when($tahunAjaranAktif, function ($q) use ($tahunAjaranAktif) {
                        $q->whereHas('kelas', fn ($k) => $k->where('tahun_ajaran_id', $tahunAjaranAktif->id));
                    })
                    ->whereHas('versi', fn ($v) => $v->where('status', 'aktif'))
                    ->with([
                        'kelas:id,nama,tingkat',
                        'jamPelajaran:id,jam_ke,mulai,selesai',
                        'mapel:id,kode,nama',
                        'guru:id,nama,username',
                    ])
                    ->get();

                $listSesiMapped = $sesiHariIni->map(function ($s) use ($user) {
                    $isClaimedByCurrent = $s->guru_pengganti_id === $user->id;
                    $isClaimedAny = (bool) $s->guru_pengganti_id || $s->kodePengganti->contains(fn ($kp) => $kp->status === 'diklaim' || $kp->diklaim_oleh !== null);
                    $isLocked = ! $isClaimedByCurrent; // Terkunci jika belum diklaim oleh guru piket yang sedang login

                    return [
                        'id' => $s->id,
                        'source' => 'sesi',
                        'tanggal' => $s->tanggal->toDateString(),
                        'kelas' => $s->kelas,
                        'jam_pelajaran' => $s->jamPelajaran,
                        'mapel' => $s->mapel,
                        'guru' => $s->guru,
                        'guru_pengganti' => $s->guruPengganti,
                        'status_kunci' => $isLocked ? 'terkunci' : 'terbuka',
                        'status' => $s->status,
                        'alasan' => $s->alasan,
                    ];
                });

                // Tambahkan slot yang belum dibuat sesi (otomatis berstatus terkunci)
                foreach ($slotsHariIni as $slot) {
                    $pair = $slot->kelas_id.'_'.$slot->jam_pelajaran_id;
                    if (in_array($slot->id, $existingSlotIds, true) || in_array($pair, $existingClassJamPairs, true)) {
                        continue;
                    }

                    $listSesiMapped->push([
                        'id' => null,
                        'slot_id' => $slot->id,
                        'source' => 'slot',
                        'tanggal' => $todayDate,
                        'kelas' => $slot->kelas,
                        'jam_pelajaran' => $slot->jamPelajaran,
                        'mapel' => $slot->mapel,
                        'guru' => $slot->guru,
                        'guru_pengganti' => null,
                        'status_kunci' => 'terkunci',
                        'status' => 'terjadwal',
                        'alasan' => null,
                    ]);
                }

                $listSesiSorted = $listSesiMapped->sortBy([
                    fn ($a, $b) => ($a['jam_pelajaran']->jam_ke ?? 0) <=> ($b['jam_pelajaran']->jam_ke ?? 0),
                    fn ($a, $b) => ($a['kelas']->nama ?? '') <=> ($b['kelas']->nama ?? ''),
                ])->values();

                return Inertia::render('Piket/Dashboard', [
                    'stats' => [
                        'total_kelas' => $kelasAktifList->count() ?: Kelas::count(),
                        'total_sesi' => $listSesiSorted->count(),
                        'total_terkunci' => $listSesiSorted->where('status_kunci', 'terkunci')->count(),
                        'total_terbuka' => $listSesiSorted->where('status_kunci', 'terbuka')->count(),
                        'tahun_ajaran_aktif' => $tahunAjaranAktif,
                    ],
                    'kelasList' => $kelasAktifList,
                    'sesiHariIni' => $listSesiSorted,
                ]);
            })(),

            'kepsek' => Inertia::render('Kepsek/Dashboard', [
                'stats' => [
                    'total_guru' => User::where('role', 'guru')->count(),
                    'total_guru_aktif' => User::where('role', 'guru')->where('aktif', true)->count(),
                    'total_guru_piket' => User::where('role', 'guru_piket')->count(),
                    'total_tendik' => User::where('role', 'guru')->where('jenis_pegawai', 'tenaga_kependidikan')->count(),
                    'total_nonaktif' => User::where('role', '!=', 'admin')->where('aktif', false)->count(),
                    'total_siswa' => Siswa::count(),
                    'total_kelas' => $kelasAktifList->count() ?: Kelas::count(),
                    'tahun_ajaran_aktif' => $tahunAjaranAktif,
                ],
                'kelasList' => $kelasAktifList,
            ]),

            default => (function () use ($tahunAjaranAktif, $user) {
                $todayDate = Carbon::today()->toDateString();

                $sesiMengajarHariIni = Sesi::query()
                    ->whereDate('tanggal', $todayDate)
                    ->where('guru_id', $user->id)
                    ->with([
                        'kelas:id,nama,tingkat',
                        'jamPelajaran:id,jam_ke,mulai,selesai',
                        'mapel:id,kode,nama',
                        'guruPengganti:id,nama,username',
                        'kodePengganti' => function ($q) {
                            $q->where('status', 'aktif')
                                ->where('berlaku_sampai', '>', Carbon::now())
                                ->latest();
                        },
                    ])
                    ->get()
                    ->map(function ($s) {
                        $activeKode = $s->kodePengganti->first();

                        return [
                            'id' => $s->id,
                            'tanggal' => $s->tanggal->toDateString(),
                            'kelas' => $s->kelas,
                            'jam_pelajaran' => $s->jamPelajaran,
                            'mapel' => $s->mapel,
                            'status' => $s->status,
                            'guru_pengganti' => $s->guruPengganti,
                            'active_kode' => $activeKode ? [
                                'kode' => $activeKode->kode,
                                'berlaku_sampai' => $activeKode->berlaku_sampai->toIso8601String(),
                            ] : null,
                        ];
                    });

                return Inertia::render('Guru/Dashboard', [
                    'sesiHariIni' => $sesiMengajarHariIni,
                    'piketHariIni' => $tahunAjaranAktif
                        ? GuruPiket::query()
                            ->where('tahun_ajaran_id', $tahunAjaranAktif->id)
                            ->where('hari', Carbon::now()->dayOfWeekIso)
                            ->whereHas('user', function ($q) {
                                $q->where('role', 'guru_piket')
                                    ->where('aktif', true)
                                    ->whereNotNull('no_wa')
                                    ->where('no_wa', '!=', '');
                            })
                            ->with(['user:id,nama,username,no_wa,role,aktif'])
                            ->get()
                            ->map(function ($gp) {
                                $user = $gp->user;
                                $cleanWa = preg_replace('/[^0-9]/', '', (string) $user->no_wa);
                                if (str_starts_with($cleanWa, '0')) {
                                    $cleanWa = '62'.substr($cleanWa, 1);
                                }

                                return [
                                    'id' => $user->id,
                                    'guru_piket_id' => $gp->id,
                                    'nama' => $user->nama,
                                    'username' => $user->username,
                                    'no_wa' => $user->no_wa,
                                    'wa_phone' => $cleanWa,
                                    'hari' => $gp->hari,
                                ];
                            })
                        : [],
                    'tahunAjaranAktif' => $tahunAjaranAktif,
                ]);
            })(),
        };
    }
}
