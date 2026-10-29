import { Head, Link } from '@inertiajs/react';
import { useMemo, useState, useRef } from 'react';
import ArticleImage from '@/Components/ArticleImage';

// Default gallery data matching the screenshot
const GALLERY_ITEMS = [
    {
        id: 'gal-1',
        title: 'Laboratorium Komputer & Riset Literasi Digital',
        category: 'Fasilitas',
        badge: 'FASILITAS UNGGULAN',
        caption: 'Akses jaringan internet serat optik kecepatan tinggi untuk simulasi ANBK dan riset informatika.',
        image: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80',
        featured: true,
    },
    {
        id: 'gal-2',
        title: 'Gerakan Pramuka Gugus Depan Soreang',
        category: 'Ekstrakurikuler',
        badge: 'EKSTRAKURIKULER',
        caption: 'Pembentukan kedisiplinan dan kepemimpinan kepanduan siswa di medan tangguh.',
        image: 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=800&q=80',
    },
    {
        id: 'gal-3',
        title: 'Perpustakaan Cerdas "Pustaka Asri"',
        category: 'Fasilitas',
        badge: 'FASILITAS',
        caption: 'Koleksi 12.000 buku fisik dan akses digital library yang nyaman.',
        image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80',
    },
    {
        id: 'gal-4',
        title: 'Pasanggiri Karawitan & Angklung',
        category: 'Seni & Budaya',
        badge: 'KESENIAN JEUNG SUNDA',
        caption: 'Pelestarian tradisi musik Sunda lewat ansambel musik bambu.',
        image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    },
    {
        id: 'gal-5',
        title: 'Juara 1 Turnamen Bola Basket Kab. Bandung',
        category: 'Ekstrakurikuler',
        badge: 'OLAHRAGA PRESTASI',
        caption: 'Kontingen putra mengukir kemenangan dramatis di laga final antar-SMP.',
        image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
    },
];

const formatDateIndo = (dateStr) => {
    if (!dateStr) return '';
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    } catch {
        return dateStr;
    }
};

export default function Welcome({ auth, berita = [] }) {
    const [selectedCategory, setSelectedCategory] = useState('Semua');
    const [activeArticle, setActiveArticle] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [sliderScrollLeft, setSliderScrollLeft] = useState(0);
    const [showArrows, setShowArrows] = useState(false);
    const sliderRef = useRef(null);

    // Published news from props - already sorted by backend: pinned first (pinned_at DESC), then by tanggal DESC
    const publishedNews = useMemo(() => {
        return Array.isArray(berita) ? berita : [];
    }, [berita]);

    // Slider navigation
    const scrollSlider = (direction) => {
        if (!sliderRef.current) return;
        const cardWidth = 340; // card width + gap (320px + 20px gap)
        sliderRef.current.scrollBy({
            left: direction * cardWidth,
            behavior: 'smooth'
        });
    };

    const handleSliderScroll = () => {
        if (!sliderRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
        const maxScroll = scrollWidth - clientWidth;
        setSliderScrollLeft(scrollLeft);
        // Show arrows only if content overflows
        setShowArrows(maxScroll > 10);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowLeft') scrollSlider(-1);
        if (e.key === 'ArrowRight') scrollSlider(1);
    };

    const filteredGallery = useMemo(() => {
        if (selectedCategory === 'Semua') return GALLERY_ITEMS;
        return GALLERY_ITEMS.filter((item) => item.category === selectedCategory);
    }, [selectedCategory]);

    return (
        <div className="min-h-screen bg-[#fafcfb] text-gray-800 font-sans selection:bg-emerald-700 selection:text-white">
            <Head title="SMPN 2 Soreang - Berkarakter, Unggul & Berkelanjutan" />

            {/* TOP NAVIGATION BAR */}
            <header className="sticky top-0 z-50 bg-[#0d2e23] border-b border-emerald-900/60 shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 sm:h-20">
                        {/* School Logo & Title */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-emerald-800/80 border border-emerald-600/40 flex items-center justify-center text-white shadow-inner flex-shrink-0">
                                <svg className="w-6 h-6 text-emerald-300" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
                                </svg>
                            </div>
                            <div className="leading-tight">
                                <span className="block text-white font-bold text-base sm:text-lg tracking-tight">
                                    SMPN 2 Soreang
                                </span>
                                <span className="block text-emerald-300 text-[10px] sm:text-[11px] font-medium tracking-wider uppercase">
                                    Kab. Bandung - Indonesia
                                </span>
                            </div>
                        </div>

                        {/* Desktop Navigation Links */}
                        <nav className="hidden lg:flex items-center space-x-7 text-xs font-medium text-emerald-100/90 tracking-wide">
                            <a href="#" className="text-emerald-300 font-semibold hover:text-white transition">
                                Beranda
                            </a>
                            <a href="#sambutan" className="hover:text-emerald-300 transition">
                                Profil
                            </a>
                            <a href="#berita" className="hover:text-emerald-300 transition">
                                Berita
                            </a>
                            <a href="#galeri" className="hover:text-emerald-300 transition">
                                Galeri
                            </a>
                            <a href="#kontak" className="hover:text-emerald-300 transition">
                                Kontak
                            </a>
                        </nav>

                        {/* Search & Login Action */}
                        <div className="hidden sm:flex items-center gap-3">
                            <a
                                href="#berita"
                                className="p-2 text-emerald-300 hover:text-white rounded-full hover:bg-emerald-800/50 transition"
                                title="Cari Berita"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </a>

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
                                    Login Admin
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
                    <div className="lg:hidden bg-[#0a241b] border-t border-emerald-900 px-4 py-3 space-y-2">
                        <a
                            href="#"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block px-3 py-2 rounded-md text-emerald-300 font-semibold text-sm hover:bg-emerald-900/60"
                        >
                            Beranda
                        </a>
                        <a
                            href="#sambutan"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block px-3 py-2 rounded-md text-emerald-100 text-sm hover:bg-emerald-900/60"
                        >
                            Profil &amp; Sambutan
                        </a>
                        <a
                            href="#berita"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block px-3 py-2 rounded-md text-emerald-100 text-sm hover:bg-emerald-900/60"
                        >
                            Kabar Terkini
                        </a>
                        <a
                            href="#galeri"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block px-3 py-2 rounded-md text-emerald-100 text-sm hover:bg-emerald-900/60"
                        >
                            Galeri Sekolah
                        </a>
                        <a
                            href="#kontak"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block px-3 py-2 rounded-md text-emerald-100 text-sm hover:bg-emerald-900/60"
                        >
                            Kontak &amp; TU
                        </a>
                    </div>
                )}
            </header>

            {/* HERO SECTION */}
            <section className="relative min-h-[580px] sm:min-h-[640px] flex items-center justify-center overflow-hidden bg-[#0d2e23]">
                {/* Background image with layered dark green tint */}
                <div
                    className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-30 transform scale-105 transition-transform duration-1000"
                    style={{
                        backgroundImage:
                            "url('https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1920&q=80')",
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#0d2e23]/95 via-[#0d2e23]/80 to-[#0d2e23]" />

                {/* Hero Centered Content */}
                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center text-white z-10">
                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]">
                        Mewujudkan Generasi{' '}
                        <span className="text-[#34d399] font-serif italic font-normal">
                            Cerdas, Berkarakter
                        </span>{' '}
                        &amp; Unggul Berkelanjutan.
                    </h1>

                    <p className="mt-6 text-sm sm:text-base lg:text-lg text-emerald-100/85 max-w-2xl mx-auto leading-relaxed">
                        Pusat pendidikan menengah pertama unggulan Kabupaten Bandung yang memadukan keunggulan akademik, riset digital, kesiswaan, serta transparansi KBM daring yang modern.
                    </p>

                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a
                            href="#sambutan"
                            className="w-full sm:w-auto bg-[#10b981] hover:bg-[#059669] text-white font-semibold text-sm px-7 py-3 rounded-full shadow-lg hover:shadow-emerald-900/40 transition duration-150 inline-flex items-center justify-center gap-2"
                        >
                            <span>Jelajahi Profil &amp; Program</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </a>
                    </div>

                    {/* Scroll Cue */}
                    <div className="mt-14 flex flex-col items-center justify-center text-emerald-300/80 text-[11px] font-medium tracking-widest uppercase">
                        <span>GULIR KE BAWAH</span>
                        <svg className="w-4 h-4 mt-1.5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                    </div>
                </div>
            </section>

            {/* PRINCIPAL'S WELCOME SECTION */}
            <section id="sambutan" className="py-20 bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Section Badge */}
                    <div className="mb-6">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                            AMANAT KEPEMIMPINAN SEKOLAH
                        </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
                        {/* Principal Portrait Card */}
                        <div className="lg:col-span-5">
                            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-gray-100 bg-[#0d2e23]">
                                <img
                                    src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=900&q=80"
                                    alt="Kepala Sekolah SMPN 2 Soreang"
                                    className="w-full h-[420px] sm:h-[480px] object-cover object-top"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0a241b] via-[#0a241b]/40 to-transparent" />

                                {/* Name Card Overlay */}
                                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white">
                                    <h3 className="text-lg font-bold">
                                        Drs. H. Ahmad Fauzi, M.Pd.
                                    </h3>
                                    <p className="text-emerald-300 text-xs font-medium mt-0.5">
                                        Kepala Sekolah SMPN 2 Soreang
                                    </p>
                                    <div className="mt-2 pt-2 border-t border-white/10 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-300">
                                        <span>Periode 2021 s.d. Sekarang</span>
                                        <span>•</span>
                                        <span>NIP. 19680720 199403 1 004</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Principal Speech & Value Cards */}
                        <div className="lg:col-span-7 space-y-6">
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0d2e23] tracking-tight leading-snug">
                                "Pendidikan Berkualitas Bermula Dari Kedisiplinan yang Berkeadaban dan Akuntabel."
                            </h2>

                            <div className="space-y-4 text-gray-600 text-sm sm:text-base leading-relaxed">
                                <p>
                                    <strong className="text-emerald-900 font-semibold">Sampurasun!</strong> Selamat datang di portal resmi informasi dan transparansi akademik SMP Negeri 2 Soreang. Kami mendedikasikan eksistensi sekolah ini sebagai wadah tumbuh kembang insan muda Kabupaten Bandung yang tidak hanya tangguh dalam ranah kognitif dan kompetisi sains, namun juga luhur dalam budi pekerti serta kearifan lokal Sunda.
                                </p>
                                <p>
                                    Melalui peluncuran Sistem Tatakelola &amp; Presensi Digital Terpadu, kami menghadirkan keterbukaan akses jadwal belajar mengajar, pendelegasian kegiatan ekstrakurikuler, serta pemantauan kedisiplinan guru dan siswa secara real-time. Seluruh orang tua dan masyarakat luas kini dapat memantau denyut pendidikan putra-putrinya secara transparan.
                                </p>
                            </div>

                            {/* 2 Feature Cards */}
                            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-start gap-3">
                                    <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-emerald-950">
                                            100% Bebas Pungli
                                        </h4>
                                        <p className="text-xs text-gray-600 mt-0.5 leading-normal">
                                            Pelayanan tata usaha inklusif, transparan dan berintegritas.
                                        </p>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-start gap-3">
                                    <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-emerald-950">
                                            Sekolah Adiwiyata
                                        </h4>
                                        <p className="text-xs text-gray-600 mt-0.5 leading-normal">
                                            Lingkungan edukasi asri, hemat energi &amp; berkelanjutan.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SCHOOL NEWS SECTION */}
<section id="berita" className="py-20 bg-[#f7faf8] border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header with navigation arrows */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4 relative">
                        <div>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                                PUSAT INFORMASI RESMI
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0d2e23] tracking-tight mt-2">
                                Kabar Terkini SMPN 2 Soreang
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Dokumentasi prestasi, agenda akademik berkala, dan siaran pengumuman penting bagi wali murid dan peserta didik.
                            </p>
                        </div>

                        {/* Navigation arrows in header */}
                        {showArrows && (
                            <div className="flex items-center gap-2 ml-auto">
                                <button
                                    type="button"
                                    onClick={() => scrollSlider(-1)}
                                    onKeyDown={handleKeyDown}
                                    disabled={sliderScrollLeft <= 10}
                                    aria-label="Berita sebelumnya"
                                    className="w-8 h-8 rounded-full bg-white border border-emerald-200 text-emerald-800 flex items-center justify-center shadow-md hover:bg-emerald-800 hover:text-white hover:border-emerald-800 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-emerald-800 disabled:hover:border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => scrollSlider(1)}
                                    onKeyDown={handleKeyDown}
                                    disabled={sliderRef.current && sliderScrollLeft >= sliderRef.current.scrollWidth - sliderRef.current.clientWidth - 10}
                                    aria-label="Berita berikutnya"
                                    className="w-8 h-8 rounded-full bg-white border border-emerald-200 text-emerald-800 flex items-center justify-center shadow-md hover:bg-emerald-800 hover:text-white hover:border-emerald-800 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-emerald-800 disabled:hover:border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        )}

                        {auth?.user?.role === 'admin' ? (
                            <Link
                                href={route('admin.berita.index')}
                                className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1 border border-emerald-300 rounded-full px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 transition shadow-sm"
                            >
                                <span>Kelola Berita (Admin)</span>
                                <span>&rarr;</span>
                            </Link>
                        ) : (
                            <a
                                href="#berita"
                                className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1 hover:underline"
                            >
                                <span>Arsip Berita & Warta Lengkap</span>
                                <span>&rarr;</span>
                            </a>
                        )}
                    </div>

                    {/* News Content - Single full-width slider */}
                    {publishedNews.length === 0 ? (
                        <div className="p-12 text-center bg-white rounded-2xl border border-gray-200">
                            <p className="text-base font-semibold text-gray-700">Belum ada berita saat ini.</p>
                            <p className="text-sm text-gray-400 mt-1">Berita terbaru sekolah akan ditampilkan segera setelah dirilis oleh bagian humas.</p>
                        </div>
                    ) : (
                        <div className="relative">
                            {/* Slider container */}
                            <div
                                ref={sliderRef}
                                onScroll={handleSliderScroll}
                                onKeyDown={handleKeyDown}
                                tabIndex={0}
                                className="flex gap-4 overflow-x-auto scroll-snap-x scroll-snap-mandatory scroll-behavior-smooth pb-4 -ml-4 pl-4"
                                style={{
                                    scrollbarWidth: 'none',
                                    msOverflowStyle: 'none',
                                    WebkitOverflowScrolling: 'touch'
                                }}
                            >
                                {publishedNews.map((article) => (
                                    <article
                                        key={article.id}
                                        onClick={() => setActiveArticle(article)}
                                        className="flex-shrink-0 w-[85vw] sm:w-[320px] scroll-snap-start bg-white rounded-2xl border border-gray-200 hover:border-emerald-300 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col"
                                        style={{ borderColor: article.is_pinned ? '#006C4A' : '#e5e7eb' }}
                                    >
                                        <div className="relative h-48 w-full overflow-hidden bg-gray-100 rounded-t-2xl">
                                            <ArticleImage
                                                src={
                                                    article.gambar_path ||
                                                    'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80'
                                                }
                                                alt={article.judul}
                                                aspectRatio="16/9"
                                                showBadge
                                                badgeText={article.kategori}
                                                enableLightbox
                                            />
                                            {/* Pin badge for pinned articles */}
                                            {article.is_pinned && (
                                                <div className="absolute top-3 right-3 z-20">
                                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-600 text-white uppercase tracking-wider flex items-center gap-1 shadow-sm">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                                        </svg>
                                                        Disematkan
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-5 flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="flex items-center justify-between text-xs mb-1.5">
                                                    <span className="font-bold text-emerald-700 uppercase tracking-wider text-[11px]">
                                                        {article.kategori}
                                                    </span>
                                                    <span className="text-gray-400">
                                                        {formatDateIndo(article.tanggal)}
                                                    </span>
                                                </div>
                                                <h4 className="text-base font-bold text-gray-900 leading-snug hover:text-emerald-700 transition line-clamp-2">
                                                    {article.judul}
                                                </h4>
                                                <p className="text-xs text-gray-500 mt-2 line-clamp-3 leading-relaxed">
                                                    {article.ringkasan || article.isi}
                                                </p>
                                            </div>
                                            <div className="mt-4 pt-2 flex justify-between items-center text-xs border-t border-gray-100">
                                                <span className="font-semibold text-emerald-700 inline-flex items-center gap-1 hover:underline">
                                                    Selengkapnya &rarr;
                                                </span>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>
            {/* SCHOOL ACTIVITIES AND FACILITIES GALLERY */}
            <section id="galeri" className="py-20 bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header with category filters */}
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 gap-4">
                        <div>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                                DOKUMENTASI KAMPUS &amp; PRESTASI
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0d2e23] tracking-tight mt-2">
                                Galeri Kegiatan &amp; Fasilitas Sekolah
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Keseruan dinamika pembelajaran, fasilitas modern, serta kebersamaan ekstrakurikuler siswa di SMPN 2 Soreang.
                            </p>
                        </div>

                        {/* Filter Tabs */}
                        <div className="flex flex-wrap gap-2">
                            {['Semua', 'Ekstrakurikuler', 'Fasilitas', 'Seni & Budaya'].map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
                                        selectedCategory === cat
                                            ? 'bg-emerald-800 text-white shadow-sm'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Gallery Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredGallery.map((item) => (
                            <div
                                key={item.id}
                                className={`relative rounded-2xl overflow-hidden shadow-md group ${
                                    item.featured ? 'md:col-span-2' : ''
                                }`}
                                style={{ aspectRatio: item.featured ? '16/9' : '4/3' }}
                            >
                                <ArticleImage
                                    src={item.image}
                                    alt={item.title}
                                    aspectRatio={item.featured ? '16/9' : '4/3'}
                                    showBadge
                                    badgeText={item.badge}
                                    enableLightbox
                                />
                                <div className="absolute bottom-5 left-5 right-5 text-white z-20">
                                    <h3 className="text-base sm:text-lg font-bold mt-2">
                                        {item.title}
                                    </h3>
                                    <p className="text-xs text-gray-300 mt-1 line-clamp-2">
                                        {item.caption}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CONTACT AND LOCATION SECTION */}
            <section id="kontak" className="py-20 bg-[#f7faf8] border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-10">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                            LAYANAN TERPADU &amp; KUNJUNGAN
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0d2e23] tracking-tight mt-2">
                            Terhubung Langsung dengan Tata Usaha &amp; Pengaduan
                        </h2>
                        <p className="text-sm text-gray-500 mt-1 max-w-3xl">
                            Kami siap melayani kebutuhan administrasi, legalisir ijazah, surat keterangan siswa, konsultasi bimbingan konseling (BK), serta pendaftaran peserta didik baru pada hari dan jam kerja operasional sekolah.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Left Side: 4 info cards + WhatsApp Action */}
                        <div className="lg:col-span-6 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Jam Pelayanan */}
                                <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
                                    <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900">Jam Pelayanan TU</h4>
                                        <p className="text-xs text-gray-600 mt-1">Senin - Kamis: 07.30 - 15.00 WIB</p>
                                        <p className="text-xs text-gray-600">Jumat: 07.30 - 14.30 WIB</p>
                                    </div>
                                </div>

                                {/* Hotline WA */}
                                <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
                                    <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900">Hotline WhatsApp</h4>
                                        <p className="text-xs font-semibold text-emerald-800 mt-1">+62 812-2345-6819</p>
                                        <p className="text-[11px] text-gray-400">Respons Cepat Hari Kerja</p>
                                    </div>
                                </div>

                                {/* Surat Elektronik */}
                                <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
                                    <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900">Surat Elektronik</h4>
                                        <p className="text-xs text-gray-600 mt-1 font-mono">info@smpn2soreang.sch.id</p>
                                        <p className="text-[11px] text-gray-400">Konfirmasi &amp; Kemitraan</p>
                                    </div>
                                </div>

                                {/* Garda Pra & Wilayah */}
                                <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
                                    <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900">Garda Pra &amp; Wilayah</h4>
                                        <p className="text-xs text-gray-600 mt-1">Kec. Soreang, Kab. Bandung</p>
                                        <p className="text-[11px] text-gray-400">Kode Pos 40911</p>
                                    </div>
                                </div>
                            </div>

                            {/* Wide Quick WhatsApp TU Action Card */}
                            <div className="p-5 bg-emerald-950 text-white rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-emerald-800 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-5 h-5 text-emerald-300" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold">Layanan Tata Usaha &amp; Informasi Cepat</h4>
                                        <p className="text-xs text-emerald-300/80">Hubungi operator staf TU kami via WhatsApp untuk layanan instan.</p>
                                    </div>
                                </div>
                                <a
                                    href="https://wa.me/6281223456819"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-sm whitespace-nowrap"
                                >
                                    Chat Staf TU →
                                </a>
                            </div>
                        </div>

                        {/* Right Side: Map & Coordinates Card */}
                        <div className="lg:col-span-6 bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                            <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                                <span className="text-xs font-bold text-gray-700 tracking-wider uppercase">
                                    PETA LOKASI SMPN 2 SOREANG
                                </span>
                                <span className="text-[11px] font-mono text-gray-400">
                                    -7.0289° S, 107.5218° E
                                </span>
                            </div>

                            {/* Styled Map Graphic / Schematic */}
                            <div className="relative h-64 sm:h-72 w-full bg-[#e8ede9] overflow-hidden flex items-center justify-center p-4">
                                <svg className="w-full h-full text-emerald-800/20" viewBox="0 0 500 300" fill="none">
                                    <rect width="500" height="300" fill="#f0f4f1" />
                                    <path d="M 0 140 Q 200 120 500 160" stroke="#d5ded7" strokeWidth="28" />
                                    <path d="M 180 0 L 220 300" stroke="#d5ded7" strokeWidth="20" />
                                    <path d="M 360 0 L 320 300" stroke="#d5ded7" strokeWidth="16" />

                                    <rect x="230" y="80" width="140" height="90" rx="8" fill="#144d3b" opacity="0.85" />
                                    <rect x="250" y="95" width="40" height="30" rx="4" fill="#ffffff" opacity="0.3" />
                                    <rect x="300" y="95" width="55" height="30" rx="4" fill="#ffffff" opacity="0.3" />

                                    <rect x="130" y="70" width="70" height="110" rx="20" stroke="#10b981" strokeWidth="3" fill="#34d399" opacity="0.25" />
                                    <circle cx="165" cy="125" r="15" stroke="#10b981" strokeWidth="2" />
                                </svg>

                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                                    <div className="bg-emerald-900 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-lg border border-emerald-400 flex items-center gap-1.5 animate-pulse">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                        Kampus SMPN 2 Soreang
                                    </div>
                                    <div className="w-3 h-3 bg-emerald-900 transform rotate-45 -mt-1.5"></div>
                                </div>
                            </div>

                            <div className="p-4 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                <div>
                                    <h4 className="text-xs font-bold text-gray-900">
                                        Kampus SMPN 2 Soreang
                                    </h4>
                                    <p className="text-[11px] text-gray-500 mt-0.5">
                                        Jl. Terusan Soreang No. 172, Katapang-Soreang, Kab. Bandung
                                    </p>
                                </div>
                                <a
                                    href="https://maps.google.com/?q=SMPN+2+Soreang"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-3.5 py-1.5 bg-[#0d2e23] hover:bg-emerald-900 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 whitespace-nowrap"
                                >
                                    <span>Buka Peta</span>
                                    <span>↗</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="bg-[#0b261d] text-emerald-100/90 border-t border-emerald-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
                        {/* School Identity */}
                        <div className="lg:col-span-4 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-800 border border-emerald-600/40 flex items-center justify-center text-white">
                                    <svg className="w-6 h-6 text-emerald-300" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-base tracking-tight">
                                        SMP NEGERI 2 SOREANG
                                    </h3>
                                    <p className="text-emerald-400 text-[10px] tracking-wider uppercase font-semibold">
                                        KABUPATEN BANDUNG
                                    </p>
                                </div>
                            </div>

                            <p className="text-xs text-emerald-200/70 leading-relaxed">
                                Lembaga pendidikan menengah pertama berintegritas tinggi di Kabupaten Bandung yang berkomitmen memajukan riset inovasi sains, kurikulum merdeka terkini, serta luhur budi pekerti.
                            </p>

                            <div className="flex flex-wrap gap-2 pt-1">
                                <span className="px-2.5 py-1 rounded bg-emerald-900/80 border border-emerald-700/50 text-[10px] font-semibold text-emerald-300">
                                    Akreditasi A (Unggul BAN-S/M)
                                </span>
                                <span className="px-2.5 py-1 rounded bg-emerald-900/80 border border-emerald-700/50 text-[10px] font-semibold text-emerald-300">
                                    SPMB Berkelanjutan
                                </span>
                            </div>
                        </div>

                        {/* Navigasi Utama */}
                        <div className="lg:col-span-2 space-y-3">
                            <h4 className="text-white text-xs font-bold tracking-wider uppercase">
                                NAVIGASI UTAMA
                            </h4>
                            <ul className="space-y-2 text-xs text-emerald-200/80">
                                <li>
                                    <a href="#" className="hover:text-white transition">Beranda Utama</a>
                                </li>
                                <li>
                                    <a href="#sambutan" className="hover:text-white transition">Profil &amp; Guru</a>
                                </li>
                                <li>
                                    <a href="#berita" className="hover:text-white transition">Prestasi Sekolah</a>
                                </li>
                                <li>
                                    <a href="#kontak" className="hover:text-white transition">Alur PPDB 2026/2027</a>
                                </li>
                            </ul>
                        </div>

                        {/* Portal Digital */}
                        <div className="lg:col-span-3 space-y-3">
                            <h4 className="text-white text-xs font-bold tracking-wider uppercase">
                                PORTAL DIGITAL
                            </h4>
                            <ul className="space-y-2 text-xs text-emerald-200/80">
                                <li>
                                    <Link href={route('login')} className="hover:text-white transition flex items-center gap-1.5">
                                        <span>SIGES - Sistem Presensi Digital</span>
                                    </Link>
                                </li>
                                <li>
                                    <span className="hover:text-white transition cursor-pointer">e-Learning SMPN 2</span>
                                </li>
                                <li>
                                    <span className="hover:text-white transition cursor-pointer">e-Rapor Kurikulum Merdeka</span>
                                </li>
                                <li>
                                    <span className="hover:text-white transition cursor-pointer">Konseling &amp; Bimbingan (BK)</span>
                                </li>
                                <li>
                                    <span className="hover:text-white transition cursor-pointer">Notifikasi WA Pintar (SIFAT)</span>
                                </li>
                            </ul>
                        </div>

                        {/* Kontak & Live Stats */}
                        <div className="lg:col-span-3 space-y-3">
                            <h4 className="text-white text-xs font-bold tracking-wider uppercase">
                                KONTAK &amp; STATISTIK
                            </h4>
                            <div className="space-y-1.5 text-xs text-emerald-200/80">
                                <p>Jl. Terusan Kopo-Soreang, Katapang, Soreang, Kab. Bandung 40911</p>
                                <p>Telepon: (022) 5891-2441</p>
                                <p>humas@smpn2soreang.sch.id</p>
                            </div>

                            {/* Stats Card */}
                            <div className="p-3 bg-emerald-900/60 rounded-xl border border-emerald-800 text-[11px] space-y-1 text-emerald-300">
                                <div className="flex justify-between">
                                    <span>Tahun Ajaran:</span>
                                    <span className="text-white font-semibold">2025 / 2026</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Status Server:</span>
                                    <span className="text-emerald-400 font-semibold inline-flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                        99.98% Aktif
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Strip */}
                    <div className="mt-12 pt-6 border-t border-emerald-900/80 flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-300/60 gap-4">
                        <p>© 2026 SMP Negeri 2 Soreang. Hak Cipta Dilindungi Undang-Undang.</p>
                        <div className="flex gap-6">
                            <span className="hover:text-white transition cursor-pointer">Kebijakan Privasi</span>
                            <span className="hover:text-white transition cursor-pointer">Keterbukaan Informasi</span>
                            <span className="hover:text-white transition cursor-pointer">Peta Situs</span>
                        </div>
                    </div>
                </div>
            </footer>

            {/* FULL ARTICLE MODAL READER */}
            {activeArticle && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div
                        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="relative">
                            {activeArticle.gambar_path && (
                                <ArticleImage
                                    src={activeArticle.gambar_path}
                                    alt={activeArticle.judul}
                                    aspectRatio="16/9"
                                    enableLightbox
                                    className="max-h-[60vh]"
                                />
                            )}
                            <button
                                onClick={() => setActiveArticle(null)}
                                className="absolute top-3 right-3 bg-black/60 hover:bg-black text-white rounded-full p-2 text-xs transition z-20"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 sm:p-8">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                                    {activeArticle.kategori?.toUpperCase()}
                                </span>
                                <span className="text-xs text-gray-400">
                                    {formatDateIndo(activeArticle.tanggal)}
                                </span>
                            </div>

                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
                                {activeArticle.judul}
                            </h2>

                            <div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
                                <span>Penulis: {activeArticle.dibuat_oleh?.nama || 'Humas SMPN 2 Soreang'}</span>
                            </div>

                            {activeArticle.ringkasan && (
                                <div className="mt-4 p-4 rounded-xl bg-emerald-50/70 text-emerald-950 text-sm italic border-l-4 border-emerald-600">
                                    {activeArticle.ringkasan}
                                </div>
                            )}

                            <div className="mt-6 text-sm text-gray-700 leading-relaxed whitespace-pre-line space-y-4">
                                {activeArticle.isi}
                            </div>

                            <div className="mt-8 pt-4 border-t border-gray-100 flex justify-end">
                                <button
                                    onClick={() => setActiveArticle(null)}
                                    className="px-5 py-2 rounded-full bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold transition"
                                >
                                    Tutup Artikel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
