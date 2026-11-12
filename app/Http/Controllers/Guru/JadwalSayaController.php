<?php

namespace App\Http\Controllers\Guru;

use App\Http\Controllers\Controller;
use App\Models\GuruPiket;
use App\Models\JadwalSlot;
use App\Models\JadwalVersi;
use App\Models\Sesi;
use App\Models\TahunAjaran;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class JadwalSayaController extends Controller
{
    /**
     * Menampilkan jadwal mengajar guru login dan kontak guru piket hari ini.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $today = Carbon::now();
        $hariIniIso = (int) $today->dayOfWeekIso; // 1 = Senin, ..., 7 = Minggu
        $tanggalHariIni = $today->toDateString();

        $tahunAjaranAktif = TahunAjaran::query()
            ->where('aktif', true)
            ->first();

        $jadwalVersiAktif = null;
        if ($tahunAjaranAktif) {
            $jadwalVersiAktif = JadwalVersi::query()
                ->where('status', 'aktif')
                ->where(function ($query) use ($tahunAjaranAktif) {
                    $query->whereBetween('berlaku_mulai', [$tahunAjaranAktif->tanggal_mulai, $tahunAjaranAktif->tanggal_selesai])
                        ->orWhereBetween('berlaku_sampai', [$tahunAjaranAktif->tanggal_mulai, $tahunAjaranAktif->tanggal_selesai])
                        ->orWhere(function ($sub) use ($tahunAjaranAktif) {
                            $sub->where('berlaku_mulai', '<=', $tahunAjaranAktif->tanggal_mulai)
                                ->where('berlaku_sampai', '>=', $tahunAjaranAktif->tanggal_selesai);
                        });
                })
                ->latest('berlaku_mulai')
                ->first();

            // Fallback jika rentang tanggal versi tidak terikat ketat ke tanggal tahun ajaran
            if (!$jadwalVersiAktif) {
                $jadwalVersiAktif = JadwalVersi::query()
                    ->where('status', 'aktif')
                    ->latest('berlaku_mulai')
                    ->first();
            }
        }

        $jadwalSlots = collect();
        if ($jadwalVersiAktif) {
            $jadwalSlots = JadwalSlot::query()
                ->where('guru_id', $user->id)
                ->where('versi_id', $jadwalVersiAktif->id)
                ->with([
                    'kelas:id,nama,tingkat',
                    'mapel:id,kode,nama',
                    'jamPelajaran:id,jam_ke,mulai,selesai',
                ])
                ->get()
                ->sortBy([
                    ['hari', 'asc'],
                    fn ($a, $b) => ($a->jamPelajaran?->jam_ke ?? 0) <=> ($b->jamPelajaran?->jam_ke ?? 0),
                ])
                ->values();
        }

        // a. jadwalMingguan: dikelompokkan per hari (1: Senin s/d 6: Sabtu)
        $jadwalMingguan = [];
        for ($h = 1; $h <= 6; $h++) {
            $jadwalMingguan[$h] = $jadwalSlots->where('hari', $h)->values();
        }

        // b. jadwalHariIni: slot khusus hari ini (disertai status sesi jika sesi hari ini sudah ada)
        $sesiHariIni = Sesi::query()
            ->where('tanggal', $tanggalHariIni)
            ->where(function ($q) use ($user) {
                $q->where('guru_id', $user->id)
                    ->orWhere('guru_pengganti_id', $user->id);
            })
            ->get()
            ->keyBy('slot_id');

        $jadwalHariIni = $jadwalSlots->where('hari', $hariIniIso)->map(function ($slot) use ($sesiHariIni) {
            $sesi = $sesiHariIni->get($slot->id);
            $slotArray = $slot->toArray();
            $slotArray['sesi_hari_ini'] = $sesi ? [
                'id' => $sesi->id,
                'status' => $sesi->status,
                'guru_pengganti_id' => $sesi->guru_pengganti_id,
                'alasan' => $sesi->alasan,
            ] : null;

            return $slotArray;
        })->values();

        // Query Guru Piket Hari Ini
        $piketHariIni = collect();
        if ($tahunAjaranAktif) {
            $guruPiketList = GuruPiket::query()
                ->where('tahun_ajaran_id', $tahunAjaranAktif->id)
                ->where('hari', $hariIniIso)
                ->whereHas('user', function ($q) {
                    $q->where('aktif', true)
                        ->where('role', 'guru_piket');
                })
                ->with(['user:id,nama,username,no_wa,role,aktif'])
                ->get();

            $piketHariIni = $guruPiketList->map(function ($item) {
                $userPiket = $item->user;
                $rawWa = (string) ($userPiket?->no_wa ?? '');
                $cleanWa = preg_replace('/[^0-9]/', '', $rawWa);

                if (str_starts_with($cleanWa, '0')) {
                    $cleanWa = '62' . substr($cleanWa, 1);
                } elseif (str_starts_with($cleanWa, '8')) {
                    $cleanWa = '62' . $cleanWa;
                }

                return [
                    'id' => $item->id,
                    'hari' => $item->hari,
                    'user' => $userPiket ? [
                        'id' => $userPiket->id,
                        'nama' => $userPiket->nama,
                        'username' => $userPiket->username,
                        'no_wa' => $userPiket->no_wa,
                        'clean_wa' => $cleanWa,
                        'wa_link' => $cleanWa ? "https://wa.me/{$cleanWa}" : null,
                    ] : null,
                ];
            });
        }

        return Inertia::render('Guru/Jadwal/Index', [
            'jadwalMingguan' => $jadwalMingguan,
            'jadwalHariIni' => $jadwalHariIni,
            'piketHariIni' => $piketHariIni,
            'tahunAjaranAktif' => $tahunAjaranAktif,
            'hariIniIso' => $hariIniIso,
        ]);
    }
}

