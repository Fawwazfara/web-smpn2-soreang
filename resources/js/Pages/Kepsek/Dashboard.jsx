import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

export default function Dashboard({ stats = {}, kelasList = [] }) {
    const user = usePage().props.auth.user;
    const [tingkatFilter, setTingkatFilter] = useState('all');

    const tahunAjaran = stats.tahun_ajaran_aktif;
    const totalGuru = stats.total_guru ?? 0;
    const guruAktif = stats.total_guru_aktif ?? totalGuru;
    const tendik = stats.total_tendik ?? 0;
    const totalPiket = stats.total_guru_piket ?? 0;
    const totalSiswa = stats.total_siswa ?? 0;
    const totalKelas = stats.total_kelas ?? kelasList.length;

    const guruAktifPct = totalGuru > 0 ? ((guruAktif / totalGuru) * 100).toFixed(1) : '100.0';

    const filteredKelas = useMemo(() => {
        const list =
            tingkatFilter === 'all'
                ? kelasList
                : kelasList.filter((k) => String(k.tingkat) === String(tingkatFilter));
        return list.slice(0, 6);
    }, [kelasList, tingkatFilter]);

    const radius = 52;
    const circumference = 2 * Math.PI * radius;
    const totalPegawai = Math.max(1, totalGuru + totalPiket);
    const segGuru = (Math.max(0, totalGuru - tendik) / totalPegawai) * circumference;
    const segTendik = (tendik / totalPegawai) * circumference;
    const segPiket = (totalPiket / totalPegawai) * circumference;

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard Kepala Sekolah - SADA" />

            <div className="space-y-6">
                {/* Executive Header Area (Figma Screenshot 2 Left-Border Serif Title) */}
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
                            <span>KEPSEK WORKSPACE</span>
                            <span>›</span>
                            <span>MONITORING MENYELURUH</span>
                            <span>›</span>
                            <span className="text-[#0E7452]">RINGKASAN EKSEKUTIF</span>
                        </div>
                        <div className="mt-2 border-l-4 border-[#0F382A] pl-4">
                            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                                Pemantauan Kehadiran & Operasional Sekolah
                            </h1>
                        </div>
                        <p className="mt-2 text-xs sm:text-[13px] text-slate-500 max-w-2xl leading-relaxed">
                            Selamat datang, <strong className="text-slate-700">{user.nama}</strong>. Halaman ini menampilkan pemantauan menyeluruh kehadiran guru dan siswa SMPN 2 Soreang secara real-time dalam mode baca-saja (Read-Only).
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                        <span className="inline-flex items-center gap-2 rounded-xl border border-[#CBE9DA] bg-[#E6F5EE] px-3.5 py-2 text-xs font-bold text-[#0E7452]">
                            <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
                            Mode Pemantauan Read-Only
                        </span>
                        {tahunAjaran && (
                            <span className="inline-flex items-center rounded-xl border border-[#E5ECE9] bg-white px-3.5 py-2 text-xs font-bold text-slate-800 shadow-2xs">
                                T.A. {tahunAjaran.nama} • {tahunAjaran.semester}
                            </span>
                        )}
                    </div>
                </div>

                {/* 4 Executive KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {/* Guru & Tendik */}
                    <div className="rounded-2xl border border-[#E5ECE9] bg-white p-5 shadow-2xs flex flex-col justify-between">
                        <div>
                            <div className="flex items-start justify-between">
                                <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                                    TENAGA PENDIDIK
                                </span>
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E6F5EE] text-[#0E7452]">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="mt-2 flex items-baseline gap-1.5">
                                <span className="text-3xl font-extrabold text-slate-900">{guruAktif}</span>
                                <span className="text-xs font-semibold text-slate-400">/ {totalGuru} Pegawai</span>
                            </div>
                            <p className="mt-1 text-[11px] font-semibold text-[#0E7452]">
                                ↗ {guruAktifPct}% Akun Aktif Wajib Selfie
                            </p>
                        </div>
                        <div className="mt-4 rounded-xl bg-[#F4F9F6] px-3 py-2 text-[11px] font-bold text-[#0E7452] text-center">
                            Validasi Kamera Langsung
                        </div>
                    </div>

                    {/* Total Siswa */}
                    <div className="rounded-2xl border border-[#E5ECE9] bg-white p-5 shadow-2xs flex flex-col justify-between">
                        <div>
                            <div className="flex items-start justify-between">
                                <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                                    PESERTA DIDIK
                                </span>
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EBF1FF] text-[#1E40AF]">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347M12 3.493a59.903 59.903 0 0110.399 5.84" />
                                    </svg>
                                </div>
                            </div>
                            <div className="mt-2 flex items-baseline gap-1.5">
                                <span className="text-3xl font-extrabold text-slate-900">{totalSiswa}</span>
                                <span className="text-xs font-semibold text-slate-400">Siswa</span>
                            </div>
                            <p className="mt-1 text-[11px] text-slate-500">
                                Pemantauan H / S / I / A per sesi kelas
                            </p>
                        </div>
                        <div className="mt-4 h-1.5 w-full rounded-full bg-[#EDF2F0] overflow-hidden">
                            <div className="h-full w-full rounded-full bg-[#10B981]" />
                        </div>
                    </div>

                    {/* Rombongan Belajar */}
                    <div className="rounded-2xl border border-[#E5ECE9] bg-white p-5 shadow-2xs flex flex-col justify-between">
                        <div>
                            <div className="flex items-start justify-between">
                                <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                                    ROMBONGAN BELAJAR
                                </span>
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EDF6F1] text-[#0F382A]">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15" />
                                    </svg>
                                </div>
                            </div>
                            <div className="mt-2 flex items-baseline gap-1.5">
                                <span className="text-3xl font-extrabold text-slate-900">{totalKelas}</span>
                                <span className="text-xs font-semibold text-slate-400">Kelas</span>
                            </div>
                            <p className="mt-1 text-[11px] text-slate-500">
                                Terikat pada Tahun Ajaran Aktif
                            </p>
                        </div>
                        <div className="mt-4 rounded-xl bg-[#F8FAF9] px-3 py-2 text-[11px] font-medium text-slate-600 text-center">
                            Kelas VII • Kelas VIII • Kelas IX
                        </div>
                    </div>

                    {/* Petugas Guru Piket */}
                    <div className="rounded-2xl border border-[#E5ECE9] bg-white p-5 shadow-2xs flex flex-col justify-between">
                        <div>
                            <div className="flex items-start justify-between">
                                <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                                    PETUGAS GURU PIKET
                                </span>
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FEF3E2] text-[#B45309]">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818" />
                                    </svg>
                                </div>
                            </div>
                            <div className="mt-2 flex items-baseline gap-1.5">
                                <span className="text-3xl font-extrabold text-slate-900">{totalPiket}</span>
                                <span className="text-xs font-semibold text-slate-400">Personel</span>
                            </div>
                            <p className="mt-1 text-[11px] text-slate-500">
                                Pengawal pembukaan sesi pengganti 6-digit
                            </p>
                        </div>
                        <div className="mt-4 rounded-xl bg-[#FFF9F0] px-3 py-2 text-[11px] font-bold text-[#B45309] text-center">
                            Terkunci Default Tanpa Kode
                        </div>
                    </div>
                </div>

                {/* Monitoring Grid: Rombel Progress + Komposisi Pegawai */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    {/* Rombel per Angkatan */}
                    <div className="lg:col-span-8 rounded-2xl border border-[#E5ECE9] bg-white p-6 shadow-2xs flex flex-col justify-between">
                        <div>
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                <div>
                                    <h2 className="text-base sm:text-lg font-bold text-slate-900">
                                        Pemantauan Kelas per Angkatan & Rombel
                                    </h2>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Monitoring distribusi siswa dan wali kelas (rekaman real-time sesi menyusul pada Modul Monitoring A5)
                                    </p>
                                </div>

                                <div className="inline-flex items-center rounded-xl bg-[#F4F7F6] p-1 text-xs self-start">
                                    {[
                                        { key: 'all', label: 'Semua' },
                                        { key: '7', label: 'Kelas 7' },
                                        { key: '8', label: 'Kelas 8' },
                                        { key: '9', label: 'Kelas 9' },
                                    ].map((tab) => (
                                        <button
                                            key={tab.key}
                                            type="button"
                                            onClick={() => setTingkatFilter(tab.key)}
                                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                                                tingkatFilter === tab.key
                                                    ? 'bg-white text-slate-900 shadow-2xs'
                                                    : 'text-slate-500 hover:text-slate-800'
                                            }`}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-6 space-y-5">
                                {filteredKelas.length === 0 ? (
                                    <div className="rounded-xl border border-dashed border-[#DCE5E1] bg-[#F8FAF9] p-8 text-center text-xs text-slate-500">
                                        Belum ada data kelas yang terdaftar pada tahun ajaran aktif.
                                    </div>
                                ) : (
                                    filteredKelas.map((item) => {
                                        const hasWali = Boolean(item.wali_kelas);
                                        const siswaCount = item.siswa_count ?? 0;
                                        const barPct = hasWali ? 96 : 70;
                                        const barColor = hasWali ? 'bg-[#10B981]' : 'bg-[#EA9A15]';

                                        return (
                                            <div key={item.id}>
                                                <div className="flex items-center justify-between text-xs mb-1.5">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <span className={`h-2 w-2 rounded-full ${barColor} shrink-0`} />
                                                        <span className="font-bold text-slate-800">
                                                            Kelas {item.nama}
                                                        </span>
                                                        <span className="text-slate-400 truncate">
                                                            ({siswaCount} Siswa • {item.wali_kelas ? item.wali_kelas.nama : 'Wali belum diatur'})
                                                        </span>
                                                    </div>
                                                    <span className="font-bold text-[#0E7452] shrink-0 ml-2">
                                                        Terpantau
                                                    </span>
                                                </div>
                                                <div className="h-2 w-full rounded-full bg-[#EDF2F0] overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${barColor}`}
                                                        style={{ width: `${barPct}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-[#F0F4F2] flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                            <span>Hak akses Kepala Sekolah bersifat transparan & Read-Only sesuai SOP SADA.</span>
                            <span className="font-bold text-[#0E7452]">SADA Monitoring v2.0</span>
                        </div>
                    </div>

                    {/* Komposisi Pegawai Donut */}
                    <div className="lg:col-span-4 rounded-2xl border border-[#E5ECE9] bg-white p-6 shadow-2xs flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between">
                                <h2 className="text-base font-bold text-slate-900">Komposisi Pegawai</h2>
                                <span className="rounded-lg bg-[#EDF6F1] px-2.5 py-0.5 text-[10.5px] font-bold text-[#0E7452]">
                                    Read-Only
                                </span>
                            </div>

                            <div className="my-6 flex items-center justify-center">
                                <div className="relative h-36 w-36 flex items-center justify-center">
                                    <svg className="h-36 w-36 -rotate-90" viewBox="0 0 128 128">
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r={radius}
                                            fill="transparent"
                                            stroke="#EDF2F0"
                                            strokeWidth="13"
                                        />
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r={radius}
                                            fill="transparent"
                                            stroke="#0B6E4F"
                                            strokeWidth="13"
                                            strokeDasharray={`${segGuru} ${circumference}`}
                                            strokeDashoffset={0}
                                        />
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r={radius}
                                            fill="transparent"
                                            stroke="#0EA5E9"
                                            strokeWidth="13"
                                            strokeDasharray={`${segTendik} ${circumference}`}
                                            strokeDashoffset={-segGuru}
                                        />
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r={radius}
                                            fill="transparent"
                                            stroke="#EA9A15"
                                            strokeWidth="13"
                                            strokeDasharray={`${segPiket} ${circumference}`}
                                            strokeDashoffset={-(segGuru + segTendik)}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                        <span className="text-2xl font-extrabold text-slate-900">
                                            {totalGuru + totalPiket}
                                        </span>
                                        <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#0E7452]">
                                            PERSONEL
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2.5 text-xs">
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-2 text-slate-600">
                                        <span className="h-2.5 w-2.5 rounded-full bg-[#0B6E4F]" />
                                        Guru Pengajar
                                    </span>
                                    <span className="font-bold text-slate-900">
                                        {Math.max(0, totalGuru - tendik)} Orang
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-2 text-slate-600">
                                        <span className="h-2.5 w-2.5 rounded-full bg-[#0EA5E9]" />
                                        Tenaga Kependidikan
                                    </span>
                                    <span className="font-bold text-slate-900">{tendik} Orang</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-2 text-slate-600">
                                        <span className="h-2.5 w-2.5 rounded-full bg-[#EA9A15]" />
                                        Petugas Guru Piket
                                    </span>
                                    <span className="font-bold text-slate-900">{totalPiket} Orang</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-5 rounded-xl bg-[#F4F9F6] p-3 text-[11px] text-[#0E7452] font-medium leading-relaxed">
                            Seluruh guru pengajar, tenaga kependidikan, dan guru piket wajib melakukan presensi harian berbasis kamera langsung.
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
