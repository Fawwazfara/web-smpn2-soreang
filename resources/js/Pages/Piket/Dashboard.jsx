import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

export default function Dashboard({ stats = {}, kelasList = [] }) {
    const user = usePage().props.auth.user;
    const [kodeInput, setKodeInput] = useState('');
    const [inputMsg, setInputMsg] = useState(null);
    const [tingkatFilter, setTingkatFilter] = useState('all');
    const [now, setNow] = useState(() => new Date());

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

    const tahunAjaran = stats.tahun_ajaran_aktif;

    const filteredKelas = useMemo(() => {
        if (tingkatFilter === 'all') return kelasList;
        return kelasList.filter((k) => String(k.tingkat) === String(tingkatFilter));
    }, [kelasList, tingkatFilter]);

    const handleVerifyCode = (e) => {
        e.preventDefault();
        if (kodeInput.length !== 6 || !/^\d+$/.test(kodeInput)) {
            setInputMsg({
                type: 'error',
                text: 'Kode unik wajib berupa 6 digit angka numerik dari guru pemilik sesi.',
            });
            return;
        }

        setInputMsg({
            type: 'info',
            text: 'Modul pembukaan sesi pengganti (Task P2) akan memvalidasi kode ini terhadap sesi aktif.',
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard Guru Piket - SADA" />

            <div className="space-y-6">
                {/* Dark Forest Green Hero Banner (Figma SiSADA Operational Style) */}
                <div className="rounded-2xl bg-gradient-to-br from-[#0B2F23] via-[#103D2E] to-[#0D3326] p-6 text-white shadow-sm">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                        <div>
                            <span className="inline-flex items-center rounded-md border border-[#2A7A5B] bg-[#1B5E45] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#8CE9BE]">
                                {tahunAjaran
                                    ? `T.A. ${tahunAjaran.nama} ${tahunAjaran.semester} • PETUGAS PIKET`
                                    : 'PETUGAS GURU PIKET HARIAN'}
                            </span>
                            <h1 className="mt-2.5 text-xl sm:text-2xl font-bold tracking-tight text-white">
                                {sundaGreeting}, {user.nama}!
                            </h1>
                            <p className="mt-1 text-xs text-[#A7D7C5]">
                                Guru Piket • NIP: {user.username} • WhatsApp Koordinasi: {user.no_wa || 'Belum diatur'}
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

                    <div className="mt-5 pt-3.5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-[#D5EFE4]">
                        <div className="flex items-center gap-2">
                            <span className="inline-flex h-2 w-2 rounded-full bg-[#34D399]" />
                            <span>
                                <strong className="text-[#8CE9BE]">Aturan Integritas Sesi:</strong> Seluruh kelas berstatus Terkunci (Locked) sampai kode unik 6-digit valid dimasukkan.
                            </span>
                        </div>
                        <span className="font-bold text-[#8CE9BE] shrink-0">
                            {stats.total_kelas ?? kelasList.length} Rombel Terdaftar
                        </span>
                    </div>
                </div>

                {/* 2-Column Content */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left 5 Cols: Input Kode 6-Digit + Presensi Mandiri Piket */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* Buka Sesi Kelas Pengganti Card */}
                        <div className="rounded-2xl border border-[#E5ECE9] bg-white p-6 shadow-2xs">
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FEF3E2] text-[#B45309]">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818" />
                                        </svg>
                                    </div>
                                    <h2 className="text-base font-bold text-slate-900">
                                        Buka Sesi Pengganti
                                    </h2>
                                </div>
                                <span className="rounded-full bg-[#E6F5EE] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#0E7452]">
                                    KODE 6-DIGIT
                                </span>
                            </div>

                            <p className="mt-3 text-xs text-slate-500 leading-relaxed">
                                Masukkan <strong>kode unik 6 digit numerik</strong> dari guru pemilik sesi yang berhalangan hadir. Kode hanya berlaku sekali pakai untuk sesi kelas, jam pelajaran, dan tanggal terkait.
                            </p>

                            <form onSubmit={handleVerifyCode} className="mt-4 space-y-3">
                                <div>
                                    <label
                                        htmlFor="kode-pengganti"
                                        className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-500 mb-1.5"
                                    >
                                        KODE UNIK SESI KELAS
                                    </label>
                                    <input
                                        id="kode-pengganti"
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={6}
                                        value={kodeInput}
                                        onChange={(e) =>
                                            setKodeInput(e.target.value.replace(/\D/g, ''))
                                        }
                                        placeholder="000000"
                                        className="w-full rounded-xl border-[#DCE5E1] bg-[#F8FAF9] py-3 px-4 text-center font-mono text-xl font-extrabold tracking-[0.45em] text-slate-900 placeholder:text-slate-300 focus:border-[#0E7452] focus:bg-white focus:ring-[#0E7452]"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full rounded-xl bg-[#0F382A] py-3 px-4 text-xs font-bold text-white shadow-xs hover:bg-[#164B38] transition flex items-center justify-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                    </svg>
                                    Validasi Kode & Buka Sesi
                                </button>
                            </form>

                            {inputMsg && (
                                <div
                                    className={`mt-3.5 rounded-xl p-3 text-xs font-medium ${
                                        inputMsg.type === 'error'
                                            ? 'border border-rose-200 bg-[#FFF5F5] text-[#DC2626]'
                                            : 'border border-[#CBE9DA] bg-[#EDF6F1] text-[#0F382A]'
                                    }`}
                                >
                                    {inputMsg.text}
                                </div>
                            )}

                            {/* SOP Alur Penggantian */}
                            <div className="mt-5 pt-4 border-t border-[#EDF2F0] space-y-2 text-[11px] text-slate-600">
                                <div className="font-bold uppercase tracking-wider text-[10px] text-slate-400">
                                    ALUR PENGGANTIAN MANUAL
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="font-bold text-[#0E7452]">1.</span>
                                    <span>Guru pengampu menghubungi WhatsApp Anda terlebih dahulu.</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="font-bold text-[#0E7452]">2.</span>
                                    <span>Guru pengampu membuat kode 6-digit & mengirimkannya ke Anda.</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="font-bold text-[#0E7452]">3.</span>
                                    <span>Masukkan kode di atas untuk membuka kunci kelas & mengisi absen siswa sebagai guru pengganti.</span>
                                </div>
                            </div>
                        </div>

                        {/* Presensi Harian Guru Piket (PRD Bagian 6: Guru Piket juga wajib absen harian) */}
                        <div className="rounded-2xl border border-[#E5ECE9] bg-white p-5 shadow-2xs">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E6F5EE] text-[#0E7452]">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900">
                                            Presensi Harian Petugas Piket
                                        </h3>
                                        <p className="text-[11px] text-slate-500">
                                            Wajib selfie kamera live setiap hari kerja
                                        </p>
                                    </div>
                                </div>
                                <span className="rounded-md bg-[#FEECEC] px-2 py-0.5 text-[10px] font-bold text-[#DC2626]">
                                    Standby
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right 7 Cols: Grid Semua Kelas Terkunci (PRD 2.C) */}
                    <div className="lg:col-span-7 rounded-2xl border border-[#E5ECE9] bg-white p-6 shadow-2xs flex flex-col justify-between">
                        <div>
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-base sm:text-lg font-bold text-slate-900">
                                            Status Ruang & Sesi Kelas Hari Ini
                                        </h2>
                                        <span className="inline-flex items-center gap-1 rounded-full bg-[#FEECEC] px-2.5 py-0.5 text-[10px] font-bold text-[#DC2626]">
                                            Terkunci
                                        </span>
                                    </div>
                                    <p className="mt-0.5 text-xs text-slate-500">
                                        Seluruh kelas terkunci secara default dan hanya terbuka untuk sesi yang kodenya telah divalidasi.
                                    </p>
                                </div>

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
                                            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
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

                            {filteredKelas.length === 0 ? (
                                <div className="mt-6 rounded-xl border border-dashed border-[#DCE5E1] bg-[#F8FAF9] p-10 text-center text-xs text-slate-400">
                                    Belum ada data ruang kelas pada tahun ajaran aktif.
                                </div>
                            ) : (
                                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
                                    {filteredKelas.map((kelas) => (
                                        <div
                                            key={kelas.id}
                                            className="rounded-xl border border-[#E5ECE9] bg-[#F8FAF9] p-4 flex flex-col justify-between select-none"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <span className="text-sm font-extrabold text-slate-900">
                                                        Kelas {kelas.nama}
                                                    </span>
                                                    <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[140px]">
                                                        {kelas.wali_kelas
                                                            ? `Wali: ${kelas.wali_kelas.nama}`
                                                            : `Tingkat ${kelas.tingkat ?? '-'}`}
                                                    </p>
                                                </div>
                                                <div
                                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white border border-[#E5ECE9] text-slate-400"
                                                    title="Sesi Terkunci"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                                    </svg>
                                                </div>
                                            </div>

                                            <div className="mt-4 pt-2.5 border-t border-[#E8EEEC] flex items-center justify-between text-[10.5px]">
                                                <span className="font-bold uppercase tracking-wider text-slate-400">
                                                    SESI LOCKED
                                                </span>
                                                <span className="font-semibold text-slate-500">
                                                    {kelas.siswa_count ?? 0} Siswa
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="mt-6 pt-4 border-t border-[#F0F4F2] flex items-center justify-between text-[11px] text-slate-500">
                            <span>Kode unik hanya berlaku untuk 1 sesi spesifik & memiliki masa kadaluarsa.</span>
                            <span className="font-bold text-[#0E7452]">SiSADA Piket</span>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
