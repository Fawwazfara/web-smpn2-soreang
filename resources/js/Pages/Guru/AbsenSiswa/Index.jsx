import { useState, useMemo, useCallback, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

/* ─────────────────── helpers ─────────────────── */
function initials(name = '') {
    return name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0] ?? '')
        .join('')
        .toUpperCase();
}

function formatTimeShort(val) {
    if (!val) return '';
    return String(val).slice(0, 5);
}

const STATUS_CONFIG = {
    H: { label: 'H', title: 'Hadir', activeClass: 'bg-emerald-500 text-white shadow-sm' },
    S: { label: 'S', title: 'Sakit', activeClass: 'bg-slate-500 text-white shadow-sm' },
    I: { label: 'I', title: 'Izin', activeClass: 'bg-teal-600 text-white shadow-sm' },
    A: { label: 'A', title: 'Alfa', activeClass: 'bg-red-500 text-white shadow-sm' },
};

const AVATAR_COLORS = [
    'bg-[#143823] text-white',
    'bg-[#006C4A] text-white',
    'bg-slate-500 text-white',
    'bg-indigo-600 text-white',
];

/* ─────────────────── sub-components ─────────────────── */
function SessionCard({ sesi, isActive, onClick, currentUserId }) {
    const jam = sesi.jam_pelajaran;
    const mulai = formatTimeShort(jam?.mulai ?? jam?.waktu_mulai);
    const selesai = formatTimeShort(jam?.selesai ?? jam?.waktu_selesai);
    const waktu = jam ? `${mulai} – ${selesai}` : '—';
    const kelas = sesi.kelas?.nama ?? sesi.kelas?.nama_kelas ?? '—';
    const mapel = sesi.mapel?.nama ?? sesi.mapel?.nama_mapel ?? '—';
    const ruang = sesi.slot?.ruang ?? `R. ${kelas}`;
    const isSubSession = sesi.guru_pengganti_id && sesi.guru_pengganti_id === currentUserId;

    return (
        <div
            onClick={onClick}
            className={`cursor-pointer p-3.5 rounded-xl border-2 flex flex-col justify-between transition-all ${
                isActive
                    ? 'border-emerald-500 bg-emerald-50/60 shadow-sm'
                    : 'border-slate-200 bg-slate-50 hover:bg-white hover:shadow-sm'
            }`}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-bold text-base sm:text-lg leading-tight ${isActive ? 'text-[#143823]' : 'text-slate-800'}`}>
                            Kelas {kelas}
                        </span>
                        {isActive && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider">
                                Terpilih
                            </span>
                        )}
                        {isSubSession && (
                            <span className="px-2 py-0.5 rounded-full bg-[#82F5C1] text-[#002114] text-[10px] font-bold uppercase tracking-wider">
                                Guru Pengganti
                            </span>
                        )}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${isActive ? 'bg-white/90 text-[#006C4A]' : 'bg-slate-200 text-slate-700'}`}>
                            {mapel}
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className="text-[12px] text-slate-500">{ruang}</span>
                    </div>
                    {isSubSession && sesi.guru?.nama && (
                        <span className="text-[11px] text-slate-500 mt-1 truncate">
                            Menggantikan: {sesi.guru.nama}
                        </span>
                    )}
                </div>
                <span className={`material-symbols-outlined text-[22px] shrink-0 ${isActive ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {isActive ? 'check_circle' : 'schedule'}
                </span>
            </div>
            <div className={`mt-3 pt-2 border-t flex items-center justify-between gap-2 ${isActive ? 'border-emerald-200' : 'border-slate-200'}`}>
                <span className={`text-[12px] font-bold ${isActive ? 'text-[#006C4A]' : 'text-slate-500'}`}>
                    Jam Ke-{jam?.jam_ke ?? '-'} ({waktu} WIB)
                </span>
                {isActive && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-[#006C4A] text-[11px] font-bold shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Jam KBM Aktif
                    </span>
                )}
            </div>
        </div>
    );
}

function MetricPill({ icon, label, value, colorClass, subLabel }) {
    return (
        <div className="p-3.5 sm:p-4 rounded-xl bg-white shadow-sm border border-slate-200 flex items-center gap-3">
            <div className={`w-10 sm:w-11 h-10 sm:h-11 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                <span className="material-symbols-outlined text-[20px] sm:text-[22px]">{icon}</span>
            </div>
            <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">{label}</span>
                <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-extrabold text-slate-800">{value}</span>
                    {subLabel && <span className="text-[12px] text-slate-400">{subLabel}</span>}
                </div>
            </div>
        </div>
    );
}

function buildInitialAttendance(siswas = [], absenMap = {}) {
    const init = {};
    siswas.forEach((s) => {
        const existing = absenMap[s.id];
        init[s.id] = {
            status: existing?.status ?? null,
            catatan: existing?.catatan ?? '',
        };
    });
    return init;
}

/* ─────────────────── main page ─────────────────── */
export default function Index({ sesi, sesiBerjalan = [], siswas = [], absenMap = {} }) {
    const { auth, flash } = usePage().props;
    const user = auth?.user;

    // Attendance state: siswa_id -> { status, catatan }
    const [attendance, setAttendance] = useState(() => buildInitialAttendance(siswas, absenMap));
    const [jurnalKbm, setJurnalKbm] = useState(sesi?.alasan ?? '');
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [saving, setSaving] = useState(false);
    const [generatingKode, setGeneratingKode] = useState(false);
    const [copiedKode, setCopiedKode] = useState(false);

    useEffect(() => {
        setAttendance(buildInitialAttendance(siswas, absenMap));
        setJurnalKbm(sesi?.alasan ?? '');
    }, [sesi?.id, siswas, absenMap]);

    const handleStatusChange = useCallback((siswaId, status) => {
        setAttendance((prev) => ({
            ...prev,
            [siswaId]: { ...prev[siswaId], status },
        }));
    }, []);

    const handleCatatanChange = useCallback((siswaId, catatan) => {
        setAttendance((prev) => ({
            ...prev,
            [siswaId]: { ...prev[siswaId], catatan },
        }));
    }, []);

    const handleMarkAllHadir = () => {
        const next = {};
        siswas.forEach((s) => {
            next[s.id] = { status: 'H', catatan: attendance[s.id]?.catatan ?? '' };
        });
        setAttendance(next);
    };

    const counts = useMemo(() => {
        const c = { H: 0, S: 0, I: 0, A: 0, null: 0 };
        Object.values(attendance).forEach(({ status }) => {
            c[status ?? 'null']++;
        });
        return { total: siswas.length, H: c.H, S: c.S, I: c.I, A: c.A, belum: c['null'] };
    }, [attendance, siswas]);

    const filteredSiswas = useMemo(() => {
        return siswas.filter((s) => {
            const matchSearch = !search || s.nama.toLowerCase().includes(search.toLowerCase()) || s.nis.includes(search);
            const matchFilter = filterStatus === 'all' || attendance[s.id]?.status === filterStatus.toUpperCase();
            return matchSearch && matchFilter;
        });
    }, [siswas, search, filterStatus, attendance]);

    const handleSave = () => {
        if (!sesi) return;
        setSaving(true);
        const absen = siswas.map((s) => ({
            siswa_id: s.id,
            status: attendance[s.id]?.status ?? 'H',
            catatan: attendance[s.id]?.catatan ?? '',
        }));
        router.post(
            route('guru.absen-sesi.store', sesi.id),
            { absen, jurnal_kbm: jurnalKbm },
            {
                preserveScroll: true,
                onFinish: () => setSaving(false),
            }
        );
    };

    const handleGenerateKode = () => {
        if (!sesi) return;
        setGeneratingKode(true);
        router.post(
            route('sesi.generate-kode', sesi.id),
            {},
            {
                preserveScroll: true,
                onFinish: () => setGeneratingKode(false),
            }
        );
    };

    const navigateToSesi = (s) => {
        router.get(route('guru.absen-sesi.show', s.id));
    };

    const activeSesiId = sesi?.id;
    const isPiketRole = user?.role === 'guru_piket';
    const isActingAsPengganti = Boolean(
        sesi && (sesi.guru_pengganti_id === user?.id || (isPiketRole && sesi.guru_pengganti_id))
    );
    const isSubstitutedByPiket = Boolean(sesi && (sesi.guru_pengganti_id || sesi.status === 'digantikan'));
    const isScheduledOwner = Boolean(sesi && sesi.guru_id === user?.id);

    const activeKodeObj =
        flash?.generated_kode?.sesi_id === sesi?.id
            ? flash.generated_kode
            : sesi?.kode_pengganti?.[0] ?? null;

    const handleCopyKode = (kode) => {
        if (kode && navigator?.clipboard?.writeText) {
            navigator.clipboard.writeText(kode);
            setCopiedKode(true);
            setTimeout(() => setCopiedKode(false), 2500);
        }
    };

    const kelasNama = sesi?.kelas?.nama ?? sesi?.kelas?.nama_kelas ?? '—';
    const mapelNama = sesi?.mapel?.nama ?? sesi?.mapel?.nama_mapel ?? 'Mapel';
    const jamMulai = formatTimeShort(sesi?.jam_pelajaran?.mulai ?? sesi?.jam_pelajaran?.waktu_mulai);
    const jamSelesai = formatTimeShort(sesi?.jam_pelajaran?.selesai ?? sesi?.jam_pelajaran?.waktu_selesai);

    /* ── Render ── */
    return (
        <AuthenticatedLayout>
            <Head title="Presensi Siswa – Input Absen Kelas" />

            <div className="w-full space-y-5 sm:space-y-6 text-left">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex flex-col space-y-1">
                        <nav className="flex items-center gap-1.5 text-slate-400 flex-wrap text-xs sm:text-sm">
                            <span>{isPiketRole ? 'Portal Guru Piket' : 'KBM & Presensi'}</span>
                            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                            <span className="font-bold text-[#006C4A] uppercase tracking-wider text-[11px]">
                                {isActingAsPengganti ? 'Input Absen Kelas (Guru Pengganti)' : 'Input Absen Kelas'}
                            </span>
                        </nav>
                        <div className="flex flex-wrap items-center gap-2.5">
                            <h1 className="text-xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                                Presensi Siswa Kelas
                            </h1>
                            {isActingAsPengganti && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#82F5C1]/60 border border-[#006C4A]/30 px-3 py-1 text-xs font-bold text-[#002114]">
                                    <span className="w-2 h-2 rounded-full bg-[#006C4A]" />
                                    Mode Guru Pengganti
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
                        {isPiketRole && (
                            <Link
                                href={route('dashboard')}
                                className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white text-slate-700 hover:bg-slate-100 shadow-sm border border-slate-200 transition-all text-xs sm:text-sm font-semibold"
                            >
                                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                                <span>Dashboard Piket</span>
                            </Link>
                        )}
                        <button
                            type="button"
                            onClick={handleMarkAllHadir}
                            disabled={!sesi}
                            className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white text-slate-800 hover:bg-emerald-50 hover:text-[#006C4A] shadow-sm border border-slate-200 transition-all text-xs sm:text-sm font-semibold flex-1 sm:flex-initial disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <span className="material-symbols-outlined text-emerald-500 text-[18px]">done_all</span>
                            <span>Tandai Semua Hadir</span>
                        </button>
                        {isScheduledOwner && !isSubstitutedByPiket && (
                            <button
                                type="button"
                                onClick={handleGenerateKode}
                                disabled={!sesi || generatingKode}
                                className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white text-slate-800 hover:bg-slate-100 shadow-sm border border-slate-200 transition-all text-xs sm:text-sm font-semibold flex-1 sm:flex-initial disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <span className="material-symbols-outlined text-[#006C4A] text-[18px]">vpn_key</span>
                                <span className="truncate">
                                    {generatingKode ? 'Membuat Kode...' : 'Generate Kode Pengganti'}
                                </span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Flash Messages */}
                {flash?.success && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-[#006C4A] flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[20px]">check_circle</span>
                            <span>{flash.success}</span>
                        </div>
                    </div>
                )}

                {flash?.error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">error</span>
                        <span>{flash.error}</span>
                    </div>
                )}

                {/* Active Replacement Code Banner (for Scheduled Teacher) */}
                {activeKodeObj && !isSubstitutedByPiket && (
                    <div className="rounded-2xl border-2 border-dashed border-[#006C4A]/40 bg-[#E8EEFF]/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#006C4A] block">
                                Kode Pengganti 6-Digit Aktif (Sesi Kelas {kelasNama})
                            </span>
                            <div className="flex items-baseline gap-3 mt-1">
                                <span className="font-mono text-2xl font-extrabold tracking-[0.3em] text-[#143823]">
                                    {activeKodeObj.kode}
                                </span>
                                <span className="text-xs text-slate-600">
                                    Berikan kode ini ke Guru Piket bertugas untuk membuka kunci sesi ini.
                                </span>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleCopyKode(activeKodeObj.kode)}
                            className="rounded-xl bg-[#143823] text-white px-4 py-2 text-xs font-bold hover:bg-[#002114] transition self-start sm:self-auto shrink-0"
                        >
                            {copiedKode ? 'Kode Tersalin!' : 'Salin 6-Digit Kode'}
                        </button>
                    </div>
                )}

                {/* No sesi state */}
                {!sesi && (
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 text-center space-y-3">
                        <span className="material-symbols-outlined text-[48px] text-slate-300 block">event_busy</span>
                        <div>
                            <p className="text-slate-700 font-bold text-base">
                                {isPiketRole
                                    ? 'Belum ada sesi pengganti yang terbuka untuk Anda hari ini.'
                                    : 'Tidak ada jadwal mengajar hari ini.'}
                            </p>
                            <p className="text-slate-500 text-sm mt-1">
                                {isPiketRole
                                    ? 'Silakan masukkan 6-digit kode unik dari guru yang berhalangan hadir di Dashboard Guru Piket untuk membuka kunci sesi.'
                                    : 'Jadwal sesi kosong atau belum digenerate oleh admin.'}
                            </p>
                        </div>
                        {isPiketRole && (
                            <div className="pt-2">
                                <Link
                                    href={route('dashboard')}
                                    className="inline-flex items-center gap-2 rounded-xl bg-[#143823] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#002114] transition"
                                >
                                    Buka Dashboard Guru Piket
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {/* Session Selection Grid */}
                {sesiBerjalan.length > 0 && (
                    <div className="bg-white rounded-2xl p-3.5 sm:p-6 shadow-sm border border-slate-200">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-1.5 mb-4">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#006C4A] text-[20px]">calendar_month</span>
                                <h2 className="font-bold text-sm sm:text-base text-slate-900">
                                    {isPiketRole
                                        ? 'Daftar Sesi Kelas yang Anda Gantikan Hari Ini'
                                        : 'Pilih Jadwal & Kelas Mengajar Hari Ini'}
                                </h2>
                            </div>
                            {sesi && (
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                                    <span className="text-[12px] text-[#006C4A] font-semibold">
                                        Menampilkan Kelas {kelasNama} yang dipilih
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
                            {sesiBerjalan.map((s) => (
                                <SessionCard
                                    key={s.id}
                                    sesi={s}
                                    isActive={s.id === activeSesiId}
                                    onClick={() => navigateToSesi(s)}
                                    currentUserId={user?.id}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Rombel Detail Banner */}
                {sesi && (
                    <div className="relative overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-200">
                        <div className="h-2 w-full bg-gradient-to-r from-[#143823] via-[#006C4A] to-[#82F5C1]"></div>
                        <div className="p-4 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full">
                                <div className="flex sm:flex-col items-center justify-between sm:justify-center p-3 sm:p-4 rounded-xl bg-emerald-50 min-w-[110px] text-center">
                                    <div>
                                        <span className="text-[11px] font-bold uppercase tracking-widest text-[#006C4A] block">Rombel</span>
                                        <span className="text-2xl font-extrabold text-[#143823] leading-tight">{kelasNama}</span>
                                    </div>
                                    <span className="text-[11px] text-[#006C4A]/80 sm:mt-1 font-semibold">{siswas.length} Siswa</span>
                                </div>
                                <div className="flex flex-col space-y-2 flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#143823] text-white text-[11px] font-bold uppercase tracking-wider">
                                            <span className="material-symbols-outlined text-[14px]">calculate</span>
                                            {mapelNama}
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold">
                                            <span className="material-symbols-outlined text-[#006C4A] text-[14px]">schedule</span>
                                            Jam Ke-{sesi.jam_pelajaran?.jam_ke ?? '-'} ({jamMulai} – {jamSelesai} WIB)
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold">
                                            <span className="material-symbols-outlined text-[#006C4A] text-[14px]">meeting_room</span>
                                            {sesi.slot?.ruang ?? `Ruang ${kelasNama}`}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-600 text-xs sm:text-[13px]">
                                        <div>
                                            <span className="text-[11px] font-bold uppercase text-[#006C4A] mr-1.5">Guru Terjadwal:</span>
                                            <span className="font-semibold text-slate-800">{sesi.guru?.nama ?? '—'}</span>
                                        </div>
                                        {sesi.guru_pengganti && (
                                            <div>
                                                <span className="text-[11px] font-bold uppercase text-[#006C4A] mr-1.5">Guru Pengganti:</span>
                                                <span className="font-bold text-[#143823]">{sesi.guru_pengganti.nama}</span>
                                            </div>
                                        )}
                                        <div>
                                            <span className="text-[11px] font-bold uppercase text-[#006C4A] mr-1.5">Status Sesi:</span>
                                            <span>
                                                {isSubstitutedByPiket
                                                    ? `Digantikan oleh ${sesi.guru_pengganti?.nama ?? 'Guru Piket'}`
                                                    : 'Sedang berlangsung sesuai jadwal kurikulum'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Metric Pills */}
                {sesi && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                        <MetricPill icon="groups" label="Total Siswa" value={counts.total} subLabel="Anak" colorClass="bg-slate-100 text-slate-600" />
                        <MetricPill
                            icon="check_circle"
                            label={`Hadir (${counts.total > 0 ? Math.round((counts.H / counts.total) * 100) : 0}%)`}
                            value={counts.H}
                            subLabel="Siswa"
                            colorClass="bg-emerald-50 text-[#006C4A]"
                        />
                        <MetricPill icon="local_hospital" label="Sakit" value={counts.S} subLabel="Wajib Bukti" colorClass="bg-slate-100 text-slate-600" />
                        <MetricPill icon="assignment_turned_in" label="Izin" value={counts.I} subLabel="Wajib Bukti" colorClass="bg-teal-50 text-teal-700" />
                        <div className="col-span-2 sm:col-span-1">
                            <MetricPill icon="warning" label="Alfa" value={counts.A} subLabel="Alert WA" colorClass="bg-red-50 text-red-600" />
                        </div>
                    </div>
                )}

                {/* Attendance Roster (Responsive Mobile Cards + Desktop Table) */}
                {sesi && (
                    <div className="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                        {/* Table Controls */}
                        <div className="p-3.5 sm:p-6 bg-white flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 border-b border-slate-200">
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
                                {/* Search */}
                                <div className="relative w-full sm:w-72 lg:max-w-xs">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Cari Nama Siswa atau NIS..."
                                        className="w-full pl-9 pr-4 py-2 bg-slate-100 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-slate-200 transition-all"
                                    />
                                </div>

                                {/* Filter Pills */}
                                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto max-w-full">
                                    {[
                                        { key: 'all', label: `Semua (${counts.total})` },
                                        { key: 'h', label: `Hadir (${counts.H})` },
                                        { key: 's', label: `Sakit (${counts.S})` },
                                        { key: 'i', label: `Izin (${counts.I})` },
                                        { key: 'a', label: `Alfa (${counts.A})` },
                                    ].map(({ key, label }) => (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => setFilterStatus(key)}
                                            className={`shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                                                filterStatus === key
                                                    ? 'bg-white text-slate-800 shadow-sm'
                                                    : 'text-slate-500 hover:text-slate-800'
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Save Button */}
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={saving}
                                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#143823] text-white font-semibold text-sm shadow-sm hover:bg-[#002114] transition-all disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
                            >
                                {saving ? (
                                    <>
                                        <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-[18px]">save</span>
                                        Simpan Presensi
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Mobile Card List (< md) for HP Ergonomics */}
                        <div className="md:hidden divide-y divide-slate-100">
                            {filteredSiswas.length === 0 ? (
                                <div className="py-10 px-4 text-center text-slate-400 text-sm">
                                    Tidak ada siswa ditemukan.
                                </div>
                            ) : (
                                filteredSiswas.map((siswa, idx) => {
                                    const att = attendance[siswa.id] ?? { status: null, catatan: '' };
                                    const colorClass = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                                    const existing = absenMap[siswa.id];
                                    const hasToken = existing?.konfirmasi_token && ['S', 'I'].includes(existing?.status);

                                    return (
                                        <div key={siswa.id} className="p-3.5 space-y-2.5">
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <div className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${colorClass}`}>
                                                        {initials(siswa.nama)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-sm text-slate-900 truncate">
                                                            {idx + 1}. {siswa.nama}
                                                        </p>
                                                        <p className="text-xs font-mono text-slate-500">NIS: {siswa.nis}</p>
                                                    </div>
                                                </div>
                                                {hasToken && (
                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                            existing.status_konfirmasi === 'terkonfirmasi'
                                                                ? 'bg-emerald-100 text-emerald-700'
                                                                : 'bg-amber-100 text-amber-700'
                                                        }`}>
                                                            {existing.status_konfirmasi}
                                                        </span>
                                                        <a
                                                            href={`/konfirmasi/${existing.konfirmasi_token}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-flex items-center gap-0.5 text-[#006C4A] hover:text-[#143823] text-[11px] font-bold underline"
                                                        >
                                                            Buka Link
                                                        </a>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-4 gap-1.5 bg-slate-100 p-1 rounded-xl">
                                                {Object.entries(STATUS_CONFIG).map(([code, cfg]) => (
                                                    <button
                                                        key={code}
                                                        type="button"
                                                        onClick={() => handleStatusChange(siswa.id, code)}
                                                        className={`py-2 rounded-lg text-xs font-bold transition-all ${
                                                            att.status === code
                                                                ? cfg.activeClass
                                                                : 'text-slate-600 hover:text-slate-900'
                                                        }`}
                                                    >
                                                        {cfg.label} ({cfg.title})
                                                    </button>
                                                ))}
                                            </div>

                                            <input
                                                type="text"
                                                value={att.catatan}
                                                onChange={(e) => handleCatatanChange(siswa.id, e.target.value)}
                                                placeholder="Catatan khusus siswa (opsional)..."
                                                className="w-full px-3 py-1.5 text-xs bg-slate-50 rounded-lg border border-slate-200 focus:border-[#006C4A] focus:outline-none text-slate-700"
                                            />
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Desktop / Tablet Table (md+) */}
                        <div className="hidden md:block overflow-x-auto w-full">
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="py-3 px-3 sm:px-4 text-[11px] font-bold uppercase text-slate-400 text-center w-12">No.</th>
                                        <th className="py-3 px-3 sm:px-4 text-[11px] font-bold uppercase text-slate-400 w-32">NIS</th>
                                        <th className="py-3 px-3 sm:px-4 text-[11px] font-bold uppercase text-slate-400 min-w-[200px]">Nama Lengkap Siswa</th>
                                        <th className="py-3 px-3 sm:px-4 text-[11px] font-bold uppercase text-slate-400 text-center min-w-[220px]">Status Kehadiran</th>
                                        <th className="py-3 px-3 sm:px-4 text-[11px] font-bold uppercase text-slate-400 min-w-[160px]">Token Konfirmasi</th>
                                        <th className="py-3 px-3 sm:px-4 text-[11px] font-bold uppercase text-slate-400 min-w-[200px]">Catatan Khusus KBM</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredSiswas.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                                                <span className="material-symbols-outlined text-[36px] text-slate-200 block mb-2">search_off</span>
                                                Tidak ada siswa ditemukan.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredSiswas.map((siswa, idx) => {
                                            const att = attendance[siswa.id] ?? { status: null, catatan: '' };
                                            const colorClass = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                                            const existing = absenMap[siswa.id];
                                            const hasToken = existing?.konfirmasi_token && ['S', 'I'].includes(existing?.status);

                                            return (
                                                <tr
                                                    key={siswa.id}
                                                    className={`hover:bg-slate-50/60 transition-colors ${['S', 'I'].includes(att.status) ? 'bg-slate-50/40' : ''}`}
                                                >
                                                    <td className="py-3.5 px-3 sm:px-4 text-sm text-slate-400 text-center font-bold">{idx + 1}</td>
                                                    <td className="py-3.5 px-3 sm:px-4 text-sm text-slate-700 font-mono">{siswa.nis}</td>
                                                    <td className="py-3.5 px-3 sm:px-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded-full font-bold text-[13px] flex items-center justify-center shrink-0 ${colorClass}`}>
                                                                {initials(siswa.nama)}
                                                            </div>
                                                            <span className="font-semibold text-[15px] text-slate-900">{siswa.nama}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3.5 px-3 sm:px-4">
                                                        <div className="flex items-center justify-center gap-1.5 bg-slate-100 p-1 rounded-xl max-w-[220px] mx-auto">
                                                            {Object.entries(STATUS_CONFIG).map(([code, cfg]) => (
                                                                <button
                                                                    key={code}
                                                                    type="button"
                                                                    onClick={() => handleStatusChange(siswa.id, code)}
                                                                    title={cfg.title}
                                                                    className={`min-h-[36px] flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                                                                        att.status === code
                                                                            ? cfg.activeClass
                                                                            : 'text-slate-400 hover:text-slate-700'
                                                                    }`}
                                                                >
                                                                    {cfg.label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="py-3.5 px-3 sm:px-4">
                                                        {hasToken ? (
                                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-[11px] font-semibold">
                                                                <span className="material-symbols-outlined text-[14px] text-[#006C4A]">key</span>
                                                                <span className="font-mono">{existing.konfirmasi_token.slice(0, 8)}...</span>
                                                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                                                    existing.status_konfirmasi === 'terkonfirmasi'
                                                                        ? 'bg-emerald-100 text-emerald-700'
                                                                        : 'bg-amber-100 text-amber-700'
                                                                }`}>
                                                                    {existing.status_konfirmasi}
                                                                </span>
                                                                <a
                                                                    href={`/konfirmasi/${existing.konfirmasi_token}`}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="ml-1 inline-flex items-center gap-0.5 text-[#006C4A] hover:text-[#143823] font-bold underline"
                                                                    title="Buka link publik konfirmasi orang tua"
                                                                >
                                                                    <span>Buka Link</span>
                                                                    <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                                                                </a>
                                                            </div>
                                                        ) : att.status === 'H' || att.status === 'A' ? (
                                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-[#006C4A] text-[11px]">
                                                                <span className="material-symbols-outlined text-[14px]">check</span>
                                                                Tervalidasi
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-300 text-[12px]">—</span>
                                                        )}
                                                    </td>
                                                    <td className="py-3.5 px-3 sm:px-4">
                                                        <input
                                                            type="text"
                                                            value={att.catatan}
                                                            onChange={(e) => handleCatatanChange(siswa.id, e.target.value)}
                                                            placeholder="Tambah catatan..."
                                                            className="w-full px-2.5 py-1 text-sm bg-transparent border-b border-transparent focus:border-[#006C4A] focus:outline-none placeholder:text-slate-300 transition-colors text-slate-700"
                                                        />
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Jurnal KBM */}
                {sesi && (
                    <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="material-symbols-outlined text-[#006C4A] text-[20px]">auto_stories</span>
                            <h2 className="font-bold text-base text-slate-900">Jurnal KBM &amp; Catatan Sesi</h2>
                        </div>
                        <textarea
                            value={jurnalKbm}
                            onChange={(e) => setJurnalKbm(e.target.value)}
                            rows={4}
                            placeholder="Tulis catatan materi, kegiatan, atau kendala selama KBM berlangsung..."
                            className="w-full px-4 py-3 bg-slate-50 rounded-xl text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-slate-200 resize-none"
                        />
                        <div className="flex justify-end mt-3">
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={saving}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#143823] text-white font-semibold text-sm shadow-sm hover:bg-[#002114] transition-all disabled:opacity-60"
                            >
                                <span className="material-symbols-outlined text-[18px]">save</span>
                                Simpan Presensi &amp; Jurnal
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
