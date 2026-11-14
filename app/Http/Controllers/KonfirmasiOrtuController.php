<?php

namespace App\Http\Controllers;

use App\Models\AbsenSiswa;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class KonfirmasiOrtuController extends Controller
{
    /**
     * Tampilkan halaman publik konfirmasi bukti kehadiran siswa oleh orang tua/wali.
     */
    public function show(string $token): Response
    {
        $tz = config('absensi.timezone', 'Asia/Jakarta');
        $now = Carbon::now($tz);

        /** @var AbsenSiswa|null $absenSiswa */
        $absenSiswa = AbsenSiswa::query()
            ->with([
                'siswa.kelas',
                'sesi.mapel',
                'sesi.jamPelajaran',
                'sesi.kelas',
                'dicatatOleh:id,nama',
            ])
            ->where('konfirmasi_token', $token)
            ->first();

        // 1. Token tidak ditemukan di database
        if (! $absenSiswa) {
            return Inertia::render('Konfirmasi/Index', [
                'state' => 'not_found',
                'message' => 'Tautan konfirmasi tidak ditemukan atau tidak valid. Pastikan membuka tautan resmi yang dikirimkan via WhatsApp.',
                'token' => $token,
                'dataSiswa' => null,
            ]);
        }

        // Format data detail siswa & sesi
        $siswa = $absenSiswa->siswa;
        $sesi = $absenSiswa->sesi;
        $kelas = $siswa?->kelas ?? $sesi?->kelas;
        $jamPelajaran = $sesi?->jamPelajaran;
        $mapel = $sesi?->mapel;

        $sesiTanggal = $sesi?->tanggal ? Carbon::parse($sesi->tanggal, $tz)->translatedFormat('l, d F Y') : '-';
        $waktuCatat = $absenSiswa->waktu ? Carbon::parse($absenSiswa->waktu, $tz)->format('H:i').' WIB' : '-';
        $waktuExpired = $absenSiswa->token_berlaku_sampai ? Carbon::parse($absenSiswa->token_berlaku_sampai, $tz) : null;

        $dataSiswa = [
            'id' => $absenSiswa->id,
            'nama' => $siswa?->nama ?? '-',
            'nis' => $siswa?->nis ?? '-',
            'kelas' => $kelas ? ($kelas->tingkat ? $kelas->tingkat.' '.$kelas->nama : $kelas->nama) : '-',
            'status' => $absenSiswa->status,
            'status_label' => $absenSiswa->status === 'S' ? 'Sakit' : ($absenSiswa->status === 'I' ? 'Izin' : $absenSiswa->status),
            'catatan_guru' => $absenSiswa->catatan,
            'guru_pencatat' => $absenSiswa->dicatatOleh?->nama ?? 'Guru Pengajar',
            'mapel' => $mapel?->nama ?? '-',
            'jam_ke' => $jamPelajaran?->jam_ke ?? null,
            'jam_rentang' => $jamPelajaran ? ($jamPelajaran->mulai && $jamPelajaran->selesai ? substr($jamPelajaran->mulai, 0, 5).' - '.substr($jamPelajaran->selesai, 0, 5).' WIB' : null) : null,
            'tanggal_presensi' => $sesiTanggal,
            'waktu_catat' => $waktuCatat,
            'status_konfirmasi' => $absenSiswa->status_konfirmasi,
            'berlaku_sampai' => $waktuExpired ? $waktuExpired->translatedFormat('d F Y, H:i').' WIB' : null,
            'berlaku_sampai_iso' => $waktuExpired?->toIso8601String(),
            'bukti_path' => $absenSiswa->bukti_path ? Storage::disk('public')->url($absenSiswa->bukti_path) : null,
            'bukti_diunggah_pada' => $absenSiswa->bukti_diunggah_pada ? Carbon::parse($absenSiswa->bukti_diunggah_pada, $tz)->translatedFormat('d F Y, H:i').' WIB' : null,
            'keterangan_konfirmasi' => $absenSiswa->keterangan_konfirmasi,
        ];

        // 2. Token sudah pernah dipakai / terkonfirmasi (sekali pakai)
        if ($absenSiswa->status_konfirmasi === 'terkonfirmasi' || ! empty($absenSiswa->bukti_path)) {
            return Inertia::render('Konfirmasi/Index', [
                'state' => 'already_used',
                'dataSiswa' => $dataSiswa,
                'token' => $token,
                'message' => 'Bukti kehadiran untuk ananda telah berhasil diunggah sebelumnya. Tautan konfirmasi ini bersifat sekali pakai dan pengunggahan telah selesai.',
            ]);
        }

        // 3. Token kadaluarsa (berlaku 1 minggu)
        if ($waktuExpired && $now->greaterThan($waktuExpired)) {
            if ($absenSiswa->status_konfirmasi !== 'kadaluarsa') {
                $absenSiswa->update(['status_konfirmasi' => 'kadaluarsa']);
            }

            return Inertia::render('Konfirmasi/Index', [
                'state' => 'expired',
                'dataSiswa' => $dataSiswa,
                'token' => $token,
                'message' => 'Batas waktu pengunggahan bukti surat sakit/izin (1 minggu) telah berakhir. Status kehadiran ananda tetap tercatat sesuai input guru di kelas.',
            ]);
        }

        // 4. Token valid & menunggu bukti
        return Inertia::render('Konfirmasi/Index', [
            'state' => 'active',
            'dataSiswa' => $dataSiswa,
            'token' => $token,
            'message' => null,
        ]);
    }

    /**
     * Proses pengunggahan berkas bukti konfirmasi dari orang tua.
     */
    public function store(Request $request, string $token): RedirectResponse
    {
        $tz = config('absensi.timezone', 'Asia/Jakarta');
        $now = Carbon::now($tz);

        /** @var AbsenSiswa|null $absenSiswa */
        $absenSiswa = AbsenSiswa::query()
            ->with(['sesi'])
            ->where('konfirmasi_token', $token)
            ->first();

        if (! $absenSiswa) {
            abort(404, 'Tautan konfirmasi tidak ditemukan.');
        }

        // Cek apakah sudah pernah dipakai
        if ($absenSiswa->status_konfirmasi === 'terkonfirmasi' || ! empty($absenSiswa->bukti_path)) {
            return back()->with('error', 'Tautan ini sudah pernah digunakan untuk mengunggah bukti.');
        }

        // Cek kadaluarsa
        if ($absenSiswa->token_berlaku_sampai && $now->greaterThan(Carbon::parse($absenSiswa->token_berlaku_sampai, $tz))) {
            $absenSiswa->update(['status_konfirmasi' => 'kadaluarsa']);

            return back()->with('error', 'Masa berlaku tautan konfirmasi ini telah habis (kadaluarsa).');
        }

        // Validasi berkas bukti
        $request->validate([
            'bukti' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
            'keterangan' => ['nullable', 'string', 'max:500'],
        ], [
            'bukti.required' => 'Foto atau dokumen surat bukti (surat dokter / surat izin) wajib dipilih.',
            'bukti.file' => 'Berkas yang diunggah tidak valid.',
            'bukti.mimes' => 'Format berkas bukti harus berupa gambar (JPG, JPEG, PNG) atau dokumen PDF.',
            'bukti.max' => 'Ukuran berkas tidak boleh lebih dari 5 MB.',
            'keterangan.max' => 'Keterangan tambahan maksimal 500 karakter.',
        ]);

        $file = $request->file('bukti');
        $ext = $file->getClientOriginalExtension();
        $safeFilename = 'bukti_'.$absenSiswa->siswa_id.'_'.date('Ymd_His').'_'.Str::lower(Str::random(8)).'.'.$ext;
        $path = $file->storeAs('bukti_absen/'.date('Y/m'), $safeFilename, 'public');

        $appTz = config('app.timezone', 'UTC');
        $serverNow = $now->copy()->setTimezone($appTz);

        // Update record utama
        $absenSiswa->update([
            'bukti_path' => $path,
            'status_konfirmasi' => 'terkonfirmasi',
            'bukti_diunggah_pada' => $serverNow,
            'keterangan_konfirmasi' => $request->input('keterangan'),
        ]);

        // Quality-of-life: Sinkronisasi ke sesi lain milik siswa pada tanggal yang sama jika ada status S/I yang menunggu
        if ($absenSiswa->sesi) {
            $sesiTanggal = $absenSiswa->sesi->tanggal;
            AbsenSiswa::query()
                ->where('siswa_id', $absenSiswa->siswa_id)
                ->where('id', '!=', $absenSiswa->id)
                ->whereIn('status', ['S', 'I'])
                ->whereHas('sesi', fn ($q) => $q->whereDate('tanggal', $sesiTanggal))
                ->where('status_konfirmasi', 'menunggu')
                ->whereNull('bukti_path')
                ->update([
                    'bukti_path' => $path,
                    'status_konfirmasi' => 'terkonfirmasi',
                    'bukti_diunggah_pada' => $serverNow,
                    'keterangan_konfirmasi' => $request->input('keterangan'),
                ]);
        }

        return redirect()->route('konfirmasi.show', $token)->with('success', 'Bukti kehadiran ananda berhasil dikirim dan diverifikasi oleh sistem.');
    }
}
