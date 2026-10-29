import Modal from '@/Components/Modal';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function Dashboard({ piketHariIni = [], tahunAjaranAktif = null }) {
    const user = usePage().props.auth.user;
    const [now, setNow] = useState(() => new Date());
    const [showPiketModal, setShowPiketModal] = useState(false);

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
        user.jenis_pegawai === 'tenaga_kependidikan'
            ? 'Tenaga Kependidikan'
            : 'Guru Utama Matematika';

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard Guru - SiSADA" />

            <div className="space-y-6">
                {/* Dark Forest Green Hero Banner (Exact Figma Screenshot 3) */}
                <div className="rounded-2xl bg-gradient-to-br from-[#082B1F] via-[#0D392A] to-[#0A2F22] p-6 text-white shadow-sm">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                        <div>
                            <span className="inline-flex items-center rounded-md border border-[#2D8866] bg-[#1B6B4D] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#9BF6C8]">
                                {tahunAjaranAktif
                                    ? `T.A. ${tahunAjaranAktif.nama} ${tahunAjaranAktif.semester}`
                                    : 'T.A. 2025/2026 GANJIL'}
                            </span>
                            <h1 className="mt-2.5 text-xl sm:text-2xl font-bold tracking-tight text-white">
                                {sundaGreeting}, {user.nama}!
                            </h1>
                            <p className="mt-1 text-xs text-[#A7D7C5]">
                                {jenisLabel} • NIP: {user.username} • Unit Penugasan: Wilayah Soreang
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

                    {/* Hero Footer Strip (Exact Figma Screenshot 3) */}
                    <div className="mt-5 pt-3.5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-2.5 text-xs text-[#D5EFE4]">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#34D399] text-[#064E3B]">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19.5s6-5.25 6-10.125a6 6 0 10-12 0C6 14.25 12 19.5 12 19.5z" />
                                </svg>
                            </span>
                            <span>
                                <strong className="text-[#8CE9BE]">Tugas Tambahan Hari Ini:</strong> Piket Pagi
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setShowPiketModal(true)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-[#2A7E5F] bg-[#166246] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#1D7756] transition"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                                </svg>
                                Koordinasi Admin
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowPiketModal(true)}
                                title="Daftar Guru Piket Hari Ini"
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-white/10 text-white hover:bg-white/20 transition"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.9" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* 2-Column Main Content (Exact Figma Screenshot 3) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left Column (5 cols): Presensi Pagi Mandiri */}
                    <div className="lg:col-span-5">
                        <div className="rounded-2xl border border-[#E5ECE9] bg-white p-5 sm:p-6 shadow-2xs">
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-[#0E7452]" fill="none" viewBox="0 0 24 24" strokeWidth="1.9" stroke="currentColor">
                                        <rect x="5" y="4" width="14" height="16.5" rx="2" />
                                        <circle cx="12" cy="10" r="2" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.75 16.5a3.25 3.25 0 016.5 0" />
                                    </svg>
                                    <h2 className="text-base font-bold text-slate-900">
                                        Presensi Pagi Mandiri
                                    </h2>
                                </div>
                                <span className="rounded-full bg-[#E6F5EE] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#0E7452]">
                                    SESI MASUK
                                </span>
                            </div>

                            {/* Live Camera Viewfinder Frame (Exact Figma HUD + Strictly No Gallery Upload) */}
                            <div className="relative mt-4 aspect-[4/3] rounded-2xl overflow-hidden border border-[#DCE6E1] bg-gradient-to-b from-[#2B3E38] via-[#1C332B] to-[#0E221B] p-4 flex flex-col justify-between">
                                <div className="flex items-center justify-between text-[10px] font-mono">
                                    <span className="text-[#8CE9BE] font-semibold tracking-wider">
                                        FACIAL RECOGNITION v2.0
                                    </span>
                                    <span className="rounded bg-[#0A2018]/90 border border-[#34D399]/50 px-2 py-0.5 text-[#6EE7B7] font-bold leading-tight">
                                        TRACK-01
                                    </span>
                                </div>

                                {/* Biometric Face-Tracking Frame */}
                                <div className="relative mx-auto my-auto h-36 w-36 flex flex-col items-center justify-center">
                                    <span className="absolute left-0 top-0 h-6 w-6 border-l-2 border-t-2 border-[#34D399]" />
                                    <span className="absolute right-0 top-0 h-6 w-6 border-r-2 border-t-2 border-[#34D399]" />
                                    <span className="absolute bottom-0 left-0 h-6 w-6 border-b-2 border-l-2 border-[#34D399]" />
                                    <span className="absolute bottom-0 right-0 h-6 w-6 border-b-2 border-r-2 border-[#34D399]" />

                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-[#6EE7B7] ring-1 ring-[#34D399]/40 backdrop-blur-xs">
                                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                        </svg>
                                    </div>
                                    <span className="mt-2 font-mono text-[9px] font-bold tracking-widest text-[#6EE7B7]">
                                        VERIFYING IDENTITY..
                                    </span>
                                </div>

                                {/* Bottom Location & Date Overlay */}
                                <div className="rounded-xl border border-white/10 bg-[#0A221A]/85 px-3 py-2 backdrop-blur-xs flex items-center gap-2.5 text-white">
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#18543E] text-[#6EE7B7]">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                                        </svg>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate text-[11px] font-bold text-white">
                                            {formattedFullDate}
                                        </p>
                                        <p className="truncate text-[9.5px] font-mono text-[#9ED1BE]">
                                            Location: -7.030114281042527, 107.5393714306826
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Deadline Row */}
                            <div className="mt-3.5 flex items-center justify-between text-[10.5px]">
                                <span className="font-bold text-[#DC2626]">
                                    ⏱ BATAS MASUK: 07:00 WIB
                                </span>
                                <span className="rounded-md bg-[#FEECEC] px-2 py-0.5 text-[10px] font-bold text-[#DC2626]">
                                    Tersisa 11 Menit 45 Detik
                                </span>
                            </div>

                            {/* Exact 3 Buttons Stack (Figma Screenshot 3) */}
                            <div className="mt-2.5 space-y-2">
                                <button
                                    type="button"
                                    className="w-full rounded-xl bg-[#0D3124] py-3 px-4 text-xs font-bold text-white shadow-xs hover:bg-[#154634] transition flex items-center justify-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                                        <circle cx="12" cy="13" r="3.25" />
                                    </svg>
                                    Absen Masuk Sekarang (Kamera Live)
                                </button>

                                <button
                                    type="button"
                                    className="w-full rounded-xl bg-[#0D3124] py-3 px-4 text-xs font-bold text-white shadow-xs hover:bg-[#154634] transition flex items-center justify-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                                        <circle cx="12" cy="13" r="3.25" />
                                    </svg>
                                    Submit
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setShowPiketModal(true)}
                                    className="w-full rounded-xl bg-[#EDF2FA] py-2.5 px-4 text-xs font-semibold text-slate-700 hover:bg-[#E1EAF6] transition flex items-center justify-center gap-2"
                                >
                                    <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.9" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                    </svg>
                                    Ajukan Izin / Dispensasi Tugas Luar
                                </button>
                            </div>

                            {/* Log Kehadiran Pekan Ini (Exact 3 Mini Cards from Figma Screenshot 3) */}
                            <div className="mt-5 pt-4 border-t border-[#EDF2F0]">
                                <div className="flex items-center justify-between text-[10.5px] font-bold">
                                    <span className="uppercase tracking-wider text-slate-500">
                                        LOG KEHADIRAN PEKAN INI
                                    </span>
                                    <span className="text-[#0E7452] cursor-pointer hover:underline">
                                        Riwayat Lengkap
                                    </span>
                                </div>
                                <div className="mt-2.5 grid grid-cols-3 gap-2">
                                    <div className="rounded-xl bg-[#F6F9F8] p-2.5 text-center">
                                        <span className="block text-[9.5px] font-semibold text-slate-500">
                                            Senin, 13 Okt
                                        </span>
                                        <span className="mt-0.5 block text-sm font-extrabold text-[#0E7452]">
                                            06:38
                                        </span>
                                        <span className="text-[9.5px] font-bold text-[#0E7452]">
                                            Tepat Waktu
                                        </span>
                                    </div>
                                    <div className="rounded-xl bg-[#F6F9F8] p-2.5 text-center">
                                        <span className="block text-[9.5px] font-semibold text-slate-500">
                                            Selasa, 14 Okt
                                        </span>
                                        <span className="mt-0.5 block text-sm font-extrabold text-[#0E7452]">
                                            06:42
                                        </span>
                                        <span className="text-[9.5px] font-bold text-[#0E7452]">
                                            Tepat Waktu
                                        </span>
                                    </div>
                                    <div className="rounded-xl bg-[#E8F5EE] p-2.5 text-center">
                                        <span className="block text-[9.5px] font-bold text-[#0E7452]">
                                            Rabu, 15 Okt
                                        </span>
                                        <span className="mt-0.5 block text-sm font-extrabold text-slate-900">
                                            Proses
                                        </span>
                                        <span className="text-[9.5px] font-bold text-slate-700">
                                            Standby Sesi
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column (7 cols): Active KBM Card + Jadwal Mengajar Hari Ini */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* Active KBM Session Card (Exact Figma Screenshot 3 Top-Right) */}
                        <div className="rounded-2xl border border-[#E5ECE9] bg-white p-6 shadow-2xs">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="inline-flex items-center gap-1.5 text-[10.5px] font-extrabold uppercase tracking-wider text-[#0E7452]">
                                    <span className="h-2 w-2 rounded-full bg-[#10B981]" />
                                    KBM SEGERA DIMULAI • JAM KE 1 - 2
                                </span>
                                <span className="rounded-full bg-[#E6F5EE] px-3 py-0.5 text-[10.5px] font-bold text-[#0E7452]">
                                    07:00 – 08:30 WIB (90 Menit)
                                </span>
                            </div>

                            <h2 className="mt-3 text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                                Matematika • Kelas VII–A
                            </h2>
                            <p className="mt-1 text-xs sm:text-[13px] text-slate-500">
                                Materi Pokok: Aljabar Linier Satu Variabel (CPP 6)
                            </p>

                            <div className="mt-4 space-y-2.5 text-xs text-slate-600">
                                <div className="flex items-center gap-2.5">
                                    <svg className="w-4 h-4 text-[#0E7452] shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19.5s6-5.25 6-10.125a6 6 0 10-12 0C6 14.25 12 19.5 12 19.5z" />
                                    </svg>
                                    <span>Ruang 04, Gedung A Lantai 1</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <svg className="w-4 h-4 text-[#0E7452] shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" />
                                    </svg>
                                    <span>32 Siswa Terdaftar</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <svg className="w-4 h-4 text-[#0E7452] shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                        <rect x="4" y="4" width="16" height="16" rx="2" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                                    </svg>
                                    <span>RPP Terverifikasi</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="mt-5 w-full rounded-xl bg-[#046C4E] py-3.5 px-4 text-xs font-bold text-white shadow-xs hover:bg-[#03583F] transition flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0m2.25-9.868l1.5 1.5 3-3" />
                                </svg>
                                Buka Presensi Siswa Kelas VII–A
                            </button>
                        </div>

                        {/* Jadwal Mengajar Hari Ini Card (Exact Figma Screenshot 3 Bottom-Right) */}
                        <div className="rounded-2xl border border-[#E5ECE9] bg-white p-6 shadow-2xs">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-[#0E7452]" fill="none" viewBox="0 0 24 24" strokeWidth="1.9" stroke="currentColor">
                                        <rect x="3.5" y="4.5" width="17" height="16" rx="2" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 3v3m8-3v3M3.5 9.5h17" />
                                    </svg>
                                    <h3 className="text-base font-bold text-slate-900">
                                        Jadwal Mengajar Hari Ini
                                    </h3>
                                </div>
                                <div className="text-[11px] font-medium text-slate-500">
                                    {formattedShortDate} •{' '}
                                    <span className="font-bold text-[#0E7452]">
                                        Total: 6 Jam Pelajaran
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {/* JAM 1-2 */}
                                <div className="flex items-center justify-between gap-3 rounded-xl bg-[#F7FAF9] p-3.5">
                                    <div className="flex items-center gap-3.5 min-w-0">
                                        <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-[#0D3124] text-white leading-none">
                                            <span className="text-[8.5px] font-bold uppercase tracking-wider text-[#9BF6C8]">
                                                JAM
                                            </span>
                                            <span className="mt-0.5 text-xs font-extrabold">1–2</span>
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-xs sm:text-[13.5px] font-bold text-slate-900">
                                                    Matematika • Kelas VII–A
                                                </span>
                                                <span className="rounded-md bg-[#E5F6ED] px-2 py-0.5 text-[10px] font-bold text-[#0E7452]">
                                                    Siap Absensi
                                                </span>
                                            </div>
                                            <p className="mt-0.5 text-[11px] text-slate-500">
                                                07:00 - 08:30 WIB • Ruang 04, Gedung A • 32 Siswa
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-slate-600 shrink-0 pr-1">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.9" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 6.75h9m-9 4.5h9m-9 4.5h5.25m6-2.25l1.5 1.5 3-3" />
                                        </svg>
                                    </span>
                                </div>

                                {/* JAM 3-4 */}
                                <div className="flex items-center justify-between gap-3 rounded-xl border border-[#F0F4F2] bg-white p-3.5">
                                    <div className="flex items-center gap-3.5 min-w-0">
                                        <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-[#EBF2FF] text-slate-900 leading-none">
                                            <span className="text-[8.5px] font-bold uppercase tracking-wider text-slate-600">
                                                JAM
                                            </span>
                                            <span className="mt-0.5 text-xs font-extrabold">3–4</span>
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-xs sm:text-[13.5px] font-bold text-slate-900">
                                                    Matematika • Kelas VIII–B
                                                </span>
                                                <span className="rounded-md bg-[#EBF2FF] px-2 py-0.5 text-[10px] font-bold text-[#1E40AF]">
                                                    Terjadwal
                                                </span>
                                            </div>
                                            <p className="mt-0.5 text-[11px] text-slate-500">
                                                08:45 - 10:15 WIB • Lab Komputer 1 (Praktik Geogebra) • 30 Siswa
                                            </p>
                                        </div>
                                    </div>
                                    <div className="hidden sm:flex items-center gap-2 shrink-0">
                                        <span className="rounded-lg bg-[#F6F9F8] px-2.5 py-1.5 text-[10.5px] font-semibold text-slate-500 text-center leading-tight">
                                            Menunggu<br />Sesi
                                        </span>
                                        <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Mint Break Strip */}
                                <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#EDF7F2] px-4 py-2.5 text-[10.5px] font-extrabold text-[#0E7452]">
                                    <span className="uppercase tracking-wider">
                                        ☕ ISTIRAHAT PAGI • PIKET PENGAWASAN KORIDOR
                                    </span>
                                    <span>10:15 - 10:30 WIB (15 Menit)</span>
                                </div>

                                {/* JAM 5-6 */}
                                <div className="flex items-center justify-between gap-3 rounded-xl border border-[#F0F4F2] bg-white p-3.5">
                                    <div className="flex items-center gap-3.5 min-w-0">
                                        <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-[#EBF2FF] text-slate-900 leading-none">
                                            <span className="text-[8.5px] font-bold uppercase tracking-wider text-slate-600">
                                                JAM
                                            </span>
                                            <span className="mt-0.5 text-xs font-extrabold">5–6</span>
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-xs sm:text-[13.5px] font-bold text-slate-900">
                                                    Matematika • Kelas IX–D
                                                </span>
                                                <span className="rounded-md bg-[#EBF2FF] px-2 py-0.5 text-[10px] font-bold text-[#1E40AF]">
                                                    Terjadwal
                                                </span>
                                            </div>
                                            <p className="mt-0.5 text-[11px] text-slate-500">
                                                10:30 - 12:00 WIB • Ruang 12, Gedung B Lantai 2 • 32 Siswa
                                            </p>
                                        </div>
                                    </div>
                                    <div className="hidden sm:flex items-center gap-2 shrink-0">
                                        <span className="rounded-lg bg-[#F6F9F8] px-2.5 py-1.5 text-[10.5px] font-semibold text-slate-500 text-center leading-tight">
                                            Menunggu<br />Sesi
                                        </span>
                                        <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Koordinasi Guru Piket Hari Ini Modal (Opened via 'Koordinasi Admin' / 'Ajukan Izin') */}
            <Modal show={showPiketModal} onClose={() => setShowPiketModal(false)} maxWidth="md">
                <div className="p-6">
                    <div className="flex items-center justify-between pb-3 border-b border-[#EDF2F0]">
                        <div>
                            <h3 className="font-serif text-lg font-bold text-slate-900">
                                Koordinasi Guru Piket Hari Ini
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Hubungi Guru Piket via WhatsApp untuk penggantian sesi & kode unik 6-digit.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowPiketModal(false)}
                            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="mt-4 space-y-2.5">
                        {piketHariIni.length === 0 ? (
                            <p className="rounded-xl bg-[#F6F9F8] p-4 text-center text-xs text-slate-500">
                                Belum ada akun Guru Piket aktif terdaftar.
                            </p>
                        ) : (
                            piketHariIni.map((piket) => (
                                <div
                                    key={piket.id}
                                    className="flex items-center justify-between gap-3 rounded-xl border border-[#E5ECE9] bg-[#F8FAF9] p-3"
                                >
                                    <div className="min-w-0">
                                        <p className="truncate text-xs font-bold text-slate-900">
                                            {piket.nama}
                                        </p>
                                        <p className="truncate font-mono text-[11px] text-slate-500">
                                            {piket.no_wa || 'No. WA belum diatur'}
                                        </p>
                                    </div>
                                    {piket.no_wa && (
                                        <a
                                            href={`https://wa.me/${piket.no_wa}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="rounded-lg bg-[#046C4E] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#0D3124] transition shrink-0"
                                        >
                                            Hubungi WA
                                        </a>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
