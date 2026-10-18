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
import { useState } from 'react';

const roleLabels = {
    guru: 'Guru',
    guru_piket: 'Guru Piket',
    kepsek: 'Kepsek',
};

const emptyUser = {
    username: '',
    nama: '',
    email: '',
    role: 'guru',
    jenis_pegawai: 'guru',
    password: '',
    password_confirmation: '',
    aktif: true,
};

export default function Index({ users }) {
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);

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
        setEditingId(null);
        clearErrors();
        reset();
        setShowModal(true);
    };

    const openEdit = (user) => {
        setEditingId(user.id);
        clearErrors();
        setData({
            username: user.username,
            nama: user.nama,
            email: user.email ?? '',
            role: user.role,
            jenis_pegawai: user.jenis_pegawai ?? 'guru',
            password: '',
            password_confirmation: '',
            aktif: user.aktif,
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingId(null);
        clearErrors();
        reset();
    };

    const submit = (e) => {
        e.preventDefault();

        if (editingId) {
            patch(route('users.update', editingId), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('users.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const destroy = (user) => {
        if (confirm(`Hapus akun "${user.nama}"? Riwayat absen/jadwal terkait ikut terhapus.`)) {
            router.delete(route('users.destroy', user.id), {
                preserveScroll: true,
            });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Manajemen Pengguna
                </h2>
            }
        >
            <Head title="Manajemen Pengguna" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="flex items-center justify-between p-6">
                            <div className="text-gray-900">
                                Daftar akun guru, guru piket, dan kepsek.
                            </div>

                            <PrimaryButton onClick={openCreate}>
                                Tambah Pengguna
                            </PrimaryButton>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            NIP/NUPTK
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Nama
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Role
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Jenis Pegawai
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {users.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan="7"
                                                className="px-6 py-4 text-center text-sm text-gray-500"
                                            >
                                                Belum ada pengguna.
                                            </td>
                                        </tr>
                                    )}

                                    {users.map((user) => (
                                        <tr key={user.id}>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                                {user.username}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                                {user.nama}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                {user.email ?? '-'}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                {roleLabels[user.role] ??
                                                    user.role}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                {user.jenis_pegawai ?? '-'}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                <span
                                                    className={
                                                        user.aktif
                                                            ? 'rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700'
                                                            : 'rounded-full bg-gray-200 px-2 py-1 text-xs font-medium text-gray-600'
                                                    }
                                                >
                                                    {user.aktif
                                                        ? 'Aktif'
                                                        : 'Nonaktif'}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                                                <button
                                                    onClick={() =>
                                                        openEdit(user)
                                                    }
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        destroy(user)
                                                    }
                                                    className="ms-4 text-red-600 hover:text-red-900"
                                                >
                                                    Hapus
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={showModal} onClose={closeModal} maxWidth="lg">
                <form onSubmit={submit} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">
                        {editingId ? 'Edit Pengguna' : 'Tambah Pengguna'}
                    </h2>

                    <div className="mt-6 space-y-4">
                        <div>
                            <InputLabel htmlFor="username" value="NIP/NUPTK" />

                            <TextInput
                                id="username"
                                className="mt-1 block w-full"
                                value={data.username}
                                onChange={(e) =>
                                    setData('username', e.target.value)
                                }
                                required
                            />

                            <InputError
                                className="mt-2"
                                message={errors.username}
                            />
                        </div>

                        <div>
                            <InputLabel htmlFor="nama" value="Nama" />

                            <TextInput
                                id="nama"
                                className="mt-1 block w-full"
                                value={data.nama}
                                onChange={(e) =>
                                    setData('nama', e.target.value)
                                }
                                required
                            />

                            <InputError className="mt-2" message={errors.nama} />
                        </div>

                        <div>
                            <InputLabel htmlFor="email" value="Email (opsional)" />

                            <TextInput
                                id="email"
                                type="email"
                                className="mt-1 block w-full"
                                value={data.email}
                                onChange={(e) =>
                                    setData('email', e.target.value)
                                }
                            />

                            <InputError
                                className="mt-2"
                                message={errors.email}
                            />
                        </div>

                        <div>
                            <InputLabel htmlFor="role" value="Role" />

                            <select
                                id="role"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={data.role}
                                onChange={(e) =>
                                    setData('role', e.target.value)
                                }
                            >
                                <option value="guru">Guru</option>
                                <option value="guru_piket">Guru Piket</option>
                                <option value="kepsek">Kepsek</option>
                            </select>

                            <InputError className="mt-2" message={errors.role} />
                        </div>

                        {data.role === 'guru' && (
                            <div>
                                <InputLabel
                                    htmlFor="jenis_pegawai"
                                    value="Jenis Pegawai"
                                />

                                <select
                                    id="jenis_pegawai"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={data.jenis_pegawai}
                                    onChange={(e) =>
                                        setData(
                                            'jenis_pegawai',
                                            e.target.value,
                                        )
                                    }
                                >
                                    <option value="guru">Guru</option>
                                    <option value="tenaga_kependidikan">
                                        Tenaga Kependidikan
                                    </option>
                                </select>

                                <InputError
                                    className="mt-2"
                                    message={errors.jenis_pegawai}
                                />
                            </div>
                        )}

                        <div>
                            <InputLabel
                                htmlFor="password"
                                value={
                                    editingId
                                        ? 'Password Baru (kosongkan jika tidak diubah)'
                                        : 'Password'
                                }
                            />

                            <TextInput
                                id="password"
                                type="password"
                                className="mt-1 block w-full"
                                value={data.password}
                                onChange={(e) =>
                                    setData('password', e.target.value)
                                }
                                autoComplete="new-password"
                            />

                            <InputError
                                className="mt-2"
                                message={errors.password}
                            />
                        </div>

                        <div>
                            <InputLabel
                                htmlFor="password_confirmation"
                                value="Konfirmasi Password"
                            />

                            <TextInput
                                id="password_confirmation"
                                type="password"
                                className="mt-1 block w-full"
                                value={data.password_confirmation}
                                onChange={(e) =>
                                    setData(
                                        'password_confirmation',
                                        e.target.value,
                                    )
                                }
                                autoComplete="new-password"
                            />
                        </div>

                        <label className="flex items-center">
                            <Checkbox
                                name="aktif"
                                checked={data.aktif}
                                onChange={(e) =>
                                    setData('aktif', e.target.checked)
                                }
                            />
                            <span className="ms-2 text-sm text-gray-600">
                                Aktif
                            </span>
                        </label>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={closeModal}>
                            Batal
                        </SecondaryButton>

                        <PrimaryButton className="ms-3" disabled={processing}>
                            Simpan
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
