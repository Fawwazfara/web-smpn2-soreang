import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';

export default function Dashboard({ piketHariIni = [], tahunAjaranAktif = null }) {
    const user = usePage().props.auth.user;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-800">
                            Dashboard Guru & Tenaga Kependidikan
                        </h1>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Sistem Absensi Digital (SADA) SMPN 2 Soreang.
                        </p>
                    </div>
                    {tahunAjaranAktif && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-semibold">
                            T.A. {tahunAjaranAktif.nama} ({tahunAjaranAktif.semester})
                        </div>
                    )}
                </div>
            }
        >
            <Head title="Dashboard Guru - SADA" />

            <div className="space-y-6">
                {/* Profile Card */}
                <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white shadow-md">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-0.5 text-xs font-medium backdrop-blur-md">
                                {user.jenis_pegawai === 'tenaga_kependidikan' ? 'Tenaga Kependidikan' : 'Guru Pengajar'}
                            </span>
                            <h2 className="mt-2 text-2xl font-bold tracking-tight">
                                Selamat Datang, {user.nama}
                            </h2>
                            <p className="text-xs text-emerald-100 font-mono mt-1">
                                NIP / NUPTK: {user.username} {user.email ? `• ${user.email}` : ''}
                            </p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm px-4 py-3 rounded-xl border border-white/20 flex flex-col items-center">
                            <span className="text-[11px] text-emerald-100">Status Kehadiran Hari Ini</span>
                            <span className="text-sm font-bold text-white mt-0.5 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-amber-300"></span>
                                Belum Absen Selfie
                            </span>
                        </div>
                    </div>
                </div>

                {/* Grid Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left 2 Cols: Main Activities */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Absen Harian Live Selfie Card */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-base font-bold text-slate-800">
                                        Presensi Harian Pegawai (Live Selfie)
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Wajib dilakukan setiap hari kerja menggunakan kamera langsung (kamera depan/webcam). Opsi upload galeri tidak diperkenankan sesuai SOP sekolah.
                                    </p>
                                </div>
                                <span className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                                    📷
                                </span>
                            </div>

                            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs font-semibold text-slate-700">
                                        Validasi Kamera Langsung & Deteksi Kehadiran
                                    </p>
                                    <p className="text-[11px] text-slate-500">
                                        Mencatat waktu masuk tepat waktu atau terlambat.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    disabled
                                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold opacity-85 cursor-not-allowed hover:bg-emerald-700"
                                >
                                    Ambil Foto Selfie (Segera)
                                </button>
                            </div>
                        </div>

                        {/* Jadwal Mengajar Sesi Hari Ini */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-base font-bold text-slate-800">
                                        Jadwal Mengajar Hari Ini
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Daftar jam pelajaran dan kelas yang diampu pada hari ini.
                                    </p>
                                </div>
                                <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md font-semibold border border-blue-200">
                                    Presensi Kelas
                                </span>
                            </div>

                            <div className="p-8 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200">
                                <span className="text-3xl">📚</span>
                                <h4 className="text-xs font-semibold text-slate-700 mt-2">
                                    Generator Sesi & Jadwal Terpadu
                                </h4>
                                <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-1">
                                    Sesi mengajar harian akan tampil otomatis sesuai versi jadwal aktif yang dikonfigurasi admin. Guru mencatat kehadiran siswa (H/S/I/A).
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Col: Guru Piket & Penggantian Absen */}
                    <div className="space-y-6">
                        {/* Card Alur Penggantian */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="p-2 bg-amber-50 text-amber-600 rounded-lg text-sm">
                                    ⚠️
                                </span>
                                <h3 className="text-sm font-bold text-slate-800">
                                    Bila Berhalangan Mengajar
                                </h3>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Sesuai SOP SADA Bagian 3:
                            </p>
                            <ol className="text-xs text-slate-600 list-decimal list-inside space-y-1.5 mt-2">
                                <li>Hubungi Guru Piket yang bertugas hari ini via WhatsApp.</li>
                                <li>Bila disetujui, generate <strong>kode unik 6-digit numerik</strong> untuk sesi yang ditinggalkan.</li>
                                <li>Kirimkan kode ke Guru Piket agar sesi kelas dapat dibuka dan diabsen sebagai guru pengganti.</li>
                            </ol>

                            <div className="mt-4 pt-4 border-t border-slate-100">
                                <h4 className="text-xs font-bold text-slate-800 mb-2">
                                    Daftar Guru Piket Hari Ini:
                                </h4>
                                {piketHariIni.length === 0 ? (
                                    <p className="text-xs text-slate-400 italic">
                                        Belum ada jadwal guru piket aktif hari ini.
                                    </p>
                                ) : (
                                    <div className="space-y-2">
                                        {piketHariIni.map((piket) => (
                                            <div
                                                key={piket.id}
                                                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                                            >
                                                <div>
                                                    <p className="font-semibold text-slate-800">{piket.nama}</p>
                                                    <p className="text-[11px] text-slate-500 font-mono">{piket.no_wa}</p>
                                                </div>
                                                {piket.no_wa && (
                                                    <a
                                                        href={`https://wa.me/${piket.no_wa}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[11px] font-semibold transition"
                                                    >
                                                        <span>Hubungi WA</span>
                                                    </a>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Generate Kode Placeholder */}
                        <div className="bg-amber-50/70 p-5 rounded-2xl border border-amber-200 text-xs">
                            <h4 className="font-bold text-amber-900 flex items-center gap-1.5">
                                <span>🔑</span> Generate Kode Pengganti
                            </h4>
                            <p className="text-[11px] text-amber-800 mt-1 leading-relaxed">
                                Kode berlaku sekali pakai sejak dibuat hingga jam sesi berakhir. Hanya guru pemilik sesi yang dapat membuat kode.
                            </p>
                            <button
                                type="button"
                                disabled
                                className="mt-3 w-full py-2 bg-amber-600 text-white rounded-lg font-semibold text-xs opacity-80 cursor-not-allowed"
                            >
                                Generate Kode 6-Digit (Segera)
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
