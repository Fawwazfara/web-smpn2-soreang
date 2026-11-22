import Modal from '@/Components/Modal';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

// Icons SVG Lucide Style
function IconCheckCircle({ className = 'w-5 h-5' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );
}

function IconHeartPulse({ className = 'w-5 h-5' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
    );
}

function IconFileText({ className = 'w-5 h-5' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
    );
}

function IconAlertCircle({ className = 'w-5 h-5' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
    );
}

function IconPercent({ className = 'w-5 h-5' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h.01M15 17h.01M5 19L19 5m-14 0a2 2 0 100-4 2 2 0 000 4zm10 14a2 2 0 100-4 2 2 0 000 4z" />
        </svg>
    );
}

function IconSearch({ className = 'w-4 h-4' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
    );
}

function IconFilter({ className = 'w-4 h-4' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h18M6 9.75h12m-9 5.25h6m-4 5.25h2" />
        </svg>
    );
}

function IconEye({ className = 'w-4 h-4' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    );
}

function IconPrinter({ className = 'w-4 h-4' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
        </svg>
    );
}

function formatDateIndo(dateStr) {
    if (!dateStr) return '—';
    try {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            const months = [
                'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
            ];
            const day = parseInt(parts[2], 10);
            const month = months[parseInt(parts[1], 10) - 1];
            const year = parts[0];
            return `${day} ${month} ${year}`;
        }
    } catch {
        return dateStr;
    }
    return dateStr;
}

export default function RekapAbsensiSiswaView({
    auth,
    kelasList = [],
    selectedKelas = null,
    tahunAjaranAktif = null,
    kepsek = null,
    filters = {},
    siswaRekap = [],
    rekapSiswa = [],
    ringkasanKelas = {},
}) {
    const listSiswa = rekapSiswa.length > 0 ? rekapSiswa : siswaRekap;
    const { auth: pageAuth } = usePage().props;
    const currentUser = auth?.user || pageAuth?.user;
    const isKepsek = currentUser?.role === 'kepsek';

    // State Filter
    const [kelasId, setKelasId] = useState(filters.kelas_id || selectedKelas?.id || '');
    const [tanggalMulai, setTanggalMulai] = useState(filters.tanggal_mulai || '');
    const [tanggalSelesai, setTanggalSelesai] = useState(filters.tanggal_selesai || '');

    // State Search Box Siswa
    const [searchTerm, setSearchTerm] = useState('');

    // State Modal Detail Siswa
    const [detailSiswa, setDetailSiswa] = useState(null);

    const handleFilterSubmit = (e) => {
        if (e) e.preventDefault();
        applyFilter({
            kelas_id: kelasId,
            tanggal_mulai: tanggalMulai,
            tanggal_selesai: tanggalSelesai,
        });
    };

    const applyFilter = (newParams) => {
        const routeName = isKepsek ? 'kepsek.rekap-absensi.siswa' : 'admin.rekap-absensi.siswa';
        router.get(
            route(routeName),
            {
                kelas_id: newParams.kelas_id,
                tanggal_mulai: newParams.tanggal_mulai,
                tanggal_selesai: newParams.tanggal_selesai,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handlePrint = () => {
        window.print();
    };

    // Filtered list siswa di client-side berdasarkan NIS atau Nama
    const filteredSiswa = useMemo(() => {
        if (!searchTerm.trim()) return listSiswa;
        const q = searchTerm.toLowerCase();
        return listSiswa.filter(
            (s) =>
                (s.nama && s.nama.toLowerCase().includes(q)) ||
                (s.nis && s.nis.toLowerCase().includes(q))
        );
    }, [listSiswa, searchTerm]);

    const activeTahunAjaran = selectedKelas?.tahun_ajaran || tahunAjaranAktif;
    const waliKelasNama = selectedKelas?.wali_kelas?.nama || '—';
    const waliKelasNip = selectedKelas?.wali_kelas?.username || '—';
    const kepsekNama = kepsek?.nama || 'Hj. Nenden R., M.Pd.';
    const kepsekNip = kepsek?.username || '196805121994122002';
    const todayFormatted = formatDateIndo(new Date().toISOString().slice(0, 10));

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold leading-tight text-[#111C2D]">
                            Rekap Absensi Siswa per Kelas
                        </h2>
                        <p className="text-xs text-[#3F463F] mt-0.5">
                            {isKepsek ? 'Eksekutif Monitoring Kehadiran Siswa (Read-Only)' : 'Pemantauan Akumulasi Presensi Kelas & Siswa'}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {selectedKelas && (
                            <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#143823]/10 text-[#143823] text-xs font-semibold">
                                <span>Kelas: {selectedKelas.nama} (Tingkat {selectedKelas.tingkat})</span>
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#002114] hover:bg-[#143823] text-white text-xs font-bold transition shadow-sm"
                        >
                            <IconPrinter className="w-4 h-4 text-[#82F5C1]" />
                            <span>Cetak Laporan / PDF</span>
                        </button>
                    </div>
                </div>
            }
        >
            <Head title={`Rekap Absensi Siswa - ${selectedKelas?.nama ?? 'Semua Kelas'}`} />

            <div className="space-y-6 max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8 print:p-0 print:m-0 print:max-w-none print:w-full">
                {/* KOP SURAT SEKOLAH (HANYA MUNCUL SAAT PRINT) */}
                <div className="hidden print:block mb-6 border-b-4 border-double border-black pb-4 text-center">
                    <div className="flex items-center justify-between px-6">
                        <div className="w-16 h-16 flex items-center justify-center font-bold text-2xl border border-black rounded-lg">
                            SMP
                        </div>
                        <div className="flex-1 px-4">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-black">
                                PEMERINTAH KABUPATEN BANDUNG
                            </h3>
                            <h4 className="text-xs font-bold uppercase text-black">
                                DINAS PENDIDIKAN
                            </h4>
                            <h2 className="text-xl font-black uppercase text-black tracking-tight mt-0.5">
                                SMP NEGERI 2 SOREANG
                            </h2>
                            <p className="text-[10px] text-gray-700 mt-0.5">
                                Jl. Soreang No. 02, Kec. Soreang, Kab. Bandung, Jawa Barat 40911 • Telp: (022) 5891234 • Email: info@smpn2soreang.sch.id
                            </p>
                        </div>
                        <div className="w-16 h-16 flex items-center justify-center font-bold text-xs border border-black rounded-lg">
                            SADA
                        </div>
                    </div>
                    <div className="mt-4 pt-2 border-t border-black text-center">
                        <h1 className="text-base font-extrabold uppercase text-black underline tracking-wide">
                            LAPORAN REKAPITULASI PRESENSI SISWA
                        </h1>
                        <p className="text-xs font-semibold text-black mt-1">
                            Periode: {formatDateIndo(filters.tanggal_mulai)} s/d {formatDateIndo(filters.tanggal_selesai)}
                        </p>
                    </div>

                    {/* Metadata Cetak */}
                    <div className="grid grid-cols-2 gap-4 text-left text-xs text-black mt-4 px-2">
                        <div>
                            <div className="flex gap-2">
                                <span className="w-24 font-bold">Kelas</span>
                                <span>: {selectedKelas?.nama ?? '—'} (Tingkat {selectedKelas?.tingkat ?? '—'})</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="w-24 font-bold">Wali Kelas</span>
                                <span>: {waliKelasNama}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="flex justify-end gap-2">
                                <span className="font-bold">Tahun Ajaran:</span>
                                <span>{activeTahunAjaran ? `${activeTahunAjaran.nama} (${activeTahunAjaran.semester})` : '—'}</span>
                            </div>
                            <div className="flex justify-end gap-2">
                                <span className="font-bold">Total Siswa:</span>
                                <span>{listSiswa.length} Orang</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 1. Filter Panel (Card rounded 24-28px, surface color) - Hidden on Print */}
                <div className="bg-[#E8EEFF] border border-[#C5CEE3] rounded-[26px] p-6 shadow-sm print:hidden">
                    <div className="flex items-center justify-between gap-2 mb-4 text-[#143823]">
                        <div className="flex items-center gap-2">
                            <IconFilter className="w-5 h-5 text-[#006C4A]" />
                            <h3 className="font-bold text-sm tracking-wide uppercase text-[#111C2D]">
                                Filter Parameter Rekap
                            </h3>
                        </div>
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#C5CEE3] hover:bg-[#CFD9F0]/60 text-[#143823] text-xs font-bold transition"
                        >
                            <IconPrinter className="w-4 h-4 text-[#006C4A]" />
                            <span>Cetak PDF</span>
                        </button>
                    </div>

                    <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                        {/* Pilihan Kelas */}
                        <div>
                            <label className="block text-xs font-bold text-[#111C2D] mb-1.5 uppercase">
                                Pilih Kelas
                            </label>
                            <select
                                value={kelasId}
                                onChange={(e) => {
                                    setKelasId(e.target.value);
                                    applyFilter({
                                        kelas_id: e.target.value,
                                        tanggal_mulai: tanggalMulai,
                                        tanggal_selesai: tanggalSelesai,
                                    });
                                }}
                                className="w-full bg-[#CFD9F0]/50 border border-[#C5CEE3] focus:border-[#006C4A] focus:ring focus:ring-[#82F5C1]/40 rounded-xl px-3.5 py-2.5 text-xs text-[#111C2D] font-medium transition"
                            >
                                {kelasList.length === 0 && <option value="">Tidak ada kelas</option>}
                                {kelasList.map((k) => (
                                    <option key={k.id} value={k.id}>
                                        {k.nama} (Tingkat {k.tingkat})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Tanggal Mulai */}
                        <div>
                            <label className="block text-xs font-bold text-[#111C2D] mb-1.5 uppercase">
                                Tanggal Mulai
                            </label>
                            <input
                                type="date"
                                value={tanggalMulai}
                                onChange={(e) => setTanggalMulai(e.target.value)}
                                className="w-full bg-[#CFD9F0]/50 border border-[#C5CEE3] focus:border-[#006C4A] focus:ring focus:ring-[#82F5C1]/40 rounded-xl px-3.5 py-2.5 text-xs text-[#111C2D] font-medium transition"
                            />
                        </div>

                        {/* Tanggal Selesai */}
                        <div>
                            <label className="block text-xs font-bold text-[#111C2D] mb-1.5 uppercase">
                                Tanggal Selesai
                            </label>
                            <input
                                type="date"
                                value={tanggalSelesai}
                                onChange={(e) => setTanggalSelesai(e.target.value)}
                                className="w-full bg-[#CFD9F0]/50 border border-[#C5CEE3] focus:border-[#006C4A] focus:ring focus:ring-[#82F5C1]/40 rounded-xl px-3.5 py-2.5 text-xs text-[#111C2D] font-medium transition"
                            />
                        </div>

                        {/* Tombol Terapkan */}
                        <div>
                            <button
                                type="submit"
                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#002114] hover:bg-[#143823] active:bg-[#002114] text-white text-xs font-bold transition shadow-sm"
                            >
                                <IconFilter className="w-4 h-4 text-[#82F5C1]" />
                                Terapkan Filter
                            </button>
                        </div>
                    </form>
                </div>

                {/* 2. Stat Cards (Ringkasan Statistik Global) - Ramah Print */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 print:grid-cols-5 print:gap-2">
                    {/* Hadir */}
                    <div className="bg-[#E8EEFF] border border-[#C5CEE3] rounded-[24px] p-5 flex flex-col justify-between shadow-sm print:bg-white print:border-black print:rounded-lg print:p-2.5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#143823] uppercase tracking-wider print:text-black">Hadir (H)</span>
                            <div className="w-8 h-8 rounded-full bg-[#006C4A]/10 text-[#006C4A] flex items-center justify-center print:hidden">
                                <IconCheckCircle className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-3 print:mt-1">
                            <span className="text-2xl font-extrabold text-[#111C2D] print:text-base print:text-black">
                                {ringkasanKelas.total_hadir ?? 0}
                            </span>
                            <span className="text-xs text-[#3F463F] ml-1.5 font-medium print:text-[10px] print:text-black">kehadiran</span>
                        </div>
                    </div>

                    {/* Sakit */}
                    <div className="bg-[#E8EEFF] border border-[#C5CEE3] rounded-[24px] p-5 flex flex-col justify-between shadow-sm print:bg-white print:border-black print:rounded-lg print:p-2.5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#006C4A] uppercase tracking-wider print:text-black">Sakit (S)</span>
                            <div className="w-8 h-8 rounded-full bg-[#006C4A]/10 text-[#006C4A] flex items-center justify-center print:hidden">
                                <IconHeartPulse className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-3 print:mt-1">
                            <span className="text-2xl font-extrabold text-[#111C2D] print:text-base print:text-black">
                                {ringkasanKelas.total_sakit ?? 0}
                            </span>
                            <span className="text-xs text-[#3F463F] ml-1.5 font-medium print:text-[10px] print:text-black">izin sakit</span>
                        </div>
                    </div>

                    {/* Izin */}
                    <div className="bg-[#E8EEFF] border border-[#C5CEE3] rounded-[24px] p-5 flex flex-col justify-between shadow-sm print:bg-white print:border-black print:rounded-lg print:p-2.5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#263147] uppercase tracking-wider print:text-black">Izin (I)</span>
                            <div className="w-8 h-8 rounded-full bg-[#263147]/10 text-[#263147] flex items-center justify-center print:hidden">
                                <IconFileText className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-3 print:mt-1">
                            <span className="text-2xl font-extrabold text-[#111C2D] print:text-base print:text-black">
                                {ringkasanKelas.total_izin ?? 0}
                            </span>
                            <span className="text-xs text-[#3F463F] ml-1.5 font-medium print:text-[10px] print:text-black">keperluan izin</span>
                        </div>
                    </div>

                    {/* Alfa */}
                    <div className="bg-[#E8EEFF] border border-[#C5CEE3] rounded-[24px] p-5 flex flex-col justify-between shadow-sm print:bg-white print:border-black print:rounded-lg print:p-2.5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#C41E1E] uppercase tracking-wider print:text-black">Alfa (A)</span>
                            <div className="w-8 h-8 rounded-full bg-[#C41E1E]/10 text-[#C41E1E] flex items-center justify-center print:hidden">
                                <IconAlertCircle className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-3 print:mt-1">
                            <span className="text-2xl font-extrabold text-[#C41E1E] print:text-base print:text-black">
                                {ringkasanKelas.total_alfa ?? 0}
                            </span>
                            <span className="text-xs text-[#3F463F] ml-1.5 font-medium print:text-[10px] print:text-black">tanpa ket.</span>
                        </div>
                    </div>

                    {/* Persentase Kehadiran Kelas */}
                    <div className="col-span-2 sm:col-span-1 bg-[#143823] text-white border border-[#143823] rounded-[24px] p-5 flex flex-col justify-between shadow-sm print:bg-white print:text-black print:border-black print:rounded-lg print:p-2.5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#82F5C1] uppercase tracking-wider print:text-black">Rata-rata Kelas</span>
                            <div className="w-8 h-8 rounded-full bg-[#82F5C1]/20 text-[#82F5C1] flex items-center justify-center print:hidden">
                                <IconPercent className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-3 print:mt-1">
                            <span className="text-2xl font-black text-white print:text-base print:text-black">
                                {ringkasanKelas.rata_rata_kehadiran ?? 0}%
                            </span>
                            <span className="text-xs text-[#82F5C1] ml-1.5 font-medium print:text-[10px] print:text-black">presensi</span>
                        </div>
                    </div>
                </div>

                {/* 3. Tabel Rekapitulasi Siswa */}
                <div className="bg-white border border-[#C5CEE3] rounded-[28px] overflow-hidden shadow-sm print:border-black print:rounded-none print:shadow-none">
                    {/* Header Tabel & Search Box - Hidden on Print */}
                    <div className="p-5 sm:p-6 bg-[#E8EEFF]/40 border-b border-[#C5CEE3] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 print:hidden">
                        <div>
                            <h3 className="font-bold text-base text-[#111C2D]">
                                Daftar Presensi Siswa ({filteredSiswa.length} Siswa)
                            </h3>
                            <p className="text-xs text-[#3F463F] mt-0.5">
                                Rekapitulasi pertemuan per siswa pada rentang {filters.tanggal_mulai || '—'} s/d {filters.tanggal_selesai || '—'}
                            </p>
                        </div>

                        {/* Search field */}
                        <div className="relative w-full sm:w-72">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#3F463F]">
                                <IconSearch className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                placeholder="Cari NIS atau Nama Siswa..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white border border-[#C5CEE3] focus:border-[#006C4A] focus:ring focus:ring-[#82F5C1]/40 rounded-xl text-xs text-[#111C2D] placeholder-[#3F463F]/60 transition"
                            />
                        </div>
                    </div>

                    {/* Table Area */}
                    <div className="overflow-x-auto print:overflow-visible">
                        <table className="w-full text-left text-xs text-[#3F463F] print:text-black print:text-[11px] print:border-collapse">
                            <thead className="bg-[#E8EEFF] text-[#111C2D] text-[11px] font-bold uppercase tracking-wider border-b border-[#C5CEE3] print:bg-gray-100 print:text-black print:border-black">
                                <tr>
                                    <th className="py-3.5 px-4 text-center w-12 print:border print:border-black print:py-1.5 print:px-2">No</th>
                                    <th className="py-3.5 px-4 w-28 print:border print:border-black print:py-1.5 print:px-2">NIS</th>
                                    <th className="py-3.5 px-4 print:border print:border-black print:py-1.5 print:px-2">Nama Siswa</th>
                                    <th className="py-3.5 px-3 text-center w-20 print:border print:border-black print:py-1.5 print:px-2">Hadir (H)</th>
                                    <th className="py-3.5 px-3 text-center w-20 print:border print:border-black print:py-1.5 print:px-2">Sakit (S)</th>
                                    <th className="py-3.5 px-3 text-center w-20 print:border print:border-black print:py-1.5 print:px-2">Izin (I)</th>
                                    <th className="py-3.5 px-3 text-center w-20 print:border print:border-black print:py-1.5 print:px-2">Alfa (A)</th>
                                    <th className="py-3.5 px-4 text-center w-36 print:border print:border-black print:py-1.5 print:px-2">Kehadiran (%)</th>
                                    <th className="py-3.5 px-4 text-center w-24 print:hidden">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#C5CEE3]/60 print:divide-black">
                                {filteredSiswa.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="py-12 text-center text-sm text-[#3F463F] print:border print:border-black print:py-4">
                                            Tidak ada data siswa ditemukan untuk kriteria ini.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredSiswa.map((siswa, idx) => (
                                        <tr key={siswa.id} className="hover:bg-[#E8EEFF]/30 transition print:hover:bg-transparent">
                                            <td className="py-3 px-4 text-center font-semibold text-[#111C2D] print:border print:border-black print:py-1 print:px-2 print:text-black">
                                                {idx + 1}
                                            </td>
                                            <td className="py-3 px-4 font-mono font-medium text-[#111C2D] print:border print:border-black print:py-1 print:px-2 print:text-black">
                                                {siswa.nis}
                                            </td>
                                            <td className="py-3 px-4 font-bold text-[#111C2D] print:border print:border-black print:py-1 print:px-2 print:text-black">
                                                {siswa.nama}
                                            </td>
                                            <td className="py-3 px-3 text-center print:border print:border-black print:py-1 print:px-2">
                                                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md font-bold bg-[#82F5C1]/30 text-[#006C4A] print:bg-transparent print:text-black">
                                                    {siswa.h}
                                                </span>
                                            </td>
                                            <td className="py-3 px-3 text-center print:border print:border-black print:py-1 print:px-2">
                                                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md font-bold bg-[#CFD9F0] text-[#111C2D] print:bg-transparent print:text-black">
                                                    {siswa.s}
                                                </span>
                                            </td>
                                            <td className="py-3 px-3 text-center print:border print:border-black print:py-1 print:px-2">
                                                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md font-bold bg-[#CFD9F0] text-[#263147] print:bg-transparent print:text-black">
                                                    {siswa.i}
                                                </span>
                                            </td>
                                            <td className="py-3 px-3 text-center print:border print:border-black print:py-1 print:px-2">
                                                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md font-bold bg-[#C41E1E]/15 text-[#C41E1E] print:bg-transparent print:text-black">
                                                    {siswa.a}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center print:border print:border-black print:py-1 print:px-2">
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className="w-16 bg-[#CFD9F0] rounded-full h-2 overflow-hidden print:hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-300 ${
                                                                siswa.persentase_kehadiran >= 85
                                                                    ? 'bg-[#006C4A]'
                                                                    : siswa.persentase_kehadiran >= 75
                                                                    ? 'bg-amber-500'
                                                                    : 'bg-[#C41E1E]'
                                                            }`}
                                                            style={{ width: `${Math.min(100, Math.max(0, siswa.persentase_kehadiran))}%` }}
                                                        />
                                                    </div>
                                                    <span className="font-bold text-xs text-[#111C2D] print:text-black print:font-semibold">
                                                        {siswa.persentase_kehadiran}%
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-center print:hidden">
                                                <button
                                                    type="button"
                                                    onClick={() => setDetailSiswa(siswa)}
                                                    className="inline-flex items-center justify-center p-2 rounded-lg bg-[#E8EEFF] text-[#143823] hover:bg-[#143823] hover:text-[#82F5C1] transition"
                                                    title="Lihat Rincian Siswa"
                                                >
                                                    <IconEye className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* KOLOM TANDA TANGAN MENGETAHUI (HANYA MUNCUL SAAT PRINT) */}
                <div className="hidden print:block mt-8 pt-4">
                    <div className="flex justify-between items-start text-xs text-black px-8">
                        <div className="text-center w-64">
                            <p>Mengetahui,</p>
                            <p className="font-bold">Kepala SMPN 2 Soreang</p>
                            <div className="h-20" />
                            <p className="font-bold underline">{kepsekNama}</p>
                            <p className="font-mono text-[11px]">NIP. {kepsekNip}</p>
                        </div>

                        <div className="text-center w-64">
                            <p>Soreang, {todayFormatted}</p>
                            <p className="font-bold">Wali Kelas {selectedKelas?.nama ?? '—'}</p>
                            <div className="h-20" />
                            <p className="font-bold underline">{waliKelasNama}</p>
                            <p className="font-mono text-[11px]">NIP. {waliKelasNip}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Detail Singkat Siswa */}
            <Modal show={detailSiswa !== null} onClose={() => setDetailSiswa(null)} maxWidth="md">
                {detailSiswa && (
                    <div className="p-6 bg-white rounded-3xl">
                        <div className="flex items-start justify-between border-b border-[#C5CEE3] pb-4">
                            <div>
                                <h3 className="text-base font-bold text-[#111C2D]">
                                    {detailSiswa.nama}
                                </h3>
                                <p className="text-xs text-[#3F463F] font-mono mt-0.5">
                                    NIS: {detailSiswa.nis}
                                </p>
                            </div>
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#143823]/10 text-[#143823]">
                                {selectedKelas?.nama}
                            </span>
                        </div>

                        <div className="py-4 space-y-3">
                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div className="p-3 rounded-xl bg-[#E8EEFF]">
                                    <span className="text-[#3F463F] block text-[11px]">Hadir (H)</span>
                                    <span className="text-lg font-bold text-[#006C4A]">{detailSiswa.h}</span>
                                </div>
                                <div className="p-3 rounded-xl bg-[#E8EEFF]">
                                    <span className="text-[#3F463F] block text-[11px]">Sakit (S)</span>
                                    <span className="text-lg font-bold text-[#111C2D]">{detailSiswa.s}</span>
                                </div>
                                <div className="p-3 rounded-xl bg-[#E8EEFF]">
                                    <span className="text-[#3F463F] block text-[11px]">Izin (I)</span>
                                    <span className="text-lg font-bold text-[#263147]">{detailSiswa.i}</span>
                                </div>
                                <div className="p-3 rounded-xl bg-[#E8EEFF]">
                                    <span className="text-[#3F463F] block text-[11px]">Alfa (A)</span>
                                    <span className="text-lg font-bold text-[#C41E1E]">{detailSiswa.a}</span>
                                </div>
                            </div>

                            <div className="p-3 rounded-xl bg-[#CFD9F0]/60 flex items-center justify-between text-xs">
                                <span className="font-medium text-[#111C2D]">Total Pertemuan KBM</span>
                                <span className="font-bold text-[#111C2D]">{detailSiswa.total_pertemuan} Sesi</span>
                            </div>

                            <div className="p-3 rounded-xl bg-[#143823] text-white flex items-center justify-between text-xs">
                                <span className="font-medium text-[#82F5C1]">Persentase Kehadiran</span>
                                <span className="font-black text-sm text-white">{detailSiswa.persentase_kehadiran}%</span>
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setDetailSiswa(null)}
                                className="px-4 py-2 rounded-xl bg-[#E8EEFF] text-[#111C2D] text-xs font-semibold hover:bg-[#CFD9F0] transition"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}
