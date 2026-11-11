import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';

export default function Dashboard({
    stats = {},
    kelasList = [],
    sesiHariIni = [],
    absenHariIni = null,
    aturanJam = {},
}) {
    const user = usePage().props.auth.user;
    const { flash, errors } = usePage().props;
    const [kodeInput, setKodeInput] = useState('');
    const [selectedSesi, setSelectedSesi] = useState(null);
    const [kelasFilter, setKelasFilter] = useState('all');
    const [tingkatFilter, setTingkatFilter] = useState('all');
    const [processing, setProcessing] = useState(false);
    const [inputMsg, setInputMsg] = useState(null);
    const [activeUnlockedNotice, setActiveUnlockedNotice] = useState(null);
    const [now, setNow] = useState(() => new Date());
    const kodeInputRef = useRef(null);

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

    // Filter classes by grade level
    const filteredKelasList = useMemo(() => {
        if (tingkatFilter === 'all') return kelasList;
        return kelasList.filter((k) => String(k.tingkat) === String(tingkatFilter));
    }, [kelasList, tingkatFilter]);

    // Filter sessions by grade level & selected class
    const filteredSesi = useMemo(() => {
        return sesiHariIni.filter((sesi) => {
            if (tingkatFilter !== 'all' && String(sesi.kelas?.tingkat) !== String(tingkatFilter)) {
                return false;
            }
            if (kelasFilter !== 'all' && String(sesi.kelas?.id) !== String(kelasFilter)) {
                return false;
            }
            return true;
        });
    }, [sesiHariIni, tingkatFilter, kelasFilter]);

    const handleSelectLockedSesi = (sesi) => {
        setSelectedSesi(sesi);
        setInputMsg(null);
        if (kodeInputRef.current) {
            kodeInputRef.current.focus();
            kodeInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    const handleVerifyCode = (e) => {
        e.preventDefault();
        setInputMsg(null);

        if (kodeInput.length !== 6 || !/^\d+$/.test(kodeInput)) {
            setInputMsg({
                type: 'error',
                text: 'Kode unik wajib berupa 6 digit angka numerik.',
            });
            return;
        }

        const payload = { kode: kodeInput };
        if (selectedSesi?.id) {
            payload.sesi_id = selectedSesi.id;
        }

        setProcessing(true);
        router.post(route('piket.klaim-kode'), payload, {
            preserveScroll: true,
            onSuccess: () => {
                setProcessing(false);
                setKodeInput('');
                setSelectedSesi(null);
                setInputMsg(null);
            },
            onError: (errs) => {
                setProcessing(false);
                if (errs.kode) {
                    setInputMsg({
                        type: 'error',
                        text: errs.kode,
                    });
                }
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard Guru Piket - SADA SMPN 2 Soreang" />

            <div className="space-y-6">
                {/* 1. Hero Banner SADA Design System */}
                <div className="rounded-[24px] bg-[#143823] p-6 text-white shadow-sm border border-[#002114]">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                        <div>
                            <span className="inline-flex items-center rounded-md bg-[#006C4A] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#82F5C1]">
                                {tahunAjaran
                                    ? `T.A. ${tahunAjaran.nama} ${tahunAjaran.semester} • PETUGAS GURU PIKET`
                                    : 'PETUGAS GURU PIKET HARIAN'}
                            </span>
                            <h1 className="mt-2.5 text-xl sm:text-2xl font-bold tracking-tight text-white">
                                {sundaGreeting}, {user.nama}!
                            </h1>
                            <p className="mt-1 text-xs text-[#82F5C1]">
                                Guru Piket Bertugas • NIP: {user.username} • WhatsApp: {user.no_wa || 'Belum diatur'}
                            </p>
                        </div>

                        {/* Live Clock Box */}
                        <div className="flex items-center gap-3.5 rounded-xl border border-white/10 bg-white/[0.08] px-4 py-3 self-start lg:self-auto">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#002114] text-[#82F5C1]">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="font-mono text-lg font-extrabold tracking-tight text-white">
                                        {liveClock}
                                    </span>
                                    <span className="text-[10.5px] font-bold text-[#82F5C1]">WIB</span>
                                </div>
                                <p className="text-[11px] text-[#CFD9F0]">{formattedFullDate}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 pt-3.5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-[#CFD9F0]">
                        <div className="flex items-center gap-2">
                            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#82F5C1]" />
                            <span>
                                <strong className="text-white">Aturan Integritas Sesi:</strong> Sesuai PRD Bagian 2.C & 9.5, seluruh kelas & sesi KBM berstatus <strong>Terkunci (Locked)</strong>. Tombol absensi terbuka khusus sesi yang telah diklaim dengan kode unik.
                            </span>
                        </div>
                        <span className="font-bold text-[#82F5C1] shrink-0">
                            {stats.total_sesi ?? sesiHariIni.length} Sesi Terjadwal Hari Ini
                        </span>
                    </div>
                </div>

                {/* 2. Grid Dashboard 2 Kolom */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left Column (4 cols): Form Masukkan Kode Unik & SOP Piket */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Box Input Kode 6-Digit */}
                        <div className="rounded-[24px] border border-[#C5CEE3] bg-[#E8EEFF] p-6 shadow-sm">
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#143823] text-[#82F5C1]">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818" />
                                        </svg>
                                    </div>
                                    <h2 className="text-base font-bold text-[#111C2D]">
                                        Buka Sesi Pengganti
                                    </h2>
                                </div>
                                <span className="rounded-full bg-[#82F5C1]/50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#002114]">
                                    KODE 6-DIGIT
                                </span>
                            </div>

                            <p className="mt-3 text-xs text-[#3F463F] leading-relaxed">
                                Masukkan <strong>kode unik 6 digit numerik</strong> dari guru yang berhalangan hadir. Sesi kelas terkait akan terbuka agar Anda dapat mengisi absensi sebagai <strong>guru pengganti</strong>.
                            </p>

                            <form onSubmit={handleVerifyCode} className="mt-4 space-y-3">
                                {selectedSesi && (
                                    <div className="flex items-center justify-between gap-2 rounded-[10px] border border-[#006C4A]/30 bg-white px-3 py-2 text-xs">
                                        <div className="min-w-0">
                                            <span className="block text-[10px] font-bold uppercase tracking-wider text-[#006C4A]">
                                                Target Sesi Dipilih
                                            </span>
                                            <span className="block truncate font-bold text-[#111C2D]">
                                                Kelas {selectedSesi.kelas?.nama ?? '-'} • Jam Ke-{selectedSesi.jam_pelajaran?.jam_ke ?? '-'} ({selectedSesi.mapel?.nama ?? '-'})
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedSesi(null)}
                                            className="rounded-md px-1.5 py-0.5 text-xs font-bold text-[#3F463F] hover:bg-[#CFD9F0]"
                                            title="Hapus filter sesi"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )}

                                <div>
                                    <label
                                        htmlFor="kode-pengganti"
                                        className="block text-[10.5px] font-bold uppercase tracking-wider text-[#3F463F] mb-1.5"
                                    >
                                        KODE UNIK SESI (6 ANGKA)
                                    </label>
                                    <input
                                        ref={kodeInputRef}
                                        id="kode-pengganti"
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={6}
                                        value={kodeInput}
                                        onChange={(e) =>
                                            setKodeInput(e.target.value.replace(/\D/g, ''))
                                        }
                                        placeholder="000000"
                                        className="w-full rounded-[12px] border-[#C5CEE3] bg-white py-3 px-4 text-center font-mono text-xl font-extrabold tracking-[0.45em] text-[#111C2D] placeholder:text-[#C5CEE3] focus:border-[#006C4A] focus:ring-[#006C4A]"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full rounded-[8px] bg-[#002114] py-3 px-4 text-xs font-semibold text-white hover:bg-[#143823] transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
                                >
                                    <svg className="w-4 h-4 text-[#82F5C1]" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                    </svg>
                                    {processing ? 'Memproses Klaim...' : 'Buka Kunci Sesi Ini'}
                                </button>
                            </form>

                            {/* Flash alert or error */}
                            {flash?.success && (
                                <div className="mt-3.5 rounded-[12px] p-3 text-xs font-medium border border-[#006C4A]/30 bg-[#82F5C1]/30 text-[#002114]">
                                    {flash.success}
                                </div>
                            )}

                            {(inputMsg || errors?.kode) && (
                                <div
                                    className={`mt-3.5 rounded-[12px] p-3 text-xs font-medium ${
                                        (inputMsg?.type ?? 'error') === 'error'
                                            ? 'border border-[#C41E1E]/30 bg-[#C41E1E]/10 text-[#C41E1E]'
                                            : 'border border-[#006C4A]/30 bg-[#82F5C1]/20 text-[#002114]'
                                    }`}
                                >
                                    {inputMsg?.text || errors?.kode}
                                </div>
                            )}

                            {/* SOP Alur Penggantian */}
                            <div className="mt-5 pt-4 border-t border-[#C5CEE3] space-y-2 text-[11px] text-[#3F463F]">
                                <div className="font-bold uppercase tracking-wider text-[10px] text-[#111C2D]">
                                    ALUR PENGGANTIAN RESMI (PRD)
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="font-bold text-[#006C4A]">1.</span>
                                    <span>Guru berhalangan hadir menghubungi WhatsApp Anda.</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="font-bold text-[#006C4A]">2.</span>
                                    <span>Guru men-generate 6-digit kode unik dari dashboard miliknya.</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="font-bold text-[#006C4A]">3.</span>
                                    <span>Masukkan kode di atas untuk membuka kunci sesi dan mengabsen siswa kelas tersebut.</span>
                                </div>
                            </div>
                        </div>

                        {/* Presensi Harian Guru Piket (PRD Bagian 6: Guru Piket juga wajib absen harian) */}
                        <div className="rounded-[24px] border border-[#C5CEE3] bg-[#E8EEFF] p-5 shadow-sm space-y-3.5">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#143823] text-[#82F5C1]">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-[#111C2D]">
                                            Presensi Harian Petugas Piket
                                        </h3>
                                        <p className="text-[11px] text-[#3F463F]">
                                            {absenHariIni
                                                ? `Masuk: ${absenHariIni.jam_masuk}${
                                                      absenHariIni.jam_pulang
                                                          ? ` • Pulang: ${absenHariIni.jam_pulang}`
                                                          : ''
                                                  }`
                                                : `Batas tepat waktu ${aturanJam.batas_tepat_waktu || '07:15'} WIB`}
                                        </p>
                                    </div>
                                </div>
                                {absenHariIni ? (
                                    <span
                                        className={`rounded-md px-2.5 py-0.5 text-[10px] font-bold shrink-0 ${
                                            absenHariIni.status === 'tepat waktu'
                                                ? 'bg-[#82F5C1]/40 text-[#006C4A]'
                                                : 'bg-amber-100 text-amber-800'
                                        }`}
                                    >
                                        {absenHariIni.status === 'tepat waktu'
                                            ? 'Tepat Waktu'
                                            : 'Terlambat'}
                                    </span>
                                ) : (
                                    <span className="rounded-md bg-[#C41E1E]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#C41E1E] shrink-0">
                                        Belum Absen
                                    </span>
                                )}
                            </div>

                            <Link
                                href={route('absen-harian.index')}
                                className={`w-full rounded-[8px] py-2.5 px-4 text-xs font-bold transition flex items-center justify-center gap-2 ${
                                    absenHariIni
                                        ? 'border border-[#C5CEE3] bg-white text-[#006C4A] hover:bg-[#82F5C1]/20'
                                        : 'bg-[#002114] text-white hover:bg-[#143823] shadow-xs'
                                }`}
                            >
                                {absenHariIni?.jam_pulang
                                    ? 'Lihat Riwayat Presensi Mandiri'
                                    : absenHariIni
                                      ? 'Buka Presensi Mandiri / Mode Pulang'
                                      : 'Buka Kamera & Absen Masuk Sekarang'}
                            </Link>
                        </div>

                        {/* Kartu Ringkasan Status Sesi Hari Ini */}
                        <div className="rounded-[24px] border border-[#C5CEE3] bg-[#E8EEFF] p-5 shadow-sm space-y-3">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[#111C2D]">
                                Rekap Kunci Sesi Hari Ini
                            </h3>
                            <div className="grid grid-cols-2 gap-3 text-center">
                                <div className="bg-white rounded-[16px] p-3 border border-[#C5CEE3]">
                                    <span className="text-xs font-semibold text-[#C41E1E] flex items-center justify-center gap-1">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        Terkunci
                                    </span>
                                    <span className="block text-2xl font-extrabold text-[#111C2D] mt-1">
                                        {stats.total_terkunci ?? sesiHariIni.filter((s) => s.status_kunci === 'terkunci').length}
                                    </span>
                                </div>
                                <div className="bg-white rounded-[16px] p-3 border border-[#C5CEE3]">
                                    <span className="text-xs font-semibold text-[#006C4A] flex items-center justify-center gap-1">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                        </svg>
                                        Terbuka
                                    </span>
                                    <span className="block text-2xl font-extrabold text-[#111C2D] mt-1">
                                        {stats.total_terbuka ?? sesiHariIni.filter((s) => s.status_kunci === 'terbuka').length}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column (8 cols): Grid Daftar Kelas & Sesi Hari Ini (Locked Strict) */}
                    <div className="lg:col-span-8 rounded-[24px] border border-[#C5CEE3] bg-[#E8EEFF] p-6 shadow-sm space-y-5">
                        {/* Header & Filter Sesi */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-lg font-bold text-[#111C2D]">
                                        Daftar Sesi Pembelajaran Kelas Hari Ini
                                    </h2>
                                    <span className="inline-flex items-center gap-1 rounded-full bg-[#C41E1E]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#C41E1E]">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        Status Terkunci
                                    </span>
                                </div>
                                <p className="text-xs text-[#3F463F] mt-0.5">
                                    Seluruh kelas & sesi berstatus terkunci (locked). Absensi terbuka khusus sesi yang telah diklaim kode unik 6-digit.
                                </p>
                            </div>

                            {/* Tingkat Tabs */}
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="inline-flex rounded-[8px] bg-white border border-[#C5CEE3] p-0.5 text-xs">
                                    {[
                                        { key: 'all', label: 'Semua Tingkat' },
                                        { key: '7', label: 'Kls 7' },
                                        { key: '8', label: 'Kls 8' },
                                        { key: '9', label: 'Kls 9' },
                                    ].map((tab) => (
                                        <button
                                            key={tab.key}
                                            type="button"
                                            onClick={() => {
                                                setTingkatFilter(tab.key);
                                                setKelasFilter('all');
                                            }}
                                            className={`rounded-[6px] px-2.5 py-1 text-xs font-semibold transition ${
                                                tingkatFilter === tab.key
                                                    ? 'bg-[#002114] text-white'
                                                    : 'text-[#3F463F] hover:text-[#111C2D]'
                                            }`}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Kotak Status Kunci Kelas (PRD 2.C.2: Semua kelas tampil sebagai kotak dengan status terkunci) */}
                        {filteredKelasList.length > 0 && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-[11px]">
                                    <span className="font-bold uppercase tracking-wider text-[#111C2D]">
                                        Status Kunci Rombel / Kelas ({filteredKelasList.length} Kelas)
                                    </span>
                                    {kelasFilter !== 'all' && (
                                        <button
                                            type="button"
                                            onClick={() => setKelasFilter('all')}
                                            className="font-bold text-[#006C4A] hover:underline"
                                        >
                                            Tampilkan Semua Kelas
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                                    {filteredKelasList.map((kls) => {
                                        const sesiKelas = sesiHariIni.filter((s) => s.kelas?.id === kls.id);
                                        const unlockedCount = sesiKelas.filter((s) => s.status_kunci === 'terbuka').length;
                                        const isSelectedKelas = String(kelasFilter) === String(kls.id);

                                        return (
                                            <button
                                                key={kls.id}
                                                type="button"
                                                onClick={() =>
                                                    setKelasFilter(isSelectedKelas ? 'all' : String(kls.id))
                                                }
                                                className={`rounded-[14px] border p-2.5 text-left transition flex items-center justify-between gap-2 ${
                                                    isSelectedKelas
                                                        ? 'border-[#002114] bg-[#002114] text-white shadow-xs'
                                                        : unlockedCount > 0
                                                          ? 'border-[#006C4A] bg-white text-[#111C2D]'
                                                          : 'border-[#C5CEE3] bg-white/90 text-[#111C2D] hover:bg-white'
                                                }`}
                                            >
                                                <div className="min-w-0">
                                                    <div className="text-xs font-extrabold truncate">
                                                        Kelas {kls.nama}
                                                    </div>
                                                    <div
                                                        className={`text-[10px] truncate ${
                                                            isSelectedKelas ? 'text-[#82F5C1]' : 'text-[#3F463F]'
                                                        }`}
                                                    >
                                                        {sesiKelas.length} Sesi • {kls.siswa_count ?? 0} Siswa
                                                    </div>
                                                </div>
                                                <span
                                                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-bold shrink-0 ${
                                                        unlockedCount > 0
                                                            ? 'bg-[#82F5C1] text-[#002114]'
                                                            : isSelectedKelas
                                                              ? 'bg-white/15 text-white'
                                                              : 'bg-[#C41E1E]/10 text-[#C41E1E]'
                                                    }`}
                                                >
                                                    {unlockedCount > 0 ? 'Terbuka' : 'Terkunci'}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {activeUnlockedNotice && (
                            <div className="rounded-[14px] border border-[#006C4A]/40 bg-[#82F5C1]/30 p-3.5 flex items-center justify-between gap-3 text-xs text-[#002114]">
                                <div>
                                    <strong>Sesi Terbuka (Guru Pengganti):</strong> Kelas{' '}
                                    <strong>{activeUnlockedNotice.kelas?.nama}</strong> • Mapel{' '}
                                    <strong>{activeUnlockedNotice.mapel?.nama}</strong> (Jam Ke-
                                    {activeUnlockedNotice.jam_pelajaran?.jam_ke}). Form input absen siswa oleh guru piket disambungkan pada modul <strong>T16</strong>.
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setActiveUnlockedNotice(null)}
                                    className="font-bold text-[#002114] hover:opacity-70 px-1.5"
                                >
                                    ✕
                                </button>
                            </div>
                        )}

                        {/* List Grid Sesi Kelas */}
                        {filteredSesi.length === 0 ? (
                            <div className="rounded-[16px] border border-dashed border-[#C5CEE3] bg-white/70 p-10 text-center space-y-2">
                                <svg className="w-10 h-10 text-[#3F463F]/50 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p className="text-sm font-semibold text-[#111C2D]">
                                    Tidak ada sesi pembelajaran yang terjadwal untuk hari ini.
                                </p>
                                <p className="text-xs text-[#3F463F]">
                                    Pastikan Tahun Ajaran aktif dan jadwal pelajaran telah disinkronkan.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredSesi.map((sesi, idx) => {
                                    const isLocked = sesi.status_kunci === 'terkunci';
                                    const isTargetSelected = selectedSesi?.id && selectedSesi.id === sesi.id;
                                    const jamMulai = sesi.jam_pelajaran?.mulai ? sesi.jam_pelajaran.mulai.slice(0, 5) : '-';
                                    const jamSelesai = sesi.jam_pelajaran?.selesai ? sesi.jam_pelajaran.selesai.slice(0, 5) : '-';

                                    return (
                                        <div
                                            key={sesi.id ?? `slot-${sesi.slot_id}-${idx}`}
                                            className={`rounded-[20px] border p-4 flex flex-col justify-between transition-all ${
                                                isLocked
                                                    ? isTargetSelected
                                                        ? 'bg-white border-[#002114] ring-2 ring-[#002114]/20'
                                                        : 'bg-white border-[#C5CEE3] shadow-xs'
                                                    : 'bg-white border-[#006C4A] ring-2 ring-[#006C4A]/20'
                                            }`}
                                        >
                                            <div className="space-y-3">
                                                {/* Header Kartu Sesi */}
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#CFD9F0] text-[#111C2D]">
                                                            Jam Ke-{sesi.jam_pelajaran?.jam_ke ?? '-'} ({jamMulai} - {jamSelesai} WIB)
                                                        </span>
                                                        <h3 className="text-base font-bold text-[#111C2D] mt-1">
                                                            Kelas {sesi.kelas?.nama ?? '-'}
                                                        </h3>
                                                    </div>

                                                    {/* Badge Status Kunci */}
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                            isLocked
                                                                ? 'bg-[#C41E1E]/10 text-[#C41E1E]'
                                                                : 'bg-[#82F5C1]/40 text-[#006C4A]'
                                                        }`}
                                                    >
                                                        {isLocked ? (
                                                            <>
                                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                                </svg>
                                                                Terkunci
                                                            </>
                                                        ) : (
                                                            <>
                                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                                                </svg>
                                                                Terbuka
                                                            </>
                                                        )}
                                                    </span>
                                                </div>

                                                {/* Detail Mapel & Guru Pengampu */}
                                                <div className="bg-[#E8EEFF]/50 rounded-[12px] p-3 space-y-1.5 text-xs">
                                                    <div className="flex items-center justify-between text-[#111C2D]">
                                                        <span className="font-semibold text-[#3F463F]">Mata Pelajaran:</span>
                                                        <span className="font-bold">{sesi.mapel?.nama ?? '-'}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-[#111C2D]">
                                                        <span className="font-semibold text-[#3F463F]">Guru Terjadwal:</span>
                                                        <span className="font-medium text-right truncate max-w-[150px]">
                                                            {sesi.guru?.nama ?? '-'}
                                                        </span>
                                                    </div>
                                                    {sesi.guru_pengganti && (
                                                        <div className="flex items-center justify-between text-[#006C4A] pt-1 border-t border-[#C5CEE3]/50">
                                                            <span className="font-semibold">Guru Pengganti:</span>
                                                            <span className="font-bold">{sesi.guru_pengganti.nama}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Action Button */}
                                            <div className="mt-4 pt-3 border-t border-[#C5CEE3]/60">
                                                {isLocked ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSelectLockedSesi(sesi)}
                                                        className="w-full rounded-[8px] bg-[#C5CEE3]/60 hover:bg-[#CFD9F0] text-[#111C2D] py-2.5 px-3 text-xs font-semibold transition flex items-center justify-center gap-2"
                                                        title="Klik untuk memasukkan kode unik 6-digit sesi ini"
                                                    >
                                                        <svg className="w-4 h-4 text-[#C41E1E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                        </svg>
                                                        Masukkan Kode 6-Digit untuk Membuka Sesi
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => setActiveUnlockedNotice(sesi)}
                                                        className="w-full rounded-[8px] bg-[#006C4A] hover:bg-[#002114] text-white py-2.5 px-3 text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
                                                    >
                                                        <svg className="w-4 h-4 text-[#82F5C1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        Mulai Absen Siswa
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
