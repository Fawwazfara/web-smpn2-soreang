import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

const emptyTahunAjaran = {
    nama: '',
    semester: 'Ganjil',
    tanggal_mulai: '',
    tanggal_selesai: '',
    aktif: false,
};

const formatDate = (value) =>
    value
        ? new Date(value).toLocaleDateString('id-ID', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
          })
        : '-';

export default function Index({ tahunAjaran }) {
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
    } = useForm(emptyTahunAjaran);

    const openCreate = () => {
        setEditingId(null);
        clearErrors();
        reset();
        setShowModal(true);
    };

    const openEdit = (item) => {
        setEditingId(item.id);
        clearErrors();
        setData({
            nama: item.nama,
            semester: item.semester,
            tanggal_mulai: item.tanggal_mulai?.slice(0, 10) ?? '',
            tanggal_selesai: item.tanggal_selesai?.slice(0, 10) ?? '',
            aktif: item.aktif,
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
            patch(route('tahun-ajaran.update', editingId), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('tahun-ajaran.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const activate = (item) => {
        if (confirm(`Jadikan "${item.nama} ${item.semester}" sebagai tahun ajaran aktif?`)) {
            router.patch(
                route('tahun-ajaran.activate', item.id),
                {},
                { preserveScroll: true },
            );
        }
    };

    const destroy = (item) => {
        if (confirm(`Hapus tahun ajaran "${item.nama} ${item.semester}"?`)) {
            router.delete(route('tahun-ajaran.destroy', item.id), {
                preserveScroll: true,
            });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Tahun Ajaran
                </h2>
            }
        >
            <Head title="Tahun Ajaran" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                            <div className="text-gray-900">
                                Kelola tahun ajaran. Hanya satu tahun ajaran
                                yang dapat aktif.
                            </div>

                            <PrimaryButton onClick={openCreate}>
                                Tambah Tahun Ajaran
                            </PrimaryButton>
                        </div>

                        {errors.tahun_ajaran && (
                            <div className="mx-6 mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
                                {errors.tahun_ajaran}
                            </div>
                        )}

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Nama
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Semester
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Tanggal Mulai
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Tanggal Selesai
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
                                    {tahunAjaran.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan="6"
                                                className="px-6 py-4 text-center text-sm text-gray-500"
                                            >
                                                Belum ada tahun ajaran.
                                            </td>
                                        </tr>
                                    )}

                                    {tahunAjaran.map((item) => (
                                        <tr key={item.id}>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                                {item.nama}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                {item.semester}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                {formatDate(item.tanggal_mulai)}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                {formatDate(item.tanggal_selesai)}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                <span
                                                    className={
                                                        item.aktif
                                                            ? 'rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700'
                                                            : 'rounded-full bg-gray-200 px-2 py-1 text-xs font-medium text-gray-600'
                                                    }
                                                >
                                                    {item.aktif
                                                        ? 'Aktif'
                                                        : 'Nonaktif'}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                                                {!item.aktif && (
                                                    <button
                                                        onClick={() =>
                                                            activate(item)
                                                        }
                                                        className="text-green-600 hover:text-green-900"
                                                    >
                                                        Set Aktif
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() =>
                                                        openEdit(item)
                                                    }
                                                    className="ms-4 text-indigo-600 hover:text-indigo-900"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        destroy(item)
                                                    }
                                                    disabled={item.aktif}
                                                    className="ms-4 text-red-600 hover:text-red-900 disabled:cursor-not-allowed disabled:text-gray-400"
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
                        {editingId ? 'Edit Tahun Ajaran' : 'Tambah Tahun Ajaran'}
                    </h2>

                    <div className="mt-6 space-y-4">
                        <div>
                            <InputLabel htmlFor="nama" value="Nama" />

                            <TextInput
                                id="nama"
                                className="mt-1 block w-full"
                                value={data.nama}
                                onChange={(e) =>
                                    setData('nama', e.target.value)
                                }
                                placeholder="2026/2027"
                                required
                            />

                            <InputError
                                className="mt-2"
                                message={errors.nama}
                            />
                        </div>

                        <div>
                            <InputLabel htmlFor="semester" value="Semester" />

                            <select
                                id="semester"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={data.semester}
                                onChange={(e) =>
                                    setData('semester', e.target.value)
                                }
                            >
                                <option value="Ganjil">Ganjil</option>
                                <option value="Genap">Genap</option>
                            </select>

                            <InputError
                                className="mt-2"
                                message={errors.semester}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <InputLabel
                                    htmlFor="tanggal_mulai"
                                    value="Tanggal Mulai"
                                />

                                <TextInput
                                    id="tanggal_mulai"
                                    type="date"
                                    className="mt-1 block w-full"
                                    value={data.tanggal_mulai}
                                    onChange={(e) =>
                                        setData(
                                            'tanggal_mulai',
                                            e.target.value,
                                        )
                                    }
                                    required
                                />

                                <InputError
                                    className="mt-2"
                                    message={errors.tanggal_mulai}
                                />
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="tanggal_selesai"
                                    value="Tanggal Selesai"
                                />

                                <TextInput
                                    id="tanggal_selesai"
                                    type="date"
                                    className="mt-1 block w-full"
                                    value={data.tanggal_selesai}
                                    onChange={(e) =>
                                        setData(
                                            'tanggal_selesai',
                                            e.target.value,
                                        )
                                    }
                                    required
                                />

                                <InputError
                                    className="mt-2"
                                    message={errors.tanggal_selesai}
                                />
                            </div>
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
                                Jadikan tahun ajaran aktif
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
