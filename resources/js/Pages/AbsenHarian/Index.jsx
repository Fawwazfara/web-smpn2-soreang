import Modal from '@/Components/Modal';
import { useFaceRecognition } from '@/Hooks/useFaceRecognition';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

function haversineDistanceMeters(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const toRad = (deg) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
}

export default function Index({
    absenHariIni = null,
    riwayatBulanIni = [],
    ringkasanBulanIni = {},
    aturanJam = {},
    agendaHariIni = [],
    infoPiketHariIni = {},
    pilihanBulan = [],
    faceProfile = { registered: false, registered_at_label: null, descriptor: null, threshold: 0.55 },
    flashStatus = null,
}) {
    const { auth, tahunAjaranAktif, errors = {} } = usePage().props;
    const user = auth.user;

    const sekolah = aturanJam.sekolah ?? {
        nama: 'SMPN 2 Soreang',
        latitude: -7.02614,
        longitude: 107.51928,
        radius_meter: 50,
        titik_acuan: 'Tiang Bendera Utama Kampus',
        wifi_ssid: 'SMPN2_GURU_5G',
    };

    const initialOffsetMs = useMemo(() => {
        if (!aturanJam.server_now_iso) return 0;
        const parsed = Date.parse(aturanJam.server_now_iso);
        return Number.isNaN(parsed) ? 0 : parsed - Date.now();
    }, [aturanJam.server_now_iso]);

    const [nowMs, setNowMs] = useState(() => Date.now() + initialOffsetMs);
    const [cameraReady, setCameraReady] = useState(false);
    const [cameraLoading, setCameraLoading] = useState(false);
    const [cameraError, setCameraError] = useState(null);
    const [cameraLabel, setCameraLabel] = useState('Kamera Depan Ultra HD (Built-in)');
    const [capturedPreview, setCapturedPreview] = useState(null);
    const [submittingMode, setSubmittingMode] = useState(null);
    const [previewFotoModal, setPreviewFotoModal] = useState(null);
    const [searchTanggal, setSearchTanggal] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const [geoState, setGeoState] = useState({
        detected: false,
        lat: sekolah.latitude,
        lng: sekolah.longitude,
        accuracy: 3,
        distance: 14.8,
    });

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const overlayCanvasRef = useRef(null);
    const streamRef = useRef(null);

    const { modelsReady, modelsLoading, modelError, faceState, latestDescriptorRef } =
        useFaceRecognition({
            videoRef,
            overlayCanvasRef,
            active: cameraReady && !capturedPreview,
            faceProfile,
            userName: user.nama,
        });

    useEffect(() => {
        const timer = setInterval(() => {
            setNowMs(Date.now() + initialOffsetMs);
        }, 1000);
        return () => clearInterval(timer);
    }, [initialOffsetMs]);

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        setCameraReady(false);
    }, []);

    const startCamera = useCallback(async () => {
        if (
            typeof navigator === 'undefined' ||
            !navigator.mediaDevices ||
            typeof navigator.mediaDevices.getUserMedia !== 'function'
        ) {
            setCameraError(
                'Browser atau perangkat ini tidak mendukung akses kamera live (getUserMedia).'
            );
            setCameraReady(false);
            return false;
        }

        setCameraLoading(true);
        setCameraError(null);

        try {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((t) => t.stop());
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
                audio: false,
            });

            streamRef.current = stream;
            const track = stream.getVideoTracks()[0];
            if (track?.label) {
                setCameraLabel(track.label);
            }

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play().catch(() => {});
            }

            setCapturedPreview(null);
            setCameraReady(true);
            setCameraLoading(false);
            return true;
        } catch {
            setCameraLoading(false);
            setCameraReady(false);
            setCameraError(
                'Akses kamera ditolak atau perangkat kamera tidak ditemukan. Izinkan akses kamera pada browser untuk melakukan presensi.'
            );
            return false;
        }
    }, []);

    useEffect(() => {
        const needsCamera =
            !absenHariIni ||
            (absenHariIni && !absenHariIni.jam_pulang) ||
            !faceProfile?.registered;
        if (needsCamera) {
            startCamera();
        }

        return () => {
            stopCamera();
        };
    }, [absenHariIni, faceProfile?.registered, startCamera, stopCamera]);

    useEffect(() => {
        if (videoRef.current && streamRef.current && videoRef.current.srcObject !== streamRef.current) {
            videoRef.current.srcObject = streamRef.current;
            videoRef.current.play().catch(() => {});
        }
    }, [cameraReady]);

    useEffect(() => {
        if (typeof navigator === 'undefined' || !navigator.geolocation) {
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = Number(pos.coords.latitude.toFixed(5));
                const lng = Number(pos.coords.longitude.toFixed(5));
                const accuracy = Math.max(1, Math.round(pos.coords.accuracy || 5));
                const distance = Number(
                    haversineDistanceMeters(lat, lng, sekolah.latitude, sekolah.longitude).toFixed(1)
                );

                setGeoState({
                    detected: true,
                    lat,
                    lng,
                    accuracy,
                    distance,
                });
            },
            () => {
                // Tetap gunakan tampilan referensi sesuai Keputusan PM #3 (tidak memblokir submit)
            },
            { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
        );
    }, [sekolah.latitude, sekolah.longitude]);

    const wibClockParts = useMemo(() => {
        const formatter = new Intl.DateTimeFormat('id-ID', {
            timeZone: aturanJam.timezone || 'Asia/Jakarta',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        });
        const formatted = formatter.format(new Date(nowMs)).replace(/\./g, ':');
        const [hh = '00', mm = '00', ss = '00'] = formatted.split(':');
        return { hh, mm, ss, hhmm: `${hh}:${mm}`, spaced: `${hh} : ${mm} : ${ss}` };
    }, [nowMs, aturanJam.timezone]);

    const sisaMenitInfo = useMemo(() => {
        const batas = aturanJam.batas_tepat_waktu || '07:15';
        const [bH, bM] = batas.split(':').map(Number);
        const nowMinutes = Number(wibClockParts.hh) * 60 + Number(wibClockParts.mm);
        const batasMinutes = bH * 60 + bM;
        const diff = batasMinutes - nowMinutes;

        if (absenHariIni) {
            return {
                text:
                    absenHariIni.status === 'tepat waktu'
                        ? 'Tercatat Tepat Waktu'
                        : 'Tercatat Terlambat',
                isLate: absenHariIni.status !== 'tepat waktu',
            };
        }

        if (diff > 0) {
            return {
                text: diff >= 60
                    ? `Tersisa ${Math.floor(diff / 60)} Jam ${diff % 60} Menit`
                    : `Tersisa ${diff} Menit`,
                isLate: false,
            };
        }

        if (diff === 0) {
            return { text: 'Menit Terakhir Toleransi', isLate: false };
        }

        return { text: `Melewati Batas (${Math.abs(diff)} Menit)`, isLate: true };
    }, [aturanJam.batas_tepat_waktu, wibClockParts.hh, wibClockParts.mm, absenHariIni]);

    const bisaAbsenPulang = useMemo(() => {
        if (!absenHariIni || absenHariIni.jam_pulang) return false;
        const jamPulang = aturanJam.jam_pulang || '14:30';
        const [pH, pM] = jamPulang.split(':').map(Number);
        const nowMinutes = Number(wibClockParts.hh) * 60 + Number(wibClockParts.mm);
        return nowMinutes >= pH * 60 + pM;
    }, [absenHariIni, aturanJam.jam_pulang, wibClockParts.hh, wibClockParts.mm]);

    const handleEnrollFaceOnly = async () => {
        setCameraError(null);

        if (!cameraReady || !streamRef.current || !videoRef.current) {
            const started = await startCamera();
            if (!started) return;
            setCameraError(
                'Kamera live telah aktif. Posisikan wajah menghadap kamera hingga bingkai deteksi muncul, lalu klik kembali.'
            );
            return;
        }

        if (modelError) {
            setCameraError(modelError);
            return;
        }

        if (modelsLoading || !modelsReady) {
            setCameraError('Model Face Recognition sedang disiapkan, mohon tunggu sebentar...');
            return;
        }

        if (faceState.status === 'multiple_faces') {
            setCameraError(
                'Terdeteksi lebih dari 1 wajah. Pastikan hanya wajah Anda yang berada di depan kamera.'
            );
            return;
        }

        const descriptor = latestDescriptorRef.current;
        if (!Array.isArray(descriptor) || descriptor.length !== 128) {
            setCameraError(
                'Wajah belum terdeteksi dengan jelas oleh sensor biometrik. Arahkan wajah lurus ke kamera.'
            );
            return;
        }

        setSubmittingMode('enroll');
        router.post(
            route('absen-harian.enroll-face'),
            {
                sumber: 'live',
                face_descriptor: descriptor,
                redirect_to: 'index',
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSubmittingMode(null);
                },
                onError: () => {
                    setSubmittingMode(null);
                },
            }
        );
    };

    const captureAndSubmit = async (mode) => {
        setCameraError(null);

        if (!cameraReady || !streamRef.current || !videoRef.current) {
            const started = await startCamera();
            if (!started) return;
            setCameraError(
                'Kamera live telah aktif. Posisikan wajah menghadap kamera lalu klik tombol sekali lagi untuk mengambil foto.'
            );
            return;
        }

        if (modelError) {
            setCameraError(modelError);
            return;
        }

        if (modelsLoading || !modelsReady) {
            setCameraError('Model Face Recognition sedang dimuat, tunggu 1–2 detik lalu tekan kembali.');
            return;
        }

        if (faceState.status === 'mismatch') {
            setCameraError(
                'Verifikasi Face Recognition ditolak: Wajah di depan kamera tidak cocok dengan data biometrik pemilik akun ini.'
            );
            return;
        }

        if (faceState.status === 'multiple_faces') {
            setCameraError(
                'Terdeteksi lebih dari 1 wajah. Pastikan hanya wajah Anda yang berada di depan kamera.'
            );
            return;
        }

        const descriptor = latestDescriptorRef.current;
        if (!Array.isArray(descriptor) || descriptor.length !== 128) {
            setCameraError(
                'Wajah belum terdeteksi dengan jelas oleh sensor Face Recognition. Posisikan 1 wajah menghadap kamera.'
            );
            return;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (!canvas || video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
            setCameraError('Sensor kamera sedang memuat gambar, tunggu 1 detik lalu tekan kembali.');
            return;
        }

        const maxWidth = 960;
        const scale = Math.min(1, maxWidth / video.videoWidth);
        const targetWidth = Math.round(video.videoWidth * scale);
        const targetHeight = Math.round(video.videoHeight * scale);

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            setCameraError('Gagal memproses kanvas kamera pada browser ini.');
            return;
        }

        ctx.save();
        ctx.translate(targetWidth, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
        ctx.restore();

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        const waktuAmbilIso = new Date().toISOString();

        setCapturedPreview(dataUrl);
        setSubmittingMode(mode);

        const targetRoute =
            mode === 'pulang' ? route('absen-harian.pulang') : route('absen-harian.store');

        const payload = {
            foto_capture: dataUrl,
            waktu_ambil: waktuAmbilIso,
            sumber: 'live',
            face_descriptor: descriptor,
        };

        if (geoState.detected) {
            payload.latitude = geoState.lat;
            payload.longitude = geoState.lng;
            payload.akurasi_meter = geoState.accuracy;
        }

        router.post(targetRoute, payload, {
            preserveScroll: true,
            onSuccess: () => {
                setSubmittingMode(null);
                stopCamera();
            },
            onError: () => {
                setSubmittingMode(null);
                setCapturedPreview(null);
            },
        });
    };

    const handleChangeBulan = (newBulan) => {
        setCurrentPage(1);
        router.get(
            route('absen-harian.index'),
            { bulan: newBulan },
            { preserveState: true, preserveScroll: true }
        );
    };

    const filteredRiwayat = useMemo(() => {
        const q = searchTanggal.trim().toLowerCase();
        if (!q) return riwayatBulanIni;
        return riwayatBulanIni.filter(
            (row) =>
                row.tanggal_label?.toLowerCase().includes(q) ||
                row.tanggal?.toLowerCase().includes(q) ||
                row.status?.toLowerCase().includes(q) ||
                row.keterangan?.toLowerCase().includes(q)
        );
    }, [riwayatBulanIni, searchTanggal]);

    const perPage = 5;
    const totalPages = Math.max(1, Math.ceil(filteredRiwayat.length / perPage));
    const safePage = Math.min(currentPage, totalPages);
    const paginatedRiwayat = useMemo(() => {
        const start = (safePage - 1) * perPage;
        return filteredRiwayat.slice(start, start + perPage);
    }, [filteredRiwayat, safePage]);

    const handleDownloadCsv = () => {
        const headers = ['Tanggal', 'Sesi', 'Jam Masuk', 'Jam Pulang', 'Status', 'Keterangan'];
        const rows = filteredRiwayat.map((r) => [
            `"${r.tanggal_label}"`,
            `"${r.sesi_label}"`,
            `"${r.jam_masuk}"`,
            `"${r.jam_pulang ?? '-'}"`,
            `"${r.status === 'tepat waktu' ? 'Tepat Waktu' : 'Terlambat'}"`,
            `"${(r.keterangan ?? '').replace(/"/g, '""')}"`,
        ]);

        const csvContent =
            'data:text/csv;charset=utf-8,' +
            [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

        const link = document.createElement('a');
        link.setAttribute('href', encodeURI(csvContent));
        link.setAttribute(
            'download',
            `rekap-presensi-${user.username}-${ringkasanBulanIni.bulan || 'bulan-ini'}.csv`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const pageTitleRole =
        user.role === 'guru_piket'
            ? 'Presensi Mandiri Guru Piket'
            : user.jenis_pegawai === 'tenaga_kependidikan'
              ? 'Presensi Mandiri Tenaga Kependidikan'
              : 'Presensi Mandiri Guru';

    const breadcrumbParent =
        user.role === 'guru_piket' ? 'DASHBOARD PIKET' : 'DASHBOARD GURU';

    const withinRadius = geoState.distance <= (sekolah.radius_meter || 50);
    const serverErrorMsg =
        errors.absen ||
        errors.face_descriptor ||
        errors.foto_capture ||
        errors.waktu_ambil ||
        errors.sumber ||
        modelError ||
        null;

    return (
        <AuthenticatedLayout>
            <Head title={`${pageTitleRole} - SiSADA`} />

            <div className="space-y-6">
                {/* 1. Header Row: Breadcrumb + TA Pill + Serif Title + NTP Server Clock Card */}
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                            <Link
                                href={route('dashboard')}
                                className="hover:text-[#0F382A] transition"
                            >
                                {breadcrumbParent}
                            </Link>
                            <span>›</span>
                            <span className="text-[#0E7452]">PRESENSI MANDIRI</span>
                        </div>

                        <div className="mt-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E3F5EC] px-3 py-1 text-[11px] font-bold text-[#0E7452]">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                                T.A. {tahunAjaranAktif?.nama ?? '2025/2026'} Semester{' '}
                                {tahunAjaranAktif?.semester ?? 'Ganjil'} • Hari Ini:{' '}
                                {aturanJam.tanggal_hari_ini_label}
                            </span>
                        </div>

                        <h1 className="mt-2.5 font-serif text-2xl sm:text-[32px] font-bold tracking-tight text-[#111C2D] leading-tight">
                            {pageTitleRole}
                        </h1>

                        <p className="mt-1.5 text-xs sm:text-[13px] text-slate-500 max-w-2xl leading-relaxed">
                            Verifikasi kehadiran harian tenaga pendidik berbasis radius geofence GPS sekolah dan sensor biometrik wajah waktu-nyata.
                        </p>
                    </div>

                    {/* NTP Server Clock Box */}
                    <div className="inline-flex items-center gap-3 rounded-2xl border border-[#E5ECE9] bg-white px-5 py-3 shadow-2xs self-start lg:self-auto">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#10B981]" />
                        </span>
                        <div>
                            <div className="text-[9.5px] font-extrabold uppercase tracking-wider text-slate-400">
                                NTP SERVER SIMPATIKA
                            </div>
                            <div className="font-mono text-base font-extrabold tracking-wider text-[#111C2D] mt-0.5">
                                {wibClockParts.spaced}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Geofence & GPS Verification Banner (Exact Match to Figma Image 2) */}
                <div className="rounded-2xl border border-[#C5E9D6] bg-[#E1F5EA] p-4 sm:p-5 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0F382A] text-[#7CF3BA] shadow-xs">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.9" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19.5s6-5.25 6-10.125a6 6 0 10-12 0C6 14.25 12 19.5 12 19.5z" />
                            </svg>
                        </div>

                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <span
                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                                        withinRadius
                                            ? 'bg-[#74F0B3] text-[#064E3B]'
                                            : 'bg-[#FDE68A] text-[#78350F]'
                                    }`}
                                >
                                    {withinRadius
                                        ? `DI DALAM RADIUS AMAN (< ${sekolah.radius_meter || 50} METER)`
                                        : 'KOORDINAT PERANGKAT TERDETEKSI'}
                                </span>
                                <span className="text-[11px] font-semibold text-[#0E7452]">
                                    Akurasi GPS: ±{geoState.accuracy}m (
                                    {geoState.accuracy <= 20 ? 'Tinggi' : 'Standar'})
                                </span>
                            </div>

                            <h2 className="mt-1 text-sm sm:text-base font-extrabold text-[#111C2D]">
                                {geoState.distance}m dari Titik Acuan Presensi {sekolah.nama}
                            </h2>

                            <div className="mt-1.5 flex flex-wrap items-center gap-x-5 gap-y-1 text-[11.5px] text-slate-700">
                                <span>
                                    Koordinat Aktif:{' '}
                                    <strong className="font-mono text-[#111C2D]">
                                        {geoState.lat}, {geoState.lng}
                                    </strong>
                                </span>
                                <span>• {sekolah.titik_acuan}</span>
                                <span>
                                    • WiFi Sekolah SSID:{' '}
                                    <strong className="text-[#111C2D]">{sekolah.wifi_ssid}</strong>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
                        <div className="flex items-center gap-2.5 rounded-2xl bg-white px-4 py-3 shadow-2xs border border-white/80">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E6F5EE] text-[#0E7452]">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                                </svg>
                            </div>
                            <div className="leading-tight">
                                <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400">
                                    GEOFENCE STATUS
                                </div>
                                <div className="text-xs font-extrabold text-[#111C2D] mt-0.5">
                                    Tervalidasi Otomatis
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5 rounded-2xl bg-white px-4 py-3 shadow-2xs border border-white/80">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E6F5EE] text-[#0E7452]">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" />
                                </svg>
                            </div>
                            <div className="leading-tight">
                                <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400">
                                    JALUR DATA
                                </div>
                                <div className="text-xs font-extrabold text-[#111C2D] mt-0.5">
                                    Enkripsi SHA-256
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Main 2-Column Section: Live Camera Viewfinder (7 cols) + Jadwal & Agenda (5 cols) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left Column: Kamera Verifikasi Wajah */}
                    <div className="lg:col-span-7 rounded-2xl border border-[#E5ECE9] bg-white p-5 sm:p-6 shadow-2xs">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <span
                                    className={`h-2.5 w-2.5 rounded-full ${
                                        cameraReady ? 'bg-[#10B981]' : 'bg-amber-400'
                                    }`}
                                />
                                <h2 className="text-sm sm:text-[15px] font-extrabold text-[#111C2D]">
                                    Kamera Verifikasi Wajah
                                </h2>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 max-w-full">
                                {absenHariIni?.foto_url && (
                                    <button
                                        type="button"
                                        onClick={cameraReady ? stopCamera : startCamera}
                                        disabled={cameraLoading}
                                        className="inline-flex items-center gap-1.5 rounded-full border border-[#CBE9DA] bg-[#E6F5EE] px-3 py-1 text-[11px] font-bold text-[#0E7452] hover:bg-[#D7EFE4] transition"
                                    >
                                        {cameraReady ? 'Tutup Kamera Live' : 'Buka Kamera Live'}
                                    </button>
                                )}
                                <div className="inline-flex items-center gap-1.5 rounded-full border border-[#E5ECE9] bg-[#F6F9F8] px-3 py-1 text-[11px] font-semibold text-slate-600 max-w-full">
                                    <svg className="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="1.9" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                                    </svg>
                                    <span className="truncate max-w-[230px]">{cameraLabel}</span>
                                </div>
                            </div>
                        </div>

                        <canvas ref={canvasRef} className="hidden" />

                        {/* Camera Viewfinder */}
                        <div className="mt-4 relative aspect-[16/11] w-full overflow-hidden rounded-2xl bg-[#0A221A] select-none">
                            {/* Video Stream */}
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className={`h-full w-full object-cover scale-x-[-1] transition-opacity duration-200 ${
                                    cameraReady && !capturedPreview ? 'opacity-100' : 'opacity-0 pointer-events-none absolute inset-0'
                                }`}
                            />

                            {/* Real-Time Face Tracking Bracket Box Overlay */}
                            <canvas
                                ref={overlayCanvasRef}
                                className={`pointer-events-none absolute inset-0 z-10 h-full w-full transition-opacity duration-150 ${
                                    cameraReady && !capturedPreview ? 'opacity-100' : 'opacity-0'
                                }`}
                            />

                            {/* Captured Frame or Today's Saved Selfie Preview */}
                            {(capturedPreview || (!cameraReady && absenHariIni?.foto_url)) && (
                                <img
                                    src={capturedPreview || absenHariIni?.foto_url}
                                    alt="Hasil Tangkapan Kamera Live"
                                    className="h-full w-full object-cover"
                                />
                            )}

                            {/* Fallback Prompt when Camera is Not Yet Streaming & No Saved Photo */}
                            {!cameraReady && !capturedPreview && !absenHariIni?.foto_url && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-[#0C2A20] to-[#071913]">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#154634] text-[#6EE7B7] mb-3">
                                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                                        </svg>
                                    </div>
                                    <p className="text-sm font-bold text-white">
                                        {cameraLoading
                                            ? 'Menghubungkan Sensor Kamera Live...'
                                            : 'Sensor Kamera Live Siap Diaktifkan'}
                                    </p>
                                    <p className="mt-1 text-xs text-[#9ED1BE] max-w-sm">
                                        Klik tombol di bawah untuk membuka kamera perangkat secara langsung. Sistem tidak mengizinkan unggah foto dari galeri.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={startCamera}
                                        disabled={cameraLoading}
                                        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#10B981] px-4 py-2 text-xs font-extrabold text-[#052E1F] hover:bg-[#34D399] transition"
                                    >
                                        Aktifkan Kamera Sekarang
                                    </button>
                                </div>
                            )}

                            {/* Clean Location-Only Overlay */}
                            <div className="pointer-events-none absolute inset-x-3 bottom-3 z-20 flex items-center gap-2.5 rounded-xl border border-white/15 bg-[#0A241B]/80 px-3.5 py-2 text-white backdrop-blur-xs">
                                <svg className="w-4 h-4 text-[#6EE7B7] shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19.5s6-5.25 6-10.125a6 6 0 10-12 0C6 14.25 12 19.5 12 19.5z" />
                                </svg>
                                <span className="truncate font-mono text-[11px] font-semibold text-[#D1FAE5]">
                                    Location: {geoState.lat}, {geoState.lng}
                                </span>
                            </div>
                        </div>

                        {/* Biometric Face Recognition Status Strip */}
                        <div className="mt-3.5 rounded-xl border border-[#E5ECE9] bg-[#F8FBF9] px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                                <span
                                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10.5px] font-extrabold ${
                                        faceProfile?.registered
                                            ? 'bg-[#E3F5EC] text-[#0E7452]'
                                            : 'bg-[#FEF3E2] text-[#B45309]'
                                    }`}
                                >
                                    {faceProfile?.registered
                                        ? '🔒 Face ID Terdaftar & Terkunci'
                                        : '◉ Wajah Belum Terdaftar'}
                                </span>
                                {faceProfile?.registered_at_label && (
                                    <span className="hidden sm:inline text-[11px] text-slate-500 truncate">
                                        ({faceProfile.registered_at_label})
                                    </span>
                                )}
                            </div>

                            {cameraReady && !capturedPreview && (
                                <span
                                    className={`text-[11px] font-bold ${
                                        modelsLoading
                                            ? 'text-slate-500'
                                            : faceState.status === 'matched' ||
                                                faceState.status === 'ready_enroll'
                                              ? 'text-[#0E7452]'
                                              : faceState.status === 'mismatch'
                                                ? 'text-[#DC2626]'
                                                : faceState.status === 'multiple_faces'
                                                  ? 'text-[#B45309]'
                                                  : 'text-slate-600'
                                    }`}
                                >
                                    {modelsLoading
                                        ? 'Memuat model Face Recognition...'
                                        : faceState.label}
                                </span>
                            )}
                        </div>

                        {!faceProfile?.registered && absenHariIni && (
                            <div className="mt-3 rounded-xl border border-[#CBE9DA] bg-[#EFF8F4] p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                                <p className="text-[11.5px] font-medium text-[#0F382A]">
                                    Akun Anda belum memiliki kunci biometrik wajah. Arahkan wajah ke kamera live lalu daftarkan sekarang.
                                </p>
                                <button
                                    type="button"
                                    onClick={handleEnrollFaceOnly}
                                    disabled={submittingMode !== null}
                                    className="shrink-0 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0E7452] px-3.5 py-2 text-xs font-extrabold text-white hover:bg-[#0A5D41] disabled:opacity-60 transition"
                                >
                                    {submittingMode === 'enroll'
                                        ? 'Mendaftarkan Wajah...'
                                        : 'Daftarkan & Kunci Wajah Saya'}
                                </button>
                            </div>
                        )}

                        {/* Feedback Alerts */}
                        {flashStatus && (
                            <div className="mt-3.5 rounded-xl border border-[#CBE9DA] bg-[#E6F5EE] px-4 py-3 text-xs font-bold text-[#0E7452] flex items-center gap-2">
                                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2.3" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{flashStatus}</span>
                            </div>
                        )}

                        {(serverErrorMsg || cameraError) && (
                            <div className="mt-3.5 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-xs font-semibold text-[#B91C1C] flex items-start gap-2">
                                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                </svg>
                                <span>{serverErrorMsg || cameraError}</span>
                            </div>
                        )}

                        {/* Action Buttons Row (Exact Match to Figma Image 2) */}
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            {/* Button 1: Absen Masuk */}
                            {!absenHariIni ? (
                                <button
                                    type="button"
                                    onClick={() => captureAndSubmit('masuk')}
                                    disabled={submittingMode !== null}
                                    className="flex items-center justify-between gap-3 rounded-2xl bg-[#103728] px-4 py-3.5 text-left text-white shadow-xs hover:bg-[#164B38] disabled:opacity-60 transition"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#34D399]" />
                                        <span className="text-xs sm:text-[13px] font-bold leading-snug">
                                            {submittingMode === 'masuk'
                                                ? 'Menyimpan Presensi Masuk...'
                                                : faceProfile?.registered
                                                  ? 'Ambil Foto & Absen Masuk Sekarang'
                                                  : 'Daftarkan Wajah & Absen Masuk'}
                                        </span>
                                    </div>
                                    <div className="shrink-0 rounded-xl bg-[#1F5C44] px-2.5 py-1.5 text-center leading-tight">
                                        <div className="font-mono text-[11px] font-extrabold text-[#8CE9BE]">
                                            {wibClockParts.hhmm}
                                        </div>
                                        <div className="text-[9px] font-bold text-[#8CE9BE]">
                                            WIB
                                        </div>
                                    </div>
                                </button>
                            ) : (
                                <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#CBE9DA] bg-[#E6F5EE] px-4 py-3.5">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#103728] text-white">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.4" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                            </svg>
                                        </span>
                                        <div className="min-w-0">
                                            <div className="text-xs font-extrabold text-[#103728]">
                                                Sudah Absen Masuk
                                            </div>
                                            <div className="text-[11px] font-semibold text-[#0E7452]">
                                                {absenHariIni.status === 'tepat waktu'
                                                    ? 'Tepat Waktu'
                                                    : 'Terlambat'}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="shrink-0 rounded-xl bg-white px-2.5 py-1.5 font-mono text-[11px] font-extrabold text-[#103728]">
                                        {absenHariIni.jam_masuk}
                                    </span>
                                </div>
                            )}

                            {/* Button 2: Mode Pulang (Aktif 14.30 WIB) */}
                            {absenHariIni?.jam_pulang ? (
                                <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#CBE9DA] bg-[#F4F9F6] px-4 py-3.5">
                                    <div className="flex items-center gap-2.5">
                                        <svg className="w-4 h-4 text-[#0E7452] shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-xs font-extrabold text-[#0F382A]">
                                            Sudah Absen Pulang
                                        </span>
                                    </div>
                                    <span className="rounded-xl bg-white px-2.5 py-1.5 font-mono text-[11px] font-extrabold text-[#0E7452]">
                                        {absenHariIni.jam_pulang}
                                    </span>
                                </div>
                            ) : bisaAbsenPulang ? (
                                <button
                                    type="button"
                                    onClick={() => captureAndSubmit('pulang')}
                                    disabled={submittingMode !== null}
                                    className="flex items-center justify-between gap-3 rounded-2xl bg-[#0E7452] px-4 py-3.5 text-left text-white shadow-xs hover:bg-[#0A5D41] disabled:opacity-60 transition"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                                        </svg>
                                        <span className="text-xs sm:text-[13px] font-bold leading-snug">
                                            {submittingMode === 'pulang'
                                                ? 'Menyimpan Presensi Pulang...'
                                                : 'Ambil Foto & Absen Pulang'}
                                        </span>
                                    </div>
                                    <span className="shrink-0 rounded-xl bg-white/15 px-2.5 py-1 font-mono text-[11px] font-extrabold">
                                        {wibClockParts.hhmm} WIB
                                    </span>
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    disabled
                                    className="flex items-center justify-center gap-2.5 rounded-2xl border border-[#E5ECE9] bg-[#F6F9F8] px-4 py-3.5 text-center text-xs font-semibold text-slate-500 cursor-not-allowed"
                                >
                                    <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="1.9" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                                    </svg>
                                    <span>
                                        Mode Pulang (Aktif{' '}
                                        {(aturanJam.jam_pulang || '14:30').replace(':', '.')} WIB)
                                    </span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Jadwal Tugas Hari Ini + Agenda Mengajar Hari Ini */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* Card 1: Jadwal Tugas Hari Ini */}
                        <div className="rounded-2xl border border-[#E5ECE9] bg-white p-5 sm:p-6 shadow-2xs space-y-4">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E6F5EE] text-[#0E7452]">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.9" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-extrabold text-[#111C2D]">
                                            Jadwal Tugas Hari Ini
                                        </h3>
                                        <p className="text-[11.5px] text-slate-500">
                                            Shift Reguler Pagi {sekolah.nama}
                                        </p>
                                    </div>
                                </div>
                                <span className="rounded-full bg-[#E3F5EC] px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#0E7452]">
                                    AKTIF
                                </span>
                            </div>

                            {/* 2 Time Boxes */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-xl bg-[#F6F9F8] p-3.5">
                                    <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-500">
                                        JAM MASUK TOLERANSI
                                    </div>
                                    <div className="mt-1.5 text-sm sm:text-[15px] font-extrabold text-[#111C2D] leading-snug">
                                        {(aturanJam.jam_mulai_masuk || '06:30').replace(':', '.')} –{' '}
                                        {(aturanJam.batas_tepat_waktu || '07:15').replace(':', '.')}{' '}
                                        WIB
                                    </div>
                                    <div
                                        className={`mt-1 text-[11px] font-bold ${
                                            sisaMenitInfo.isLate
                                                ? 'text-[#DC2626]'
                                                : 'text-[#0E7452]'
                                        }`}
                                    >
                                        {sisaMenitInfo.text}
                                    </div>
                                </div>

                                <div className="rounded-xl bg-[#F6F9F8] p-3.5">
                                    <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-500">
                                        JAM PULANG RESMI
                                    </div>
                                    <div className="mt-1.5 text-sm sm:text-[15px] font-extrabold text-[#111C2D] leading-snug">
                                        {(aturanJam.jam_pulang || '14:30').replace(':', '.')} WIB
                                    </div>
                                    <div className="mt-1 text-[11px] text-slate-500">
                                        Minimal 7.5 Jam Kerja
                                    </div>
                                </div>
                            </div>

                            {/* Status Presensi Box */}
                            {!absenHariIni ? (
                                <div className="rounded-xl bg-[#EEF3F8] p-3.5 flex items-start gap-3">
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#103728] text-white mt-0.5">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.3" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="text-xs font-extrabold text-[#111C2D]">
                                            Status: Belum Melakukan Presensi
                                        </div>
                                        <p className="mt-1 text-[11.5px] text-slate-600 leading-relaxed">
                                            Silakan posisikan wajah di viewfinder kamera sebelah kiri dan tekan tombol konfirmasi sebelum pukul{' '}
                                            {(aturanJam.batas_tepat_waktu || '07:15').replace(':', '.')}{' '}
                                            WIB untuk menghindari status keterlambatan sistem.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    className={`rounded-xl p-3.5 flex items-start gap-3 ${
                                        absenHariIni.status === 'tepat waktu'
                                            ? 'bg-[#E6F5EE]'
                                            : 'bg-[#FEF3E2]'
                                    }`}
                                >
                                    <div
                                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white mt-0.5 ${
                                            absenHariIni.status === 'tepat waktu'
                                                ? 'bg-[#0E7452]'
                                                : 'bg-[#B45309]'
                                        }`}
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.4" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="text-xs font-extrabold text-[#111C2D]">
                                            Status: Sudah Presensi Masuk (
                                            {absenHariIni.status === 'tepat waktu'
                                                ? 'Tepat Waktu'
                                                : 'Terlambat'}
                                            )
                                        </div>
                                        <p className="mt-1 text-[11.5px] text-slate-700 leading-relaxed">
                                            Tercatat masuk pukul <strong>{absenHariIni.jam_masuk}</strong>
                                            {absenHariIni.jam_pulang
                                                ? ` dan presensi pulang pukul ${absenHariIni.jam_pulang}.`
                                                : `. Mode pulang dapat diakses mulai pukul ${(aturanJam.jam_pulang || '14:30').replace(':', '.')} WIB.`}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Catatan Tugas Tambahan Box */}
                            <div className="rounded-xl bg-[#EAF7F0] p-3.5 flex items-start gap-3">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#103728] text-[#8CE9BE] mt-0.5">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.1" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#0E7452]">
                                        CATATAN TUGAS TAMBAHAN
                                    </div>
                                    <p className="mt-1 text-[11.5px] text-slate-700 leading-relaxed">
                                        {infoPiketHariIni?.bertugas
                                            ? `Bertugas sebagai Guru Piket Sesi Pagi (${(aturanJam.jam_mulai_masuk || '06:30').replace(':', '.')} – 07.00 WIB)${
                                                  infoPiketHariIni.rekan?.length
                                                      ? ` bersama ${infoPiketHariIni.rekan.join(', ')}`
                                                      : ''
                                              }.`
                                            : user.jenis_pegawai === 'tenaga_kependidikan'
                                              ? 'Bertugas pada layanan operasional & tata kelola administrasi sekolah sesuai jam kerja aktif.'
                                              : 'Pastikan presensi mandiri diselesaikan sebelum memasuki ruang kelas untuk memulai sesi KBM.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Card 2: Agenda Mengajar Hari Ini */}
                        <div className="rounded-2xl border border-[#E5ECE9] bg-white p-5 sm:p-6 shadow-2xs">
                            <div className="flex items-center justify-between gap-2 mb-4">
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-[#0E7452]" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                                    </svg>
                                    <h3 className="text-sm font-extrabold text-[#111C2D]">
                                        Agenda Mengajar Hari Ini
                                    </h3>
                                </div>
                                <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                                    {agendaHariIni.length} SESI TERJADWAL
                                </span>
                            </div>

                            {agendaHariIni.length > 0 ? (
                                <div className="space-y-2.5">
                                    {agendaHariIni.map((slot, idx) => (
                                        <div
                                            key={slot.id}
                                            className="flex items-center justify-between gap-3 rounded-xl bg-[#F6F9F8] p-3"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div
                                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[11px] font-extrabold leading-tight text-center ${
                                                        idx === 0
                                                            ? 'bg-[#103728] text-white'
                                                            : 'bg-[#E6F5EE] text-[#0F382A]'
                                                    }`}
                                                >
                                                    {slot.kelas_nama}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="truncate text-xs font-extrabold text-[#111C2D]">
                                                        {slot.mapel_nama}
                                                    </div>
                                                    <div className="text-[11px] text-slate-500">
                                                        Kelas {slot.kelas_nama}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <div className="font-mono text-[11.5px] font-extrabold text-[#111C2D]">
                                                    {slot.mulai} – {slot.selesai}
                                                </div>
                                                <div className="text-[10.5px] text-slate-500">
                                                    Jam Ke-{slot.jam_ke ?? '-'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-xl bg-[#F6F9F8] p-4 text-xs text-slate-500 leading-relaxed">
                                    {user.jenis_pegawai === 'tenaga_kependidikan'
                                        ? 'Akun Tenaga Kependidikan tidak memiliki jadwal sesi mengajar kelas (fokus tugas operasional & administrasi sekolah).'
                                        : user.role === 'guru_piket'
                                          ? 'Siaga pemantauan seluruh rombel dan pembukaan sesi kelas pengganti melalui kode unik 6 digit.'
                                          : 'Belum ada slot jadwal mengajar aktif yang tercatat untuk hari ini.'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 4. Bottom Full-Width Section: Riwayat Presensi Guru Bulan Ini (Exact Match to Figma Image 1) */}
                <div className="rounded-2xl border border-[#E5ECE9] bg-white p-5 sm:p-6 shadow-2xs space-y-5">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 pb-4 border-b border-[#EDF2F0]">
                        <div>
                            <h2 className="text-base sm:text-lg font-extrabold text-[#111C2D]">
                                Riwayat Presensi Guru Bulan Ini
                            </h2>
                            <p className="mt-1 text-xs text-slate-500">
                                Log rekaman biometrik dan radius GPS harian untuk evaluasi kedisiplinan dan tunjangan kinerja SIMPATIKA.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5">
                            <select
                                value={ringkasanBulanIni.bulan || ''}
                                onChange={(e) => handleChangeBulan(e.target.value)}
                                className="rounded-xl border-[#E2E8E5] bg-[#F6F9F8] py-2 pl-3.5 pr-8 text-xs font-bold text-[#111C2D] focus:border-[#0E7452] focus:ring-[#0E7452]"
                            >
                                {pilihanBulan.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>

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
                                    value={searchTanggal}
                                    onChange={(e) => {
                                        setSearchTanggal(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    placeholder="Cari tanggal..."
                                    className="rounded-xl border-[#E2E8E5] bg-[#F6F9F8] py-2 pl-8 pr-3.5 text-xs text-slate-700 placeholder:text-slate-400 focus:border-[#0E7452] focus:bg-white focus:ring-[#0E7452] w-44"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={handleDownloadCsv}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-[#E3F5EC] px-3.5 py-2 text-xs font-extrabold text-[#0F382A] hover:bg-[#D2EFE0] transition"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                </svg>
                                Unduh Rekap
                            </button>
                        </div>
                    </div>

                    {/* 5 Summary Metric Cards (Exact Match to Figma Image 1) */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                        <div className="rounded-2xl bg-[#F6F9F8] p-4">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                HARI KERJA EFEKTIF
                            </div>
                            <div className="mt-1.5 text-xl sm:text-2xl font-extrabold text-[#111C2D]">
                                {ringkasanBulanIni.hari_kerja_efektif ?? 0} Hari
                            </div>
                        </div>

                        <div className="rounded-2xl bg-[#E6F5EE] p-4">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-[#0F382A]">
                                HADIR TEPAT WAKTU
                            </div>
                            <div className="mt-1.5 text-xl sm:text-2xl font-extrabold text-[#0E7452]">
                                {ringkasanBulanIni.hadir_tepat_waktu ?? 0} Hari
                            </div>
                        </div>

                        <div className="rounded-2xl bg-[#E8EEFF] p-4">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-[#1E3A8A]">
                                IZIN DINAS LUAR
                            </div>
                            <div className="mt-1.5 text-xl sm:text-2xl font-extrabold text-[#111C2D]">
                                {ringkasanBulanIni.izin_dinas_luar ?? 0} Hari
                            </div>
                        </div>

                        <div className="rounded-2xl bg-[#F6F9F8] p-4">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                TERLAMBAT / ALPA
                            </div>
                            <div className="mt-1.5 text-xl sm:text-2xl font-extrabold text-slate-600">
                                {ringkasanBulanIni.terlambat ?? 0} Hari
                            </div>
                        </div>

                        <div className="col-span-2 sm:col-span-1 rounded-2xl bg-[#103728] p-4 text-white">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-[#8CE9BE] leading-tight">
                                KEHADIRAN (SIMPATIKA)
                            </div>
                            <div className="mt-1.5 text-xl sm:text-2xl font-extrabold text-white">
                                {ringkasanBulanIni.persentase_kehadiran ?? '100.0'}%
                            </div>
                        </div>
                    </div>

                    {/* History Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-[#EDF2F0]">
                            <thead className="bg-[#F8FAF9]">
                                <tr>
                                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                        TANGGAL &amp; HARI
                                    </th>
                                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                        JAM MASUK
                                    </th>
                                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                        JAM PULANG
                                    </th>
                                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                        STATUS
                                    </th>
                                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                        VERIFIKASI LOKASI &amp; GEOFENCE
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#EDF2F0] bg-white">
                                {paginatedRiwayat.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="px-4 py-10 text-center text-xs font-medium text-slate-500"
                                        >
                                            Belum ada rekaman presensi pada periode{' '}
                                            {ringkasanBulanIni.bulan_label || 'ini'}.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedRiwayat.map((row) => (
                                        <tr
                                            key={row.id}
                                            className="hover:bg-[#F8FAF9] transition-colors"
                                        >
                                            <td className="px-4 py-3.5 whitespace-nowrap">
                                                <div className="text-xs font-extrabold text-[#111C2D]">
                                                    {row.tanggal_label}
                                                </div>
                                                <div className="text-[11px] text-slate-400">
                                                    {row.sesi_label}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs font-extrabold text-[#111C2D]">
                                                {row.jam_masuk}
                                            </td>
                                            <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs font-medium text-slate-600">
                                                {row.jam_pulang ?? '—'}
                                            </td>
                                            <td className="px-4 py-3.5 whitespace-nowrap">
                                                {row.status === 'tepat waktu' ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-[#8CF2C0] px-3 py-1 text-[10.5px] font-extrabold text-[#064E3B]">
                                                        <span>✓</span>
                                                        <span>Tepat Waktu</span>
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-[#FDE68A] px-3 py-1 text-[10.5px] font-extrabold text-[#78350F]">
                                                        <span>•</span>
                                                        <span>Terlambat</span>
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-700">
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="h-2 w-2 rounded-full bg-[#10B981] shrink-0" />
                                                        <span className="font-mono text-[11.5px]">
                                                            {row.keterangan}
                                                        </span>
                                                    </div>
                                                    {row.foto_url && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setPreviewFotoModal(row)}
                                                            className="rounded-lg border border-[#E5ECE9] bg-white px-2.5 py-1 text-[11px] font-bold text-[#0E7452] hover:bg-[#E6F5EE] transition"
                                                        >
                                                            Lihat Foto
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

                    {/* Table Footer & Pagination */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 text-xs text-slate-500">
                        <div>
                            Menampilkan{' '}
                            <strong className="text-slate-700">{paginatedRiwayat.length}</strong>{' '}
                            dari{' '}
                            <strong className="text-slate-700">{filteredRiwayat.length}</strong>{' '}
                            rekaman presensi bulan {ringkasanBulanIni.bulan_label}
                        </div>

                        <div className="inline-flex items-center gap-1.5 self-end sm:self-auto">
                            <button
                                type="button"
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={safePage <= 1}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5ECE9] bg-[#F8FAF9] text-slate-500 hover:bg-[#EDF3F0] disabled:opacity-40 transition"
                            >
                                ‹
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    type="button"
                                    onClick={() => setCurrentPage(page)}
                                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-extrabold transition ${
                                        page === safePage
                                            ? 'bg-[#103728] text-white'
                                            : 'border border-[#E5ECE9] bg-[#F8FAF9] text-slate-600 hover:bg-[#EDF3F0]'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                type="button"
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={safePage >= totalPages}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5ECE9] bg-[#F8FAF9] text-slate-500 hover:bg-[#EDF3F0] disabled:opacity-40 transition"
                            >
                                ›
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Selfie Photo Verification Modal */}
            <Modal
                show={Boolean(previewFotoModal)}
                onClose={() => setPreviewFotoModal(null)}
                maxWidth="md"
            >
                {previewFotoModal && (
                    <div className="p-5 space-y-4">
                        <div className="flex items-center justify-between border-b border-[#EDF2F0] pb-3">
                            <div>
                                <h3 className="text-sm font-extrabold text-[#111C2D]">
                                    Bukti Rekaman Kamera Live
                                </h3>
                                <p className="text-xs text-slate-500">
                                    {previewFotoModal.tanggal_label} • Masuk{' '}
                                    {previewFotoModal.jam_masuk}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setPreviewFotoModal(null)}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="overflow-hidden rounded-xl bg-slate-900">
                            <img
                                src={previewFotoModal.foto_url}
                                alt="Foto Selfie Presensi"
                                className="w-full h-auto object-cover"
                            />
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-600">
                            <span>Sumber: Kamera Live ({previewFotoModal.sumber})</span>
                            <span className="font-bold text-[#0E7452]">
                                {previewFotoModal.status === 'tepat waktu'
                                    ? '✓ Tepat Waktu'
                                    : 'Terlambat'}
                            </span>
                        </div>
                    </div>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}
