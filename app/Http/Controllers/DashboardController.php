<?php

namespace App\Http\Controllers;

use App\Models\AbsenHarian;
use App\Models\GuruPiket;
use App\Models\HariLibur;
use App\Models\JadwalSlot;
use App\Models\JamPelajaran;
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
        $tz = config('absensi.timezone', 'Asia/Jakarta');
        $now = Carbon::now($tz);
        $todayStr = $now->toDateString();

        $tahunAjaranAktif = TahunAjaran::where('aktif', true)->first(['id', 'nama', 'semester']);

        $kelasAktifList = Kelas::query()
            ->with('waliKelas:id,nama')
            ->withCount('siswa')
            ->when($tahunAjaranAktif, fn ($q) => $q->where('tahun_ajaran_id', $tahunAjaranAktif->id))
            ->orderBy('tingkat')
            ->orderBy('nama')
            ->get(['id', 'nama', 'tingkat', 'wali_kelas_id']);

        $jamMasuk = (string) config('absensi.jam_masuk', '07:00');
        $toleransiMenit = (int) config('absensi.toleransi_menit', 15);
        $batasTepatWaktu = Carbon::createFromFormat('Y-m-d H:i', $todayStr.' '.$jamMasuk, $tz)
            ->addMinutes($toleransiMenit)
            ->format('H:i');
        $jamPulang = (string) config('absensi.jam_pulang', '14:30');

        $aturanJam = [
            'timezone' => $tz,
            'tanggal_hari_ini' => $todayStr,
            'jam_masuk' => $jamMasuk,
            'toleransi_menit' => $toleransiMenit,
            'batas_tepat_waktu' => $batasTepatWaktu,
            'jam_pulang' => $jamPulang,
            'server_now_iso' => $now->toIso8601String(),
            'sekolah' => config('absensi.sekolah'),
        ];

        if (in_array($user->role, ['admin', 'kepsek'], true)) {
            $pegawaiWajib = User::query()
                ->whereIn('role', ['guru', 'guru_piket'])
                ->where('aktif', true)
                ->orderBy('nama')
                ->get(['id', 'nama', 'username', 'role', 'jenis_pegawai', 'no_wa']);

            $totalWajibAbsen = $pegawaiWajib->count();
            $absenHariIniList = AbsenHarian::query()
                ->with('user:id,nama,username,role,jenis_pegawai,no_wa')
                ->whereIn('user_id', $pegawaiWajib->pluck('id'))
                ->whereDate('tanggal', $todayStr)
                ->orderByDesc('waktu_masuk')
                ->get();

            $absenByUser = $absenHariIniList->keyBy('user_id');
            $hadirHariIni = $absenHariIniList->count();
            $tepatWaktuHariIni = $absenHariIniList->where('status', 'tepat waktu')->count();
            $terlambatHariIni = $absenHariIniList->where('status', 'terlambat')->count();
            $sudahPulangHariIni = $absenHariIniList->whereNotNull('waktu_pulang')->count();
            $belumAbsenHariIni = max(0, $totalWajibAbsen - $hadirHariIni);
            $persentaseHadir = $totalWajibAbsen > 0
                ? round(($hadirHariIni / $totalWajibAbsen) * 100, 1)
                : 0.0;

            $absenGuruTerbaru = $absenHariIniList->take(6)->map(function (AbsenHarian $item) use ($tz) {
                $u = $item->user;
                $waktuMasuk = $item->waktu_masuk ? Carbon::parse($item->waktu_masuk)->setTimezone($tz) : null;
                $waktuPulang = $item->waktu_pulang ? Carbon::parse($item->waktu_pulang)->setTimezone($tz) : null;
                $jabatan = $u?->role === 'guru_piket'
                    ? 'Guru Piket'
                    : ($u?->jenis_pegawai === 'tenaga_kependidikan' ? 'Tenaga Kependidikan' : 'Guru Pengajar');

                return [
                    'id' => $item->id,
                    'nama' => $u?->nama ?? '-',
                    'username' => $u?->username ?? '-',
                    'jabatan_label' => $jabatan,
                    'jam_masuk' => $waktuMasuk ? $waktuMasuk->format('H:i').' WIB' : '-',
                    'jam_pulang' => $waktuPulang ? $waktuPulang->format('H:i').' WIB' : null,
                    'status' => $item->status,
                    'keterangan' => $item->keterangan ?: 'Kamera Live Terverifikasi',
                    'foto_url' => $item->foto_path ? route('absen-harian.foto', $item->id) : null,
                ];
            })->values();

            $piketAktif = $pegawaiWajib
                ->where('role', 'guru_piket')
                ->values()
                ->map(function (User $piket) use ($absenByUser, $tz) {
                    /** @var AbsenHarian|null $rec */
                    $rec = $absenByUser->get($piket->id);
                    $waktuMasuk = $rec?->waktu_masuk ? Carbon::parse($rec->waktu_masuk)->setTimezone($tz) : null;

                    return [
                        'id' => $piket->id,
                        'nama' => $piket->nama,
                        'username' => $piket->username,
                        'no_wa' => $piket->no_wa,
                        'sudah_absen' => $rec !== null,
                        'jam_masuk' => $waktuMasuk ? $waktuMasuk->format('H:i').' WIB' : null,
                        'status' => $rec?->status,
                    ];
                });

            $sharedAttendanceStats = [
                'total_wajib_absen' => $totalWajibAbsen,
                'hadir_hari_ini' => $hadirHariIni,
                'tepat_waktu_hari_ini' => $tepatWaktuHariIni,
                'terlambat_hari_ini' => $terlambatHariIni,
                'sudah_pulang_hari_ini' => $sudahPulangHariIni,
                'belum_absen_hari_ini' => $belumAbsenHariIni,
                'persentase_hadir_hari_ini' => number_format($persentaseHadir, 1, '.', ''),
            ];

            if ($user->role === 'admin') {
                return Inertia::render('Admin/Dashboard', [
                    'stats' => array_merge([
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
                    ], $sharedAttendanceStats),
                    'kelasList' => $kelasAktifList,
                    'absenGuruTerbaru' => $absenGuruTerbaru,
                    'piketHariIni' => $piketAktif,
                ]);
            }

            $todayIso = $now->dayOfWeekIso;
            $sesiBundle = $this->buildSesiHariIni($todayStr, $todayIso, $tahunAjaranAktif, $now, $tz);
            $sesiHariIni = $sesiBundle['list'];
            $sesiStats = $sesiBundle['stats'];

            $daftarAbsenHariIni = $pegawaiWajib->map(function (User $u) use ($absenByUser, $tz) {
                /** @var AbsenHarian|null $rec */
                $rec = $absenByUser->get($u->id);
                $waktuMasuk = $rec?->waktu_masuk ? Carbon::parse($rec->waktu_masuk)->setTimezone($tz) : null;
                $waktuPulang = $rec?->waktu_pulang ? Carbon::parse($rec->waktu_pulang)->setTimezone($tz) : null;
                $waktuAmbil = $rec?->waktu_ambil ? Carbon::parse($rec->waktu_ambil)->setTimezone($tz) : null;
                $jabatan = $u->role === 'guru_piket'
                    ? 'Guru Piket'
                    : ($u->jenis_pegawai === 'tenaga_kependidikan' ? 'Tenaga Kependidikan' : 'Guru Pengajar');

                return [
                    'id' => $u->id,
                    'absen_id' => $rec?->id,
                    'nama' => $u->nama,
                    'username' => $u->username,
                    'role' => $u->role,
                    'jenis_pegawai' => $u->jenis_pegawai,
                    'jabatan_label' => $jabatan,
                    'no_wa' => $u->no_wa,
                    'sudah_absen' => $rec !== null,
                    'status' => $rec ? $rec->status : 'belum_absen',
                    'jam_masuk' => $waktuMasuk ? $waktuMasuk->format('H:i').' WIB' : '-',
                    'jam_pulang' => $waktuPulang ? $waktuPulang->format('H:i').' WIB' : null,
                    'waktu_ambil' => $waktuAmbil ? $waktuAmbil->format('H:i:s').' WIB' : null,
                    'keterangan' => $rec?->keterangan ?: ($rec ? 'Kamera Live Terverifikasi' : 'Belum melakukan presensi hari ini'),
                    'foto_url' => $rec?->foto_path ? route('absen-harian.foto', $rec->id) : null,
                    'ip_address' => $rec?->ip_address,
                    'user_agent' => $rec?->user_agent,
                    'sumber' => $rec?->sumber,
                ];
            });

            return Inertia::render('Kepsek/Dashboard', [
                'stats' => array_merge([
                    'total_guru' => User::where('role', 'guru')->count(),
                    'total_guru_aktif' => User::where('role', 'guru')->where('aktif', true)->count(),
                    'total_guru_pengajar' => User::where('role', 'guru')->where('jenis_pegawai', 'guru')->count(),
                    'total_tendik' => User::where('role', 'guru')->where('jenis_pegawai', 'tenaga_kependidikan')->count(),
                    'total_guru_piket' => User::where('role', 'guru_piket')->count(),
                    'total_kepsek' => User::where('role', 'kepsek')->count(),
                    'total_nonaktif' => User::where('role', '!=', 'admin')->where('aktif', false)->count(),
                    'total_siswa' => Siswa::count(),
                    'total_kelas' => $kelasAktifList->count() ?: Kelas::count(),
                    'tahun_ajaran_aktif' => $tahunAjaranAktif,
                ], $sharedAttendanceStats, $sesiStats),
                'kelasList' => $kelasAktifList,
                'absenGuruTerbaru' => $absenGuruTerbaru,
                'daftarAbsenHariIni' => $daftarAbsenHariIni,
                'sesiHariIni' => $sesiHariIni,
                'sesiStats' => $sesiStats,
                'piketHariIni' => $piketAktif,
                'aturanJam' => $aturanJam,
            ]);
        }

        $absenSayaModel = AbsenHarian::query()
            ->where('user_id', $user->id)
            ->whereDate('tanggal', $todayStr)
            ->first();

        $absenHariIniFormatted = $absenSayaModel ? $this->formatPersonalAbsen($absenSayaModel, $tz) : null;

        if ($user->role === 'guru_piket') {
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
                'absenHariIni' => $absenHariIniFormatted,
                'aturanJam' => $aturanJam,
            ]);
        }

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

        $piketHariIni = $tahunAjaranAktif
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
            : [];

        return Inertia::render('Guru/Dashboard', [
            'sesiHariIni' => $sesiMengajarHariIni,
            'piketHariIni' => $piketHariIni,
            'tahunAjaranAktif' => $tahunAjaranAktif,
            'absenHariIni' => $absenHariIniFormatted,
            'aturanJam' => $aturanJam,
            'logPekanIni' => $this->buildLogPekanIni($user->id, $now, $tz),
            'ringkasanBulanIni' => $this->buildRingkasanBulanIni($user->id, $now, $tz),
            'faceProfile' => AbsenHarianController::buildFaceProfile($user, $tz),
            'flashStatus' => session('status'),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    protected function formatPersonalAbsen(AbsenHarian $item, string $tz): array
    {
        $waktuMasuk = $item->waktu_masuk ? Carbon::parse($item->waktu_masuk)->setTimezone($tz) : null;
        $waktuPulang = $item->waktu_pulang ? Carbon::parse($item->waktu_pulang)->setTimezone($tz) : null;

        return [
            'id' => $item->id,
            'tanggal' => Carbon::parse($item->tanggal, $tz)->toDateString(),
            'jam_masuk' => $waktuMasuk ? $waktuMasuk->format('H:i').' WIB' : '-',
            'jam_masuk_short' => $waktuMasuk ? $waktuMasuk->format('H:i') : '-',
            'jam_pulang' => $waktuPulang ? $waktuPulang->format('H:i').' WIB' : null,
            'status' => $item->status,
            'keterangan' => $item->keterangan ?: 'Kamera Live Terverifikasi',
            'foto_url' => $item->foto_path ? route('absen-harian.foto', $item->id) : null,
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    protected function buildLogPekanIni(int $userId, Carbon $now, string $tz): array
    {
        $dates = collect([$now->copy()]);
        $cursor = $now->copy()->subDay();

        while ($dates->count() < 3) {
            if ($cursor->dayOfWeekIso <= 5) {
                $dates->prepend($cursor->copy());
            }
            $cursor->subDay();
        }

        $dateStrings = $dates->map(fn (Carbon $d) => $d->toDateString())->all();
        $records = AbsenHarian::query()
            ->where('user_id', $userId)
            ->whereIn('tanggal', $dateStrings)
            ->get()
            ->keyBy(fn (AbsenHarian $a) => Carbon::parse($a->tanggal, $tz)->toDateString());

        $hariMap = [
            1 => 'Senin',
            2 => 'Selasa',
            3 => 'Rabu',
            4 => 'Kamis',
            5 => 'Jumat',
            6 => 'Sabtu',
            7 => 'Minggu',
        ];
        $bulanMap = [
            1 => 'Jan', 2 => 'Feb', 3 => 'Mar', 4 => 'Apr', 5 => 'Mei', 6 => 'Jun',
            7 => 'Jul', 8 => 'Agu', 9 => 'Sep', 10 => 'Okt', 11 => 'Nov', 12 => 'Des',
        ];

        $todayStr = $now->toDateString();

        return $dates->map(function (Carbon $dt) use ($records, $hariMap, $bulanMap, $todayStr, $tz) {
            $dateStr = $dt->toDateString();
            /** @var AbsenHarian|null $rec */
            $rec = $records->get($dateStr);
            $isToday = $dateStr === $todayStr;
            $label = sprintf(
                '%s, %02d %s',
                $hariMap[$dt->dayOfWeekIso] ?? '',
                $dt->day,
                $bulanMap[$dt->month] ?? ''
            );

            if ($rec) {
                $waktuMasuk = $rec->waktu_masuk ? Carbon::parse($rec->waktu_masuk)->setTimezone($tz)->format('H:i') : '-';

                return [
                    'tanggal' => $dateStr,
                    'label' => $label,
                    'jam' => $waktuMasuk,
                    'status_text' => $rec->status === 'tepat waktu' ? 'Tepat Waktu' : 'Terlambat',
                    'tone' => $rec->status === 'tepat waktu' ? 'emerald' : 'amber',
                    'is_today' => $isToday,
                ];
            }

            if ($isToday) {
                return [
                    'tanggal' => $dateStr,
                    'label' => $label,
                    'jam' => 'Proses',
                    'status_text' => 'Standby Sesi',
                    'tone' => 'today_pending',
                    'is_today' => true,
                ];
            }

            return [
                'tanggal' => $dateStr,
                'label' => $label,
                'jam' => '--:--',
                'status_text' => 'Belum Absen',
                'tone' => 'muted',
                'is_today' => false,
            ];
        })->values()->all();
    }

    /**
     * @return array<string, mixed>
     */
    protected function buildRingkasanBulanIni(int $userId, Carbon $now, string $tz): array
    {
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfDay();

        $riwayat = AbsenHarian::query()
            ->where('user_id', $userId)
            ->whereBetween('tanggal', [$startOfMonth->toDateString(), $now->copy()->endOfMonth()->toDateString()])
            ->get();

        $liburSet = HariLibur::query()
            ->whereBetween('tanggal', [$startOfMonth->toDateString(), $endOfMonth->toDateString()])
            ->pluck('tanggal')
            ->map(fn ($d) => Carbon::parse($d)->toDateString())
            ->flip();

        $hariKerja = 0;
        $cursor = $startOfMonth->copy();
        while ($cursor->lte($endOfMonth)) {
            if ($cursor->dayOfWeekIso <= 5 && ! $liburSet->has($cursor->toDateString())) {
                $hariKerja++;
            }
            $cursor->addDay();
        }

        $totalHadir = $riwayat->count();
        $hariKerjaEfektif = max(1, max($hariKerja, $totalHadir));
        $tepatWaktu = $riwayat->where('status', 'tepat waktu')->count();
        $terlambat = $riwayat->where('status', 'terlambat')->count();
        $persentase = round(min(100, ($totalHadir / $hariKerjaEfektif) * 100), 1);

        $bulanNama = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember',
        ][$now->month] ?? '';

        return [
            'bulan_label' => 'Bulan '.$bulanNama,
            'hari_kerja_efektif' => $hariKerjaEfektif,
            'total_hadir' => $totalHadir,
            'hadir_tepat_waktu' => $tepatWaktu,
            'terlambat' => $terlambat,
            'persentase_kehadiran' => number_format($persentase, 1, '.', ''),
        ];
    }

    /**
     * Build today's active sessions combined with active slots for monitoring.
     *
     * @return array{list: \Illuminate\Support\Collection, stats: array<string, int>}
     */
    protected function buildSesiHariIni(
        string $todayDate,
        int $todayIso,
        ?TahunAjaran $tahunAjaranAktif,
        Carbon $now,
        string $tz
    ): array {
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

        $list = collect();

        foreach ($sesiHariIni as $s) {
            $jam = $s->jamPelajaran;
            $statusPelaksanaan = $this->determineStatusPelaksanaan($s->status, $jam, $todayDate, $now, $tz);
            $isDigantikan = $s->guru_pengganti_id !== null;

            $list->push([
                'id' => $s->id,
                'slot_id' => $s->slot_id,
                'source' => 'sesi',
                'tanggal' => $s->tanggal ? Carbon::parse($s->tanggal, $tz)->toDateString() : $todayDate,
                'kelas' => $s->kelas,
                'jam_pelajaran' => $jam,
                'mapel' => $s->mapel,
                'guru' => $s->guru,
                'guru_pengganti' => $s->guruPengganti,
                'is_digantikan' => $isDigantikan,
                'status_pelaksanaan' => $statusPelaksanaan,
                'status' => $s->status,
                'alasan' => $s->alasan,
            ]);
        }

        foreach ($slotsHariIni as $slot) {
            $pair = $slot->kelas_id.'_'.$slot->jam_pelajaran_id;
            if (in_array($slot->id, $existingSlotIds, true) || in_array($pair, $existingClassJamPairs, true)) {
                continue;
            }

            $jam = $slot->jamPelajaran;
            $statusPelaksanaan = $this->determineStatusPelaksanaan('terjadwal', $jam, $todayDate, $now, $tz);

            $list->push([
                'id' => null,
                'slot_id' => $slot->id,
                'source' => 'slot',
                'tanggal' => $todayDate,
                'kelas' => $slot->kelas,
                'jam_pelajaran' => $jam,
                'mapel' => $slot->mapel,
                'guru' => $slot->guru,
                'guru_pengganti' => null,
                'is_digantikan' => false,
                'status_pelaksanaan' => $statusPelaksanaan,
                'status' => 'terjadwal',
                'alasan' => null,
            ]);
        }

        $sorted = $list->sortBy([
            fn ($a, $b) => ($a['jam_pelajaran']->jam_ke ?? 0) <=> ($b['jam_pelajaran']->jam_ke ?? 0),
            fn ($a, $b) => ($a['kelas']->tingkat ?? 0) <=> ($b['kelas']->tingkat ?? 0),
            fn ($a, $b) => ($a['kelas']->nama ?? '') <=> ($b['kelas']->nama ?? ''),
        ])->values();

        $stats = [
            'total_sesi' => $sorted->count(),
            'sesi_berlangsung' => $sorted->where('status_pelaksanaan', 'berlangsung')->count(),
            'sesi_selesai' => $sorted->where('status_pelaksanaan', 'selesai')->count(),
            'sesi_terjadwal' => $sorted->where('status_pelaksanaan', 'terjadwal')->count(),
            'sesi_digantikan' => $sorted->where('is_digantikan', true)->count(),
        ];

        return [
            'list' => $sorted,
            'stats' => $stats,
        ];
    }

    /**
     * Determine real-time execution status of a session based on current time.
     */
    protected function determineStatusPelaksanaan(
        ?string $dbStatus,
        ?JamPelajaran $jam,
        string $todayDate,
        Carbon $now,
        string $tz
    ): string {
        if (in_array($dbStatus, ['dibatalkan', 'libur', 'selesai'], true)) {
            return $dbStatus;
        }

        if (! $jam || ! $jam->mulai || ! $jam->selesai) {
            return $dbStatus ?: 'terjadwal';
        }

        try {
            $mulai = Carbon::parse($todayDate.' '.$jam->mulai, $tz);
            $selesai = Carbon::parse($todayDate.' '.$jam->selesai, $tz);

            if ($now->lt($mulai)) {
                return 'terjadwal';
            }
            if ($now->between($mulai, $selesai)) {
                return 'berlangsung';
            }

            return 'selesai';
        } catch (\Throwable) {
            return $dbStatus ?: 'terjadwal';
        }
    }
}
