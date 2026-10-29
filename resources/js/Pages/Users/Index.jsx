import Checkbox from '@/Components/Checkbox';
import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';

const roleMeta = {
    guru: {
        label: 'Guru Pengajar',
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    guru_piket: {
        label: 'Guru Piket',
        badge: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    kepsek: {
        label: 'Kepala Sekolah',
        badge: 'bg-purple-50 text-purple-700 border-purple-200',
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
            jenis_pegawai: newRole === 'guru' ? (prev.jenis_pegawai || 'guru') : '',
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
            router.patch(route('users.toggle-status', user.id), {}, {
                preserveScroll: true,
            });
        }
    };

    const handleFilterChange = (newSearch, newRole, newStatus) => {
        router.get(
            route('users.index'),
            {
                search: newSearch,
                role: newRole,
                status: newStatus,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-800">
                            Manajemen Akun Pengguna
                        </h1>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Kelola data akun Guru, Guru Piket, dan Kepala Sekolah (SMPN 2 Soreang).
                        </p>
                    </div>

                    <PrimaryButton
                        onClick={openCreate}
                        className="inline-flex items-center gap-2 justify-center py-2.5 px-4 text-xs font-semibold shadow-sm"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Tambah Akun Baru
                    </PrimaryButton>
                </div>
            }
        >
            <Head title="Manajemen Akun - SADA" />

            <div className="space-y-6">
                {/* Stats Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-xs font-medium text-slate-500">Total Akun</span>
                        <div className="text-xl font-bold text-slate-800 mt-1">{counts.total ?? users.length}</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-xs font-medium text-emerald-600">Guru</span>
                        <div className="text-xl font-bold text-slate-800 mt-1">{counts.guru ?? 0}</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-xs font-medium text-amber-600">Guru Piket</span>
                        <div className="text-xl font-bold text-slate-800 mt-1">{counts.guru_piket ?? 0}</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-xs font-medium text-purple-600">Kepsek</span>
                        <div className="text-xl font-bold text-slate-800 mt-1">{counts.kepsek ?? 0}</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-xs font-medium text-rose-500">Nonaktif</span>
                        <div className="text-xl font-bold text-slate-800 mt-1">{counts.nonaktif ?? 0}</div>
                    </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                    <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                        {/* Search Input */}
                        <div className="w-full md:w-80 relative">
                            <input
                                type="text"
                                placeholder="Cari nama, NIP, atau email..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    handleFilterChange(e.target.value, roleFilter, statusFilter);
                                }}
                                className="w-full rounded-lg border-slate-300 text-xs pl-9 pr-4 py-2 focus:border-blue-500 focus:ring-blue-500"
                            />
                            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                            </svg>
                        </div>

                        {/* Filters */}
                        <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
                            {/* Role Filter Tabs */}
                            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setRoleFilter('');
                                        handleFilterChange(search, '', statusFilter);
                                    }}
                                    className={`px-3 py-1 font-medium rounded-md transition ${
                                        roleFilter === '' ? 'bg-white shadow-2xs text-blue-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    Semua
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setRoleFilter('guru');
                                        handleFilterChange(search, 'guru', statusFilter);
                                    }}
                                    className={`px-3 py-1 font-medium rounded-md transition ${
                                        roleFilter === 'guru' ? 'bg-white shadow-2xs text-emerald-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    Guru
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setRoleFilter('guru_piket');
                                        handleFilterChange(search, 'guru_piket', statusFilter);
                                    }}
                                    className={`px-3 py-1 font-medium rounded-md transition ${
                                        roleFilter === 'guru_piket' ? 'bg-white shadow-2xs text-amber-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    Guru Piket
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setRoleFilter('kepsek');
                                        handleFilterChange(search, 'kepsek', statusFilter);
                                    }}
                                    className={`px-3 py-1 font-medium rounded-md transition ${
                                        roleFilter === 'kepsek' ? 'bg-white shadow-2xs text-purple-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    Kepsek
                                </button>
                            </div>

                            {/* Status Filter */}
                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    handleFilterChange(search, roleFilter, e.target.value);
                                }}
                                className="rounded-lg border-slate-300 text-xs py-1.5 px-3 bg-white text-slate-700 focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="">Semua Status</option>
                                <option value="aktif">Aktif</option>
                                <option value="nonaktif">Nonaktif</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50/75">
                                <tr>
                                    <th className="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                        NIP / NUPTK
                                    </th>
                                    <th className="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                        Nama & Email
                                    </th>
                                    <th className="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                        Role & Jenis
                                    </th>
                                    <th className="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                        No. WhatsApp
                                    </th>
                                    <th className="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-5 py-3 text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-5 py-12 text-center text-xs text-slate-400">
                                            Tidak ada akun yang sesuai kriteria pencarian.
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => {
                                        const meta = roleMeta[user.role] ?? {
                                            label: user.role,
                                            badge: 'bg-slate-100 text-slate-700 border-slate-200',
                                        };

                                        return (
                                            <tr key={user.id} className="hover:bg-slate-50/60 transition">
                                                <td className="px-5 py-3.5 whitespace-nowrap">
                                                    <span className="font-mono text-xs font-semibold text-slate-800">
                                                        {user.username}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <div className="text-xs font-semibold text-slate-800">
                                                        {user.nama}
                                                    </div>
                                                    <div className="text-[11px] text-slate-400">
                                                        {user.email || '—'}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5 whitespace-nowrap">
                                                    <div className="flex flex-col gap-1 items-start">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${meta.badge}`}>
                                                            {meta.label}
                                                        </span>
                                                        {user.role === 'guru' && user.jenis_pegawai && (
                                                            <span className="text-[10px] text-slate-500">
                                                                {user.jenis_pegawai === 'tenaga_kependidikan'
                                                                    ? 'Tenaga Kependidikan'
                                                                    : 'Guru'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5 whitespace-nowrap text-xs text-slate-600 font-mono">
                                                    {user.no_wa ? (
                                                        <a
                                                            href={`https://wa.me/${user.no_wa}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-emerald-600 hover:underline flex items-center gap-1"
                                                        >
                                                            <span>{user.no_wa}</span>
                                                        </a>
                                                    ) : (
                                                        <span className="text-slate-400">—</span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3.5 whitespace-nowrap">
                                                    {user.aktif ? (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-green-50 text-green-700 border border-green-200">
                                                            Aktif
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                                            Nonaktif
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3.5 whitespace-nowrap text-right text-xs">
                                                    <div className="inline-flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => openEdit(user)}
                                                            className="text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 transition"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleStatus(user)}
                                                            className={`font-medium px-2 py-1 rounded transition ${
                                                                user.aktif
                                                                    ? 'text-rose-600 hover:text-rose-800 hover:bg-rose-50'
                                                                    : 'text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50'
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

            {/* Modal Form Tambah / Ubah Akun */}
            <Modal show={showModal} onClose={closeModal} maxWidth="lg">
                <form onSubmit={submit} className="p-6">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div>
                            <h2 className="text-base font-bold text-slate-800">
                                {editingUser ? 'Ubah Akun Pengguna' : 'Buat Akun Pengguna Baru'}
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                {editingUser
                                    ? `Memperbarui data akun ${editingUser.nama}`
                                    : 'Isi informasi akun guru, guru piket, atau kepsek.'}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={closeModal}
                            className="text-slate-400 hover:text-slate-600 rounded-lg p-1"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="mt-5 space-y-4">
                        {/* Role Selector */}
                        <div>
                            <InputLabel htmlFor="modal-role" value="Role Akun *" />
                            <select
                                id="modal-role"
                                value={data.role}
                                onChange={(e) => handleRoleChange(e.target.value)}
                                className="mt-1 block w-full rounded-lg border-slate-300 text-xs shadow-2xs focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="guru">Guru</option>
                                <option value="guru_piket">Guru Piket</option>
                                <option value="kepsek">Kepala Sekolah (Kepsek)</option>
                            </select>
                            <p className="text-[11px] text-slate-400 mt-1">
                                {data.role === 'guru' && 'Guru pengajar yang mencatat absensi siswa di kelas.'}
                                {data.role === 'guru_piket' && 'Guru piket bertugas membuka sesi pengganti dengan kode unik.'}
                                {data.role === 'kepsek' && 'Kepala sekolah memiliki akses monitoring menyeluruh (read-only).'}
                            </p>
                            <InputError message={errors.role} className="mt-1" />
                        </div>

                        {/* NIP / NUPTK (Username) */}
                        <div>
                            <InputLabel htmlFor="modal-username" value="NIP / NUPTK (Username Login) *" />
                            <TextInput
                                id="modal-username"
                                type="text"
                                value={data.username}
                                onChange={(e) => setData('username', e.target.value)}
                                placeholder="Contoh: 198203152006041002"
                                className="mt-1 block w-full text-xs"
                                required
                            />
                            <p className="text-[11px] text-slate-400 mt-1">
                                Digunakan sebagai username utama untuk masuk ke sistem SADA.
                            </p>
                            <InputError message={errors.username} className="mt-1" />
                        </div>

                        {/* Nama Lengkap */}
                        <div>
                            <InputLabel htmlFor="modal-nama" value="Nama Lengkap & Gelar *" />
                            <TextInput
                                id="modal-nama"
                                type="text"
                                value={data.nama}
                                onChange={(e) => setData('nama', e.target.value)}
                                placeholder="Contoh: Dra. Hj. Siti Rohmah, M.Pd"
                                className="mt-1 block w-full text-xs"
                                required
                            />
                            <InputError message={errors.nama} className="mt-1" />
                        </div>

                        {/* Email */}
                        <div>
                            <InputLabel htmlFor="modal-email" value="Email (Opsional)" />
                            <TextInput
                                id="modal-email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="Contoh: guru@smpn2soreang.sch.id"
                                className="mt-1 block w-full text-xs"
                            />
                            <p className="text-[11px] text-slate-400 mt-1">
                                Digunakan untuk link reset password via email jika pengguna lupa password.
                            </p>
                            <InputError message={errors.email} className="mt-1" />
                        </div>

                        {/* Conditional: No WhatsApp (Wajib untuk Guru Piket) */}
                        {data.role === 'guru_piket' && (
                            <div className="p-3 bg-amber-50/70 rounded-lg border border-amber-200">
                                <InputLabel
                                    htmlFor="modal-no_wa"
                                    value="Nomor WhatsApp (Wajib untuk Guru Piket) *"
                                />
                                <TextInput
                                    id="modal-no_wa"
                                    type="text"
                                    value={data.no_wa}
                                    onChange={(e) => setData('no_wa', e.target.value)}
                                    placeholder="Contoh: 6281234567890"
                                    className="mt-1 block w-full text-xs"
                                    required
                                />
                                <p className="text-[11px] text-amber-700 mt-1">
                                    Format nomor WhatsApp diawali kode negara (misal: 628...). Nomor ini akan langsung dihubungi guru yang berhalangan via wa.me.
                                </p>
                                <InputError message={errors.no_wa} className="mt-1" />
                            </div>
                        )}

                        {/* Conditional: Jenis Pegawai (Wajib untuk Guru) */}
                        {data.role === 'guru' && (
                            <div>
                                <InputLabel htmlFor="modal-jenis_pegawai" value="Jenis Pegawai *" />
                                <select
                                    id="modal-jenis_pegawai"
                                    value={data.jenis_pegawai}
                                    onChange={(e) => setData('jenis_pegawai', e.target.value)}
                                    className="mt-1 block w-full rounded-lg border-slate-300 text-xs shadow-2xs focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="guru">Guru</option>
                                    <option value="tenaga_kependidikan">Tenaga Kependidikan</option>
                                </select>
                                <p className="text-[11px] text-slate-400 mt-1">
                                    Sesuai aturan sekolah, tenaga kependidikan juga wajib melakukan absen harian.
                                </p>
                                <InputError message={errors.jenis_pegawai} className="mt-1" />
                            </div>
                        )}

                        {/* Password Section */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
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
                                    placeholder={editingUser ? 'Kosongkan jika tak diubah' : 'Minimal 8 karakter'}
                                    className="mt-1 block w-full text-xs"
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
                                    placeholder="Ulangi password"
                                    className="mt-1 block w-full text-xs"
                                    required={Boolean(data.password)}
                                    autoComplete="new-password"
                                />
                            </div>
                        </div>

                        {/* Status Aktif Checkbox */}
                        <div className="pt-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <Checkbox
                                    checked={data.aktif}
                                    onChange={(e) => setData('aktif', e.target.checked)}
                                />
                                <span className="text-xs font-medium text-slate-700">
                                    Akun Aktif (Dapat masuk ke aplikasi)
                                </span>
                            </label>
                            <p className="text-[11px] text-slate-400 ml-6 mt-0.5">
                                Jika dinonaktifkan, akun tidak dapat melakukan login ke sistem.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                        <SecondaryButton onClick={closeModal} type="button" className="text-xs">
                            Batal
                        </SecondaryButton>
                        <PrimaryButton disabled={processing} className="text-xs">
                            {editingUser ? 'Simpan Perubahan' : 'Buat Akun'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
