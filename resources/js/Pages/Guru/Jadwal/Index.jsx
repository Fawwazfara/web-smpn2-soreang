import { useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const NAMA_HARI = {
    1: 'Senin',
    2: 'Selasa',
    3: 'Rabu',
    4: 'Kamis',
    5: 'Jumat',
    6: 'Sabtu',
    7: 'Minggu',
};

function formatWaktu(waktu) {
    if (!waktu) return '—';
    return waktu.slice(0, 5);
}

export default function JadwalIndex({
    jadwalMingguan = {},
    jadwalHariIni = [],
    piketHariIni = [],
    tahunAjaranAktif = null,
    hariIniIso = 1,
}) {
    const [tabAktif, setTabAktif] = useState('hariIni');
    const namaHariIni = NAMA_HARI[hariIniIso] ?? 'Hari Ini';

    const handlePrint = () => {
        window.print();
    };

    return (
        <AuthenticatedLayout header="Jadwal Mengajar & Guru Piket">
            <Head title="Jadwal Mengajar & Kontak Guru Piket" />

            <div className="space-y-6 max-w-7xl mx-auto pb-12">
                {/* Header Banner & Metadata */}
                <div className="bg-[#143823] text-white rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#82F5C1]/15 text-[#82F5C1] text-xs font-semibold uppercase tracking-wider mb-3">
                                <span>Tahun Ajaran {tahunAjaranAktif ? `${tahunAjaranAktif.nama} (${tahunAjaranAktif.semester})` : '—'}</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                                Jadwal Mengajar Saya
                            </h1>
                            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
                                Pantau jadwal tatap muka kelas, sesi KBM hari ini, serta akses kontak cepat guru piket untuk koordinasi pengalihan sesi.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 self-start md:self-auto print:hidden">
                            <button
                                type="button"
                                onClick={handlePrint}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-colors border border-white/15"
                            >
                                <svg className="w-4 h-4 text-[#82F5C1]" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24-1.07-.34-2.18-.34-3.329 0-4.418 3.582-8 8-8s8 3.582 8 8c0 1.15-.1 2.26-.34 3.329m-15.32 0A9.004 9.004 0 0012 21a9.004 9.004 0 007.66-4.171m-15.32 0a8.96 8.96 0 010-6.658m15.32 6.658a8.96 8.96 0 000-6.658M9 13h6m-6 4h6" />
                                </svg>
                                Cetak Jadwal
                            </button>
                        </div>
                    </div>
                </div>

                {/* Section Guru Piket Hari Ini */}
                <div className="bg-[#E8EEFF] border border-[#C5CEE3] rounded-3xl p-6 sm:p-7">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-[#143823] flex items-center justify-center text-[#82F5C1] shadow-sm">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-[#111C2D]">Guru Piket Bertugas Hari Ini</h2>
                                <p className="text-xs text-[#3F463F]">
                                    Hari {namaHariIni} — Hubungi guru piket bila berhalangan hadir untuk koordinasi kode pengganti sesi KBM.
                                </p>
                            </div>
                        </div>
                        <span className="self-start sm:self-auto px-3 py-1 rounded-full bg-[#143823]/10 text-[#143823] text-xs font-bold">
                            {piketHariIni.length} Petugas Terjadwal
                        </span>
                    </div>

                    {piketHariIni.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {piketHariIni.map((piket) => {
                                const piketUser = piket.user;
                                const waUrl = piketUser?.wa_link;

                                return (
                                    <div
                                        key={piket.id}
                                        className="bg-white rounded-2xl p-4 border border-[#C5CEE3] flex flex-col justify-between shadow-sm hover:border-[#006C4A] transition-all"
                                    >
                                        <div className="flex items-start gap-3.5 mb-4">
                                            <div className="w-11 h-11 rounded-full bg-[#143823] text-white flex items-center justify-center font-bold text-sm shrink-0">
                                                {piketUser?.nama ? piketUser.nama.slice(0, 2).toUpperCase() : 'GP'}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="text-sm font-bold text-[#111C2D] truncate" title={piketUser?.nama}>
                                                    {piketUser?.nama ?? 'Nama Guru Piket'}
                                                </h3>
                                                <p className="text-xs text-slate-500 font-mono">
                                                    NIP: {piketUser?.username ?? '—'}
                                                </p>
                                                <div className="mt-1 flex items-center gap-2">
                                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#006C4A]">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                        Piket Aktif
                                                    </span>
                                                    {piketUser?.no_wa && (
                                                        <span className="text-[11px] text-slate-500">
                                                            • {piketUser.no_wa}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {waUrl ? (
                                            <a
                                                href={waUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-[#006C4A] hover:bg-[#143823] text-white text-xs font-semibold transition-colors shadow-sm"
                                            >
                                                <svg className="w-4 h-4 text-[#82F5C1]" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.299.144.347.491 1.199.534 1.286.043.087.072.188.014.303-.058.116-.087.188-.173.289l-.26.303c-.087.087-.179.182-.077.357.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.174.086.275.072.376-.043.101-.116.433-.506.549-.679.116-.173.231-.145.39-.087.159.058 1.011.477 1.184.563.174.087.289.13.332.203.043.072.043.419-.101.824z" />
                                                </svg>
                                                Hubungi WhatsApp
                                            </a>
                                        ) : (
                                            <button
                                                type="button"
                                                disabled
                                                className="w-full py-2 px-3 rounded-xl bg-slate-100 text-slate-400 text-xs font-medium cursor-not-allowed text-center"
                                            >
                                                No. WA Belum Diatur
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl p-6 text-center border border-dashed border-[#C5CEE3]">
                            <svg className="w-8 h-8 text-slate-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                            </svg>
                            <p className="text-sm font-semibold text-[#111C2D]">Tidak ada guru piket terjadwal untuk hari {namaHariIni}.</p>
                            <p className="text-xs text-slate-500 mt-0.5">Silakan berkoordinasi langsung dengan staf kurikulum atau Tata Usaha.</p>
                        </div>
                    )}
                </div>

                {/* Switcher Tab Tampilan */}
                <div className="flex items-center gap-2 border-b border-[#C5CEE3] pb-2 print:hidden">
                    <button
                        type="button"
                        onClick={() => setTabAktif('hariIni')}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                            tabAktif === 'hariIni'
                                ? 'bg-[#002114] text-white shadow-sm'
                                : 'bg-[#E8EEFF] text-[#111C2D] hover:bg-[#CFD9F0]'
                        }`}
                    >
                        Jadwal Hari Ini ({namaHariIni})
                    </button>
                    <button
                        type="button"
                        onClick={() => setTabAktif('mingguan')}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                            tabAktif === 'mingguan'
                                ? 'bg-[#002114] text-white shadow-sm'
                                : 'bg-[#E8EEFF] text-[#111C2D] hover:bg-[#CFD9F0]'
                        }`}
                    >
                        Jadwal Mingguan (Senin – Sabtu)
                    </button>
                </div>

                {/* Konten Tab 1: Jadwal Hari Ini */}
                {tabAktif === 'hariIni' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-[#111C2D]">
                                Sesi Mengajar Hari Ini ({namaHariIni})
                            </h2>
                            <span className="text-xs text-[#3F463F] font-semibold">
                                Total: {jadwalHariIni.length} Jam Pelajaran
                            </span>
                        </div>

                        {jadwalHariIni.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {jadwalHariIni.map((slot) => {
                                    const jam = slot.jam_pelajaran;
                                    const kelas = slot.kelas;
                                    const mapel = slot.mapel;
                                    const sesi = slot.sesi_hari_ini;

                                    return (
                                        <div
                                            key={slot.id}
                                            className="bg-white rounded-3xl p-5 border border-[#C5CEE3] shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
                                        >
                                            <div>
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="px-3 py-1 rounded-lg bg-[#E8EEFF] text-[#143823] text-xs font-extrabold">
                                                        Jam ke-{jam?.jam_ke ?? '—'}
                                                    </span>
                                                    <span className="text-xs font-mono font-medium text-slate-500">
                                                        {formatWaktu(jam?.mulai)} – {formatWaktu(jam?.selesai)}
                                                    </span>
                                                </div>

                                                <h3 className="text-lg font-bold text-[#111C2D]">
                                                    {mapel?.nama ?? 'Mata Pelajaran'}
                                                </h3>
                                                <p className="text-xs text-slate-500 font-mono mt-0.5">
                                                    Kode: {mapel?.kode ?? '—'}
                                                </p>

                                                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                                                    <span className="text-xs text-slate-500">Kelas</span>
                                                    <span className="text-sm font-bold text-[#143823] px-2.5 py-0.5 rounded-md bg-[#82F5C1]/20">
                                                        {kelas?.nama ? `Kelas ${kelas.nama}` : '—'}
                                                    </span>
                                                </div>
                                            </div>

                                            {sesi && (
                                                <div className="mt-4 pt-3 border-t border-slate-100">
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="text-slate-500">Status Sesi:</span>
                                                        <span className="font-semibold uppercase px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700">
                                                            {sesi.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="bg-[#E8EEFF] rounded-3xl p-8 text-center border border-[#C5CEE3]">
                                <svg className="w-10 h-10 text-slate-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                </svg>
                                <p className="text-base font-bold text-[#111C2D]">Tidak ada jadwal tatap muka untuk hari {namaHariIni}.</p>
                                <p className="text-xs text-slate-500 mt-1">Gunakan waktu ini untuk koordinasi mandiri, penyusunan perangkat ajar, atau kegiatan sekolah lainnya.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Konten Tab 2: Jadwal Mingguan (Senin s/d Sabtu) */}
                {tabAktif === 'mingguan' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-[#111C2D]">
                                Matriks Mengajar Mingguan
                            </h2>
                            <span className="text-xs text-[#3F463F] font-semibold">
                                Senin – Sabtu
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {[1, 2, 3, 4, 5, 6].map((hari) => {
                                const slots = jadwalMingguan[hari] ?? [];
                                const isToday = hari === hariIniIso;

                                return (
                                    <div
                                        key={hari}
                                        className={`rounded-3xl p-5 border flex flex-col justify-between transition-all ${
                                            isToday
                                                ? 'bg-white border-[#006C4A] shadow-md ring-2 ring-[#006C4A]/20'
                                                : 'bg-[#E8EEFF]/70 border-[#C5CEE3]'
                                        }`}
                                    >
                                        <div>
                                            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#C5CEE3]">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-extrabold text-base text-[#111C2D]">
                                                        {NAMA_HARI[hari]}
                                                    </h3>
                                                    {isToday && (
                                                        <span className="px-2 py-0.5 rounded-full bg-[#143823] text-white text-[10px] font-bold">
                                                            Hari Ini
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-xs font-semibold text-[#006C4A]">
                                                    {slots.length} Mapel
                                                </span>
                                            </div>

                                            {slots.length > 0 ? (
                                                <div className="space-y-2.5">
                                                    {slots.map((slot) => {
                                                        const jam = slot.jam_pelajaran;
                                                        const kelas = slot.kelas;
                                                        const mapel = slot.mapel;

                                                        return (
                                                            <div
                                                                key={slot.id}
                                                                className="bg-white rounded-2xl p-3 border border-[#C5CEE3] shadow-sm"
                                                            >
                                                                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                                                                    <span className="font-bold text-[#143823]">
                                                                        Jam ke-{jam?.jam_ke ?? '—'}
                                                                    </span>
                                                                    <span className="font-mono text-[11px]">
                                                                        {formatWaktu(jam?.mulai)}–{formatWaktu(jam?.selesai)}
                                                                    </span>
                                                                </div>
                                                                <div className="text-sm font-bold text-[#111C2D] truncate">
                                                                    {mapel?.nama ?? 'Mapel'}
                                                                </div>
                                                                <div className="mt-1 flex items-center justify-between text-xs">
                                                                    <span className="text-slate-500 font-mono">{mapel?.kode ?? ''}</span>
                                                                    <span className="font-semibold text-[#006C4A] bg-[#82F5C1]/20 px-2 py-0.5 rounded">
                                                                        Kelas {kelas?.nama ?? '—'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="py-6 text-center text-xs text-slate-500 italic">
                                                    Tidak ada jadwal mengajar
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

