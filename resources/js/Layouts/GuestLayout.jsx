import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="relative min-h-screen w-full flex items-center justify-center bg-[#123324] px-4 py-8 sm:px-6 lg:px-12">
            {/* Background decorative elements */}
            <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-emerald-500/15 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-[520px] h-[520px] bg-emerald-400/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-600/5 rounded-full blur-[140px] pointer-events-none" />
            
            <div className="relative z-10 w-full max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-center">
                    {/* BRANDING SECTION: Desktop Left Column */}
                    <div className="hidden lg:block lg:col-span-6 xl:col-span-7">
                        <div className="flex flex-col justify-start">
                            {/* Logo & School Identity */}
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center text-emerald-400 shadow-lg shadow-black/20 shrink-0">
                                    <svg className="w-8 h-8 sm:w-9 sm:h-9" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.5L12 4l9 5.5M5 10.5v7.5m4.5-7.5v7.5m5-7.5v7.5m4.5-7.5v7.5M3.5 18.5h17M2.5 20.5h19" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-none tracking-tight">SMPN 2 SOREANG</h2>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-400/30">Resmi</span>
                                    </div>
                                    <p className="mt-1 text-emerald-400/90 text-sm sm:text-base font-medium">Sistem Absensi & Manajemen Kehadiran Digital</p>
                                </div>
                            </div>

                            {/* Vision / Description */}
                            <div className="mt-8 sm:mt-10 max-w-xl">
                                <h3 className="text-lg sm:text-xl font-semibold text-emerald-400/80 mb-4">Visi & Misi</h3>
                                <p className="text-white/70 text-sm sm:text-base leading-relaxed">
                                    Menjadikan sekolah unggul, berkarakter, dan berkelanjutan melalui pengelolaan kehadiran digital yang transparan, akuntabel, dan berbasis data untuk mendukung proses pembelajaran berkualitas.
                                </p>
                            </div>

                            {/* Features/Stats */}
                            <div className="mt-10 grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                                    <div className="text-2xl sm:text-3xl font-extrabold text-white">2.4K+</div>
                                    <div className="text-emerald-400/80 text-xs sm:text-sm mt-1">Peserta Didik</div>
                                </div>
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                                    <div className="text-2xl sm:text-3xl font-extrabold text-white">180+</div>
                                    <div className="text-emerald-400/80 text-xs sm:text-sm mt-1">Guru & Staff</div>
                                </div>
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                                    <div className="text-2xl sm:text-3xl font-extrabold text-white">48</div>
                                    <div className="text-emerald-400/80 text-xs sm:text-sm mt-1">Kelas & Rombel</div>
                                </div>
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                                    <div className="text-2xl sm:text-3xl font-extrabold text-white">98%</div>
                                    <div className="text-emerald-400/80 text-xs sm:text-sm mt-1">Akurasi Presensi</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* MOBILE HEADER: Shown only on mobile */}
                    <div className="lg:hidden order-1">
                        <div className="flex flex-col items-center text-center mb-8">
                            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center text-emerald-400 shadow-lg shadow-black/20 shrink-0 mb-4">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.5L12 4l9 5.5M5 10.5v7.5m4.5-7.5v7.5m5-7.5v7.5m4.5-7.5v7.5M3.5 18.5h17M2.5 20.5h19" />
                                </svg>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                                <h2 className="text-2xl font-extrabold text-white">SMPN 2 SOREANG</h2>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-400/30">Resmi</span>
                            </div>
                            <p className="text-emerald-400/90 text-sm">Sistem Absensi & Manajemen Kehadiran Digital</p>
                        </div>
                    </div>

                    {/* FORM SECTION: Right Column on Desktop, Below Branding on Mobile */}
                    <div className="lg:col-span-6 xl:col-span-5 lg:order-none order-2 lg:order-none">
                        <div className="w-full max-w-md mx-auto lg:mx-0">
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/30">
                                {children}
                            </div>
                            
                            {/* Footer Links */}
                            <div className="mt-6 text-center">
                                <p className="text-white/50 text-xs sm:text-sm">
                                    Sistem Absensi & Manajemen Kehadiran Digital SMPN 2 Soreang
                                </p>
                                <p className="text-white/40 text-[11px] mt-1">
                                    © 2025 SADA V2.0 — Dikembangkan untuk SMPN 2 Soreang
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* MOBILE VISION SECTION: Shown only on mobile, between header and form */}
                    <div className="lg:hidden order-3">
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 mt-6">
                            <h3 className="text-base font-semibold text-emerald-400/80 mb-3 text-center">Visi & Misi</h3>
                            <p className="text-white/70 text-sm leading-relaxed text-center">
                                Menjadikan sekolah unggul, berkarakter, dan berkelanjutan melalui pengelolaan kehadiran digital yang transparan, akuntabel, dan berbasis data untuk mendukung proses pembelajaran berkualitas.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
