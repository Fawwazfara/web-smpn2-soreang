import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function PublicLayout({
    children,
    auth,
    active = 'beranda',
    title = 'SMPN 2 Soreang',
    description = 'Portal Resmi Informasi, Layanan Pendidikan & Presensi Digital Terpadu SMP Negeri 2 Soreang Kab. Bandung',
}) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navItems = [
        { id: 'beranda', label: 'Beranda', href: '/' },
        { id: 'profil', label: 'Profil', href: '/profil' },
        { id: 'berita', label: 'Berita', href: '/berita' },
        { id: 'galeri', label: 'Galeri', href: '/galeri' },
        { id: 'kontak', label: 'Kontak', href: '/kontak' },
    ];

    return (
        <div className="min-h-screen bg-[#fafcfb] text-gray-800 font-sans selection:bg-emerald-700 selection:text-white flex flex-col justify-between">
            <Head>
                <title>{title}</title>
                <meta name="description" content={description} />
            </Head>

            {/* TOP NAVIGATION BAR */}
            <header className="sticky top-0 z-50 bg-[#0d2e23] border-b border-emerald-900/60 shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 sm:h-20">
                        {/* School Logo & Title */}
                        <Link href="/" className="flex items-center gap-3 group focus:outline-none">
                            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-emerald-800/80 border border-emerald-600/40 flex items-center justify-center text-white shadow-inner flex-shrink-0 group-hover:scale-105 transition-transform">
                                <svg className="w-6 h-6 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                </svg>
                            </div>
                            <div className="leading-tight">
                                <span className="block text-white font-bold text-base sm:text-lg tracking-tight group-hover:text-emerald-300 transition-colors">
                                    SMPN 2 Soreang
                                </span>
                                <span className="block text-emerald-300 text-[10px] sm:text-[11px] font-medium tracking-wider uppercase">
                                    Kab. Bandung - Indonesia
                                </span>
                            </div>
                        </Link>

                        {/* Desktop Navigation Links */}
                        <nav className="hidden lg:flex items-center space-x-1 sm:space-x-2 text-xs font-semibold tracking-wide">
                            {navItems.map((item) => {
                                const isActive = active === item.id;
                                return (
                                    <Link
                                        key={item.id}
                                        href={item.href}
                                        className={`px-3.5 py-1.5 rounded-full transition-all duration-150 ${
                                            isActive
                                                ? 'bg-emerald-800 text-white shadow-sm ring-1 ring-emerald-600/50'
                                                : 'text-emerald-100/90 hover:text-white hover:bg-emerald-900/50'
                                        }`}
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Search & Login Action */}
                        <div className="hidden sm:flex items-center gap-3">
                            <Link
                                href="/berita"
                                className="p-2 text-emerald-300 hover:text-white rounded-full hover:bg-emerald-800/50 transition"
                                title="Cari Berita & Informasi"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </Link>

                            {auth?.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-full font-semibold text-xs tracking-wide transition shadow-sm inline-flex items-center gap-1.5"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                    Dashboard ({auth.user.nama?.split(' ')[0]})
                                </Link>
                            ) : (
                                <Link
                                    href={route('login')}
                                    className="bg-white hover:bg-emerald-50 text-[#0d2e23] px-4 py-2 rounded-full font-bold text-xs tracking-wide transition shadow-sm inline-flex items-center gap-1.5"
                                >
                                    Login
                                </Link>
                            )}
                        </div>

                        {/* Mobile Hamburger Button */}
                        <div className="flex sm:hidden items-center gap-2">
                            {auth?.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="bg-emerald-600 text-white px-2.5 py-1.5 rounded-full text-xs font-semibold"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <Link
                                    href={route('login')}
                                    className="bg-white text-[#0d2e23] px-3 py-1.5 rounded-full text-xs font-bold"
                                >
                                    Login
                                </Link>
                            )}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="p-2 text-emerald-300 hover:text-white rounded-lg focus:outline-none"
                                aria-label="Buka Menu"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d={mobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Drawer */}
                {mobileMenuOpen && (
                    <div className="lg:hidden bg-[#0a241b] border-t border-emerald-900 px-4 py-3 space-y-1">
                        {navItems.map((item) => {
                            const isActive = active === item.id;
                            return (
                                <Link
                                    key={item.id}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`block px-3 py-2 rounded-md font-semibold text-sm transition ${
                                        isActive
                                            ? 'bg-emerald-800 text-white'
                                            : 'text-emerald-100 hover:bg-emerald-900/60'
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>
                )}
            </header>

            {/* MAIN CONTENT */}
            <main className="flex-1">
                {children}
            </main>

            {/* FOOTER */}
            <footer className="bg-[#0a241b] text-gray-300 pt-16 pb-10 border-t border-emerald-900/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
                        {/* School Summary */}
                        <div className="lg:col-span-5 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-800/80 border border-emerald-600/40 flex items-center justify-center text-white">
                                    <svg className="w-6 h-6 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-base">SMP Negeri 2 Soreang</h4>
                                    <p className="text-emerald-300 text-xs">Pendidikan Karakter &amp; Integritas Digital</p>
                                </div>
                            </div>
                            <p className="text-xs sm:text-sm text-emerald-100/70 leading-relaxed max-w-sm">
                                Membina generasi pelajar yang berakhlak mulia, cakap dalam teknologi, berakar pada kearifan budaya lokal, serta siap menyongsong masa depan gemilang.
                            </p>
                            <div className="flex items-center gap-2 pt-2">
                                <span className="inline-flex items-center px-2.5 py-1 rounded text-[11px] font-semibold bg-emerald-900/80 text-emerald-300 border border-emerald-700/50">
                                    NPSN: 20206128
                                </span>
                                <span className="inline-flex items-center px-2.5 py-1 rounded text-[11px] font-semibold bg-emerald-900/80 text-emerald-300 border border-emerald-700/50">
                                    Akreditasi A
                                </span>
                            </div>
                        </div>

                        {/* Quick Navigation Links */}
                        <div className="lg:col-span-3 space-y-3">
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                                Menu Utama
                            </h4>
                            <ul className="space-y-2 text-xs text-emerald-100/80">
                                <li>
                                    <Link href="/" className="hover:text-white transition">Beranda Utama</Link>
                                </li>
                                <li>
                                    <Link href="/profil" className="hover:text-white transition">Profil &amp; Visi Misi</Link>
                                </li>
                                <li>
                                    <Link href="/berita" className="hover:text-white transition">Pusat Berita &amp; Pengumuman</Link>
                                </li>
                                <li>
                                    <Link href="/galeri" className="hover:text-white transition">Galeri Kegiatan Sekolah</Link>
                                </li>
                                <li>
                                    <Link href="/kontak" className="hover:text-white transition">Kontak &amp; Layanan TU</Link>
                                </li>
                            </ul>
                        </div>

                        {/* Contact & Hours */}
                        <div className="lg:col-span-4 space-y-3">
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                                Alamat &amp; Kontak Resmi
                            </h4>
                            <div className="space-y-2 text-xs text-emerald-100/80 leading-relaxed">
                                <p className="flex items-start gap-2">
                                    <svg className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span>Jl. Soreang Raya No. 42, Soreang, Kec. Soreang, Kab. Bandung, Jawa Barat 40911</span>
                                </p>
                                <p className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <span>Hotline: +62 812-2345-6819</span>
                                </p>
                                <p className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <span className="font-mono">info@smpn2soreang.sch.id</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Disclaimer */}
                    <div className="mt-12 pt-6 border-t border-emerald-900/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-emerald-100/60">
                        <p>&copy; {new Date().getFullYear()} SMP Negeri 2 Soreang. Hak Cipta Dilindungi Undang-Undang.</p>
                        <p className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span>Sistem Informasi Terpadu Versi 2.0</span>
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

