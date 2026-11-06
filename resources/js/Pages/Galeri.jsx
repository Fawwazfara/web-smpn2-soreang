import PublicLayout from '@/Layouts/PublicLayout';
import ArticleImage from '@/Components/ArticleImage';
import { useMemo, useState } from 'react';

const FULL_GALLERY_ITEMS = [
    {
        id: 'gal-1',
        title: 'Laboratorium Komputer & Riset Literasi Digital',
        category: 'Fasilitas & Sarana',
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
        category: 'Fasilitas & Sarana',
        badge: 'FASILITAS',
        caption: 'Koleksi 12.000 buku fisik dan akses digital library yang nyaman dengan pendingin ruangan.',
        image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80',
    },
    {
        id: 'gal-4',
        title: 'Pasanggiri Karawitan & Angklung Tradisional Sunda',
        category: 'Seni & Budaya',
        badge: 'KESENIAN JEUNG SUNDA',
        caption: 'Pelestarian tradisi musik Sunda lewat ansambel bambu dan gamelan degung peserta didik.',
        image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    },
    {
        id: 'gal-5',
        title: 'Juara 1 Turnamen Bola Basket Pelajar Kab. Bandung',
        category: 'Prestasi Olahraga',
        badge: 'OLAHRAGA PRESTASI',
        caption: 'Kontingen putra mengukir kemenangan dramatis di laga final antar-SMP tingkat kabupaten.',
        image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
    },
    {
        id: 'gal-6',
        title: 'Praktikum Sains & Mikroskopis Biologi',
        category: 'Kegiatan Akademik',
        badge: 'PRAKTIKUM IPA',
        caption: 'Eksplorasi struktur sel tumbuhan dan pengamatan spesimen mikroskop di laboratorium terpadu.',
        image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80',
    },
    {
        id: 'gal-7',
        title: 'Aksi Lingkungan Hijau & Pengomposan Sampah Adiwiyata',
        category: 'Kegiatan Akademik',
        badge: 'ADIWIYATA MANDIRI',
        caption: 'Kader lingkungan sekolah mengolah sampah dedaunan kering menjadi pupuk kompos organik.',
        image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
    },
    {
        id: 'gal-8',
        title: 'Paskibraka Upacara Peringatan Hari Kemerdekaan',
        category: 'Ekstrakurikuler',
        badge: 'PASKIBRA',
        caption: 'Penampilan formasi baris-berbaris tim Paskibra SMPN 2 Soreang pada momentum sakral kemerdekaan.',
        image: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=800&q=80',
    },
    {
        id: 'gal-9',
        title: 'Masjid Sekolah Baitul Ilmi saat Pembiasaan Dhuha',
        category: 'Fasilitas & Sarana',
        badge: 'KEROHANIAN',
        caption: 'Shalat dhuha dan tadarus bersama setiap pagi sebagai pondasi akhlak dan spiritualitas pelajar.',
        image: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=800&q=80',
    },
];

export default function Galeri({ auth }) {
    const [selectedCategory, setSelectedCategory] = useState('Semua');

    const categories = [
        'Semua',
        'Fasilitas & Sarana',
        'Ekstrakurikuler',
        'Seni & Budaya',
        'Prestasi Olahraga',
        'Kegiatan Akademik',
    ];

    const filteredItems = useMemo(() => {
        if (selectedCategory === 'Semua') return FULL_GALLERY_ITEMS;
        return FULL_GALLERY_ITEMS.filter((item) => item.category === selectedCategory);
    }, [selectedCategory]);

    return (
        <PublicLayout
            auth={auth}
            active="galeri"
            title="Galeri Dokumentasi & Prestasi - SMPN 2 Soreang"
            description="Dokumentasi foto aktivitas pembelajaran, fasilitas sarana prasarana, ekstrakurikuler, dan prestasi SMPN 2 Soreang."
        >
            {/* HERO BANNER */}
            <div className="bg-[#0d2e23] text-white py-14 sm:py-20 border-b border-emerald-900/60 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#82F5C1_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-800/80 text-emerald-300 border border-emerald-600/40 uppercase tracking-wider mb-4">
                        <span>DOKUMENTASI VISUAL</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
                        Galeri Aktivitas &amp; Prestasi
                    </h1>
                    <p className="mt-3 text-base sm:text-lg text-emerald-100/80 max-w-2xl leading-relaxed">
                        Rekam jejak dinamika belajar, pembinaan bakat, kebersamaan ekstrakurikuler, dan fasilitas lingkungan asri di SMP Negeri 2 Soreang.
                    </p>
                </div>
            </div>

            {/* CATEGORY FILTER BAR */}
            <div className="bg-white border-b border-gray-200 py-6 sticky top-16 sm:top-20 z-30 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
                        {categories.map((cat) => {
                            const isSelected = selectedCategory === cat;
                            return (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
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
                    <div className="text-xs text-gray-500 font-medium whitespace-nowrap">
                        Menampilkan <span className="font-bold text-gray-800">{filteredItems.length}</span> dokumentasi foto
                    </div>
                </div>
            </div>

            {/* GALLERY GRID */}
            <section className="py-14 bg-[#fafcfb]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredItems.map((item) => (
                            <div
                                key={item.id}
                                className={`relative rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group border border-gray-100 bg-black ${
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
                                <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-black/85 via-black/40 to-transparent text-white z-20 pointer-events-none">
                                    <h3 className="text-base sm:text-lg font-bold leading-snug">
                                        {item.title}
                                    </h3>
                                    <p className="text-xs text-gray-300 mt-1 line-clamp-2 leading-relaxed">
                                        {item.caption}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}

