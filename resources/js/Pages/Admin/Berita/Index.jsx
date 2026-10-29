import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';

const CATEGORY_PRESETS = [
    'Prestasi Siswa',
    'Inovasi Sekolah',
    'Agenda Akademik',
    'Kegiatan & Religi',
    'Fasilitas',
    'Kesiswaan',
    'Ekstrakurikuler',
    'Umum',
];

const emptyBerita = {
    judul: '',
    slug: '',
    kategori: 'Prestasi Siswa',
    ringkasan: '',
    isi: '',
    gambar: null,
    gambar_path: '',
    tanggal: new Date().toISOString().slice(0, 10),
    status: 'terbit',
};

const formatDate = (value) =>
    value
        ? new Date(value).toLocaleDateString('id-ID', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
          })
        : '-';

function generateSlug(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

export default function Index({ berita, filters, kategoriList, flash }) {
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [deletingItem, setDeletingItem] = useState(null);
    const [previewItem, setPreviewItem] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

    const [search, setSearch] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || 'all');
    const [kategoriFilter, setKategoriFilter] = useState(filters?.kategori || 'all');

    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm(emptyBerita);

    const openCreate = () => {
        setEditingItem(null);
        setImagePreviewUrl(null);
        setSlugManuallyEdited(false);
        clearErrors();
        reset();
        setShowModal(true);
    };

    const openEdit = (item) => {
        setEditingItem(item);
        setImagePreviewUrl(item.gambar_path || null);
        setSlugManuallyEdited(true);
        clearErrors();
        setData({
            judul: item.judul || '',
            slug: item.slug || '',
            kategori: item.kategori || 'Prestasi Siswa',
            ringkasan: item.ringkasan || '',
            isi: item.isi || '',
            gambar: null,
            gambar_path: item.gambar_path || '',
            tanggal: item.tanggal?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
            status: item.status || 'terbit',
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingItem(null);
        setImagePreviewUrl(null);
        setSlugManuallyEdited(false);
        clearErrors();
        reset();
    };

    const confirmDelete = (item) => {
        setDeletingItem(item);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setDeletingItem(null);
    };

    const handleDelete = () => {
        if (!deletingItem) return;
        router.delete(route('admin.berita.destroy', deletingItem.id), {
            preserveScroll: true,
            onSuccess: () => closeDeleteModal(),
        });
    };

    const handleTitleChange = (e) => {
        const val = e.target.value;
        if (!slugManuallyEdited) {
            setData((prev) => ({
                ...prev,
                judul: val,
                slug: generateSlug(val),
            }));
        } else {
            setData('judul', val);
        }
    };

    const handleSlugChange = (e) => {
        setSlugManuallyEdited(true);
        setData('slug', e.target.value);
    };

    const handleImageFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('gambar', file);
            setImagePreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleImageUrlChange = (e) => {
        const url = e.target.value;
        setData('gambar_path', url);
        if (!data.gambar) {
            setImagePreviewUrl(url || null);
        }
    };

    const submit = (e) => {
        e.preventDefault();

        if (editingItem) {
            // Using POST with _method=PATCH or direct POST route to support multipart upload
            post(route('admin.berita.update', editingItem.id), {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => closeModal(),
            });
        } else {
            post(route('admin.berita.store'), {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => closeModal(),
            });
        }
    };

    // Client-side quick filter & search
    const filteredBerita = useMemo(() => {
        return berita.filter((item) => {
            const matchesSearch =
                !search.trim() ||
                item.judul?.toLowerCase().includes(search.toLowerCase()) ||
                item.ringkasan?.toLowerCase().includes(search.toLowerCase()) ||
                item.kategori?.toLowerCase().includes(search.toLowerCase());

            const matchesStatus =
                statusFilter === 'all' || item.status === statusFilter;

            const matchesKategori =
                kategoriFilter === 'all' || item.kategori === kategoriFilter;

            return matchesSearch && matchesStatus && matchesKategori;
        });
    }, [berita, search, statusFilter, kategoriFilter]);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold leading-tight text-emerald-950">
                            Manajemen Berita
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Kelola artikel berita dan pengumuman yang ditampilkan pada website publik sekolah.
                        </p>
                    </div>
                    <PrimaryButton
                        onClick={openCreate}
                        className="bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 inline-flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Tambah Berita
                    </PrimaryButton>
                </div>
            }
        >
            <Head title="Manajemen Berita - Admin" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    {/* Success Flash */}
                    {flash?.message && (
                        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>{flash.message}</span>
                            </div>
                        </div>
                    )}

                    {/* Filter and Search Bar */}
                    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
                        <div className="relative flex-1 max-w-md">
                            <input
                                type="text"
                                placeholder="Cari judul, kategori, atau ringkasan..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-emerald-500 focus:border-emerald-500"
                            />
                            <svg
                                className="w-5 h-5 text-gray-400 absolute left-3 top-2.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            {search && (
                                <button
                                    onClick={() => setSearch('')}
                                    className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-gray-600"
                                >
                                    Reset
                                </button>
                            )}
                        </div>

                        <div className="flex flex-wrap sm:flex-nowrap gap-3">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="text-sm border border-gray-300 rounded-lg py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                            >
                                <option value="all">Semua Status</option>
                                <option value="terbit">Terbit (Published)</option>
                                <option value="draf">Draf (Draft)</option>
                            </select>

                            <select
                                value={kategoriFilter}
                                onChange={(e) => setKategoriFilter(e.target.value)}
                                className="text-sm border border-gray-300 rounded-lg py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                            >
                                <option value="all">Semua Kategori</option>
                                {CATEGORY_PRESETS.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Table / List */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-emerald-900/5">
                                    <tr>
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-emerald-950">
                                            Artikel Berita
                                        </th>
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-emerald-950">
                                            Kategori
                                        </th>
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-emerald-950">
                                            Penulis
                                        </th>
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-emerald-950">
                                            Tanggal
                                        </th>
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-emerald-950">
                                            Status
                                        </th>
                                        <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-emerald-950">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {filteredBerita.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                                <div className="flex flex-col items-center justify-center">
                                                    <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                                    </svg>
                                                    <p className="text-base font-medium text-gray-700">Tidak ada berita ditemukan</p>
                                                    <p className="text-sm text-gray-400 mt-1">Coba sesuaikan kata kunci pencarian atau buat berita baru.</p>
                                                    <PrimaryButton onClick={openCreate} className="mt-4 bg-emerald-700">
                                                        Buat Berita Pertama
                                                    </PrimaryButton>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredBerita.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-16 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                                                            {item.gambar_path ? (
                                                                <img
                                                                    src={item.gambar_path}
                                                                    alt={item.judul}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => {
                                                                        e.currentTarget.style.display = 'none';
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0 max-w-md">
                                                            <div className="text-sm font-semibold text-gray-900 line-clamp-1 hover:text-emerald-700">
                                                                {item.judul}
                                                            </div>
                                                            <div className="text-xs text-gray-400 line-clamp-1 mt-0.5">
                                                                {item.ringkasan || item.isi?.slice(0, 80) + '...'}
                                                            </div>
                                                            <div className="text-[11px] text-gray-400 mt-0.5 font-mono">
                                                                /{item.slug}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                                        {item.kategori || 'Umum'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {item.dibuat_oleh?.nama || 'Admin Humas'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatDate(item.tanggal)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {item.status === 'terbit' ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                            Terbit
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                                            Draf
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => setPreviewItem(item)}
                                                            className="p-1.5 text-gray-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition"
                                                            title="Lihat Pratinjau"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => openEdit(item)}
                                                            className="p-1.5 text-blue-600 hover:text-blue-800 rounded-lg hover:bg-blue-50 transition"
                                                            title="Edit Berita"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => confirmDelete(item)}
                                                            className="p-1.5 text-red-600 hover:text-red-800 rounded-lg hover:bg-red-50 transition"
                                                            title="Hapus Berita"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create & Edit Modal */}
            <Modal show={showModal} onClose={closeModal} maxWidth="2xl">
                <form onSubmit={submit} className="p-6">
                    <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900">
                            {editingItem ? 'Edit Berita' : 'Tambah Berita Baru'}
                        </h3>
                        <button
                            type="button"
                            onClick={closeModal}
                            className="text-gray-400 hover:text-gray-500 rounded-lg p-1"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="mt-4 space-y-4 max-h-[72vh] overflow-y-auto px-1 pr-2">
                        {/* Judul */}
                        <div>
                            <InputLabel htmlFor="judul" value="Judul Berita *" />
                            <TextInput
                                id="judul"
                                type="text"
                                className="mt-1 block w-full"
                                value={data.judul}
                                onChange={handleTitleChange}
                                placeholder="Contoh: Siswa SMPN 2 Soreang Raih Medali Emas OSN..."
                                required
                            />
                            <InputError message={errors.judul} className="mt-1" />
                        </div>

                        {/* Slug */}
                        <div>
                            <InputLabel htmlFor="slug" value="URL Slug *" />
                            <div className="mt-1 flex rounded-md shadow-sm">
                                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-xs font-mono">
                                    /berita/
                                </span>
                                <TextInput
                                    id="slug"
                                    type="text"
                                    className="block w-full rounded-l-none font-mono text-xs"
                                    value={data.slug}
                                    onChange={handleSlugChange}
                                    placeholder="siswa-smpn-2-soreang-raih-medali-emas"
                                    required
                                />
                            </div>
                            <InputError message={errors.slug} className="mt-1" />
                        </div>

                        {/* Category & Status & Date Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <InputLabel htmlFor="kategori" value="Kategori *" />
                                <select
                                    id="kategori"
                                    value={data.kategori}
                                    onChange={(e) => setData('kategori', e.target.value)}
                                    className="mt-1 block w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                >
                                    {CATEGORY_PRESETS.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.kategori} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="tanggal" value="Tanggal Publikasi *" />
                                <TextInput
                                    id="tanggal"
                                    type="date"
                                    className="mt-1 block w-full text-sm"
                                    value={data.tanggal}
                                    onChange={(e) => setData('tanggal', e.target.value)}
                                    required
                                />
                                <InputError message={errors.tanggal} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="status" value="Status Publikasi *" />
                                <select
                                    id="status"
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="mt-1 block w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                >
                                    <option value="terbit">Terbit (Publikasikan)</option>
                                    <option value="draf">Draf (Simpan Saja)</option>
                                </select>
                                <InputError message={errors.status} className="mt-1" />
                            </div>
                        </div>

                        {/* Ringkasan */}
                        <div>
                            <InputLabel htmlFor="ringkasan" value="Ringkasan Singkat (Excerpt)" />
                            <textarea
                                id="ringkasan"
                                rows={2}
                                className="mt-1 block w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                value={data.ringkasan}
                                onChange={(e) => setData('ringkasan', e.target.value)}
                                placeholder="Ringkasan 1-2 kalimat untuk kartu berita di landing page..."
                            />
                            <InputError message={errors.ringkasan} className="mt-1" />
                        </div>

                        {/* Konten Utama */}
                        <div>
                            <InputLabel htmlFor="isi" value="Isi Artikel Utama *" />
                            <textarea
                                id="isi"
                                rows={6}
                                className="mt-1 block w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                value={data.isi}
                                onChange={(e) => setData('isi', e.target.value)}
                                placeholder="Tuliskan isi berita atau pengumuman secara lengkap..."
                                required
                            />
                            <InputError message={errors.isi} className="mt-1" />
                        </div>

                        {/* Image Options: Upload File OR URL */}
                        <div className="border-t border-gray-100 pt-3">
                            <InputLabel value="Gambar Berita (Pilih File atau Masukkan URL)" />
                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">
                                        Unggah File Gambar (Maks 5MB)
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageFileChange}
                                        className="block w-full text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                                    />
                                    <InputError message={errors.gambar} className="mt-1" />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">
                                        Atau Tautan URL Gambar
                                    </label>
                                    <TextInput
                                        type="url"
                                        className="block w-full text-xs"
                                        value={data.gambar_path}
                                        onChange={handleImageUrlChange}
                                        placeholder="https://images.unsplash.com/..."
                                    />
                                    <InputError message={errors.gambar_path} className="mt-1" />
                                </div>
                            </div>

                            {/* Image Preview */}
                            {imagePreviewUrl && (
                                <div className="mt-3 relative w-full h-36 rounded-lg overflow-hidden bg-gray-50 border border-gray-200">
                                    <img
                                        src={imagePreviewUrl}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setData('gambar', null);
                                            setData('gambar_path', '');
                                            setImagePreviewUrl(null);
                                        }}
                                        className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 text-xs hover:bg-black"
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                        <SecondaryButton onClick={closeModal} disabled={processing}>
                            Batal
                        </SecondaryButton>
                        <PrimaryButton
                            type="submit"
                            disabled={processing}
                            className="bg-emerald-700 hover:bg-emerald-800"
                        >
                            {processing
                                ? 'Menyimpan...'
                                : editingItem
                                ? 'Perbarui Berita'
                                : data.status === 'terbit'
                                ? 'Publikasikan Berita'
                                : 'Simpan Draf'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onClose={closeDeleteModal} maxWidth="sm">
                <div className="p-6">
                    <div className="flex items-center gap-3 text-red-600 mb-4">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Konfirmasi Hapus</h3>
                            <p className="text-xs text-gray-500">Tindakan ini tidak dapat dibatalkan.</p>
                        </div>
                    </div>

                    <p className="text-sm text-gray-600">
                        Apakah Anda yakin ingin menghapus artikel berita{' '}
                        <strong className="text-gray-900 font-semibold">"{deletingItem?.judul}"</strong>?
                    </p>

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={closeDeleteModal}>
                            Batal
                        </SecondaryButton>
                        <DangerButton onClick={handleDelete}>
                            Hapus Berita
                        </DangerButton>
                    </div>
                </div>
            </Modal>

            {/* Quick Preview Modal */}
            <Modal show={!!previewItem} onClose={() => setPreviewItem(null)} maxWidth="2xl">
                {previewItem && (
                    <div className="p-6">
                        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                                {previewItem.kategori}
                            </span>
                            <button
                                onClick={() => setPreviewItem(null)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                ✕
                            </button>
                        </div>

                        {previewItem.gambar_path && (
                            <div className="mt-4 w-full h-56 rounded-lg overflow-hidden bg-gray-100">
                                <img
                                    src={previewItem.gambar_path}
                                    alt={previewItem.judul}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        <h3 className="text-xl font-bold text-gray-900 mt-4 leading-snug">
                            {previewItem.judul}
                        </h3>

                        <div className="text-xs text-gray-500 mt-2 flex items-center gap-3">
                            <span>{formatDate(previewItem.tanggal)}</span>
                            <span>•</span>
                            <span>Penulis: {previewItem.dibuat_oleh?.nama || 'Admin'}</span>
                            <span>•</span>
                            <span className={previewItem.status === 'terbit' ? 'text-emerald-600 font-semibold' : 'text-amber-600 font-semibold'}>
                                {previewItem.status === 'terbit' ? 'Terbit (Publik)' : 'Draf'}
                            </span>
                        </div>

                        {previewItem.ringkasan && (
                            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-700 italic border-l-4 border-emerald-600">
                                {previewItem.ringkasan}
                            </div>
                        )}

                        <div className="mt-4 text-sm text-gray-800 whitespace-pre-line leading-relaxed">
                            {previewItem.isi}
                        </div>

                        <div className="mt-6 flex justify-end">
                            <SecondaryButton onClick={() => setPreviewItem(null)}>
                                Tutup
                            </SecondaryButton>
                        </div>
                    </div>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}

