import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Dashboard({ stats = {}, kelasList = [] }) {
    const user = usePage().props.auth.user;
    const [kodeInput, setKodeInput] = useState('');
    const [inputMsg, setInputMsg] = useState(null);

    const handleVerifyCode = (e) => {
        e.preventDefault();
        if (kodeInput.length !== 6 || !/^\d+$/.test(kodeInput)) {
            setInputMsg({
                type: 'error',
                text: 'Kode harus berupa 6 digit angka numerik.',
            });
            return;
        }

        setInputMsg({
            type: 'info',
            text: 'Modul validasi sesi pengganti (Task P5) sedang dalam tahap integrasi.',
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-800">
                            Dashboard Guru Piket
                        </h1>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Manajemen pembukaan sesi kelas dan absensi guru pengganti SMPN 2 Soreang.
                        </p>
                    </div>
                    {stats.tahun_ajaran_aktif && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-xs font-semibold">
                            T.A. {stats.tahun_ajaran_aktif.nama}
                        </div>
                    )}
                </div>
            }
        >
            <Head title="Dashboard Guru Piket - SADA" />

            <div className="space-y-6">
                {/* Piket Header */}
                <div className="rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-orange-600 p-6 text-white shadow-md">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-0.5 text-xs font-medium backdrop-blur-md">
                                Petugas Piket Harian Terdaftar
                            </span>
                            <h2 className="mt-2 text-2xl font-bold tracking-tight">
                                Halo, {user.nama}
                            </h2>
                            <p className="text-xs text-amber-100 font-mono mt-1">
                                WhatsApp Aktif: {user.no_wa || 'Belum diatur'} • NIP: {user.username}
                            </p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm px-4 py-3 rounded-xl border border-white/20 text-center">
                            <span className="text-[11px] text-amber-100">Total Ruang Kelas</span>
                            <span className="block text-xl font-bold text-white mt-0.5">
                                {stats.total_kelas ?? kelasList.length} Kelas
                            </span>
                        </div>
                    </div>
                </div>

                {/* Section Input Kode Unik Sesi Pengganti */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-2">
                            <span className="p-2 bg-amber-100 text-amber-800 rounded-lg text-sm">
                                🔑
                            </span>
                            <h2 className="text-base font-bold text-slate-800">
                                Buka Sesi Kelas Pengganti (Input Kode 6-Digit)
                            </h2>
                        </div>
                        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                            Sesuai PRD Bagian 2.C & 3: Sebelum kode valid diinput, seluruh sesi kelas berstatus <strong>Terkunci (Locked)</strong>. Masukkan kode 6 digit numerik yang diberikan oleh guru pemilik sesi yang berhalangan hadir untuk membuka absensi.
                        </p>

                        <form onSubmit={handleVerifyCode} className="mt-4 flex flex-col sm:flex-row gap-2 max-w-md">
                            <input
                                type="text"
                                maxLength={6}
                                value={kodeInput}
                                onChange={(e) => setKodeInput(e.target.value.replace(/\D/g, ''))}
                                placeholder="Masukkan 6 Digit Angka"
                                className="rounded-lg border-slate-300 text-sm font-mono tracking-widest text-center py-2 px-4 focus:border-amber-500 focus:ring-amber-500"
                            />
                            <button
                                type="submit"
                                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
                            >
                                Validasi & Buka Sesi
                            </button>
                        </form>

                        {inputMsg && (
                            <div className={`mt-3 p-3 rounded-lg text-xs ${
                                inputMsg.type === 'error'
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}>
                                {inputMsg.text}
                            </div>
                        )}
                    </div>
                </div>

                {/* Status Kelas Terkunci Grid (PRD 2.C) */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-base font-bold text-slate-800">
                                Status Sesi & Kelas Hari Ini
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Semua sesi kelas tampil terkunci (locked) secara default demi integritas data absensi.
                            </p>
                        </div>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Default Terkunci
                        </span>
                    </div>

                    {kelasList.length === 0 ? (
                        <div className="p-8 text-center text-xs text-slate-400">
                            Belum ada data kelas yang terdaftar pada tahun ajaran aktif.
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {kelasList.map((kelas) => (
                                <div
                                    key={kelas.id}
                                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between hover:border-slate-300 transition"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-slate-800 text-xs">
                                            {kelas.nama}
                                        </span>
                                        <span className="text-slate-400" title="Sesi Terkunci">
                                            🔒
                                        </span>
                                    </div>
                                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-3">
                                        Sesi Locked
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
