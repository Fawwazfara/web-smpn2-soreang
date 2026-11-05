<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAbsenHarianRequest;
use App\Models\AbsenHarian;
use App\Models\GuruPiket;
use App\Models\HariLibur;
use App\Models\JadwalSlot;
use App\Models\TahunAjaran;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AbsenHarianController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $tz = config('absensi.timezone', 'Asia/Jakarta');
        $now = Carbon::now($tz);
        $todayStr = $now->toDateString();

        $bulanInput = (string) $request->input('bulan', $now->format('Y-m'));
        $bulan = preg_match('/^\d{4}-(0[1-9]|1[0-2])$/', $bulanInput)
            ? $bulanInput
            : $now->format('Y-m');

        $startOfMonth = Carbon::createFromFormat('Y-m-d', $bulan.'-01', $tz)->startOfMonth();
        $endOfMonth = $startOfMonth->copy()->endOfMonth();

        $absenHariIniModel = AbsenHarian::query()
            ->where('user_id', $user->id)
            ->whereDate('tanggal', $todayStr)
            ->first();

        $riwayatModels = AbsenHarian::query()
            ->where('user_id', $user->id)
            ->whereBetween('tanggal', [$startOfMonth->toDateString(), $endOfMonth->toDateString()])
            ->orderByDesc('tanggal')
            ->get();

        $hariKerjaEfektif = $this->hitungHariKerjaEfektif($startOfMonth, $endOfMonth, $now, $riwayatModels->count());
        $hadirTepatWaktu = $riwayatModels->where('status', 'tepat waktu')->count();
        $terlambatCount = $riwayatModels->where('status', 'terlambat')->count();
        $izinCount = $riwayatModels->whereNotIn('status', ['tepat waktu', 'terlambat'])->count();
        $totalHadir = $riwayatModels->count();
        $persentaseKehadiran = $hariKerjaEfektif > 0
            ? round(min(100, ($totalHadir / $hariKerjaEfektif) * 100), 1)
            : 100.0;

        $tahunAjaranAktif = TahunAjaran::query()
            ->where('aktif', true)
            ->first(['id', 'nama', 'semester']);

        $agendaHariIni = JadwalSlot::query()
            ->with([
                'kelas:id,nama,tingkat',
                'mapel:id,nama,kode',
                'jamPelajaran:id,jam_ke,mulai,selesai',
            ])
            ->where('guru_id', $user->id)
            ->where('hari', $now->dayOfWeekIso)
            ->whereHas('versi', fn ($q) => $q->where('status', 'aktif'))
            ->get()
            ->sortBy(fn (JadwalSlot $slot) => $slot->jamPelajaran?->jam_ke ?? 99)
            ->values()
            ->map(fn (JadwalSlot $slot) => [
                'id' => $slot->id,
                'kelas_nama' => $slot->kelas?->nama ?? '-',
                'mapel_nama' => $slot->mapel?->nama ?? '-',
                'jam_ke' => $slot->jamPelajaran?->jam_ke,
                'mulai' => substr((string) ($slot->jamPelajaran?->mulai ?? ''), 0, 5),
                'selesai' => substr((string) ($slot->jamPelajaran?->selesai ?? ''), 0, 5),
            ]);

        $jadwalPiketHariIni = GuruPiket::query()
            ->with('user:id,nama')
            ->where('hari', $now->dayOfWeekIso)
            ->when($tahunAjaranAktif, fn ($q) => $q->where('tahun_ajaran_id', $tahunAjaranAktif->id))
            ->get();

        $sedangTugasPiket = $user->role === 'guru_piket'
            || $jadwalPiketHariIni->contains(fn (GuruPiket $gp) => $gp->user_id === $user->id);

        $rekanPiket = $jadwalPiketHariIni
            ->filter(fn (GuruPiket $gp) => $gp->user_id !== $user->id && $gp->user !== null)
            ->map(fn (GuruPiket $gp) => $gp->user->nama)
            ->values();

        $jamMulaiMasuk = (string) config('absensi.jam_mulai_masuk', '06:30');
        $jamMasuk = (string) config('absensi.jam_masuk', '07:00');
        $toleransiMenit = (int) config('absensi.toleransi_menit', 15);
        $batasTepatWaktuCarbon = Carbon::createFromFormat('Y-m-d H:i', $todayStr.' '.$jamMasuk, $tz)
            ->addMinutes($toleransiMenit);
        $jamPulang = (string) config('absensi.jam_pulang', '14:30');
        $waktuBukaPulang = Carbon::createFromFormat('Y-m-d H:i', $todayStr.' '.$jamPulang, $tz)->setSecond(0);

        $pilihanBulan = collect(range(0, 5))->map(function (int $offset) use ($now) {
            $dt = $now->copy()->startOfMonth()->subMonths($offset);

            return [
                'value' => $dt->format('Y-m'),
                'label' => $this->formatNamaBulanTahun($dt),
            ];
        })->values();

        if (! $pilihanBulan->contains('value', $bulan)) {
            $pilihanBulan->prepend([
                'value' => $bulan,
                'label' => $this->formatNamaBulanTahun($startOfMonth),
            ]);
        }

        return Inertia::render('AbsenHarian/Index', [
            'absenHariIni' => $absenHariIniModel ? $this->formatAbsenRecord($absenHariIniModel, $tz) : null,
            'riwayatBulanIni' => $riwayatModels->map(fn (AbsenHarian $item) => $this->formatAbsenRecord($item, $tz))->values(),
            'ringkasanBulanIni' => [
                'bulan' => $bulan,
                'bulan_label' => $this->formatNamaBulanTahun($startOfMonth),
                'hari_kerja_efektif' => $hariKerjaEfektif,
                'hadir_tepat_waktu' => $hadirTepatWaktu,
                'izin_dinas_luar' => $izinCount,
                'terlambat' => $terlambatCount,
                'persentase_kehadiran' => number_format($persentaseKehadiran, 1, '.', ''),
            ],
            'aturanJam' => [
                'timezone' => $tz,
                'tanggal_hari_ini' => $todayStr,
                'tanggal_hari_ini_label' => $this->formatTanggalLengkapIndo($now),
                'jam_mulai_masuk' => $jamMulaiMasuk,
                'jam_masuk' => $jamMasuk,
                'toleransi_menit' => $toleransiMenit,
                'batas_tepat_waktu' => $batasTepatWaktuCarbon->format('H:i'),
                'jam_pulang' => $jamPulang,
                'bisa_pulang_sekarang' => $now->gte($waktuBukaPulang),
                'server_now_iso' => $now->toIso8601String(),
                'sekolah' => config('absensi.sekolah'),
            ],
            'agendaHariIni' => $agendaHariIni,
            'infoPiketHariIni' => [
                'bertugas' => $sedangTugasPiket,
                'rekan' => $rekanPiket,
            ],
            'pilihanBulan' => $pilihanBulan,
            'faceProfile' => self::buildFaceProfile($user, $tz),
            'flashStatus' => session('status'),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public static function buildFaceProfile(User $user, string $tz): array
    {
        $expectedLen = (int) config('absensi.face_recognition.descriptor_length', 128);
        $descriptor = is_array($user->face_descriptor) && count($user->face_descriptor) === $expectedLen
            ? array_map('floatval', array_values($user->face_descriptor))
            : null;

        return [
            'registered' => $descriptor !== null,
            'registered_at_label' => $user->face_registered_at
                ? Carbon::parse($user->face_registered_at)->setTimezone($tz)->format('d M Y, H:i').' WIB'
                : null,
            'descriptor' => $descriptor,
            'threshold' => (float) config('absensi.face_recognition.threshold', 0.55),
        ];
    }

    public function enrollFace(Request $request): RedirectResponse
    {
        if (count($request->allFiles()) > 0) {
            throw ValidationException::withMessages([
                'absen' => 'Upload file dari galeri tidak diizinkan. Pendaftaran wajah wajib menggunakan kamera live.',
            ]);
        }

        $expectedLen = (int) config('absensi.face_recognition.descriptor_length', 128);
        $validated = $request->validate([
            'sumber' => ['required', 'string', Rule::in(['live'])],
            'face_descriptor' => ['required', 'array', 'size:'.$expectedLen],
            'face_descriptor.*' => ['required', 'numeric', 'between:-5,5'],
            'redirect_to' => ['nullable', 'string', Rule::in(['index', 'dashboard'])],
        ]);

        $user = $request->user();
        if (is_array($user->face_descriptor) && count($user->face_descriptor) === $expectedLen) {
            throw ValidationException::withMessages([
                'absen' => 'Wajah biometrik Anda sudah terdaftar dan terkunci. Hubungi Admin jika perlu melakukan reset wajah.',
            ]);
        }

        $vector = [];
        $sumSq = 0.0;
        foreach ($validated['face_descriptor'] as $val) {
            $f = (float) $val;
            $vector[] = round($f, 6);
            $sumSq += $f * $f;
        }

        if (sqrt($sumSq) < 0.05) {
            throw ValidationException::withMessages([
                'absen' => 'Vektor biometrik wajah tidak terbaca dengan jelas. Ulangi di tempat yang cukup cahaya.',
            ]);
        }

        $user->update([
            'face_descriptor' => $vector,
            'face_registered_at' => Carbon::now(config('app.timezone', 'UTC')),
        ]);

        $targetRoute = ($validated['redirect_to'] ?? 'index') === 'dashboard'
            ? 'dashboard'
            : 'absen-harian.index';

        return redirect()
            ->route($targetRoute)
            ->with('status', 'Wajah biometrik Anda berhasil didaftarkan dan dikunci pada akun ini.');
    }

    public function resetFace(Request $request, User $user): RedirectResponse
    {
        if (! in_array($user->role, ['guru', 'guru_piket'], true)) {
            abort(403);
        }

        $user->update([
            'face_descriptor' => null,
            'face_registered_at' => null,
        ]);

        return redirect()
            ->route('absen-harian.rekap', $request->only(['tanggal', 'kategori', 'status', 'search']))
            ->with('status', 'Data wajah biometrik '.$user->nama.' berhasil di-reset. Pegawai dapat mendaftarkan wajah baru pada kamera live.');
    }

    public function store(StoreAbsenHarianRequest $request): RedirectResponse
    {
        $user = $request->user();
        $tz = config('absensi.timezone', 'Asia/Jakarta');
        $now = Carbon::now($tz);
        $tanggal = $now->toDateString();

        $alreadyExists = AbsenHarian::query()
            ->where('user_id', $user->id)
            ->whereDate('tanggal', $tanggal)
            ->exists();

        if ($alreadyExists) {
            throw ValidationException::withMessages([
                'absen' => 'Anda sudah melakukan presensi masuk hari ini.',
            ]);
        }

        $faceCheck = $this->verifyOrEnrollFace($user, $request->validatedFaceDescriptor());

        $jamMasuk = (string) config('absensi.jam_masuk', '07:00');
        $toleransiMenit = (int) config('absensi.toleransi_menit', 15);
        $batasTepatWaktu = Carbon::createFromFormat('Y-m-d H:i', $tanggal.' '.$jamMasuk, $tz)
            ->addMinutes($toleransiMenit)
            ->setSecond(59);

        $status = $now->lte($batasTepatWaktu) ? 'tepat waktu' : 'terlambat';

        $capture = $request->decodedCapture();
        $fotoPath = sprintf(
            'absen-harian/%s/%d-masuk-%s.%s',
            $tanggal,
            $user->id,
            Str::uuid(),
            $capture['extension']
        );

        Storage::disk('public')->put($fotoPath, $capture['binary']);

        $appTz = config('app.timezone', 'UTC');
        $waktuAmbil = Carbon::parse((string) $request->validated('waktu_ambil'))->setTimezone($appTz);
        $faceNote = $faceCheck['enrolled_now']
            ? 'Face ID Terdaftar'
            : 'Face Match '.number_format($faceCheck['similarity'], 1, '.', '').'%';
        $keterangan = $this->buildKeteranganLokasi($request).' • '.$faceNote;

        try {
            AbsenHarian::create([
                'user_id' => $user->id,
                'tanggal' => $tanggal,
                'waktu_masuk' => $now->copy()->setTimezone($appTz),
                'waktu_pulang' => null,
                'waktu_ambil' => $waktuAmbil,
                'foto_path' => $fotoPath,
                'sumber' => 'live',
                'ip_address' => $request->ip(),
                'user_agent' => (string) $request->userAgent(),
                'status' => $status,
                'keterangan' => $keterangan,
            ]);
        } catch (UniqueConstraintViolationException) {
            Storage::disk('public')->delete($fotoPath);

            throw ValidationException::withMessages([
                'absen' => 'Anda sudah melakukan presensi masuk hari ini.',
            ]);
        }

        $targetRoute = $request->validated('redirect_to') === 'dashboard'
            ? 'dashboard'
            : 'absen-harian.index';

        $prefixMsg = $faceCheck['enrolled_now']
            ? 'Wajah biometrik berhasil didaftarkan & presensi masuk dicatat pada pukul '
            : 'Wajah cocok ('.number_format($faceCheck['similarity'], 1, '.', '').'%) • Presensi masuk dicatat pukul ';

        return redirect()
            ->route($targetRoute)
            ->with('status', $prefixMsg.$now->format('H:i').' WIB ('.ucwords($status).').');
    }

    public function pulang(StoreAbsenHarianRequest $request): RedirectResponse
    {
        $user = $request->user();
        $tz = config('absensi.timezone', 'Asia/Jakarta');
        $now = Carbon::now($tz);
        $tanggal = $now->toDateString();

        $absen = AbsenHarian::query()
            ->where('user_id', $user->id)
            ->whereDate('tanggal', $tanggal)
            ->first();

        if (! $absen) {
            throw ValidationException::withMessages([
                'absen' => 'Anda belum melakukan presensi masuk hari ini.',
            ]);
        }

        if ($absen->waktu_pulang !== null) {
            throw ValidationException::withMessages([
                'absen' => 'Anda sudah melakukan presensi pulang hari ini.',
            ]);
        }

        $jamPulang = (string) config('absensi.jam_pulang', '14:30');
        $waktuBukaPulang = Carbon::createFromFormat('Y-m-d H:i', $tanggal.' '.$jamPulang, $tz)->setSecond(0);

        if ($now->lt($waktuBukaPulang)) {
            throw ValidationException::withMessages([
                'absen' => 'Mode presensi pulang baru aktif mulai pukul '.$jamPulang.' WIB.',
            ]);
        }

        $faceCheck = $this->verifyOrEnrollFace($user, $request->validatedFaceDescriptor());

        $capture = $request->decodedCapture();
        $fotoPulangPath = sprintf(
            'absen-harian/%s/%d-pulang-%s.%s',
            $tanggal,
            $user->id,
            Str::uuid(),
            $capture['extension']
        );

        Storage::disk('public')->put($fotoPulangPath, $capture['binary']);

        $absen->update([
            'waktu_pulang' => $now->copy()->setTimezone(config('app.timezone', 'UTC')),
        ]);

        $targetRoute = $request->validated('redirect_to') === 'dashboard'
            ? 'dashboard'
            : 'absen-harian.index';

        return redirect()
            ->route($targetRoute)
            ->with(
                'status',
                'Wajah terverifikasi ('.number_format($faceCheck['similarity'], 1, '.', '').'%) • Presensi pulang berhasil dicatat pukul '.$now->format('H:i').' WIB.'
            );
    }

    public function rekap(Request $request): Response
    {
        $tz = config('absensi.timezone', 'Asia/Jakarta');
        $now = Carbon::now($tz);
        $todayStr = $now->toDateString();

        $tanggalInput = (string) $request->input('tanggal', $todayStr);
        $tanggal = $todayStr;
        if (preg_match('/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/', $tanggalInput)) {
            try {
                $parsed = Carbon::createFromFormat('Y-m-d', $tanggalInput, $tz);
                if ($parsed && $parsed->format('Y-m-d') === $tanggalInput) {
                    $tanggal = $tanggalInput;
                }
            } catch (\Throwable) {
                $tanggal = $todayStr;
            }
        }

        $tanggalCarbon = Carbon::createFromFormat('Y-m-d', $tanggal, $tz);
        $kategori = (string) $request->input('kategori', 'all');
        $statusFilter = (string) $request->input('status', 'all');
        $search = trim((string) $request->input('search', ''));

        $expectedLen = (int) config('absensi.face_recognition.descriptor_length', 128);
        $pegawaiWajib = User::query()
            ->whereIn('role', ['guru', 'guru_piket'])
            ->where('aktif', true)
            ->orderBy('nama')
            ->get(['id', 'nama', 'username', 'role', 'jenis_pegawai', 'no_wa', 'face_descriptor', 'face_registered_at']);

        $absenMap = AbsenHarian::query()
            ->whereIn('user_id', $pegawaiWajib->pluck('id'))
            ->whereDate('tanggal', $tanggal)
            ->get()
            ->keyBy('user_id');

        $allRows = $pegawaiWajib->map(function (User $pegawai) use ($absenMap, $tz, $expectedLen) {
            /** @var AbsenHarian|null $absen */
            $absen = $absenMap->get($pegawai->id);
            $kategoriKey = $pegawai->role === 'guru_piket'
                ? 'guru_piket'
                : ($pegawai->jenis_pegawai === 'tenaga_kependidikan' ? 'tenaga_kependidikan' : 'guru');

            $jabatanLabel = match ($kategoriKey) {
                'guru_piket' => 'Guru Piket',
                'tenaga_kependidikan' => 'Tenaga Kependidikan',
                default => 'Guru Pengajar',
            };

            $formatted = $absen ? $this->formatAbsenRecord($absen, $tz) : null;
            $faceRegistered = is_array($pegawai->face_descriptor) && count($pegawai->face_descriptor) === $expectedLen;

            return [
                'user_id' => $pegawai->id,
                'nama' => $pegawai->nama,
                'username' => $pegawai->username,
                'role' => $pegawai->role,
                'kategori' => $kategoriKey,
                'jabatan_label' => $jabatanLabel,
                'no_wa' => $pegawai->no_wa,
                'face_registered' => $faceRegistered,
                'face_registered_at' => $pegawai->face_registered_at
                    ? Carbon::parse($pegawai->face_registered_at)->setTimezone($tz)->format('d M Y, H:i').' WIB'
                    : null,
                'sudah_absen' => $absen !== null,
                'absen_id' => $absen?->id,
                'jam_masuk' => $formatted['jam_masuk'] ?? '-',
                'jam_masuk_full' => $formatted['jam_masuk_full'] ?? '-',
                'jam_pulang' => $formatted['jam_pulang'] ?? null,
                'waktu_ambil' => $formatted['waktu_ambil'] ?? null,
                'status' => $absen ? $absen->status : 'belum_absen',
                'sumber' => $absen?->sumber,
                'ip_address' => $absen?->ip_address,
                'keterangan' => $formatted['keterangan'] ?? 'Belum ada rekaman kamera live',
                'foto_url' => $formatted['foto_url'] ?? null,
            ];
        });

        $totalWajib = $allRows->count();
        $totalHadir = $allRows->where('sudah_absen', true)->count();
        $tepatWaktu = $allRows->where('status', 'tepat waktu')->count();
        $terlambat = $allRows->where('status', 'terlambat')->count();
        $belumAbsen = $allRows->where('status', 'belum_absen')->count();
        $sudahPulang = $allRows->whereNotNull('jam_pulang')->count();
        $wajahTerdaftar = $allRows->where('face_registered', true)->count();
        $persentaseHadir = $totalWajib > 0
            ? round(($totalHadir / $totalWajib) * 100, 1)
            : 0.0;

        $filteredRows = $allRows
            ->filter(function (array $row) use ($kategori, $statusFilter, $search) {
                if ($kategori !== 'all' && $row['kategori'] !== $kategori) {
                    return false;
                }
                if ($statusFilter !== 'all' && $row['status'] !== $statusFilter) {
                    return false;
                }
                if ($search !== '') {
                    $q = mb_strtolower($search);
                    $matchNama = str_contains(mb_strtolower($row['nama']), $q);
                    $matchNip = str_contains(mb_strtolower($row['username']), $q);
                    if (! $matchNama && ! $matchNip) {
                        return false;
                    }
                }

                return true;
            })
            ->sortBy([
                fn (array $a, array $b) => ($b['sudah_absen'] <=> $a['sudah_absen']),
                fn (array $a, array $b) => strcmp($a['nama'], $b['nama']),
            ])
            ->values();

        $jamMasuk = (string) config('absensi.jam_masuk', '07:00');
        $toleransiMenit = (int) config('absensi.toleransi_menit', 15);
        $batasTepatWaktu = Carbon::createFromFormat('Y-m-d H:i', $tanggal.' '.$jamMasuk, $tz)
            ->addMinutes($toleransiMenit)
            ->format('H:i');

        $tahunAjaranAktif = TahunAjaran::query()
            ->where('aktif', true)
            ->first(['id', 'nama', 'semester']);

        return Inertia::render('AbsenHarian/Rekap', [
            'rows' => $filteredRows,
            'ringkasan' => [
                'tanggal' => $tanggal,
                'tanggal_label' => $this->formatTanggalLengkapIndo($tanggalCarbon),
                'is_hari_ini' => $tanggal === $todayStr,
                'total_wajib_absen' => $totalWajib,
                'total_hadir' => $totalHadir,
                'tepat_waktu' => $tepatWaktu,
                'terlambat' => $terlambat,
                'belum_absen' => $belumAbsen,
                'sudah_pulang' => $sudahPulang,
                'wajah_terdaftar' => $wajahTerdaftar,
                'persentase_hadir' => number_format($persentaseHadir, 1, '.', ''),
            ],
            'filters' => [
                'tanggal' => $tanggal,
                'kategori' => $kategori,
                'status' => $statusFilter,
                'search' => $search,
            ],
            'aturanJam' => [
                'jam_masuk' => $jamMasuk,
                'batas_tepat_waktu' => $batasTepatWaktu,
                'jam_pulang' => (string) config('absensi.jam_pulang', '14:30'),
                'sekolah' => config('absensi.sekolah'),
            ],
            'tahunAjaranAktif' => $tahunAjaranAktif,
            'flashStatus' => session('status'),
        ]);
    }

    /**
     * @param  array<int, float>  $submittedDescriptor
     * @return array{enrolled_now: bool, distance: float, similarity: float}
     */
    protected function verifyOrEnrollFace(User $user, array $submittedDescriptor): array
    {
        $expectedLen = (int) config('absensi.face_recognition.descriptor_length', 128);
        $stored = $user->face_descriptor;

        if (! is_array($stored) || count($stored) !== $expectedLen) {
            $user->update([
                'face_descriptor' => $submittedDescriptor,
                'face_registered_at' => Carbon::now(config('app.timezone', 'UTC')),
            ]);

            return [
                'enrolled_now' => true,
                'distance' => 0.0,
                'similarity' => 100.0,
            ];
        }

        $distance = $this->euclideanDistance($stored, $submittedDescriptor);
        $threshold = (float) config('absensi.face_recognition.threshold', 0.55);

        if ($distance > $threshold) {
            throw ValidationException::withMessages([
                'absen' => sprintf(
                    'Verifikasi Face Recognition gagal: Wajah pada kamera tidak cocok dengan data biometrik akun %s (selisih vektor %.3f > %.2f).',
                    $user->nama,
                    $distance,
                    $threshold
                ),
            ]);
        }

        $similarity = round(max(50.0, min(99.9, (1.0 - ($distance / 1.15)) * 100.0)), 1);

        return [
            'enrolled_now' => false,
            'distance' => $distance,
            'similarity' => $similarity,
        ];
    }

    /**
     * @param  array<int, float|int|string>  $a
     * @param  array<int, float|int|string>  $b
     */
    protected function euclideanDistance(array $a, array $b): float
    {
        $sum = 0.0;
        $len = min(count($a), count($b));
        $valsA = array_values($a);
        $valsB = array_values($b);

        for ($i = 0; $i < $len; $i++) {
            $diff = ((float) $valsA[$i]) - ((float) $valsB[$i]);
            $sum += $diff * $diff;
        }

        return sqrt($sum);
    }

    public function foto(Request $request, AbsenHarian $absenHarian): StreamedResponse
    {
        $user = $request->user();

        if ($absenHarian->user_id !== $user->id && ! in_array($user->role, ['admin', 'kepsek'], true)) {
            abort(403);
        }

        if (! $absenHarian->foto_path || ! Storage::disk('public')->exists($absenHarian->foto_path)) {
            abort(404);
        }

        return Storage::disk('public')->response($absenHarian->foto_path);
    }

    /**
     * @return array<string, mixed>
     */
    protected function formatAbsenRecord(AbsenHarian $item, string $tz): array
    {
        $tanggalCarbon = Carbon::parse($item->tanggal, $tz);
        $waktuMasuk = $item->waktu_masuk ? Carbon::parse($item->waktu_masuk)->setTimezone($tz) : null;
        $waktuPulang = $item->waktu_pulang ? Carbon::parse($item->waktu_pulang)->setTimezone($tz) : null;
        $waktuAmbil = $item->waktu_ambil ? Carbon::parse($item->waktu_ambil)->setTimezone($tz) : null;

        $sesiLabel = match ($tanggalCarbon->dayOfWeekIso) {
            1 => 'Upacara Bendera Hari Senin',
            5 => 'Sesi Jumat Bersih',
            default => 'Sesi Pagi Reguler',
        };

        return [
            'id' => $item->id,
            'tanggal' => $tanggalCarbon->toDateString(),
            'tanggal_label' => $this->formatTanggalRingkasIndo($tanggalCarbon),
            'sesi_label' => $sesiLabel,
            'jam_masuk' => $waktuMasuk ? $waktuMasuk->format('H:i').' WIB' : '-',
            'jam_masuk_full' => $waktuMasuk ? $waktuMasuk->format('H:i:s').' WIB' : '-',
            'jam_pulang' => $waktuPulang ? $waktuPulang->format('H:i').' WIB' : null,
            'waktu_ambil' => $waktuAmbil ? $waktuAmbil->format('H:i:s').' WIB' : null,
            'status' => $item->status,
            'sumber' => $item->sumber,
            'keterangan' => $item->keterangan ?: 'Kamera Live Terverifikasi',
            'foto_path' => $item->foto_path,
            'foto_url' => $item->foto_path ? route('absen-harian.foto', $item->id) : null,
        ];
    }

    protected function buildKeteranganLokasi(StoreAbsenHarianRequest $request): string
    {
        $custom = trim((string) $request->validated('keterangan', ''));
        if ($custom !== '') {
            return $custom;
        }

        $lat = $request->validated('latitude');
        $lng = $request->validated('longitude');

        if ($lat !== null && $lng !== null) {
            $sekolahLat = (float) config('absensi.sekolah.latitude', -7.02614);
            $sekolahLng = (float) config('absensi.sekolah.longitude', 107.51928);
            $distanceMeters = $this->haversineMeters((float) $lat, (float) $lng, $sekolahLat, $sekolahLng);

            return sprintf(
                'Radius %.1fm (%.4f, %.4f)',
                $distanceMeters,
                (float) $lat,
                (float) $lng
            );
        }

        return 'Kamera Live Terverifikasi';
    }

    protected function haversineMeters(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadius = 6371000.0;
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) ** 2
            + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLon / 2) ** 2;

        return 2 * $earthRadius * asin(min(1.0, sqrt($a)));
    }

    protected function hitungHariKerjaEfektif(
        Carbon $startOfMonth,
        Carbon $endOfMonth,
        Carbon $now,
        int $jumlahHadir
    ): int {
        $batasAkhir = $startOfMonth->isSameMonth($now) && $now->lt($endOfMonth)
            ? $now->copy()->endOfDay()
            : $endOfMonth->copy()->endOfDay();

        if ($batasAkhir->lt($startOfMonth)) {
            return max(1, $jumlahHadir);
        }

        $liburSet = HariLibur::query()
            ->whereBetween('tanggal', [$startOfMonth->toDateString(), $batasAkhir->toDateString()])
            ->pluck('tanggal')
            ->map(fn ($d) => Carbon::parse($d)->toDateString())
            ->flip();

        $hariKerja = 0;
        $cursor = $startOfMonth->copy();

        while ($cursor->lte($batasAkhir)) {
            if ($cursor->dayOfWeekIso <= 5 && ! $liburSet->has($cursor->toDateString())) {
                $hariKerja++;
            }
            $cursor->addDay();
        }

        return max($hariKerja, $jumlahHadir);
    }

    protected function formatTanggalLengkapIndo(Carbon $dt): string
    {
        $hari = [
            1 => 'Senin',
            2 => 'Selasa',
            3 => 'Rabu',
            4 => 'Kamis',
            5 => 'Jumat',
            6 => 'Sabtu',
            7 => 'Minggu',
        ][$dt->dayOfWeekIso] ?? '';

        $bulan = [
            1 => 'Januari',
            2 => 'Februari',
            3 => 'Maret',
            4 => 'April',
            5 => 'Mei',
            6 => 'Juni',
            7 => 'Juli',
            8 => 'Agustus',
            9 => 'September',
            10 => 'Oktober',
            11 => 'November',
            12 => 'Desember',
        ][$dt->month] ?? '';

        return sprintf('%s, %02d %s %d', $hari, $dt->day, $bulan, $dt->year);
    }

    protected function formatTanggalRingkasIndo(Carbon $dt): string
    {
        $hari = [
            1 => 'Senin',
            2 => 'Selasa',
            3 => 'Rabu',
            4 => 'Kamis',
            5 => 'Jumat',
            6 => 'Sabtu',
            7 => 'Minggu',
        ][$dt->dayOfWeekIso] ?? '';

        $bulan = [
            1 => 'Jan',
            2 => 'Feb',
            3 => 'Mar',
            4 => 'Apr',
            5 => 'Mei',
            6 => 'Jun',
            7 => 'Jul',
            8 => 'Agu',
            9 => 'Sep',
            10 => 'Okt',
            11 => 'Nov',
            12 => 'Des',
        ][$dt->month] ?? '';

        return sprintf('%s, %02d %s %d', $hari, $dt->day, $bulan, $dt->year);
    }

    protected function formatNamaBulanTahun(Carbon $dt): string
    {
        $bulan = [
            1 => 'Januari',
            2 => 'Februari',
            3 => 'Maret',
            4 => 'April',
            5 => 'Mei',
            6 => 'Juni',
            7 => 'Juli',
            8 => 'Agustus',
            9 => 'September',
            10 => 'Oktober',
            11 => 'November',
            12 => 'Desember',
        ][$dt->month] ?? '';

        return sprintf('%s %d', $bulan, $dt->year);
    }
}
