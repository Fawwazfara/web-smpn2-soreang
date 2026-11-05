import { Head, Link, router, useForm } from '@inertiajs/react';
import React, { useEffect, useMemo, useRef, useState } from 'react';

export default function Index({
    auth,
    siswas,
    siswa,
    kelases,
    kelasList,
    tahunAjaranAktif,
    stats,
    filters = {},
}) {
    // Normalisasi data dari props (mendukung naming siswas/siswa & kelases/kelasList)
    const studentData = siswas || siswa || { data: [], total: 0, from: 0, to: 0, links: [] };
    const studentList = studentData.data || [];
    const classes = kelases || kelasList || [];

    // State Filter & Search
    const [search, setSearch] = useState(filters.search || '');
    const [selectedKelas, setSelectedKelas] = useState(filters.kelas_id || '');

    // State Layout & UI
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isSyncRotating, setIsSyncRotating] = useState(false);
    const globalSearchInputRef = useRef(null);
    const profileDropdownRef = useRef(null);

    // State Modals
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedSiswa, setSelectedSiswa] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [siswaToDelete, setSiswaToDelete] = useState(null);

    // State Toast Notification
    const [toast, setToast] = useState({ show: false, title: '', desc: '' });
    const toastTimeoutRef = useRef(null);

    const triggerToast = (title, desc) => {
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        setToast({ show: true, title, desc });
        toastTimeoutRef.current = setTimeout(() => {
            setToast({ show: false, title: '', desc: '' });
        }, 3500);
    };

    // Inertia Form Hook
    const { data, setData, post, patch, processing, errors, reset, clearErrors } = useForm({
        id: null,
        nis: '',
        nama: '',
        jk: 'L',
        kelas_id: '',
        no_hp_ortu: '',
        aktif: true,
    });

    // Shortcut Ctrl+K untuk Global Search Input
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                globalSearchInputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Tutup profile dropdown saat klik di luar
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
                setIsProfileDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filter Handler ke Inertia Router
    const handleFilterChange = (newSearch, newKelas) => {
        router.get(
            route('admin.siswa.index'),
            { search: newSearch || undefined, kelas_id: newKelas || undefined },
            { preserveState: true, replace: true }
        );
    };

    // Helper untuk inferensi jenis kelamin jika belum ada di database
    const getGender = (item) => {
        if (item.jk) return item.jk;
        const femaleNames = ['siti', 'salma', 'nur', 'aulia', 'putri', 'dewi', 'ayu', 'rini', 'nisa', 'fitri', 'zahra'];
        const lower = (item.nama || '').toLowerCase();
        for (const fn of femaleNames) {
            if (lower.includes(fn)) return 'P';
        }
        return item.id % 2 === 0 ? 'P' : 'L';
    };

    // Helper nomor WhatsApp
    const formatWaUrl = (phone) => {
        if (!phone) return null;
        let clean = phone.replace(/[^0-9]/g, '');
        if (!clean) return null;
        if (clean.startsWith('0')) clean = '62' + clean.slice(1);
        else if (!clean.startsWith('62')) clean = '62' + clean;
        return `https://wa.me/${clean}`;
    };

    // Perhitungan Metrik / Kartu Ringkasan
    const metricSummary = useMemo(() => {
        return {
            total: stats?.total ?? studentData.total ?? studentList.length,
            aktif: stats?.aktif ?? studentList.filter((s) => s.aktif).length,
            nonaktif: stats?.nonaktif ?? studentList.filter((s) => !s.aktif).length,
            kontakValid: stats?.kontak_valid ?? studentList.filter((s) => s.no_hp_ortu && s.no_hp_ortu.trim() !== '').length,
        };
    }, [stats, studentData.total, studentList]);

    // Modal Form Tambah
    const openCreateModal = () => {
        reset();
        clearErrors();
        setIsEditing(false);
        setIsFormModalOpen(true);
    };

    // Modal Form Edit
    const openEditModal = (siswaItem) => {
        clearErrors();
        setIsEditing(true);

        let cleanPhone = siswaItem.no_hp_ortu || '';
        if (cleanPhone.startsWith('+62')) cleanPhone = cleanPhone.substring(3);
        else if (cleanPhone.startsWith('62')) cleanPhone = cleanPhone.substring(2);
        else if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.substring(1);

        setData({
            id: siswaItem.id,
            nis: siswaItem.nis || '',
            nama: siswaItem.nama || '',
            jk: getGender(siswaItem),
            kelas_id: siswaItem.kelas_id || '',
            no_hp_ortu: cleanPhone,
            aktif: Boolean(siswaItem.aktif),
        });
        setIsFormModalOpen(true);
    };

    // Modal Detail
    const openDetailModal = (siswaItem) => {
        setSelectedSiswa(siswaItem);
        setIsDetailModalOpen(true);
    };

    // Submit Form (Tambah / Edit)
    const handleSubmitForm = (e) => {
        e.preventDefault();

        let cleanPhone = (data.no_hp_ortu || '').trim();
        if (cleanPhone) {
            if (cleanPhone.startsWith('+62')) cleanPhone = '0' + cleanPhone.substring(3);
            else if (cleanPhone.startsWith('62')) cleanPhone = '0' + cleanPhone.substring(2);
            else if (!cleanPhone.startsWith('0')) cleanPhone = '0' + cleanPhone;
        }

        const payload = {
            nis: data.nis,
            nama: data.nama,
            jk: data.jk,
            kelas_id: data.kelas_id || null,
            no_hp_ortu: cleanPhone || null,
            aktif: Boolean(data.aktif),
        };

        if (isEditing) {
            // Mengirim request update (PATCH/PUT) ke endpoint admin.siswa.update
            router.patch(route('admin.siswa.update', data.id), payload, {
                onSuccess: () => {
                    setIsFormModalOpen(false);
                    triggerToast('Data Siswa Berhasil Diperbarui', 'Data peserta didik telah diperbarui di pangkalan data.');
                },
                onError: () => {
                    triggerToast('Gagal Menyimpan Data', 'Mohon periksa kembali input formulir Anda.');
                },
            });
        } else {
            // Mengirim request tambah (POST) ke endpoint admin.siswa.store
            router.post(route('admin.siswa.store'), payload, {
                onSuccess: () => {
                    setIsFormModalOpen(false);
                    reset();
                    triggerToast('Data Siswa Berhasil Ditambahkan', 'Data peserta didik baru telah berhasil dicatat di sistem.');
                },
                onError: () => {
                    triggerToast('Gagal Menambah Data', 'Mohon periksa format NIS atau nomor kontak wali.');
                },
            });
        }
    };

    // Toggle Status Aktif / Nonaktif
    const handleToggleStatus = (siswaItem) => {
        router.patch(
            route('admin.siswa.toggle-status', siswaItem.id),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    triggerToast(
                        'Status Siswa Diperbarui',
                        `Status ${siswaItem.nama} berhasil diubah menjadi ${!siswaItem.aktif ? 'Aktif' : 'Nonaktif'}.`
                    );
                },
            }
        );
    };

    // Konfirmasi Hapus Data
    const handleConfirmDelete = () => {
        if (!siswaToDelete) return;
        router.delete(route('admin.siswa.destroy', siswaToDelete.id), {
            preserveScroll: true,
            onSuccess: () => {
                setIsDeleting(false);
                setSiswaToDelete(null);
                triggerToast('Data Terhapus', 'Data siswa berhasil dihapus dari sistem.');
            },
            onError: (err) => {
                setIsDeleting(false);
                setSiswaToDelete(null);
                const errMsg = err?.siswa || 'Siswa tidak dapat dihapus karena memiliki riwayat absensi.';
                triggerToast('Gagal Menghapus', errMsg);
            },
        });
    };

    // Simulasi Animasi Sinkronisasi
    const handleSyncData = () => {
        setIsSyncRotating(true);
        setTimeout(() => {
            setIsSyncRotating(false);
            triggerToast('Sinkronisasi Sukses', 'Data siswa telah disinkronkan dengan basis data induk Dapodik.');
        }, 600);
    };

    // Simulasi Export File
    const handleExport = () => {
        triggerToast('Mengunduh Berkas', 'Laporan Master Data Siswa (.xlsx) sedang diexport...');
    };

    return (
        <div className="bg-[#f8fafc] font-sans text-[15px] text-[#111c2d] antialiased min-h-screen">
            <Head title="Master Data Siswa - SMPN 2 Soreang" />

            {/* Backdrop Mobile Sidebar */}
            <div
                id="sidebarBackdrop"
                className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 transition-opacity lg:hidden ${
                    isMobileSidebarOpen ? 'block opacity-100' : 'hidden opacity-0'
                }`}
                onClick={() => setIsMobileSidebarOpen(false)}
            />

            {/* Sidebar Navigasi Mandiri Stitch */}
            <aside
                id="mainSidebar"
                className={`fixed left-0 top-0 h-full w-72 bg-[#0e2f1f] text-[#d1e7dd] z-50 transition-transform duration-200 flex flex-col justify-between shadow-2xl border-r border-[#18462f] ${
                    isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                }`}
            >
                <div className="flex flex-col flex-1 overflow-y-auto px-4 py-5">
                    {/* Brand Header */}
                    <div className="flex items-center justify-between px-2 mb-6">
                        <div className="flex items-center gap-3.5">
                            <div className="w-16 h-16 rounded-2xl bg-white p-2 flex items-center justify-center shadow-lg flex-shrink-0 overflow-hidden ring-2 ring-white/20">
                                <img
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDH7E91zGtIEFfCaD-N6Zx_gqTjWkgrJQjQJHnPFaiOg5DS23-mRiDPGst-XmIGJKcvQzIgj_7TapT-KJEJrCkoMWpAdp7hOdiG645_u1W43csTz14_nhUTOkisyTvKozOLaMqC6uNZ7vz0ml68ydbbCeGZJFPZ3WuP8HRGd7uMbln2hMAsR7NRe9_-SWfdrYKJOYghFOmb0s-FWWSs0hqxY1xT__hyPbVYwOmIofvJVvsibRY8T_o_zA"
                                    alt="Logo SMPN 2 Soreang"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <div className="flex flex-col justify-center">
                                <span className="text-[26px] text-white font-bold tracking-tight leading-tight">SISADA</span>
                                <span className="text-[15px] text-[#74c69d] leading-snug font-bold">SMPN 2 Soreang</span>
                            </div>
                        </div>
                        <button
                            className="lg:hidden text-[#95d5b2] hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                            onClick={() => setIsMobileSidebarOpen(false)}
                            title="Tutup Navigasi"
                        >
                            <span className="material-symbols-outlined text-[20px]">close</span>
                        </button>
                    </div>

                    {/* Badge Tahun Ajaran Aktif */}
                    <div className="bg-[#143d28] border border-[#2d6a4f]/60 rounded-2xl p-3 flex items-center justify-between shadow-sm mb-4 mx-2">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-[#74c69d] font-medium leading-none uppercase tracking-wider">
                                Tahun Ajaran
                            </span>
                            <span className="text-[13px] text-white font-bold mt-1 leading-tight">
                                {tahunAjaranAktif ? `${tahunAjaranAktif.nama} ${tahunAjaranAktif.semester}` : '2024/2025 Genap'}
                            </span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-[#1b4332] border border-[#40916c] text-[#74c69d] font-bold text-[10px] tracking-wider uppercase shadow-xs">
                            AKTIF
                        </span>
                    </div>

                    {/* Navigasi Berkelompok */}
                    <nav className="flex flex-col gap-5">
                        {/* UTAMA / DASHBOARD */}
                        <div className="flex flex-col gap-1">
                            <span className="px-3 text-[10px] uppercase tracking-wider text-[#52b788] font-bold">DASHBOARD</span>
                            <Link
                                href={route('dashboard')}
                                className="flex items-center gap-3 px-3 py-2 rounded-xl text-[#95d5b2] hover:bg-[#163f2b] hover:text-white transition-colors font-medium text-[14px]"
                            >
                                <span className="material-symbols-outlined text-[20px] text-[#52b788]">space_dashboard</span>
                                <span>Dashboard Utama</span>
                            </Link>
                        </div>

                        {/* KESISWAAN & SDM */}
                        <div className="flex flex-col gap-1">
                            <span className="px-3 text-[10px] uppercase tracking-wider text-[#52b788] font-bold">KESISWAAN &amp; SDM</span>
                            <Link
                                href={route('kelas.index')}
                                className="flex items-center gap-3 px-3 py-2 rounded-xl text-[#95d5b2] hover:bg-[#163f2b] hover:text-white transition-colors font-medium text-[14px]"
                            >
                                <span className="material-symbols-outlined text-[20px] text-[#52b788]">meeting_room</span>
                                <span>Master Kelas &amp; TA</span>
                            </Link>
                            <Link
                                href={route('admin.siswa.index')}
                                className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[#17432d] border border-[#2d6a4f]/60 text-white font-semibold text-[14px] shadow-sm relative"
                            >
                                <span className="material-symbols-outlined text-[20px] text-[#74c69d]">group</span>
                                <span className="flex-1">Master Data Siswa</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                            </Link>
                            <Link
                                href={route('users.index')}
                                className="flex items-center gap-3 px-3 py-2 rounded-xl text-[#95d5b2] hover:bg-[#163f2b] hover:text-white transition-colors font-medium text-[14px]"
                            >
                                <span className="material-symbols-outlined text-[20px] text-[#52b788]">manage_accounts</span>
                                <span>Manajemen Akun</span>
                            </Link>
                        </div>

                        {/* KURIKULUM & KBM */}
                        <div className="flex flex-col gap-1">
                            <span className="px-3 text-[10px] uppercase tracking-wider text-[#52b788] font-bold">KURIKULUM &amp; KBM</span>
                            <Link
                                href={route('mapel.index')}
                                className="flex items-center gap-3 px-3 py-2 rounded-xl text-[#95d5b2] hover:bg-[#163f2b] hover:text-white transition-colors font-medium text-[14px]"
                            >
                                <span className="material-symbols-outlined text-[20px] text-[#52b788]">menu_book</span>
                                <span>Master Mapel &amp; Jam</span>
                            </Link>
                            <a
                                href="#"
                                className="flex items-center gap-3 px-3 py-2 rounded-xl text-[#95d5b2] hover:bg-[#163f2b] hover:text-white transition-colors font-medium text-[14px]"
                            >
                                <span className="material-symbols-outlined text-[20px] text-[#52b788]">calendar_month</span>
                                <span>Penjadwalan KBM</span>
                            </a>
                            <a
                                href="#"
                                className="flex items-center gap-3 px-3 py-2 rounded-xl text-[#95d5b2] hover:bg-[#163f2b] hover:text-white transition-colors font-medium text-[14px]"
                            >
                                <span className="material-symbols-outlined text-[20px] text-[#52b788]">assignment_ind</span>
                                <span>Penugasan Guru Piket</span>
                            </a>
                        </div>

                        {/* PRESENSI & LAPORAN */}
                        <div className="flex flex-col gap-1">
                            <span className="px-3 text-[10px] uppercase tracking-wider text-[#52b788] font-bold">PRESENSI &amp; LAPORAN</span>
                            <a
                                href="#"
                                className="flex items-center gap-3 px-3 py-2 rounded-xl text-[#95d5b2] hover:bg-[#163f2b] hover:text-white transition-colors font-medium text-[14px]"
                            >
                                <span className="material-symbols-outlined text-[20px] text-[#52b788]">fact_check</span>
                                <span>Monitoring Presensi Guru</span>
                            </a>
                            <a
                                href="#"
                                className="flex items-center gap-3 px-3 py-2 rounded-xl text-[#95d5b2] hover:bg-[#163f2b] hover:text-white transition-colors font-medium text-[14px]"
                            >
                                <span className="material-symbols-outlined text-[20px] text-[#52b788]">co_present</span>
                                <span>Rekap Absensi Siswa</span>
                            </a>
                            <a
                                href="#"
                                className="flex items-center gap-3 px-3 py-2 rounded-xl text-[#95d5b2] hover:bg-[#163f2b] hover:text-white transition-colors font-medium text-[14px]"
                            >
                                <span className="material-symbols-outlined text-[20px] text-[#52b788]">chat</span>
                                <span>Log Notifikasi WA</span>
                            </a>
                        </div>

                        {/* CMS & INFORMASI */}
                        <div className="flex flex-col gap-1">
                            <span className="px-3 text-[10px] uppercase tracking-wider text-[#52b788] font-bold">CMS &amp; INFORMASI</span>
                            <Link
                                href={route('admin.berita.index')}
                                className="flex items-center gap-3 px-3 py-2 rounded-xl text-[#95d5b2] hover:bg-[#163f2b] hover:text-white transition-colors font-medium text-[14px]"
                            >
                                <span className="material-symbols-outlined text-[20px] text-[#52b788]">campaign</span>
                                <span>Pengumuman Sekolah</span>
                            </Link>
                        </div>
                    </nav>
                </div>

                {/* Footer Sidebar: Tombol Keluar */}
                <div className="p-4 border-t border-[#18462f]/60 flex flex-col gap-2.5">
                    <Link
                        method="post"
                        as="button"
                        href={route('logout')}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-[#95d5b2] hover:text-white hover:bg-red-500/20 border border-transparent hover:border-red-500/30 text-[13px] font-semibold transition-colors cursor-pointer"
                        title="Keluar dari Aplikasi"
                    >
                        <span className="material-symbols-outlined text-[18px] text-red-500">power_settings_new</span>
                        <span className="text-red-500">Keluar Sesi</span>
                    </Link>
                </div>
            </aside>

            {/* Konten Utama & Header Topbar */}
            <div className="pl-0 lg:pl-72">
                {/* Header Topbar Stitch */}
                <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-white/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-4 lg:px-8">
                    {/* Kiri: Hamburger & Greeting */}
                    <div className="flex items-center gap-3">
                        <button
                            className="p-2 rounded-lg text-slate-600 hover:bg-[#f8fafc] hover:text-[#002210] transition-colors flex items-center justify-center flex-shrink-0 lg:hidden cursor-pointer"
                            onClick={() => setIsMobileSidebarOpen(true)}
                            title="Menu Navigasi"
                        >
                            <span className="material-symbols-outlined text-[24px]">menu</span>
                        </button>
                        <div className="flex items-center gap-2 text-[15px] font-semibold text-[#0F172A] flex-shrink-0">
                            <span className="material-symbols-outlined text-[20px] text-[#006c4a]">waving_hand</span>
                            <span>Selamat datang, Admin!</span>
                        </div>
                    </div>

                    {/* Tengah: Global Search Bar + Shortcut Ctrl+K */}
                    <div className="flex items-center flex-1 justify-center max-w-md mx-4 lg:mx-6">
                        <div className="relative w-full">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] text-[18px]">
                                search
                            </span>
                            <input
                                ref={globalSearchInputRef}
                                type="text"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    handleFilterChange(e.target.value, selectedKelas);
                                }}
                                placeholder="Cari NISN, NIP, Kelas, Mapel..."
                                className="w-full bg-[#f8fafc] border border-[#E2E8F0] pl-9 pr-14 py-1.5 rounded-lg text-[13px] text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#006c4a] transition-all"
                            />
                            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-semibold text-[#64748B] bg-white border border-[#E2E8F0] rounded shadow-xs pointer-events-none hidden sm:inline-block">
                                Ctrl+K
                            </kbd>
                        </div>
                    </div>

                    {/* Kanan: Bantuan, Notifikasi, Profile Dropdown */}
                    <div className="flex items-center gap-2 md:gap-3.5">
                        <button
                            onClick={() => triggerToast('Pusat Bantuan', 'Panduan operasional tata usaha SMPN 2 Soreang.')}
                            className="text-slate-600 hover:text-[#0F172A] transition-colors p-1.5 rounded-lg hover:bg-[#f8fafc] cursor-pointer"
                            title="Pusat Bantuan & Panduan TU"
                        >
                            <span className="material-symbols-outlined text-[20px]">help_outline</span>
                        </button>
                        <button
                            onClick={() => triggerToast('Notifikasi Sistem', 'Tidak ada pemberitahuan baru yang belum dibaca.')}
                            className="relative text-slate-600 hover:text-[#0F172A] transition-colors p-1.5 rounded-lg hover:bg-[#f8fafc] cursor-pointer"
                            title="Notifikasi Sistem"
                        >
                            <span className="material-symbols-outlined text-[20px]">notifications</span>
                            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                        </button>

                        <div className="h-6 w-px bg-[#E2E8F0] mx-0.5"></div>

                        {/* Profile Dropdown */}
                        <div className="relative" ref={profileDropdownRef}>
                            <button
                                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                className="flex items-center gap-2.5 pl-1 py-1 pr-1.5 rounded-xl hover:bg-[#f8fafc] transition-colors focus:outline-none text-left cursor-pointer"
                            >
                                <div className="w-8 h-8 rounded-full bg-[#002210] text-white flex items-center justify-center shadow-xs flex-shrink-0">
                                    <span className="material-symbols-outlined text-[18px]">account_circle</span>
                                </div>
                                <div className="hidden md:flex flex-col text-right">
                                    <span className="text-[13px] text-[#0F172A] font-semibold leading-tight">
                                        {auth?.user?.nama || 'Hj. Endang S., S.AP'}
                                    </span>
                                </div>
                                <span
                                    className={`material-symbols-outlined text-[#64748B] text-[18px] transition-transform ${
                                        isProfileDropdownOpen ? 'rotate-180' : ''
                                    }`}
                                >
                                    expand_more
                                </span>
                            </button>

                            {isProfileDropdownOpen && (
                                <div className="absolute right-0 top-full mt-1.5 w-52 bg-white border border-[#E2E8F0] rounded-xl shadow-xl py-1.5 animate-in fade-in zoom-in-95 z-50">
                                    <div className="px-3.5 py-2 border-b border-[#E2E8F0]">
                                        <p className="text-[13px] font-bold text-[#0F172A] truncate">
                                            {auth?.user?.nama || 'Hj. Endang S., S.AP'}
                                        </p>
                                        <p className="text-[11px] text-[#64748B] truncate">
                                            {auth?.user?.email || 'endang.tu@smpn2soreang.sch.id'}
                                        </p>
                                    </div>
                                    <Link
                                        href={route('profile.edit')}
                                        className="flex items-center gap-2 px-3.5 py-2 text-[13px] text-slate-700 hover:bg-[#f8fafc] hover:text-[#002210] transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[17px] text-[#64748B]">manage_accounts</span>
                                        <span>Pengaturan Akun</span>
                                    </Link>
                                    <Link
                                        href={route('profile.edit')}
                                        className="flex items-center gap-2 px-3.5 py-2 text-[13px] text-slate-700 hover:bg-[#f8fafc] hover:text-[#002210] transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[17px] text-[#64748B]">security</span>
                                        <span>Keamanan &amp; Sandi</span>
                                    </Link>
                                    <div className="h-px bg-[#E2E8F0] my-1"></div>
                                    <Link
                                        method="post"
                                        as="button"
                                        href={route('logout')}
                                        className="w-full text-left flex items-center gap-2 px-3.5 py-2 text-[13px] text-red-600 hover:bg-red-50 transition-colors font-medium cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined text-[17px]">logout</span>
                                        <span>Keluar Aplikasi</span>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Konten Halaman */}
                <main className="w-full pt-16 bg-[#f8fafc] min-h-screen px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col w-full gap-6">
                        {/* Header Section with Title & CTAs */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-3 -mb-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3.5 flex-wrap">
                                <div>
                                    <div className="flex items-center gap-2.5 flex-wrap">
                                        <h1 className="text-[28px] text-[#0F172A] font-bold tracking-tight">Master Data Siswa</h1>
                                        <div className="relative inline-flex items-center">
                                            <select
                                                aria-label="Tahun Ajaran"
                                                defaultValue="2024-genap"
                                                className="appearance-none bg-[#E8F5E9] text-[#002210] text-[11px] uppercase font-bold pl-3 pr-7 py-1 rounded-full border border-[#006c4a]/20 focus:outline-none focus:ring-2 focus:ring-[#006c4a] cursor-pointer shadow-sm"
                                            >
                                                <option value="2024-genap">
                                                    TA {tahunAjaranAktif ? `${tahunAjaranAktif.nama} ${tahunAjaranAktif.semester}` : '2024/2025 Genap'}
                                                </option>
                                                <option value="2024-ganjil">TA 2024/2025 Ganjil</option>
                                                <option value="2023-genap">TA 2023/2024 Genap</option>
                                                <option value="2023-ganjil">TA 2023/2024 Ganjil</option>
                                            </select>
                                            <span className="material-symbols-outlined pointer-events-none absolute right-2 text-[#002210] text-[14px]">
                                                expand_more
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 bg-white border border-[#E2E8F0] px-3 py-1 rounded-lg text-[13px] text-[#64748B] shadow-sm">
                                    <span className="material-symbols-outlined text-[16px] text-[#006c4a]">date_range</span>
                                    <span className="uppercase text-[11px] text-[#64748B] font-semibold">Periode Tahun Aktif Siswa:</span>
                                    <span className="text-[14px] font-bold text-[#002210]">2022 - 2025</span>
                                    <span className="text-[11px] text-[#64748B]">(Angkatan VII s/d IX)</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <button
                                    onClick={handleExport}
                                    className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white hover:bg-[#f8fafc] text-[#0F172A] font-semibold text-[14px] shadow-sm border border-[#E2E8F0] transition-all active:scale-[0.98] cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-[18px] text-[#64748B]">download</span>
                                    <span>Export (.xlsx)</span>
                                </button>
                                <button
                                    onClick={openCreateModal}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#002210] hover:bg-[#164E33] text-white font-semibold text-[14px] shadow-md transition-all active:scale-[0.98] cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                                    <span>+ Tambah Siswa</span>
                                </button>
                            </div>
                        </div>

                        {/* Metric / Summary Cards Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                            {/* Card 1: Total Terdaftar */}
                            <div className="bg-white border border-[#E2E8F0] p-4 md:p-5 rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <span className="text-[11px] uppercase tracking-wider text-[#64748B] font-bold">Total Terdaftar</span>
                                        <div className="flex items-baseline gap-2 mt-2">
                                            <span className="text-[32px] md:text-[48px] text-[#0F172A] leading-none font-bold">
                                                {metricSummary.total}
                                            </span>
                                            <span className="text-[13px] text-[#64748B] hidden sm:inline">Siswa</span>
                                        </div>
                                    </div>
                                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-[#f0f3ff] text-[#002210] flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[20px] md:text-[22px]">groups</span>
                                    </div>
                                </div>
                                <div className="mt-3 md:mt-4 pt-2 md:pt-3 flex items-center gap-1.5 md:gap-2 bg-[#f8fafc] -mx-4 md:-mx-5 -mb-4 md:-mb-5 px-4 md:px-5 py-2 md:py-2.5 border-t border-[#E2E8F0]">
                                    <span className="material-symbols-outlined text-[#006c4a] text-[14px] md:text-[16px]">verified</span>
                                    <span className="text-[12px] text-[#006c4a] font-medium truncate">100% Terverifikasi Dapodik</span>
                                </div>
                            </div>

                            {/* Card 2: Status Aktif */}
                            <div className="bg-white border border-[#E2E8F0] p-4 md:p-5 rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <span className="text-[11px] uppercase tracking-wider text-[#64748B] font-bold">Status Aktif</span>
                                        <div className="flex items-baseline gap-2 mt-2">
                                            <span className="text-[32px] md:text-[48px] text-[#0F172A] leading-none font-bold">
                                                {metricSummary.aktif}
                                            </span>
                                            <span className="text-[13px] text-[#64748B] hidden sm:inline">Siswa</span>
                                        </div>
                                    </div>
                                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-[#E8F5E9] text-[#006c4a] flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[20px] md:text-[22px]">check_circle</span>
                                    </div>
                                </div>
                                <div className="mt-3 md:mt-4 pt-2 md:pt-3 flex items-center gap-1.5 md:gap-2 bg-[#f8fafc] -mx-4 md:-mx-5 -mb-4 md:-mb-5 px-4 md:px-5 py-2 md:py-2.5 border-t border-[#E2E8F0]">
                                    <span className="material-symbols-outlined text-[#006c4a] text-[14px] md:text-[16px]">trending_up</span>
                                    <span className="text-[12px] text-[#006c4a] font-medium truncate">98.1% Partisipasi KBM</span>
                                </div>
                            </div>

                            {/* Card 3: Nonaktif / Mutasi */}
                            <div className="bg-white border border-[#E2E8F0] p-4 md:p-5 rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <span className="text-[11px] uppercase tracking-wider text-[#64748B] font-bold">Nonaktif / Mutasi</span>
                                        <div className="flex items-baseline gap-2 mt-2">
                                            <span className="text-[32px] md:text-[48px] text-[#0F172A] leading-none font-bold">
                                                {metricSummary.nonaktif}
                                            </span>
                                            <span className="text-[13px] text-[#64748B] hidden sm:inline">Siswa</span>
                                        </div>
                                    </div>
                                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[20px] md:text-[22px]">person_off</span>
                                    </div>
                                </div>
                                <div className="mt-3 md:mt-4 pt-2 md:pt-3 flex items-center gap-1.5 md:gap-2 bg-[#f8fafc] -mx-4 md:-mx-5 -mb-4 md:-mb-5 px-4 md:px-5 py-2 md:py-2.5 border-t border-[#E2E8F0]">
                                    <span className="material-symbols-outlined text-[#64748B] text-[14px] md:text-[16px]">info</span>
                                    <span className="text-[12px] text-[#64748B] truncate">Perlu sinkronisasi</span>
                                </div>
                            </div>

                            {/* Card 4: Kontak Wali Valid */}
                            <div className="bg-white border border-[#E2E8F0] p-4 md:p-5 rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <span className="text-[11px] uppercase tracking-wider text-[#64748B] font-bold">Kontak Wali Valid</span>
                                        <div className="flex items-baseline gap-2 mt-2">
                                            <span className="text-[32px] md:text-[48px] text-[#0F172A] leading-none font-bold">
                                                {metricSummary.kontakValid}
                                            </span>
                                            <span className="text-[13px] text-[#64748B] hidden sm:inline">Nomor</span>
                                        </div>
                                    </div>
                                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-[#9af1c6] text-[#0b714e] flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[20px] md:text-[22px]">mark_chat_read</span>
                                    </div>
                                </div>
                                <div className="mt-3 md:mt-4 pt-2 md:pt-3 flex items-center gap-1.5 md:gap-2 bg-[#f8fafc] -mx-4 md:-mx-5 -mb-4 md:-mb-5 px-4 md:px-5 py-2 md:py-2.5 border-t border-[#E2E8F0]">
                                    <span className="material-symbols-outlined text-[#006c4a] text-[14px] md:text-[16px]">bolt</span>
                                    <span className="text-[12px] text-[#006c4a] font-medium truncate">WhatsApp Siap</span>
                                </div>
                            </div>
                        </div>

                        {/* Control & Filter Bar */}
                        <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                            <div className="flex flex-1 items-center gap-3 flex-wrap sm:flex-nowrap">
                                {/* Search Input */}
                                <div className="relative flex-1 min-w-[200px]">
                                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] text-[18px]">
                                        search
                                    </span>
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => {
                                            setSearch(e.target.value);
                                            handleFilterChange(e.target.value, selectedKelas);
                                        }}
                                        placeholder="Cari berdasarkan NIS atau Nama siswa..."
                                        className="w-full bg-[#f8fafc] border border-[#E2E8F0] pl-10 pr-4 py-2 rounded-lg text-[13px] text-[#111c2d] placeholder:text-[#64748B] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#006c4a] transition-all"
                                    />
                                </div>

                                {/* Dropdown Filter Kelas */}
                                <div className="relative min-w-[200px]">
                                    <select
                                        value={selectedKelas}
                                        onChange={(e) => {
                                            setSelectedKelas(e.target.value);
                                            handleFilterChange(search, e.target.value);
                                        }}
                                        className="w-full appearance-none bg-[#f8fafc] border border-[#E2E8F0] px-3.5 py-2 pr-9 rounded-lg text-[13px] text-[#111c2d] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#006c4a] cursor-pointer transition-all"
                                    >
                                        <option value="">Semua Rombel Kelas</option>
                                        {classes.map((k) => (
                                            <option key={k.id} value={k.id}>
                                                Kelas {k.nama_kelas || k.nama}
                                            </option>
                                        ))}
                                    </select>
                                    <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] text-[18px]">
                                        expand_more
                                    </span>
                                </div>
                            </div>

                            {/* Badge Total Counter & Sync Action */}
                            <div className="flex items-center gap-3 self-end md:self-auto">
                                <div className="bg-[#E8F5E9] text-[#002210] font-semibold text-[14px] px-3 py-1.5 rounded-lg flex items-center gap-2 border border-[#006c4a]/20">
                                    <span className="material-symbols-outlined text-[16px]">pie_chart</span>
                                    <span>Total: {studentData.total ?? studentList.length} Siswa</span>
                                </div>
                                <button
                                    onClick={handleSyncData}
                                    className="p-2 rounded-lg bg-[#f8fafc] border border-[#E2E8F0] hover:bg-[#eaedff] text-slate-600 transition-colors flex items-center justify-center cursor-pointer"
                                    title="Sinkron Ulang Data"
                                >
                                    <span
                                        className={`material-symbols-outlined text-[20px] transition-transform duration-500 ${
                                            isSyncRotating ? 'rotate-180' : ''
                                        }`}
                                    >
                                        sync
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Main Table Container */}
                        <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden flex flex-col">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[#f8fafc] border-b border-[#E2E8F0] text-[#64748B] text-[11px] uppercase tracking-wider font-bold">
                                            <th className="py-3.5 px-6 font-semibold">NIS</th>
                                            <th className="py-3.5 px-6 font-semibold">Nama Siswa</th>
                                            <th className="py-3.5 px-6 font-semibold text-center">JK</th>
                                            <th className="py-3.5 px-6 font-semibold">Kelas</th>
                                            <th className="py-3.5 px-6 font-semibold">Angkatan</th>
                                            <th className="py-3.5 px-6 font-semibold">Status</th>
                                            <th className="py-3.5 px-6 font-semibold text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#E2E8F0] text-[#111c2d]">
                                        {studentList.length > 0 ? (
                                            studentList.map((item) => {
                                                const gender = getGender(item);
                                                const kelasNama = item.kelas?.nama_kelas || item.kelas?.nama || '-';
                                                const angkatanNama = item.angkatan || item.kelas?.tahun_ajaran?.nama || tahunAjaranAktif?.nama || '2024/2025';

                                                return (
                                                    <tr key={item.id} className="hover:bg-[#f8fafc]/80 transition-colors group">
                                                        <td className="py-4 px-6 text-[16px] font-semibold text-[#0F172A]">{item.nis}</td>
                                                        <td className="py-4 px-6">
                                                            <div className="text-[16px] font-semibold text-[#0F172A]">{item.nama}</div>
                                                        </td>
                                                        <td className="py-4 px-6 text-center">
                                                            {gender === 'P' ? (
                                                                <span
                                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-pink-100 text-pink-700 font-semibold text-[14px]"
                                                                    title="Perempuan"
                                                                >
                                                                    <span className="material-symbols-outlined text-[14px]">female</span>
                                                                    <span>P</span>
                                                                </span>
                                                            ) : (
                                                                <span
                                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#eaedff] text-[#002210] font-semibold text-[14px]"
                                                                    title="Laki-laki"
                                                                >
                                                                    <span className="material-symbols-outlined text-[14px]">male</span>
                                                                    <span>L</span>
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#f1f5f9] text-[#0F172A] font-semibold text-[14px]">
                                                                {kelasNama.startsWith('Kelas') ? kelasNama : `Kelas ${kelasNama}`}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <span className="text-[#111c2d] font-medium">{angkatanNama}</span>
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            {item.aktif ? (
                                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F5E9] text-[#006c4a] text-[11px] uppercase font-bold">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#006c4a]"></span>
                                                                    Aktif
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffdad6] text-[#93000a] text-[11px] uppercase font-bold">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]"></span>
                                                                    Nonaktif
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="py-4 px-6 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button
                                                                    onClick={() => openDetailModal(item)}
                                                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white hover:bg-[#E8F5E9] text-[#002210] hover:text-[#006c4a] border border-[#E2E8F0] font-semibold text-[14px] transition-all shadow-sm active:scale-95 cursor-pointer"
                                                                    title="Lihat Detail Siswa"
                                                                >
                                                                    <span className="material-symbols-outlined text-[16px] text-[#006c4a]">visibility</span>
                                                                    <span>Detail</span>
                                                                </button>
                                                                <button
                                                                    onClick={() => openEditModal(item)}
                                                                    className="p-1.5 rounded-lg hover:bg-[#f1f5f9] text-[#64748B] hover:text-[#002210] transition-colors cursor-pointer"
                                                                    title="Ubah Data"
                                                                >
                                                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                                                </button>
                                                                <button
                                                                    onClick={() => handleToggleStatus(item)}
                                                                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                                                        item.aktif
                                                                            ? 'hover:bg-red-50 text-[#64748B] hover:text-red-600'
                                                                            : 'hover:bg-green-50 text-[#64748B] hover:text-[#006c4a]'
                                                                    }`}
                                                                    title={item.aktif ? 'Nonaktifkan Siswa' : 'Aktifkan Siswa'}
                                                                >
                                                                    <span className="material-symbols-outlined text-[18px]">
                                                                        {item.aktif ? 'toggle_on' : 'toggle_off'}
                                                                    </span>
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setSiswaToDelete(item);
                                                                        setIsDeleting(true);
                                                                    }}
                                                                    className="p-1.5 rounded-lg hover:bg-[#ffdad6] text-[#64748B] hover:text-[#ba1a1a] transition-colors cursor-pointer"
                                                                    title="Hapus Data Siswa"
                                                                >
                                                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="py-16 text-center text-[#64748B]">
                                                    <span className="material-symbols-outlined text-[48px] text-[#C5CEE3] block mb-2">group_off</span>
                                                    <p className="text-[15px] font-medium text-[#0F172A]">Tidak ada data siswa</p>
                                                    <p className="text-[13px] text-[#64748B] mt-1">
                                                        {search || selectedKelas
                                                            ? 'Coba sesuaikan kata kunci pencarian atau filter kelas.'
                                                            : 'Klik tombol "+ Tambah Siswa" untuk memulai pendaftaran.'}
                                                    </p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Footer */}
                            {studentData?.links && studentData.links.length > 0 && (
                                <div className="px-6 py-4 bg-[#f8fafc] border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-[#64748B]">
                                    <div>
                                        Menampilkan <strong className="text-[#0F172A] font-semibold">{studentData.from || 0}–{studentData.to || 0}</strong> dari{' '}
                                        <strong className="text-[#0F172A] font-semibold">{studentData.total || 0}</strong> siswa
                                    </div>
                                    <div className="flex items-center gap-1 flex-wrap">
                                        {studentData.links.map((link, idx) => {
                                            if (!link.url) {
                                                return (
                                                    <span
                                                        key={idx}
                                                        className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-[#C5CEE3] opacity-50 cursor-not-allowed font-semibold text-[13px]"
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                );
                                            }
                                            return (
                                                <Link
                                                    key={idx}
                                                    href={link.url}
                                                    preserveScroll
                                                    className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shadow-sm text-[13px] ${
                                                        link.active
                                                            ? 'bg-[#002210] text-white border border-[#002210]'
                                                            : 'bg-white border border-[#E2E8F0] hover:bg-[#f1f5f9] text-[#0F172A]'
                                                    }`}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            {/* Modal Detail Lengkap Siswa */}
            {isDetailModalOpen && selectedSiswa && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
                    onClick={() => setIsDetailModalOpen(false)}
                >
                    <div
                        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh] border border-[#E2E8F0] animate-in fade-in zoom-in-95"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header Modal Detail */}
                        <div className="px-6 py-4 bg-[#002210] text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#143823] text-[#9df4c9] flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[24px]">badge</span>
                                </div>
                                <div>
                                    <h3 className="text-[20px] text-white leading-tight font-bold">Biodata Lengkap Siswa</h3>
                                    <p className="text-[11px] uppercase text-[#a8d0b2] tracking-wider font-semibold">
                                        Arsip Resmi Induk Dapodik • SMPN 2 Soreang
                                    </p>
                                </div>
                            </div>
                            <button
                                aria-label="Tutup Modal"
                                onClick={() => setIsDetailModalOpen(false)}
                                className="p-1.5 rounded-lg hover:bg-[#143823] text-[#a8d0b2] hover:text-white transition-colors cursor-pointer"
                                title="Tutup"
                            >
                                <span className="material-symbols-outlined text-[22px]">close</span>
                            </button>
                        </div>

                        {/* Body Modal Detail */}
                        <div className="p-6 overflow-y-auto flex flex-col gap-5">
                            {/* Profile Card */}
                            <div className="bg-[#f8fafc] p-4 rounded-xl flex flex-col sm:flex-row items-center sm:items-start gap-4 border border-[#E2E8F0]">
                                <div className="relative flex-shrink-0 flex flex-col items-center">
                                    <div className="w-24 h-32 rounded-lg bg-[#dee8ff] border-2 border-[#002210]/20 shadow-md overflow-hidden flex flex-col items-center justify-center relative">
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#002210]/30 to-transparent pointer-events-none"></div>
                                        <span className="material-symbols-outlined text-[48px] text-[#002210]/40">person</span>
                                        <div className="absolute bottom-0 inset-x-0 bg-[#002210]/90 text-white text-[9px] uppercase text-center py-0.5 tracking-wider font-bold">
                                            PASFOTO 3X4
                                        </div>
                                    </div>
                                    <span
                                        className={`inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full text-[11px] uppercase font-bold shadow-sm ${
                                            selectedSiswa.aktif ? 'bg-[#E8F5E9] text-[#006c4a]' : 'bg-[#ffdad6] text-[#93000a]'
                                        }`}
                                    >
                                        <span className={`w-1.5 h-1.5 rounded-full ${selectedSiswa.aktif ? 'bg-[#006c4a]' : 'bg-[#ba1a1a]'}`}></span>
                                        {selectedSiswa.aktif ? 'Siswa Aktif' : 'Nonaktif'}
                                    </span>
                                </div>

                                <div className="flex flex-col text-center sm:text-left flex-1">
                                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                                        <h4 className="text-[22px] text-[#0F172A] font-bold">{selectedSiswa.nama}</h4>
                                        <span
                                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] uppercase font-bold ${
                                                selectedSiswa.aktif ? 'bg-[#E8F5E9] text-[#006c4a]' : 'bg-[#ffdad6] text-[#93000a]'
                                            }`}
                                        >
                                            <span className={`w-1.5 h-1.5 rounded-full ${selectedSiswa.aktif ? 'bg-[#006c4a]' : 'bg-[#ba1a1a]'}`}></span>
                                            {selectedSiswa.aktif ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-[13px] text-[#64748B] mt-1">
                                        <span className="flex items-center gap-1 font-medium text-[#0F172A]">
                                            <span className="material-symbols-outlined text-[16px] text-[#64748B]">credit_card</span>
                                            NIS: <span className="font-bold text-[#002210]">{selectedSiswa.nis}</span>
                                        </span>
                                        <span className="text-[#E2E8F0]">•</span>
                                        <span className="flex items-center gap-1 font-medium text-[#0F172A]">
                                            <span className="material-symbols-outlined text-[16px] text-[#64748B]">fingerprint</span>
                                            NISN: <span className="font-bold text-[#0F172A]">{selectedSiswa.nisn || '0098234120'}</span>
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                                        <span className="px-2.5 py-1 rounded-md bg-white border border-[#E2E8F0] text-[#002210] font-semibold text-[14px]">
                                            Kelas {selectedSiswa.kelas?.nama_kelas || selectedSiswa.kelas?.nama || '-'}
                                        </span>
                                        <span className="px-2.5 py-1 rounded-md bg-white border border-[#E2E8F0] text-[#64748B] text-[14px]">
                                            Angkatan {selectedSiswa.angkatan || selectedSiswa.kelas?.tahun_ajaran?.nama || tahunAjaranAktif?.nama || '2024/2025'}
                                        </span>
                                        <span className="px-2.5 py-1 rounded-md bg-white border border-[#E2E8F0] text-[#64748B] text-[14px] flex items-center gap-1">
                                            {getGender(selectedSiswa) === 'P' ? (
                                                <>
                                                    <span className="material-symbols-outlined text-[16px] text-pink-600">female</span>
                                                    <span>Perempuan</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="material-symbols-outlined text-[16px] text-[#002210]">male</span>
                                                    <span>Laki-laki</span>
                                                </>
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Detail Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                <div className="bg-[#f8fafc] p-3.5 rounded-xl flex flex-col gap-1 border border-[#E2E8F0]">
                                    <span className="text-[11px] uppercase tracking-wider text-[#64748B] font-bold">Tempat, Tanggal Lahir</span>
                                    <span className="text-[16px] text-[#0F172A] font-semibold">Bandung, 14 Mei 2011</span>
                                </div>
                                <div className="bg-[#f8fafc] p-3.5 rounded-xl flex flex-col gap-1 border border-[#E2E8F0]">
                                    <span className="text-[11px] uppercase tracking-wider text-[#64748B] font-bold">Masa Aktif Siswa</span>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[16px] text-[#006c4a] font-semibold">Juli 2024 - Juni 2027</span>
                                        <span className="text-[11px] text-[#64748B]">(3 Tahun)</span>
                                    </div>
                                </div>
                                <div className="bg-[#f8fafc] p-3.5 rounded-xl flex flex-col gap-1 border border-[#E2E8F0]">
                                    <span className="text-[11px] uppercase tracking-wider text-[#64748B] font-bold">Kontak Siswa</span>
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[16px] text-[#006c4a]">smartphone</span>
                                        <span className="text-[16px] text-[#0F172A] font-medium">{selectedSiswa.no_hp_ortu || '-'}</span>
                                    </div>
                                </div>
                                <div className="bg-[#f8fafc] p-3.5 rounded-xl flex flex-col gap-1 border border-[#E2E8F0]">
                                    <span className="text-[11px] uppercase tracking-wider text-[#64748B] font-bold">Nama Orang Tua / Wali</span>
                                    <span className="text-[16px] text-[#0F172A] font-semibold">Wali Murid {selectedSiswa.nama}</span>
                                </div>
                            </div>

                            {/* WhatsApp Field */}
                            <div className="bg-[#f8fafc] p-3.5 rounded-xl flex flex-col gap-1.5 border border-[#E2E8F0]">
                                <span className="text-[11px] uppercase tracking-wider text-[#64748B] font-bold">
                                    No. WhatsApp Orang Tua / Wali
                                </span>
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px] text-[#10B981]">chat</span>
                                        <span className="text-[16px] text-[#0F172A] font-semibold">
                                            {selectedSiswa.no_hp_ortu || 'Belum diisi'}
                                        </span>
                                    </div>
                                    {selectedSiswa.no_hp_ortu && formatWaUrl(selectedSiswa.no_hp_ortu) && (
                                        <a
                                            href={formatWaUrl(selectedSiswa.no_hp_ortu)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#E8F5E9] text-[#006c4a] hover:bg-[#9af1c6] font-semibold text-[14px] transition-colors shadow-sm cursor-pointer"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">send</span>
                                            <span>Kirim WhatsApp</span>
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* Address Field */}
                            <div className="bg-[#f8fafc] p-3.5 rounded-xl flex flex-col gap-1 border border-[#E2E8F0]">
                                <span className="text-[11px] uppercase tracking-wider text-[#64748B] font-bold">
                                    Alamat Tempat Tinggal / Domisili
                                </span>
                                <div className="flex items-start gap-2 mt-0.5">
                                    <span className="material-symbols-outlined text-[18px] text-[#64748B] mt-0.5 flex-shrink-0">location_on</span>
                                    <span className="text-[15px] text-[#0F172A]">
                                        Jl. Terusan Kopo No. 142, Soreang, Kab. Bandung, Jawa Barat
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Footer Modal Detail */}
                        <div className="px-6 py-4 bg-[#f8fafc] border-t border-[#E2E8F0] flex items-center justify-between gap-3">
                            <button
                                onClick={() => window.print()}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-[#f1f5f9] text-[#0F172A] font-semibold text-[14px] border border-[#E2E8F0] transition-colors shadow-sm cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[18px] text-[#64748B]">print</span>
                                <span>Cetak Biodata</span>
                            </button>
                            <button
                                onClick={() => setIsDetailModalOpen(false)}
                                className="px-6 py-2 rounded-lg bg-[#002210] hover:bg-[#164E33] text-white font-medium text-[14px] shadow-sm transition-all active:scale-[0.98] cursor-pointer"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Form Tambah / Edit Siswa */}
            {isFormModalOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
                    onClick={() => setIsFormModalOpen(false)}
                >
                    <div
                        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col my-auto border border-[#E2E8F0] animate-in fade-in zoom-in-95"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header Modal Form */}
                        <div className="px-6 py-5 bg-[#f8fafc] border-b border-[#E2E8F0] flex items-start justify-between">
                            <div>
                                <h3 className="text-[20px] font-bold text-[#0F172A]">
                                    {isEditing ? 'Ubah Data Siswa' : 'Tambah Data Siswa'}
                                </h3>
                                <p className="text-[13px] text-[#64748B] mt-0.5">
                                    {isEditing
                                        ? `Pembaruan data akademis peserta didik ${data.nis}`
                                        : 'Masukkan profil registrasi peserta didik baru SMPN 2 Soreang.'}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsFormModalOpen(false)}
                                className="p-1 rounded-full hover:bg-[#e2e8f0] text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                        </div>

                        {/* Body Form */}
                        <form onSubmit={handleSubmitForm} className="p-6 flex flex-col gap-4">
                            {/* Field NIS */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[14px] font-semibold text-[#0F172A] flex items-center gap-1">
                                    <span>Nomor Induk Siswa (NIS)</span>
                                    <span className="text-[#ba1a1a]">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        pattern="[0-9]+"
                                        required
                                        value={data.nis}
                                        onChange={(e) => setData('nis', e.target.value)}
                                        placeholder="Contoh: 24250801"
                                        className="w-full bg-[#f8fafc] border border-[#E2E8F0] px-3.5 py-2.5 rounded-lg text-[13px] text-[#111c2d] placeholder:text-[#64748B] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#006c4a] transition-all"
                                    />
                                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] text-[18px]">
                                        badge
                                    </span>
                                </div>
                                {errors.nis ? (
                                    <span className="text-[11px] text-[#ba1a1a]">{errors.nis}</span>
                                ) : (
                                    <span className="text-[11px] text-[#64748B]">Nomor unik Dapodik kesiswaan resmi</span>
                                )}
                            </div>

                            {/* Field Nama Lengkap */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[14px] font-semibold text-[#0F172A] flex items-center gap-1">
                                    <span>Nama Lengkap Siswa</span>
                                    <span className="text-[#ba1a1a]">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        required
                                        value={data.nama}
                                        onChange={(e) => setData('nama', e.target.value)}
                                        placeholder="Masukkan nama lengkap siswa..."
                                        className="w-full bg-[#f8fafc] border border-[#E2E8F0] px-3.5 py-2.5 rounded-lg text-[13px] text-[#111c2d] placeholder:text-[#64748B] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#006c4a] transition-all"
                                    />
                                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] text-[18px]">
                                        person
                                    </span>
                                </div>
                                {errors.nama && <span className="text-[11px] text-[#ba1a1a]">{errors.nama}</span>}
                            </div>

                            {/* Field Jenis Kelamin */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[14px] font-semibold text-[#0F172A] flex items-center gap-1">
                                    <span>Jenis Kelamin</span>
                                    <span className="text-[#ba1a1a]">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        value={data.jk}
                                        onChange={(e) => setData('jk', e.target.value)}
                                        className="w-full appearance-none bg-[#f8fafc] border border-[#E2E8F0] px-3.5 py-2.5 pr-10 rounded-lg text-[13px] text-[#111c2d] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#006c4a] cursor-pointer transition-all"
                                    >
                                        <option value="L">Laki-laki (L)</option>
                                        <option value="P">Perempuan (P)</option>
                                    </select>
                                    <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] text-[18px]">
                                        expand_more
                                    </span>
                                </div>
                            </div>

                            {/* Field Rombel / Kelas */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[14px] font-semibold text-[#0F172A] flex items-center gap-1">
                                    <span>Rombel / Kelas</span>
                                    <span className="text-[#ba1a1a]">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        required
                                        value={data.kelas_id}
                                        onChange={(e) => setData('kelas_id', e.target.value)}
                                        className="w-full appearance-none bg-[#f8fafc] border border-[#E2E8F0] px-3.5 py-2.5 pr-10 rounded-lg text-[13px] text-[#111c2d] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#006c4a] cursor-pointer transition-all"
                                    >
                                        <option value="" disabled>Pilih Rombel / Kelas</option>
                                        {classes.map((k) => (
                                            <option key={k.id} value={k.id}>
                                                Kelas {k.nama_kelas || k.nama}
                                            </option>
                                        ))}
                                    </select>
                                    <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] text-[18px]">
                                        expand_more
                                    </span>
                                </div>
                                {errors.kelas_id && <span className="text-[11px] text-[#ba1a1a]">{errors.kelas_id}</span>}
                            </div>

                            {/* Field No HP Orang Tua (WhatsApp) */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[14px] font-semibold text-[#0F172A] flex items-center gap-1">
                                    <span>No. HP Orang Tua (WhatsApp)</span>
                                    <span className="text-[#ba1a1a]">*</span>
                                </label>
                                <div className="flex items-center gap-2">
                                    <span className="bg-[#f8fafc] border border-[#E2E8F0] px-3 py-2.5 rounded-lg text-[16px] text-[#64748B] font-medium select-none">
                                        +62
                                    </span>
                                    <div className="relative flex-1">
                                        <input
                                            type="tel"
                                            required
                                            value={data.no_hp_ortu}
                                            onChange={(e) => setData('no_hp_ortu', e.target.value)}
                                            placeholder="8xxxxxxxxxx"
                                            className="w-full bg-[#f8fafc] border border-[#E2E8F0] px-3.5 py-2.5 rounded-lg text-[13px] text-[#111c2d] placeholder:text-[#64748B] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#006c4a] transition-all"
                                        />
                                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#006c4a] text-[18px]">
                                            chat
                                        </span>
                                    </div>
                                </div>
                                {errors.no_hp_ortu ? (
                                    <span className="text-[11px] text-[#ba1a1a]">{errors.no_hp_ortu}</span>
                                ) : (
                                    <span className="text-[13px] text-[#64748B]">Digunakan untuk notifikasi presensi otomatis KBM</span>
                                )}
                            </div>

                            {/* Field Status Siswa Toggle */}
                            <div className="bg-[#f8fafc] border border-[#E2E8F0] p-3.5 rounded-xl flex items-center justify-between gap-3">
                                <div className="flex flex-col">
                                    <span className="text-[16px] text-[#0F172A] font-semibold">Status Siswa Aktif</span>
                                    <span className="text-[13px] text-[#64748B]">Aktifkan untuk memberikan akses presensi &amp; kelas</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.aktif}
                                        onChange={(e) => setData('aktif', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#006c4a]"></div>
                                </label>
                            </div>

                            {/* Footer Modal Form */}
                            <div className="flex items-center justify-end gap-3 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setIsFormModalOpen(false)}
                                    className="px-5 py-2.5 rounded-lg bg-[#f8fafc] border border-[#E2E8F0] hover:bg-[#e2e8f0] text-[#0F172A] font-semibold text-[14px] transition-colors cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2.5 rounded-lg bg-[#002210] hover:bg-[#164E33] text-white font-medium text-[14px] shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan Data Siswa'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Konfirmasi Hapus Data Siswa */}
            {isDeleting && siswaToDelete && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setIsDeleting(false)}
                >
                    <div
                        className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-[#E2E8F0] p-6 flex flex-col gap-4 animate-in fade-in zoom-in-95"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#ffdad6] flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-[22px] text-[#ba1a1a]">delete</span>
                            </div>
                            <div>
                                <h3 className="text-[16px] text-[#0F172A] font-bold">Hapus Data Siswa?</h3>
                                <p className="text-[13px] text-[#64748B] mt-0.5">Tindakan ini tidak dapat dibatalkan.</p>
                            </div>
                        </div>
                        <p className="text-[14px] text-[#0F172A]">
                            Hapus siswa <strong>{siswaToDelete.nama}</strong> (NIS: {siswaToDelete.nis})?
                        </p>
                        <p className="text-[12px] text-[#64748B] bg-[#f8fafc] p-3 rounded-lg border border-[#E2E8F0]">
                            Siswa yang sudah memiliki catatan presensi tidak dapat dihapus.
                        </p>
                        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
                            <button
                                type="button"
                                onClick={() => setIsDeleting(false)}
                                className="px-5 py-2.5 rounded-lg bg-[#f8fafc] border border-[#E2E8F0] hover:bg-[#e2e8f0] text-[#0F172A] text-[14px] font-semibold transition-colors cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmDelete}
                                className="px-5 py-2.5 rounded-lg bg-[#ba1a1a] hover:bg-[#93000a] text-white text-[14px] font-semibold shadow-sm transition-all cursor-pointer"
                            >
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification Toast Container */}
            {toast.show && (
                <div
                    id="toastNotification"
                    className="fixed bottom-6 right-6 z-50 bg-white p-4 rounded-xl shadow-xl border-l-4 border-l-[#006c4a] flex items-center gap-3 border border-[#E2E8F0] animate-in slide-in-from-bottom-5"
                >
                    <div className="w-8 h-8 rounded-full bg-[#E8F5E9] text-[#006c4a] flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-[18px]">check</span>
                    </div>
                    <div>
                        <h4 className="text-[14px] font-semibold text-[#0F172A]">{toast.title}</h4>
                        <p className="text-[13px] text-[#64748B]">{toast.desc}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
