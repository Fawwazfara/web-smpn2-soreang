import Modal from '@/Components/Modal';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

function getInitials(nama = '') {
    return nama
        .replace(/[^A-Za-zÀ-ÿ\s]/g, ' ')
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? '')
        .join('') || 'PG';
}

export default function Rekap({
    rows = [],
    ringkasan = {},
    filters = {},
    aturanJam = {},
    tahunAjaranAktif = null,
    flashStatus = null,
}) {
    const { auth } = usePage().props;
    const user = auth.user;
    const isKepsek = user.role === 'kepsek';

    const [tanggal, setTanggal] = useState(filters.tanggal || ringkasan.tanggal || '');
    const [kategori, setKategori] = useState(filters.kategori || 'all');
    const [status, setStatus] = useState(filters.status || 'all');
    const [search, setSearch] = useState(filters.search || '');
    const [selectedSelfie, setSelectedSelfie] = useState(null);
    const [resetFaceTarget, setResetFaceTarget] = useState(null);
    const [resettingFace, setResettingFace] = useState(false);

    const handleConfirmResetFace = () => {
        if (!resetFaceTarget || isKepsek) return;
        setResettingFace(true);

        router.delete(route('absen-harian.reset-face', resetFaceTarget.user_id), {
            data: { tanggal, kategori, status, search },
            preserveScroll: true,
            onFinish: () => {
                setResettingFace(false);
                setResetFaceTarget(null);
            },
        });
    };

    const applyFilters = (next = {}) => {
        const params = {
            tanggal: next.tanggal ?? tanggal,
            kategori: next.kategori ?? kategori,
            status: next.status ?? status,
            search: next.search ?? search,
        };

        router.get(route('absen-harian.rekap'), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        applyFilters({ search });
    };

    const handleExportCsv = () => {
        const headers = [
            'Nama Pegawai',
            'NIP / Username',
            'Kategori',
            'Tanggal',
            'Jam Masuk',
            'Jam Pulang',
            'Status',
            'Sumber',
            'Lokasi & Keterangan',
        ];

        const csvRows = rows.map((r) => [
            `"${(r.nama ?? '').replace(/"/g, '""')}"`,
            `"${r.username ?? ''}"`,
            `"${r.jabatan_label ?? ''}"`,
            `"${ringkasan.tanggal ?? ''}"`,
            `"${r.jam_masuk ?? '-'}"`,
            `"${r.jam_pulang ?? '-'}"`,
            `"${
                r.status === 'tepat waktu'
                    ? 'Tepat Waktu'
                    : r.status === 'terlambat'
                      ? 'Terlambat'
                      : 'Belum Absen'
            }"`,
            `"${r.sumber ?? '-'}"`,
            `"${(r.keterangan ?? '').replace(/"/g, '""')}"`,
        ]);

        const csvContent =
            'data:text/csv;charset=utf-8,' +
            [headers.join(','), ...csvRows.map((line) => line.join(','))].join('\n');

        const link = document.createElement('a');
        link.setAttribute('href', encodeURI(csvContent));
        link.setAttribute('download', `rekap-presensi-pegawai-${ringkasan.tanggal || 'harian'}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Presensi Guru & Staff (Live Camera) - SADA" />

            <div className="space-y-6">
                {/* 1. Header */}
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
                            <Link href={route('dashboard')} className="hover:text-[#0F382A] transition">
                                {isKepsek ? 'KEPSEK WORKSPACE' : 'ADMIN WORKSPACE'}
                            </Link>
                            <span>›</span>
                            <span>ATTENDANCE</span>
                            <span>›</span>
                            <span className="text-[#0E7452]">PRESENSI GURU & STAFF</span>
                        </div>

                        <div className="mt-2 border-l-4 border-[#0F382A] pl-4">
                            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                                Monitoring Presensi Harian Guru & Staff
                            </h1>
                        </div>

                        <p className="mt-2 text-xs sm:text-[13px] text-slate-500 max-w-2xl leading-relaxed">
                            Rekap kehadiran berbasis kamera live dan koordinat lokasi untuk Guru Pengajar, Tenaga Kependidikan, dan Guru Piket{' '}
                            <span className="font-semibold text-slate-700">
                                (Batas tepat waktu {aturanJam.batas_tepat_waktu || '07:15'} WIB • Pulang{' '}
                                {aturanJam.jam_pulang || '14:30'} WIB)
                            </span>
                            .
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                        {isKepsek && (
                            <span className="inline-flex items-center gap-2 rounded-xl border border-[#CBE9DA] bg-[#E6F5EE] px-3.5 py-2 text-xs font-bold text-[#0E7452]">
                                <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
                                Mode Pemantauan Read-Only
                            </span>
                        )}
                        {tahunAjaranAktif && (
                            <span className="inline-flex items-center rounded-xl border border-[#E5ECE9] bg-white px-3.5 py-2 text-xs font-bold text-slate-800 shadow-2xs">
                                T.A. {tahunAjaranAktif.nama} • {tahunAjaranAktif.semester}
                            </span>
                        )}
                        <button
                            type="button"
                            onClick={handleExportCsv}
                            className="inline-flex items-center gap-2 rounded-xl bg-[#0F382A] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#164B38] transition"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                            </svg>
                            Unduh CSV
                        </button>
                    </div>
                </div>

                {flashStatus && (
                    <div className="rounded-xl border border-[#CBE9DA] bg-[#E6F5EE] px-4 py-3 text-xs font-bold text-[#0E7452] flex items-center gap-2">
                        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2.3" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{flashStatus}</span>
                    </div>
                )}

                {/* 2. Four Summary KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <div className="rounded-2xl border border-[#E5ECE9] bg-white p-5 shadow-2xs">
                        <div className="flex items-center justify-between">
                            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                                TOTAL PEGAWAI HADIR
                            </span>
                            <span className="rounded-full bg-[#E6F5EE] px-2.5 py-0.5 text-[10.5px] font-bold text-[#0E7452]">
                                {ringkasan.persentase_hadir ?? '0.0'}%
                            </span>
                        </div>
                        <div className="mt-2.5 flex items-baseline gap-1.5">
                            <span className="text-3xl font-extrabold text-slate-900">
                                {ringkasan.total_hadir ?? 0}
                            </span>
                            <span className="text-xs font-semibold text-slate-400">
                                / {ringkasan.total_wajib_absen ?? 0} Wajib Absen
                            </span>
                        </div>
                        <p className="mt-2 text-[11px] font-semibold text-[#0E7452]">
                            {ringkasan.sudah_pulang ?? 0} Pulang • {ringkasan.wajah_terdaftar ?? 0} Face ID Terdaftar
                        </p>
                    </div>

                    <div className="rounded-2xl border border-[#CBE9DA] bg-[#EDF8F2] p-5 shadow-2xs">
                        <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#0E7452]">
                            HADIR TEPAT WAKTU
                        </span>
                        <div className="mt-2.5 flex items-baseline gap-1.5">
                            <span className="text-3xl font-extrabold text-[#064E3B]">
                                {ringkasan.tepat_waktu ?? 0}
                            </span>
                            <span className="text-xs font-semibold text-[#0E7452]">Pegawai</span>
                        </div>
                        <p className="mt-2 text-[11px] text-[#0E7452]">
                            Masuk ≤ {aturanJam.batas_tepat_waktu || '07:15'} WIB
                        </p>
                    </div>

                    <div className="rounded-2xl border border-[#F6DEC0] bg-[#FFFDF8] p-5 shadow-2xs">
                        <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#B45309]">
                            TERLAMBAT MASUK
                        </span>
                        <div className="mt-2.5 flex items-baseline gap-1.5">
                            <span className="text-3xl font-extrabold text-[#B45309]">
                                {ringkasan.terlambat ?? 0}
                            </span>
                            <span className="text-xs font-semibold text-slate-400">Pegawai</span>
                        </div>
                        <p className="mt-2 text-[11px] text-slate-500">
                            Masuk setelah {aturanJam.batas_tepat_waktu || '07:15'} WIB
                        </p>
                    </div>

                    <div className="rounded-2xl border border-[#FAD4D4] bg-[#FFF8F8] p-5 shadow-2xs">
                        <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#DC2626]">
                            BELUM PRESENSI
                        </span>
                        <div className="mt-2.5 flex items-baseline gap-1.5">
                            <span className="text-3xl font-extrabold text-[#DC2626]">
                                {ringkasan.belum_absen ?? 0}
                            </span>
                            <span className="text-xs font-semibold text-slate-400">Pegawai</span>
                        </div>
                        <p className="mt-2 text-[11px] text-slate-500">
                            {ringkasan.tanggal_label}
                        </p>
                    </div>
                </div>

                {/* 3. Filter & Attendance Table Card */}
                <div className="rounded-2xl border border-[#E5ECE9] bg-white p-5 sm:p-6 shadow-2xs">
                    <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 pb-5 border-b border-[#EDF2F0]">
                        {/* Category Tabs */}
                        <div className="inline-flex flex-wrap items-center gap-1 rounded-xl bg-[#F4F7F6] p-1 text-xs self-start">
                            {[
                                { key: 'all', label: 'Semua Pegawai' },
                                { key: 'guru', label: 'Guru Pengajar' },
                                { key: 'tenaga_kependidikan', label: 'Tenaga Kependidikan' },
                                { key: 'guru_piket', label: 'Guru Piket' },
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => {
                                        setKategori(tab.key);
                                        applyFilters({ kategori: tab.key });
                                    }}
                                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                                        kategori === tab.key
                                            ? 'bg-white text-[#0F382A] shadow-2xs'
                                            : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Date + Status + Search */}
                        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-2.5">
                            <input
                                type="date"
                                value={tanggal}
                                onChange={(e) => {
                                    setTanggal(e.target.value);
                                    applyFilters({ tanggal: e.target.value });
                                }}
                                className="rounded-xl border border-[#E5ECE9] bg-[#F8FAF9] py-1.5 px-3 text-xs font-bold text-slate-800 focus:border-[#0E7452] focus:bg-white focus:ring-[#0E7452]"
                            />

                            <select
                                value={status}
                                onChange={(e) => {
                                    setStatus(e.target.value);
                                    applyFilters({ status: e.target.value });
                                }}
                                className="rounded-xl border border-[#E5ECE9] bg-[#F8FAF9] py-1.5 pl-3 pr-8 text-xs font-bold text-slate-700 focus:border-[#0E7452] focus:bg-white focus:ring-[#0E7452]"
                            >
                                <option value="all">Semua Status</option>
                                <option value="tepat waktu">Tepat Waktu</option>
                                <option value="terlambat">Terlambat</option>
                                <option value="belum_absen">Belum Absen</option>
                            </select>

                            <div className="relative">
                                <svg
                                    className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                                    />
                                </svg>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari nama atau NIP..."
                                    className="w-48 sm:w-56 rounded-xl border border-[#E5ECE9] bg-[#F8FAF9] py-1.5 pl-8 pr-3 text-xs text-slate-700 placeholder:text-slate-400 focus:border-[#0E7452] focus:bg-white focus:ring-[#0E7452]"
                                />
                            </div>
                        </form>
                    </div>

                    <div className="mt-5 overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="bg-[#F6F9F8] text-left text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                                    <th className="py-3 pl-4 pr-3 rounded-l-xl">PEGAWAI & NIP</th>
                                    <th className="py-3 px-3">KATEGORI</th>
                                    <th className="py-3 px-3">JAM MASUK</th>
                                    <th className="py-3 px-3">JAM PULANG</th>
                                    <th className="py-3 px-3">STATUS</th>
                                    <th className="py-3 px-3">LOKASI & SUMBER</th>
                                    <th className="py-3 pl-3 pr-4 text-right rounded-r-xl">
                                        BUKTI KAMERA
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F0F4F2]">
                                {rows.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-xs text-slate-400">
                                            Tidak ada data pegawai yang cocok dengan filter pencarian.
                                        </td>
                                    </tr>
                                ) : (
                                    rows.map((row) => (
                                        <tr key={row.user_id} className="hover:bg-[#FAFDFB] transition">
                                            <td className="py-3.5 pl-4 pr-3">
                                                <div className="flex items-center gap-3">
                                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E6F5EE] text-[11px] font-extrabold text-[#0E7452]">
                                                        {getInitials(row.nama)}
                                                    </span>
                                                    <div>
                                                        <div className="text-xs font-bold text-slate-900">
                                                            {row.nama}
                                                        </div>
                                                        <div className="font-mono text-[10.5px] text-slate-400">
                                                            NIP: {row.username}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-3 text-xs font-semibold text-slate-700 whitespace-nowrap">
                                                <div>{row.jabatan_label}</div>
                                                <span
                                                    className={`mt-1 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9.5px] font-bold ${
                                                        row.face_registered
                                                            ? 'bg-[#E6F5EE] text-[#0E7452]'
                                                            : 'bg-slate-100 text-slate-500'
                                                    }`}
                                                >
                                                    {row.face_registered
                                                        ? '🔒 Face ID Aktif'
                                                        : 'Belum Daftar Wajah'}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-3 font-mono text-xs font-bold text-slate-900 whitespace-nowrap">
                                                {row.jam_masuk}
                                            </td>
                                            <td className="py-3.5 px-3 font-mono text-xs text-slate-600 whitespace-nowrap">
                                                {row.jam_pulang ?? '-'}
                                            </td>
                                            <td className="py-3.5 px-3 whitespace-nowrap">
                                                {row.status === 'tepat waktu' ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-[#E6F5EE] px-2.5 py-1 text-[10.5px] font-bold text-[#0E7452]">
                                                        <span>✓</span>
                                                        <span>Tepat Waktu</span>
                                                    </span>
                                                ) : row.status === 'terlambat' ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-[#FEF3E2] px-2.5 py-1 text-[10.5px] font-bold text-[#B45309]">
                                                        <span>⚠</span>
                                                        <span>Terlambat</span>
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-[#FEECEC] px-2.5 py-1 text-[10.5px] font-bold text-[#DC2626]">
                                                        <span>Belum Absen</span>
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-3 text-xs text-slate-600">
                                                <div className="flex items-center gap-2">
                                                    {row.sudah_absen && (
                                                        <span className="rounded bg-[#0F382A] px-1.5 py-0.5 font-mono text-[9.5px] font-bold uppercase text-[#8CE9BE] shrink-0">
                                                            {row.sumber || 'LIVE'}
                                                        </span>
                                                    )}
                                                    <span className="truncate max-w-[230px]">
                                                        {row.keterangan}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3.5 pl-3 pr-4 text-right whitespace-nowrap">
                                                <div className="inline-flex items-center justify-end gap-1.5">
                                                    {row.foto_url ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedSelfie(row)}
                                                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#EFF6F3] px-3 py-1.5 text-[11px] font-bold text-[#0E7452] hover:bg-[#DFEFE8] transition"
                                                        >
                                                            Lihat Selfie
                                                        </button>
                                                    ) : !isKepsek && row.no_wa ? (
                                                        <a
                                                            href={`https://wa.me/${row.no_wa}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-flex items-center gap-1 rounded-lg border border-[#E5ECE9] bg-white px-2.5 py-1 text-[10.5px] font-bold text-slate-600 hover:bg-[#F6F9F8] transition"
                                                        >
                                                            Konfirmasi WA
                                                        </a>
                                                    ) : isKepsek || !row.face_registered ? (
                                                        <span className="text-xs text-slate-300">-</span>
                                                    ) : null}

                                                    {!isKepsek && row.face_registered && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setResetFaceTarget(row)}
                                                            className="inline-flex items-center gap-1 rounded-lg border border-[#FAD4D4] bg-[#FFF8F8] px-2.5 py-1.5 text-[10.5px] font-bold text-[#DC2626] hover:bg-[#FEECEC] transition"
                                                            title="Reset Kunci Biometrik Wajah (Hanya Admin)"
                                                        >
                                                            Reset Wajah
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-5 pt-4 border-t border-[#F0F4F2] flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                        <span>
                            Menampilkan <strong className="text-slate-800">{rows.length}</strong> dari{' '}
                            <strong className="text-slate-800">
                                {ringkasan.total_wajib_absen ?? 0}
                            </strong>{' '}
                            pegawai wajib presensi (Admin & Kepala Sekolah dikecualikan sesuai SOP).
                        </span>
                        <span className="font-bold text-[#0E7452]">
                            {ringkasan.tanggal_label}
                        </span>
                    </div>
                </div>
            </div>

            {/* Selfie Modal */}
            <Modal
                show={Boolean(selectedSelfie)}
                onClose={() => setSelectedSelfie(null)}
                maxWidth="md"
            >
                {selectedSelfie && (
                    <div className="p-5 sm:p-6">
                        <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#EDF2F0]">
                            <div>
                                <h3 className="font-serif text-lg font-bold text-slate-900">
                                    Bukti Tangkapan Kamera Live
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {selectedSelfie.nama} • NIP: {selectedSelfie.username} (
                                    {selectedSelfie.jabatan_label})
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedSelfie(null)}
                                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="mt-4 overflow-hidden rounded-2xl bg-[#0A221A] aspect-[4/3] relative">
                            <img
                                src={selectedSelfie.foto_url}
                                alt={`Selfie ${selectedSelfie.nama}`}
                                className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-x-3 bottom-3 rounded-xl border border-white/15 bg-[#0A241B]/80 px-3 py-2 text-white backdrop-blur-xs text-[11px] font-mono">
                                {selectedSelfie.keterangan}
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-[#F6F9F8] p-3.5 text-xs">
                            <div>
                                <span className="block text-[10px] font-bold uppercase text-slate-400">
                                    WAKTU MASUK SERVER
                                </span>
                                <span className="mt-0.5 block font-mono font-bold text-slate-900">
                                    {selectedSelfie.jam_masuk_full}
                                </span>
                            </div>
                            <div>
                                <span className="block text-[10px] font-bold uppercase text-slate-400">
                                    JAM PULANG
                                </span>
                                <span className="mt-0.5 block font-mono font-bold text-slate-900">
                                    {selectedSelfie.jam_pulang ?? 'Belum Pulang'}
                                </span>
                            </div>
                            <div>
                                <span className="block text-[10px] font-bold uppercase text-slate-400">
                                    SUMBER & IP PERANGKAT
                                </span>
                                <span className="mt-0.5 block font-mono text-slate-700">
                                    {(selectedSelfie.sumber || 'live').toUpperCase()} •{' '}
                                    {selectedSelfie.ip_address || '-'}
                                </span>
                            </div>
                            <div>
                                <span className="block text-[10px] font-bold uppercase text-slate-400">
                                    STATUS KEHADIRAN
                                </span>
                                <span className="mt-0.5 block font-bold text-[#0E7452]">
                                    {selectedSelfie.status === 'tepat waktu'
                                        ? 'Tepat Waktu'
                                        : 'Terlambat'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Admin-Only Reset Face Biometric Modal */}
            <Modal
                show={Boolean(resetFaceTarget) && !isKepsek}
                onClose={() => !resettingFace && setResetFaceTarget(null)}
                maxWidth="sm"
            >
                {resetFaceTarget && (
                    <div className="p-5 sm:p-6">
                        <h3 className="font-serif text-lg font-bold text-slate-900">
                            Reset Data Biometrik Wajah
                        </h3>
                        <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                            Apakah Anda yakin ingin menghapus kunci Face Recognition untuk{' '}
                            <strong className="text-slate-900">{resetFaceTarget.nama}</strong> (NIP:{' '}
                            {resetFaceTarget.username})? Setelah di-reset, pegawai ini dapat mendaftarkan wajah baru melalui kamera live.
                        </p>

                        <div className="mt-5 flex items-center justify-end gap-2.5">
                            <button
                                type="button"
                                onClick={() => setResetFaceTarget(null)}
                                disabled={resettingFace}
                                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmResetFace}
                                disabled={resettingFace}
                                className="rounded-xl bg-[#DC2626] px-4 py-2 text-xs font-bold text-white hover:bg-[#B91C1C] disabled:opacity-60"
                            >
                                {resettingFace ? 'Mereset...' : 'Ya, Reset Wajah'}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}
