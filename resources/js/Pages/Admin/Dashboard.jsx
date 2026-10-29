import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard({ stats = {} }) {
    const tahunAjaran = stats.tahun_ajaran_aktif;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-800">
                            Dashboard Administrator TU
                        </h1>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Pusat kendali data master, akun pengguna, dan administrasi sekolah SMPN 2 Soreang.
                        </p>
                    </div>
                    {tahunAjaran && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-xs font-semibold">
                            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                            T.A. {tahunAjaran.nama} (Semester {tahunAjaran.semester})
                        </div>
                    )}
                </div>
            }
        >
            <Head title="Dashboard Admin - SADA" />

            <div className="space-y-6">
                {/* Welcome Card */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-6 text-white shadow-md">
                    <div className="relative z-10 max-w-2xl">
                        <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-md">
                            Portal Administrasi SADA
                        </span>
                        <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                            Kelola Master Data & Akun Sekolah
                        </h2>
                        <p className="mt-2 text-xs sm:text-sm text-blue-100 leading-relaxed">
                            Sebagai Administrator / Tata Usaha, Anda berwenang mengelola akun Guru, Guru Piket, Kepala Sekolah, serta pengaturan Tahun Ajaran dan Data Kelas. Monitoring absensi menyeluruh dialihkan ke Kepala Sekolah.
                        </p>
                    </div>
                    <div className="absolute -right-10 -bottom-10 h-48 w-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                </div>

                {/* Metrics Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500">Guru Pengajar</p>
                            <p className="text-2xl font-bold text-slate-800 mt-1">{stats.total_guru ?? 0}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">Akun guru aktif & terdaftar</p>
                        </div>
                        <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                            👨‍🏫
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500">Guru Piket</p>
                            <p className="text-2xl font-bold text-slate-800 mt-1">{stats.total_guru_piket ?? 0}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">Petugas piket harian</p>
                        </div>
                        <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                            🛡️
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500">Kepala Sekolah</p>
                            <p className="text-2xl font-bold text-slate-800 mt-1">{stats.total_kepsek ?? 0}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">Akses monitoring read-only</p>
                        </div>
                        <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                            👔
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500">Total Kelas</p>
                            <p className="text-2xl font-bold text-slate-800 mt-1">{stats.total_kelas ?? 0}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">Tahun ajaran aktif</p>
                        </div>
                        <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                            🏫
                        </div>
                    </div>
                </div>

                {/* Quick Navigation Cards */}
                <div>
                    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">
                        Akses Cepat Modul Administrasi
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Link
                            href={route('users.index')}
                            className="group p-5 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition duration-150 flex flex-col justify-between"
                        >
                            <div>
                                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-3 group-hover:bg-blue-600 group-hover:text-white transition">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition">
                                    Manajemen Pengguna
                                </h3>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                    Tambah, perbarui, dan nonaktifkan akun Guru, Guru Piket, dan Kepsek.
                                </p>
                            </div>
                            <span className="text-xs font-semibold text-blue-600 mt-4 flex items-center gap-1 group-hover:translate-x-0.5 transition">
                                Buka Modul →
                            </span>
                        </Link>

                        <Link
                            href={route('tahun-ajaran.index')}
                            className="group p-5 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition duration-150 flex flex-col justify-between"
                        >
                            <div>
                                <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3 group-hover:bg-indigo-600 group-hover:text-white transition">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition">
                                    Tahun Ajaran
                                </h3>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                    Kelola kalender akademik dan pilih satu tahun ajaran yang aktif.
                                </p>
                            </div>
                            <span className="text-xs font-semibold text-indigo-600 mt-4 flex items-center gap-1 group-hover:translate-x-0.5 transition">
                                Buka Modul →
                            </span>
                        </Link>

                        <Link
                            href={route('kelas.index')}
                            className="group p-5 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition duration-150 flex flex-col justify-between"
                        >
                            <div>
                                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 group-hover:bg-emerald-600 group-hover:text-white transition">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <h3 className="text-sm font-bold text-slate-800 group-hover:text-emerald-600 transition">
                                    Data Kelas
                                </h3>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                    Kelola ruang kelas dan tetapkan Guru sebagai Wali Kelas.
                                </p>
                            </div>
                            <span className="text-xs font-semibold text-emerald-600 mt-4 flex items-center gap-1 group-hover:translate-x-0.5 transition">
                                Buka Modul →
                            </span>
                        </Link>

                        <Link
                            href={route('admin.berita.index')}
                            className="group p-5 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition duration-150 flex flex-col justify-between"
                        >
                            <div>
                                <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mb-3 group-hover:bg-purple-600 group-hover:text-white transition">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                    </svg>
                                </div>
                                <h3 className="text-sm font-bold text-slate-800 group-hover:text-purple-600 transition">
                                    Berita & CMS
                                </h3>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                    Publikasikan artikel dan pengumuman untuk halaman landing sekolah.
                                </p>
                            </div>
                            <span className="text-xs font-semibold text-purple-600 mt-4 flex items-center gap-1 group-hover:translate-x-0.5 transition">
                                Buka Modul →
                            </span>
                        </Link>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
