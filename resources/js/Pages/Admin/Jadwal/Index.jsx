import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { Head, router, useForm } from '@inertiajs/react';
import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import React from 'react';

const HARI_NAMES = {
    1: 'Senin',
    2: 'Selasa',
    3: 'Rabu',
    4: 'Kamis',
    5: 'Jumat',
};

const HARI_SHORT = {
    1: 'Sen',
    2: 'Sel',
    3: 'Rab',
    4: 'Kam',
    5: 'Jum',
};

const SESI_LABELS = {
    pagi: 'Sesi Pagi',
    siang: 'Sesi Siang',
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

const hariOptions = [
    { value: 1, label: 'Senin', short: 'Sen' },
    { value: 2, label: 'Selasa', short: 'Sel' },
    { value: 3, label: 'Rabu', short: 'Rab' },
    { value: 4, label: 'Kamis', short: 'Kam' },
    { value: 5, label: 'Jumat', short: 'Jum' },
];

const SesiSwitcher = ({ value, onChange, className = '' }) => (
    <div className={`inline-flex items-center p-1 bg-[#E8EEFF] rounded-xl ${className}`} role="radiogroup" aria-label="Pilih Sesi">
        {['pagi', 'siang'].map(sesi => (
            <button
                key={sesi}
                type="button"
                onClick={() => onChange(sesi)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                    value === sesi
                        ? 'bg-white text-[#143823] shadow-sm'
                        : 'text-slate-600 hover:text-slate-800'
                }`}
                role="radio"
                aria-checked={value === sesi}
            >
                {sesi === 'pagi' ? (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                ) : (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                )}
                {SESI_LABELS[sesi]}
            </button>
        ))}
    </div>
);

const SearchableSelect = ({ options, value, onChange, placeholder, className = '', id }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    const filteredOptions = useMemo(() => 
        options.filter(opt => 
            opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (opt.short && opt.short.toLowerCase().includes(searchQuery.toLowerCase()))
        ), [options, searchQuery]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target) && 
                inputRef.current && !inputRef.current.contains(e.target)) {
                setIsOpen(false);
                setSearchQuery('');
                setFocusedIndex(-1);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleKeyDown = (e) => {
        if (!isOpen) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setFocusedIndex(i => Math.min(i + 1, filteredOptions.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setFocusedIndex(i => Math.max(i - 1, 0));
        } else if (e.key === 'Enter' && focusedIndex >= 0) {
            onChange(filteredOptions[focusedIndex].value);
            setIsOpen(false);
            setSearchQuery('');
            setFocusedIndex(-1);
        } else if (e.key === 'Escape') {
            setIsOpen(false);
            setSearchQuery('');
            setFocusedIndex(-1);
        }
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <button
                ref={inputRef}
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                onKeyDown={handleKeyDown}
                className="w-full px-3 py-2 rounded-xl border-[#C5CEE3] bg-[#E8EEFF] text-xs font-semibold text-[#111C2D] text-left flex items-center justify-between gap-2 focus:border-[#006C4A] focus:ring-2 focus:ring-[#006C4A]/20 focus:outline-none transition"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <span className="truncate flex-1">
                    {options.find(o => o.value === value)?.label || placeholder}
                </span>
                <svg className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-1.5 w-full max-h-60 overflow-auto bg-white border border-[#C5CEE3] rounded-xl shadow-lg ring-1 ring-black/5">
                    <div className="p-2 border-b border-slate-100">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setFocusedIndex(-1);
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder="Cari..."
                            className="w-full px-3 py-2 text-xs border-[#C5CEE3] rounded-lg bg-slate-50 focus:border-[#006C4A] focus:ring-2 focus:ring-[#006C4A]/20 focus:outline-none"
                            autoFocus
                        />
                    </div>
                    <ul role="listbox" className="py-1">
                        {filteredOptions.length === 0 ? (
                            <li className="px-3 py-3 text-center text-xs text-slate-500">Tidak ditemukan</li>
                        ) : (
                            filteredOptions.map((opt, idx) => (
                                <li key={opt.value}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onChange(opt.value);
                                            setIsOpen(false);
                                            setSearchQuery('');
                                            setFocusedIndex(-1);
                                        }}
                                        onMouseEnter={() => setFocusedIndex(idx)}
                                        className={`w-full px-3 py-2.5 text-xs text-left transition-colors flex items-center gap-2 ${
                                            idx === focusedIndex ? 'bg-[#E8EEFF] text-[#143823]' : 'text-slate-700 hover:bg-slate-50'
                                        }`}
                                        role="option"
                                        aria-selected={idx === focusedIndex}
                                    >
                                        {opt.short && <span className="w-8 text-center text-slate-400">{opt.short}</span>}
                                        <span className="flex-1">{opt.label}</span>
                                    </button>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

const SlotCard = ({ slot, jam, hari, onClick, onDelete, mapelList, isSpecial = false, specialType = null }) => {
    if (isSpecial && specialType) {
        const style = SPECIAL_SLOT_TYPES[specialType];
        return (
            <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onClick(); }}
                className={`${style.bg} ${style.border} ${style.text} border p-3 rounded-2xl w-full h-full text-left flex flex-col items-start justify-center gap-2 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#006C4A]/30`}
                title={`${style.label} - ${jam.mulai?.slice(0, 5)} - ${jam.selesai?.slice(0, 5)}`}
            >
                <div className="flex items-center gap-2">
                    <span className="text-lg">{style.icon}</span>
                    <span className="font-semibold text-sm">{style.label}</span>
                </div>
                <div className="text-[11px] opacity-70 font-mono">
                    {jam.mulai?.slice(0, 5)} - {jam.selesai?.slice(0, 5)}
                </div>
            </button>
        );
    }

    if (!slot) {
        return (
            <button
                type="button"
                onClick={onClick}
                className="border-2 border-dashed border-slate-200 p-3 rounded-2xl w-full h-full text-left flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-emerald-500 hover:bg-emerald-50/50 hover:text-emerald-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                title="+ Tambah Jadwal"
            >
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-[11px] font-medium">+ Tambah</span>
            </button>
        );
    }

    const category = getMapelCategory(slot.mapel);
    const style = MAPEL_CATEGORIES[category];

    return (
        <div className="relative group" onClick={onClick}>
            <div className={`${style.bg} ${style.border} ${style.text} border p-3 rounded-2xl w-full h-full min-h-[72px] shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden`}
                style={{ borderLeft: `4px solid ${category === 'mipa' ? '#006C4A' : category === 'sosial' ? '#F59E0B' : category === 'bahasa' ? '#4F46E5' : '#64748B'}` }}
            >
                <div className="flex items-start gap-2 mb-1.5">
                    <span className="text-base mt-0.5 flex-shrink-0">{style.icon}</span>
                    <span className="font-semibold text-sm truncate flex-1">{slot.mapel?.nama || 'Mapel'}</span>
                </div>
                {slot.guru_id ? (
                    <div className="flex items-center gap-1.5 text-[11px] opacity-80">
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="truncate">{slot.guru?.nama || slot.guru?.username}</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5 text-[11px] opacity-60 text-amber-700">
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span className="truncate">Belum assign guru</span>
                    </div>
                )}
                <div className="absolute bottom-2 right-2 text-[10px] opacity-40 font-mono">
                    {jam.mulai?.slice(0, 5)} - {jam.selesai?.slice(0, 5)}
                </div>
            </div>
            <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1.5 bg-white/90 hover:bg-rose-50 text-rose-600 rounded-full shadow-sm transition-all duration-200 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                title="Hapus slot"
                aria-label="Hapus slot"
            >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
};

const ScheduleMatrix = ({ selectedVersion, slots, jamList, kelasList, mapelList, selectedKelasFilter, selectedSesi, selectedHari, onKelasChange, onSesiChange, onHariChange, onSlotClick, onSlotDelete }) => {
    const currentKelas = kelasList.find(k => k.id == selectedKelasFilter);

    const slotMatrix = useMemo(() => {
        const map = {};
        slots.forEach(s => {
            if (!map[s.hari]) map[s.hari] = {};
            if (!map[s.hari][s.jam_pelajaran_id]) map[s.hari][s.jam_pelajaran_id] = {};
            map[s.hari][s.jam_pelajaran_id][s.kelas_id] = s;
        });
        return map;
    }, [slots]);

    const totalFilledSlots = useMemo(() => slots.length, [slots]);
    const totalKelas = kelasList.length;

    return (
        <div className="bg-white rounded-2xl border border-[#C5CEE3] shadow-xs overflow-hidden">
            {/* Header with Filters & Summary */}
            <div className="p-4 sm:p-5 border-b border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-bold text-base text-[#111C2D] whitespace-nowrap">
                            Matriks Kelas: <span className="font-normal">{currentKelas?.nama || 'Pilih Kelas'}</span>
                        </h3>
                        <SearchableSelect
                            id="kelas-filter"
                            options={kelasList.map(k => ({ value: k.id, label: `Kelas ${k.nama}`, short: k.nama }))}
                            value={selectedKelasFilter}
                            onChange={onKelasChange}
                            placeholder="Pilih Kelas"
                            className="w-40 sm:w-48"
                        />
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 hidden sm:inline">Sesi:</span>
                            <SesiSwitcher value={selectedSesi} onChange={onSesiChange} />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 hidden sm:inline">Hari:</span>
                            <SearchableSelect
                                id="hari-filter"
                                options={hariOptions}
                                value={selectedHari}
                                onChange={onHariChange}
                                placeholder="Pilih Hari"
                                className="w-32"
                            />
                        </div>
                    </div>
                </div>

                {/* Summary Badges */}
                <div className="flex flex-wrap items-center gap-3 text-xs">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                        Total Slot Terisi: <strong>{totalFilledSlots}</strong>
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        Kelas Aktif: <strong>{totalKelas}</strong>
                    </span>
                    {selectedVersion && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 font-medium">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            {selectedVersion.status === 'aktif' ? 'Jadwal Aktif' : 'Draf'}
                        </span>
                    )}
                </div>
            </div>

            {/* Grid Matrix */}
            <div className="overflow-x-auto p-4 sm:p-5">
                <div className="min-w-max">
                    <div className="grid grid-cols-[auto_auto_repeat(5,minmax(160px,1fr))] gap-2.5">
                        {/* Corner Header */}
                        <div className="col-span-2 row-span-1" />
                        
                        {/* Day Headers */}
                        {hariOptions.map(hari => (
                            <div
                                key={hari.value}
                                className={`p-3 text-center text-xs font-bold rounded-xl sticky top-0 z-10 ${
                                    selectedHari === hari.value
                                        ? 'bg-[#143823] text-white shadow-sm'
                                        : 'bg-[#E8EEFF] text-[#111C2D]'
                                }`}
                            >
                                {hari.label}
                            </div>
                        ))}

                        {/* Time Rows */}
                        {jamList.map((jam, jamIndex) => (
                            <React.Fragment key={jam.id}>
                                {/* Jam Number */}
                                <div className="p-2.5 text-center font-bold text-slate-700 bg-slate-50/50 rounded-xl sticky left-0 z-20 w-20 min-w-[80px] flex items-center justify-center">
                                    Jam ke-{jam.jam_ke}
                                </div>
                                {/* Time Range */}
                                <div className="p-2.5 text-slate-500 font-mono text-[11px] bg-slate-50/50 rounded-xl sticky left-20 z-10 w-24 min-w-[96px] flex items-center justify-center border-l-2 border-emerald-500/20">
                                    {jam.mulai?.slice(0, 5)} - {jam.selesai?.slice(0, 5)}
                                </div>
                                {/* Day Cells */}
                                {hariOptions.map(hari => {
                                    const slot = slotMatrix[hari.value]?.[jam.id]?.[selectedKelasFilter];
                                    const specialType = slot ? isSpecialSlot(slot) : null;
                                    
                                    return (
                                        <div
                                            key={hari.value}
                                            className="relative min-h-[72px]"
                                        >
                                            <SlotCard
                                                slot={slot}
                                                jam={jam}
                                                hari={hari.value}
                                                onClick={() => onSlotClick(hari.value, jam.id, selectedKelasFilter, slot)}
                                                onDelete={() => onSlotDelete(slot.id)}
                                                mapelList={mapelList}
                                                isSpecial={!!specialType}
                                                specialType={specialType}
                                            />
                                        </div>
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                <p className="text-xs font-semibold text-slate-600 mb-2">Legenda:</p>
                <div className="flex flex-wrap items-center gap-3 text-xs">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-600"></span> MIPA
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                        <span className="w-2 h-2 rounded-full bg-amber-600"></span> Sosial
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-900 border border-indigo-200">
                        <span className="w-2 h-2 rounded-full bg-indigo-600"></span> Bahasa
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 text-slate-700 border border-slate-200">
                        <span className="w-2 h-2 rounded-full bg-slate-500"></span> Lainnya
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg> Kegiatan Khusus
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border-2 border-dashed border-slate-300 text-slate-500 bg-white">
                        <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> Slot Kosong
                    </span>
                </div>
            </div>
        </div>
    );
};

export default function Index({ versions, selectedVersion, slots, kelasList, mapelList, guruList, jamList, flash, selectedSesi, selectedHari }) {
    const [showVersionModal, setShowVersionModal] = useState(false);
    const [showSlotModal, setShowSlotModal] = useState(false);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [showCopyModal, setShowCopyModal] = useState(false);

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

    const deleteSlot = (slotId) => {
        if (confirm('Hapus slot pelajaran ini?')) {
            router.delete(route('jadwal.slot.destroy', slotId));
        }
    };

    const openSlotModal = (hari, jamId, kelasId, existingSlot = null) => {
        const jam = jamList.find(j => j.id === jamId);
        const nextJam = jamList.find(j => j.jam_ke === (jam?.jam_ke || 0) + 1);
        
        if (existingSlot) {
            // Edit existing
            setEditingCell({ hari, jam_pelajaran_id: jamId, kelas_id: kelasId, slot: existingSlot, isEdit: true });
            slotForm.setData({
                hari,
                jam_pelajaran_id: jamId,
                kelas_id: kelasId,
                mapel_id: existingSlot.mapel_id,
                guru_id: existingSlot.guru_id || '',
                durasi: 1,
            });
        } else {
            // New slot
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
        };

        // If durasi > 1, also fill subsequent slots
        const slotsToCreate = [data];
        if (slotForm.data.durasi > 1) {
            const currentJam = jamList.find(j => j.id === editingCell.jam_pelajaran_id);
            for (let i = 1; i < slotForm.data.durasi; i++) {
                const nextJam = jamList.find(j => j.jam_ke === (currentJam?.jam_ke || 0) + i);
                if (nextJam) {
                    slotsToCreate.push({
                        ...data,
                        jam_pelajaran_id: nextJam.id,
                    });
                }
            }
        }

        // Send all slots
        let completed = 0;
        let hasError = false;
        const total = slotsToCreate.length;
        
        slotsToCreate.forEach((slotData, idx) => {
            router.post(route('jadwal.slot.store', selectedVersion.id), slotData, {
                onSuccess: () => {
                    if (hasError) return;
                    completed++;
                    if (completed === total) {
                        setShowSlotModal(false);
                    }
                },
                onError: () => {
                    hasError = true;
                },
            });
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
                                <span className="text-slate-400">Total Slot Terisi:</span>{' '}
                                <strong className="text-slate-800">{slots.length} slot</strong>
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Content: Grid */}
                {selectedVersion ? (
                    <ScheduleMatrix
                        selectedVersion={selectedVersion}
                        slots={slots}
                        jamList={jamList}
                        kelasList={kelasList}
                        mapelList={mapelList}
                        selectedKelasFilter={selectedKelasFilter}
                        selectedSesi={selectedSesi}
                        selectedHari={selectedHari}
                        onKelasChange={handleKelasChange}
                        onSesiChange={handleSesiChange}
                        onHariChange={handleHariChange}
                        onSlotClick={openSlotModal}
                        onSlotDelete={deleteSlot}
                    />
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
                            {[1, 2, 3, 4].map(d => (
                                <option key={d} value={d}>{d} jam pelajaran</option>
                            ))}
                        </select>
                        <p className="text-[10px] text-slate-500 mt-1">Jika {'>'}1, slot berikutnya akan terisi otomatis mapel & guru yang sama.</p>
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
        </AuthenticatedLayout>
    );
}