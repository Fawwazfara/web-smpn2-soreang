<?php

namespace App\Http\Controllers;

use App\Models\AbsenSiswa;
use App\Models\Kelas;
use App\Models\Siswa;
use App\Models\TahunAjaran;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RekapAbsensiSiswaController extends Controller
{
    public function index(Request $request): Response
    {
        $today = Carbon::today();
        $defaultMulai = $today->copy()->startOfMonth()->toDateString();
        $defaultSelesai = $today->toDateString();

        $tanggalMulai = $request->query('tanggal_mulai', $defaultMulai);
        $tanggalSelesai = $request->query('tanggal_selesai', $defaultSelesai);

        $tahunAjaranAktif = TahunAjaran::query()->where('aktif', true)->first();

        $kelasQuery = Kelas::query()->orderBy('tingkat')->orderBy('nama');
        if ($tahunAjaranAktif) {
            $kelasQuery->where('tahun_ajaran_id', $tahunAjaranAktif->id);
        }
        $kelasList = $kelasQuery->get(['id', 'nama', 'tingkat', 'tahun_ajaran_id']);

        $selectedKelasId = $request->query('kelas_id');
        $selectedKelas = null;

        if ($selectedKelasId) {
            $selectedKelas = Kelas::with(['waliKelas:id,nama,username', 'tahunAjaran:id,nama,semester'])->find($selectedKelasId);
        } else {
            $firstKelas = $kelasList->first();
            $selectedKelas = $firstKelas
                ? Kelas::with(['waliKelas:id,nama,username', 'tahunAjaran:id,nama,semester'])->find($firstKelas->id)
                : null;
        }

        $kepsekUser = User::query()->where('role', 'kepsek')->where('aktif', true)->first(['id', 'nama', 'username']);

        $siswaRekap = [];
        $ringkasanKelas = [
            'total_hadir' => 0,
            'total_sakit' => 0,
            'total_izin' => 0,
            'total_alfa' => 0,
            'total_pertemuan' => 0,
            'rata_rata_kehadiran' => 0,
        ];

        if ($selectedKelas) {
            $siswaList = Siswa::query()
                ->where('kelas_id', $selectedKelas->id)
                ->where('aktif', true)
                ->orderBy('nama')
                ->get(['id', 'nis', 'nama', 'kelas_id', 'aktif']);

            $absenSiswaRecords = AbsenSiswa::query()
                ->whereIn('siswa_id', $siswaList->pluck('id'))
                ->whereHas('sesi', function ($q) use ($selectedKelas, $tanggalMulai, $tanggalSelesai) {
                    $q->where('kelas_id', $selectedKelas->id)
                        ->whereDate('tanggal', '>=', $tanggalMulai)
                        ->whereDate('tanggal', '<=', $tanggalSelesai);
                })
                ->get(['id', 'sesi_id', 'siswa_id', 'status']);

            $groupedAbsen = $absenSiswaRecords->groupBy('siswa_id');

            $globalHadir = 0;
            $globalSakit = 0;
            $globalIzin = 0;
            $globalAlfa = 0;
            $totalPersentaseSiswa = 0;

            foreach ($siswaList as $siswa) {
                $absenRecord = $groupedAbsen->get($siswa->id, collect());
                $h = $absenRecord->where('status', 'H')->count();
                $s = $absenRecord->where('status', 'S')->count();
                $i = $absenRecord->where('status', 'I')->count();
                $a = $absenRecord->where('status', 'A')->count();

                $totalPertemuan = $h + $s + $i + $a;
                $persentase = $totalPertemuan > 0
                    ? round(($h / $totalPertemuan) * 100, 1)
                    : 0;

                $siswaRekap[] = [
                    'id' => $siswa->id,
                    'nis' => $siswa->nis,
                    'nama' => $siswa->nama,
                    'h' => $h,
                    's' => $s,
                    'i' => $i,
                    'a' => $a,
                    'total_pertemuan' => $totalPertemuan,
                    'persentase_kehadiran' => $persentase,
                ];

                $globalHadir += $h;
                $globalSakit += $s;
                $globalIzin += $i;
                $globalAlfa += $a;
                $totalPersentaseSiswa += $persentase;
            }

            $totalSiswa = count($siswaRekap);
            $ringkasanKelas = [
                'total_hadir' => $globalHadir,
                'total_sakit' => $globalSakit,
                'total_izin' => $globalIzin,
                'total_alfa' => $globalAlfa,
                'total_pertemuan' => $globalHadir + $globalSakit + $globalIzin + $globalAlfa,
                'rata_rata_kehadiran' => $totalSiswa > 0 ? round($totalPersentaseSiswa / $totalSiswa, 1) : 0,
            ];
        }

        $component = $request->user()?->role === 'kepsek'
            ? 'Kepsek/RekapAbsensi/Siswa'
            : 'Admin/RekapAbsensi/Siswa';

        return Inertia::render($component, [
            'kelasList' => $kelasList,
            'selectedKelas' => $selectedKelas,
            'tahunAjaranAktif' => $tahunAjaranAktif,
            'kepsek' => $kepsekUser,
            'filters' => [
                'kelas_id' => $selectedKelas?->id,
                'tanggal_mulai' => $tanggalMulai,
                'tanggal_selesai' => $tanggalSelesai,
            ],
            'siswaRekap' => $siswaRekap,
            'rekapSiswa' => $siswaRekap,
            'ringkasanKelas' => $ringkasanKelas,
        ]);
    }
}
