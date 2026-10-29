import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

const ROMBEL_ATTENDANCE = [
    {
        id: '7a',
        tingkat: '7',
        nama: 'Kelas 7–A',
        detail: '(32 / 32 Hadir)',
        pct: 98.4,
        tone: 'emerald',
    },
    {
        id: '8b',
        tingkat: '8',
        nama: 'Kelas 8–B',
        detail: '(31 / 32 Hadir)',
        pct: 96.8,
        tone: 'emerald',
    },
    {
        id: '9d',
        tingkat: '9',
        nama: 'Kelas 9–D',
        detail: '(30 / 32 Hadir)',
        pct: 93.7,
        tone: 'blue',
    },
    {
        id: '7f',
        tingkat: '7',
        nama: 'Kelas 7–F',
        detail: '(31 / 32 Hadir)',
        pct: 96.8,
        tone: 'emerald',
    },
    {
        id: '8a',
        tingkat: '8',
        nama: 'Kelas 8–A',
        detail: '(29 / 32 Hadir • 3 Alfa)',
        pct: 90.6,
        tone: 'amber',
    },
];

const LIVE_KBM_ROWS = [
    {
        id: 1,
        kelas: 'Kelas 7–A',
        ruang: 'Gedung A • R. 04',
        mapel: 'Matematika',
        inisial: 'NS',
        inisialClass: 'bg-[#E6F5EE] text-[#0E7452]',
        guru: 'Dra. Hj. Nining S., M.Pd.',
        subGuru: null,
        statusType: 'ok',
        statusText: 'Geofence OK',
        hadir: '32',
        total: '32',
        catatan: null,
        catatanClass: '',
    },
    {
        id: 2,
        kelas: 'Kelas 8–B',
        ruang: 'Lab Bahasa Multi',
        mapel: 'Bahasa Inggris',
        inisial: 'AF',
        inisialClass: 'bg-[#EBF1FF] text-[#1E40AF]',
        guru: 'Ahmad Fauzi, S.Pd., M.Hum.',
        subGuru: null,
        statusType: 'ok',
        statusText: 'Geofence OK',
        hadir: '31',
        total: '32',
        catatan: '(1 Izin)',
        catatanClass: 'text-slate-400',
    },
    {
        id: 3,
        kelas: 'Kelas 9–D',
        ruang: 'Lab IPA Terpadu',
        mapel: 'IPA Fisika',
        inisial: 'SW',
        inisialClass: 'bg-[#E6F5EE] text-[#0E7452]',
        guru: 'Dra. Sri Wahyuni',
        subGuru: null,
        statusType: 'ok',
        statusText: 'Geofence OK',
        hadir: '30',
        total: '32',
        catatan: '(2 Sakit)',
        catatanClass: 'text-slate-400',
    },
    {
        id: 4,
        kelas: 'Kelas 8–A',
        ruang: 'Gedung B • R. 08',
        mapel: 'Bahasa Indonesia',
        inisial: 'DK',
        inisialClass: 'bg-[#FEF3E2] text-[#B45309]',
        guru: 'Bpk. Dani Kusnadi, S.Pd.',
        subGuru: 'Guru Pengganti',
        statusType: 'pengganti',
        statusText: 'Pengganti Aktif',
        hadir: '29',
        total: '32',
        catatan: '(3 Alfa)',
        catatanClass: 'text-[#DC2626] font-semibold',
    },
];

const STUDENT_LOGS = [
    {
        id: 1,
        inisial: 'MR',
        avatarClass: 'bg-[#E6F5EE] text-[#0E7452]',
        nama: 'Muhammad Rayhan Pratama',
        nisn: '0098271101',
        kelas: 'Kelas 8–A',
        waktu: '06.42 WIB',
        waktuClass: 'text-slate-700 font-semibold',
        metodeIcon: 'phone',
        metode: 'Geofence App',
        statusKey: 'hadir',
        statusLabel: 'Hadir Tepat',
        statusClass: 'bg-[#E6F5EE] text-[#0E7452]',
        keterangan: '-',
        isFile: false,
        ketClass: 'text-slate-400',
        actionType: 'dots',
    },
    {
        id: 2,
        inisial: 'SA',
        avatarClass: 'bg-[#EBF1FF] text-[#1E40AF]',
        nama: 'Siti Aisyah Azzahra',
        nisn: '0098271102',
        kelas: 'Kelas 9–B',
        waktu: '06.45 WIB',
        waktuClass: 'text-slate-700 font-semibold',
        metodeIcon: 'rfid',
        metode: 'Kartu RFID Tap',
        statusKey: 'hadir',
        statusLabel: 'Hadir Tepat',
        statusClass: 'bg-[#E6F5EE] text-[#0E7452]',
        keterangan: '-',
        isFile: false,
        ketClass: 'text-slate-400',
        actionType: 'dots',
    },
    {
        id: 3,
        inisial: 'DA',
        avatarClass: 'bg-[#FEF3E2] text-[#B45309]',
        nama: 'Daffa Al–Faruq',
        nisn: '0098271103',
        kelas: 'Kelas 7–A',
        waktu: '07.12 WIB',
        waktuClass: 'text-[#D97706] font-bold',
        metodeIcon: 'gate',
        metode: 'Piket Gerbang',
        statusKey: 'terlambat',
        statusLabel: 'Terlambat 12 Mnt',
        statusClass: 'bg-[#FEF3E2] text-[#B45309]',
        keterangan: 'Keterlambatan Angkot',
        isFile: false,
        ketClass: 'text-slate-500',
        actionType: 'dots',
    },
    {
        id: 4,
        inisial: 'AZ',
        avatarClass: 'bg-[#F3E8FF] text-[#7E22CE]',
        nama: 'Aurelia Zahra',
        nisn: '0098271104',
        kelas: 'Kelas 8–B',
        waktu: '-',
        waktuClass: 'text-slate-400',
        metodeIcon: 'edit',
        metode: 'Entri Tata Usaha',
        statusKey: 'sakit',
        statusLabel: 'Sakit (Dokter)',
        statusClass: 'bg-[#F3E8FF] text-[#7E22CE]',
        keterangan: 'Surat_Dokter.pdf',
        isFile: true,
        ketClass: 'text-[#0E7452] font-bold',
        actionType: 'dots',
    },
    {
        id: 5,
        inisial: 'BP',
        avatarClass: 'bg-[#E0F2FE] text-[#0369A1]',
        nama: 'Bintang Pratama',
        nisn: '0098271105',
        kelas: 'Kelas 9–D',
        waktu: '-',
        waktuClass: 'text-slate-400',
        metodeIcon: 'dispen',
        metode: 'Dispen Sekolah',
        statusKey: 'izin',
        statusLabel: 'Izin Resmi',
        statusClass: 'bg-[#EBF1FF] text-[#1E40AF]',
        keterangan: 'Dispensasi OSN Fisika Kab.',
        isFile: false,
        ketClass: 'text-slate-500',
        actionType: 'dots',
    },
    {
        id: 6,
        inisial: 'DA',
        avatarClass: 'bg-[#FEECEC] text-[#DC2626]',
        nama: 'Dimas Aditya',
        nisn: '0098271106',
        kelas: 'Kelas 8–A',
        waktu: 'Tidak Masuk',
        waktuClass: 'text-[#DC2626] font-bold',
        metodeIcon: 'alfa',
        metode: 'Sistem Auto-Alfa',
        statusKey: 'alfa',
        statusLabel: 'Alfa / Tanpa Ket.',
        statusClass: 'bg-[#FEECEC] text-[#DC2626]',
        keterangan: 'Belum ada respon ortu',
        isFile: false,
        ketClass: 'text-[#DC2626] font-bold',
        actionType: 'wa',
    },
];

function MetodeBadgeIcon({ type }) {
    if (type === 'phone') {
        return (
            <svg className="w-3.5 h-3.5 text-[#0E7452] shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <rect x="7" y="3" width="10" height="18" rx="2" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 17.5h2" />
            </svg>
        );
    }
    if (type === 'rfid') {
        return (
            <svg className="w-3.5 h-3.5 text-[#0284C7] shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 14.5a3.5 3.5 0 010-5m4 6.5a6 6 0 000-8M15.5 17.5a8.5 8.5 0 000-11" />
            </svg>
        );
    }
    if (type === 'gate') {
        return (
            <svg className="w-3.5 h-3.5 text-[#D97706] shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <rect x="4" y="5" width="16" height="14" rx="2" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 10h6m-6 4h4" />
            </svg>
        );
    }
    if (type === 'edit') {
        return (
            <svg className="w-3.5 h-3.5 text-[#7E22CE] shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" />
            </svg>
        );
    }
    if (type === 'dispen') {
        return (
            <svg className="w-3.5 h-3.5 text-[#0284C7] shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M6 4.5h12A1.5 1.5 0 0119.5 6v13.5A1.5 1.5 0 0118 21H6a1.5 1.5 0 01-1.5-1.5V6A1.5 1.5 0 016 4.5z" />
            </svg>
        );
    }
    return (
        <svg className="w-3.5 h-3.5 text-[#DC2626] shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <circle cx="12" cy="12" r="9" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 9l-6 6m0-6l6 6" />
        </svg>
    );
}

export default function Dashboard() {
    const user = usePage().props.auth.user;
    const [tingkatFilter, setTingkatFilter] = useState('all');
    const [logSearch, setLogSearch] = useState('');
    const [logKelas, setLogKelas] = useState('');
    const [logStatus, setLogStatus] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);

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

    const filteredRombel = useMemo(() => {
        if (tingkatFilter === 'all') return ROMBEL_ATTENDANCE;
        return ROMBEL_ATTENDANCE.filter((r) => r.tingkat === tingkatFilter);
    }, [tingkatFilter]);

    const filteredLogs = useMemo(() => {
        return STUDENT_LOGS.filter((row) => {
            const matchSearch =
                !logSearch ||
                row.nama.toLowerCase().includes(logSearch.toLowerCase()) ||
                row.nisn.includes(logSearch);
            const matchKelas = !logKelas || row.kelas === logKelas;
            const matchStatus = !logStatus || row.statusKey === logStatus;
            return matchSearch && matchKelas && matchStatus;
        });
    }, [logSearch, logKelas, logStatus]);

    const toggleSelectAll = (checked) => {
        if (checked) {
            setSelectedIds(filteredLogs.map((r) => r.id));
        } else {
            setSelectedIds([]);
        }
    };

    const toggleRow = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    // SVG Donut Chart (96.4% Hadir, 1.6% Terlambat, 1.5% Sakit/Izin, 0.5% Alfa)
    const radius = 52;
    const circumference = 2 * Math.PI * radius;
    const segHadir = 0.945 * circumference;
    const segTerlambat = 0.022 * circumference;
    const segIzin = 0.02 * circumference;
    const segAlfa = 0.013 * circumference;

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard Admin - SADA" />

            <div className="space-y-5">
                {/* 1. Greeting Banner Card (Exact Figma Image 1 Top Card) */}
                <div className="rounded-2xl border border-[#E5ECE9] bg-white p-5 sm:p-6 shadow-2xs">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h1 className="font-serif text-2xl sm:text-[27px] font-bold tracking-tight text-slate-900">
                                {greeting}, {user.nama}
                            </h1>
                            <p className="mt-1 text-xs sm:text-[13px] text-slate-500">
                                Ringkasan presensi harian & operasional KBM{' '}
                                <span className="text-slate-300">•</span>
                            </p>
                            <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
                                <span className="text-xs sm:text-[13px] font-bold text-slate-900">
                                    {formattedToday}
                                </span>
                                <span className="inline-flex items-center rounded-full bg-[#E5F6ED] px-3 py-0.5 text-[11px] font-bold text-[#0E7452]">
                                    Jam Ke-3 : 08.45 – 09.30 WIB
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col items-start gap-2.5">
                            <div className="flex flex-wrap items-center gap-2.5">
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-2 rounded-full border border-[#E6ECE9] bg-[#F6F9F8] px-4 py-2 text-xs font-bold text-slate-800 hover:bg-[#ECF2F0] transition"
                                >
                                    <svg className="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.9" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                    </svg>
                                    Export Harian
                                </button>
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-2 rounded-full border border-[#E6ECE9] bg-[#F6F9F8] px-4 py-2 text-xs font-bold text-slate-800 hover:bg-[#ECF2F0] transition"
                                >
                                    <svg className="w-3.5 h-3.5 text-[#0E7452]" fill="none" viewBox="0 0 24 24" strokeWidth="1.9" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                                    </svg>
                                    Kirim Notifikasi WA
                                </button>
                            </div>
                            <Link
                                href={route('admin.berita.index')}
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0D3124] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#154634] transition"
                            >
                                <span className="flex h-4 w-4 items-center justify-center rounded-full border border-white/50 text-[11px] leading-none">
                                    +
                                </span>
                                Buat Pengumuman
                            </Link>
                        </div>
                    </div>
                </div>

                {/* 2. Four Exact KPI Summary Cards (Exact Figma Image 1 Row) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {/* Card 1: Total Guru Hadir */}
                    <div className="rounded-2xl border border-[#E5ECE9] bg-white p-5 shadow-2xs flex flex-col justify-between">
                        <div>
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E6F5EE] text-[#0E7452]">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.9" stroke="currentColor">
                                        <rect x="4" y="4" width="16" height="16" rx="2" />
                                        <circle cx="12" cy="10" r="2.25" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 16.5a3.5 3.5 0 017 0" />
                                    </svg>
                                </div>
                                <span className="inline-flex items-center gap-1 rounded-full bg-[#E6F5EE] px-2.5 py-0.5 text-[10.5px] font-bold text-[#0E7452]">
                                    ↗ 93.1%
                                </span>
                            </div>
                            <p className="mt-4 text-xs font-medium text-slate-500">Total Guru Hadir</p>
                            <div className="mt-1 flex items-baseline gap-1.5">
                                <span className="text-[32px] leading-none font-extrabold tracking-tight text-slate-900">
                                    54
                                </span>
                                <span className="text-xs font-semibold text-slate-400">
                                    / 58 Guru
                                </span>
                            </div>
                        </div>

                        <div className="mt-4 rounded-xl bg-[#F4F9F6] px-3 py-2.5 flex items-center justify-between text-[11px]">
                            <span className="inline-flex items-center gap-1.5 font-bold text-[#0E7452] leading-tight">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] shrink-0" />
                                <span>
                                    52 Valid
                                    <br />
                                    Geofence
                                </span>
                            </span>
                            <span className="font-semibold text-slate-500 text-right leading-tight">
                                2<br />
                                Dispen
                            </span>
                        </div>
                    </div>

                    {/* Card 2: Guru Belum Absen / Telat */}
                    <div className="rounded-2xl border border-[#E5ECE9] bg-white p-5 shadow-2xs flex flex-col justify-between">
                        <div>
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FEF3E2] text-[#B45309]">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.9" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                                    </svg>
                                </div>
                                <span className="inline-flex items-center rounded-full bg-[#FEF3E2] px-2.5 py-0.5 text-[10.5px] font-bold text-[#B45309]">
                                    Perlu Konfirmasi
                                </span>
                            </div>
                            <p className="mt-4 text-xs font-medium text-slate-500">Guru Belum Absen / Telat</p>
                            <div className="mt-1 flex items-baseline gap-1.5">
                                <span className="text-[32px] leading-none font-extrabold tracking-tight text-slate-900">
                                    2
                                </span>
                                <span className="text-xs font-semibold text-slate-400">Guru</span>
                            </div>
                        </div>

                        <div className="mt-4 rounded-xl bg-[#FFF9EE] px-3 py-2.5 flex items-center justify-between text-[11px] text-[#B45309]">
                            <span className="truncate font-semibold flex items-center gap-1">
                                <span>📞</span>
                                <span className="truncate">Piket sedang konfi...</span>
                            </span>
                            <Link
                                href={route('users.index', { role: 'guru_piket' })}
                                className="font-bold underline ml-1 shrink-0"
                            >
                                Cek
                            </Link>
                        </div>
                    </div>

                    {/* Card 3: Guru Izin / Sakit Resmi */}
                    <div className="rounded-2xl border border-[#E5ECE9] bg-white p-5 shadow-2xs flex flex-col justify-between">
                        <div>
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EBF1FF] text-[#1E40AF]">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.9" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <span className="inline-flex items-center rounded-full bg-[#EBF1FF] px-2.5 py-0.5 text-[10.5px] font-bold text-[#1E40AF]">
                                    2 Surat Masuk
                                </span>
                            </div>
                            <p className="mt-4 text-xs font-medium text-slate-500">Guru Izin / Sakit Resmi</p>
                            <div className="mt-1 flex items-baseline gap-1.5">
                                <span className="text-[32px] leading-none font-extrabold tracking-tight text-slate-900">
                                    2
                                </span>
                                <span className="text-xs font-semibold text-slate-400">Personel</span>
                            </div>
                        </div>

                        <div className="mt-4 rounded-xl bg-[#F6F8FB] px-3 py-2.5 flex items-center justify-between text-[11px] text-slate-600">
                            <span className="truncate font-medium">Hendra G. (Sakit), Rina</span>
                            <span className="font-bold text-slate-400 ml-2 shrink-0">›</span>
                        </div>
                    </div>

                    {/* Card 4: Siswa Alfa / Tanpa Ket. */}
                    <div className="rounded-2xl border border-[#E5ECE9] bg-white p-5 shadow-2xs flex flex-col justify-between">
                        <div>
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FEECEC] text-[#DC2626]">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.9" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                                    </svg>
                                </div>
                                <span className="inline-flex items-center rounded-full bg-[#FEECEC] px-2.5 py-0.5 text-[10.5px] font-bold text-[#DC2626]">
                                    0.5% dari Siswa
                                </span>
                            </div>
                            <p className="mt-4 text-xs font-medium text-slate-500">Siswa Alfa / Tanpa Ket.</p>
                            <div className="mt-1 flex items-baseline gap-1.5">
                                <span className="text-[32px] leading-none font-extrabold tracking-tight text-[#DC2626]">
                                    6
                                </span>
                                <span className="text-xs font-semibold text-slate-400">
                                    / 1.120 Siswa
                                </span>
                            </div>
                        </div>

                        <div className="mt-4 rounded-xl bg-[#FFF5F5] px-3 py-2.5 flex items-center justify-between text-[11px] text-[#DC2626]">
                            <span className="font-bold leading-tight">
                                Tersebar di 4<br />
                                Rombel
                            </span>
                            <a href="#log-verifikasi-siswa" className="font-bold underline ml-2 shrink-0">
                                Tindak
                            </a>
                        </div>
                    </div>
                </div>

                {/* 3. Asymmetric 2-Column Main Section (Exact Figma Image 1 + Image 3 Layout) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                    {/* Left Column (8 cols): Kehadiran per Angkatan & Rombel + Live Monitor Ruang KBM */}
                    <div className="lg:col-span-8 space-y-5">
                        {/* Card A: Kehadiran per Angkatan & Rombel */}
                        <div className="rounded-2xl border border-[#E5ECE9] bg-white p-6 shadow-2xs">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                <div>
                                    <h2 className="text-base sm:text-[17px] font-bold tracking-tight text-slate-900">
                                        Kehadiran per Angkatan & Rombel
                                    </h2>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Persentase kehadiran real-time hari ini dengan target standar ≥ 95%
                                    </p>
                                </div>

                                <div className="inline-flex items-center rounded-xl bg-[#F4F7F6] p-1 text-xs self-start shrink-0">
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

                            <div className="mt-6 space-y-5">
                                {filteredRombel.map((item) => {
                                    const barColor =
                                        item.tone === 'emerald'
                                            ? 'bg-[#10B981]'
                                            : item.tone === 'blue'
                                              ? 'bg-[#0EA5E9]'
                                              : 'bg-[#EA9A15]';
                                    const textColor =
                                        item.tone === 'emerald'
                                            ? 'text-[#0E7452]'
                                            : item.tone === 'blue'
                                              ? 'text-[#0284C7]'
                                              : 'text-[#D97706]';

                                    return (
                                        <div key={item.id}>
                                            <div className="flex items-center justify-between text-xs mb-1.5">
                                                <div className="flex items-center gap-2">
                                                    <span className={`h-2 w-2 rounded-full ${barColor}`} />
                                                    <span className="font-bold text-slate-900">
                                                        {item.nama}
                                                    </span>
                                                    <span className="text-slate-400">{item.detail}</span>
                                                </div>
                                                <span className={`font-extrabold ${textColor}`}>
                                                    {item.pct}%
                                                </span>
                                            </div>
                                            <div className="h-2 w-full rounded-full bg-[#EDF2F0] overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${barColor} transition-all duration-300`}
                                                    style={{ width: `${item.pct}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-6 pt-4 border-t border-[#F0F4F2] flex flex-wrap items-center gap-5 text-[11px] font-medium text-slate-500">
                                <span className="inline-flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full bg-[#10B981]" />
                                    ≥ 95% Sangat Baik
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full bg-[#0EA5E9]" />
                                    91 - 94% Waspada
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full bg-[#EA9A15]" />
                                    &lt; 90% Perlu Penanganan
                                </span>
                            </div>
                        </div>

                        {/* Card B: Live Monitor Ruang KBM (Exact Image 1 Bottom-Left + Image 3 Top-Left) */}
                        <div className="rounded-2xl border border-[#E5ECE9] bg-white shadow-2xs overflow-hidden">
                            <div className="flex flex-wrap items-center justify-between gap-2 px-6 py-4">
                                <div className="flex items-center gap-2.5">
                                    <span className="h-2.5 w-2.5 rounded-full bg-[#10B981]" />
                                    <h2 className="text-base font-bold text-slate-900">
                                        Live Monitor Ruang KBM
                                    </h2>
                                    <span className="rounded-full bg-[#E5F6ED] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#0E7452]">
                                        JAM KE-3
                                    </span>
                                </div>
                                <Link
                                    href={route('kelas.index')}
                                    className="text-xs font-bold text-[#0E7452] hover:text-[#0F382A] transition"
                                >
                                    Buka Matriks Penuh →
                                </Link>
                            </div>

                            <div className="overflow-x-auto px-4 pb-4">
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="rounded-xl bg-[#F6F9F8] text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            <th className="py-2.5 pl-3 pr-2 rounded-l-lg">
                                                KELAS &<br />RUANG
                                            </th>
                                            <th className="py-2.5 px-2">
                                                MATA<br />PELAJARAN
                                            </th>
                                            <th className="py-2.5 px-2">
                                                GURU<br />PENGAMPU
                                            </th>
                                            <th className="py-2.5 px-2">
                                                STATUS<br />PRESENSI
                                            </th>
                                            <th className="py-2.5 px-2">
                                                SISWA<br />HADIR
                                            </th>
                                            <th className="py-2.5 pl-2 pr-3 text-right rounded-r-lg">
                                                AKSI
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#F1F5F3]">
                                        {LIVE_KBM_ROWS.map((row) => (
                                            <tr key={row.id} className="hover:bg-[#FAFDFB] transition">
                                                <td className="py-4 pl-3 pr-2 align-middle">
                                                    <div className="text-xs font-bold text-slate-900">
                                                        {row.kelas}
                                                    </div>
                                                    <div className="text-[10.5px] text-slate-400 mt-0.5 max-w-[95px] leading-snug">
                                                        {row.ruang}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-2 align-middle text-xs font-medium text-slate-700">
                                                    {row.mapel}
                                                </td>
                                                <td className="py-4 px-2 align-middle">
                                                    <div className="flex items-center gap-2.5">
                                                        <span
                                                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${row.inisialClass}`}
                                                        >
                                                            {row.inisial}
                                                        </span>
                                                        <div className="leading-snug">
                                                            <div className="text-xs font-medium text-slate-800 max-w-[130px]">
                                                                {row.guru}
                                                            </div>
                                                            {row.subGuru && (
                                                                <div className="text-[10px] font-bold text-[#B45309]">
                                                                    {row.subGuru}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-2 align-middle">
                                                    {row.statusType === 'ok' ? (
                                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E6F5EE] px-2.5 py-1 text-[10.5px] font-bold text-[#0E7452]">
                                                            <span>✓</span>
                                                            <span>{row.statusText}</span>
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FEF3E2] px-2.5 py-1 text-[10.5px] font-bold text-[#B45309]">
                                                            <span>⇄</span>
                                                            <span>{row.statusText}</span>
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-2 align-middle text-xs">
                                                    <div>
                                                        <span
                                                            className={`font-extrabold ${
                                                                row.statusType === 'pengganti'
                                                                    ? 'text-[#DC2626]'
                                                                    : 'text-slate-900'
                                                            }`}
                                                        >
                                                            {row.hadir}
                                                        </span>
                                                        <span className="text-slate-400">/{row.total}</span>
                                                    </div>
                                                    {row.catatan && (
                                                        <div className={`text-[10px] ${row.catatanClass}`}>
                                                            {row.catatan}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-4 pl-2 pr-3 align-middle text-right">
                                                    <button
                                                        type="button"
                                                        className="rounded-lg bg-[#EFF6F3] px-3 py-1.5 text-[11px] font-bold text-[#0E7452] hover:bg-[#DFEFE8] transition"
                                                    >
                                                        Pantau
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right Column (4 cols): Distribusi Siswa + Aksi Cepat TU & Piket + Guru Piket Hari Ini */}
                    <div className="lg:col-span-4 space-y-5">
                        {/* Card 1: Distribusi Siswa */}
                        <div className="rounded-2xl border border-[#E5ECE9] bg-white p-6 shadow-2xs">
                            <div className="flex items-center justify-between">
                                <h2 className="text-base font-bold text-slate-900">Distribusi Siswa</h2>
                                <span className="rounded-lg border border-[#E5ECE9] bg-[#F8FAF9] px-2.5 py-0.5 text-[10.5px] font-semibold text-slate-500">
                                    Hari Ini
                                </span>
                            </div>

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
                                            strokeDasharray={`${segHadir} ${circumference}`}
                                            strokeDashoffset={0}
                                        />
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r={radius}
                                            fill="transparent"
                                            stroke="#EA9A15"
                                            strokeWidth="13"
                                            strokeDasharray={`${segTerlambat} ${circumference}`}
                                            strokeDashoffset={-segHadir}
                                        />
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r={radius}
                                            fill="transparent"
                                            stroke="#0EA5E9"
                                            strokeWidth="13"
                                            strokeDasharray={`${segIzin} ${circumference}`}
                                            strokeDashoffset={-(segHadir + segTerlambat)}
                                        />
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r={radius}
                                            fill="transparent"
                                            stroke="#DC2626"
                                            strokeWidth="13"
                                            strokeDasharray={`${segAlfa} ${circumference}`}
                                            strokeDashoffset={-(segHadir + segTerlambat + segIzin)}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                        <span className="text-xl font-extrabold text-slate-900">
                                            96.4%
                                        </span>
                                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#0E7452]">
                                            TINGKAT HADIR
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2.5 text-xs">
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-2 text-slate-500">
                                        <span className="h-2.5 w-2.5 rounded-full bg-[#0B6E4F]" />
                                        Hadir Tepat Waktu
                                    </span>
                                    <span>
                                        <strong className="text-slate-900">1.080</strong>{' '}
                                        <span className="text-slate-400">(96.4%)</span>
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-2 text-slate-500">
                                        <span className="h-2.5 w-2.5 rounded-full bg-[#EA9A15]" />
                                        Terlambat Masuk
                                    </span>
                                    <span>
                                        <strong className="text-slate-900">18</strong>{' '}
                                        <span className="text-slate-400">(1.6%)</span>
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-2 text-slate-500">
                                        <span className="h-2.5 w-2.5 rounded-full bg-[#0EA5E9]" />
                                        Sakit & Izin Resmi
                                    </span>
                                    <span>
                                        <strong className="text-slate-900">16</strong>{' '}
                                        <span className="text-slate-400">(1.5%)</span>
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-2 text-slate-500">
                                        <span className="h-2.5 w-2.5 rounded-full bg-[#DC2626]" />
                                        Alfa / Tanpa Ket.
                                    </span>
                                    <span className="font-bold text-[#DC2626]">6 (0.5%)</span>
                                </div>
                            </div>
                        </div>

                        {/* Card 2: Aksi Cepat TU & Piket (Exact 2x2 Grid with Red Badge '3') */}
                        <div className="rounded-2xl border border-[#E5ECE9] bg-white p-5 shadow-2xs">
                            <h3 className="text-sm font-bold text-slate-900 mb-3.5">
                                Aksi Cepat TU & Piket
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <Link
                                    href={route('users.index')}
                                    className="rounded-xl bg-[#F6F9F8] p-3.5 text-center hover:bg-[#EAF4EF] transition"
                                >
                                    <div className="mx-auto flex h-7 w-7 items-center justify-center text-[#0E7452]">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                                        </svg>
                                    </div>
                                    <span className="mt-1.5 block text-xs font-bold text-slate-800">
                                        Input Siswa
                                    </span>
                                </Link>

                                <Link
                                    href={route('users.index', { role: 'guru_piket' })}
                                    className="rounded-xl bg-[#F6F9F8] p-3.5 text-center hover:bg-[#EAF4EF] transition"
                                >
                                    <div className="mx-auto flex h-7 w-7 items-center justify-center text-[#D97706]">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                                        </svg>
                                    </div>
                                    <span className="mt-1.5 block text-xs font-bold text-slate-800 leading-tight">
                                        Guru<br />Pengganti
                                    </span>
                                </Link>

                                <a
                                    href="#log-verifikasi-siswa"
                                    className="relative rounded-xl bg-[#F6F9F8] p-3.5 text-center hover:bg-[#EAF4EF] transition"
                                >
                                    <span className="absolute right-2.5 top-2 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#DC2626] px-1.5 py-0.5 text-[10px] font-bold text-white leading-none">
                                        3
                                    </span>
                                    <div className="mx-auto flex h-7 w-7 items-center justify-center text-[#0284C7]">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                        </svg>
                                    </div>
                                    <span className="mt-1.5 block text-xs font-bold text-slate-800 leading-tight">
                                        Verif<br />Izin/Sakit
                                    </span>
                                </a>

                                <a
                                    href="#log-verifikasi-siswa"
                                    className="rounded-xl bg-[#F6F9F8] p-3.5 text-center hover:bg-[#EAF4EF] transition"
                                >
                                    <div className="mx-auto flex h-7 w-7 items-center justify-center text-[#0F382A]">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                            <rect x="7" y="3" width="10" height="18" rx="2" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 11.5h3m0 0l-1.25-1.25M13.5 11.5l-1.25 1.25" />
                                        </svg>
                                    </div>
                                    <span className="mt-1.5 block text-xs font-bold text-slate-800 leading-tight">
                                        Broadcast<br />WA
                                    </span>
                                </a>
                            </div>
                        </div>

                        {/* Card 3: Guru Piket Hari Ini (Exact Figma Bottom-Right Card) */}
                        <div className="rounded-2xl border border-[#E5ECE9] bg-white p-5 shadow-2xs">
                            <div className="flex items-center justify-between mb-3.5">
                                <h3 className="text-sm font-bold text-slate-900">
                                    Guru Piket Hari Ini
                                </h3>
                                <span className="rounded-full bg-[#E5F6ED] px-2.5 py-0.5 text-[10px] font-bold text-[#0E7452]">
                                    Aktif
                                </span>
                            </div>

                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between gap-2.5 rounded-xl bg-[#F6F9F8] p-3">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0F382A] text-white text-xs font-bold">
                                            JS
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate text-xs font-bold text-slate-900">
                                                Drs. Jajang Sukmana
                                            </p>
                                            <p className="truncate text-[10.5px] text-slate-400">
                                                Koord. Gerbang Utama
                                            </p>
                                        </div>
                                    </div>
                                    <Link
                                        href={route('users.index', { role: 'guru_piket' })}
                                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#E5ECE9] bg-white text-[#0E7452] hover:bg-[#E6F5EE] transition"
                                        title="Hubungi Guru Piket"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                                        </svg>
                                    </Link>
                                </div>

                                <div className="flex items-center justify-between gap-2.5 rounded-xl bg-[#F6F9F8] p-3">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0B6E4F] text-white text-xs font-bold">
                                            NH
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate text-xs font-bold text-slate-900">
                                                Nurul Hidayati, S.Pd.
                                            </p>
                                            <p className="truncate text-[10.5px] text-slate-400">
                                                Piket Gedung Lt. 2 & Lab
                                            </p>
                                        </div>
                                    </div>
                                    <Link
                                        href={route('users.index', { role: 'guru_piket' })}
                                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#E5ECE9] bg-white text-[#0E7452] hover:bg-[#E6F5EE] transition"
                                        title="Hubungi Guru Piket"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Full-Width Bottom Section: Log Verifikasi Presensi Siswa (Exact Figma Image 3) */}
                <div
                    id="log-verifikasi-siswa"
                    className="rounded-2xl border border-[#E5ECE9] bg-white p-6 shadow-2xs"
                >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div>
                            <h2 className="text-base sm:text-lg font-bold text-slate-900">
                                Log Verifikasi Presensi Siswa
                            </h2>
                            <p className="mt-0.5 text-xs text-slate-400 max-w-md leading-relaxed">
                                Kelola catatan kehadiran peserta didik, periksa surat dispensasi, dan validasi rekaman geofence
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <div className="relative">
                                <svg
                                    className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                </svg>
                                <input
                                    type="text"
                                    value={logSearch}
                                    onChange={(e) => setLogSearch(e.target.value)}
                                    placeholder="Cari nama atau NISN..."
                                    className="w-48 sm:w-52 rounded-xl border border-[#E6ECE9] bg-[#F6F9F8] py-1.5 pl-8 pr-3 text-xs text-slate-700 placeholder:text-slate-400 focus:border-[#0E7452] focus:bg-white focus:ring-[#0E7452]"
                                />
                            </div>

                            <select
                                value={logKelas}
                                onChange={(e) => setLogKelas(e.target.value)}
                                className="rounded-xl border border-[#E6ECE9] bg-[#F6F9F8] py-1.5 pl-3 pr-7 text-xs font-semibold text-slate-700 focus:border-[#0E7452] focus:ring-[#0E7452]"
                            >
                                <option value="">Semua Kelas</option>
                                <option value="Kelas 7–A">Kelas 7–A</option>
                                <option value="Kelas 8–A">Kelas 8–A</option>
                                <option value="Kelas 8–B">Kelas 8–B</option>
                                <option value="Kelas 9–B">Kelas 9–B</option>
                                <option value="Kelas 9–D">Kelas 9–D</option>
                            </select>

                            <select
                                value={logStatus}
                                onChange={(e) => setLogStatus(e.target.value)}
                                className="rounded-xl border border-[#E6ECE9] bg-[#F6F9F8] py-1.5 pl-3 pr-7 text-xs font-semibold text-slate-700 focus:border-[#0E7452] focus:ring-[#0E7452]"
                            >
                                <option value="">Semua Status</option>
                                <option value="hadir">Hadir Tepat</option>
                                <option value="terlambat">Terlambat</option>
                                <option value="sakit">Sakit</option>
                                <option value="izin">Izin Resmi</option>
                                <option value="alfa">Alfa</option>
                            </select>

                            <button
                                type="button"
                                className="inline-flex items-center gap-1.5 rounded-xl border border-[#E6ECE9] bg-[#F6F9F8] px-3.5 py-1.5 text-xs font-bold text-slate-800 hover:bg-[#ECF2F0] transition"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                </svg>
                                Excel
                            </button>
                        </div>
                    </div>

                    <div className="mt-5 overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="bg-[#F6F9F8] text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    <th className="py-3 pl-3 pr-2 rounded-l-lg w-9">
                                        <input
                                            type="checkbox"
                                            checked={
                                                filteredLogs.length > 0 &&
                                                selectedIds.length === filteredLogs.length
                                            }
                                            onChange={(e) => toggleSelectAll(e.target.checked)}
                                            className="rounded border-slate-300 text-[#0F382A] focus:ring-[#0E7452]"
                                        />
                                    </th>
                                    <th className="py-3 px-3">NISN & NAMA SISWA</th>
                                    <th className="py-3 px-3">
                                        KELAS /<br />ROMBEL
                                    </th>
                                    <th className="py-3 px-3">
                                        WAKTU<br />MASUK
                                    </th>
                                    <th className="py-3 px-3">
                                        METODE<br />PRESENSI
                                    </th>
                                    <th className="py-3 px-3">STATUS</th>
                                    <th className="py-3 px-3">
                                        KETERANGAN /<br />BERKAS
                                    </th>
                                    <th className="py-3 pl-2 pr-3 text-right rounded-r-lg">AKSI</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F1F5F3]">
                                {filteredLogs.map((row) => (
                                    <tr key={row.id} className="hover:bg-[#FAFDFB] transition">
                                        <td className="py-3.5 pl-3 pr-2">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(row.id)}
                                                onChange={() => toggleRow(row.id)}
                                                className="rounded border-slate-300 text-[#0F382A] focus:ring-[#0E7452]"
                                            />
                                        </td>
                                        <td className="py-3.5 px-3">
                                            <div className="flex items-center gap-3">
                                                <span
                                                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${row.avatarClass}`}
                                                >
                                                    {row.inisial}
                                                </span>
                                                <div>
                                                    <div className="text-xs font-bold text-slate-900">
                                                        {row.nama}
                                                    </div>
                                                    <div className="text-[10.5px] text-slate-400">
                                                        NISN: {row.nisn}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-3 text-xs font-bold text-slate-700 whitespace-nowrap">
                                            {row.kelas}
                                        </td>
                                        <td className={`py-3.5 px-3 text-xs whitespace-nowrap ${row.waktuClass}`}>
                                            {row.waktu}
                                        </td>
                                        <td className="py-3.5 px-3 text-xs text-slate-500">
                                            <div className="flex items-center gap-2">
                                                <MetodeBadgeIcon type={row.metodeIcon} />
                                                <span>{row.metode}</span>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-3">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10.5px] font-bold leading-tight ${row.statusClass}`}
                                            >
                                                {row.statusLabel}
                                            </span>
                                        </td>
                                        <td className={`py-3.5 px-3 text-xs ${row.ketClass}`}>
                                            {row.isFile ? (
                                                <span className="inline-flex items-center gap-1 cursor-pointer hover:underline">
                                                    <span>📎</span>
                                                    <span>{row.keterangan}</span>
                                                </span>
                                            ) : (
                                                row.keterangan
                                            )}
                                        </td>
                                        <td className="py-3.5 pl-2 pr-3 text-right">
                                            {row.actionType === 'wa' ? (
                                                <button
                                                    type="button"
                                                    className="rounded-lg bg-[#E6F5EE] px-2.5 py-1.5 text-[10.5px] font-bold text-[#0E7452] hover:bg-[#D4EEE1] transition leading-tight"
                                                >
                                                    Kirim<br />WA
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                                >
                                                    ⋮
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Exact Pagination Footer (Figma Image 3) */}
                    <div className="mt-5 pt-4 border-t border-[#F1F5F3] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-400">
                        <div>
                            Menampilkan <strong className="text-slate-800">1 – {filteredLogs.length}</strong> dari{' '}
                            <strong className="text-slate-800">1.120</strong> data siswa
                        </div>

                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#E6ECE9] bg-[#F8FAF9] text-slate-400"
                            >
                                ‹
                            </button>
                            <button
                                type="button"
                                className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0F382A] text-xs font-bold text-white"
                            >
                                1
                            </button>
                            <button
                                type="button"
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#E6ECE9] bg-[#F8FAF9] text-xs font-semibold text-slate-600 hover:bg-white"
                            >
                                2
                            </button>
                            <button
                                type="button"
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#E6ECE9] bg-[#F8FAF9] text-xs font-semibold text-slate-600 hover:bg-white"
                            >
                                3
                            </button>
                            <span className="px-1 text-slate-400">...</span>
                            <button
                                type="button"
                                className="flex h-7 px-2 items-center justify-center rounded-lg border border-[#E6ECE9] bg-[#F8FAF9] text-xs font-semibold text-slate-600 hover:bg-white"
                            >
                                187
                            </button>
                            <button
                                type="button"
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#E6ECE9] bg-[#F8FAF9] text-slate-600 hover:bg-white"
                            >
                                ›
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
