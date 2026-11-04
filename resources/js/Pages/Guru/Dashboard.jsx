import Modal from '@/Components/Modal';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

export default function Dashboard({ piketHariIni = [], sesiHariIni = [], tahunAjaranAktif = null }) {
    const user = usePage().props.auth.user;
    const { flash } = usePage().props;
    const [now, setNow] = useState(() => new Date());
    const [showPiketModal, setShowPiketModal] = useState(false);
    const [generatingSesi, setGeneratingSesi] = useState(null);
    const [activeKodeModal, setActiveKodeModal] = useState(null);
    const [copied, setCopied] = useState(false);
    const [replacementToast, setReplacementToast] = useState(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [cameraNote, setCameraNote] = useState(null);
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const previousReplacedIds = useRef(new Set());

    // 1. Inisialisasi previous replaced IDs
    useEffect(() => {
        sesiHariIni.forEach((s) => {
            if (s.guru_pengganti || s.status === 'digantikan') {
                previousReplacedIds.current.add(s.id);
            }
        });
    }, []);

    // 2. Deteksi perubahan sesi yang baru saja digantikan saat polling data
    useEffect(() => {
        sesiHariIni.forEach((s) => {
            const isNowReplaced = Boolean(s.guru_pengganti || s.status === 'digantikan');
            if (isNowReplaced && !previousReplacedIds.current.has(s.id)) {
                previousReplacedIds.current.add(s.id);

                // Jika modal kode aktif sedang terbuka untuk sesi ini, tutup
                if (activeKodeModal?.sesi_id === s.id) {
                    setActiveKodeModal(null);
                }

                // Munculkan notifikasi toast
                setReplacementToast({
                    mapel: s.mapel?.nama,
                    kelas: s.kelas?.nama,
                    piketNama: s.guru_pengganti?.nama || 'Guru Piket',
                });
            }
        });
    }, [sesiHariIni]);

    // 3. Polling status penggantian (PRD Bagian 3 poin 6)
    // Berjalan hanya jika ada sesi yang memiliki kode aktif dan belum digantikan
    const hasPendingReplacement = sesiHariIni.some(
        (s) => s.active_kode && !s.guru_pengganti && s.status !== 'digantikan'
    );

    useEffect(() => {
        if (!hasPendingReplacement) return;

        const pollTimer = setInterval(() => {
            router.reload({
                only: ['sesiHariIni'],
                preserveScroll: true,
                preserveState: true,
            });
        }, 10000); // Poll setiap 10 detik

        return () => clearInterval(pollTimer);
    }, [hasPendingReplacement]);

    // 4. Hitung sisa masa berlaku kode (countdown helper)
    const getRemainingTime = (isoExpiry) => {
        if (!isoExpiry) return null;
        const diff = new Date(isoExpiry) - now;
        if (diff <= 0) return 'Kadaluarsa';
        const totalMinutes = Math.floor(diff / 60000);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        const seconds = Math.floor((diff % 60000) / 1000);
        if (hours > 0) {
            return `${hours}j ${minutes}m`;
        }
        return `${minutes}m ${seconds}d`;
    };

    useEffect(() => {
        if (flash?.generated_kode) {
            setActiveKodeModal(flash.generated_kode);
        }
    }, [flash]);

    const handleGenerateKode = (sesi) => {
        setGeneratingSesi(sesi.id);
        router.post(
            route('sesi.generate-kode', sesi.id),
            {},
            {
                preserveScroll: true,
                onSuccess: (page) => {
                    setGeneratingSesi(null);
                    if (page.props.flash?.generated_kode) {
                        setActiveKodeModal(page.props.flash.generated_kode);
                    }
                },
                onError: () => {
                    setGeneratingSesi(null);
                },
            }
        );
    };

    const handleCopyKode = (kode) => {
        if (navigator?.clipboard?.writeText) {
            navigator.clipboard.writeText(kode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }
    };

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => {
            clearInterval(timer);
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
            }
        };
    }, []);

    const startLiveCamera = async () => {
        if (!navigator?.mediaDevices?.getUserMedia) {
            setCameraNote('Perangkat/browser belum mengizinkan akses kamera live.');
            return;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' },
                audio: false,
            });
            streamRef.current = stream;
            setCameraActive(true);
            setCameraNote(null);
            requestAnimationFrame(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            });
        } catch {
            setCameraNote('Izin akses kamera ditolak atau kamera tidak ditemukan.');
        }
    };

    const handleSubmitCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        setCameraActive(false);
        setCameraNote('Selfie kamera live berhasil diverifikasi dalam mode pratinjau dashboard.');
    };

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
                {/* 1. Dark Forest Green Hero Banner (Exact Figma Guru Dashboard) */}
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

                    {/* Hero Footer Strip */}
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
                                <svg className="w-3.5 h-3.5 text-[#8CE9BE]" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" />
                                </svg>
                                Guru Piket Hari Ini
                                {piketHariIni.length > 0 && (
                                    <span className="px-1.5 py-0.2 rounded-full bg-[#34D399] text-[#064E3B] text-[10px] font-bold">
                                        {piketHariIni.length}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* 2. Two-Column Main Content */}
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

                            {/* Live Camera Viewfinder Frame (Strictly Live Camera Only) */}
                            <div className="relative mt-4 aspect-[4/3] rounded-2xl overflow-hidden border border-[#DCE6E1] bg-gradient-to-b from-[#6B7E78] via-[#3A524A] to-[#172B24]">
                                {cameraActive ? (
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className="absolute inset-0 h-full w-full object-cover scale-x-[-1]"
                                    />
                                ) : (
                                    /* Realistic Soft-Focused Classroom Backdrop & Portrait Silhouette */
                                    <div className="absolute inset-0 overflow-hidden">
                                        <div className="absolute inset-x-0 top-0 h-8 bg-[#DDE5E2]/90 border-b border-white/30 px-3 flex items-center justify-between text-[9px] text-slate-600 font-semibold">
                                            <span>SiSADA Camera Preview</span>
                                            <span>☀️ 28°C</span>
                                        </div>
                                        <div className="absolute -left-6 top-12 h-24 w-28 rounded-xl bg-[#C2B39B]/35 blur-md" />
                                        <div className="absolute right-2 top-14 h-28 w-36 rounded-xl bg-[#9AB1A8]/30 blur-md" />
                                        {/* Portrait Silhouette */}
                                        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-end pointer-events-none">
                                            <div className="h-20 w-20 rounded-full bg-gradient-to-b from-[#D8B49A] to-[#B58A6D] shadow-md ring-2 ring-white/15 flex items-center justify-center">
                                                {/* Glasses detail */}
                                                <div className="flex items-center gap-1 opacity-75">
                                                    <span className="h-3.5 w-5 rounded border-2 border-[#231F20]" />
                                                    <span className="h-0.5 w-1.5 bg-[#231F20]" />
                                                    <span className="h-3.5 w-5 rounded border-2 border-[#231F20]" />
                                                </div>
                                            </div>
                                            <div className="-mt-2 h-24 w-48 rounded-t-[44px] bg-gradient-to-b from-[#2B3735] via-[#1F2A28] to-[#131C1A] shadow-inner" />
                                        </div>
                                    </div>
                                )}

                                {/* HUD Overlay Layer */}
                                <div className="relative z-10 h-full p-3.5 flex flex-col justify-between">
                                    <div className="pt-5 flex items-start justify-center">
                                        {/* Biometric Face-Tracking Frame */}
                                        <div className="relative h-36 w-36 flex flex-col items-center justify-between py-2">
                                            <span className="absolute left-0 top-0 h-6 w-6 border-l-2 border-t-2 border-[#34D399]" />
                                            <span className="absolute right-0 top-0 h-6 w-6 border-r-2 border-t-2 border-[#34D399]" />
                                            <span className="absolute bottom-0 left-0 h-6 w-6 border-b-2 border-l-2 border-[#34D399]" />
                                            <span className="absolute bottom-0 right-0 h-6 w-6 border-b-2 border-r-2 border-[#34D399]" />

                                            <span className="text-[7.5px] font-mono font-bold tracking-widest text-[#8CE9BE] drop-shadow">
                                                FACIAL RECOGNITION v2.0
                                            </span>

                                            <span className="absolute -right-7 -top-2 rounded-md bg-[#0D271E]/90 border border-[#34D399]/60 px-2 py-0.5 font-mono text-[9px] font-bold text-[#8CE9BE] leading-tight">
                                                TRACK-
                                                <br />
                                                01
                                            </span>

                                            <div className="w-full h-px bg-[#34D399]/50" />

                                            <span className="font-mono text-[8px] font-bold tracking-widest text-[#6EE7B7] drop-shadow">
                                                VERIFYING IDENTITY..
                                            </span>
                                        </div>
                                    </div>

                                    {/* Bottom Location & Date Overlay */}
                                    <div className="rounded-xl border border-white/15 bg-[#0C291F]/88 px-3 py-2 backdrop-blur-xs flex items-center gap-2.5 text-white">
                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#16533D] text-white">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.1" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                                            </svg>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate text-[11px] font-bold text-white">
                                                {formattedFullDate}
                                            </p>
                                            <p className="truncate text-[9.5px] font-mono text-[#B7E4D3]">
                                                Location: -7.030114281042527,107.5393714306826
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {cameraNote && (
                                <p className="mt-2 rounded-lg bg-[#EDF6F1] px-2.5 py-1.5 text-[11px] font-medium text-[#0E7452]">
                                    {cameraNote}
                                </p>
                            )}

                            {/* Deadline Row */}
                            <div className="mt-3.5 flex items-center justify-between text-[10.5px]">
                                <span className="font-bold text-[#C81E1E]">
                                    ⏱ BATAS MASUK: 07:00 WIB
                                </span>
                                <span className="rounded bg-[#FDE8E8] px-2 py-0.5 text-[10px] font-bold text-[#C81E1E]">
                                    Tersisa -11 Menit 45 Detik
                                </span>
                            </div>

                            {/* Exact 3 Action Buttons Stack */}
                            <div className="mt-2.5 space-y-2">
                                <button
                                    type="button"
                                    onClick={startLiveCamera}
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
                                    onClick={handleSubmitCamera}
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
                                    <svg className="w-4 h-4 text-[#0E7452]" fill="none" viewBox="0 0 24 24" strokeWidth="1.9" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" />
                                    </svg>
                                    Berhalangan Hadir? Hubungi Guru Piket
                                </button>
                            </div>

                            {/* Log Kehadiran Pekan Ini */}
                            <div className="mt-5 pt-4 border-t border-[#EDF2F0]">
                                <div className="flex items-center justify-between text-[10.5px] font-bold">
                                    <span className="uppercase tracking-wider text-slate-600">
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
                        {/* Active KBM Session Card */}
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

                        {/* Jadwal Mengajar Hari Ini Card + Dapodik Footer */}
                        <div className="rounded-2xl border border-[#E5ECE9] bg-white p-6 shadow-2xs">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-[#0E7452]" fill="none" viewBox="0 0 24 24" strokeWidth="1.9" stroke="currentColor">
                                        <rect x="3.5" y="4.5" width="17" height="16" rx="2" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 3v3m8-3v3M3.5 9.5h17" />
                                    </svg>
                                    <h3 className="text-base font-bold text-slate-900">
                                        Jadwal Sesi Mengajar Hari Ini
                                    </h3>
                                </div>
                                <div className="text-[11px] font-medium text-slate-500">
                                    {formattedShortDate} •{' '}
                                    <span className="font-bold text-[#0E7452]">
                                        Total: {sesiHariIni.length} Sesi Terjadwal
                                    </span>
                                </div>
                            </div>

                            {/* Flash alert error/success if any */}
                            {flash?.error && (
                                <div className="mb-4 rounded-xl border border-rose-200 bg-[#FFF5F5] p-3 text-xs font-semibold text-[#DC2626]">
                                    {flash.error}
                                </div>
                            )}
                            {flash?.success && (
                                <div className="mb-4 rounded-xl border border-[#CBE9DA] bg-[#EDF6F1] p-3 text-xs font-semibold text-[#0F382A]">
                                    {flash.success}
                                </div>
                            )}

                            <div className="space-y-3">
                                {sesiHariIni.length === 0 ? (
                                    <div className="rounded-xl border border-dashed border-[#DCE5E1] bg-[#F8FAF9] p-6 text-center text-xs text-slate-500">
                                        Tidak ada jadwal sesi mengajar aktif untuk Anda pada hari ini.
                                    </div>
                                ) : (
                                    sesiHariIni.map((sesi) => {
                                        const jamMulai = sesi.jam_pelajaran?.mulai ? sesi.jam_pelajaran.mulai.slice(0, 5) : '-';
                                        const jamSelesai = sesi.jam_pelajaran?.selesai ? sesi.jam_pelajaran.selesai.slice(0, 5) : '-';
                                        const isReplaced = sesi.guru_pengganti !== null || sesi.status === 'digantikan';

                                        return (
                                            <div
                                                key={sesi.id}
                                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[#F0F4F2] bg-white p-3.5 hover:border-[#34D399] transition"
                                            >
                                                <div className="flex items-center gap-3.5 min-w-0">
                                                    <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-[#0D3124] text-white leading-none">
                                                        <span className="text-[8.5px] font-bold uppercase tracking-wider text-[#9BF6C8]">
                                                            JAM
                                                        </span>
                                                        <span className="mt-0.5 text-xs font-extrabold">
                                                            {sesi.jam_pelajaran?.jam_ke ?? '-'}
                                                        </span>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className="text-xs sm:text-[13.5px] font-bold text-slate-900">
                                                                {sesi.mapel?.nama ?? 'Mata Pelajaran'} • Kelas {sesi.kelas?.nama ?? '-'}
                                                            </span>
                                                            {isReplaced ? (
                                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#82F5C1]/30 border border-[#006C4A]/30 px-2.5 py-0.5 text-[10px] font-bold text-[#002114]">
                                                                    <svg className="w-3 h-3 text-[#006C4A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                    Sudah Digantikan oleh: {sesi.guru_pengganti?.nama}
                                                                </span>
                                                            ) : sesi.active_kode ? (
                                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FEF3E2] border border-[#B45309]/30 px-2.5 py-0.5 text-[10px] font-bold text-[#B45309]">
                                                                    <span className="h-1.5 w-1.5 rounded-full bg-[#B45309] animate-pulse" />
                                                                    Kode: {sesi.active_kode.kode} (Sisa: {getRemainingTime(sesi.active_kode.berlaku_sampai)})
                                                                </span>
                                                            ) : (
                                                                <span className="rounded-md bg-[#E5F6ED] px-2 py-0.5 text-[10px] font-bold text-[#0E7452]">
                                                                    Sesi Terjadwal
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="mt-0.5 text-[11px] text-slate-500">
                                                            {jamMulai} - {jamSelesai} WIB • SMPN 2 Soreang
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                                                    {isReplaced ? (
                                                        <span className="rounded-lg bg-[#E6F5EE] px-3 py-1.5 text-xs font-bold text-[#0E7452]">
                                                            ✓ Selesai Dialihkan
                                                        </span>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleGenerateKode(sesi)}
                                                            disabled={generatingSesi === sesi.id}
                                                            className="rounded-lg bg-[#0F382A] hover:bg-[#164B38] text-white px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition shadow-xs disabled:opacity-50"
                                                        >
                                                            <svg className="w-3.5 h-3.5 text-[#8CE9BE]" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818" />
                                                            </svg>
                                                            {generatingSesi === sesi.id ? 'Membuat...' : (sesi.active_kode ? 'Lihat/Buat Ulang Kode' : 'Generate Kode Piket')}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Exact Dapodik Integration & Cetak Jadwal Footer */}
                            <div className="mt-5 pt-4 border-t border-[#F0F4F2] flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2.5 text-[11px] text-slate-500 leading-snug">
                                    <svg className="w-4 h-4 text-[#0E7452] shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="1.9" stroke="currentColor">
                                        <circle cx="12" cy="12" r="9" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 11.25v4.5m0-7.5h.008v.008H12V8.25z" />
                                    </svg>
                                    <span>
                                        Data presensi otomatis terintegrasi
                                        <br />
                                        dengan Dapodik Kemendikbud.
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => window.print()}
                                    className="text-right text-[10.5px] font-extrabold uppercase tracking-wider text-[#0E7452] hover:text-[#0D3124] hover:underline leading-tight shrink-0"
                                >
                                    CETAK JADWAL
                                    <br />
                                    MINGGUAN
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Full-Width Bottom 3-Column KPI Summary Row (Exact Figma Bottom Section) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Card 1: Tingkat Kehadiran Mandiri */}
                    <div className="rounded-2xl border border-[#E5ECE9] bg-white p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-600">
                                    TINGKAT KEHADIRAN MANDIRI
                                </span>
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E6F5EE] text-[#0E7452]">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </span>
                            </div>

                            <div className="mt-3 flex items-baseline gap-2">
                                <span className="text-[34px] leading-none font-extrabold tracking-tight text-slate-900">
                                    98.2%
                                </span>
                                <span className="text-xs font-bold text-[#0E7452]">
                                    Bulan Oktober
                                </span>
                            </div>

                            <div className="mt-4 h-1.5 w-full rounded-full bg-[#E5ECE9] overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-[#046C4E]"
                                    style={{ width: '98.2%' }}
                                />
                            </div>
                        </div>

                        <div className="mt-3 flex items-start justify-between gap-2 text-[10.5px] leading-snug">
                            <span className="font-medium text-slate-600">
                                21 / 21 Hari Hadir Tepat
                                <br />
                                Waktu
                            </span>
                            <span className="font-bold text-[#0E7452] text-left">
                                Nol
                                <br />
                                Keterlambatan
                            </span>
                        </div>
                    </div>

                    {/* Card 2: Beban Mengajar Mingguan */}
                    <div className="rounded-2xl border border-[#E5ECE9] bg-white p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-600">
                                    BEBAN MENGAJAR MINGGUAN
                                </span>
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E6F5EE] text-[#0E7452]">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347M12 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
                                    </svg>
                                </span>
                            </div>

                            <div className="mt-3 flex items-baseline gap-1.5">
                                <span className="text-[34px] leading-none font-extrabold tracking-tight text-slate-900">
                                    24
                                </span>
                                <span className="text-xs font-semibold text-slate-500">
                                    Jam / Minggu
                                </span>
                            </div>

                            <div className="mt-4 h-1.5 w-full rounded-full bg-[#E5ECE9] overflow-hidden">
                                <div className="h-full w-full rounded-full bg-[#046C4E]" />
                            </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-2 text-[10.5px] leading-snug">
                            <span className="font-medium text-slate-600">
                                Standar Linearitas
                                <br />
                                Sertifikasi (24 Jam)
                            </span>
                            <span className="rounded-lg bg-[#E6F5EE] px-2.5 py-1 text-[10px] font-bold text-[#0E7452] leading-tight">
                                Terpenuhi
                                <br />
                                (100%)
                            </span>
                        </div>
                    </div>

                    {/* Card 3: Progres Input Penilaian KBM */}
                    <div className="rounded-2xl border border-[#E5ECE9] bg-white p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-600">
                                    PROGRES INPUT PENILAIAN KBM
                                </span>
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E6F5EE] text-[#0E7452]">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                        <rect x="4" y="4" width="16" height="16" rx="2" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                                    </svg>
                                </span>
                            </div>

                            <div className="mt-3 flex items-baseline gap-2">
                                <span className="text-[34px] leading-none font-extrabold tracking-tight text-[#046C4E]">
                                    100%
                                </span>
                                <span className="text-xs font-bold text-[#0E7452]">
                                    Sumatif & Formatif
                                </span>
                            </div>

                            <div className="mt-4 h-1.5 w-full rounded-full bg-[#E5ECE9] overflow-hidden">
                                <div className="h-full w-full rounded-full bg-[#046C4E]" />
                            </div>
                        </div>

                        <div className="mt-3 flex items-start justify-between gap-2 text-[10.5px] leading-snug">
                            <span className="font-medium text-slate-600">
                                Tuntas PTS 1 • 6 Rombel
                                <br />
                                Sinkron
                            </span>
                            <span className="font-bold text-[#0E7452] text-left">
                                E-Rapor Siap
                                <br />
                                Cetak
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Koordinasi Guru Piket Hari Ini */}
            <Modal show={showPiketModal} onClose={() => setShowPiketModal(false)} maxWidth="md">
                <div className="p-6">
                    <div className="flex items-center justify-between pb-3 border-b border-[#EDF2F0]">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E6F5EE] text-[#0E7452]">
                                    Hari Ini
                                </span>
                                <h3 className="font-serif text-lg font-bold text-slate-900">
                                    Daftar Guru Piket Bertugas
                                </h3>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                Jika berhalangan mengajar, koordinasikan via WhatsApp lalu buat kode unik 6 digit untuk sesi Anda.
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

                    <div className="mt-4 space-y-3">
                        {piketHariIni.length === 0 ? (
                            <div className="rounded-xl bg-[#F6F9F8] border border-dashed border-[#DCE6E1] p-6 text-center">
                                <svg className="w-8 h-8 text-slate-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-xs font-semibold text-slate-700">
                                    Belum ada guru piket yang terjadwal untuk hari ini.
                                </p>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                    Silakan hubungi pihak Tata Usaha / Admin sekolah secara langsung.
                                </p>
                            </div>
                        ) : (
                            piketHariIni.map((piket) => {
                                const waNumber = piket.wa_phone || (piket.no_wa ? piket.no_wa.replace(/[^0-9]/g, '').replace(/^0/, '62') : '');
                                const messageTemplate = encodeURIComponent(
                                    `Halo Bapak/Ibu ${piket.nama}, mohon maaf mengganggu. Saya ${user.nama} (Guru SMPN Soreang) berhalangan hadir untuk sesi mengajar hari ini. Mohon bantuan koordinasi piket untuk pembagian sesi. Terima kasih.`
                                );
                                const waUrl = waNumber ? `https://wa.me/${waNumber}?text=${messageTemplate}` : null;

                                return (
                                    <div
                                        key={piket.id}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[#E5ECE9] bg-[#F8FAF9] p-3.5 hover:border-[#34D399] transition"
                                    >
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="truncate text-xs font-bold text-slate-900">
                                                    {piket.nama}
                                                </p>
                                                <span className="inline-flex items-center gap-1 rounded-full bg-[#E6F5EE] px-2 py-0.5 text-[9px] font-bold text-[#0E7452]">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                                                    Piket Aktif
                                                </span>
                                            </div>
                                            <p className="mt-0.5 truncate font-mono text-[11px] text-slate-500 flex items-center gap-1">
                                                <svg className="w-3.5 h-3.5 text-[#0E7452]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                                {piket.no_wa || 'No. WA belum terisi'}
                                            </p>
                                        </div>

                                        {waUrl ? (
                                            <a
                                                href={waUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#046C4E] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#0D3124] transition shrink-0 shadow-xs"
                                            >
                                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                                                </svg>
                                                Hubungi via WA
                                            </a>
                                        ) : (
                                            <span className="text-[11px] font-semibold text-slate-400 italic">
                                                WA tidak tersedia
                                            </span>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </Modal>

            {/* Modal Kode Pengganti Dibuat (6-Digit Numerik) */}
            <Modal show={!!activeKodeModal} onClose={() => setActiveKodeModal(null)} maxWidth="sm">
                <div className="p-6 text-center space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-[#EDF2F0]">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#0E7452]">
                            KODE UNIK PENGGANTIAN
                        </span>
                        <button
                            type="button"
                            onClick={() => setActiveKodeModal(null)}
                            className="text-slate-400 hover:text-slate-600 text-sm"
                        >
                            ✕
                        </button>
                    </div>

                    <div>
                        <h3 className="text-base font-bold text-slate-900">
                            Kode Pengganti Berhasil Dibuat
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                            Berikan 6-digit kode ini kepada Guru Piket untuk membuka sesi dan mengabsen siswa.
                        </p>
                    </div>

                    {/* Display Kode Besar */}
                    <div className="py-4 bg-[#F8FAF9] rounded-2xl border-2 border-dashed border-[#0E7452]/40">
                        <span className="font-mono text-4xl font-extrabold tracking-[0.35em] text-[#0D3124]">
                            {activeKodeModal?.kode}
                        </span>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-snug">
                        Sisa masa berlaku:{' '}
                        <strong className="text-[#0E7452]">
                            {getRemainingTime(activeKodeModal?.berlaku_sampai)}
                        </strong>{' '}
                        (sampai jam pelajaran sesi selesai).
                    </p>

                    <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                        <button
                            type="button"
                            onClick={() => handleCopyKode(activeKodeModal?.kode)}
                            className="rounded-xl bg-[#0F382A] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#164B38] transition flex items-center justify-center gap-1.5 shadow-xs"
                        >
                            <svg className="w-4 h-4 text-[#8CE9BE]" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                            </svg>
                            {copied ? 'Tersalin ke Clipboard!' : 'Salin 6-Digit Kode'}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setActiveKodeModal(null);
                                setShowPiketModal(true);
                            }}
                            className="rounded-xl border border-[#DCE5E1] bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-[#F6F9F8] transition"
                        >
                            Hubungi Piket via WA
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Toast Notifikasi Berhasil Digantikan Guru Piket */}
            {replacementToast && (
                <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-[#002114] border-2 border-[#82F5C1] text-white p-4 rounded-[16px] shadow-lg animate-bounce sm:animate-none">
                    <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#82F5C1] text-[#002114]">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-[#82F5C1] uppercase tracking-wider">
                                Sesi Berhasil Digantikan!
                            </h4>
                            <p className="text-xs text-white mt-0.5 leading-snug">
                                Sesi <strong>{replacementToast.mapel}</strong> ({replacementToast.kelas}) telah dibuka & diambil alih oleh{' '}
                                <strong className="text-[#82F5C1]">{replacementToast.piketNama}</strong>.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setReplacementToast(null)}
                            className="text-white/60 hover:text-white text-xs p-1"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
