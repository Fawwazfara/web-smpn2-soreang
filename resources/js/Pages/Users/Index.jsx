import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

const roleMeta = {
    guru: {
        label: 'Guru',
        badge: 'bg-[#E6F5EE] text-[#0E7452] border-[#CBE9DA]',
    },
    guru_piket: {
        label: 'Guru Piket',
        badge: 'bg-[#FEF3E2] text-[#B45309] border-[#FDE2B8]',
    },
    kepsek: {
        label: 'Kepala Sekolah',
        badge: 'bg-[#EBF1FF] text-[#1E40AF] border-[#D4E1FF]',
    },
};

const emptyUser = {
    username: '',
    nama: '',
    email: '',
    no_wa: '',
    role: 'guru',
    jenis_pegawai: 'guru',
    password: '',
    password_confirmation: '',
    aktif: true,
};

export default function Index({ users = [], filters = {}, counts = {} }) {
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [search, setSearch] = useState(filters.search ?? '');
    const [roleFilter, setRoleFilter] = useState(filters.role ?? '');
    const [statusFilter, setStatusFilter] = useState(filters.status ?? '');

    const {
        data,
        setData,
        post,
        patch,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm(emptyUser);

    const openCreate = () => {
        setEditingUser(null);
        clearErrors();
        reset();
        setShowModal(true);
    };

    const openEdit = (user) => {
        setEditingUser(user);
        clearErrors();
        setData({
            username: user.username,
            nama: user.nama,
            email: user.email ?? '',
            no_wa: user.no_wa ?? '',
            role: user.role,
            jenis_pegawai: user.jenis_pegawai ?? 'guru',
            password: '',
            password_confirmation: '',
            aktif: Boolean(user.aktif),
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingUser(null);
        clearErrors();
        reset();
    };

    const handleRoleChange = (newRole) => {
        setData((prev) => ({
            ...prev,
            role: newRole,
            jenis_pegawai: newRole === 'guru' ? prev.jenis_pegawai || 'guru' : '',
            no_wa: newRole === 'guru_piket' ? prev.no_wa : '',
        }));
    };

    const submit = (e) => {
        e.preventDefault();

        if (editingUser) {
            patch(route('users.update', editingUser.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('users.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const toggleStatus = (user) => {
        const actionText = user.aktif ? 'menonaktifkan' : 'mengaktifkan kembali';
        if (confirm(`Apakah Anda yakin ingin ${actionText} akun "${user.nama}"?`)) {
            router.patch(
                route('users.toggle-status', user.id),
                {},
                { preserveScroll: true }
            );
        }
    };

    const applyFilters = (newSearch, newRole, newStatus) => {
        router.get(
            route('users.index'),
            {
                search: newSearch || undefined,
                role: newRole || undefined,
                status: newStatus || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    const resetFilters = () => {
        setSearch('');
        setRoleFilter('');
        setStatusFilter('');
        applyFilters('', '', '');
    };

    const hasActiveFilter = Boolean(search || roleFilter || statusFilter);
    const totalCount = counts.total ?? users.length;
    const activeCount = Math.max(0, totalCount - (counts.nonaktif ?? 0));
    const activeRate = totalCount > 0 ? ((activeCount / totalCount) * 100).toFixed(1) : '100.0';

    return (
        <AuthenticatedLayout>
            <Head title="Manajemen Akun - SADA" />

            <div className="space-y-6">
                {/* Page Header (Figma Sub-page Anatomy: Breadcrumb + Left-Border Serif Title + Right CTAs) */}
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
                            <span>ADMIN WORKSPACE</span>
                            <span>›</span>
                            <span>MASTER DATA</span>
                            <span>›</span>
                            <span className="text-[#0E7452]">DATA GURU & STAFF</span>
                        </div>

                        <div className="mt-2 border-l-4 border-[#0F382A] pl-4">
                            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                                Data Guru, Staff & Manajemen Akun
                            </h1>
                        </div>

                        <p className="mt-2 text-xs sm:text-[13px] text-slate-500 max-w-2xl leading-relaxed">
                            Kelola pembuatan, pembaruan, dan status aktif akun Guru Pengajar, Tenaga Kependidikan, Guru Piket, serta Kepala Sekolah SMPN 2 Soreang.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-end">
                        {hasActiveFilter && (
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5ECE9] bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-[#F8FAF9] transition"
                            >
                                Reset Filter
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={openCreate}
                            className="inline-flex items-center gap-2 rounded-xl bg-[#0F382A] px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#164B38] transition"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Tambah Akun Baru
                        </button>
                    </div>
                </div>

                {/* Segmented Pill Filter Card (Figma Screenshot 2 Filter Box) */}
                <div className="rounded-2xl border border-[#E5ECE9] bg-white p-5 shadow-2xs space-y-4">
                    <div className="flex flex-col gap-3">
                        {/* Row 1: Role Akun Pills */}
                        <div className="inline-flex flex-wrap items-center gap-1 rounded-xl bg-[#F4F7F6] px-3 py-1.5 self-start">
                            <span className="mr-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                ROLE AKUN:
                            </span>
                            {[
                                { value: '', label: 'Semua' },
                                { value: 'guru', label: 'Guru & Tenaga Kependidikan' },
                                { value: 'guru_piket', label: 'Guru Piket' },
                                { value: 'kepsek', label: 'Kepala Sekolah' },
                            ].map((opt) => (
                                <button
                                    key={opt.value || 'all'}
                                    type="button"
                                    onClick={() => {
                                        setRoleFilter(opt.value);
                                        applyFilters(search, opt.value, statusFilter);
                                    }}
                                    className={`rounded-lg px-3.5 py-1.5 text-xs transition ${
                                        roleFilter === opt.value
                                            ? 'bg-[#0F382A] text-white font-semibold shadow-2xs'
                                            : 'text-slate-600 font-medium hover:text-slate-900'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>

                        {/* Row 2: Status Akun Pills */}
                        <div className="inline-flex flex-wrap items-center gap-1 rounded-xl bg-[#F4F7F6] px-3 py-1.5 self-start">
                            <span className="mr-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                STATUS AKUN:
                            </span>
                            {[
                                { value: '', label: 'Semua Status' },
                                { value: 'aktif', label: 'Aktif' },
                                { value: 'nonaktif', label: 'Nonaktif / Ditangguhkan' },
                            ].map((opt) => (
                                <button
                                    key={opt.value || 'all-status'}
                                    type="button"
                                    onClick={() => {
                                        setStatusFilter(opt.value);
                                        applyFilters(search, roleFilter, opt.value);
                                    }}
                                    className={`rounded-lg px-3.5 py-1.5 text-xs transition ${
                                        statusFilter === opt.value
                                            ? 'bg-[#10B981] text-white font-semibold shadow-2xs'
                                            : 'text-slate-600 font-medium hover:text-slate-900'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Row 3: Search Input & Action Buttons */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            applyFilters(search, roleFilter, statusFilter);
                        }}
                        className="pt-2 border-t border-[#F0F4F2] flex flex-col sm:flex-row sm:items-end gap-3"
                    >
                        <div className="flex-1">
                            <label
                                htmlFor="user-search-input"
                                className="block text-[10px] font-bold uppercase tracking-wider text-[#0F382A] mb-1.5"
                            >
                                PENCARIAN NAMA / NIP / EMAIL PEGAWAI
                            </label>
                            <div className="relative">
                                <svg
                                    className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                </svg>
                                <input
                                    id="user-search-input"
                                    type="text"
                                    placeholder="Ketik nama lengkap, NIP/NUPTK, atau alamat email..."
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        applyFilters(e.target.value, roleFilter, statusFilter);
                                    }}
                                    className="w-full rounded-xl border-[#E2E8E5] bg-[#F8FAF9] py-2 pl-9 pr-4 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#0E7452] focus:bg-white focus:ring-[#0E7452]"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="submit"
                                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0B6E4F] px-4 py-2 text-xs font-bold text-white hover:bg-[#095C42] transition"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Terapkan
                            </button>
                            <button
                                type="button"
                                onClick={resetFilters}
                                title="Reset Pencarian & Filter"
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E5ECE9] bg-[#F8FAF9] text-slate-500 hover:bg-[#EDF3F0] hover:text-slate-800 transition"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.9" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                                </svg>
                            </button>
                        </div>
                    </form>
                </div>

                {/* 5 KPI Summary Cards (Figma Screenshot 2 5-Column Metrics Row) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {/* 1. Total Akun */}
                    <div className="rounded-2xl border border-[#E5ECE9] bg-white p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
                        <div>
                            <div className="flex items-start justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                    TOTAL AKUN
                                </span>
                                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E6F5EE] text-[#0E7452]">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" />
                                    </svg>
                                </span>
                            </div>
                            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900">
                                {totalCount}
                            </div>
                            <p className="mt-1 text-[10.5px] font-bold text-[#0E7452]">
                                ↗ {activeRate}% Akun Aktif
                            </p>
                        </div>
                        <div className="mt-3 rounded-lg bg-[#F4F9F6] px-2.5 py-1.5 text-[10px] font-bold text-[#0E7452] text-center">
                            Terdaftar di SADA
                        </div>
                    </div>

                    {/* 2. Guru & Tendik */}
                    <div className="rounded-2xl border border-[#E5ECE9] bg-white p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
                        <div>
                            <div className="flex items-start justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                    GURU & TENDIK
                                </span>
                                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#EDF6F1] text-[#0F382A]">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347M12 3.493a59.903 59.903 0 0110.399 5.84" />
                                    </svg>
                                </span>
                            </div>
                            <div className="mt-2 flex items-baseline gap-1">
                                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                                    {counts.guru ?? 0}
                                </span>
                                <span className="text-[11px] font-semibold text-slate-400">Akun</span>
                            </div>
                            <p className="mt-1 text-[10.5px] text-slate-500">
                                Wajib presensi kamera live
                            </p>
                        </div>
                        <div className="mt-3 h-1.5 w-full rounded-full bg-[#EDF2F0] overflow-hidden">
                            <div className="h-full w-full rounded-full bg-[#10B981]" />
                        </div>
                    </div>

                    {/* 3. Guru Piket */}
                    <div className="rounded-2xl border border-[#E5ECE9] bg-white p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
                        <div>
                            <div className="flex items-start justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                    GURU PIKET
                                </span>
                                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FEF3E2] text-[#B45309]">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818" />
                                    </svg>
                                </span>
                            </div>
                            <div className="mt-2 flex items-baseline gap-1">
                                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                                    {counts.guru_piket ?? 0}
                                </span>
                                <span className="text-[11px] font-semibold text-slate-400">Petugas</span>
                            </div>
                            <p className="mt-1 text-[10.5px] text-slate-500">
                                Wajib nomor WhatsApp aktif
                            </p>
                        </div>
                        <div className="mt-3 text-[10px] font-semibold text-[#B45309]">
                            • Pembuka sesi pengganti
                        </div>
                    </div>

                    {/* 4. Kepala Sekolah */}
                    <div className="rounded-2xl border border-[#E5ECE9] bg-white p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
                        <div>
                            <div className="flex items-start justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                    KEPALA SEKOLAH
                                </span>
                                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#EBF1FF] text-[#1E40AF]">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                                    </svg>
                                </span>
                            </div>
                            <div className="mt-2 flex items-baseline gap-1">
                                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                                    {counts.kepsek ?? 0}
                                </span>
                                <span className="text-[11px] font-semibold text-slate-400">Akun</span>
                            </div>
                            <p className="mt-1 text-[10.5px] text-slate-500">
                                Akses monitoring menyeluruh
                            </p>
                        </div>
                        <div className="mt-3 text-[10px] font-semibold text-[#1E40AF]">
                            • Mode Read-Only
                        </div>
                    </div>

                    {/* 5. Nonaktif */}
                    <div className="col-span-2 sm:col-span-1 rounded-2xl border border-[#E5ECE9] bg-white p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
                        <div>
                            <div className="flex items-start justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                    NONAKTIF
                                </span>
                                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FEECEC] text-[#DC2626]">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                    </svg>
                                </span>
                            </div>
                            <div className="mt-2 flex items-baseline gap-1">
                                <span className="text-2xl sm:text-3xl font-extrabold text-[#DC2626]">
                                    {counts.nonaktif ?? 0}
                                </span>
                                <span className="text-[11px] font-semibold text-slate-400">Akun</span>
                            </div>
                            <p className="mt-1 text-[10.5px] text-slate-500">
                                Tidak dihapus permanen
                            </p>
                        </div>
                        <div className="mt-3 rounded-lg bg-[#FFF5F5] px-2.5 py-1.5 text-[10px] font-bold text-[#DC2626] text-center">
                            Login Ditolak Sistem
                        </div>
                    </div>
                </div>

                {/* Users Table Card */}
                <div className="rounded-2xl border border-[#E5ECE9] bg-white shadow-2xs overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-6 py-4 border-b border-[#E5ECE9]">
                        <div className="flex items-center gap-2.5">
                            <span className="h-2.5 w-2.5 rounded-full bg-[#10B981]" />
                            <h2 className="text-base font-bold text-slate-900">
                                Direktori Akun Pengguna
                            </h2>
                            <span className="rounded-full bg-[#E6F5EE] px-2.5 py-0.5 text-[10px] font-bold text-[#0E7452]">
                                {users.length} Akun Ditampilkan
                            </span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                            Akun Admin terpisah & dikecualikan dari daftar ini sesuai aturan SADA
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-[#EDF2F0]">
                            <thead className="bg-[#F8FAF9]">
                                <tr>
                                    <th className="px-6 py-3.5 text-left text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                                        NIP / NUPTK
                                    </th>
                                    <th className="px-6 py-3.5 text-left text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                                        Nama Pegawai & Email
                                    </th>
                                    <th className="px-6 py-3.5 text-left text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                                        Role & Jenis Pegawai
                                    </th>
                                    <th className="px-6 py-3.5 text-left text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                                        Kontak WhatsApp
                                    </th>
                                    <th className="px-6 py-3.5 text-left text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                                        Status Akun
                                    </th>
                                    <th className="px-6 py-3.5 text-right text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#EDF2F0] bg-white">
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center">
                                            <p className="text-xs font-semibold text-slate-500">
                                                Tidak ada akun yang cocok dengan filter saat ini.
                                            </p>
                                            {hasActiveFilter && (
                                                <button
                                                    type="button"
                                                    onClick={resetFilters}
                                                    className="mt-2 text-xs font-bold text-[#0E7452] hover:underline"
                                                >
                                                    Tampilkan Semua Akun →
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => {
                                        const meta = roleMeta[user.role] ?? {
                                            label: user.role,
                                            badge: 'bg-slate-100 text-slate-700 border-slate-200',
                                        };

                                        return (
                                            <tr
                                                key={user.id}
                                                className="hover:bg-[#F8FAF9] transition-colors"
                                            >
                                                <td className="px-6 py-3.5 whitespace-nowrap">
                                                    <span className="inline-flex rounded-lg bg-[#F4F7F6] px-2.5 py-1 font-mono text-xs font-bold text-slate-800">
                                                        {user.username}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0F382A] text-white text-xs font-bold">
                                                            {user.nama?.charAt(0)?.toUpperCase() ?? 'U'}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="text-xs font-bold text-slate-900">
                                                                {user.nama}
                                                            </div>
                                                            <div className="text-[11px] text-slate-400">
                                                                {user.email || 'Email belum diisi'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3.5 whitespace-nowrap">
                                                    <div className="flex flex-col items-start gap-1">
                                                        <span
                                                            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10.5px] font-bold ${meta.badge}`}
                                                        >
                                                            {meta.label}
                                                        </span>
                                                        {user.role === 'guru' && user.jenis_pegawai && (
                                                            <span className="text-[10.5px] font-medium text-slate-500">
                                                                {user.jenis_pegawai === 'tenaga_kependidikan'
                                                                    ? 'Tenaga Kependidikan'
                                                                    : 'Guru Pengajar'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3.5 whitespace-nowrap text-xs">
                                                    {user.no_wa ? (
                                                        <a
                                                            href={`https://wa.me/${user.no_wa}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#E6F5EE] px-2.5 py-1 font-mono text-[11px] font-bold text-[#0E7452] hover:bg-[#D5EFE2] transition"
                                                        >
                                                            <span>{user.no_wa}</span>
                                                            <span>↗</span>
                                                        </a>
                                                    ) : (
                                                        <span className="text-slate-300">—</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-3.5 whitespace-nowrap">
                                                    {user.aktif ? (
                                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E6F5EE] px-2.5 py-0.5 text-[10.5px] font-bold text-[#0E7452]">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                                                            Aktif
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FEECEC] px-2.5 py-0.5 text-[10.5px] font-bold text-[#DC2626]">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-[#DC2626]" />
                                                            Nonaktif
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-3.5 whitespace-nowrap text-right text-xs">
                                                    <div className="inline-flex items-center gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => openEdit(user)}
                                                            className="rounded-lg border border-[#E5ECE9] bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:border-[#0E7452] hover:text-[#0E7452] transition"
                                                        >
                                                            Ubah
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleStatus(user)}
                                                            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                                                                user.aktif
                                                                    ? 'bg-[#FFF5F5] text-[#DC2626] hover:bg-[#FEECEC]'
                                                                    : 'bg-[#E6F5EE] text-[#0E7452] hover:bg-[#D5EFE2]'
                                                            }`}
                                                        >
                                                            {user.aktif ? 'Nonaktifkan' : 'Aktifkan'}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Form Buat / Ubah Akun (SADA Forest Emerald Theme) */}
            <Modal show={showModal} onClose={closeModal} maxWidth="lg">
                <form onSubmit={submit} className="p-6">
                    <div className="flex items-start justify-between gap-3 pb-4 border-b border-[#EDF2F0]">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0F382A] text-white">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.9" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="font-serif text-lg font-bold text-slate-900">
                                    {editingUser ? 'Ubah Data Akun Pengguna' : 'Buat Akun Pengguna Baru'}
                                </h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {editingUser
                                        ? `Memperbarui profil & hak akses ${editingUser.nama}`
                                        : 'Daftarkan akun Guru, Guru Piket, atau Kepala Sekolah SMPN 2 Soreang.'}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={closeModal}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="mt-5 space-y-4">
                        {/* Visual 3-Card Role Selector */}
                        <div>
                            <InputLabel htmlFor="modal-role" value="Pilih Role Akun *" />
                            <div className="mt-1.5 grid grid-cols-3 gap-2.5">
                                {[
                                    {
                                        key: 'guru',
                                        title: 'Guru / Tendik',
                                        desc: 'Mengajar & absen kelas',
                                    },
                                    {
                                        key: 'guru_piket',
                                        title: 'Guru Piket',
                                        desc: 'Buka sesi pengganti',
                                    },
                                    {
                                        key: 'kepsek',
                                        title: 'Kepala Sekolah',
                                        desc: 'Monitoring read-only',
                                    },
                                ].map((item) => {
                                    const selected = data.role === item.key;
                                    return (
                                        <button
                                            key={item.key}
                                            type="button"
                                            onClick={() => handleRoleChange(item.key)}
                                            className={`rounded-xl border p-2.5 text-left transition ${
                                                selected
                                                    ? 'border-[#0F382A] bg-[#EDF6F1] ring-1 ring-[#0F382A]'
                                                    : 'border-[#E5ECE9] bg-white hover:bg-[#F8FAF9]'
                                            }`}
                                        >
                                            <div className="text-xs font-bold text-slate-900">
                                                {item.title}
                                            </div>
                                            <div className="text-[10px] text-slate-500 mt-0.5">
                                                {item.desc}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                            <select
                                id="modal-role"
                                value={data.role}
                                onChange={(e) => handleRoleChange(e.target.value)}
                                className="sr-only"
                            >
                                <option value="guru">Guru</option>
                                <option value="guru_piket">Guru Piket</option>
                                <option value="kepsek">Kepala Sekolah</option>
                            </select>
                            <InputError message={errors.role} className="mt-1" />
                        </div>

                        {/* NIP / NUPTK & Nama */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div>
                                <InputLabel htmlFor="modal-username" value="NIP / NUPTK (Username) *" />
                                <TextInput
                                    id="modal-username"
                                    type="text"
                                    value={data.username}
                                    onChange={(e) => setData('username', e.target.value)}
                                    placeholder="Contoh: 198203152006041002"
                                    className="mt-1 block w-full rounded-xl border-[#DCE5E1] text-xs focus:border-[#0E7452] focus:ring-[#0E7452]"
                                    required
                                />
                                <InputError message={errors.username} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="modal-nama" value="Nama Lengkap & Gelar *" />
                                <TextInput
                                    id="modal-nama"
                                    type="text"
                                    value={data.nama}
                                    onChange={(e) => setData('nama', e.target.value)}
                                    placeholder="Contoh: Drs. H. Asep Sunarya, M.Pd"
                                    className="mt-1 block w-full rounded-xl border-[#DCE5E1] text-xs focus:border-[#0E7452] focus:ring-[#0E7452]"
                                    required
                                />
                                <InputError message={errors.nama} className="mt-1" />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <InputLabel htmlFor="modal-email" value="Alamat Email (Opsional - Untuk Reset Password)" />
                            <TextInput
                                id="modal-email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="Contoh: guru@smpn2soreang.sch.id"
                                className="mt-1 block w-full rounded-xl border-[#DCE5E1] text-xs focus:border-[#0E7452] focus:ring-[#0E7452]"
                            />
                            <InputError message={errors.email} className="mt-1" />
                        </div>

                        {/* Conditional: Jenis Pegawai (Wajib untuk Role Guru) */}
                        {data.role === 'guru' && (
                            <div className="rounded-xl border border-[#CBE9DA] bg-[#F4F9F6] p-3.5">
                                <InputLabel htmlFor="modal-jenis_pegawai" value="Jenis Pegawai (Wajib untuk Role Guru) *" />
                                <select
                                    id="modal-jenis_pegawai"
                                    value={data.jenis_pegawai}
                                    onChange={(e) => setData('jenis_pegawai', e.target.value)}
                                    className="mt-1.5 block w-full rounded-xl border-[#DCE5E1] bg-white text-xs focus:border-[#0E7452] focus:ring-[#0E7452]"
                                >
                                    <option value="guru">Guru Pengajar</option>
                                    <option value="tenaga_kependidikan">Tenaga Kependidikan</option>
                                </select>
                                <p className="mt-1.5 text-[11px] text-[#0E7452]">
                                    Baik Guru Pengajar maupun Tenaga Kependidikan wajib melakukan presensi harian kamera live.
                                </p>
                                <InputError message={errors.jenis_pegawai} className="mt-1" />
                            </div>
                        )}

                        {/* Conditional: Nomor WhatsApp (Wajib untuk Role Guru Piket) */}
                        {data.role === 'guru_piket' && (
                            <div className="rounded-xl border border-[#FDE2B8] bg-[#FFF9F0] p-3.5">
                                <InputLabel
                                    htmlFor="modal-no_wa"
                                    value="Nomor WhatsApp Aktif (Wajib untuk Guru Piket) *"
                                />
                                <TextInput
                                    id="modal-no_wa"
                                    type="text"
                                    value={data.no_wa}
                                    onChange={(e) => setData('no_wa', e.target.value)}
                                    placeholder="Contoh: 6281234567890"
                                    className="mt-1.5 block w-full rounded-xl border-[#E5D5B5] bg-white text-xs focus:border-[#B45309] focus:ring-[#B45309]"
                                    required
                                />
                                <p className="mt-1.5 text-[11px] text-[#B45309]">
                                    Gunakan awalan kode negara (628...). Nomor ini terhubung langsung ke tombol Hubungi WA di dashboard guru.
                                </p>
                                <InputError message={errors.no_wa} className="mt-1" />
                            </div>
                        )}

                        {/* Password & Konfirmasi */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-[#EDF2F0]">
                            <div>
                                <InputLabel
                                    htmlFor="modal-password"
                                    value={editingUser ? 'Password Baru (Opsional)' : 'Password Awal *'}
                                />
                                <TextInput
                                    id="modal-password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder={editingUser ? 'Kosongkan bila tetap' : 'Minimal 8 karakter'}
                                    className="mt-1 block w-full rounded-xl border-[#DCE5E1] text-xs focus:border-[#0E7452] focus:ring-[#0E7452]"
                                    required={!editingUser}
                                    autoComplete="new-password"
                                />
                                <InputError message={errors.password} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="modal-password_confirmation"
                                    value="Konfirmasi Password"
                                />
                                <TextInput
                                    id="modal-password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    placeholder="Ketik ulang password"
                                    className="mt-1 block w-full rounded-xl border-[#DCE5E1] text-xs focus:border-[#0E7452] focus:ring-[#0E7452]"
                                    required={Boolean(data.password)}
                                    autoComplete="new-password"
                                />
                            </div>
                        </div>

                        {/* Status Aktif */}
                        <div className="rounded-xl border border-[#E5ECE9] bg-[#F8FAF9] p-3">
                            <label className="flex items-center gap-2.5 cursor-pointer">
                                <Checkbox
                                    checked={data.aktif}
                                    onChange={(e) => setData('aktif', e.target.checked)}
                                    className="text-[#0F382A] focus:ring-[#0E7452]"
                                />
                                <div>
                                    <span className="block text-xs font-bold text-slate-800">
                                        Status Akun Aktif (Diizinkan Login)
                                    </span>
                                    <span className="block text-[11px] text-slate-500">
                                        Nonaktifkan bila pegawai sudah mutasi/pensiun tanpa menghapus riwayat data.
                                    </span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-[#EDF2F0] pt-4">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="rounded-xl border border-[#E5ECE9] bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-[#F8FAF9] transition"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-xl bg-[#0F382A] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#164B38] disabled:opacity-60 transition"
                        >
                            {editingUser ? 'Simpan Perubahan' : 'Buat Akun'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
