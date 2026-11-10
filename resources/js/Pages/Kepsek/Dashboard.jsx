import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useMemo, useState, useEffect } from 'react';

export default function Dashboard({
    stats = {},
    kelasList = [],
    daftarAbsenHariIni = [],
    absenGuruTerbaru = [],
    sesiHariIni = [],
    sesiStats = {},
    piketHariIni = [],
    aturanJam = {},
}) {
    const user = usePage().props.auth.user;

    // View Tabs: 'sesi' | 'presensi' | 'rombel' | 'piket'
    const [activeTab, setActiveTab] = useState('sesi');

    // Filters for Sesi Tab
    const [sesiTingkatFilter, setSesiTingkatFilter] = useState('all');
    const [sesiStatusFilter, setSesiStatusFilter] = useState('all');
    const [sesiSearch, setSesiSearch] = useState('');

    // Filters for Presensi Tab
    const [presensiStatusFilter, setPresensiStatusFilter] = useState('all');
    const [presensiRoleFilter, setPresensiRoleFilter] = useState('all');
    const [presensiSearch, setPresensiSearch] = useState('');

    // Filter for Rombel Tab
    const [rombelTingkatFilter, setRombelTingkatFilter] = useState('all');

    // Selected photo modal for Read-Only Inspection
    const [inspeksiFoto, setInspeksiFoto] = useState(null);

    // Live Clock (WIB)
    const [now, setNow] = useState(() => new Date());
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

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

    const tahunAjaran = stats.tahun_ajaran_aktif;
    const totalGuru = stats.total_guru ?? 0;
    const totalGuruPengajar = stats.total_guru_pengajar ?? Math.max(0, totalGuru - (stats.total_tendik ?? 0));
    const tendik = stats.total_tendik ?? 0;
    const totalPiket = stats.total_guru_piket ?? 0;
    const totalSiswa = stats.total_siswa ?? 0;
    const totalKelas = stats.total_kelas ?? kelasList.length;

    const totalWajibAbsen = stats.total_wajib_absen ?? (totalGuru + totalPiket);
    const hadirHariIni = stats.hadir_hari_ini ?? 0;
    const tepatWaktuHariIni = stats.tepat_waktu_hari_ini ?? 0;
    const terlambatHariIni = stats.terlambat_hari_ini ?? 0;
    const belumAbsenHariIni = stats.belum_absen_hari_ini ?? Math.max(0, totalWajibAbsen - hadirHariIni);
    const hadirPctHariIni = stats.persentase_hadir_hari_ini ?? '0.0';

    const totalSesiHariIni = sesiStats.total_sesi ?? sesiHariIni.length;
    const sesiBerlangsung = sesiStats.sesi_berlangsung ?? sesiHariIni.filter((s) => s.status_pelaksanaan === 'berlangsung').length;
    const sesiSelesai = sesiStats.sesi_selesai ?? sesiHariIni.filter((s) => s.status_pelaksanaan === 'selesai').length;
    const sesiTerjadwal = sesiStats.sesi_terjadwal ?? sesiHariIni.filter((s) => s.status_pelaksanaan === 'terjadwal').length;
    const sesiDigantikan = sesiStats.sesi_digantikan ?? sesiHariIni.filter((s) => s.is_digantikan).length;

    // Filtered Sesi List
    const filteredSesiList = useMemo(() => {
        return sesiHariIni.filter((item) => {
            // Tingkat filter
            if (sesiTingkatFilter !== 'all') {
                if (String(item.kelas?.tingkat) !== String(sesiTingkatFilter)) {
                    return false;
                }
            }

            // Status filter
            if (sesiStatusFilter === 'digantikan') {
                if (!item.is_digantikan) return false;
            } else if (sesiStatusFilter !== 'all') {
                if (item.status_pelaksanaan !== sesiStatusFilter) {
                    return false;
                }
            }

            // Search query
            if (sesiSearch.trim()) {
                const q = sesiSearch.toLowerCase();
                const matchKelas = item.kelas?.nama?.toLowerCase().includes(q);
                const matchMapel = item.mapel?.nama?.toLowerCase().includes(q) || item.mapel?.kode?.toLowerCase().includes(q);
                const matchGuru = item.guru?.nama?.toLowerCase().includes(q) || item.guru?.username?.toLowerCase().includes(q);
                const matchPengganti = item.guru_pengganti?.nama?.toLowerCase().includes(q);
                if (!matchKelas && !matchMapel && !matchGuru && !matchPengganti) {
                    return false;
                }
            }

            return true;
        });
    }, [sesiHariIni, sesiTingkatFilter, sesiStatusFilter, sesiSearch]);

    // Filtered Presensi List
    const filteredPresensiList = useMemo(() => {
        const sourceList = daftarAbsenHariIni.length > 0 ? daftarAbsenHariIni : absenGuruTerbaru;
        return sourceList.filter((item) => {
            // Status filter
            if (presensiStatusFilter !== 'all') {
                if (item.status !== presensiStatusFilter) {
                    return false;
                }
            }

            // Role / Jabatan filter
            if (presensiRoleFilter !== 'all') {
                if (presensiRoleFilter === 'guru_pengajar' && (item.role !== 'guru' || item.jenis_pegawai !== 'guru')) {
                    return false;
                }
                if (presensiRoleFilter === 'tendik' && (item.role !== 'guru' || item.jenis_pegawai !== 'tenaga_kependidikan')) {
                    return false;
                }
                if (presensiRoleFilter === 'guru_piket' && item.role !== 'guru_piket') {
                    return false;
                }
            }

            // Search filter
            if (presensiSearch.trim()) {
                const q = presensiSearch.toLowerCase();
                const matchNama = item.nama?.toLowerCase().includes(q);
                const matchNip = item.username?.toLowerCase().includes(q);
                if (!matchNama && !matchNip) {
                    return false;
                }
            }

            return true;
        });
    }, [daftarAbsenHariIni, absenGuruTerbaru, presensiStatusFilter, presensiRoleFilter, presensiSearch]);

    // Filtered Rombel List
    const filteredKelasList = useMemo(() => {
        if (rombelTingkatFilter === 'all') return kelasList;
        return kelasList.filter((k) => String(k.tingkat) === String(rombelTingkatFilter));
    }, [kelasList, rombelTingkatFilter]);

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard Monitoring Kepala Sekolah (Read-Only) - SADA SMPN 2 Soreang" />

            <div className="space-y-6">
                {/* 1. Executive Header */}
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
                            <span>KEPSEK WORKSPACE</span>
                            <span>›</span>
                            <span>MONITORING MENYELURUH</span>
                            <span>›</span>
                            <span className="text-[#0E7452]">PEMANTAUAN REAL-TIME</span>
                        </div>
                        <div className="mt-2 border-l-4 border-[#0F382A] pl-4">
                            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                                Pemantauan Kehadiran & Operasional Sekolah
                            </h1>
                        </div>
                        <p className="mt-2 text-xs sm:text-[13px] text-slate-600 max-w-3xl leading-relaxed">
                            Selamat bertugas, <strong className="text-slate-900">{user.nama}</strong>. Dashboard ini menyajikan pemantauan menyeluruh presensi harian seluruh pegawai dan status pelaksanaan jam mengajar di setiap kelas SMPN 2 Soreang secara transparan dalam mode baca-saja (Read-Only).
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                        <span className="inline-flex items-center gap-2 rounded-xl border border-[#CBE9DA] bg-[#E6F5EE] px-3.5 py-2 text-xs font-bold text-[#0E7452] shadow-2xs">
                            <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
                            Mode Eksekutif Read-Only
                        </span>

                        <div className="inline-flex items-center gap-2 rounded-xl border border-[#E5ECE9] bg-white px-3.5 py-2 text-xs font-bold text-slate-800 shadow-2xs">
                            <svg className="w-3.5 h-3.5 text-[#0E7452]" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-mono">{liveClock} WIB</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-600">{formattedFullDate}</span>
                        </div>

                        {tahunAjaran && (
                            <span className="inline-flex items-center rounded-xl border border-[#E5ECE9] bg-white px-3.5 py-2 text-xs font-bold text-slate-800 shadow-2xs">
                                T.A. {tahunAjaran.nama} • {tahunAjaran.semester}
                            </span>
                        )}
                    </div>
                </div>

                {/* 2. Top 4 Executive KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {/* KPI 1: Presensi Pegawai Hari Ini */}
                    <div className="rounded-2xl border border-[#C5CEE3] bg-[#E8EEFF]/40 p-5 shadow-2xs flex flex-col justify-between hover:bg-[#E8EEFF]/70 transition">
                        <div>
                            <div className="flex items-start justify-between">
                                <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#3F463F]">
                                    PRESENSI PEGAWAI HARI INI
                                </span>
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E6F5EE] text-[#0E7452]">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="mt-2 flex items-baseline gap-1.5">
                                <span className="text-3xl font-extrabold text-[#111C2D]">{hadirHariIni}</span>
                                <span className="text-xs font-semibold text-slate-500">
                                    / {totalWajibAbsen} Pegawai Wajib
                                </span>
                            </div>
                            <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-[#006C4A]">
                                <span>{hadirPctHariIni}% Hadir</span>
                                <span className="text-slate-300">•</span>
                                <span className="text-emerald-700">{tepatWaktuHariIni} Tepat</span>
                                <span className="text-slate-300">•</span>
                                <span className="text-amber-700">{terlambatHariIni} Telat</span>
                                <span className="text-slate-300">•</span>
                                <span className="text-rose-600">{belumAbsenHariIni} Belum</span>
                            </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-[#C5CEE3]/60 flex items-center justify-between text-[11px]">
                            <button
                                type="button"
                                onClick={() => setActiveTab('presensi')}
                                className="font-bold text-[#006C4A] hover:underline"
                            >
                                Lihat Daftar Hadir →
                            </button>
                            <Link
                                href={route('absen-harian.rekap')}
                                className="font-semibold text-slate-500 hover:text-slate-800"
                            >
                                Rekap Bulanan ↗
                            </Link>
                        </div>
                    </div>

                    {/* KPI 2: Status Sesi Mengajar Hari Ini */}
                    <div className="rounded-2xl border border-[#C5CEE3] bg-[#E8EEFF]/40 p-5 shadow-2xs flex flex-col justify-between hover:bg-[#E8EEFF]/70 transition">
                        <div>
                            <div className="flex items-start justify-between">
                                <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#3F463F]">
                                    SESI MENGAJAR HARI INI
                                </span>
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EBF1FF] text-[#1E40AF]">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                                    </svg>
                                </div>
                            </div>
                            <div className="mt-2 flex items-baseline gap-1.5">
                                <span className="text-3xl font-extrabold text-[#111C2D]">{totalSesiHariIni}</span>
                                <span className="text-xs font-semibold text-slate-500">Sesi Terjadwal</span>
                            </div>
                            <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
                                <span className="inline-flex items-center gap-1 text-emerald-700">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    {sesiBerlangsung} Aktif
                                </span>
                                <span className="text-slate-300">•</span>
                                <span className="text-slate-600">{sesiSelesai} Selesai</span>
                                <span className="text-slate-300">•</span>
                                <span className="text-amber-700">{sesiDigantikan} Digantikan</span>
                            </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-[#C5CEE3]/60 flex items-center justify-between text-[11px]">
                            <button
                                type="button"
                                onClick={() => setActiveTab('sesi')}
                                className="font-bold text-[#006C4A] hover:underline"
                            >
                                Pantau Sesi Kelas →
                            </button>
                            <span className="font-semibold text-slate-500">{totalKelas} Rombel Terpantau</span>
                        </div>
                    </div>

                    {/* KPI 3: Peserta Didik & Rombel */}
                    <div className="rounded-2xl border border-[#C5CEE3] bg-[#E8EEFF]/40 p-5 shadow-2xs flex flex-col justify-between hover:bg-[#E8EEFF]/70 transition">
                        <div>
                            <div className="flex items-start justify-between">
                                <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#3F463F]">
                                    PESERTA DIDIK
                                </span>
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EDF6F1] text-[#143823]">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347M12 3.493a59.903 59.903 0 0110.399 5.84" />
                                    </svg>
                                </div>
                            </div>
                            <div className="mt-2 flex items-baseline gap-1.5">
                                <span className="text-3xl font-extrabold text-[#111C2D]">{totalSiswa}</span>
                                <span className="text-xs font-semibold text-slate-500">Siswa Aktif</span>
                            </div>
                            <p className="mt-2 text-[11px] text-slate-600">
                                Terdaftar pada {totalKelas} rombongan belajar (Tingkat VII, VIII, IX).
                            </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-[#C5CEE3]/60 flex items-center justify-between text-[11px]">
                            <button
                                type="button"
                                onClick={() => setActiveTab('rombel')}
                                className="font-bold text-[#006C4A] hover:underline"
                            >
                                Daftar Rombel & Wali →
                            </button>
                            <span className="font-semibold text-slate-500">T.A. Aktif</span>
                        </div>
                    </div>

                    {/* KPI 4: Guru Piket Bertugas Hari Ini */}
                    <div className="rounded-2xl border border-[#C5CEE3] bg-[#E8EEFF]/40 p-5 shadow-2xs flex flex-col justify-between hover:bg-[#E8EEFF]/70 transition">
                        <div>
                            <div className="flex items-start justify-between">
                                <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#3F463F]">
                                    GURU PIKET HARI INI
                                </span>
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FEF3E2] text-[#B45309]">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818" />
                                    </svg>
                                </div>
                            </div>
                            <div className="mt-2 flex items-baseline gap-1.5">
                                <span className="text-3xl font-extrabold text-[#111C2D]">{piketHariIni.length}</span>
                                <span className="text-xs font-semibold text-slate-500">Personel Siaga</span>
                            </div>
                            <p className="mt-2 text-[11px] text-slate-600">
                                Bertugas mengawal kelas pengganti dengan kode unik 6-digit.
                            </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-[#C5CEE3]/60 flex items-center justify-between text-[11px]">
                            <button
                                type="button"
                                onClick={() => setActiveTab('piket')}
                                className="font-bold text-[#006C4A] hover:underline"
                            >
                                Kontak & Status Piket →
                            </button>
                            <span className="font-semibold text-amber-700">{sesiDigantikan} Sesi Terbuka</span>
                        </div>
                    </div>
                </div>

                {/* 3. Tab Switcher Navigation */}
                <div className="flex items-center gap-2 border-b border-[#C5CEE3] pb-1 overflow-x-auto">
                    {[
                        {
                            id: 'sesi',
                            label: 'Status Sesi & Kelas Hari Ini',
                            count: totalSesiHariIni,
                            icon: (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                                </svg>
                            ),
                        },
                        {
                            id: 'presensi',
                            label: 'Presensi Kamera Live Pegawai',
                            count: `${hadirHariIni}/${totalWajibAbsen}`,
                            icon: (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                                </svg>
                            ),
                        },
                        {
                            id: 'rombel',
                            label: 'Rombongan Belajar & Wali Kelas',
                            count: totalKelas,
                            icon: (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15" />
                                </svg>
                            ),
                        },
                        {
                            id: 'piket',
                            label: 'Petugas Piket Bertugas',
                            count: piketHariIni.length,
                            icon: (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818" />
                                </svg>
                            ),
                        },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                                activeTab === tab.id
                                    ? 'bg-[#002114] text-white shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                            }`}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                            <span
                                className={`rounded-full px-2 py-0.5 text-[10.5px] font-mono ${
                                    activeTab === tab.id
                                        ? 'bg-[#82F5C1] text-[#002114] font-extrabold'
                                        : 'bg-slate-200/80 text-slate-700'
                                }`}
                            >
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* 4. TAB CONTENT 1: STATUS SESI & KELAS HARI INI */}
                {activeTab === 'sesi' && (
                    <div className="space-y-4">
                        {/* Control Bar: Filter Tingkat, Status Sesi & Search */}
                        <div className="rounded-2xl border border-[#C5CEE3] bg-white p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-2">
                                {/* Tingkat Filter */}
                                <div className="inline-flex items-center rounded-xl bg-[#F4F7F6] p-1 text-xs">
                                    {[
                                        { key: 'all', label: 'Semua Tingkat' },
                                        { key: '7', label: 'Kelas VII' },
                                        { key: '8', label: 'Kelas VIII' },
                                        { key: '9', label: 'Kelas IX' },
                                    ].map((t) => (
                                        <button
                                            key={t.key}
                                            type="button"
                                            onClick={() => setSesiTingkatFilter(t.key)}
                                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                                                sesiTingkatFilter === t.key
                                                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                                                    : 'text-slate-500 hover:text-slate-800'
                                            }`}
                                        >
                                            {t.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Status Sesi Filter */}
                                <div className="inline-flex items-center rounded-xl bg-[#F4F7F6] p-1 text-xs">
                                    {[
                                        { key: 'all', label: 'Semua Status' },
                                        { key: 'berlangsung', label: 'Berlangsung' },
                                        { key: 'terjadwal', label: 'Terjadwal' },
                                        { key: 'selesai', label: 'Selesai' },
                                        { key: 'digantikan', label: 'Digantikan' },
                                    ].map((s) => (
                                        <button
                                            key={s.key}
                                            type="button"
                                            onClick={() => setSesiStatusFilter(s.key)}
                                            className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                                                sesiStatusFilter === s.key
                                                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                                                    : 'text-slate-500 hover:text-slate-800'
                                            }`}
                                        >
                                            {s.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Search Field */}
                            <div className="relative w-full md:w-72">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                    </svg>
                                </span>
                                <input
                                    type="text"
                                    value={sesiSearch}
                                    onChange={(e) => setSesiSearch(e.target.value)}
                                    placeholder="Cari kelas, mapel, atau guru..."
                                    className="w-full rounded-xl border border-[#C5CEE3] bg-[#E8EEFF]/30 pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-[#006C4A] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#006C4A]"
                                />
                                {sesiSearch && (
                                    <button
                                        type="button"
                                        onClick={() => setSesiSearch('')}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Sesi Cards Grid */}
                        {filteredSesiList.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-[#C5CEE3] bg-white p-12 text-center">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8EEFF] text-[#006C4A]">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                                    </svg>
                                </div>
                                <h3 className="mt-3 text-sm font-bold text-slate-900">Tidak ada sesi yang cocok</h3>
                                <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                                    Tidak ditemukan sesi pembelajaran yang sesuai dengan kriteria filter atau pencarian Anda hari ini.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredSesiList.map((item, idx) => {
                                    const jam = item.jam_pelajaran;
                                    const isReplaced = Boolean(item.is_digantikan);
                                    const status = item.status_pelaksanaan;

                                    let badgeColor = 'bg-slate-100 text-slate-700 border-slate-200';
                                    let badgeLabel = 'Terjadwal';

                                    if (status === 'berlangsung') {
                                        badgeColor = 'bg-[#E6F5EE] text-[#0E7452] border-[#CBE9DA]';
                                        badgeLabel = 'Sedang Berlangsung';
                                    } else if (status === 'selesai') {
                                        badgeColor = 'bg-slate-100 text-slate-600 border-slate-200';
                                        badgeLabel = 'Selesai';
                                    } else if (status === 'dibatalkan' || status === 'libur') {
                                        badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
                                        badgeLabel = status === 'libur' ? 'Hari Libur' : 'Dibatalkan';
                                    }

                                    return (
                                        <div
                                            key={item.id ?? `slot-${item.slot_id}-${idx}`}
                                            className={`rounded-2xl border p-5 shadow-2xs flex flex-col justify-between transition ${
                                                status === 'berlangsung'
                                                    ? 'bg-white border-[#006C4A]/40 ring-1 ring-[#006C4A]/20'
                                                    : 'bg-white border-[#E5ECE9]'
                                            }`}
                                        >
                                            <div>
                                                {/* Card Header: Slot Time & Status */}
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#E8EEFF] px-2.5 py-1 font-mono text-[11px] font-bold text-[#143823]">
                                                            Jam Ke-{jam?.jam_ke ?? '-'} • {jam?.mulai ? jam.mulai.substring(0, 5) : '--:--'} - {jam?.selesai ? jam.selesai.substring(0, 5) : '--:--'} WIB
                                                        </span>
                                                    </div>

                                                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10.5px] font-bold ${badgeColor}`}>
                                                        {status === 'berlangsung' && (
                                                            <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
                                                        )}
                                                        {badgeLabel}
                                                    </span>
                                                </div>

                                                {/* Class & Subject */}
                                                <div className="mt-4">
                                                    <div className="flex items-baseline justify-between gap-2">
                                                        <h3 className="text-base font-extrabold text-slate-900">
                                                            Kelas {item.kelas?.nama ?? '-'}
                                                        </h3>
                                                        <span className="text-[11px] font-semibold text-slate-400">
                                                            Tingkat {item.kelas?.tingkat ?? '-'}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm font-bold text-[#006C4A] mt-0.5">
                                                        {item.mapel?.nama ?? 'Mata Pelajaran'}
                                                    </p>
                                                    <span className="text-[10px] font-mono text-slate-400 uppercase">
                                                        Kode: {item.mapel?.kode ?? '-'}
                                                    </span>
                                                </div>

                                                {/* Teacher Assignment */}
                                                <div className="mt-4 pt-3 border-t border-[#F0F4F2] space-y-2">
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="text-slate-500 text-[11px]">Guru Terjadwal:</span>
                                                        <span className="font-bold text-slate-800 text-right truncate max-w-[170px]">
                                                            {item.guru?.nama ?? 'Belum Ditentukan'}
                                                        </span>
                                                    </div>

                                                    {/* Replacement Banner if Substituted */}
                                                    {isReplaced ? (
                                                        <div className="rounded-xl border border-amber-200 bg-[#FFF9F0] p-2.5 text-xs">
                                                            <div className="flex items-center gap-1.5 text-amber-800 font-bold text-[11px]">
                                                                <svg className="w-3.5 h-3.5 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                                                                </svg>
                                                                <span>Digantikan Guru Piket:</span>
                                                            </div>
                                                            <p className="mt-1 font-bold text-slate-900 text-xs">
                                                                {item.guru_pengganti?.nama ?? 'Guru Piket Pengganti'}
                                                            </p>
                                                            <p className="text-[10.5px] text-amber-700 mt-0.5">
                                                                Status sesi telah dibuka melalui validasi kode unik 6-digit.
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                                                            <span>Status Penggantian:</span>
                                                            <span className="font-medium text-slate-600">Sesuai Jadwal (Tanpa Pengganti)</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Card Footer: Real-time Indicator */}
                                            <div className="mt-4 pt-3 border-t border-[#F0F4F2] flex items-center justify-between text-[10.5px] text-slate-400">
                                                <span>Sumber: {item.source === 'sesi' ? 'Sesi Tergenerate' : 'Slot Jadwal Aktif'}</span>
                                                <span className="font-semibold text-[#0E7452]">Read-Only</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* 5. TAB CONTENT 2: DAFTAR PRESENSI KAMERA LIVE PEGAWAI */}
                {activeTab === 'presensi' && (
                    <div className="space-y-4">
                        {/* Control Bar: Filter Status, Jabatan & Search */}
                        <div className="rounded-2xl border border-[#C5CEE3] bg-white p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-2">
                                {/* Status Filter */}
                                <div className="inline-flex items-center rounded-xl bg-[#F4F7F6] p-1 text-xs">
                                    {[
                                        { key: 'all', label: 'Semua Status' },
                                        { key: 'tepat waktu', label: 'Tepat Waktu' },
                                        { key: 'terlambat', label: 'Terlambat' },
                                        { key: 'belum_absen', label: 'Belum Absen' },
                                    ].map((s) => (
                                        <button
                                            key={s.key}
                                            type="button"
                                            onClick={() => setPresensiStatusFilter(s.key)}
                                            className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                                                presensiStatusFilter === s.key
                                                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                                                    : 'text-slate-500 hover:text-slate-800'
                                            }`}
                                        >
                                            {s.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Jabatan / Role Filter */}
                                <div className="inline-flex items-center rounded-xl bg-[#F4F7F6] p-1 text-xs">
                                    {[
                                        { key: 'all', label: 'Semua Pegawai' },
                                        { key: 'guru_pengajar', label: 'Guru Pengajar' },
                                        { key: 'tendik', label: 'Tenaga Kependidikan' },
                                        { key: 'guru_piket', label: 'Guru Piket' },
                                    ].map((r) => (
                                        <button
                                            key={r.key}
                                            type="button"
                                            onClick={() => setPresensiRoleFilter(r.key)}
                                            className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                                                presensiRoleFilter === r.key
                                                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                                                    : 'text-slate-500 hover:text-slate-800'
                                            }`}
                                        >
                                            {r.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Search Field */}
                            <div className="relative w-full md:w-72">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                    </svg>
                                </span>
                                <input
                                    type="text"
                                    value={presensiSearch}
                                    onChange={(e) => setPresensiSearch(e.target.value)}
                                    placeholder="Cari nama pegawai atau NIP..."
                                    className="w-full rounded-xl border border-[#C5CEE3] bg-[#E8EEFF]/30 pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-[#006C4A] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#006C4A]"
                                />
                                {presensiSearch && (
                                    <button
                                        type="button"
                                        onClick={() => setPresensiSearch('')}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Presensi Table Card */}
                        <div className="rounded-2xl border border-[#C5CEE3] bg-white shadow-2xs overflow-hidden">
                            <div className="p-4 sm:p-5 border-b border-[#EDF2F0] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div>
                                    <h2 className="text-base font-bold text-slate-900">
                                        Daftar Presensi Harian Guru & Tenaga Kependidikan
                                    </h2>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Sistem presensi ketat berbasis jepretan kamera langsung (Strict Live Camera) tanpa opsi unggah berkas galeri.
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-slate-500">
                                        Menampilkan {filteredPresensiList.length} dari {daftarAbsenHariIni.length || totalWajibAbsen} Pegawai
                                    </span>
                                </div>
                            </div>

                            {filteredPresensiList.length === 0 ? (
                                <div className="p-12 text-center text-xs text-slate-500">
                                    Tidak ada data pegawai yang sesuai dengan filter pencarian.
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-[#F8FAF9] text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-[#EDF2F0]">
                                            <tr>
                                                <th className="px-5 py-3.5">Pegawai</th>
                                                <th className="px-4 py-3.5">Jabatan</th>
                                                <th className="px-4 py-3.5">Status Presensi</th>
                                                <th className="px-4 py-3.5">Jam Masuk</th>
                                                <th className="px-4 py-3.5">Jam Pulang</th>
                                                <th className="px-4 py-3.5">Keterangan / Waktu Jepret</th>
                                                <th className="px-5 py-3.5 text-right">Foto Selfie</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#F0F4F2]">
                                            {filteredPresensiList.map((item) => {
                                                const sudahAbsen = Boolean(item.sudah_absen || (item.status && item.status !== 'belum_absen'));
                                                const status = item.status;

                                                return (
                                                    <tr key={item.id} className="hover:bg-[#F8FAF9] transition">
                                                        {/* Pegawai Info */}
                                                        <td className="px-5 py-3.5">
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E8EEFF] text-[#006C4A] font-bold text-xs uppercase">
                                                                    {item.nama ? item.nama.substring(0, 2) : 'PG'}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="font-bold text-slate-900 truncate">
                                                                        {item.nama}
                                                                    </p>
                                                                    <p className="font-mono text-[11px] text-slate-500">
                                                                        NIP: {item.username || '-'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* Jabatan */}
                                                        <td className="px-4 py-3.5">
                                                            <span className="inline-flex rounded-lg bg-slate-100 px-2 py-1 text-[10.5px] font-semibold text-slate-700">
                                                                {item.jabatan_label || (item.role === 'guru_piket' ? 'Guru Piket' : (item.jenis_pegawai === 'tenaga_kependidikan' ? 'Tendik' : 'Guru Pengajar'))}
                                                            </span>
                                                        </td>

                                                        {/* Status Presensi */}
                                                        <td className="px-4 py-3.5">
                                                            {status === 'tepat waktu' ? (
                                                                <span className="inline-flex items-center gap-1 rounded-full bg-[#E6F5EE] px-2.5 py-1 text-[10.5px] font-bold text-[#0E7452]">
                                                                    <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                                                                    Tepat Waktu
                                                                </span>
                                                            ) : status === 'terlambat' ? (
                                                                <span className="inline-flex items-center gap-1 rounded-full bg-[#FEF3E2] px-2.5 py-1 text-[10.5px] font-bold text-[#B45309]">
                                                                    <span className="h-1.5 w-1.5 rounded-full bg-[#F59E0B]" />
                                                                    Terlambat
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[10.5px] font-bold text-slate-500">
                                                                    Belum Presensi
                                                                </span>
                                                            )}
                                                        </td>

                                                        {/* Jam Masuk */}
                                                        <td className="px-4 py-3.5 font-mono text-slate-700 font-semibold">
                                                            {item.jam_masuk || '-'}
                                                        </td>

                                                        {/* Jam Pulang */}
                                                        <td className="px-4 py-3.5 font-mono text-slate-700">
                                                            {item.jam_pulang || <span className="text-slate-400">-</span>}
                                                        </td>

                                                        {/* Keterangan */}
                                                        <td className="px-4 py-3.5 text-slate-500">
                                                            <p className="truncate max-w-[220px]">
                                                                {item.keterangan || (sudahAbsen ? 'Live Camera Verified' : '-')}
                                                            </p>
                                                            {item.waktu_ambil && (
                                                                <p className="font-mono text-[10px] text-slate-400 mt-0.5">
                                                                    Waktu Kamera: {item.waktu_ambil}
                                                                </p>
                                                            )}
                                                        </td>

                                                        {/* Foto Selfie Link / Modal */}
                                                        <td className="px-5 py-3.5 text-right">
                                                            {item.foto_url ? (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setInspeksiFoto(item)}
                                                                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#CBE9DA] bg-[#E6F5EE] px-3 py-1.5 text-[11px] font-bold text-[#0E7452] hover:bg-[#D5EFE3] transition"
                                                                >
                                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    </svg>
                                                                    Lihat Foto
                                                                </button>
                                                            ) : (
                                                                <span className="text-slate-400 text-[11px] font-medium italic">
                                                                    Tidak Ada Foto
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Table Footer */}
                            <div className="p-4 bg-[#F8FAF9] border-t border-[#EDF2F0] flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                                <span>
                                    Toleransi jam masuk harian: {aturanJam.jam_masuk || '07:00'} WIB (+{aturanJam.toleransi_menit || 15} menit = batas {aturanJam.batas_tepat_waktu || '07:15'} WIB).
                                </span>
                                <Link
                                    href={route('absen-harian.rekap')}
                                    className="font-bold text-[#006C4A] hover:underline"
                                >
                                    Buka Rekapitulasi Menyeluruh & Riwayat →
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* 6. TAB CONTENT 3: ROMBONGAN BELAJAR & WALI KELAS */}
                {activeTab === 'rombel' && (
                    <div className="space-y-4">
                        <div className="rounded-2xl border border-[#C5CEE3] bg-white p-4 shadow-2xs flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-base font-bold text-slate-900">
                                    Pemantauan Rombongan Belajar (Rombel) & Wali Kelas
                                </h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Distribusi peserta didik dan penugasan wali kelas pada tahun ajaran aktif.
                                </p>
                            </div>

                            <div className="inline-flex items-center rounded-xl bg-[#F4F7F6] p-1 text-xs">
                                {[
                                    { key: 'all', label: 'Semua Rombel' },
                                    { key: '7', label: 'Tingkat VII' },
                                    { key: '8', label: 'Tingkat VIII' },
                                    { key: '9', label: 'Tingkat IX' },
                                ].map((t) => (
                                    <button
                                        key={t.key}
                                        type="button"
                                        onClick={() => setRombelTingkatFilter(t.key)}
                                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                                            rombelTingkatFilter === t.key
                                                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                                                : 'text-slate-500 hover:text-slate-800'
                                        }`}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredKelasList.map((item) => {
                                const siswaCount = item.siswa_count ?? 0;
                                const hasWali = Boolean(item.wali_kelas);

                                return (
                                    <div
                                        key={item.id}
                                        className="rounded-2xl border border-[#E5ECE9] bg-white p-5 shadow-2xs flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="flex items-center justify-between">
                                                <span className="rounded-lg bg-[#E8EEFF] px-2.5 py-1 text-[11px] font-bold text-[#143823]">
                                                    Tingkat {item.tingkat}
                                                </span>
                                                <span className="text-xs font-bold text-slate-400">
                                                    ID: #{item.id}
                                                </span>
                                            </div>

                                            <div className="mt-3">
                                                <h3 className="text-xl font-extrabold text-slate-900">
                                                    Kelas {item.nama}
                                                </h3>
                                                <p className="text-xs font-semibold text-slate-500 mt-1">
                                                    {siswaCount} Peserta Didik Terdaftar
                                                </p>
                                            </div>

                                            <div className="mt-4 pt-3 border-t border-[#F0F4F2]">
                                                <span className="text-[11px] text-slate-400">Wali Kelas:</span>
                                                <p className="text-xs font-bold text-slate-800 mt-0.5">
                                                    {hasWali ? item.wali_kelas.nama : (
                                                        <span className="text-amber-600 font-medium italic">Belum Ditetapkan</span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-3 border-t border-[#F0F4F2] flex items-center justify-between text-[11px] text-slate-400">
                                            <span>SMPN 2 Soreang</span>
                                            <span className="font-bold text-[#0E7452]">Terdata</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* 7. TAB CONTENT 4: PETUGAS GURU PIKET HARI INI */}
                {activeTab === 'piket' && (
                    <div className="space-y-4">
                        <div className="rounded-2xl border border-[#C5CEE3] bg-white p-4 sm:p-5 shadow-2xs">
                            <h2 className="text-base font-bold text-slate-900">
                                Personel Petugas Guru Piket Hari Ini
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Petugas yang bertanggung jawab mengawal presensi sesi kelas dan bertindak sebagai guru pengganti bila terdapat pendidik yang berhalangan.
                            </p>
                        </div>

                        {piketHariIni.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-[#C5CEE3] bg-white p-12 text-center text-xs text-slate-500">
                                Belum ada penugasan guru piket pada hari ini di jadwal piket admin.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {piketHariIni.map((piket) => (
                                    <div
                                        key={piket.id}
                                        className="rounded-2xl border border-[#E5ECE9] bg-white p-5 shadow-2xs flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="flex items-center justify-between">
                                                <span className="inline-flex items-center gap-1 rounded-lg bg-[#FEF3E2] px-2.5 py-1 text-[11px] font-bold text-[#B45309]">
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818" />
                                                    </svg>
                                                    Petugas Piket
                                                </span>

                                                {piket.sudah_absen ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-[#E6F5EE] px-2 py-0.5 text-[10.5px] font-bold text-[#0E7452]">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                                                        Hadir ({piket.jam_masuk || 'Live'})
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10.5px] font-bold text-slate-500">
                                                        Belum Absen Masuk
                                                    </span>
                                                )}
                                            </div>

                                            <div className="mt-3">
                                                <h3 className="text-base font-extrabold text-slate-900">
                                                    {piket.nama}
                                                </h3>
                                                <p className="font-mono text-xs text-slate-500 mt-0.5">
                                                    NIP: {piket.username || '-'}
                                                </p>
                                            </div>

                                            <div className="mt-4 pt-3 border-t border-[#F0F4F2] space-y-1.5 text-xs">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-slate-500">WhatsApp:</span>
                                                    <span className="font-mono font-bold text-slate-800">
                                                        {piket.no_wa || '-'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {piket.no_wa && (
                                            <div className="mt-4 pt-3 border-t border-[#F0F4F2]">
                                                <a
                                                    href={`https://wa.me/${piket.no_wa.replace(/[^0-9]/g, '').replace(/^0/, '62')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#006C4A] px-3 py-2 text-xs font-bold text-white hover:bg-[#143823] transition"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.2.662.589 1.22.771 1.393.858.174.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.144.39-.086s1.011.477 1.184.564.289.13.332.203c.043.072.043.419-.101.824z" />
                                                    </svg>
                                                    Hubungi WhatsApp
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* 8. INSPEKSI FOTO SELFIE LIVE MODAL (READ-ONLY) */}
                {inspeksiFoto && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                        <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-[#C5CEE3] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                            {/* Modal Header */}
                            <div className="flex items-start justify-between pb-4 border-b border-[#EDF2F0]">
                                <div>
                                    <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-[#0E7452] uppercase tracking-wider">
                                        <span>INSPEKSI EKSEKUTIF</span>
                                        <span>•</span>
                                        <span>READ-ONLY</span>
                                    </div>
                                    <h3 className="text-lg font-serif font-bold text-slate-900 mt-1">
                                        Bukti Presensi Live Selfie
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        {inspeksiFoto.nama} ({inspeksiFoto.username})
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setInspeksiFoto(null)}
                                    className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Modal Photo Frame */}
                            <div className="mt-4 flex flex-col items-center">
                                <div className="relative w-full max-w-xs aspect-4/3 rounded-2xl overflow-hidden border-2 border-[#0E7452] bg-slate-950 shadow-inner flex items-center justify-center">
                                    <img
                                        src={inspeksiFoto.foto_url}
                                        alt={`Foto Presensi ${inspeksiFoto.nama}`}
                                        className="h-full w-full object-cover"
                                    />
                                    <div className="absolute top-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-mono text-[#82F5C1]">
                                        LIVE CAPTURE
                                    </div>
                                    <div className="absolute bottom-2 right-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-mono text-white">
                                        {inspeksiFoto.jam_masuk || '--:--'}
                                    </div>
                                </div>
                            </div>

                            {/* Metadata Details */}
                            <div className="mt-4 rounded-2xl bg-[#F8FAF9] p-4 border border-[#EDF2F0] space-y-2 text-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500">Status Kehadiran:</span>
                                    <span
                                        className={`rounded-full px-2.5 py-0.5 font-bold text-[10.5px] ${
                                            inspeksiFoto.status === 'tepat waktu'
                                                ? 'bg-[#E6F5EE] text-[#0E7452]'
                                                : 'bg-[#FEF3E2] text-[#B45309]'
                                        }`}
                                    >
                                        {inspeksiFoto.status === 'tepat waktu' ? 'Tepat Waktu' : 'Terlambat'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500">Jam Masuk (Server):</span>
                                    <span className="font-mono font-bold text-slate-800">
                                        {inspeksiFoto.jam_masuk || '-'}
                                    </span>
                                </div>
                                {inspeksiFoto.jam_pulang && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500">Jam Pulang:</span>
                                        <span className="font-mono font-bold text-slate-800">
                                            {inspeksiFoto.jam_pulang}
                                        </span>
                                    </div>
                                )}
                                {inspeksiFoto.waktu_ambil && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500">Waktu Jepret Kamera:</span>
                                        <span className="font-mono text-slate-700">
                                            {inspeksiFoto.waktu_ambil}
                                        </span>
                                    </div>
                                )}
                                {inspeksiFoto.ip_address && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500">IP Address:</span>
                                        <span className="font-mono text-slate-600">
                                            {inspeksiFoto.ip_address}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Modal Actions */}
                            <div className="mt-5 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setInspeksiFoto(null)}
                                    className="rounded-xl bg-[#002114] px-4 py-2 text-xs font-bold text-white hover:bg-[#143823] transition"
                                >
                                    Tutup Pratinjau
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
