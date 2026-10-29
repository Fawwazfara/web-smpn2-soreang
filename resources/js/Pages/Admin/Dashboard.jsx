import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

export default function Dashboard({ stats = {}, kelasList = [] }) {
    const user = usePage().props.auth.user;
    const [tingkatFilter, setTingkatFilter] = useState('all');

    const tahunAjaran = stats.tahun_ajaran_aktif;
    const totalGuru = stats.total_guru ?? 0;
    const guruAktif = stats.total_guru_aktif ?? totalGuru;
    const guruPengajar = stats.total_guru_pengajar ?? totalGuru;
    const tendik = stats.total_tendik ?? 0;
    const totalPiket = stats.total_guru_piket ?? 0;
    const totalKepsek = stats.total_kepsek ?? 0;
    const totalNonaktif = stats.total_nonaktif ?? 0;
    const totalAkun = stats.total_akun ?? totalGuru + totalPiket + totalKepsek;
    const totalKelas = stats.total_kelas ?? kelasList.length;
    const totalSiswa = stats.total_siswa ?? 0;

    const guruAktifPct = totalGuru > 0 ? ((guruAktif / totalGuru) * 100).toFixed(1) : '100.0';
    const akunAktifCount = Math.max(0, totalAkun - totalNonaktif);
    const akunAktifPct = totalAkun > 0 ? ((akunAktifCount / totalAkun) * 100).toFixed(1) : '100.0';

    const now = new Date();
    const hour = now.getHours();
    const greeting =
        hour < 11 ? 'Selamat Pagi' : hour < 15 ? 'Selamat Siang' : hour < 18 ? 'Selamat Sore' : 'Selamat Malam';

    const formattedToday = now.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });

    const filteredKelas = useMemo(() => {
        const list =
            tingkatFilter === 'all'
                ? kelasList
                : kelasList.filter((k) => String(k.tingkat) === String(tingkatFilter));
        return list.slice(0, 6);
    }, [kelasList, tingkatFilter]);

    // SVG Donut calculations (r = 52 -> circumference ~ 326.73)
    const radius = 52;
    const circumference = 2 * Math.PI * radius;
    const denom = Math.max(1, totalGuru + totalPiket + totalKepsek + totalNonaktif);
    const segGuru = (totalGuru / denom) * circumference;
    const segPiket = (totalPiket / denom) * circumference;
    const segKepsek = (totalKepsek / denom) * circumference;
    const segNonaktif = (totalNonaktif / denom) * circumference;

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard Admin - SADA" />

            <div className="space-y-5">
                {/* Greeting Banner Card (Figma Admin Dashboard Top Card) */}
                <div className="rounded-2xl border border-[#E5ECE9] bg-white p-5 sm:p-6 shadow-2xs">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h1 className="font-serif text-2xl sm:text-[28px] font-bold tracking-tight text-slate-900">
                                {greeting}, {user.nama}
                            </h1>
                            <p className="mt-1 text-xs sm:text-[13px] text-slate-500">
                                Ringkasan manajemen akun, data master & kesiapan operasional KBM{' '}
                                <span className="text-slate-300">•</span>
                            </p>
                            <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
                                <span className="text-xs sm:text-[13px] font-bold text-slate-800">
                                    {formattedToday}
                                </span>
                                <span className="inline-flex items-center rounded-full bg-[#E6F5EE] px-3 py-0.5 text-[11px] font-bold text-[#0E7452]">
                                    {tahunAjaran
                                        ? `T.A. ${tahunAjaran.nama} • Semester ${tahunAjaran.semester}`
                                        : 'Tahun Ajaran Belum Aktif'}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col sm:items-end gap-2.5">
                            <div className="flex flex-wrap items-center gap-2">
                                <Link
                                    href={route('users.index')}
                                    className="inline-flex items-center gap-1.5 rounded-full border border-[#E2E8E5] bg-[#F8FAF9] px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-[#EDF3F0] transition"
                                >
                                    <svg className="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.9" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" />
                                    </svg>
                                    Kelola Akun Guru
                                </Link>
                                <Link
                                    href={route('tahun-ajaran.index')}
                                    className="inline-flex items-center gap-1.5 rounded-full border border-[#E2E8E5] bg-[#F8FAF9] px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-[#EDF3F0] transition"
                                >
                                    <svg className="w-3.5 h-3.5 text-[#0E7452]" fill="none" viewBox="0 0 24 24" strokeWidth="1.9" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75" />
                                    </svg>
                                    Tahun Ajaran
                                </Link>
                            </div>
                            <Link
                                href={route('admin.berita.index')}
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0F382A] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#164B38] transition"
                            >
                                <span className="flex h-4 w-4 items-center justify-center rounded-full border border-white/40 text-[11px] leading-none">
                                    +
                                </span>
                                Buat Pengumuman
                            </Link>
                        </div>
                    </div>
                </div>

                {/* 4 KPI Summary Cards (Figma 4-Card Row) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {/* Card 1: Guru & Tendik */}
                    <div className="rounded-2xl border border-[#E5ECE9] bg-white p-5 shadow-2xs flex flex-col justify-between">
                        <div>
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E6F5EE] text-[#0E7452]">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.9" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                                    </svg>
                                </div>
                                <span className="inline-flex items-center gap-1 rounded-full bg-[#E6F5EE] px-2.5 py-0.5 text-[10.5px] font-bold text-[#0E7452]">
                                    ↗ {guruAktifPct}%
                                </span>
                            </div>
                            <p className="mt-4 text-xs font-medium text-slate-500">Total Guru & Tendik Aktif</p>
                            <div className="mt-1 flex items-baseline gap-1.5">
                                <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                                    {guruAktif}
                                </span>
                                <span className="text-xs font-semibold text-slate-400">
                                    / {totalGuru} Guru
                                </span>
                            </div>
                        </div>

                        <div className="mt-4 rounded-xl bg-[#F4F9F6] px-3 py-2.5 flex items-center justify-between text-[11px]">
                            <span className="inline-flex items-center gap-1.5 font-semibold text-[#0E7452]">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                                {guruPengajar} Pengajar
                            </span>
                            <span className="font-medium text-slate-500">{tendik} Tendik</span>
                        </div>
                    </div>

                    {/* Card 2: Guru Piket */}
                    <div className="rounded-2xl border border-[#E5ECE9] bg-white p-5 shadow-2xs flex flex-col justify-between">
                        <div>
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FEF3E2] text-[#B45309]">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.9" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                                    </svg>
                                </div>
                                <span className="inline-flex items-center rounded-full bg-[#FEF3E2] px-2.5 py-0.5 text-[10.5px] font-bold text-[#B45309]">
                                    Siaga Piket
                                </span>
                            </div>
                            <p className="mt-4 text-xs font-medium text-slate-500">Petugas Guru Piket</p>
                            <div className="mt-1 flex items-baseline gap-1.5">
                                <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                                    {totalPiket}
                                </span>
                                <span className="text-xs font-semibold text-slate-400">Petugas</span>
                            </div>
                        </div>

                        <div className="mt-4 rounded-xl bg-[#FFF9F0] px-3 py-2.5 flex items-center justify-between text-[11px] text-[#B45309]">
                            <span className="truncate font-medium">Kontak WA pengganti</span>
                            <Link
                                href={route('users.index', { role: 'guru_piket' })}
                                className="font-bold underline ml-2 shrink-0"
                            >
                                Cek
                            </Link>
                        </div>
                    </div>

                    {/* Card 3: Kelas & Rombel */}
                    <div className="rounded-2xl border border-[#E5ECE9] bg-white p-5 shadow-2xs flex flex-col justify-between">
                        <div>
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EBF1FF] text-[#1E40AF]">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.9" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                                    </svg>
                                </div>
                                <span className="inline-flex items-center rounded-full bg-[#EBF1FF] px-2.5 py-0.5 text-[10.5px] font-bold text-[#1E40AF]">
                                    {totalSiswa} Siswa
                                </span>
                            </div>
                            <p className="mt-4 text-xs font-medium text-slate-500">Kelas & Rombongan Belajar</p>
                            <div className="mt-1 flex items-baseline gap-1.5">
                                <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                                    {totalKelas}
                                </span>
                                <span className="text-xs font-semibold text-slate-400">Rombel</span>
                            </div>
                        </div>

                        <div className="mt-4 rounded-xl bg-[#F6F8FC] px-3 py-2.5 flex items-center justify-between text-[11px] text-slate-600">
                            <span className="truncate font-medium">
                                {tahunAjaran ? `T.A. ${tahunAjaran.nama}` : 'Semua Tahun Ajaran'}
                            </span>
                            <Link
                                href={route('kelas.index')}
                                className="font-bold text-slate-800 hover:text-[#0F382A] ml-2 shrink-0"
                            >
                                Buka ›
                            </Link>
                        </div>
                    </div>

                    {/* Card 4: Akun Nonaktif / Kepsek */}
                    <div className="rounded-2xl border border-[#E5ECE9] bg-white p-5 shadow-2xs flex flex-col justify-between">
                        <div>
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FEECEC] text-[#DC2626]">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.9" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                    </svg>
                                </div>
                                <span className="inline-flex items-center rounded-full bg-[#FEECEC] px-2.5 py-0.5 text-[10.5px] font-bold text-[#DC2626]">
                                    {totalKepsek} Akun Kepsek
                                </span>
                            </div>
                            <p className="mt-4 text-xs font-medium text-slate-500">Akun Nonaktif / Ditangguhkan</p>
                            <div className="mt-1 flex items-baseline gap-1.5">
                                <span className="text-3xl font-extrabold tracking-tight text-[#DC2626]">
                                    {totalNonaktif}
                                </span>
                                <span className="text-xs font-semibold text-slate-400">
                                    / {totalAkun} Akun
                                </span>
                            </div>
                        </div>

                        <div className="mt-4 rounded-xl bg-[#FFF5F5] px-3 py-2.5 flex items-center justify-between text-[11px] text-[#DC2626]">
                            <span className="truncate font-medium">Akses login ditolak</span>
                            <Link
                                href={route('users.index', { status: 'nonaktif' })}
                                className="font-bold underline ml-2 shrink-0"
                            >
                                Tindak
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Middle Row: Rombel Progress Bars (Left 8 cols) + Donut Chart & Quick Actions (Right 4 cols) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    {/* Left: Kesiapan Rombel per Angkatan */}
                    <div className="lg:col-span-8 rounded-2xl border border-[#E5ECE9] bg-white p-6 shadow-2xs flex flex-col justify-between">
                        <div>
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                <div>
                                    <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
                                        Kesiapan Angkatan & Rombel
                                    </h2>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Status penugasan wali kelas dan kuota peserta didik pada tahun ajaran aktif
                                    </p>
                                </div>

                                {/* Segmented Filter Pills */}
                                <div className="inline-flex items-center rounded-xl bg-[#F4F7F6] p-1 text-xs self-start">
                                    {[
                                        { key: 'all', label: 'Semua' },
                                        { key: '7', label: 'Kelas 7' },
                                        { key: '8', label: 'Kelas 8' },
                                        { key: '9', label: 'Kelas 9' },
                                    ].map((tab) => (
                                        <button
                                            key={tab.key}
                                            type="button"
                                            onClick={() => setTingkatFilter(tab.key)}
                                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                                                tingkatFilter === tab.key
                                                    ? 'bg-white text-slate-900 shadow-2xs'
                                                    : 'text-slate-500 hover:text-slate-800'
                                            }`}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Progress Bar List */}
                            <div className="mt-6 space-y-5">
                                {filteredKelas.length === 0 ? (
                                    <div className="rounded-xl border border-dashed border-[#DCE5E1] bg-[#F8FAF9] p-8 text-center">
                                        <p className="text-xs font-semibold text-slate-600">
                                            Belum ada rombel untuk filter ini.
                                        </p>
                                        <Link
                                            href={route('kelas.index')}
                                            className="mt-2 inline-flex items-center text-xs font-bold text-[#0E7452] hover:underline"
                                        >
                                            + Tambah Data Kelas & Rombel →
                                        </Link>
                                    </div>
                                ) : (
                                    filteredKelas.map((item) => {
                                        const hasWali = Boolean(item.wali_kelas);
                                        const siswaCount = item.siswa_count ?? 0;
                                        const barPct = hasWali ? (siswaCount > 0 ? 100 : 88) : 62;
                                        const barColor = hasWali
                                            ? siswaCount > 0
                                                ? 'bg-[#10B981]'
                                                : 'bg-[#0EA5E9]'
                                            : 'bg-[#EA9A15]';
                                        const textColor = hasWali
                                            ? siswaCount > 0
                                                ? 'text-[#0E7452]'
                                                : 'text-[#0284C7]'
                                            : 'text-[#B45309]';
                                        const dotColor = barColor;

                                        return (
                                            <div key={item.id}>
                                                <div className="flex items-center justify-between text-xs mb-1.5">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <span className={`h-2 w-2 rounded-full ${dotColor} shrink-0`} />
                                                        <span className="font-bold text-slate-800">
                                                            Kelas {item.nama}
                                                        </span>
                                                        <span className="text-slate-400 truncate">
                                                            ({item.wali_kelas ? `Wali: ${item.wali_kelas.nama}` : 'Belum ada Wali Kelas'} • {siswaCount} Siswa)
                                                        </span>
                                                    </div>
                                                    <span className={`font-extrabold ${textColor} shrink-0 ml-2`}>
                                                        {hasWali ? 'Siap KBM' : 'Perlu Wali'}
                                                    </span>
                                                </div>
                                                <div className="h-2 w-full rounded-full bg-[#EDF2F0] overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${barColor} transition-all duration-300`}
                                                        style={{ width: `${barPct}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Legend Footer */}
                        <div className="mt-6 pt-4 border-t border-[#F0F4F2] flex flex-wrap items-center gap-5 text-[11px] font-medium text-slate-500">
                            <span className="inline-flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-[#10B981]" />
                                Wali Kelas & Siswa Lengkap
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-[#0EA5E9]" />
                                Wali Kelas Terdaftar
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-[#EA9A15]" />
                                Perlu Penetapan Wali Kelas
                            </span>
                        </div>
                    </div>

                    {/* Right Column: Donut Chart + Quick Actions */}
                    <div className="lg:col-span-4 space-y-5">
                        {/* Donut Chart Card */}
                        <div className="rounded-2xl border border-[#E5ECE9] bg-white p-6 shadow-2xs">
                            <div className="flex items-center justify-between">
                                <h2 className="text-base font-bold text-slate-900">Distribusi Akun</h2>
                                <span className="rounded-lg border border-[#E5ECE9] bg-[#F8FAF9] px-2.5 py-0.5 text-[10.5px] font-semibold text-slate-500">
                                    SADA v2.0
                                </span>
                            </div>

                            {/* SVG Donut */}
                            <div className="my-5 flex items-center justify-center">
                                <div className="relative h-36 w-36 flex items-center justify-center">
                                    <svg className="h-36 w-36 -rotate-90" viewBox="0 0 128 128">
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r={radius}
                                            fill="transparent"
                                            stroke="#EDF2F0"
                                            strokeWidth="13"
                                        />
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r={radius}
                                            fill="transparent"
                                            stroke="#0B6E4F"
                                            strokeWidth="13"
                                            strokeDasharray={`${segGuru} ${circumference}`}
                                            strokeDashoffset={0}
                                        />
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r={radius}
                                            fill="transparent"
                                            stroke="#EA9A15"
                                            strokeWidth="13"
                                            strokeDasharray={`${segPiket} ${circumference}`}
                                            strokeDashoffset={-segGuru}
                                        />
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r={radius}
                                            fill="transparent"
                                            stroke="#0EA5E9"
                                            strokeWidth="13"
                                            strokeDasharray={`${segKepsek} ${circumference}`}
                                            strokeDashoffset={-(segGuru + segPiket)}
                                        />
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r={radius}
                                            fill="transparent"
                                            stroke="#DC2626"
                                            strokeWidth="13"
                                            strokeDasharray={`${segNonaktif} ${circumference}`}
                                            strokeDashoffset={-(segGuru + segPiket + segKepsek)}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                        <span className="text-xl font-extrabold text-slate-900">
                                            {akunAktifPct}%
                                        </span>
                                        <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#0E7452]">
                                            AKUN AKTIF
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Breakdown List */}
                            <div className="space-y-2.5 text-xs">
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-2 text-slate-600">
                                        <span className="h-2.5 w-2.5 rounded-full bg-[#0B6E4F]" />
                                        Guru & Tendik
                                    </span>
                                    <span className="font-bold text-slate-900">{totalGuru} Akun</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-2 text-slate-600">
                                        <span className="h-2.5 w-2.5 rounded-full bg-[#EA9A15]" />
                                        Guru Piket
                                    </span>
                                    <span className="font-bold text-slate-900">{totalPiket} Akun</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-2 text-slate-600">
                                        <span className="h-2.5 w-2.5 rounded-full bg-[#0EA5E9]" />
                                        Kepala Sekolah
                                    </span>
                                    <span className="font-bold text-slate-900">{totalKepsek} Akun</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-2 text-slate-600">
                                        <span className="h-2.5 w-2.5 rounded-full bg-[#DC2626]" />
                                        Nonaktif
                                    </span>
                                    <span className="font-bold text-[#DC2626]">{totalNonaktif} Akun</span>
                                </div>
                            </div>
                        </div>

                        {/* Aksi Cepat TU Card */}
                        <div className="rounded-2xl border border-[#E5ECE9] bg-white p-5 shadow-2xs">
                            <h3 className="text-sm font-bold text-slate-900 mb-3.5">
                                Aksi Cepat TU & Master
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <Link
                                    href={route('users.index')}
                                    className="rounded-xl border border-[#E5ECE9] bg-[#F8FAF9] p-3.5 text-center hover:border-[#0E7452] hover:bg-[#EDF6F1] transition group"
                                >
                                    <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#0E7452] shadow-2xs group-hover:bg-[#0F382A] group-hover:text-white transition">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                                        </svg>
                                    </div>
                                    <span className="mt-2 block text-xs font-bold text-slate-800">
                                        Akun Pegawai
                                    </span>
                                </Link>

                                <Link
                                    href={route('kelas.index')}
                                    className="rounded-xl border border-[#E5ECE9] bg-[#F8FAF9] p-3.5 text-center hover:border-[#0E7452] hover:bg-[#EDF6F1] transition group"
                                >
                                    <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#D97706] shadow-2xs group-hover:bg-[#0F382A] group-hover:text-white transition">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15" />
                                        </svg>
                                    </div>
                                    <span className="mt-2 block text-xs font-bold text-slate-800">
                                        Data Rombel
                                    </span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Card: Live Monitor Ruang & Wali Kelas */}
                <div className="rounded-2xl border border-[#E5ECE9] bg-white shadow-2xs overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-6 py-4 border-b border-[#E5ECE9]">
                        <div className="flex items-center gap-2.5">
                            <span className="h-2.5 w-2.5 rounded-full bg-[#10B981]" />
                            <h2 className="text-base font-bold text-slate-900">
                                Daftar Ruang KBM & Wali Kelas
                            </h2>
                            <span className="rounded-full bg-[#E6F5EE] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#0E7452]">
                                {tahunAjaran ? `T.A. ${tahunAjaran.nama}` : 'DATA MASTER'}
                            </span>
                        </div>
                        <Link
                            href={route('kelas.index')}
                            className="text-xs font-bold text-[#0E7452] hover:text-[#0F382A] transition"
                        >
                            Buka Matriks Kelas Penuh →
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-[#EDF2F0]">
                            <thead className="bg-[#F8FAF9]">
                                <tr>
                                    <th className="px-6 py-3 text-left text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                                        Kelas & Tingkat
                                    </th>
                                    <th className="px-6 py-3 text-left text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                                        Wali Kelas Pengampu
                                    </th>
                                    <th className="px-6 py-3 text-left text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                                        Siswa Terdaftar
                                    </th>
                                    <th className="px-6 py-3 text-left text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                                        Status Rombel
                                    </th>
                                    <th className="px-6 py-3 text-right text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#EDF2F0] bg-white">
                                {kelasList.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-xs text-slate-400">
                                            Belum ada kelas terdaftar pada tahun ajaran aktif.
                                        </td>
                                    </tr>
                                ) : (
                                    kelasList.slice(0, 6).map((kelas) => (
                                        <tr key={kelas.id} className="hover:bg-[#F8FAF9] transition">
                                            <td className="px-6 py-3.5 whitespace-nowrap">
                                                <div className="text-xs font-bold text-slate-900">
                                                    Kelas {kelas.nama}
                                                </div>
                                                <div className="text-[11px] text-slate-400">
                                                    Tingkat {kelas.tingkat}
                                                </div>
                                            </td>
                                            <td className="px-6 py-3.5 whitespace-nowrap text-xs font-medium text-slate-700">
                                                {kelas.wali_kelas?.nama ?? (
                                                    <span className="italic text-amber-600">Belum ditetapkan</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-3.5 whitespace-nowrap text-xs font-semibold text-slate-700">
                                                {kelas.siswa_count ?? 0} Siswa
                                            </td>
                                            <td className="px-6 py-3.5 whitespace-nowrap">
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E6F5EE] px-2.5 py-0.5 text-[10.5px] font-bold text-[#0E7452]">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                                                    Aktif
                                                </span>
                                            </td>
                                            <td className="px-6 py-3.5 whitespace-nowrap text-right">
                                                <Link
                                                    href={route('kelas.index')}
                                                    className="text-xs font-bold text-[#0E7452] hover:underline"
                                                >
                                                    Kelola
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
