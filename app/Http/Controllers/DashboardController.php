<?php

namespace App\Http\Controllers;

use App\Models\AbsenHarian;
use App\Models\HariLibur;
use App\Models\Kelas;
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

            return Inertia::render('Kepsek/Dashboard', [
                'stats' => array_merge([
                    'total_guru' => User::where('role', 'guru')->count(),
                    'total_guru_aktif' => User::where('role', 'guru')->where('aktif', true)->count(),
                    'total_guru_piket' => User::where('role', 'guru_piket')->count(),
                    'total_tendik' => User::where('role', 'guru')->where('jenis_pegawai', 'tenaga_kependidikan')->count(),
                    'total_nonaktif' => User::where('role', '!=', 'admin')->where('aktif', false)->count(),
                    'total_siswa' => Siswa::count(),
                    'total_kelas' => $kelasAktifList->count() ?: Kelas::count(),
                    'tahun_ajaran_aktif' => $tahunAjaranAktif,
                ], $sharedAttendanceStats),
                'kelasList' => $kelasAktifList,
                'absenGuruTerbaru' => $absenGuruTerbaru,
            ]);
        }

        $absenSayaModel = AbsenHarian::query()
            ->where('user_id', $user->id)
            ->whereDate('tanggal', $todayStr)
            ->first();

        $absenHariIniFormatted = $absenSayaModel ? $this->formatPersonalAbsen($absenSayaModel, $tz) : null;

        if ($user->role === 'guru_piket') {
            return Inertia::render('Piket/Dashboard', [
                'stats' => [
                    'total_kelas' => $kelasAktifList->count() ?: Kelas::count(),
                    'tahun_ajaran_aktif' => $tahunAjaranAktif,
                ],
                'kelasList' => $kelasAktifList,
                'absenHariIni' => $absenHariIniFormatted,
                'aturanJam' => $aturanJam,
            ]);
        }

        return Inertia::render('Guru/Dashboard', [
            'piketHariIni' => User::query()
                ->where('role', 'guru_piket')
                ->where('aktif', true)
                ->get(['id', 'nama', 'no_wa']),
            'tahunAjaranAktif' => $tahunAjaranAktif,
            'absenHariIni' => $absenHariIniFormatted,
            'aturanJam' => $aturanJam,
            'logPekanIni' => $this->buildLogPekanIni($user->id, $now, $tz),
            'ringkasanBulanIni' => $this->buildRingkasanBulanIni($user->id, $now, $tz),
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
}
