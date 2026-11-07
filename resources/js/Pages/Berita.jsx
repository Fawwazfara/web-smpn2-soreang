import PublicLayout from '@/Layouts/PublicLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';

const formatDateIndo = (dateStr) => {
    if (!dateStr) return '';
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
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

export default function Berita({ auth, berita = [], filters = {} }) {
    const [searchTerm, setSearchTerm] = useState(filters.q || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.kategori || 'Semua');
    const [activeArticle, setActiveArticle] = useState(null);

    const categories = [
        'Semua',
        'Prestasi Siswa',
        'Agenda Akademik',
        'Kesiswaan',
        'Inovasi Sekolah',
        'Fasilitas',
        'Pengumuman',
        'Umum',
    ];

    const placeholderUrl =
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgdmlld0JveD0iMCAwIDQwMCAyNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjUwIiBmaWxsPSIjRThFRUZGIi8+CjxwYXRoIGQ9Ik0yMDAgMTI1QzIyMi4wOTEgMTI1IDI0MCAxMDcuMDkxIDI0MCA4NUMyNDAgNjIuOTA5IDIyMi4wOTEgNDUgMjAwIDQ1QzE3Ny45MDkgNDUgMTYwIDYyLjkwOSAxNjAgODVDMTYwIDEwNy4wOTEgMTc3LjkwOSAxMjUgMjAwIDEyNVoiIGZpbGw9IiNDNUNFRDMiLz4KPHBhdGggZD0iTTIwMCAxNDVDMjE2LjU2OSAxNDUgMjMwIDEzMS41NjkgMjMwIDExNUMyMzAgOTguNDMxIDIxNi41NjkgODUgMjAwIDg1QzE4My40MzEgODUgMTcwIDk4LjQzMSAxNzAgMTE1QzE3MCAxMzEuNTY5IDE4My40MzEgMTQ1IDIwMCAxNDVaIiBmaWxsPSIjQzVDRUQzIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTg1IiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzlDOTM5OCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+U01QTiAyIFNvcmVhbmc8L3RleHQ+Cjwvc3ZnPgo=';

    const filteredNews = useMemo(() => {
        let list = Array.isArray(berita) ? berita : [];

        if (selectedCategory !== 'Semua') {
            list = list.filter((item) => item.kategori === selectedCategory);
        }

        if (searchTerm.trim() !== '') {
            const q = searchTerm.toLowerCase();
            list = list.filter(
                (item) =>
                    item.judul?.toLowerCase().includes(q) ||
                    item.ringkasan?.toLowerCase().includes(q) ||
                    item.isi?.toLowerCase().includes(q)
            );
        }

        return list;
    }, [berita, selectedCategory, searchTerm]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        router.get(
            '/berita',
            { q: searchTerm, kategori: selectedCategory },
            { preserveState: true, replace: true }
        );
    };

    const handleCategorySelect = (cat) => {
        setSelectedCategory(cat);
        router.get(
            '/berita',
            { q: searchTerm, kategori: cat },
            { preserveState: true, replace: true }
        );
    };

    return (
        <PublicLayout
            auth={auth}
            active="berita"
            title="Pusat Berita & Pengumuman - SMPN 2 Soreang"
            description="Arsip berita lengkap, pengumuman resmi, prestasi, dan warta kegiatan akademik SMP Negeri 2 Soreang."
        >
            {/* HERO BANNER */}
            <div className="bg-[#0d2e23] text-white py-14 sm:py-20 border-b border-emerald-900/60 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#82F5C1_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-800/80 text-emerald-300 border border-emerald-600/40 uppercase tracking-wider mb-4">
                                <span>INFORMASI &amp; WARTA RESMI</span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
                                Kabar &amp; Pengumuman Sekolah
                            </h1>
                            <p className="mt-3 text-base sm:text-lg text-emerald-100/80 max-w-2xl leading-relaxed">
                                Dokumentasi komprehensif seluruh prestasi siswa, agenda akademik, edaran penting, serta aktivitas kampus SMPN 2 Soreang.
                            </p>
                        </div>

                        {auth?.user?.role === 'admin' && (
                            <Link
                                href={route('admin.berita.index')}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-xs transition shadow-sm"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                <span>Kelola Berita (CMS Admin)</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* FILTER & SEARCH BAR */}
            <div className="bg-white border-b border-gray-200 py-6 sticky top-16 sm:top-20 z-30 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
                    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                        {/* Search Input */}
                        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Cari judul berita atau topik pengumuman..."
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </form>

                        {/* Total Count */}
                        <div className="text-xs text-gray-500 font-medium">
                            Menampilkan <span className="font-bold text-gray-800">{filteredNews.length}</span> artikel berita
                        </div>
                    </div>

                    {/* Category Tabs */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                        {categories.map((cat) => {
                            const isSelected = selectedCategory === cat;
                            return (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => handleCategorySelect(cat)}
                                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                                        isSelected
                                            ? 'bg-emerald-800 text-white shadow-xs'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {cat}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* NEWS LIST SECTION */}
            <section className="py-14 bg-[#fafcfb] min-h-[500px]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {filteredNews.length === 0 ? (
                        <div className="p-16 text-center bg-white rounded-2xl border border-gray-200 shadow-xs max-w-xl mx-auto">
                            <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 mx-auto flex items-center justify-center mb-4">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                </svg>
                            </div>
                            <h3 className="text-base font-bold text-gray-800">Tidak ada berita ditemukan</h3>
                            <p className="text-xs text-gray-500 mt-1">
                                Coba sesuaikan kata kunci pencarian atau pilih kategori lain.
                            </p>
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedCategory('Semua');
                                }}
                                className="mt-4 px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold hover:bg-emerald-200 transition"
                            >
                                Reset Pencarian &amp; Filter
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                            {filteredNews.map((article) => {
                                const categoryColor = getCategoryColor(article.kategori);
                                const displayImageUrl = article.gambar_path || placeholderUrl;

                                return (
                                    <article
                                        key={article.id}
                                        className="group relative bg-white rounded-2xl border border-slate-100 shadow-xs hover:shadow-md hover:-translate-y-0.5 overflow-hidden flex flex-col transition-all duration-200 ease-out h-full cursor-pointer"
                                        onClick={() => setActiveArticle(article)}
                                    >
                                        {/* Image Container 16:10 */}
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

                                        {/* Content Container */}
                                        <div className="p-5 flex flex-col flex-1 justify-between">
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between text-xs text-slate-500">
                                                    <time dateTime={article.tanggal} className="font-medium text-slate-600">
                                                        {formatDateIndo(article.tanggal)}
                                                    </time>
                                                    {article.dibuat_oleh && (
                                                        <span>Oleh: {article.dibuat_oleh?.nama || 'Humas SMPN 2'}</span>
                                                    )}
                                                </div>

                                                <h2 className="font-bold text-[#111C2D] leading-snug line-clamp-2 group-hover:text-[#006C4A] transition-colors text-base sm:text-lg">
                                                    {article.judul}
                                                </h2>

                                                <p className="text-[14px] leading-relaxed text-[#3F463F] line-clamp-3">
                                                    {article.ringkasan || (article.isi ? article.isi.substring(0, 160) + '...' : 'Tidak ada ringkasan')}
                                                </p>
                                            </div>

                                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                                                <span className="text-sm font-semibold text-[#006C4A] group-hover:underline inline-flex items-center gap-1">
                                                    Baca Selengkapnya
                                                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </span>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* ARTICLE DETAIL MODAL */}
            {activeArticle && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto"
                    onClick={() => setActiveArticle(null)}
                >
                    <div
                        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 my-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header Image */}
                        <div className="relative w-full bg-slate-900" style={{ aspectRatio: '16/9' }}>
                            <img
                                src={activeArticle.gambar_path || placeholderUrl}
                                alt={activeArticle.judul}
                                className="w-full h-full object-contain"
                            />
                            <button
                                onClick={() => setActiveArticle(null)}
                                className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black/80 rounded-full text-white transition z-20"
                                aria-label="Tutup"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            <div className="absolute top-4 left-4 z-20">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getCategoryColor(activeArticle.kategori)}`}>
                                    {activeArticle.kategori || 'Umum'}
                                </span>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 sm:p-8 space-y-4">
                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 border-b border-gray-100 pb-3">
                                <time dateTime={activeArticle.tanggal} className="font-semibold text-emerald-800">
                                    {formatDateIndo(activeArticle.tanggal)}
                                </time>
                                {activeArticle.is_pinned && (
                                    <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                                        • Disematkan
                                    </span>
                                )}
                            </div>

                            <h2 className="text-xl sm:text-2xl font-extrabold text-[#111C2D] leading-snug">
                                {activeArticle.judul}
                            </h2>

                            {activeArticle.ringkasan && (
                                <p className="text-sm sm:text-base font-semibold text-emerald-950 bg-emerald-50/70 p-4 rounded-xl border border-emerald-100 leading-relaxed">
                                    {activeArticle.ringkasan}
                                </p>
                            )}

                            <div className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line pt-2">
                                {activeArticle.isi || 'Tidak ada konten teks tambahan.'}
                            </div>

                            {/* Modal Footer */}
                            <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-end">
                                <button
                                    onClick={() => setActiveArticle(null)}
                                    className="px-5 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs transition"
                                >
                                    Tutup Artikel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </PublicLayout>
    );
}

