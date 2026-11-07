import PublicLayout from '@/Layouts/PublicLayout';
import ArticleImage from '@/Components/ArticleImage';
import { Link } from '@inertiajs/react';
import { useMemo } from 'react';

// Highlight gallery items for home preview (4 items)
const FEATURED_GALLERY_PREVIEW = [
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

const getCategoryColor = (kategori) => {
    const colors = {
        'Prestasi Siswa': 'bg-amber-100 text-amber-800 border-amber-200',
        'Prestasi': 'bg-amber-100 text-amber-800 border-amber-200',
        'Inovasi Sekolah': 'bg-blue-100 text-blue-800 border-blue-200',
        'Inovasi': 'bg-blue-100 text-blue-800 border-blue-200',
        'Agenda Akademik': 'bg-emerald-100 text-emerald-800 border-emerald-200',
        'Akademik': 'bg-emerald-100 text-emerald-800 border-emerald-200',
        'Kesiswaan': 'bg-purple-100 text-purple-800 border-purple-200',
        'Fasilitas': 'bg-slate-100 text-slate-800 border-slate-200',
        'Pengumuman': 'bg-rose-100 text-rose-800 border-rose-200',
        'Umum': 'bg-slate-100 text-slate-800 border-slate-200',
    };
    return colors[kategori] || 'bg-slate-100 text-slate-800 border-slate-200';
};

export default function Welcome({ auth, berita = [] }) {
    // Controller sends at most 4 items:
    // Pinned articles have priority (up to 4). If pinned < 4, filled with latest unpinned articles.
    const displayNews = useMemo(() => {
        return Array.isArray(berita) ? berita.slice(0, 4) : [];
    }, [berita]);

    const placeholderUrl =
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgdmlld0JveD0iMCAwIDQwMCAyNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjUwIiBmaWxsPSIjRThFRUZGIi8+CjxwYXRoIGQ9Ik0yMDAgMTI1QzIyMi4wOTEgMTI1IDI0MCAxMDcuMDkxIDI0MCA4NUMyNDAgNjIuOTA5IDIyMi4wOTEgNDUgMjAwIDQ1QzE3Ny45MDkgNDUgMTYwIDYyLjkwOSAxNjAgODVDMTYwIDEwNy4wOTEgMTc3LjkwOSAxMjUgMjAwIDEyNVoiIGZpbGw9IiNDNUNFRDMiLz4KPHBhdGggZD0iTTIwMCAxNDVDMjE2LjU2OSAxNDUgMjMwIDEzMS41NjkgMjMwIDExNUMyMzAgOTguNDMxIDIxNi41NjkgODUgMjAwIDg1QzE4My40MzEgODUgMTcwIDk4LjQzMSAxNzAgMTE1QzE3MCAxMzEuNTY5IDE4My40MzEgMTQ1IDIwMCAxNDVaIiBmaWxsPSIjQzVDRUQzIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTg1IiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzlDOTM5OCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+U01QTiAyIFNvcmVhbmc8L3RleHQ+Cjwvc3ZnPgo=';

    return (
        <PublicLayout
            auth={auth}
            active="beranda"
            title="SMPN 2 Soreang - Berkarakter, Unggul & Berkelanjutan"
            description="Portal Resmi Informasi, Layanan Pendidikan & Presensi Digital Terpadu SMP Negeri 2 Soreang Kab. Bandung"
        >
            {/* HERO SECTION */}
            <section className="relative min-h-[560px] sm:min-h-[620px] flex items-center justify-center overflow-hidden bg-[#0d2e23]">
                <div
                    className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-30 transform scale-105"
                    style={{
                        backgroundImage:
                            "url('https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1920&q=80')",
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#0d2e23]/95 via-[#0d2e23]/80 to-[#0d2e23]" />

                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center text-white z-10">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-emerald-800/80 text-emerald-300 border border-emerald-600/40 uppercase tracking-wider mb-6">
                        <span>PORTAL RESMI SMPN 2 SOREANG</span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]">
                        Mewujudkan Generasi{' '}
                        <span className="text-[#34d399] font-serif italic font-normal">
                            Cerdas, Berkarakter
                        </span>{' '}
                        &amp; Unggul Berkelanjutan.
                    </h1>

                    <p className="mt-6 text-sm sm:text-base lg:text-lg text-emerald-100/85 max-w-2xl mx-auto leading-relaxed">
                        Pusat pendidikan menengah pertama unggulan Kabupaten Bandung yang memadukan keunggulan akademik, riset sains digital, kesiswaan, serta transparansi KBM daring yang modern.
                    </p>

                    {/* Quick CTA Links */}
                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/profil"
                            className="w-full sm:w-auto bg-[#10b981] hover:bg-[#059669] text-white font-semibold text-xs sm:text-sm px-7 py-3.5 rounded-full shadow-lg hover:shadow-emerald-900/40 transition duration-150 inline-flex items-center justify-center gap-2"
                        >
                            <span>Pelajari Profil &amp; Visi Misi</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </Link>

                        <Link
                            href="/berita"
                            className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm px-6 py-3.5 rounded-full border border-white/20 transition duration-150 inline-flex items-center justify-center gap-2"
                        >
                            <span>Pusat Berita &amp; Warta</span>
                        </Link>
                    </div>

                    {/* Key Stats Bar */}
                    <div className="mt-14 pt-8 border-t border-emerald-900/60 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                        <div>
                            <div className="text-xl sm:text-2xl font-black text-white">960+</div>
                            <div className="text-[11px] text-emerald-200/80 font-medium">Peserta Didik Aktif</div>
                        </div>
                        <div>
                            <div className="text-xl sm:text-2xl font-black text-white">52</div>
                            <div className="text-[11px] text-emerald-200/80 font-medium">Pendidik &amp; Staf</div>
                        </div>
                        <div>
                            <div className="text-xl sm:text-2xl font-black text-white">100%</div>
                            <div className="text-[11px] text-emerald-200/80 font-medium">Tingkat Kelulusan</div>
                        </div>
                        <div>
                            <div className="text-xl sm:text-2xl font-black text-white">A</div>
                            <div className="text-[11px] text-emerald-200/80 font-medium">Akreditasi Unggul</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* RINGKASAN PROFIL (TEASER) */}
            <section className="py-16 sm:py-20 bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
                        {/* Principal Thumbnail */}
                        <div className="lg:col-span-5">
                            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-gray-100 bg-[#0d2e23]">
                                <img
                                    src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=900&q=80"
                                    alt="Kepala Sekolah SMPN 2 Soreang"
                                    className="w-full h-[360px] sm:h-[420px] object-cover object-top"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0a241b] via-[#0a241b]/40 to-transparent" />
                                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white">
                                    <h3 className="text-base sm:text-lg font-bold">
                                        Drs. H. Ahmad Fauzi, M.Pd.
                                    </h3>
                                    <p className="text-emerald-300 text-xs font-medium">
                                        Kepala Sekolah SMPN 2 Soreang
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Speech Teaser */}
                        <div className="lg:col-span-7 space-y-6">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
                                AMANAT KEPALA SEKOLAH
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0d2e23] tracking-tight leading-snug">
                                "Pendidikan Berkualitas Bermula Dari Kedisiplinan yang Berkeadaban dan Akuntabel."
                            </h2>
                            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                                Selamat datang di portal resmi SMP Negeri 2 Soreang. Kami mendedikasikan sekolah ini sebagai wadah tumbuh kembang insan muda Kabupaten Bandung yang tangguh dalam sains, berakhlak mulia, serta berakar luhur pada kearifan budaya Sunda.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="text-xs sm:text-sm font-bold text-emerald-950">100% Bebas Pungli</h4>
                                        <p className="text-[11px] text-gray-600 mt-0.5">Pelayanan tata usaha transparan dan inklusif.</p>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="text-xs sm:text-sm font-bold text-emerald-950">Sekolah Adiwiyata</h4>
                                        <p className="text-[11px] text-gray-600 mt-0.5">Lingkungan asri, hemat energi &amp; berkelanjutan.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Button ke Halaman Profil */}
                            <div className="pt-2">
                                <Link
                                    href="/profil"
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs tracking-wide transition shadow-sm"
                                >
                                    <span>Lihat Profil Lengkap, Visi &amp; Misi Sekolah</span>
                                    <span>&rarr;</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* BERITA TERKINI DI BERANDA (PINNED PRIORITY - MAX 4) */}
            <section className="py-16 sm:py-20 bg-[#f7faf8] border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                        <div>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                                KABAR PILIHAN BERANDA
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0d2e23] tracking-tight mt-2">
                                Informasi &amp; Berita Terkini
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                Informasi penting dan agenda resmi sekolah yang disematkan untuk warga dan wali murid.
                            </p>
                        </div>

                        <div>
                            <Link
                                href="/berita"
                                className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1 hover:underline"
                            >
                                <span>Buka Seluruh Arsip Berita</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                    </div>

                    {/* News Grid (Maksimal 4 berita, simetris) */}
                    {displayNews.length === 0 ? (
                        <div className="p-12 text-center bg-white rounded-2xl border border-gray-200">
                            <p className="text-base font-semibold text-gray-700">Belum ada berita saat ini.</p>
                            <p className="text-xs text-gray-400 mt-1">Berita terbaru akan segera dirilis oleh humas sekolah.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                            {displayNews.map((article) => {
                                const categoryColor = getCategoryColor(article.kategori);
                                const displayImageUrl = article.gambar_path || placeholderUrl;

                                return (
                                    <article
                                        key={article.id}
                                        className="group relative bg-white rounded-2xl border border-slate-100 shadow-xs hover:shadow-md hover:-translate-y-0.5 overflow-hidden flex flex-col transition-all duration-200 ease-out h-full"
                                    >
                                        <Link
                                            href="/berita"
                                            className="flex flex-col h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded-2xl"
                                            aria-label={`Baca di halaman berita: ${article.judul}`}
                                        >
                                            {/* Image 16:10 */}
                                            <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/10' }}>
                                                <img
                                                    src={displayImageUrl}
                                                    alt=""
                                                    aria-hidden="true"
                                                    className="absolute inset-0 w-full h-full object-cover object-center z-0"
                                                    style={{ filter: 'blur(24px)', transform: 'scale(1.15)', opacity: 0.6 }}
                                                />
                                                <img
                                                    src={displayImageUrl}
                                                    alt={article.judul}
                                                    loading="lazy"
                                                    className="relative z-10 w-full h-full object-contain object-center transition-transform duration-300 ease-out group-hover:scale-105"
                                                    onError={(e) => {
                                                        if (e.target.src !== placeholderUrl) {
                                                            e.target.src = placeholderUrl;
                                                        }
                                                    }}
                                                />
                                                {/* Category Badge */}
                                                <div className="absolute top-3 left-3 z-20">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider shadow-xs border ${categoryColor}`}>
                                                        {article.kategori || 'Umum'}
                                                    </span>
                                                </div>
                                                {/* Pinned Badge */}
                                                {article.is_pinned && (
                                                    <span className="absolute top-3 right-3 z-20 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-600 text-white uppercase tracking-wider shadow-xs">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                                        </svg>
                                                        Disematkan
                                                    </span>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="p-5 flex flex-col flex-1 justify-between min-h-[160px]">
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between text-xs text-slate-500">
                                                        <time dateTime={article.tanggal} className="font-medium text-slate-600">
                                                            {formatDateIndo(article.tanggal)}
                                                        </time>
                                                    </div>

                                                    <h3 className="font-bold text-[#111C2D] leading-snug line-clamp-2 group-hover:text-[#006C4A] transition-colors text-base sm:text-lg">
                                                        {article.judul}
                                                    </h3>

                                                    <p className="text-[14px] leading-relaxed text-[#3F463F] line-clamp-3">
                                                        {article.ringkasan || (article.isi ? article.isi.substring(0, 160) + '...' : 'Tidak ada ringkasan')}
                                                    </p>
                                                </div>

                                                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                                                    <span className="text-sm font-semibold text-[#006C4A] group-hover:underline inline-flex items-center gap-1">
                                                        Baca Selengkapnya di Halaman Berita
                                                        <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    </article>
                                );
                            })}
                        </div>
                    )}

                    {/* Tombol ke Halaman Berita Lengkap */}
                    <div className="mt-12 text-center">
                        <Link
                            href="/berita"
                            className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-800 font-bold text-xs tracking-wide transition shadow-xs"
                        >
                            <span>Lihat Semua Berita &amp; Arsip Lengkap Sekolah</span>
                            <span>&rarr;</span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* RINGKASAN GALERI (TEASER) */}
            <section className="py-16 sm:py-20 bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                        <div>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
                                CUPLIKAN DOKUMENTASI
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0d2e23] tracking-tight mt-2">
                                Galeri Aktivitas &amp; Fasilitas
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                Cuplikan kegiatan belajar mengajar, sarana prasarana, serta ekstrakurikuler peserta didik.
                            </p>
                        </div>
                        <div>
                            <Link
                                href="/galeri"
                                className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1 hover:underline"
                            >
                                <span>Buka Galeri Selengkapnya</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {FEATURED_GALLERY_PREVIEW.map((item) => (
                            <div
                                key={item.id}
                                className="relative rounded-2xl overflow-hidden shadow-xs group bg-black"
                                style={{ aspectRatio: '4/3' }}
                            >
                                <ArticleImage
                                    src={item.image}
                                    alt={item.title}
                                    aspectRatio="4/3"
                                    showBadge
                                    badgeText={item.badge}
                                    enableLightbox
                                />
                                <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/85 via-black/40 to-transparent text-white z-20 pointer-events-none">
                                    <h4 className="text-xs font-bold leading-snug line-clamp-1">
                                        {item.title}
                                    </h4>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 text-center">
                        <Link
                            href="/galeri"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs tracking-wide transition shadow-sm"
                        >
                            <span>Jelajahi Seluruh Foto &amp; Dokumentasi di Galeri</span>
                            <span>&rarr;</span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* RINGKASAN KONTAK & LAYANAN (TEASER) */}
            <section className="py-16 sm:py-20 bg-[#f7faf8] border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
                            LAYANAN INFORMASI
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0d2e23] tracking-tight mt-2">
                            Hubungi Tata Usaha &amp; Layanan Publik
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-500 mt-2">
                            Pusat konsultasi administrasi siswa, legalisir, dan komunikasi resmi pihak sekolah.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-gray-900">Jam Layanan TU</h4>
                                <p className="text-xs text-gray-600 mt-1">07.30 - 15.00 WIB (Senin - Jumat)</p>
                            </div>
                        </div>

                        <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-gray-900">Hotline WhatsApp</h4>
                                <p className="text-xs font-semibold text-emerald-800 mt-1">+62 812-2345-6819</p>
                            </div>
                        </div>

                        <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-gray-900">Email Resmi</h4>
                                <p className="text-xs text-gray-600 mt-1 font-mono">info@smpn2soreang.sch.id</p>
                            </div>
                        </div>

                        <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-gray-900">Lokasi Kampus</h4>
                                <p className="text-xs text-gray-600 mt-1">Soreang, Kab. Bandung</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 text-center">
                        <Link
                            href="/kontak"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs tracking-wide transition shadow-sm"
                        >
                            <span>Buka Halaman Kontak, Peta Lokasi &amp; Tanya Jawab</span>
                            <span>&rarr;</span>
                        </Link>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
