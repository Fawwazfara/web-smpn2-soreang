import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function Dashboard({ piketHariIni = [], tahunAjaranAktif = null }) {
    const user = usePage().props.auth.user;
    const [now, setNow] = useState(() => new Date());
    const [infoBanner, setInfoBanner] = useState(null);

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const hour = now.getHours();
    const sundaGreeting =
        hour < 11
            ? 'Wilujeng Enjing'
            : hour < 15
              ? 'Wilujeng Siang'
              : hour < 18
                ? 'Wilujeng Sonten'
                : 'Wilujeng Wengi';

    const liveClock = now
        .toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        })
        .replace(/\./g, ':');

    const formattedFullDate = now.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });

    const formattedShortDate = now.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });

    const jenisLabel =
        user.jenis_pegawai === 'tenaga_kependidikan' ? 'Tenaga Kependidikan' : 'Guru Pengajar';

    const scrollToPiket = () => {
        const el = document.getElementById('koordinasi-piket');
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard Guru - SADA" />

            <div className="space-y-6">
                {/* Dark Forest Green Hero Banner (Figma SiSADA Guru Dashboard) */}
                <div className="rounded-2xl bg-gradient-to-br from-[#0B2F23] via-[#103D2E] to-[#0D3326] p-6 text-white shadow-sm">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                        <div>
                            <span className="inline-flex items-center rounded-md border border-[#2A7A5B] bg-[#1B5E45] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#8CE9BE]">
                                {tahunAjaranAktif
                                    ? `T.A. ${tahunAjaranAktif.nama} ${tahunAjaranAktif.semester}`
                                    : 'TAHUN AJARAN AKTIF'}
                            </span>
                            <h1 className="mt-2.5 text-xl sm:text-2xl font-bold tracking-tight text-white">
                                {sundaGreeting}, {user.nama}!
                            </h1>
                            <p className="mt-1 text-xs text-[#A7D7C5]">
                                {jenisLabel} • NIP: {user.username} • Unit Penugasan: SMPN 2 Soreang
                            </p>
                        </div>

                        {/* Live Clock Box */}
                        <div className="flex items-center gap-3.5 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 self-start lg:self-auto">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#18543E] text-[#6EE7B7]">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.9" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="font-mono text-lg font-extrabold tracking-tight text-white">
                                        {liveClock}
                                    </span>
                                    <span className="text-[10.5px] font-bold text-[#6EE7B7]">WIB</span>
                                </div>
                                <p className="text-[11px] text-[#9ED1BE]">{formattedFullDate}</p>
                            </div>
                        </div>
                    </div>

                    {/* Hero Footer Strip */}
                    <div className="mt-5 pt-3.5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-2.5 text-xs text-[#D5EFE4]">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#227858] text-[#A7F3D0]">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </span>
                            <span>
                                <strong className="text-[#8CE9BE]">Kebijakan Presensi:</strong> Wajib Live Selfie Kamera Perangkat Setiap Hari Kerja
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={scrollToPiket}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-[#2A7E5F] bg-[#166246] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#1D7756] transition"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                                </svg>
                                Koordinasi Piket ({piketHariIni.length})
                            </button>
                        </div>
                    </div>
                </div>

                {infoBanner && (
                    <div className="rounded-xl border border-[#CBE9DA] bg-[#EDF6F1] px-4 py-3 text-xs text-[#0F382A] flex items-center justify-between gap-3">
                        <span>{infoBanner}</span>
                        <button
                            type="button"
                            onClick={() => setInfoBanner(null)}
                            className="font-bold text-[#0E7452] hover:underline shrink-0"
                        >
                            Tutup
                        </button>
                    </div>
                )}

                {/* 2-Column Main Content (Figma SiSADA Layout) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column (5 cols): Presensi Pagi Mandiri + Guru Piket WA */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* Presensi Pagi Mandiri Card */}
                        <div className="rounded-2xl border border-[#E5ECE9] bg-white p-5 sm:p-6 shadow-2xs">
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-[#0E7452]" fill="none" viewBox="0 0 24 24" strokeWidth="1.9" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                                    </svg>
                                    <h2 className="text-base font-bold text-slate-900">
                                        Presensi Pagi Mandiri
                                    </h2>
                                </div>
                                <span className="rounded-full bg-[#E6F5EE] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#0E7452]">
                                    SESI MASUK
                                </span>
                            </div>

                            {/* Live Camera Viewfinder Frame (Strictly No Gallery Upload per PRD #3) */}
                            <div className="relative mt-4 aspect-[4/3] rounded-2xl overflow-hidden border border-[#DCE6E1] bg-gradient-to-b from-[#152B23] via-[#1C3B30] to-[#0E221B] p-4 flex flex-col justify-between">
                                {/* Top HUD */}
                                <div className="flex items-center justify-between text-[10px] font-mono">
                                    <span className="text-[#8CE9BE] font-semibold tracking-wider">
                                        ● LIVE CAMERA STRICT
                                    </span>
                                    <span className="rounded bg-[#0B221A]/85 border border-[#34D399]/40 px-2 py-0.5 text-[#6EE7B7] font-bold">
                                        CAM-01
                                    </span>
                                </div>

                                {/* Center Biometric Corner Brackets */}
                                <div className="relative mx-auto my-auto h-32 w-32 flex flex-col items-center justify-center">
                                    <span className="absolute left-0 top-0 h-5 w-5 border-l-2 border-t-2 border-[#34D399]" />
                                    <span className="absolute right-0 top-0 h-5 w-5 border-r-2 border-t-2 border-[#34D399]" />
                                    <span className="absolute bottom-0 left-0 h-5 w-5 border-b-2 border-l-2 border-[#34D399]" />
                                    <span className="absolute bottom-0 right-0 h-5 w-5 border-b-2 border-r-2 border-[#34D399]" />

                                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-[#6EE7B7] backdrop-blur-xs">
                                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth="1.7" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                        </svg>
                                    </div>
                                    <span className="mt-2 font-mono text-[9.5px] font-bold tracking-widest text-[#6EE7B7]">
                                        STANDBY KAMERA
                                    </span>
                                </div>

                                {/* Bottom Glass Stamp */}
                                <div className="rounded-xl border border-white/10 bg-[#0A1F18]/85 px-3 py-2 backdrop-blur-xs flex items-center gap-2.5 text-white">
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#18543E] text-[#6EE7B7]">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                                        </svg>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate text-[11px] font-bold text-white">
                                            {formattedFullDate}
                                        </p>
                                        <p className="truncate text-[10px] text-[#9ED1BE]">
                                            Tanpa Opsi Upload Galeri • Validasi Selfie Langsung
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Status & CTA Buttons */}
                            <div className="mt-3.5 flex items-center justify-between text-[11px]">
                                <span className="font-bold text-[#DC2626]">
                                    ⏱ WAJIB SETIAP HARI KERJA
                                </span>
                                <span className="rounded-md bg-[#FEECEC] px-2 py-0.5 text-[10px] font-bold text-[#DC2626]">
                                    Belum Absen Masuk
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setInfoBanner(
                                        'Modul Capture Kamera Live Harian (Task G1) akan aktif pada sprint presensi guru.'
                                    )
                                }
                                className="mt-2.5 w-full rounded-xl bg-[#0F382A] py-3 px-4 text-xs font-bold text-white shadow-xs hover:bg-[#164B38] transition flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                                </svg>
                                Absen Masuk Sekarang (Kamera Live)
                            </button>

                            <button
                                type="button"
                                onClick={scrollToPiket}
                                className="mt-2 w-full rounded-xl bg-[#EEF3F8] py-2.5 px-4 text-xs font-semibold text-slate-700 hover:bg-[#E2EAF2] transition flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.9" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818" />
                                </svg>
                                Berhalangan? Hubungi Piket & Kode 6-Digit
                            </button>

                            {/* Log Kehadiran Pekan Ini (3 Mini Cards) */}
                            <div className="mt-5 pt-4 border-t border-[#EDF2F0]">
                                <div className="flex items-center justify-between text-[10.5px] font-bold">
                                    <span className="uppercase tracking-wider text-slate-500">
                                        STATUS PRESENSI HARIAN
                                    </span>
                                    <span className="text-[#0E7452]">Live Selfie</span>
                                </div>
                                <div className="mt-2.5 grid grid-cols-3 gap-2">
                                    <div className="rounded-xl bg-[#F6F9F8] border border-[#E5ECE9] p-2.5 text-center">
                                        <span className="block text-[10px] text-slate-400">Mode</span>
                                        <span className="mt-0.5 block text-xs font-extrabold text-[#0E7452]">
                                            Kamera
                                        </span>
                                        <span className="text-[9.5px] font-semibold text-slate-500">
                                            Strict
                                        </span>
                                    </div>
                                    <div className="rounded-xl bg-[#F6F9F8] border border-[#E5ECE9] p-2.5 text-center">
                                        <span className="block text-[10px] text-slate-400">Galeri</span>
                                        <span className="mt-0.5 block text-xs font-extrabold text-[#DC2626]">
                                            Ditolak
                                        </span>
                                        <span className="text-[9.5px] font-semibold text-slate-500">
                                            SOP SADA
                                        </span>
                                    </div>
                                    <div className="rounded-xl bg-[#E8F5EE] border border-[#CBE9DA] p-2.5 text-center">
                                        <span className="block text-[10px] text-[#0E7452]">Hari Ini</span>
                                        <span className="mt-0.5 block text-xs font-extrabold text-slate-900">
                                            Standby
                                        </span>
                                        <span className="text-[9.5px] font-bold text-[#0E7452]">
                                            Sesi Masuk
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Koordinasi Guru Piket Hari Ini Card (PRD Section 3 & #19) */}
                        <div
                            id="koordinasi-piket"
                            className="rounded-2xl border border-[#E5ECE9] bg-white p-5 sm:p-6 shadow-2xs"
                        >
                            <div className="flex items-center justify-between gap-2">
                                <h3 className="text-sm font-bold text-slate-900">
                                    Daftar Guru Piket Hari Ini
                                </h3>
                                <span className="rounded-full bg-[#E6F5EE] px-2.5 py-0.5 text-[10px] font-bold text-[#0E7452]">
                                    Chat WA Langsung
                                </span>
                            </div>
                            <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                                Bila berhalangan mengajar, klik <strong>Hubungi</strong> untuk membuka WhatsApp Guru Piket, lalu generate kode unik <strong>6 digit numerik</strong> sekali pakai untuk sesi tersebut.
                            </p>

                            <div className="mt-4 space-y-2.5">
                                {piketHariIni.length === 0 ? (
                                    <div className="rounded-xl border border-dashed border-[#DCE5E1] bg-[#F8FAF9] p-4 text-center text-xs text-slate-400">
                                        Belum ada petugas guru piket aktif yang terdaftar.
                                    </div>
                                ) : (
                                    piketHariIni.map((piket) => (
                                        <div
                                            key={piket.id}
                                            className="flex items-center justify-between gap-3 rounded-xl border border-[#E5ECE9] bg-[#F8FAF9] p-3"
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0F382A] text-white text-xs font-bold">
                                                    {piket.nama?.charAt(0)?.toUpperCase() ?? 'P'}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="truncate text-xs font-bold text-slate-900">
                                                        {piket.nama}
                                                    </p>
                                                    <p className="truncate font-mono text-[10.5px] text-slate-500">
                                                        {piket.no_wa || 'No. WA belum diatur'}
                                                    </p>
                                                </div>
                                            </div>

                                            {piket.no_wa && (
                                                <a
                                                    href={`https://wa.me/${piket.no_wa}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B6E4F] px-3 py-1.5 text-[11px] font-bold text-white hover:bg-[#0F382A] transition shrink-0"
                                                >
                                                    Hubungi
                                                </a>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column (7 cols): Sesi KBM Card + Jadwal Mengajar Hari Ini */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* Active KBM Session Card (Figma Top-Right Card) */}
                        <div className="rounded-2xl border border-[#E5ECE9] bg-white p-6 shadow-2xs">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="inline-flex items-center gap-1.5 text-[10.5px] font-extrabold uppercase tracking-wider text-[#0E7452]">
                                    <span className="h-2 w-2 rounded-full bg-[#10B981]" />
                                    SESI KBM • PRESENSI SISWA PER KELAS
                                </span>
                                <span className="rounded-full bg-[#E6F5EE] px-3 py-0.5 text-[10.5px] font-bold text-[#0E7452]">
                                    STATUS: H • S • I • A
                                </span>
                            </div>

                            <h2 className="mt-3 text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                                Presensi Siswa & Sesi Kelas
                            </h2>
                            <p className="mt-1 text-xs sm:text-[13px] text-slate-500">
                                Pencatatan kehadiran siswa per sesi jam pelajaran terintegrasi dengan notifikasi WhatsApp orang tua/wali.
                            </p>

                            <div className="mt-4 space-y-2.5 text-xs text-slate-600">
                                <div className="flex items-center gap-2.5">
                                    <svg className="w-4 h-4 text-[#0E7452] shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Status presensi siswa: <strong>Hadir (H), Sakit (S), Izin (I), Alfa (A)</strong></span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <svg className="w-4 h-4 text-[#0E7452] shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" />
                                    </svg>
                                    <span>Notifikasi WA orang tua otomatis (maks. 1x per siswa/hari untuk A, S, I)</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <svg className="w-4 h-4 text-[#0E7452] shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5" />
                                    </svg>
                                    <span>Sakit & Izin menyertakan link unggah bukti orang tua (berlaku 1 minggu)</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setInfoBanner(
                                        'Modul Presensi Siswa per Sesi Kelas (Task G2) akan aktif setelah konfigurasi jadwal mengajar.'
                                    )
                                }
                                className="mt-5 w-full rounded-xl bg-[#0B6E4F] py-3.5 px-4 text-xs font-bold text-white shadow-xs hover:bg-[#095C42] transition flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
                                </svg>
                                Buka Presensi Siswa Kelas
                            </button>
                        </div>

                        {/* Jadwal Mengajar Hari Ini Card (Figma Bottom-Right Schedule Card) */}
                        <div className="rounded-2xl border border-[#E5ECE9] bg-white p-6 shadow-2xs">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-[#0E7452]" fill="none" viewBox="0 0 24 24" strokeWidth="1.9" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75" />
                                    </svg>
                                    <h3 className="text-base font-bold text-slate-900">
                                        Jadwal Mengajar Hari Ini
                                    </h3>
                                </div>
                                <div className="text-[11px] font-medium text-slate-500">
                                    {formattedShortDate} •{' '}
                                    <span className="font-bold text-[#0E7452]">Generator Sesi KBM</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {/* Slot 1-2 */}
                                <div className="flex items-center justify-between gap-3 rounded-xl border border-[#E5ECE9] bg-[#F8FAF9] p-3.5">
                                    <div className="flex items-center gap-3.5 min-w-0">
                                        <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-[#0F382A] text-white leading-none">
                                            <span className="text-[8.5px] font-bold uppercase tracking-wider text-[#8CE9BE]">
                                                JAM
                                            </span>
                                            <span className="mt-0.5 text-xs font-extrabold">1-2</span>
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-xs sm:text-[13px] font-bold text-slate-900">
                                                    Sesi Jam Pelajaran Ke 1–2
                                                </span>
                                                <span className="rounded-md bg-[#E6F5EE] px-2 py-0.5 text-[10px] font-bold text-[#0E7452]">
                                                    Sesi Pagi
                                                </span>
                                            </div>
                                            <p className="mt-0.5 text-[11px] text-slate-500 truncate">
                                                07:00 - 08:30 WIB • Menunggu publikasi versi jadwal aktif
                                            </p>
                                        </div>
                                    </div>
                                    <span className="hidden sm:inline-flex rounded-lg border border-[#E5ECE9] bg-white px-2.5 py-1.5 text-[10.5px] font-semibold text-slate-500 shrink-0">
                                        Standby
                                    </span>
                                </div>

                                {/* Slot 3-4 */}
                                <div className="flex items-center justify-between gap-3 rounded-xl border border-[#EDF2F0] bg-white p-3.5">
                                    <div className="flex items-center gap-3.5 min-w-0">
                                        <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-[#EBF1FF] text-slate-800 leading-none">
                                            <span className="text-[8.5px] font-bold uppercase tracking-wider text-[#2563EB]">
                                                JAM
                                            </span>
                                            <span className="mt-0.5 text-xs font-extrabold">3-4</span>
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-xs sm:text-[13px] font-bold text-slate-900">
                                                    Sesi Jam Pelajaran Ke 3–4
                                                </span>
                                                <span className="rounded-md bg-[#EBF1FF] px-2 py-0.5 text-[10px] font-bold text-[#1E40AF]">
                                                    Terjadwal
                                                </span>
                                            </div>
                                            <p className="mt-0.5 text-[11px] text-slate-500 truncate">
                                                08:45 - 10:15 WIB • Sinkron otomatis dari matriks jadwal admin
                                            </p>
                                        </div>
                                    </div>
                                    <span className="hidden sm:inline-flex rounded-lg bg-[#F4F7F6] px-2.5 py-1.5 text-[10.5px] font-semibold text-slate-500 shrink-0">
                                        Menunggu Sesi
                                    </span>
                                </div>

                                {/* Mint Break Strip (Exact Figma Break Row) */}
                                <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#D7EDE2] bg-[#EDF7F2] px-4 py-2.5 text-[10.5px] font-bold text-[#0E7452]">
                                    <span className="uppercase tracking-wider">
                                        ☕ ISTIRAHAT PAGI • KOORDINASI PIKET & PENGGANTI
                                    </span>
                                    <span>10:15 - 10:30 WIB (15 Menit)</span>
                                </div>

                                {/* Slot 5-6 */}
                                <div className="flex items-center justify-between gap-3 rounded-xl border border-[#EDF2F0] bg-white p-3.5">
                                    <div className="flex items-center gap-3.5 min-w-0">
                                        <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-[#EBF1FF] text-slate-800 leading-none">
                                            <span className="text-[8.5px] font-bold uppercase tracking-wider text-[#2563EB]">
                                                JAM
                                            </span>
                                            <span className="mt-0.5 text-xs font-extrabold">5-6</span>
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-xs sm:text-[13px] font-bold text-slate-900">
                                                    Sesi Jam Pelajaran Ke 5–6
                                                </span>
                                                <span className="rounded-md bg-[#EBF1FF] px-2 py-0.5 text-[10px] font-bold text-[#1E40AF]">
                                                    Terjadwal
                                                </span>
                                            </div>
                                            <p className="mt-0.5 text-[11px] text-slate-500 truncate">
                                                10:30 - 12:00 WIB • Sinkron otomatis dari matriks jadwal admin
                                            </p>
                                        </div>
                                    </div>
                                    <span className="hidden sm:inline-flex rounded-lg bg-[#F4F7F6] px-2.5 py-1.5 text-[10.5px] font-semibold text-slate-500 shrink-0">
                                        Menunggu Sesi
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
