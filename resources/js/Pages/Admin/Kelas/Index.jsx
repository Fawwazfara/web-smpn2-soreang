import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

const emptyKelas = {
    nama: '',
    tingkat: '7',
    tahun_ajaran_id: '',
    wali_kelas_id: '',
};

export default function Index({
    kelas,
    tahunAjaran,
    waliKelas,
    tahunAjaranId,
}) {
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
    } = useForm({
        ...emptyKelas,
        tahun_ajaran_id: tahunAjaranId ?? '',
    });

    const tahunAjaranAktif = tahunAjaran.find((item) => item.aktif);

    const openCreate = () => {
        setEditingId(null);
        clearErrors();
        reset();
        setData({
            ...emptyKelas,
            tahun_ajaran_id: tahunAjaranId ?? '',
        });
        setShowModal(true);
    };

    const openEdit = (item) => {
        setEditingId(item.id);
        clearErrors();
        setData({
            nama: item.nama,
            tingkat: String(item.tingkat),
            tahun_ajaran_id: item.tahun_ajaran_id,
            wali_kelas_id: item.wali_kelas_id ?? '',
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
            patch(route('kelas.update', editingId), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('kelas.store'), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const destroy = (item) => {
        if (confirm(`Hapus kelas "${item.nama}"?`)) {
            router.delete(route('kelas.destroy', item.id), {
                preserveScroll: true,
            });
        }
    };

    const filterByTahunAjaran = (value) => {
        router.get(
            route('kelas.index'),
            value ? { tahun_ajaran_id: value } : {},
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Kelas
                </h2>
            }
        >
            <Head title="Kelas" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <div className="text-gray-900">
                                    Daftar kelas per tahun ajaran.
                                </div>
                                <div className="mt-1 text-sm text-gray-500">
                                    Tahun ajaran aktif:{' '}
                                    {tahunAjaranAktif
                                        ? `${tahunAjaranAktif.nama} ${tahunAjaranAktif.semester}`
                                        : 'belum ada'}
                                </div>
                            </div>

                            <PrimaryButton
                                onClick={openCreate}
                                disabled={tahunAjaran.length === 0}
                            >
                                Tambah Kelas
                            </PrimaryButton>
                        </div>

                        {errors.kelas && (
                            <div className="mx-6 mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
                                {errors.kelas}
                            </div>
                        )}

                        {tahunAjaran.length === 0 ? (
                            <div className="border-t border-gray-200 px-6 py-10 text-center text-sm text-gray-500">
                                Belum ada tahun ajaran.{' '}
                                <Link
                                    href={route('tahun-ajaran.index')}
                                    className="text-indigo-600 hover:text-indigo-900"
                                >
                                    Tambahkan tahun ajaran terlebih dahulu.
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className="flex flex-col gap-3 border-t border-gray-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-3">
                                        <InputLabel
                                            htmlFor="filter_tahun_ajaran"
                                            value="Tahun Ajaran"
                                        />

                                        <select
                                            id="filter_tahun_ajaran"
                                            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            value={tahunAjaranId ?? ''}
                                            onChange={(e) =>
                                                filterByTahunAjaran(
                                                    e.target.value,
                                                )
                                            }
                                        >
                                            {tahunAjaran.map((item) => (
                                                <option
                                                    key={item.id}
                                                    value={item.id}
                                                >
                                                    {item.nama} {item.semester}
                                                    {item.aktif
                                                        ? ' (aktif)'
                                                        : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <Link
                                        href={route('tahun-ajaran.index')}
                                        className="text-sm text-indigo-600 hover:text-indigo-900"
                                    >
                                        Kelola Tahun Ajaran
                                    </Link>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    Nama Kelas
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    Tingkat
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    Tahun Ajaran
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    Wali Kelas
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    Aksi
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {kelas.length === 0 && (
                                                <tr>
                                                    <td
                                                        colSpan="5"
                                                        className="px-6 py-4 text-center text-sm text-gray-500"
                                                    >
                                                        Belum ada kelas pada
                                                        tahun ajaran ini.
                                                    </td>
                                                </tr>
                                            )}

                                            {kelas.map((item) => (
                                                <tr key={item.id}>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                                        {item.nama}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                        {item.tingkat}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                        {item.tahun_ajaran
                                                            ? `${item.tahun_ajaran.nama} ${item.tahun_ajaran.semester}`
                                                            : '-'}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                        {item.wali_kelas ? (
                                                            <>
                                                                {
                                                                    item
                                                                        .wali_kelas
                                                                        .nama
                                                                }
                                                                <span className="ms-1 text-xs text-gray-400">
                                                                    (
                                                                    {
                                                                        item
                                                                            .wali_kelas
                                                                            .username
                                                                    }
                                                                    )
                                                                </span>
                                                            </>
                                                        ) : (
                                                            '-'
                                                        )}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                                                        <button
                                                            onClick={() =>
                                                                openEdit(item)
                                                            }
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                destroy(item)
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
                            </>
                        )}
                    </div>
                </div>
            </div>

            <Modal show={showModal} onClose={closeModal} maxWidth="lg">
                <form onSubmit={submit} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">
                        {editingId ? 'Edit Kelas' : 'Tambah Kelas'}
                    </h2>

                    <div className="mt-6 space-y-4">
                        <div>
                            <InputLabel htmlFor="nama" value="Nama Kelas" />

                            <TextInput
                                id="nama"
                                className="mt-1 block w-full"
                                value={data.nama}
                                onChange={(e) =>
                                    setData('nama', e.target.value)
                                }
                                placeholder="7A"
                                required
                            />

                            <InputError
                                className="mt-2"
                                message={errors.nama}
                            />
                        </div>

                        <div>
                            <InputLabel htmlFor="tingkat" value="Tingkat" />

                            <TextInput
                                id="tingkat"
                                type="number"
                                min="1"
                                className="mt-1 block w-full"
                                value={data.tingkat}
                                onChange={(e) =>
                                    setData('tingkat', e.target.value)
                                }
                                required
                            />

                            <InputError
                                className="mt-2"
                                message={errors.tingkat}
                            />
                        </div>

                        <div>
                            <InputLabel
                                htmlFor="tahun_ajaran_id"
                                value="Tahun Ajaran"
                            />

                            <select
                                id="tahun_ajaran_id"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={data.tahun_ajaran_id}
                                onChange={(e) =>
                                    setData(
                                        'tahun_ajaran_id',
                                        e.target.value,
                                    )
                                }
                                required
                            >
                                <option value="">Pilih tahun ajaran</option>
                                {tahunAjaran.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.nama} {item.semester}
                                        {item.aktif ? ' (aktif)' : ''}
                                    </option>
                                ))}
                            </select>

                            <InputError
                                className="mt-2"
                                message={errors.tahun_ajaran_id}
                            />
                        </div>

                        <div>
                            <InputLabel
                                htmlFor="wali_kelas_id"
                                value="Wali Kelas"
                            />

                            <select
                                id="wali_kelas_id"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={data.wali_kelas_id}
                                onChange={(e) =>
                                    setData('wali_kelas_id', e.target.value)
                                }
                            >
                                <option value="">Belum ditentukan</option>
                                {waliKelas.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.nama} ({item.username})
                                    </option>
                                ))}
                            </select>

                            <InputError
                                className="mt-2"
                                message={errors.wali_kelas_id}
                            />
                        </div>
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
