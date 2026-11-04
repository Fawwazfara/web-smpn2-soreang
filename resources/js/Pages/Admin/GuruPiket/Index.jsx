import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

const HARI_LIST = [
    { id: 1, nama: 'Senin', label: 'Senin' },
    { id: 2, nama: 'Selasa', label: 'Selasa' },
    { id: 3, nama: 'Rabu', label: 'Rabu' },
    { id: 4, nama: 'Kamis', label: 'Kamis' },
    { id: 5, nama: 'Jumat', label: 'Jumat' },
    { id: 6, nama: 'Sabtu', label: 'Sabtu' },
];

export default function Index({
    tahunAjaranAktif,
    selectedTahunAjaran,
    semuaTahunAjaran,
    jadwalPiket = [],
    daftarGuruPiket = [],
}) {
    const { flash } = usePage().props;
    const [selectedDayTab, setSelectedDayTab] = useState(1);
    const [showAddModal, setShowAddModal] = useState(false);
    const [deletingItem, setDeletingItem] = useState(null);

    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm({
        tahun_ajaran_id: selectedTahunAjaran?.id || '',
        hari: selectedDayTab,
        user_id: '',
    });

    const openAddModal = (hariId) => {
        clearErrors();
        setData({
            tahun_ajaran_id: selectedTahunAjaran?.id || '',
            hari: hariId ?? selectedDayTab,
            user_id: '',
        });
        setShowAddModal(true);
    };

    const closeAddModal = () => {
        setShowAddModal(false);
        clearErrors();
        reset();
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        post(route('admin.guru-piket.store'), {
            preserveScroll: true,
            onSuccess: () => {
                closeAddModal();
            },
        });
    };

    const handleDelete = (item) => {
        router.delete(route('admin.guru-piket.destroy', item.id), {
            preserveScroll: true,
            onSuccess: () => {
                setDeletingItem(null);
            },
        });
    };

    const handleTahunAjaranChange = (tahunId) => {
        router.get(
            route('admin.guru-piket.index'),
            { tahun_ajaran_id: tahunId },
            { preserveState: true, preserveScroll: true }
        );
    };

    // Filter assigned pickets by day
    const getPiketByHari = (hariId) => {
        return jadwalPiket.filter((item) => Number(item.hari) === Number(hariId));
    };

    const activeDayPikets = getPiketByHari(selectedDayTab);

    // List of teachers already assigned to selected day in this academic year
    const assignedUserIdsForActiveDay = activeDayPikets.map((item) => item.user_id);

    return (
        <AuthenticatedLayout>
            <Head title="Manajemen Jadwal Guru Piket" />

            <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
                {/* Header Section */}
                <div className="bg-[#E8EEFF] rounded-[24px] border border-[#C5CEE3] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#82F5C1] text-[#002114]">
                                Tahun Ajaran: {selectedTahunAjaran?.nama ?? 'Belum Ada'} ({selectedTahunAjaran?.semester ?? '-'})
                            </span>
                            {selectedTahunAjaran?.aktif && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#143823] text-white">
                                    Aktif
                                </span>
                            )}
                        </div>
                        <h1 className="text-2xl font-bold text-[#111C2D] mt-2">
                            Kelola Jadwal Penugasan Guru Piket
                        </h1>
                        <p className="text-sm text-[#3F463F] mt-1">
                            Atur pembagian penugasan guru piket harian (Senin s/d Sabtu) untuk siap melayani penggantian jam belajar.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Selector Tahun Ajaran */}
                        <div className="flex items-center gap-2">
                            <label htmlFor="ta_select" className="text-xs font-semibold text-[#111C2D]">
                                Pilih T.A:
                            </label>
                            <select
                                id="ta_select"
                                value={selectedTahunAjaran?.id || ''}
                                onChange={(e) => handleTahunAjaranChange(e.target.value)}
                                className="bg-[#E8EEFF] text-xs font-medium text-[#111C2D] border border-[#C5CEE3] rounded-[8px] px-3 py-2 focus:ring-[#006C4A] focus:border-[#006C4A]"
                            >
                                {semuaTahunAjaran.map((ta) => (
                                    <option key={ta.id} value={ta.id}>
                                        {ta.nama} - {ta.semester} {ta.aktif ? '(Aktif)' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedTahunAjaran && (
                            <PrimaryButton
                                onClick={() => openAddModal(selectedDayTab)}
                                className="bg-[#002114] hover:bg-[#143823] text-white text-xs font-semibold rounded-[8px] px-4 py-2 flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                                Tambah Petugas Piket
                            </PrimaryButton>
                        )}
                    </div>
                </div>

                {/* Flash Success Message */}
                {flash?.success && (
                    <div className="bg-[#82F5C1]/30 border border-[#006C4A] text-[#002114] px-4 py-3 rounded-[12px] flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <svg className="w-5 h-5 text-[#006C4A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            {flash.success}
                        </div>
                    </div>
                )}

                {/* If no academic year exists */}
                {!selectedTahunAjaran ? (
                    <div className="bg-[#E8EEFF] rounded-[24px] border border-[#C5CEE3] p-12 text-center">
                        <svg className="w-12 h-12 text-[#3F463F] mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-lg font-semibold text-[#111C2D]">Belum Ada Tahun Ajaran</h3>
                        <p className="text-sm text-[#3F463F] mt-1 max-w-md mx-auto">
                            Silakan tambahkan dan aktifkan Tahun Ajaran terlebih dahulu di menu Data Master Tahun Ajaran.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Day Tabs */}
                        <div className="flex flex-wrap gap-2 border-b border-[#C5CEE3] pb-3">
                            {HARI_LIST.map((h) => {
                                const count = getPiketByHari(h.id).length;
                                const isActive = selectedDayTab === h.id;
                                return (
                                    <button
                                        key={h.id}
                                        type="button"
                                        onClick={() => setSelectedDayTab(h.id)}
                                        className={`px-4 py-2.5 rounded-[12px] text-xs font-semibold flex items-center gap-2 transition-all ${
                                            isActive
                                                ? 'bg-[#002114] text-white shadow-sm'
                                                : 'bg-[#E8EEFF] text-[#3F463F] hover:bg-white hover:text-[#111C2D] border border-[#C5CEE3]'
                                        }`}
                                    >
                                        <span>{h.nama}</span>
                                        <span
                                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                isActive
                                                    ? 'bg-[#82F5C1] text-[#002114]'
                                                    : 'bg-[#C5CEE3] text-[#111C2D]'
                                            }`}
                                        >
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Active Day Card / Overview */}
                        <div className="bg-[#E8EEFF] rounded-[24px] border border-[#C5CEE3] p-6 shadow-sm space-y-4">
                            <div className="flex items-center justify-between flex-wrap gap-3">
                                <div>
                                    <h2 className="text-lg font-bold text-[#111C2D]">
                                        Daftar Guru Piket Hari {HARI_LIST.find((h) => h.id === selectedDayTab)?.nama}
                                    </h2>
                                    <p className="text-xs text-[#3F463F]">
                                        Petugas piket yang bertugas menerima permohonan penggantian jam mengajar guru pada hari ini.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => openAddModal(selectedDayTab)}
                                    className="bg-[#143823] hover:bg-[#002114] text-[#82F5C1] text-xs font-semibold rounded-[8px] px-3.5 py-2 flex items-center gap-1.5 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                    Tambah ke Hari Ini
                                </button>
                            </div>

                            {activeDayPikets.length === 0 ? (
                                <div className="p-8 text-center bg-white/60 rounded-[16px] border border-dashed border-[#C5CEE3]">
                                    <svg className="w-10 h-10 text-[#3F463F]/50 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                    </svg>
                                    <p className="text-sm font-semibold text-[#111C2D]">Belum ada guru piket yang ditugaskan</p>
                                    <p className="text-xs text-[#3F463F] mt-1">
                                        Klik tombol "Tambah ke Hari Ini" di atas untuk menambahkan guru piket.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {activeDayPikets.map((item) => (
                                        <div
                                            key={item.id}
                                            className="bg-white rounded-[16px] border border-[#C5CEE3] p-4 flex flex-col justify-between hover:shadow-sm transition-all"
                                        >
                                            <div className="space-y-2">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <h3 className="text-sm font-bold text-[#111C2D]">
                                                            {item.user?.nama ?? 'Nama tidak ditemukan'}
                                                        </h3>
                                                        <p className="text-xs text-[#3F463F]">
                                                            NIP/Username: {item.user?.username ?? '-'}
                                                        </p>
                                                    </div>
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#82F5C1]/40 text-[#006C4A]">
                                                        Piket Aktif
                                                    </span>
                                                </div>

                                                <div className="pt-2 border-t border-[#C5CEE3]/50 flex items-center justify-between text-xs">
                                                    <div className="flex items-center gap-1.5 text-[#3F463F]">
                                                        <svg className="w-4 h-4 text-[#006C4A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                        </svg>
                                                        <span className="font-medium text-[#111C2D]">{item.user?.no_wa || '-'}</span>
                                                    </div>
                                                    {item.user?.no_wa && (
                                                        <a
                                                            href={`https://wa.me/${item.user.no_wa.replace(/[^0-9]/g, '')}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-[11px] font-semibold text-[#006C4A] hover:underline flex items-center gap-1"
                                                        >
                                                            Tes Chat WA
                                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                            </svg>
                                                        </a>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="mt-4 pt-3 border-t border-[#C5CEE3]/60 flex items-center justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => setDeletingItem(item)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#C41E1E] bg-[#C41E1E]/10 hover:bg-[#C41E1E]/20 rounded-[8px] transition-colors"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    Hapus Penugasan
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Weekly Matrix Overview (Senin - Sabtu in columns) */}
                        <div className="bg-[#E8EEFF] rounded-[24px] border border-[#C5CEE3] p-6 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-base font-bold text-[#111C2D]">
                                        Ringkasan Matriks Mingguan (Senin - Sabtu)
                                    </h2>
                                    <p className="text-xs text-[#3F463F]">
                                        Rekap cepat distribusi petugas piket sepanjang minggu aktif.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
                                {HARI_LIST.map((h) => {
                                    const pikets = getPiketByHari(h.id);
                                    return (
                                        <div
                                            key={h.id}
                                            className={`rounded-[16px] border p-3 flex flex-col justify-between ${
                                                selectedDayTab === h.id
                                                    ? 'bg-white border-[#006C4A] ring-2 ring-[#006C4A]/20'
                                                    : 'bg-white/70 border-[#C5CEE3]'
                                            }`}
                                        >
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-bold text-xs text-[#111C2D]">{h.nama}</span>
                                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#E8EEFF] text-[#143823]">
                                                        {pikets.length}
                                                    </span>
                                                </div>

                                                <ul className="space-y-1.5">
                                                    {pikets.length === 0 ? (
                                                        <li className="text-[11px] text-[#3F463F]/70 italic">
                                                            Belum ada petugas
                                                        </li>
                                                    ) : (
                                                        pikets.map((p) => (
                                                            <li
                                                                key={p.id}
                                                                className="text-[11px] font-medium text-[#111C2D] bg-[#CFD9F0]/40 rounded-[6px] px-2 py-1 truncate"
                                                                title={p.user?.nama}
                                                            >
                                                                {p.user?.nama}
                                                            </li>
                                                        ))
                                                    )}
                                                </ul>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedDayTab(h.id);
                                                    openAddModal(h.id);
                                                }}
                                                className="mt-3 w-full text-[10px] font-semibold text-[#006C4A] hover:text-[#002114] py-1 text-center border-t border-[#C5CEE3]/50"
                                            >
                                                + Tambah
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Modal Tambah Guru Piket */}
            <Modal show={showAddModal} onClose={closeAddModal} maxWidth="md">
                <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-[#C5CEE3] pb-3">
                        <h2 className="text-lg font-bold text-[#111C2D]">
                            Tambah Penugasan Guru Piket
                        </h2>
                        <button
                            type="button"
                            onClick={closeAddModal}
                            className="text-[#3F463F] hover:text-[#111C2D]"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Tahun Ajaran */}
                    <div>
                        <InputLabel value="Tahun Ajaran" className="text-xs font-semibold text-[#111C2D]" />
                        <input
                            type="text"
                            readOnly
                            disabled
                            value={`${selectedTahunAjaran?.nama ?? ''} (${selectedTahunAjaran?.semester ?? ''})`}
                            className="mt-1 w-full text-xs bg-[#CFD9F0]/50 border border-[#C5CEE3] rounded-[8px] px-3 py-2 text-[#3F463F] cursor-not-allowed"
                        />
                    </div>

                    {/* Hari Piket */}
                    <div>
                        <InputLabel htmlFor="modal_hari" value="Hari Piket" className="text-xs font-semibold text-[#111C2D]" />
                        <select
                            id="modal_hari"
                            value={data.hari}
                            onChange={(e) => setData('hari', Number(e.target.value))}
                            className="mt-1 w-full text-xs bg-[#E8EEFF] border border-[#C5CEE3] rounded-[8px] px-3 py-2 text-[#111C2D] focus:ring-[#006C4A] focus:border-[#006C4A]"
                        >
                            {HARI_LIST.map((h) => (
                                <option key={h.id} value={h.id}>
                                    {h.nama}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.hari} className="mt-1" />
                    </div>

                    {/* Pilih Guru Piket */}
                    <div>
                        <InputLabel htmlFor="modal_user_id" value="Pilih Guru Piket" className="text-xs font-semibold text-[#111C2D]" />
                        <select
                            id="modal_user_id"
                            value={data.user_id}
                            onChange={(e) => setData('user_id', e.target.value)}
                            className="mt-1 w-full text-xs bg-[#E8EEFF] border border-[#C5CEE3] rounded-[8px] px-3 py-2 text-[#111C2D] focus:ring-[#006C4A] focus:border-[#006C4A]"
                        >
                            <option value="">-- Pilih Guru Ber-role guru_piket --</option>
                            {daftarGuruPiket.map((guru) => {
                                const isAlreadyAssigned = assignedUserIdsForActiveDay.includes(guru.id) && Number(data.hari) === Number(selectedDayTab);
                                return (
                                    <option
                                        key={guru.id}
                                        value={guru.id}
                                        disabled={isAlreadyAssigned}
                                    >
                                        {guru.nama} ({guru.username}) - WA: {guru.no_wa} {isAlreadyAssigned ? '[Sudah ditugaskan hari ini]' : ''}
                                    </option>
                                );
                            })}
                        </select>
                        <p className="text-[11px] text-[#3F463F] mt-1">
                            Hanya menampilkan user ber-role <code>guru_piket</code> yang aktif dan memiliki nomor WhatsApp.
                        </p>
                        <InputError message={errors.user_id} className="mt-1" />
                    </div>

                    <div className="pt-4 border-t border-[#C5CEE3] flex justify-end gap-2">
                        <SecondaryButton
                            type="button"
                            onClick={closeAddModal}
                            className="rounded-[8px] text-xs font-semibold"
                        >
                            Batal
                        </SecondaryButton>
                        <PrimaryButton
                            type="submit"
                            disabled={processing}
                            className="bg-[#002114] hover:bg-[#143823] text-white rounded-[8px] text-xs font-semibold"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan Penugasan'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Modal Konfirmasi Hapus */}
            <Modal show={!!deletingItem} onClose={() => setDeletingItem(null)} maxWidth="sm">
                <div className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#C41E1E]/10 flex items-center justify-center text-[#C41E1E]">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-[#111C2D]">Hapus Penugasan Piket</h3>
                            <p className="text-xs text-[#3F463F] mt-0.5">
                                Tindakan ini tidak dapat dibatalkan.
                            </p>
                        </div>
                    </div>

                    <p className="text-xs text-[#3F463F]">
                        Apakah Anda yakin ingin menghapus penugasan piket untuk guru{' '}
                        <strong className="text-[#111C2D]">{deletingItem?.user?.nama}</strong> pada hari{' '}
                        <strong className="text-[#111C2D]">
                            {HARI_LIST.find((h) => h.id === Number(deletingItem?.hari))?.nama}
                        </strong>
                        ?
                    </p>

                    <div className="pt-3 border-t border-[#C5CEE3] flex justify-end gap-2">
                        <SecondaryButton
                            type="button"
                            onClick={() => setDeletingItem(null)}
                            className="rounded-[8px] text-xs font-semibold"
                        >
                            Batal
                        </SecondaryButton>
                        <DangerButton
                            type="button"
                            onClick={() => handleDelete(deletingItem)}
                            className="bg-[#C41E1E] hover:bg-[#a51818] rounded-[8px] text-xs font-semibold"
                        >
                            Ya, Hapus
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}

