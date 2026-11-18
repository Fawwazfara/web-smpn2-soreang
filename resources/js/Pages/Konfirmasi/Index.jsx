import { Head, useForm, Link } from '@inertiajs/react';
import { useState, useRef } from 'react';

export default function Index({
    state = 'active',
    dataSiswa = null,
    token = '',
    message = null,
    flash = {},
}) {
    const fileInputRef = useRef(null);
    const [filePreview, setFilePreview] = useState(null);
    const [selectedFileName, setSelectedFileName] = useState('');
    const [selectedFileSize, setSelectedFileSize] = useState('');
    const [isPdf, setIsPdf] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        bukti: null,
        keterangan: '',
    });

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setData('bukti', file);
        setSelectedFileName(file.name);
        setSelectedFileSize((file.size / 1024 / 1024).toFixed(2) + ' MB');

        if (file.type === 'application/pdf') {
            setIsPdf(true);
            setFilePreview(null);
        } else if (file.type.startsWith('image/')) {
            setIsPdf(false);
            const reader = new FileReader();
            reader.onload = (event) => {
                setFilePreview(event.target?.result);
            };
            reader.readAsDataURL(file);
        } else {
            setIsPdf(false);
            setFilePreview(null);
        }
    };

    const handleRemoveFile = () => {
        setData('bukti', null);
        setFilePreview(null);
        setSelectedFileName('');
        setSelectedFileSize('');
        setIsPdf(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('konfirmasi.store', token), {
            forceFormData: true,
            preserveScroll: true,
            onError: () => {
                // Keep file in form state
            },
        });
    };

    const isSuccessState = state === 'already_used' || Boolean(flash?.success);

    return (
        <div className="min-h-screen bg-[#CFD9F0] text-[#3F463F] font-sans flex flex-col justify-between selection:bg-[#143823] selection:text-white">
            <Head title={`Konfirmasi Kehadiran Siswa — SMPN 2 Soreang`} />

            {/* HEADER BRANDING */}
            <header className="bg-[#143823] border-b border-[#002114] text-white shadow-md">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group focus:outline-none">
                        <div className="w-10 h-10 rounded-2xl bg-[#002114] border border-[#82F5C1]/30 flex items-center justify-center text-white shadow-inner flex-shrink-0 group-hover:scale-105 transition-transform">
                            <svg className="w-5 h-5 text-[#82F5C1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                            </svg>
                        </div>
                        <div>
                            <span className="block font-extrabold text-base tracking-tight text-white group-hover:text-[#82F5C1] transition-colors">
                                SMPN 2 SOREANG
                            </span>
                            <span className="block text-[#82F5C1] text-[11px] font-medium tracking-wider uppercase">
                                Portal Presensi & Layanan Kehadiran Siswa
                            </span>
                        </div>
                    </Link>

                    <div className="hidden sm:flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#002114] border border-[#82F5C1]/20 px-3 py-1 text-[11px] font-bold text-[#82F5C1]">
                            <span className="w-2 h-2 rounded-full bg-[#82F5C1] animate-pulse"></span>
                            Konfirmasi Resmi
                        </span>
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT AREA */}
            <main className="max-w-2xl w-full mx-auto px-4 py-8 sm:py-12 flex-1 flex flex-col justify-center">
                {/* 1. STATE: TOKEN TIDAK DITEMUKAN */}
                {state === 'not_found' && (
                    <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#C5CEE3] shadow-lg text-center animate-in fade-in duration-200">
                        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-extrabold text-[#111C2D]">
                            Tautan Tidak Ditemukan
                        </h1>
                        <p className="mt-3 text-sm text-[#3F463F] leading-relaxed max-w-md mx-auto">
                            {message || 'Tautan konfirmasi tidak ditemukan atau telah diubah. Pastikan membuka tautan resmi yang dikirimkan oleh sekolah melalui WhatsApp.'}
                        </p>
                        <div className="mt-8 pt-6 border-t border-[#C5CEE3]/60 flex flex-col sm:flex-row items-center justify-center gap-3">
                            <Link
                                href="/"
                                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#002114] text-white text-xs font-bold hover:bg-[#143823] transition shadow-sm"
                            >
                                Kembali ke Beranda
                            </Link>
                            <Link
                                href="/kontak"
                                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#E8EEFF] text-[#111C2D] text-xs font-bold hover:bg-[#C5CEE3]/60 transition"
                            >
                                Hubungi Layanan Sekolah
                            </Link>
                        </div>
                    </div>
                )}

                {/* 2. STATE: KADALUARSA (LEBIH DARI 1 MINGGU) */}
                {state === 'expired' && dataSiswa && (
                    <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#C5CEE3] shadow-lg animate-in fade-in duration-200">
                        <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="text-center">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-[11px] font-bold text-amber-800">
                                Batas Waktu Berakhir (1 Minggu)
                            </span>
                            <h1 className="mt-2 text-xl sm:text-2xl font-extrabold text-[#111C2D]">
                                Tautan Konfirmasi Telah Kadaluarsa
                            </h1>
                            <p className="mt-2 text-xs sm:text-sm text-[#3F463F] leading-relaxed max-w-lg mx-auto">
                                Masa berlaku tautan konfirmasi ini (1 minggu) telah berakhir pada{' '}
                                <strong className="text-[#111C2D]">{dataSiswa.berlaku_sampai || '-'}</strong>.
                                Sesuai ketentuan, formulir unggah bukti ketidakhadiran telah ditutup otomatis.
                            </p>
                        </div>

                        {/* RINGKASAN DATA SISWA */}
                        <div className="mt-6 rounded-2xl bg-[#E8EEFF]/60 border border-[#C5CEE3] p-4 sm:p-5 text-xs">
                            <h3 className="font-bold text-[#111C2D] uppercase tracking-wider text-[11px] mb-3">
                                Data Presensi Terdata
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-slate-700">
                                <div>
                                    <span className="text-slate-500 block text-[11px]">Nama Siswa:</span>
                                    <span className="font-bold text-[#111C2D] text-sm">{dataSiswa.nama}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block text-[11px]">NIS & Kelas:</span>
                                    <span className="font-semibold text-[#111C2D]">{dataSiswa.nis} • Kelas {dataSiswa.kelas}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block text-[11px]">Tanggal Presensi:</span>
                                    <span className="font-semibold text-[#111C2D]">{dataSiswa.tanggal_presensi}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block text-[11px]">Status Kehadiran:</span>
                                    <span className="inline-flex items-center gap-1 font-bold text-amber-800">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                                        {dataSiswa.status_label} (Tetap Tercatat Sesuai Guru)
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
                            <strong className="text-slate-800 block mb-1">Catatan Penting:</strong>
                            Status ketidakhadiran ananda tetap tercatat sebagai <strong>{dataSiswa.status_label}</strong> di buku presensi sekolah. Jika Anda memiliki surat keterangan yang ingin diserahkan secara langsung, silakan hubungi wali kelas atau staf Tata Usaha sekolah.
                        </div>

                        <div className="mt-6 text-center">
                            <Link
                                href="/kontak"
                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#002114] text-white text-xs font-bold hover:bg-[#143823] transition shadow-sm"
                            >
                                Hubungi Layanan Sekolah
                            </Link>
                        </div>
                    </div>
                )}

                {/* 3. STATE: SUDAH PERNAH DIGUNAKAN / TERKONFIRMASI */}
                {state === 'already_used' && dataSiswa && (
                    <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#C5CEE3] shadow-lg animate-in fade-in duration-200">
                        <div className="w-14 h-14 rounded-full bg-emerald-100 text-[#006C4A] flex items-center justify-center mx-auto mb-4">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div className="text-center">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E6F5EE] border border-[#CBE9DA] px-3 py-1 text-[11px] font-bold text-[#0E7452]">
                                Berhasil Dikonfirmasi
                            </span>
                            <h1 className="mt-2 text-xl sm:text-2xl font-extrabold text-[#111C2D]">
                                Bukti Kehadiran Sudah Diterima
                            </h1>
                            <p className="mt-2 text-xs sm:text-sm text-[#3F463F] leading-relaxed max-w-lg mx-auto">
                                Bukti surat ketidakhadiran untuk ananda <strong className="text-[#111C2D]">{dataSiswa.nama}</strong> telah berhasil diunggah sebelumnya pada{' '}
                                <strong className="text-[#111C2D]">{dataSiswa.bukti_diunggah_pada || dataSiswa.tanggal_presensi}</strong>.
                            </p>
                        </div>

                        {/* RINGKASAN DATA SISWA */}
                        <div className="mt-6 rounded-2xl bg-[#E8EEFF]/60 border border-[#C5CEE3] p-4 sm:p-5 text-xs">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
                                <div>
                                    <span className="text-slate-500 block text-[11px]">Nama Siswa:</span>
                                    <span className="font-bold text-[#111C2D] text-sm">{dataSiswa.nama}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block text-[11px]">NIS & Kelas:</span>
                                    <span className="font-semibold text-[#111C2D]">{dataSiswa.nis} • Kelas {dataSiswa.kelas}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block text-[11px]">Tanggal Presensi:</span>
                                    <span className="font-semibold text-[#111C2D]">{dataSiswa.tanggal_presensi}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block text-[11px]">Status Kehadiran:</span>
                                    <span className="inline-flex items-center gap-1 font-bold text-[#006C4A]">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#006C4A]"></span>
                                        {dataSiswa.status_label} (Terkonfirmasi Bukti)
                                    </span>
                                </div>
                            </div>

                            {dataSiswa.keterangan_konfirmasi && (
                                <div className="mt-3 pt-3 border-t border-[#C5CEE3]/60">
                                    <span className="text-slate-500 block text-[11px]">Catatan dari Orang Tua:</span>
                                    <p className="mt-0.5 text-xs text-[#111C2D] italic font-medium">
                                        "{dataSiswa.keterangan_konfirmasi}"
                                    </p>
                                </div>
                            )}

                            {dataSiswa.bukti_path && (
                                <div className="mt-4 pt-3 border-t border-[#C5CEE3]/60 flex items-center justify-between">
                                    <span className="text-[11px] text-slate-500">Berkas Bukti Terunggah:</span>
                                    <a
                                        href={dataSiswa.bukti_path}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006C4A] hover:underline"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        Lihat Berkas Terunggah
                                    </a>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 text-center text-xs text-slate-500">
                            Terima kasih atas kerja samanya dalam mengonfirmasi presensi siswa SMPN 2 Soreang.
                        </div>
                    </div>
                )}

                {/* 4. STATE: AKTIF & MENUNGGU UPLOAD BUKTI */}
                {state === 'active' && dataSiswa && (
                    <div className="bg-white rounded-3xl p-6 sm:p-9 border border-[#C5CEE3] shadow-lg animate-in fade-in duration-200">
                        {/* Title & Banner */}
                        <div className="text-center pb-6 border-b border-[#C5CEE3]/60">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8EEFF] border border-[#C5CEE3] px-3.5 py-1 text-xs font-bold text-[#143823]">
                                Formulir Konfirmasi Orang Tua / Wali
                            </span>
                            <h1 className="mt-2 text-xl sm:text-2xl font-extrabold text-[#111C2D]">
                                Unggah Bukti Kehadiran Siswa
                            </h1>
                            <p className="mt-1 text-xs sm:text-sm text-[#3F463F] leading-relaxed max-w-md mx-auto">
                                Mohon lampirkan foto surat dokter atau surat izin dari orang tua/wali untuk verifikasi ketidakhadiran ananda di sekolah.
                            </p>
                        </div>

                        {/* Flash Error / Message */}
                        {flash?.error && (
                            <div className="mt-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{flash.error}</span>
                            </div>
                        )}

                        {/* DETAIL SISWA CARD */}
                        <div className="mt-6 rounded-2xl bg-[#E8EEFF]/70 border border-[#C5CEE3] p-4 sm:p-5 text-xs">
                            <div className="flex items-center justify-between pb-3 border-b border-[#C5CEE3]/50">
                                <div>
                                    <span className="text-slate-500 text-[11px] block">Nama Peserta Didik</span>
                                    <span className="text-base font-extrabold text-[#111C2D]">{dataSiswa.nama}</span>
                                </div>
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold ${
                                    dataSiswa.status === 'S'
                                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                        : 'bg-blue-100 text-blue-800 border border-blue-300'
                                }`}>
                                    Status: {dataSiswa.status_label}
                                </span>
                            </div>

                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                                <div>
                                    <span className="text-slate-500 text-[11px] block">NIS & Rombel:</span>
                                    <span className="font-semibold text-[#111C2D]">{dataSiswa.nis} • Kelas {dataSiswa.kelas}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 text-[11px] block">Hari & Tanggal:</span>
                                    <span className="font-semibold text-[#111C2D]">{dataSiswa.tanggal_presensi}</span>
                                </div>
                                {dataSiswa.mapel && (
                                    <div>
                                        <span className="text-slate-500 text-[11px] block">Sesi Mata Pelajaran:</span>
                                        <span className="font-semibold text-[#111C2D]">
                                            {dataSiswa.mapel} {dataSiswa.jam_ke ? `(Jam Ke-${dataSiswa.jam_ke})` : ''}
                                        </span>
                                    </div>
                                )}
                                <div>
                                    <span className="text-slate-500 text-[11px] block">Batas Akhir Konfirmasi:</span>
                                    <span className="font-semibold text-[#143823]">{dataSiswa.berlaku_sampai || '1 Minggu'}</span>
                                </div>
                            </div>

                            {dataSiswa.catatan_guru && (
                                <div className="mt-3 pt-2.5 border-t border-[#C5CEE3]/50">
                                    <span className="text-slate-500 text-[11px] block">Catatan Guru di Kelas:</span>
                                    <span className="text-slate-700 italic">"{dataSiswa.catatan_guru}"</span>
                                </div>
                            )}
                        </div>

                        {/* FORM UNGGAH BUKTI */}
                        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                            {/* FILE UPLOAD DROPZONE */}
                            <div>
                                <label className="block text-xs font-extrabold text-[#111C2D] mb-1.5 uppercase tracking-wider">
                                    Berkas Bukti Surat / Foto <span className="text-red-500">*</span>
                                </label>
                                <p className="text-[11px] text-slate-500 mb-2.5">
                                    Unggah foto surat dokter, surat permohonan izin dari orang tua, atau dokumen PDF (maksimal 5 MB).
                                </p>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.pdf"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="file-upload"
                                />

                                {!data.bukti ? (
                                    <label
                                        htmlFor="file-upload"
                                        className={`flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl border-2 border-dashed transition cursor-pointer text-center ${
                                            errors.bukti
                                                ? 'border-red-400 bg-red-50/50 hover:bg-red-50'
                                                : 'border-[#006C4A]/40 bg-[#E8EEFF]/30 hover:bg-[#E8EEFF]/60 hover:border-[#006C4A]'
                                        }`}
                                    >
                                        <div className="w-12 h-12 rounded-2xl bg-[#E8EEFF] text-[#006C4A] flex items-center justify-center mb-3 shadow-xs">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <span className="text-xs font-bold text-[#111C2D]">
                                            Ketuk untuk Memilih Berkas Foto atau Dokumen
                                        </span>
                                        <span className="text-[11px] text-slate-500 mt-1">
                                            Format yang didukung: JPG, JPEG, PNG, atau PDF (maks. 5MB)
                                        </span>
                                    </label>
                                ) : (
                                    <div className="rounded-2xl border border-[#C5CEE3] p-4 bg-[#E8EEFF]/30 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-10 h-10 rounded-xl bg-[#006C4A] text-white flex items-center justify-center flex-shrink-0">
                                                    {isPdf ? (
                                                        <svg className="w-5 h-5 text-red-200" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-5 h-5 text-[#82F5C1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-[#111C2D] truncate">
                                                        {selectedFileName}
                                                    </p>
                                                    <p className="text-[11px] text-slate-500">
                                                        {selectedFileSize} • Berkas siap dikirim
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={handleRemoveFile}
                                                className="px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition"
                                            >
                                                Ganti Berkas
                                            </button>
                                        </div>

                                        {/* Image Preview Thumbnail */}
                                        {filePreview && (
                                            <div className="relative mt-2 rounded-xl overflow-hidden border border-[#C5CEE3] max-h-56 bg-black/5 flex items-center justify-center">
                                                <img
                                                    src={filePreview}
                                                    alt="Pratinjau Bukti"
                                                    className="w-full h-auto max-h-56 object-contain"
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}

                                {errors.bukti && (
                                    <p className="mt-1.5 text-xs text-red-600 font-semibold">
                                        {errors.bukti}
                                    </p>
                                )}
                            </div>

                            {/* KETERANGAN TAMBAHAN */}
                            <div>
                                <label className="block text-xs font-extrabold text-[#111C2D] mb-1.5 uppercase tracking-wider">
                                    Catatan / Keterangan Orang Tua (Opsional)
                                </label>
                                <textarea
                                    rows="3"
                                    value={data.keterangan}
                                    onChange={(e) => setData('keterangan', e.target.value)}
                                    placeholder="Contoh: Ananda berobat ke dokter dan disarankan istirahat selama 2 hari..."
                                    className="w-full rounded-2xl border border-[#C5CEE3] bg-[#E8EEFF]/30 p-3 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#006C4A] focus:ring-1 focus:ring-[#006C4A] transition"
                                    maxLength="500"
                                />
                                {errors.keterangan && (
                                    <p className="mt-1 text-xs text-red-600 font-semibold">
                                        {errors.keterangan}
                                    </p>
                                )}
                            </div>

                            {/* PRIVACY & SINGLE-USE NOTICE */}
                            <div className="p-3.5 rounded-2xl bg-[#E8EEFF]/40 border border-[#C5CEE3] flex items-start gap-2 text-[11px] text-[#3F463F] leading-relaxed">
                                <svg className="w-4 h-4 text-[#006C4A] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>
                                    Tautan ini bersifat <strong>sekali pakai</strong>. Setelah bukti dikirimkan, tautan akan terkunci dan berkas langsung diverifikasi ke dalam rekapitulasi kehadiran ananda di SMPN 2 Soreang.
                                </span>
                            </div>

                            {/* SUBMIT BUTTON */}
                            <button
                                type="submit"
                                disabled={processing || !data.bukti}
                                className={`w-full py-3.5 px-6 rounded-2xl font-extrabold text-xs tracking-wide uppercase flex items-center justify-center gap-2 transition shadow-md ${
                                    processing || !data.bukti
                                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                        : 'bg-[#002114] text-white hover:bg-[#143823] active:scale-[0.99]'
                                }`}
                            >
                                {processing ? (
                                    <>
                                        <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                        </svg>
                                        <span>Mengunggah Berkas Bukti...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4 text-[#82F5C1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                        </svg>
                                        <span>Kirim Bukti Kehadiran</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                )}
            </main>

            {/* FOOTER */}
            <footer className="bg-[#143823] text-emerald-100/70 border-t border-[#002114] py-4 text-center text-xs">
                <div className="max-w-4xl mx-auto px-4">
                    <p>&copy; {new Date().getFullYear()} SMP Negeri 2 Soreang • Layanan Terpadu Konfirmasi Kehadiran Siswa</p>
                </div>
            </footer>
        </div>
    );
}

