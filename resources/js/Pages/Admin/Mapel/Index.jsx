import InputError from '@/Components/InputError';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

const KELOMPOK_OPTIONS = [
    'Kelompok A (Wajib)',
    'Kelompok B (Pilihan/Seni)',
    'Muatan Lokal Jawa Barat',
];

const emptyMapel = {
    kode: '',
    nama: '',
    kelompok_kurikulum: 'Kelompok A (Wajib)',
    guru_pengampu: '',
    beban_jam: 4,
};

const emptyJam = {
    jam_ke: 1,
    mulai: '07:00',
    selesai: '07:40',
    kelompok_hari: 'senin-kamis',
};

function formatTime(timeStr) {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    return `${parts[0]}.${parts[1]}`;
}

function getInitials(name) {
    if (!name) return '??';
    const words = name
        .replace(/^(Bpk\.|Ibu|Hj\.|Drs\.|Dra\.|Ust\.)\s+/i, '')
        .trim()
        .split(' ')
        .filter(Boolean);
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
}

function timeToMinutes(timeStr) {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + (m || 0);
}

export default function Index({
    mapel = [],
    jamPelajaran = [],
    tahunAjaranAktif,
    gurus = [],
    flash,
}) {
    const { auth } = usePage().props;
    const user = auth?.user || {
        nama: 'Hj. Endang S., S.AP',
        role: 'admin',
    };

    // Mobile sidebar state
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Parse initial tab from URL if present
    const urlParams = new URLSearchParams(
        typeof window !== 'undefined' ? window.location.search : '',
    );
    const initialTab = urlParams.get('tab') === 'jam' ? 'jam' : 'mapel';

    const [activeTab, setActiveTab] = useState(initialTab);
    const [dayFilter, setDayFilter] = useState('senin-kamis');
    const [searchMapel, setSearchMapel] = useState('');
    const [kelompokFilter, setKelompokFilter] = useState('all');

    // Modals
    const [mapelModalOpen, setMapelModalOpen] = useState(false);
    const [editingMapel, setEditingMapel] = useState(null);

    const [jamModalOpen, setJamModalOpen] = useState(false);
    const [editingJam, setEditingJam] = useState(null);

    const [deleteModal, setDeleteModal] = useState({
        open: false,
        type: null,
        item: null,
    });

    // Close modals on Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                if (mapelModalOpen) closeMapelModal();
                if (jamModalOpen) closeJamModal();
                if (deleteModal.open) closeDeleteModal();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [mapelModalOpen, jamModalOpen, deleteModal.open]);

    // Forms
    const mapelForm = useForm(emptyMapel);
    const jamForm = useForm(emptyJam);

    // Mapel Handlers
    const openCreateMapel = () => {
        setEditingMapel(null);
        mapelForm.clearErrors();
        mapelForm.reset();
        mapelForm.setData(emptyMapel);
        setMapelModalOpen(true);
    };

    const openEditMapel = (item) => {
        setEditingMapel(item);
        mapelForm.clearErrors();
        mapelForm.setData({
            kode: item.kode || item.kode_mapel || '',
            nama: item.nama || item.nama_mapel || '',
            kelompok_kurikulum:
                item.kelompok_kurikulum || 'Kelompok A (Wajib)',
            guru_pengampu: item.guru_pengampu || '',
            beban_jam: item.beban_jam || 4,
        });
        setMapelModalOpen(true);
    };

    const closeMapelModal = () => {
        setMapelModalOpen(false);
        setEditingMapel(null);
        mapelForm.clearErrors();
        mapelForm.reset();
    };

    const submitMapel = (e) => {
        e.preventDefault();
        if (editingMapel) {
            mapelForm.patch(route('mapel.update', editingMapel.id), {
                preserveScroll: true,
                onSuccess: () => closeMapelModal(),
            });
        } else {
            mapelForm.post(route('mapel.store'), {
                preserveScroll: true,
                onSuccess: () => closeMapelModal(),
            });
        }
    };

    // Jam Pelajaran Handlers
    const openCreateJam = () => {
        setEditingJam(null);
        jamForm.clearErrors();
        jamForm.reset();
        const existingInGroup = jamPelajaran.filter(
            (slot) => slot.kelompok_hari === dayFilter,
        );
        const maxJamKe = existingInGroup.reduce(
            (max, slot) => Math.max(max, slot.jam_ke || 0),
            0,
        );
        jamForm.setData({
            ...emptyJam,
            jam_ke: maxJamKe + 1,
            kelompok_hari: dayFilter,
        });
        setJamModalOpen(true);
    };

    const openEditJam = (item) => {
        setEditingJam(item);
        jamForm.clearErrors();
        const formatForInput = (val) => (val ? val.slice(0, 5) : '07:00');
        jamForm.setData({
            jam_ke: item.jam_ke,
            mulai: formatForInput(item.mulai || item.waktu_mulai),
            selesai: formatForInput(item.selesai || item.waktu_selesai),
            kelompok_hari: item.kelompok_hari || 'senin-kamis',
        });
        setJamModalOpen(true);
    };

    const closeJamModal = () => {
        setJamModalOpen(false);
        setEditingJam(null);
        jamForm.clearErrors();
        jamForm.reset();
    };

    const submitJam = (e) => {
        e.preventDefault();
        if (editingJam) {
            jamForm.patch(route('jam-pelajaran.update', editingJam.id), {
                preserveScroll: true,
                onSuccess: () => closeJamModal(),
            });
        } else {
            jamForm.post(route('jam-pelajaran.store'), {
                preserveScroll: true,
                onSuccess: () => closeJamModal(),
            });
        }
    };

    // Delete Handlers
    const confirmDelete = (type, item) => {
        setDeleteModal({
            open: true,
            type,
            item,
        });
    };

    const closeDeleteModal = () => {
        setDeleteModal({
            open: false,
            type: null,
            item: null,
        });
    };

    const handleDelete = () => {
        const { type, item } = deleteModal;
        if (!item) return;

        if (type === 'mapel') {
            router.delete(route('mapel.destroy', item.id), {
                preserveScroll: true,
                onSuccess: () => closeDeleteModal(),
            });
        } else if (type === 'jam') {
            router.delete(route('jam-pelajaran.destroy', item.id), {
                preserveScroll: true,
                onSuccess: () => closeDeleteModal(),
            });
        }
    };

    // Filtered Mapel
    const filteredMapel = useMemo(() => {
        return mapel.filter((item) => {
            const kode = (item.kode || item.kode_mapel || '').toLowerCase();
            const nama = (item.nama || item.nama_mapel || '').toLowerCase();
            const kelompok = item.kelompok_kurikulum || '';

            const matchesSearch =
                !searchMapel ||
                kode.includes(searchMapel.toLowerCase()) ||
                nama.includes(searchMapel.toLowerCase());

            const matchesKelompok =
                kelompokFilter === 'all' || kelompok.includes(kelompokFilter);

            return matchesSearch && matchesKelompok;
        });
    }, [mapel, searchMapel, kelompokFilter]);

    // Filtered & Sorted Jam Pelajaran
    const filteredJam = useMemo(() => {
        return jamPelajaran
            .filter((slot) => slot.kelompok_hari === dayFilter)
            .sort((a, b) => (a.jam_ke || 0) - (b.jam_ke || 0));
    }, [jamPelajaran, dayFilter]);

    // Build slot rows with automatic break detection
    const slotRowsWithBreaks = useMemo(() => {
        const rows = [];
        let breakCounter = 1;

        for (let i = 0; i < filteredJam.length; i++) {
            const currentSlot = filteredJam[i];
            rows.push({ type: 'slot', data: currentSlot });

            if (i < filteredJam.length - 1) {
                const nextSlot = filteredJam[i + 1];
                const currentEndMin = timeToMinutes(
                    currentSlot.selesai || currentSlot.waktu_selesai,
                );
                const nextStartMin = timeToMinutes(
                    nextSlot.mulai || nextSlot.waktu_mulai,
                );

                if (nextStartMin > currentEndMin) {
                    const diffMin = nextStartMin - currentEndMin;
                    rows.push({
                        type: 'break',
                        title: `Istirahat ${breakCounter++}`,
                        timeRange: `${formatTime(currentSlot.selesai)} - ${formatTime(nextSlot.mulai)}`,
                        duration: `${diffMin} Menit Jeda`,
                        kelompokHari:
                            dayFilter === 'senin-kamis'
                                ? 'Senin - Kamis'
                                : 'Jumat',
                    });
                }
            }
        }
        return rows;
    }, [filteredJam, dayFilter]);

    const getKelompokBadgeClass = (kelompok) => {
        if (!kelompok)
            return 'bg-emerald-50 text-emerald-800 border-emerald-200/60';
        if (kelompok.includes('Kelompok B')) {
            return 'bg-blue-50 text-blue-800 border-blue-200/60';
        }
        if (kelompok.includes('Muatan Lokal')) {
            return 'bg-purple-50 text-purple-800 border-purple-200/60';
        }
        return 'bg-emerald-50 text-emerald-800 border-emerald-200/60';
    };

    return (
        <div className="bg-surface font-sans text-body-md text-on-surface antialiased min-h-screen">
            <Head title="Master Mapel & Jam Pelajaran - Admin" />

            {/* Mobile Backdrop Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Left Sidebar */}
            <aside
                className={`fixed left-0 top-0 h-screen w-64 border-r border-white/10 z-50 flex flex-col justify-between overflow-y-auto text-white transition-transform duration-300 ease-in-out lg:translate-x-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
                style={{
                    backgroundColor: 'rgb(20, 53, 39)',
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                }}
            >
                <div className="flex flex-col">
                    {/* Brand Header */}
                    <div className="h-16 px-4 sm:px-space-lg flex items-center justify-between border-b border-white/10">
                        <div className="flex items-center gap-space-md min-w-0">
                            <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                                style={{
                                    backgroundColor: 'rgb(234, 243, 238)',
                                    color: 'rgb(20, 53, 39)',
                                }}
                            >
                                <span className="material-symbols-outlined text-[20px]">
                                    school
                                </span>
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-white tracking-tight truncate font-bold text-sm">
                                    SMPN 2 SOREANG
                                </span>
                                <span className="text-xs text-primary-fixed-dim truncate">
                                    Sistem Informasi Akademik
                                </span>
                            </div>
                        </div>

                        {/* Mobile Close Sidebar Button */}
                        <button
                            type="button"
                            className="lg:hidden p-1.5 text-primary-fixed-dim hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                            onClick={() => setSidebarOpen(false)}
                            aria-label="Tutup Menu"
                        >
                            <span className="material-symbols-outlined text-[20px]">
                                close
                            </span>
                        </button>
                    </div>

                    {/* Navigation Menu */}
                    <div className="px-space-md py-space-md">
                        <div className="px-space-sm pb-space-xs text-xs text-primary-fixed-dim/80 uppercase tracking-wider font-semibold">
                            Utama
                        </div>
                        <nav className="flex flex-col gap-space-xs">
                            <Link
                                href={route('dashboard')}
                                className="flex items-center gap-space-md px-space-md py-space-sm rounded-xl text-primary-fixed-dim hover:bg-white/10 hover:text-white transition-colors text-sm"
                            >
                                <span className="material-symbols-outlined text-[20px]">
                                    dashboard
                                </span>
                                <span>Dashboard</span>
                            </Link>
                        </nav>
                    </div>

                    <div className="px-space-md py-space-xs">
                        <div className="px-space-sm pb-space-xs text-xs text-primary-fixed-dim/80 uppercase tracking-wider font-semibold">
                            Kesiswaan & SDM
                        </div>
                        <nav className="flex flex-col gap-space-xs">
                            <Link
                                href={route('users.index')}
                                className="flex items-center gap-space-md px-space-md py-space-sm rounded-xl text-primary-fixed-dim hover:bg-white/10 hover:text-white transition-colors text-sm"
                            >
                                <span className="material-symbols-outlined text-[20px]">
                                    badge
                                </span>
                                <span>Data Guru & Staff</span>
                            </Link>
                            <Link
                                href={route('kelas.index')}
                                className="flex items-center gap-space-md px-space-md py-space-sm rounded-xl text-primary-fixed-dim hover:bg-white/10 hover:text-white transition-colors text-sm"
                            >
                                <span className="material-symbols-outlined text-[20px]">
                                    meeting_room
                                </span>
                                <span>Kelas & Rombel</span>
                            </Link>
                            <Link
                                href={route('tahun-ajaran.index')}
                                className="flex items-center gap-space-md px-space-md py-space-sm rounded-xl text-primary-fixed-dim hover:bg-white/10 hover:text-white transition-colors text-sm"
                            >
                                <span className="material-symbols-outlined text-[20px]">
                                    date_range
                                </span>
                                <span>Tahun Ajaran</span>
                            </Link>
                        </nav>
                    </div>

                    <div className="px-space-md py-space-xs">
                        <div className="px-space-sm pb-space-xs text-xs text-primary-fixed-dim/80 uppercase tracking-wider font-semibold">
                            Kurikulum & KBM
                        </div>
                        <nav className="flex flex-col gap-space-xs">
                            <Link
                                aria-current="page"
                                href={route('mapel.index')}
                                className="flex items-center gap-space-md px-space-md py-space-sm transition-colors rounded-xl shadow-sm border text-sm font-semibold text-white"
                                style={{
                                    backgroundColor: 'rgb(30, 74, 54)',
                                    borderColor: 'rgba(142, 199, 172, 0.25)',
                                }}
                            >
                                <span className="material-symbols-outlined text-[20px]">
                                    menu_book
                                </span>
                                <span>Mata Pelajaran & Jam</span>
                            </Link>
                        </nav>
                    </div>

                    <div className="px-space-md py-space-xs">
                        <div className="px-space-sm pb-space-xs text-xs text-primary-fixed-dim/80 uppercase tracking-wider font-semibold">
                            Tata Usaha & Konten
                        </div>
                        <nav className="flex flex-col gap-space-xs">
                            <Link
                                href={route('admin.berita.index')}
                                className="flex items-center gap-space-md px-space-md py-space-sm rounded-xl text-primary-fixed-dim hover:bg-white/10 hover:text-white transition-colors text-sm"
                            >
                                <span className="material-symbols-outlined text-[20px]">
                                    newspaper
                                </span>
                                <span>Manajemen Berita</span>
                            </Link>
                        </nav>
                    </div>
                </div>

                {/* Footer Active Academic Year Badge */}
                <div className="p-space-md border-t border-white/10">
                    <div className="p-space-sm rounded-xl bg-white/10 border border-white/15 flex items-center justify-between">
                        <div className="flex flex-col min-w-0">
                            <span className="text-[11px] text-primary-fixed-dim font-medium">
                                Tahun Ajaran
                            </span>
                            <span className="text-xs text-white font-semibold truncate">
                                {tahunAjaranAktif
                                    ? `${tahunAjaranAktif.nama} ${tahunAjaranAktif.semester}`
                                    : '2024/2025 Genap'}
                            </span>
                        </div>
                        <span
                            className="px-2 py-0.5 rounded-full text-[10px] uppercase font-semibold shadow-xs"
                            style={{
                                backgroundColor: 'rgb(36, 87, 64)',
                                color: 'rgb(225, 245, 235)',
                                border: '1px solid rgba(255, 255, 255, 0.12)',
                            }}
                        >
                            {tahunAjaranAktif?.aktif ? 'Aktif' : 'Aktif'}
                        </span>
                    </div>
                </div>
            </aside>

            {/* Main Area */}
            <div className="pl-0 lg:pl-64 transition-all duration-300">
                {/* Header Bar */}
                <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant/40 z-30 px-4 sm:px-6 flex items-center justify-between gap-2 sm:gap-4">
                    {/* Left side: Hamburger + Search */}
                    <div className="flex items-center gap-2 sm:gap-4 flex-1 max-w-md">
                        <button
                            type="button"
                            className="lg:hidden p-2 rounded-xl text-secondary hover:text-on-surface hover:bg-surface-container transition-colors shrink-0"
                            onClick={() => setSidebarOpen(true)}
                            aria-label="Buka Menu"
                        >
                            <span className="material-symbols-outlined text-[22px]">
                                menu
                            </span>
                        </button>

                        <div className="relative w-full">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                                search
                            </span>
                            <input
                                className="w-full h-9 sm:h-10 pl-9 pr-3 bg-surface-container-low border border-outline-variant rounded-xl text-xs sm:text-sm text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all"
                                placeholder="Cari kode/mapel..."
                                type="text"
                                value={searchMapel}
                                onChange={(e) => setSearchMapel(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Right side: User Profile & Actions */}
                    <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                        <div className="hidden sm:flex items-center gap-1 text-on-surface-variant">
                            <button
                                aria-label="Pemberitahuan"
                                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-surface-container hover:text-on-surface transition-colors"
                            >
                                <span className="material-symbols-outlined text-[20px]">
                                    notifications
                                </span>
                            </button>
                            <button
                                aria-label="Bantuan"
                                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-surface-container hover:text-on-surface transition-colors"
                            >
                                <span className="material-symbols-outlined text-[20px]">
                                    help_outline
                                </span>
                            </button>
                            <div className="h-6 w-px bg-outline-variant/40 mx-1"></div>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="hidden md:flex flex-col text-right">
                                <span className="text-xs text-on-surface font-semibold leading-tight">
                                    {user.nama}
                                </span>
                                <span className="text-[11px] text-secondary capitalize">
                                    {user.role === 'admin'
                                        ? 'Kepala Tata Usaha / Admin'
                                        : user.role}
                                </span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary shrink-0">
                                <span className="material-symbols-outlined text-[18px]">
                                    person
                                </span>
                            </div>
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                title="Keluar Akun"
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-secondary hover:text-error hover:bg-error-container/30 transition-colors shrink-0"
                            >
                                <span className="material-symbols-outlined text-[18px]">
                                    logout
                                </span>
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Main Content (Padded for Mobile & Desktop: p-4 sm:p-6 lg:p-8) */}
                <main className="relative pt-16 w-full p-4 sm:p-6 lg:p-8 min-h-screen bg-surface">
                    <div className="flex flex-col w-full pb-16 pt-2 sm:pt-4">
                        {/* Flash message */}
                        {flash?.message && (
                            <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 sm:p-4 text-xs sm:text-sm text-emerald-800 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-emerald-600 text-[18px] sm:text-[20px]">
                                        check_circle
                                    </span>
                                    <span>{flash.message}</span>
                                </div>
                            </div>
                        )}

                        {/* Top Navigation & Breadcrumbs */}
                        <div className="flex flex-col gap-1.5 sm:gap-space-xs mb-4 sm:mb-6">
                            <div className="flex items-center gap-1 sm:gap-space-xs text-[11px] sm:text-xs text-secondary overflow-x-auto whitespace-nowrap">
                                <span className="hover:text-primary transition-colors cursor-pointer">
                                    Admin
                                </span>
                                <span className="material-symbols-outlined text-[12px] sm:text-[14px]">
                                    chevron_right
                                </span>
                                <span className="hover:text-primary transition-colors cursor-pointer">
                                    Master Data
                                </span>
                                <span className="material-symbols-outlined text-[12px] sm:text-[14px]">
                                    chevron_right
                                </span>
                                <span className="text-on-surface font-semibold">
                                    Mapel & Jam Pelajaran
                                </span>
                            </div>

                            {/* 1. Header Halaman: Hanya Judul Utama (Tanpa Sub-title) & Metrik Ringkas */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mt-1">
                                <div>
                                    <h1 className="text-xl sm:text-2xl font-bold text-on-surface tracking-tight">
                                        Master Mapel & Jam Pelajaran
                                    </h1>
                                </div>

                                {/* Quick Metrics Summary Badge Group */}
                                <div className="grid grid-cols-2 sm:flex items-center gap-2 sm:gap-3">
                                    <div className="bg-surface-container-lowest p-2.5 sm:px-space-md sm:py-space-sm rounded-xl border border-outline-variant/40 flex items-center gap-2 sm:gap-space-md shadow-sm">
                                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary-fixed/40 text-primary flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-[16px] sm:text-[18px]">
                                                menu_book
                                            </span>
                                        </div>
                                        <div>
                                            <div className="text-[10px] sm:text-[11px] text-secondary uppercase font-semibold">
                                                Total Mapel
                                            </div>
                                            <div className="text-sm sm:text-base font-bold text-on-surface leading-none">
                                                {mapel.length} Matpel
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-surface-container-lowest p-2.5 sm:px-space-md sm:py-space-sm rounded-xl border border-outline-variant/40 flex items-center gap-2 sm:gap-space-md shadow-sm">
                                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-secondary-fixed/50 text-secondary flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-[16px] sm:text-[18px]">
                                                schedule
                                            </span>
                                        </div>
                                        <div>
                                            <div className="text-[10px] sm:text-[11px] text-secondary uppercase font-semibold">
                                                Slot Aktif
                                            </div>
                                            <div className="text-sm sm:text-base font-bold text-on-surface leading-none">
                                                {filteredJam.length} Slot/Hari
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Tab Switcher: Segmented Pill Control */}
                        <div className="mb-4 sm:mb-6">
                            <div
                                className="w-full sm:w-auto inline-flex bg-slate-100 p-1.5 rounded-xl border border-slate-200 gap-1"
                                role="tablist"
                            >
                                <button
                                    type="button"
                                    className={
                                        activeTab === 'mapel'
                                            ? 'bg-white text-emerald-700 font-semibold shadow-sm rounded-lg px-4 py-2.5 transition-all flex items-center justify-center gap-2 flex-1 sm:flex-none'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 font-medium rounded-lg px-4 py-2.5 transition-all flex items-center justify-center gap-2 cursor-pointer flex-1 sm:flex-none'
                                    }
                                    onClick={() => setActiveTab('mapel')}
                                >
                                    <span className="material-symbols-outlined text-[18px]">
                                        auto_stories
                                    </span>
                                    <span>Mata Pelajaran</span>
                                </button>
                                <button
                                    type="button"
                                    className={
                                        activeTab === 'jam'
                                            ? 'bg-white text-emerald-700 font-semibold shadow-sm rounded-lg px-4 py-2.5 transition-all flex items-center justify-center gap-2 flex-1 sm:flex-none'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 font-medium rounded-lg px-4 py-2.5 transition-all flex items-center justify-center gap-2 cursor-pointer flex-1 sm:flex-none'
                                    }
                                    onClick={() => setActiveTab('jam')}
                                >
                                    <span className="material-symbols-outlined text-[18px]">
                                        timelapse
                                    </span>
                                    <span>Jam Pelajaran (Slot KBM)</span>
                                    <span className="px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold bg-slate-200/80 text-slate-700 rounded-full">
                                        {filteredJam.length} Slot
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* TAB 1: MATA PELAJARAN */}
                        {activeTab === 'mapel' && (
                            <section className="flex flex-col gap-4 sm:gap-6">
                                {/* Top Action Bar */}
                                <div className="bg-surface-container-lowest p-3 sm:p-4 rounded-xl border border-outline-variant/40 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-sm">
                                    <div className="flex flex-col sm:flex-row flex-1 items-stretch sm:items-center gap-3 w-full sm:max-w-xl">
                                        <div className="relative flex-1">
                                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                                                search
                                            </span>
                                            <input
                                                className="w-full h-10 pl-9 pr-3 bg-surface-container-low border border-outline-variant/60 rounded-lg text-xs sm:text-sm text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all"
                                                placeholder="Cari kode atau nama mata pelajaran..."
                                                type="text"
                                                value={searchMapel}
                                                onChange={(e) =>
                                                    setSearchMapel(
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="relative w-full sm:w-56">
                                            <select
                                                className="w-full h-10 px-3 pr-8 bg-surface-container-low border border-outline-variant/60 rounded-lg text-xs sm:text-sm text-on-surface appearance-none focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all cursor-pointer"
                                                value={kelompokFilter}
                                                onChange={(e) =>
                                                    setKelompokFilter(
                                                        e.target.value,
                                                    )
                                                }
                                            >
                                                <option value="all">
                                                    Semua Kelompok
                                                </option>
                                                <option value="Kelompok A (Wajib)">
                                                    Kelompok A (Wajib)
                                                </option>
                                                <option value="Kelompok B (Pilihan/Seni)">
                                                    Kelompok B (Pilihan/Seni)
                                                </option>
                                                <option value="Muatan Lokal Jawa Barat">
                                                    Muatan Lokal Jawa Barat
                                                </option>
                                            </select>
                                            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none">
                                                expand_more
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center shrink-0">
                                        <button
                                            className="w-full sm:w-auto h-10 px-4 bg-primary-container hover:bg-primary text-on-primary text-xs sm:text-sm font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                                            onClick={openCreateMapel}
                                        >
                                            <span className="material-symbols-outlined text-[18px]">
                                                add
                                            </span>
                                            <span>Tambah Mapel</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Mapel Table Wrapped in overflow-x-auto */}
                                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 overflow-hidden shadow-sm">
                                    <div className="overflow-x-auto w-full">
                                        <table className="w-full text-left border-collapse min-w-[640px]">
                                            <thead>
                                                <tr className="bg-surface-container-low border-b border-outline-variant/40">
                                                    <th
                                                        className="py-3 px-3 sm:py-space-md sm:px-space-lg text-xs text-secondary uppercase tracking-wider font-semibold w-32 sm:w-36"
                                                        scope="col"
                                                    >
                                                        Kode Mapel
                                                    </th>
                                                    <th
                                                        className="py-3 px-3 sm:py-space-md sm:px-space-lg text-xs text-secondary uppercase tracking-wider font-semibold"
                                                        scope="col"
                                                    >
                                                        Nama Mata Pelajaran
                                                    </th>
                                                    <th
                                                        className="py-3 px-3 sm:py-space-md sm:px-space-lg text-xs text-secondary uppercase tracking-wider font-semibold"
                                                        scope="col"
                                                    >
                                                        Guru Pengampu
                                                    </th>
                                                    <th
                                                        className="py-3 px-3 sm:py-space-md sm:px-space-lg text-xs text-secondary uppercase tracking-wider font-semibold w-56 sm:w-72"
                                                        scope="col"
                                                    >
                                                        Kelompok Kurikulum
                                                    </th>
                                                    <th
                                                        className="py-3 px-3 sm:py-space-md sm:px-space-lg text-xs text-secondary uppercase tracking-wider font-semibold w-24 sm:w-28 text-center"
                                                        scope="col"
                                                    >
                                                        Aksi
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-outline-variant/20 text-xs sm:text-sm text-on-surface">
                                                {filteredMapel.length === 0 ? (
                                                    <tr>
                                                        <td
                                                            colSpan="5"
                                                            className="py-10 text-center text-secondary text-xs sm:text-sm"
                                                        >
                                                            Tidak ada mata
                                                            pelajaran yang cocok
                                                            dengan pencarian.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredMapel.map(
                                                        (item) => {
                                                            const teachers =
                                                                item
                                                                    .jadwal_slot
                                                                    ?.map(
                                                                        (s) =>
                                                                            s.guru,
                                                                    )
                                                                    .filter(
                                                                        Boolean,
                                                                    ) || [];
                                                            const uniqueTeachers =
                                                                Array.from(
                                                                    new Map(
                                                                        teachers.map(
                                                                            (
                                                                                g,
                                                                            ) => [
                                                                                g.id,
                                                                                g,
                                                                            ],
                                                                        ),
                                                                    ).values(),
                                                                );

                                                            return (
                                                                <tr
                                                                    key={
                                                                        item.id
                                                                    }
                                                                    className="hover:bg-surface-container-low/50 transition-colors"
                                                                >
                                                                    <td className="py-3 px-3 sm:py-space-md sm:px-space-lg whitespace-nowrap">
                                                                        <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded bg-surface-container font-mono text-[11px] sm:text-[12px] font-semibold text-primary border border-outline-variant/30">
                                                                            {item.kode ||
                                                                                item.kode_mapel}
                                                                        </span>
                                                                    </td>
                                                                    <td className="py-3 px-3 sm:py-space-md sm:px-space-lg font-semibold text-on-surface">
                                                                        {item.nama ||
                                                                            item.nama_mapel}
                                                                    </td>
                                                                    <td className="py-3 px-3 sm:py-space-md sm:px-space-lg">
                                                                        {uniqueTeachers.length >
                                                                        0 ? (
                                                                            <div className="flex flex-wrap items-center gap-1.5">
                                                                                {uniqueTeachers.map(
                                                                                    (
                                                                                        g,
                                                                                    ) => (
                                                                                        <div
                                                                                            key={
                                                                                                g.id
                                                                                            }
                                                                                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-surface-container-low border border-outline-variant/40"
                                                                                        >
                                                                                            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-primary-fixed/60 text-primary flex items-center justify-center font-bold text-[9px] sm:text-[10px] shrink-0">
                                                                                                {getInitials(
                                                                                                    g.nama,
                                                                                                )}
                                                                                            </div>
                                                                                            <span className="text-[11px] sm:text-xs font-medium text-on-surface truncate max-w-[120px] sm:max-w-none">
                                                                                                {
                                                                                                    g.nama
                                                                                                }
                                                                                            </span>
                                                                                        </div>
                                                                                    ),
                                                                                )}
                                                                            </div>
                                                                        ) : (
                                                                            <span className="text-[11px] sm:text-xs text-secondary italic">
                                                                                Belum
                                                                                ditugaskan
                                                                            </span>
                                                                        )}
                                                                    </td>
                                                                    <td className="py-3 px-3 sm:py-space-md sm:px-space-lg text-secondary">
                                                                        <span
                                                                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium border ${getKelompokBadgeClass(item.kelompok_kurikulum)}`}
                                                                        >
                                                                            {item.kelompok_kurikulum ||
                                                                                'Kelompok A (Wajib)'}
                                                                        </span>
                                                                    </td>
                                                                    <td className="py-3 px-3 sm:py-space-md sm:px-space-lg text-center whitespace-nowrap">
                                                                        <div className="inline-flex items-center gap-1 justify-center">
                                                                            <button
                                                                                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-secondary hover:text-primary hover:bg-emerald-50 transition-colors"
                                                                                onClick={() =>
                                                                                    openEditMapel(
                                                                                        item,
                                                                                    )
                                                                                }
                                                                                title="Ubah Data"
                                                                            >
                                                                                <span className="material-symbols-outlined text-[16px] sm:text-[18px]">
                                                                                    edit
                                                                                </span>
                                                                            </button>
                                                                            <button
                                                                                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-secondary hover:text-error hover:bg-error-container/40 transition-colors"
                                                                                onClick={() =>
                                                                                    confirmDelete(
                                                                                        'mapel',
                                                                                        item,
                                                                                    )
                                                                                }
                                                                                title="Hapus Mapel"
                                                                            >
                                                                                <span className="material-symbols-outlined text-[16px] sm:text-[18px]">
                                                                                    delete
                                                                                </span>
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        },
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination Footer */}
                                    <div className="py-2.5 px-4 sm:py-space-sm sm:px-space-lg bg-surface-container-low border-t border-outline-variant/40 flex flex-col sm:flex-row items-center justify-between gap-2">
                                        <span className="text-[11px] sm:text-xs text-secondary text-center sm:text-left">
                                            Menampilkan{' '}
                                            <strong className="text-on-surface font-semibold">
                                                {filteredMapel.length}
                                            </strong>{' '}
                                            dari{' '}
                                            <strong className="text-on-surface font-semibold">
                                                {mapel.length}
                                            </strong>{' '}
                                            mata pelajaran
                                        </span>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* TAB 2: JAM PELAJARAN (SLOT KBM) */}
                        {activeTab === 'jam' && (
                            <section className="flex flex-col gap-4 sm:gap-6">
                                {/* Top Action Bar */}
                                <div className="bg-surface-container-lowest p-3 sm:p-4 rounded-xl border border-outline-variant/40 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-sm">
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 p-1 bg-surface-container-low rounded-lg border border-outline-variant/40 w-full sm:w-auto">
                                        <button
                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                                                dayFilter === 'senin-kamis'
                                                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                                                    : 'text-secondary hover:text-on-surface'
                                            }`}
                                            onClick={() =>
                                                setDayFilter('senin-kamis')
                                            }
                                        >
                                            <span
                                                className={`w-2 h-2 rounded-full ${
                                                    dayFilter === 'senin-kamis'
                                                        ? 'bg-primary'
                                                        : 'bg-slate-300'
                                                }`}
                                            ></span>
                                            <span>Senin - Kamis (Reguler)</span>
                                        </button>
                                        <button
                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                                                dayFilter === 'jumat'
                                                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                                                    : 'text-secondary hover:text-on-surface'
                                            }`}
                                            onClick={() =>
                                                setDayFilter('jumat')
                                            }
                                        >
                                            <span
                                                className={`w-2 h-2 rounded-full ${
                                                    dayFilter === 'jumat'
                                                        ? 'bg-primary'
                                                        : 'bg-slate-300'
                                                }`}
                                            ></span>
                                            <span>
                                                Jumat (Khotbah & Literasi)
                                            </span>
                                        </button>
                                    </div>
                                    <div className="flex items-center shrink-0">
                                        <button
                                            className="w-full sm:w-auto h-10 px-4 bg-surface-container-lowest border border-outline-variant/60 hover:bg-surface-container hover:border-primary-container text-primary text-xs sm:text-sm font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                                            onClick={openCreateJam}
                                        >
                                            <span className="material-symbols-outlined text-[18px]">
                                                add_alarm
                                            </span>
                                            <span>+ Tambah Jam</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Table of Slots Wrapped in overflow-x-auto */}
                                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 overflow-hidden shadow-sm">
                                    <div className="overflow-x-auto w-full">
                                        <table className="w-full text-left border-collapse min-w-[560px]">
                                            <thead>
                                                <tr className="bg-surface-container-low border-b border-outline-variant/40">
                                                    <th
                                                        className="py-3 px-3 sm:py-space-md sm:px-space-lg text-xs text-secondary uppercase tracking-wider font-semibold w-28 sm:w-36"
                                                        scope="col"
                                                    >
                                                        Jam Ke-
                                                    </th>
                                                    <th
                                                        className="py-3 px-3 sm:py-space-md sm:px-space-lg text-xs text-secondary uppercase tracking-wider font-semibold"
                                                        scope="col"
                                                    >
                                                        Rentang Waktu
                                                    </th>
                                                    <th
                                                        className="py-3 px-3 sm:py-space-md sm:px-space-lg text-xs text-secondary uppercase tracking-wider font-semibold w-44 sm:w-56"
                                                        scope="col"
                                                    >
                                                        Kelompok Hari
                                                    </th>
                                                    <th
                                                        className="py-3 px-3 sm:py-space-md sm:px-space-lg text-xs text-secondary uppercase tracking-wider font-semibold w-32 sm:w-40"
                                                        scope="col"
                                                    >
                                                        Status Validasi
                                                    </th>
                                                    <th
                                                        className="py-3 px-3 sm:py-space-md sm:px-space-lg text-xs text-secondary uppercase tracking-wider font-semibold w-24 sm:w-28 text-center"
                                                        scope="col"
                                                    >
                                                        Aksi
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-outline-variant/20 text-xs sm:text-sm text-on-surface">
                                                {slotRowsWithBreaks.length ===
                                                0 ? (
                                                    <tr>
                                                        <td
                                                            colSpan="5"
                                                            className="py-10 text-center text-secondary text-xs sm:text-sm"
                                                        >
                                                            Belum ada slot jam
                                                            pelajaran untuk hari{' '}
                                                            {dayFilter ===
                                                            'senin-kamis'
                                                                ? 'Senin - Kamis'
                                                                : 'Jumat'}
                                                            .
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    slotRowsWithBreaks.map(
                                                        (row, idx) => {
                                                            if (
                                                                row.type ===
                                                                'break'
                                                            ) {
                                                                return (
                                                                    <tr
                                                                        key={`break-${idx}`}
                                                                        className="bg-surface-container-low/40"
                                                                    >
                                                                        <td className="py-2.5 px-3 sm:py-space-sm sm:px-space-lg font-semibold text-secondary flex items-center gap-1.5 sm:gap-2">
                                                                            <span className="material-symbols-outlined text-[15px] sm:text-[16px] text-amber-600">
                                                                                coffee
                                                                            </span>
                                                                            <span>
                                                                                {
                                                                                    row.title
                                                                                }
                                                                            </span>
                                                                        </td>
                                                                        <td className="py-2.5 px-3 sm:py-space-sm sm:px-space-lg font-mono text-[12px] sm:text-[13px] text-secondary font-medium">
                                                                            {
                                                                                row.timeRange
                                                                            }
                                                                        </td>
                                                                        <td className="py-2.5 px-3 sm:py-space-sm sm:px-space-lg text-secondary">
                                                                            {
                                                                                row.kelompokHari
                                                                            }
                                                                        </td>
                                                                        <td className="py-2.5 px-3 sm:py-space-sm sm:px-space-lg">
                                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                                                                {
                                                                                    row.duration
                                                                                }
                                                                            </span>
                                                                        </td>
                                                                        <td className="py-2.5 px-3 sm:py-space-sm sm:px-space-lg text-center">
                                                                            <span className="text-[11px] text-secondary">
                                                                                Jeda
                                                                            </span>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            }

                                                            const slot =
                                                                row.data;
                                                            return (
                                                                <tr
                                                                    key={`slot-${slot.id}`}
                                                                    className="hover:bg-surface-container-low/50 transition-colors"
                                                                >
                                                                    <td className="py-3 px-3 sm:py-space-md sm:px-space-lg font-semibold text-on-surface">
                                                                        Jam Ke-
                                                                        {
                                                                            slot.jam_ke
                                                                        }
                                                                    </td>
                                                                    <td className="py-3 px-3 sm:py-space-md sm:px-space-lg font-mono text-[12px] sm:text-[13px] text-on-surface">
                                                                        {formatTime(
                                                                            slot.mulai ||
                                                                                slot.waktu_mulai,
                                                                        )}{' '}
                                                                        -{' '}
                                                                        {formatTime(
                                                                            slot.selesai ||
                                                                                slot.waktu_selesai,
                                                                        )}
                                                                    </td>
                                                                    <td className="py-3 px-3 sm:py-space-md sm:px-space-lg text-secondary capitalize">
                                                                        {slot.kelompok_hari ===
                                                                        'senin-kamis'
                                                                            ? 'Senin - Kamis'
                                                                            : 'Jumat'}
                                                                    </td>
                                                                    <td className="py-3 px-3 sm:py-space-md sm:px-space-lg">
                                                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                                                                            Aman
                                                                        </span>
                                                                    </td>
                                                                    <td className="py-3 px-3 sm:py-space-md sm:px-space-lg text-center">
                                                                        <div className="inline-flex items-center gap-1 justify-center">
                                                                            <button
                                                                                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-secondary hover:text-primary hover:bg-emerald-50 transition-colors"
                                                                                onClick={() =>
                                                                                    openEditJam(
                                                                                        slot,
                                                                                    )
                                                                                }
                                                                                title="Ubah Slot"
                                                                            >
                                                                                <span className="material-symbols-outlined text-[16px] sm:text-[18px]">
                                                                                    edit
                                                                                </span>
                                                                            </button>
                                                                            <button
                                                                                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-secondary hover:text-error hover:bg-error-container/40 transition-colors"
                                                                                onClick={() =>
                                                                                    confirmDelete(
                                                                                        'jam',
                                                                                        slot,
                                                                                    )
                                                                                }
                                                                                title="Hapus Slot"
                                                                            >
                                                                                <span className="material-symbols-outlined text-[16px] sm:text-[18px]">
                                                                                    delete
                                                                                </span>
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        },
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Footer Note for Slots */}
                                    <div className="py-2.5 px-3 sm:py-space-sm sm:px-space-lg bg-surface-container-low border-t border-outline-variant/40 flex flex-col sm:flex-row items-center justify-between gap-1 sm:gap-2 text-secondary text-[11px] sm:text-xs text-center sm:text-left">
                                        <span className="flex items-center gap-1.5 justify-center sm:justify-start">
                                            <span className="material-symbols-outlined text-[15px] sm:text-[16px] text-primary">
                                                verified
                                            </span>
                                            Semua slot sinkron dengan Kalender
                                            Akademik SMPN 2 Soreang
                                        </span>
                                        <span className="font-mono text-[10px] sm:text-xs">
                                            Durasi Jam: 40 Menit
                                        </span>
                                    </div>
                                </div>
                            </section>
                        )}
                    </div>
                </main>
            </div>

            {/* 3. KOMPONEN MODAL: TAMBAH / UBAH MATA PELAJARAN */}
            {mapelModalOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto transition-opacity"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) closeMapelModal();
                    }}
                >
                    <div className="w-full max-w-lg bg-white rounded-2xl p-5 sm:p-6 shadow-xl max-h-[90vh] flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100 shrink-0">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-[20px]">
                                        post_add
                                    </span>
                                </div>
                                <h2 className="text-base sm:text-lg font-bold text-slate-800 truncate">
                                    {editingMapel
                                        ? `Ubah Mapel: ${editingMapel.kode || editingMapel.kode_mapel}`
                                        : 'Tambah Mata Pelajaran'}
                                </h2>
                            </div>
                            <button
                                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
                                onClick={closeMapelModal}
                                type="button"
                                aria-label="Tutup"
                            >
                                <span className="material-symbols-outlined text-[20px]">
                                    close
                                </span>
                            </button>
                        </div>

                        {/* Form Body (w-full space-y-4) */}
                        <form
                            onSubmit={submitMapel}
                            className="flex flex-col flex-1 overflow-hidden"
                        >
                            <div className="w-full space-y-4 overflow-y-auto py-4 pr-1 flex-1">
                                {/* Kode Mapel */}
                                <div className="flex flex-col gap-1.5">
                                    <label
                                        className="text-xs font-semibold text-slate-700"
                                        htmlFor="input-kode"
                                    >
                                        Kode Mapel
                                    </label>
                                    <input
                                        id="input-kode"
                                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all"
                                        placeholder="contoh: MAT-01"
                                        required
                                        type="text"
                                        value={mapelForm.data.kode}
                                        onChange={(e) =>
                                            mapelForm.setData(
                                                'kode',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={
                                            mapelForm.errors.kode ||
                                            mapelForm.errors.kode_mapel
                                        }
                                    />
                                </div>

                                {/* Nama Mapel */}
                                <div className="flex flex-col gap-1.5">
                                    <label
                                        className="text-xs font-semibold text-slate-700"
                                        htmlFor="input-nama"
                                    >
                                        Nama Mata Pelajaran
                                    </label>
                                    <input
                                        id="input-nama"
                                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all"
                                        placeholder="contoh: Pendidikan Pancasila"
                                        required
                                        type="text"
                                        value={mapelForm.data.nama}
                                        onChange={(e) =>
                                            mapelForm.setData(
                                                'nama',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={
                                            mapelForm.errors.nama ||
                                            mapelForm.errors.nama_mapel
                                        }
                                    />
                                </div>

                                {/* Kelompok Kurikulum: Opsi bertumpuk vertikal (flex flex-col gap-2) */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-slate-700">
                                        Kelompok Kurikulum
                                    </label>
                                    <div className="flex flex-col gap-2">
                                        {KELOMPOK_OPTIONS.map((opt) => (
                                            <label
                                                key={opt}
                                                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                                    mapelForm.data
                                                        .kelompok_kurikulum ===
                                                    opt
                                                        ? 'border-emerald-600 bg-emerald-50/60 text-emerald-900 font-semibold'
                                                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="kelompok_kurikulum"
                                                    value={opt}
                                                    checked={
                                                        mapelForm.data
                                                            .kelompok_kurikulum ===
                                                        opt
                                                    }
                                                    onChange={(e) =>
                                                        mapelForm.setData(
                                                            'kelompok_kurikulum',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300"
                                                />
                                                <span className="text-xs sm:text-sm">
                                                    {opt}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                    <InputError
                                        message={
                                            mapelForm.errors.kelompok_kurikulum
                                        }
                                    />
                                </div>

                                {/* Guru Pengampu (Utama) */}
                                <div className="flex flex-col gap-1.5">
                                    <label
                                        className="text-xs font-semibold text-slate-700"
                                        htmlFor="select-guru"
                                    >
                                        Guru Pengampu (Utama)
                                    </label>
                                    <div className="relative">
                                        <select
                                            id="select-guru"
                                            className="w-full h-10 px-3 pr-8 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 appearance-none focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all cursor-pointer"
                                            value={mapelForm.data.guru_pengampu}
                                            onChange={(e) =>
                                                mapelForm.setData(
                                                    'guru_pengampu',
                                                    e.target.value,
                                                )
                                            }
                                        >
                                            <option value="">
                                                -- Pilih Guru Pengampu --
                                            </option>
                                            {gurus.map((g) => (
                                                <option
                                                    key={g.id}
                                                    value={g.nama}
                                                >
                                                    {g.nama}
                                                </option>
                                            ))}
                                        </select>
                                        <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px] pointer-events-none">
                                            expand_more
                                        </span>
                                    </div>
                                </div>

                                {/* Alokasi Beban (JP/Minggu) */}
                                <div className="flex flex-col gap-1.5">
                                    <label
                                        className="text-xs font-semibold text-slate-700"
                                        htmlFor="input-beban"
                                    >
                                        Alokasi Beban (JP/Minggu)
                                    </label>
                                    <input
                                        id="input-beban"
                                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all"
                                        max="10"
                                        min="1"
                                        type="number"
                                        value={mapelForm.data.beban_jam}
                                        onChange={(e) =>
                                            mapelForm.setData(
                                                'beban_jam',
                                                Number(e.target.value),
                                            )
                                        }
                                    />
                                </div>
                            </div>

                            {/* Footer Tombol Aksi: flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 mt-6 */}
                            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 mt-6 pt-3 sm:pt-4 border-t border-slate-100 shrink-0">
                                <button
                                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs sm:text-sm font-semibold transition-colors justify-center flex items-center"
                                    onClick={closeMapelModal}
                                    type="button"
                                >
                                    Batal
                                </button>
                                <button
                                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold transition-colors shadow-sm disabled:opacity-50 justify-center flex items-center"
                                    disabled={mapelForm.processing}
                                    type="submit"
                                >
                                    <span>+ Simpan</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 3. KOMPONEN MODAL: TAMBAH / UBAH SLOT JAM PELAJARAN */}
            {jamModalOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto transition-opacity"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) closeJamModal();
                    }}
                >
                    <div className="w-full max-w-lg bg-white rounded-2xl p-5 sm:p-6 shadow-xl max-h-[90vh] flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100 shrink-0">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-[20px]">
                                        alarm_add
                                    </span>
                                </div>
                                <h2 className="text-base sm:text-lg font-bold text-slate-800 truncate">
                                    {editingJam
                                        ? `Ubah Slot: Jam Ke-${editingJam.jam_ke} (${editingJam.kelompok_hari})`
                                        : 'Tambah Slot Jam Pelajaran'}
                                </h2>
                            </div>
                            <button
                                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
                                onClick={closeJamModal}
                                type="button"
                                aria-label="Tutup"
                            >
                                <span className="material-symbols-outlined text-[20px]">
                                    close
                                </span>
                            </button>
                        </div>

                        {/* Form Body (w-full space-y-4) */}
                        <form
                            onSubmit={submitJam}
                            className="flex flex-col flex-1 overflow-hidden"
                        >
                            <div className="w-full space-y-4 overflow-y-auto py-4 pr-1 flex-1">
                                {/* Overlap / General Error Alert */}
                                {(jamForm.errors.mulai ||
                                    jamForm.errors.selesai) && (
                                    <div className="p-3 rounded-xl bg-error-container/40 border border-error/20 text-xs text-error flex items-start gap-2">
                                        <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">
                                            error
                                        </span>
                                        <div>
                                            {jamForm.errors.mulai && (
                                                <p>{jamForm.errors.mulai}</p>
                                            )}
                                            {jamForm.errors.selesai && (
                                                <p>{jamForm.errors.selesai}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Kelompok Hari: Opsi bertumpuk vertikal (flex flex-col gap-2) */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-slate-700">
                                        Kelompok Hari
                                    </label>
                                    <div className="flex flex-col gap-2">
                                        {[
                                            {
                                                val: 'senin-kamis',
                                                label: 'Senin - Kamis (Reguler)',
                                            },
                                            {
                                                val: 'jumat',
                                                label: 'Jumat (Khotbah & Literasi)',
                                            },
                                        ].map((item) => (
                                            <label
                                                key={item.val}
                                                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                                    jamForm.data
                                                        .kelompok_hari ===
                                                    item.val
                                                        ? 'border-emerald-600 bg-emerald-50/60 text-emerald-900 font-semibold'
                                                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="kelompok_hari"
                                                    value={item.val}
                                                    checked={
                                                        jamForm.data
                                                            .kelompok_hari ===
                                                        item.val
                                                    }
                                                    onChange={(e) =>
                                                        jamForm.setData(
                                                            'kelompok_hari',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300"
                                                />
                                                <span className="text-xs sm:text-sm">
                                                    {item.label}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                    <InputError
                                        message={jamForm.errors.kelompok_hari}
                                    />
                                </div>

                                {/* Jam Ke- */}
                                <div className="flex flex-col gap-1.5">
                                    <label
                                        className="text-xs font-semibold text-slate-700"
                                        htmlFor="input-jam-ke"
                                    >
                                        Jam Ke-
                                    </label>
                                    <input
                                        id="input-jam-ke"
                                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all"
                                        min="1"
                                        max="20"
                                        required
                                        type="number"
                                        value={jamForm.data.jam_ke}
                                        onChange={(e) =>
                                            jamForm.setData(
                                                'jam_ke',
                                                Number(e.target.value),
                                            )
                                        }
                                    />
                                    <InputError
                                        message={jamForm.errors.jam_ke}
                                    />
                                </div>

                                {/* Rentang Waktu: Mulai & Selesai */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-space-md">
                                    <div className="flex flex-col gap-1.5">
                                        <label
                                            className="text-xs font-semibold text-slate-700"
                                            htmlFor="input-mulai"
                                        >
                                            Waktu Mulai
                                        </label>
                                        <input
                                            id="input-mulai"
                                            className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all"
                                            required
                                            type="time"
                                            value={jamForm.data.mulai}
                                            onChange={(e) =>
                                                jamForm.setData(
                                                    'mulai',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label
                                            className="text-xs font-semibold text-slate-700"
                                            htmlFor="input-selesai"
                                        >
                                            Waktu Selesai
                                        </label>
                                        <input
                                            id="input-selesai"
                                            className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all"
                                            required
                                            type="time"
                                            value={jamForm.data.selesai}
                                            onChange={(e) =>
                                                jamForm.setData(
                                                    'selesai',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Footer Tombol Aksi: flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 mt-6 */}
                            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 mt-6 pt-3 sm:pt-4 border-t border-slate-100 shrink-0">
                                <button
                                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs sm:text-sm font-semibold transition-colors justify-center flex items-center"
                                    onClick={closeJamModal}
                                    type="button"
                                >
                                    Batal
                                </button>
                                <button
                                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold transition-colors shadow-sm disabled:opacity-50 justify-center flex items-center"
                                    disabled={jamForm.processing}
                                    type="submit"
                                >
                                    <span>+ Simpan Slot</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 3. KOMPONEN MODAL: KONFIRMASI HAPUS */}
            {deleteModal.open && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto transition-opacity"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) closeDeleteModal();
                    }}
                >
                    <div className="w-full max-w-lg bg-white rounded-2xl p-5 sm:p-6 shadow-xl max-h-[90vh] flex flex-col">
                        <div className="flex items-center gap-3 text-error mb-3 sm:mb-4">
                            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-[24px]">
                                    warning
                                </span>
                            </div>
                            <div>
                                <h3 className="font-bold text-base sm:text-lg text-slate-800">
                                    Konfirmasi Hapus Data
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Tindakan ini tidak dapat dibatalkan.
                                </p>
                            </div>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-600 my-2">
                            {deleteModal.type === 'mapel' &&
                                `Apakah Anda yakin ingin menghapus mata pelajaran "${deleteModal.item?.nama || deleteModal.item?.nama_mapel}" (${deleteModal.item?.kode || deleteModal.item?.kode_mapel})?`}
                            {deleteModal.type === 'jam' &&
                                `Apakah Anda yakin ingin menghapus slot Jam Ke-${deleteModal.item?.jam_ke} (${deleteModal.item?.kelompok_hari})?`}
                        </p>

                        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 mt-6 pt-3 sm:pt-4 border-t border-slate-100 shrink-0">
                            <button
                                type="button"
                                onClick={closeDeleteModal}
                                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs sm:text-sm font-semibold transition-colors justify-center flex items-center"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-sm justify-center flex items-center"
                            >
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
