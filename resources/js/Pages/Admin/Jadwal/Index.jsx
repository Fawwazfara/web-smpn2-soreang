import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { Head, router, useForm } from '@inertiajs/react';
import { useState, useMemo, useCallback } from 'react';

const HARI_NAMES = {
    1: 'Senin',
    2: 'Selasa',
    3: 'Rabu',
    4: 'Kamis',
    5: 'Jumat',
    6: 'Sabtu',
};

const MAPEL_CATEGORIES = {
    mipa: { bg: 'bg-emerald-50', text: 'text-emerald-900', border: 'border-emerald-200', icon: '🔬' },
    sosial: { bg: 'bg-amber-50', text: 'text-amber-900', border: 'border-amber-200', icon: '📚' },
    bahasa: { bg: 'bg-indigo-50', text: 'text-indigo-900', border: 'border-indigo-200', icon: '🌍' },
    default: { bg: 'bg-slate-50', text: 'text-slate-900', border: 'border-slate-200', icon: '📖' },
};

const SPECIAL_SLOT_TYPES = {
    upacara: { label: 'Upacara', icon: '🎌', bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
    dhuha: { label: 'Dhuha', icon: '🤲', bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
    mengaji: { label: 'Mengaji', icon: '📖', bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
    istirahat: { label: 'Istirahat', icon: '☕', bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200' },
};

const getMapelCategory = (mapel) => {
    if (!mapel?.kode) return 'default';
    const kode = mapel.kode.toUpperCase();
    if (['MTK', 'IPA', 'FIS', 'KIM', 'BIO', 'INF', 'TIK'].includes(kode)) return 'mipa';
    if (['IPS', 'SEJ', 'GEO', 'SOS', 'EKO', 'PKN'].includes(kode)) return 'sosial';
    if (['BIN', 'BIG', 'ARA', 'JEP', 'MAN', 'SUN'].includes(kode)) return 'bahasa';
    return 'default';
};

const isSpecialSlot = (slot) => {
    if (!slot?.mapel?.kode) return null;
    const kode = slot.mapel.kode.toUpperCase();
    if (['UPACARA', 'UPC'].includes(kode)) return 'upacara';
    if (['DHUHA', 'DHU'].includes(kode)) return 'dhuha';
    if (['MENGAJI', 'MGJ', 'QUR', 'QURAN'].includes(kode)) return 'mengaji';
    if (['ISTIRAHAT', 'IST', 'BREAK', 'REHAT'].includes(kode)) return 'istirahat';
    return null;
};

export default function Index({ versions, selectedVersion, slots, kelasList, mapelList, guruList, jamList, allJamList = [], flash, selectedSesi, selectedHari }) {
    const [showVersionModal, setShowVersionModal] = useState(false);
    const [showSlotModal, setShowSlotModal] = useState(false);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [showCopyModal, setShowCopyModal] = useState(false);
    const [showBulkCopyModal, setShowBulkCopyModal] = useState(false);

    const [editingVersion, setEditingVersion] = useState(null);
    const [selectedKelasFilter, setSelectedKelasFilter] = useState(kelasList[0]?.id || '');
    const [editingCell, setEditingCell] = useState(null);

    const versionForm = useForm({
        nama: '',
        berlaku_mulai: '',
        berlaku_sampai: '',
    });

    const generateForm = useForm({
        tanggal_mulai: new Date().toISOString().slice(0, 10),
        tanggal_selesai: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        sesi: selectedSesi || 'pagi',
    });

    const copyForm = useForm({
        source_versi_id: versions.filter(v => v.id !== selectedVersion?.id)[0]?.id || '',
    });

    const bulkCopyForm = useForm({
        source_kelas_id: '',
        target_kelas_ids: [],
    });

    const slotForm = useForm({
        hari: 1,
        jam_pelajaran_id: '',
        kelas_id: '',
        mapel_id: '',
        guru_id: '',
        durasi: 1,
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

    const handleBulkCopy = (e) => {
        e.preventDefault();
        if (!bulkCopyForm.data.source_kelas_id) {
            alert('Pilih kelas sumber terlebih dahulu.');
            return;
        }
        if (!bulkCopyForm.data.target_kelas_ids || bulkCopyForm.data.target_kelas_ids.length === 0) {
            alert('Pilih minimal satu kelas tujuan.');
            return;
        }
        bulkCopyForm.post(route('jadwal.slot.bulk-copy', selectedVersion.id), {
            onSuccess: () => {
                setShowBulkCopyModal(false);
                bulkCopyForm.reset();
            },
        });
    };

    const openBulkCopyModal = () => {
        bulkCopyForm.setData({
            source_kelas_id: selectedKelasFilter || kelasList[0]?.id || '',
            target_kelas_ids: [],
        });
        bulkCopyForm.clearErrors();
        setShowBulkCopyModal(true);
    };

    const deleteSlot = (slotId) => {
        if (selectedVersion?.status === 'aktif') {
            alert('Versi jadwal yang sudah AKTIF tidak dapat diedit. Silakan buat versi baru (Draf) untuk melakukan perubahan.');
            return;
        }
        if (confirm('Hapus slot pelajaran ini?')) {
            router.delete(route('jadwal.slot.destroy', slotId));
        }
    };

    // Compute available durasi options for the modal
    const getAvailableDurasiOptions = useCallback((hari, jamId, kelasId, currentDurasi = 1, currentMapelId = null, currentGuruId = null) => {
        const fullJamList = (allJamList && allJamList.length > 0) ? allJamList : jamList;
        const jam = fullJamList.find(j => j.id === jamId);
        if (!jam) return [{ value: 1, label: '1 jam pelajaran', disabled: false }];
        
        const options = [];
        const dayJams = fullJamList.filter(j => 
            j.sesi === jam.sesi && 
            j.hari === hari && 
            j.jam_ke >= jam.jam_ke
        ).sort((a, b) => a.jam_ke - b.jam_ke);
        
        const maxPossibleDurasi = dayJams.length;
        
        for (let d = 1; d <= Math.min(4, maxPossibleDurasi); d++) {
            const wouldExceed = d > maxPossibleDurasi;
            
            let hasConflict = false;
            let conflictReason = '';
            
            if (!wouldExceed) {
                for (let i = 0; i < d; i++) {
                    const checkJam = dayJams[i];
                    if (checkJam) {
                        const existingSlot = slots.find(s => 
                            s.hari === hari &&
                            s.kelas_id === kelasId &&
                            !(editingCell?.isEdit && s.id === editingCell.slot?.id) &&
                            ((s.jamPelajaran?.jam_ke === checkJam.jam_ke) || (s.jam_pelajaran_id === checkJam.id))
                        );
                        if (existingSlot && !(editingCell?.isEdit && existingSlot.mapel_id === currentMapelId)) {
                            hasConflict = true;
                            conflictReason = `Jam ke-${checkJam.jam_ke} sudah terisi (${existingSlot.mapel?.nama || 'Mapel lain'})`;
                            break;
                        }
                        
                        if (currentGuruId) {
                            const teacherConflict = slots.find(s =>
                                s.hari === hari &&
                                s.guru_id === currentGuruId &&
                                s.kelas_id !== kelasId &&
                                !(editingCell?.isEdit && s.id === editingCell.slot?.id) &&
                                ((s.jamPelajaran?.jam_ke === checkJam.jam_ke) || (s.jam_pelajaran_id === checkJam.id))
                            );
                            if (teacherConflict) {
                                hasConflict = true;
                                conflictReason = `Guru bentrok di Jam ke-${checkJam.jam_ke}`;
                                break;
                            }
                        }
                    }
                }
            }
            
            options.push({
                value: d,
                label: `${d} jam pelajaran${d === 1 ? '' : ` (sampai Jam ke-${jam.jam_ke + d - 1})`}`,
                disabled: wouldExceed || hasConflict,
                conflictReason: hasConflict ? conflictReason : null,
            });
        }
        
        return options;
    }, [jamList, allJamList, slots, editingCell]);

    const openSlotModal = (hari, jamId, kelasId, existingSlot = null) => {
        if (selectedVersion?.status === 'aktif') {
            alert('Versi jadwal yang sudah AKTIF tidak dapat diedit. Silakan buat versi baru (Draf) untuk melakukan perubahan.');
            return;
        }
        
        if (existingSlot) {
            setEditingCell({ hari, jam_pelajaran_id: existingSlot.jam_pelajaran_id, kelas_id: kelasId, slot: existingSlot, isEdit: true });
            slotForm.setData({
                hari,
                jam_pelajaran_id: existingSlot.jam_pelajaran_id,
                kelas_id: kelasId,
                mapel_id: existingSlot.mapel_id,
                guru_id: existingSlot.guru_id || '',
                durasi: existingSlot.durasi || 1,
            });
        } else {
            setEditingCell({ hari, jam_pelajaran_id: jamId, kelas_id: kelasId, isEdit: false });
            slotForm.setData({
                hari,
                jam_pelajaran_id: jamId,
                kelas_id: kelasId,
                mapel_id: mapelList[0]?.id || '',
                guru_id: '',
                durasi: 1,
            });
        }
        setShowSlotModal(true);
    };

    const saveSlot = (e) => {
        e.preventDefault();
        if (!editingCell) return;

        const data = {
            hari: editingCell.hari,
            jam_pelajaran_id: editingCell.jam_pelajaran_id,
            kelas_id: editingCell.kelas_id,
            mapel_id: slotForm.data.mapel_id,
            guru_id: slotForm.data.guru_id || null,
            durasi: Number(slotForm.data.durasi) || 1,
        };

        router.post(route('jadwal.slot.store', selectedVersion.id), data, {
            preserveScroll: true,
            onSuccess: () => {
                setShowSlotModal(false);
            },
        });
    };

    const handleSesiChange = (sesi) => {
        router.get(route('jadwal.index', { versi_id: selectedVersion?.id, sesi, hari: 1 }));
    };

    const handleHariChange = (hari) => {
        router.get(route('jadwal.index', { versi_id: selectedVersion?.id, sesi: selectedSesi, hari }));
    };

    const handleKelasChange = (kelasId) => {
        setSelectedKelasFilter(kelasId);
        router.get(route('jadwal.index', { versi_id: selectedVersion?.id, sesi: selectedSesi, hari: selectedHari, kelas_id: kelasId }));
    };

    // Determine if a slot is a primary slot (starting slot of a multi-period block or regular single-period slot)
    const isPrimarySlot = useCallback((slot) => {
        if (!slot) return false;
        if (slot.durasi > 1) return true;
        
        const fullJams = (allJamList && allJamList.length > 0) ? allJamList : jamList;
        const thisJam = slot.jam_pelajaran || slot.jamPelajaran || fullJams.find(j => j.id === slot.jam_pelajaran_id);
        if (!thisJam) return true;
        
        // Cek apakah slot durasi=1 ini sebenarnya merupakan placeholder lanjutan dari slot multi-jam sebelumnya
        const parentSlot = slots.find(s => {
            if (s.id === slot.id) return false;
            if (s.hari !== slot.hari || s.kelas_id !== slot.kelas_id) return false;
            if (!s.durasi || s.durasi <= 1) return false;
            const parentJam = s.jam_pelajaran || s.jamPelajaran || fullJams.find(j => j.id === s.jam_pelajaran_id);
            if (!parentJam) return false;
            return thisJam.jam_ke > parentJam.jam_ke && thisJam.jam_ke < (parentJam.jam_ke + s.durasi);
        });
        
        return !parentSlot;
    }, [slots, jamList, allJamList]);

    // Index slots by [hari][jam_ke][kelas_id] for quick matrix lookup
    const slotMatrix = useMemo(() => {
        const map = {};
        const fullJams = (allJamList && allJamList.length > 0) ? allJamList : jamList;
        
        slots.forEach(s => {
            if (!isPrimarySlot(s)) return;
            const jam = s.jam_pelajaran || s.jamPelajaran || fullJams.find(j => j.id === s.jam_pelajaran_id);
            if (!jam) return;
            
            if (!map[s.hari]) map[s.hari] = {};
            if (!map[s.hari][jam.jam_ke]) map[s.hari][jam.jam_ke] = {};
            map[s.hari][jam.jam_ke][s.kelas_id] = s;
        });
        return map;
    }, [slots, jamList, allJamList, isPrimarySlot]);

    // Build a set of continuation cells (cells covered by multi-period slots)
    // Format key: `${hari}-${jam_ke}-${kelas_id}`
    const continuationCells = useMemo(() => {
        const set = new Set();
        const fullJams = (allJamList && allJamList.length > 0) ? allJamList : jamList;
        
        slots.forEach(s => {
            const durasi = s.durasi || 1;
            if (durasi > 1) {
                const startJam = s.jam_pelajaran || s.jamPelajaran || fullJams.find(j => j.id === s.jam_pelajaran_id);
                if (startJam) {
                    for (let i = 1; i < durasi; i++) {
                        const targetJamKe = startJam.jam_ke + i;
                        set.add(`${s.hari}-${targetJamKe}-${s.kelas_id}`);
                    }
                }
            }
        });
        return set;
    }, [slots, jamList, allJamList]);

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
                            Pilih sesi & hari, klik + pada sel kosong untuk isi mapel & guru.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {selectedVersion && selectedVersion.status === 'aktif' && (
                            <PrimaryButton onClick={() => setShowGenerateModal(true)} className="bg-emerald-700 hover:bg-emerald-800 text-xs">
                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v12a2 2 0 002 2z" />
                                </svg>
                                Generate Sesi Harian
                            </PrimaryButton>
                        )}
                        {selectedVersion && selectedVersion.status === 'draf' && (
                            <SecondaryButton onClick={openBulkCopyModal} className="text-xs">
                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Salin ke Kelas Lain
                            </SecondaryButton>
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
                                            onClick={() => router.get(route('jadwal.index', { versi_id: ver.id, sesi: selectedSesi, hari: selectedHari }))}
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
                                <span className="text-slate-400">Total Jam Terisi:</span>{' '}
                                <strong className="text-slate-800">{slots.reduce((sum, s) => sum + (s.durasi || 1), 0)} JP</strong>
                            </div>
                            {selectedVersion.status === 'aktif' && (
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    <span>Versi AKTIF - Hanya Baca (Buat versi baru untuk edit)</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Main Content: Grid (Table-based, original layout) */}
                {selectedVersion ? (
                    <div className="bg-white rounded-2xl border border-[#C5CEE3] shadow-xs overflow-hidden">
                        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h3 className="font-bold text-base text-[#111C2D] whitespace-nowrap">
                                    Matriks Kelas: <span className="font-normal">{currentKelas?.nama || 'Pilih Kelas'}</span>
                                </h3>
                                <select
                                    value={selectedKelasFilter}
                                    onChange={(e) => handleKelasChange(e.target.value)}
                                    className="w-40 sm:w-48 rounded-xl border-[#C5CEE3] bg-[#E8EEFF] text-xs font-semibold text-[#111C2D] px-3 py-1.5 focus:border-[#006C4A] focus:ring-[#006C4A]"
                                >
                                    {kelasList.map(k => (
                                        <option key={k.id} value={k.id}>Kelas {k.nama}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center gap-3 flex-wrap">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-500 hidden sm:inline">Sesi:</span>
                                    <div className="inline-flex items-center p-1 bg-[#E8EEFF] rounded-xl" role="radiogroup" aria-label="Pilih Sesi">
                                        {['pagi', 'siang'].map(sesi => (
                                            <button
                                                key={sesi}
                                                type="button"
                                                onClick={() => handleSesiChange(sesi)}
                                                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                                                    selectedSesi === sesi
                                                        ? 'bg-white text-[#143823] shadow-sm'
                                                        : 'text-slate-600 hover:text-slate-800'
                                                }`}
                                                role="radio"
                                                aria-checked={selectedSesi === sesi}
                                            >
                                                {sesi === 'pagi' ? (
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                                ) : (
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                                                )}
                                                {sesi === 'pagi' ? 'Sesi Pagi' : 'Sesi Siang'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-500 hidden sm:inline">Hari:</span>
                                    <select
                                        value={selectedHari}
                                        onChange={(e) => handleHariChange(Number(e.target.value))}
                                        className="w-32 rounded-xl border-[#C5CEE3] bg-[#E8EEFF] text-xs font-semibold text-[#111C2D] px-3 py-1.5 focus:border-[#006C4A] focus:ring-[#006C4A]"
                                    >
                                        {[1,2,3,4,5,6].map(h => (
                                            <option key={h} value={h}>{HARI_NAMES[h]}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto p-4 sm:p-5">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#E8EEFF] text-[#111C2D] text-xs font-bold border-b border-[#C5CEE3]">
                                        <th className="p-3.5 text-center w-20 sticky left-0 z-20">Jam Ke</th>
                                        <th className="p-3.5 w-28 sticky left-20 z-10 border-l-2 border-emerald-500/20">Waktu</th>
                                        {[1, 2, 3, 4, 5, 6].map(hari => (
                                            <th key={hari} className="p-3.5 text-center min-w-[160px] sticky top-0 z-10">
                                                {HARI_NAMES[hari]}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-xs">
                                    {jamList.map(jam => {
                                        return (
                                            <tr key={jam.id} className="hover:bg-slate-50/80">
                                                <td className="p-2.5 text-center font-bold text-slate-700 bg-slate-50/50 sticky left-0 z-20 w-20">
                                                    Jam ke-{jam.jam_ke}
                                                </td>
                                                <td className="p-2.5 text-slate-500 font-mono text-[11px] bg-slate-50/50 sticky left-20 z-10 w-28 border-l-2 border-emerald-500/20">
                                                    {jam.mulai?.slice(0, 5)} - {jam.selesai?.slice(0, 5)}
                                                </td>
                                                {[1, 2, 3, 4, 5, 6].map(hari => {
                                                    const fullJams = (allJamList && allJamList.length > 0) ? allJamList : jamList;
                                                    const currentJam = fullJams.find(j => j.hari === hari && j.jam_ke === jam.jam_ke) || jam;
                                                    const slot = slotMatrix[hari]?.[jam.jam_ke]?.[selectedKelasFilter];
                                                    const isContinuation = continuationCells.has(`${hari}-${jam.jam_ke}-${selectedKelasFilter}`);
                                                    const specialType = slot ? isSpecialSlot(slot) : null;
                                                    const isPrimary = slot ? isPrimarySlot(slot) : false;
                                                    
                                                    // Don't render continuation cells - they're covered by rowspan from the starting period
                                                    if (isContinuation) {
                                                        return null;
                                                    }
                                                    
                                                    const onCellClick = () => openSlotModal(hari, currentJam.id, selectedKelasFilter, slot);
                                                    const onCellDelete = () => slot ? deleteSlot(slot.id) : undefined;
                                                    
                                                    // Calculate rowspan for multi-period slots
                                                    const rowspan = (slot && slot.durasi && slot.durasi > 1 && isPrimary) ? slot.durasi : 1;
                                                    
                                                    return (
                                                        <td
                                                            key={hari}
                                                            className={`p-1.5 border-l border-slate-100 align-top h-full transition ${
                                                                slot ? 'hover:bg-emerald-50/50' : 'hover:bg-emerald-50/30'
                                                            }`}
                                                            rowSpan={rowspan}
                                                        >
                                                            {slot ? (
                                                                <SlotCard
                                                                    slot={slot}
                                                                    jam={currentJam}
                                                                    hari={hari}
                                                                    onClick={onCellClick}
                                                                    onDelete={onCellDelete}
                                                                    mapelList={mapelList}
                                                                    isSpecial={!!specialType}
                                                                    specialType={specialType}
                                                                    isPrimary={isPrimary}
                                                                    isContinuation={false}
                                                                    jamList={fullJams}
                                                                    rowspan={rowspan}
                                                                />
                                                            ) : (
                                                                <button
                                                                    type="button"
                                                                    onClick={onCellClick}
                                                                    className="border-2 border-dashed border-slate-200 p-2.5 rounded-2xl w-full h-full min-h-[74px] text-left flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:border-emerald-500 hover:bg-emerald-50/50 hover:text-emerald-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer"
                                                                    title="+ Tambah Jadwal"
                                                                >
                                                                    <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                                    </svg>
                                                                    <span className="text-[11px] font-medium">+ Tambah</span>
                                                                </button>
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

            {/* Modal Isi/Edit Slot */}
            <Modal show={showSlotModal} onClose={() => setShowSlotModal(false)}>
                <form onSubmit={saveSlot} className="p-6 space-y-4">
                    <h2 className="text-lg font-bold text-[#111C2D]">
                        {editingCell?.isEdit ? 'Edit Slot Jadwal' : 'Isi Slot Jadwal'}
                    </h2>
                    <p className="text-xs text-slate-500">
                        {HARI_NAMES[editingCell?.hari]} • Jam ke-{jamList.find(j => j.id === editingCell?.jam_pelajaran_id)?.jam_ke} •
                        Kelas: <strong className="text-slate-800">{currentKelas?.nama}</strong>
                        {editingCell?.isEdit && <span> • Mapel: <strong className="text-slate-800">{editingCell.slot?.mapel?.nama}</strong></span>}
                    </p>

                    <div>
                        <InputLabel htmlFor="mapel_id" value="Mata Pelajaran" />
                        <select
                            id="mapel_id"
                            value={slotForm.data.mapel_id}
                            onChange={(e) => slotForm.setData('mapel_id', e.target.value)}
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
                            value={slotForm.data.guru_id}
                            onChange={(e) => slotForm.setData('guru_id', e.target.value)}
                            className="mt-1 block w-full rounded-xl border-[#C5CEE3] text-xs py-2.5"
                        >
                            <option value="">-- Kosongkan (Belum assign guru) --</option>
                            {guruList.map(g => (
                                <option key={g.id} value={g.id}>{g.nama} ({g.username})</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <InputLabel htmlFor="durasi" value="Durasi (Jam Pelajaran)" />
                        <select
                            id="durasi"
                            value={slotForm.data.durasi}
                            onChange={(e) => slotForm.setData('durasi', Number(e.target.value))}
                            className="mt-1 block w-full rounded-xl border-[#C5CEE3] text-xs py-2.5"
                        >
                            {(() => {
                                if (!editingCell) return [1, 2, 3, 4].map(d => <option key={d} value={d}>{d} jam pelajaran</option>);
                                const options = getAvailableDurasiOptions(
                                    editingCell.hari,
                                    editingCell.jam_pelajaran_id,
                                    editingCell.kelas_id,
                                    slotForm.data.durasi,
                                    slotForm.data.mapel_id,
                                    slotForm.data.guru_id
                                );
                                return options.map(opt => (
                                    <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                                        {opt.label}{opt.conflictReason ? ` - ${opt.conflictReason}` : ''}
                                    </option>
                                ));
                            })()}
                        </select>
                        <p className="text-[10px] text-slate-500 mt-1">Jika {'>'}1, slot berikutnya akan terisi otomatis mapel & guru yang sama. Opsi disabled = melewati jam terakhir atau bentrok jadwal/guru.</p>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <SecondaryButton type="button" onClick={() => setShowSlotModal(false)}>
                            Batal
                        </SecondaryButton>
                        <PrimaryButton>
                            {editingCell?.isEdit ? 'Update' : 'Simpan'}
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

                    <div>
                        <InputLabel htmlFor="sesi" value="Sesi" />
                        <select
                            id="sesi"
                            value={generateForm.data.sesi}
                            onChange={(e) => generateForm.setData('sesi', e.target.value)}
                            className="mt-1 block w-full rounded-xl border-[#C5CEE3] text-xs py-2.5"
                            required
                        >
                            <option value="pagi">Sesi Pagi</option>
                            <option value="siang">Sesi Siang</option>
                        </select>
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

            {/* Modal Bulk Copy to Classes */}
            <Modal show={showBulkCopyModal} onClose={() => { setShowBulkCopyModal(false); bulkCopyForm.reset(); }}>
                <form onSubmit={handleBulkCopy} className="p-6 space-y-4">
                    <h2 className="text-lg font-bold text-[#111C2D]">
                        Salin Jadwal ke Kelas Lain
                    </h2>
                    <p className="text-xs text-slate-500">
                        Salin seluruh slot jadwal dari satu kelas sumber ke beberapa kelas tujuan sekaligus.
                        Slot yang sudah ada di kelas tujuan tidak akan ditimpa (dilewati).
                    </p>

                    <div>
                        <InputLabel htmlFor="source_kelas_id" value="Kelas Sumber" />
                        <select
                            id="source_kelas_id"
                            value={bulkCopyForm.data.source_kelas_id}
                            onChange={(e) => bulkCopyForm.setData('source_kelas_id', e.target.value)}
                            className="mt-1 block w-full rounded-xl border-[#C5CEE3] text-xs py-2.5"
                            required
                        >
                            <option value="">-- Pilih Kelas Sumber --</option>
                            {kelasList.map(k => (
                                <option key={k.id} value={k.id}>{k.nama}</option>
                            ))}
                        </select>
                        <InputError message={bulkCopyForm.errors.source_kelas_id} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="target_kelas_ids" value="Kelas Tujuan (bisa pilih beberapa)" />
                        <div className="mt-1 max-h-40 overflow-y-auto border border-[#C5CEE3] rounded-xl bg-white p-2 space-y-1.5">
                            {kelasList.filter(k => k.id !== bulkCopyForm.data.source_kelas_id).map(k => (
                                <label key={k.id} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        value={k.id}
                                        checked={bulkCopyForm.data.target_kelas_ids?.includes(k.id)}
                                        onChange={(e) => {
                                            const ids = bulkCopyForm.data.target_kelas_ids || [];
                                            if (e.target.checked) {
                                                bulkCopyForm.setData('target_kelas_ids', [...ids, k.id]);
                                            } else {
                                                bulkCopyForm.setData('target_kelas_ids', ids.filter(id => id !== k.id));
                                            }
                                        }}
                                        className="w-4 h-4 text-emerald-600 border-[#C5CEE3] rounded focus:ring-2 focus:ring-emerald-500/20"
                                    />
                                    <span className="text-xs text-slate-700">{k.nama}</span>
                                </label>
                            ))}
                            {kelasList.filter(k => k.id !== bulkCopyForm.data.source_kelas_id).length === 0 && (
                                <p className="text-xs text-slate-500 text-center py-4">Tidak ada kelas tujuan tersedia</p>
                            )}
                        </div>
                        <InputError message={bulkCopyForm.errors.target_kelas_ids} className="mt-1" />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <SecondaryButton type="button" onClick={() => { setShowBulkCopyModal(false); bulkCopyForm.reset(); }}>
                            Batal
                        </SecondaryButton>
                        <PrimaryButton disabled={bulkCopyForm.processing}>
                            Salin ke Kelas Terpilih
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}

// SlotCard component - placed outside main component for reuse
const SlotCard = ({ slot, jam, hari, onClick, onDelete, mapelList, isSpecial = false, specialType = null, isPrimary = true, isContinuation = false, jamList = [], rowspan = 1 }) => {
    if (isSpecial && specialType) {
        const style = SPECIAL_SLOT_TYPES[specialType];
        return (
            <div className={`${style.bg} ${style.border} ${style.text} border p-2 rounded-xl w-full h-full text-left flex flex-col items-start justify-center gap-1.5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#006C4A]/30`}>
                <div className="flex items-center gap-1.5">
                    <span className="text-base">{style.icon}</span>
                    <span className="font-semibold text-xs">{style.label}</span>
                </div>
                <div className="text-[10px] opacity-70 font-mono">
                    {jam.mulai?.slice(0, 5)} - {jam.selesai?.slice(0, 5)}
                </div>
            </div>
        );
    }

    if (!slot) {
        return (
            <div className="border-2 border-dashed border-slate-200 p-2 rounded-xl w-full h-full text-left flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-emerald-500 hover:bg-emerald-50/50 hover:text-emerald-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-[10px] font-medium">+ Tambah</span>
            </div>
        );
    }

    if (isContinuation) {
        return null;
    }

    const category = getMapelCategory(slot.mapel);
    const style = MAPEL_CATEGORIES[category];
    const durasi = slot.durasi || 1;

    // Calculate end time for multi-period slots
    let endTime = jam.selesai?.slice(0, 5);
    if (durasi > 1 && jamList.length > 0) {
        const startJam = jamList.find(j => j.id === slot.jam_pelajaran_id) || jam;
        if (startJam) {
            const endJam = jamList.find(j => j.jam_ke === (startJam.jam_ke + durasi - 1) && j.sesi === startJam.sesi && j.hari === startJam.hari);
            if (endJam) {
                endTime = endJam.selesai?.slice(0, 5);
            }
        }
    }
    const timeRange = `${jam.mulai?.slice(0, 5)} - ${endTime}`;

    const borderColor = category === 'mipa' ? '#006C4A' : category === 'sosial' ? '#F59E0B' : category === 'bahasa' ? '#4F46E5' : '#64748B';

    return (
        <div className="relative group h-full" onClick={onClick}>
            <div
                className={`${style.bg} ${style.border} ${style.text} border p-2.5 rounded-2xl w-full h-full shadow-xs hover:shadow-md transition-all duration-200 relative overflow-hidden flex flex-col justify-between cursor-pointer`}
                style={{
                    borderLeft: `4px solid ${borderColor}`,
                    minHeight: rowspan > 1 ? `${rowspan * 72}px` : '74px',
                }}
            >
                <div>
                    <div className="flex items-start gap-1.5 mb-1.5">
                        <span className="text-sm mt-0.5 flex-shrink-0">{style.icon}</span>
                        <span className="font-bold text-xs truncate flex-1 leading-snug">{slot.mapel?.nama || 'Mapel'}</span>
                        {isPrimary && durasi > 1 && (
                            <span className="flex-shrink-0 ml-1 px-2 py-0.5 rounded-full bg-[#143823] text-[10px] font-bold text-[#82F5C1] shadow-xs">
                                {durasi} JP
                            </span>
                        )}
                    </div>

                    {slot.guru_id ? (
                        <div className="flex items-center gap-1.5 text-[11px] opacity-85 mt-1 font-medium">
                            <svg className="w-3.5 h-3.5 flex-shrink-0 text-[#006C4A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="truncate">{slot.guru?.nama || slot.guru?.username}</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 text-[11px] opacity-70 text-amber-700 mt-1">
                            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span className="truncate italic">Belum assign guru</span>
                        </div>
                    )}
                </div>

                <div className="mt-3 pt-1.5 border-t border-slate-200/50 flex items-center justify-between text-[10px] opacity-80 font-mono">
                    <span className="flex items-center gap-1">
                        <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {timeRange}
                    </span>
                    {durasi > 1 && (
                        <span className="font-semibold text-slate-700">
                            Jam {jam.jam_ke}-{jam.jam_ke + durasi - 1}
                        </span>
                    )}
                </div>
            </div>

            {isPrimary && (
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 p-1 bg-white/95 hover:bg-rose-50 text-rose-600 rounded-full shadow-md transition-all duration-200 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-rose-500/30 cursor-pointer"
                    title={`Hapus slot ini${durasi > 1 ? ` (${durasi} JP)` : ''}`}
                    aria-label="Hapus slot"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
        </div>
    );
};