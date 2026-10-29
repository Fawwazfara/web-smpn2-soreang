import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';

export default function Dashboard({ stats = {} }) {
    const user = usePage().props.auth.user;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-800">
                            Dashboard Pemantauan Kepala Sekolah
                        </h1>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Monitoring menyeluruh absensi kehadiran guru dan siswa SMPN 2 Soreang secara real-time.
                        </p>
                    </div>
                    {stats.tahun_ajaran_aktif && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 border border-purple-200 text-purple-700 rounded-lg text-xs font-semibold">
                            T.A. {stats.tahun_ajaran_aktif.nama} ({stats.tahun_ajaran_aktif.semester})
                        </div>
                    )}
                </div>
            }
        >
            <Head title="Dashboard Kepala Sekolah - SADA" />

            <div className="space-y-6">
                {/* Header Card */}
                <div className="rounded-2xl bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 p-6 text-white shadow-md">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-0.5 text-xs font-medium backdrop-blur-md">
                                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                Mode Monitoring Menyeluruh (Read-Only)
                            </span>
                            <h2 className="mt-2 text-2xl font-bold tracking-tight">
                                Selamat Datang, {user.nama}
                            </h2>
                            <p className="text-xs text-purple-200 mt-1">
                                Hak akses Anda bersifat pemantauan transparan terhadap seluruh aktivitas presensi sekolah tanpa wewenang mengubah data.
                            </p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm px-4 py-3 rounded-xl border border-white/20 text-center">
                            <span className="text-[11px] text-purple-200">Hak Akses</span>
                            <span className="block text-sm font-bold text-white mt-0.5">
                                Read-Only Observer
                            </span>
                        </div>
                    </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500">Guru & Pegawai</p>
                            <p className="text-2xl font-bold text-slate-800 mt-1">{stats.total_guru ?? 0}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">Wajib absen selfie</p>
                        </div>
                        <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                            👨‍🏫
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500">Total Siswa</p>
                            <p className="text-2xl font-bold text-slate-800 mt-1">{stats.total_siswa ?? 0}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">Terdaftar aktif</p>
                        </div>
                        <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                            🎒
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500">Jumlah Kelas</p>
                            <p className="text-2xl font-bold text-slate-800 mt-1">{stats.total_kelas ?? 0}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">T.A. Aktif</p>
                        </div>
                        <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                            🏫
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500">Status Sistem</p>
                            <p className="text-sm font-bold text-emerald-600 mt-2 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                Pemantauan Aktif
                            </p>
                            <p className="text-[11px] text-slate-400 mt-1">Real-time SADA</p>
                        </div>
                        <div className="w-11 h-11 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center font-bold">
                            📊
                        </div>
                    </div>
                </div>

                {/* Monitoring Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Live Kehadiran Guru */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-sm font-bold text-slate-800">
                                    Pemantauan Presensi Guru Hari Ini
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Status kehadiran selfie pegawai dan tepat waktu / terlambat.
                                </p>
                            </div>
                            <span className="text-[11px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-semibold border border-purple-200">
                                Read-Only
                            </span>
                        </div>

                        <div className="p-8 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200 text-xs text-slate-500">
                            <span className="text-3xl block mb-2">📸</span>
                            <p className="font-semibold text-slate-700">Modul Monitoring Rekapitulasi Presensi (Task A5)</p>
                            <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                                Rekap absensi harian guru dan status live camera akan disinkronkan langsung saat modul absensi harian aktif.
                            </p>
                        </div>
                    </div>

                    {/* Live Kehadiran Siswa Per Kelas */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-sm font-bold text-slate-800">
                                    Pemantauan Presensi Siswa Per Kelas
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Rekapitulasi status Hadir (H), Sakit (S), Izin (I), Alfa (A).
                                </p>
                            </div>
                            <span className="text-[11px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-semibold border border-purple-200">
                                Read-Only
                            </span>
                        </div>

                        <div className="p-8 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200 text-xs text-slate-500">
                            <span className="text-3xl block mb-2">📈</span>
                            <p className="font-semibold text-slate-700">Rekapitulasi Kehadiran Siswa Terpadu</p>
                            <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                                Statistik kehadiran siswa per kelas dan verifikasi link orang tua untuk surat izin/sakit.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
