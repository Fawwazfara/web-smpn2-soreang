import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { Head, router, useForm } from '@inertiajs/react';
import { useState, useMemo } from 'react';

const HARI_NAMES = {
    1: 'Senin',
    2: 'Selasa',
    3: 'Rabu',
    4: 'Kamis',
    5: 'Jumat',
    6: 'Sabtu',
};

export default function Index({ versions, selectedVersion, slots, kelasList, mapelList, guruList, jamList, flash }) {
    const [showVersionModal, setShowVersionModal] = useState(false);
    const [showSlotModal, setShowSlotModal] = useState(false);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [showCopyModal, setShowCopyModal] = useState(false);
    
    const [editingVersion, setEditingVersion] = useState(null);
    const [selectedKelasFilter, setSelectedKelasFilter] = useState(kelasList[0]?.id || '');
    
    // Slot modal state
    const [activeSlotData, setActiveSlotData] = useState({
        hari: 1,
        jam_pelajaran_id: jamList[0]?.id || '',
        kelas_id: kelasList[0]?.id || '',
        mapel_id: '',
        guru_id: '',
    });

    const versionForm = useForm({
        nama: '',
        berlaku_mulai: '',
        berlaku_sampai: '',
    });

    const generateForm = useForm({
        tanggal_mulai: new Date().toISOString().slice(0, 10),
        tanggal_selesai: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    });

    const copyForm = useForm({
        source_versi_id: versions.filter(v => v.id !== selectedVersion?.id)[0]?.id || '',
    });

    const openCreateVersion = () => {
        setEditingVersion(null);
        versionForm.reset();
        versionForm.clearErrors();
        setShowVersionModal(true);
    };

    const openEditVersion = (ver) => {
        setEditingVersion(ver);
        versionForm.setData({
            nama: ver.nama,
            berlaku_mulai: ver.berlaku_mulai?.slice(0, 10) || '',
            berlaku_sampai: ver.berlaku_sampai?.slice(0, 10) || '',
        });
        versionForm.clearErrors();
        setShowVersionModal(true);
    };

    const submitVersion = (e) => {
        e.preventDefault();
        if (editingVersion) {
            versionForm.patch(route('jadwal.versi.update', editingVersion.id), {
                onSuccess: () => setShowVersionModal(false),
            });
        } else {
            versionForm.post(route('jadwal.versi.store'), {
                onSuccess: () => setShowVersionModal(false),
            });
        }
    };

    const handlePublish = (verId) => {
        if (confirm('Terbitkan versi jadwal ini? Versi aktif sebelumnya akan diarsipkan.')) {
            router.patch(route('jadwal.versi.publish', verId));
        }
    };

    const handleCopy = (e) => {
        e.preventDefault();
        copyForm.post(route('jadwal.versi.copy', selectedVersion.id), {
            onSuccess: () => setShowCopyModal(false),
        });
    };

    const handleGenerate = (e) => {
        e.preventDefault();
        generateForm.post(route('jadwal.generate-sesi'), {
            onSuccess: () => setShowGenerateModal(false),
        });
    };

    const openSlotModal = (hari, jamId, kelasId) => {
        const existing = slots.find(
            s => s.hari === hari && s.jam_pelajaran_id === jamId && s.kelas_id === Number(kelasId)
        );
        setActiveSlotData({
            hari,
            jam_pelajaran_id: jamId,
            kelas_id: kelasId,
            mapel_id: existing ? existing.mapel_id : (mapelList[0]?.id || ''),
            guru_id: existing ? existing.guru_id : (guruList[0]?.id || ''),
        });
        setShowSlotModal(true);
    };

    const saveSlot = (e) => {
        e.preventDefault();
        router.post(route('jadwal.slot.store', selectedVersion.id), activeSlotData, {
            onSuccess: () => setShowSlotModal(false),
        });
    };

    const deleteSlot = (slotId) => {
        if (confirm('Hapus slot pelajaran ini?')) {
            router.delete(route('jadwal.slot.destroy', slotId));
        }
    };

    // Index slots by [hari][jam_id][kelas_id] for quick matrix lookup
    const slotMatrix = useMemo(() => {
        const map = {};
        slots.forEach(s => {
            if (!map[s.hari]) map[s.hari] = {};
            if (!map[s.hari][s.jam_pelajaran_id]) map[s.hari][s.jam_pelajaran_id] = {};
            map[s.hari][s.jam_pelajaran_id][s.kelas_id] = s;
        });
        return map;
    }, [slots]);

    const currentKelas = kelasList.find(k => k.id == selectedKelasFilter);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-[#111C2D] leading-tight">
                            Matriks Jadwal KBM & Versi
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Kelola versi jadwal pelajaran, slot guru & mapel, serta generate sesi absensi harian.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {selectedVersion && selectedVersion.status === 'aktif' && (
                            <PrimaryButton onClick={() => setShowGenerateModal(true)} className="bg-emerald-700 hover:bg-emerald-800 text-xs">
                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Generate Sesi Harian
                            </PrimaryButton>
                        )}
                        <PrimaryButton onClick={openCreateVersion} className="text-xs">
                            + Buat Versi Baru
                        </PrimaryButton>
                    </div>
                </div>
            }
        >
            <Head title="Matriks Jadwal KBM" />

            <div className="space-y-6">
                {/* Flash Messages */}
                {flash?.message && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium shadow-xs">
                        {flash.message}
                    </div>
                )}
                {flash?.error && (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium shadow-xs">
                        {flash.error}
                    </div>
                )}

                {/* Versions Bar */}
                <div className="bg-white rounded-2xl border border-[#C5CEE3] p-4 sm:p-6 shadow-xs">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Daftar Versi Jadwal</span>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                {versions.map((ver) => {
                                    const isSelected = selectedVersion?.id === ver.id;
                                    return (
                                        <button
                                            key={ver.id}
                                            onClick={() => router.get(route('jadwal.index', { versi_id: ver.id }))}
                                            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 border ${
                                                isSelected
                                                    ? 'bg-[#143823] text-white border-[#143823] shadow-sm'
                                                    : 'bg-[#E8EEFF] text-[#111C2D] border-[#C5CEE3] hover:bg-slate-200'
                                            }`}
                                        >
                                            <span>{ver.nama}</span>
                                            <span
                                                className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                                                    ver.status === 'aktif'
                                                        ? 'bg-emerald-500 text-white'
                                                        : ver.status === 'draf'
                                                        ? 'bg-amber-400 text-amber-950'
                                                        : 'bg-slate-400 text-white'
                                                }`}
                                            >
                                                {ver.status}
                                            </span>
                                        </button>
                                    );
                                })}
                                {versions.length === 0 && (
                                    <p className="text-xs text-slate-500">Belum ada versi jadwal. Klik "Buat Versi Baru".</p>
                                )}
                            </div>
                        </div>

                        {selectedVersion && (
                            <div className="flex items-center gap-2 shrink-0">
                                {selectedVersion.status === 'draf' && (
                                    <>
                                        <PrimaryButton
                                            onClick={() => handlePublish(selectedVersion.id)}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-xs py-2"
                                        >
                                            Terbitkan Versi Ini
                                        </PrimaryButton>
                                        <SecondaryButton
                                            onClick={() => setShowCopyModal(true)}
                                            className="text-xs py-2"
                                        >
                                            Salin dari Versi Lain
                                        </SecondaryButton>
                                    </>
                                )}
                                <SecondaryButton
                                    onClick={() => openEditVersion(selectedVersion)}
                                    className="text-xs py-2"
                                >
                                    Edit Info
                                </SecondaryButton>
                                {selectedVersion.status !== 'aktif' && (
                                    <DangerButton
                                        onClick={() => {
                                            if (confirm('Hapus versi jadwal draf ini?')) {
                                                router.delete(route('jadwal.versi.destroy', selectedVersion.id));
                                            }
                                        }}
                                        className="text-xs py-2"
                                    >
                                        Hapus
                                    </DangerButton>
                                )}
                            </div>
                        )}
                    </div>

                    {selectedVersion && (
                        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs text-slate-600">
                            <div>
                                <span className="text-slate-400">Periode Berlaku:</span>{' '}
                                <strong className="text-slate-800">
                                    {selectedVersion.berlaku_mulai ? new Date(selectedVersion.berlaku_mulai).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'} s.d. {selectedVersion.berlaku_sampai ? new Date(selectedVersion.berlaku_sampai).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                </strong>
                            </div>
                            <div>
                                <span className="text-slate-400">Total Slot Terisi:</span>{' '}
                                <strong className="text-slate-800">{slots.length} slot</strong>
                            </div>
                        </div>
                    )}
                </div>

                {/* Matrix / Grid Section */}
                {selectedVersion ? (
                    <div className="bg-white rounded-2xl border border-[#C5CEE3] shadow-xs overflow-hidden">
                        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <h3 className="font-bold text-base text-[#111C2D]">
                                    Matriks Per Kelas
                                </h3>
                                <select
                                    value={selectedKelasFilter}
                                    onChange={(e) => setSelectedKelasFilter(e.target.value)}
                                    className="rounded-xl border-[#C5CEE3] bg-[#E8EEFF] text-xs font-semibold text-[#111C2D] px-3 py-1.5 focus:border-[#006C4A] focus:ring-[#006C4A]"
                                >
                                    {kelasList.map(k => (
                                        <option key={k.id} value={k.id}>Kelas {k.nama}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="text-xs text-slate-500">
                                💡 Klik pada sel jadwal untuk menambah atau mengubah pengampu mapel.
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#E8EEFF] text-[#111C2D] text-xs font-bold border-b border-[#C5CEE3]">
                                        <th className="p-3.5 text-center w-24">Jam Ke</th>
                                        <th className="p-3.5 w-32">Waktu</th>
                                        {[1, 2, 3, 4, 5, 6].map(hari => (
                                            <th key={hari} className="p-3.5 text-center min-w-[180px]">
                                                {HARI_NAMES[hari]}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-xs">
                                    {jamList.map(jam => {
                                        return (
                                            <tr key={jam.id} className="hover:bg-slate-50/80">
                                                <td className="p-3.5 text-center font-bold text-slate-700 bg-slate-50/50">
                                                    Jam ke-{jam.jam_ke}
                                                </td>
                                                <td className="p-3.5 text-slate-500 bg-slate-50/50 font-mono">
                                                    {jam.mulai?.slice(0, 5)} - {jam.selesai?.slice(0, 5)}
                                                </td>
                                                {[1, 2, 3, 4, 5, 6].map(hari => {
                                                    const slot = slotMatrix[hari]?.[jam.id]?.[selectedKelasFilter];
                                                    return (
                                                        <td
                                                            key={hari}
                                                            onClick={() => openSlotModal(hari, jam.id, selectedKelasFilter)}
                                                            className="p-2.5 border-l border-slate-100 cursor-pointer transition hover:bg-emerald-50/50 group"
                                                        >
                                                            {slot ? (
                                                                <div className="p-2 rounded-xl bg-emerald-50/80 border border-emerald-200/60 relative">
                                                                    <div className="font-bold text-emerald-900 truncate">
                                                                        {slot.mapel?.nama}
                                                                    </div>
                                                                    <div className="text-[11px] text-emerald-700 truncate mt-0.5">
                                                                        👨‍🏫 {slot.guru?.nama || slot.guru?.username}
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            deleteSlot(slot.id);
                                                                        }}
                                                                        className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 p-1 bg-white hover:bg-rose-100 text-rose-600 rounded-full shadow-xs transition"
                                                                        title="Hapus slot"
                                                                    >
                                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div className="h-full min-h-[50px] rounded-xl border border-dashed border-slate-200 flex items-center justify-center text-slate-400 group-hover:border-emerald-400 group-hover:text-emerald-600 transition">
                                                                    <span className="text-[11px] font-medium">+ Atur Jadwal</span>
                                                                </div>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="p-12 text-center bg-white rounded-2xl border border-[#C5CEE3]">
                        <p className="text-sm font-semibold text-slate-700">Belum ada versi jadwal yang dipilih.</p>
                        <p className="text-xs text-slate-400 mt-1">Pilih versi di atas atau buat versi baru.</p>
                    </div>
                )}
            </div>

            {/* Modal Versi (Create / Edit) */}
            <Modal show={showVersionModal} onClose={() => setShowVersionModal(false)}>
                <form onSubmit={submitVersion} className="p-6 space-y-4">
                    <h2 className="text-lg font-bold text-[#111C2D]">
                        {editingVersion ? 'Edit Versi Jadwal' : 'Buat Versi Jadwal Baru'}
                    </h2>

                    <div>
                        <InputLabel htmlFor="nama" value="Nama Versi Jadwal" />
                        <TextInput
                            id="nama"
                            value={versionForm.data.nama}
                            onChange={(e) => versionForm.setData('nama', e.target.value)}
                            placeholder="Contoh: Jadwal Semester Genap 2026/2027"
                            className="mt-1 block w-full text-xs"
                            required
                        />
                        <InputError message={versionForm.errors.nama} className="mt-1" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <InputLabel htmlFor="berlaku_mulai" value="Berlaku Mulai" />
                            <TextInput
                                id="berlaku_mulai"
                                type="date"
                                value={versionForm.data.berlaku_mulai}
                                onChange={(e) => versionForm.setData('berlaku_mulai', e.target.value)}
                                className="mt-1 block w-full text-xs"
                                required
                            />
                            <InputError message={versionForm.errors.berlaku_mulai} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="berlaku_sampai" value="Berlaku Sampai" />
                            <TextInput
                                id="berlaku_sampai"
                                type="date"
                                value={versionForm.data.berlaku_sampai}
                                onChange={(e) => versionForm.setData('berlaku_sampai', e.target.value)}
                                className="mt-1 block w-full text-xs"
                                required
                            />
                            <InputError message={versionForm.errors.berlaku_sampai} className="mt-1" />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <SecondaryButton type="button" onClick={() => setShowVersionModal(false)}>
                            Batal
                        </SecondaryButton>
                        <PrimaryButton disabled={versionForm.processing}>
                            Simpan
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Modal Slot (Assign Mapel & Guru) */}
            <Modal show={showSlotModal} onClose={() => setShowSlotModal(false)}>
                <form onSubmit={saveSlot} className="p-6 space-y-4">
                    <h2 className="text-lg font-bold text-[#111C2D]">
                        Atur Slot Pelajaran ({HARI_NAMES[activeSlotData.hari]})
                    </h2>
                    <p className="text-xs text-slate-500">
                        Kelas: <strong className="text-slate-800">{currentKelas?.nama}</strong>
                    </p>

                    <div>
                        <InputLabel htmlFor="mapel_id" value="Mata Pelajaran" />
                        <select
                            id="mapel_id"
                            value={activeSlotData.mapel_id}
                            onChange={(e) => setActiveSlotData({ ...activeSlotData, mapel_id: e.target.value })}
                            className="mt-1 block w-full rounded-xl border-[#C5CEE3] text-xs py-2.5"
                            required
                        >
                            <option value="">-- Pilih Mata Pelajaran --</option>
                            {mapelList.map(m => (
                                <option key={m.id} value={m.id}>{m.nama} ({m.kode})</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <InputLabel htmlFor="guru_id" value="Guru Pengampu" />
                        <select
                            id="guru_id"
                            value={activeSlotData.guru_id}
                            onChange={(e) => setActiveSlotData({ ...activeSlotData, guru_id: e.target.value })}
                            className="mt-1 block w-full rounded-xl border-[#C5CEE3] text-xs py-2.5"
                            required
                        >
                            <option value="">-- Pilih Guru Pengampu --</option>
                            {guruList.map(g => (
                                <option key={g.id} value={g.id}>{g.nama} ({g.username})</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <SecondaryButton type="button" onClick={() => setShowSlotModal(false)}>
                            Batal
                        </SecondaryButton>
                        <PrimaryButton>
                            Simpan Slot
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Modal Generate Sesi Harian */}
            <Modal show={showGenerateModal} onClose={() => setShowGenerateModal(false)}>
                <form onSubmit={handleGenerate} className="p-6 space-y-4">
                    <h2 className="text-lg font-bold text-[#111C2D]">
                        Generate Sesi Harian dari Jadwal Aktif
                    </h2>
                    <p className="text-xs text-slate-500">
                        Sistem akan membuat record sesi absensi kelas secara otomatis berdasarkan slot jadwal aktif untuk rentang tanggal berikut. Hari Minggu dan hari libur akan dilewati secara otomatis.
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <InputLabel htmlFor="tanggal_mulai" value="Tanggal Mulai" />
                            <TextInput
                                id="tanggal_mulai"
                                type="date"
                                value={generateForm.data.tanggal_mulai}
                                onChange={(e) => generateForm.setData('tanggal_mulai', e.target.value)}
                                className="mt-1 block w-full text-xs"
                                required
                            />
                            <InputError message={generateForm.errors.tanggal_mulai} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="tanggal_selesai" value="Tanggal Selesai" />
                            <TextInput
                                id="tanggal_selesai"
                                type="date"
                                value={generateForm.data.tanggal_selesai}
                                onChange={(e) => generateForm.setData('tanggal_selesai', e.target.value)}
                                className="mt-1 block w-full text-xs"
                                required
                            />
                            <InputError message={generateForm.errors.tanggal_selesai} className="mt-1" />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <SecondaryButton type="button" onClick={() => setShowGenerateModal(false)}>
                            Batal
                        </SecondaryButton>
                        <PrimaryButton disabled={generateForm.processing} className="bg-emerald-700 hover:bg-emerald-800">
                            Mulai Generate Sesi
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Modal Copy Version */}
            <Modal show={showCopyModal} onClose={() => setShowCopyModal(false)}>
                <form onSubmit={handleCopy} className="p-6 space-y-4">
                    <h2 className="text-lg font-bold text-[#111C2D]">
                        Salin Slot dari Versi Lain
                    </h2>
                    <p className="text-xs text-slate-500">
                        Semua slot pada versi draf ini akan digantikan dengan salinan slot dari versi sumber yang dipilih.
                    </p>

                    <div>
                        <InputLabel htmlFor="source_versi_id" value="Pilih Versi Sumber" />
                        <select
                            id="source_versi_id"
                            value={copyForm.data.source_versi_id}
                            onChange={(e) => copyForm.setData('source_versi_id', e.target.value)}
                            className="mt-1 block w-full rounded-xl border-[#C5CEE3] text-xs py-2.5"
                            required
                        >
                            <option value="">-- Pilih Versi --</option>
                            {versions.filter(v => v.id !== selectedVersion?.id).map(v => (
                                <option key={v.id} value={v.id}>{v.nama} ({v.status})</option>
                            ))}
                        </select>
                        <InputError message={copyForm.errors.source_versi_id} className="mt-1" />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <SecondaryButton type="button" onClick={() => setShowCopyModal(false)}>
                            Batal
                        </SecondaryButton>
                        <PrimaryButton disabled={copyForm.processing}>
                            Salin Slot Sekarang
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
