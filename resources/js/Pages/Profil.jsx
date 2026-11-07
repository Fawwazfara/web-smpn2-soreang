import PublicLayout from '@/Layouts/PublicLayout';
import { Link } from '@inertiajs/react';

export default function Profil({ auth }) {
    const identitasSekolah = [
        { label: 'Nama Sekolah', value: 'SMP Negeri 2 Soreang' },
        { label: 'NPSN', value: '20206128' },
        { label: 'NSS', value: '201020804002' },
        { label: 'Bentuk Pendidikan', value: 'Sekolah Menengah Pertama (SMP)' },
        { label: 'Status Akreditasi', value: 'Akreditasi A (Amat Baik)' },
        { label: 'Kurikulum', value: 'Kurikulum Merdeka' },
        { label: 'Kecamatan / Kabupaten', value: 'Kecamatan Soreang, Kabupaten Bandung' },
        { label: 'Provinsi', value: 'Jawa Barat' },
        { label: 'Waktu Penyelenggaraan', value: 'Pagi (07.00 - 15.00 WIB)' },
        { label: 'Status Sekolah', value: 'Negeri (Pemerintah Kabupaten Bandung)' },
    ];

    const fasilitas = [
        {
            nama: 'Laboratorium Komputer & ANBK',
            deskripsi: 'Dilengkapi 80 unit komputer terhubung jaringan intranet serat optik untuk asesmen nasional dan pembelajaran informatika.',
            ikon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            ),
        },
        {
            nama: 'Laboratorium IPA Terpadu',
            deskripsi: 'Peralatan praktikum fisika, kimia dasar, dan mikroskopik biologi yang lengkap untuk mengasah naluri riset sains peserta didik.',
            ikon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            ),
        },
        {
            nama: 'Perpustakaan "Pustaka Asri"',
            deskripsi: 'Menyediakan koleksi lebih dari 12.000 buku fisik, area baca ber-AC, serta pojok digital library terintegrasi.',
            ikon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            ),
        },
        {
            nama: 'Lapangan Olahraga Serbaguna',
            deskripsi: 'Fasilitas lapangan basket, futsal, dan voli berstandar kompetisi sekolah dengan tribun pendukung.',
            ikon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            ),
        },
        {
            nama: 'Masjid Baitul Ilmi',
            deskripsi: 'Pusat pembinaan keagamaan, shalat berjamaah rutin, keputrian, dan pembiasaan tadarus Al-Qur\'an setiap pagi.',
            ikon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            ),
        },
        {
            nama: 'Ruang Seni & Karawitan Sunda',
            deskripsi: 'Dilengkapi perangkat gamelan degung, angklung, dan alat musik modern untuk pelestarian seni budaya Jawa Barat.',
            ikon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            ),
        },
    ];

    return (
        <PublicLayout
            auth={auth}
            active="profil"
            title="Profil Sekolah - SMPN 2 Soreang"
            description="Mengenal lebih dekat visi, misi, sejarah, fasilitas, dan kepemimpinan SMP Negeri 2 Soreang Kabupaten Bandung."
        >
            {/* HERO BANNER */}
            <div className="bg-[#0d2e23] text-white py-14 sm:py-20 border-b border-emerald-900/60 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#82F5C1_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-800/80 text-emerald-300 border border-emerald-600/40 uppercase tracking-wider mb-4">
                        <span>IDENTITAS &amp; KEPEMIMPINAN</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
                        Profil SMP Negeri 2 Soreang
                    </h1>
                    <p className="mt-3 text-base sm:text-lg text-emerald-100/80 max-w-2xl leading-relaxed">
                        Membangun generasi pembelajar yang berakhlak mulia, berprestasi gemilang, dan berakar kuat pada nilai kearifan lokal Sunda serta berwawasan lingkungan hidup.
                    </p>
                </div>
            </div>

            {/* SAMBUTAN KEPALA SEKOLAH SECTION */}
            <section className="py-16 sm:py-20 bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
                        {/* Principal Card */}
                        <div className="lg:col-span-5">
                            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-gray-100 bg-[#0d2e23]">
                                <img
                                    src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=900&q=80"
                                    alt="Kepala Sekolah SMPN 2 Soreang"
                                    className="w-full h-[420px] sm:h-[480px] object-cover object-top"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0a241b] via-[#0a241b]/40 to-transparent" />
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

                        {/* Principal Text */}
                        <div className="lg:col-span-7 space-y-5">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
                                AMANAT KEPEMIMPINAN
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0d2e23] tracking-tight leading-snug">
                                "Pendidikan Berkualitas Bermula Dari Kedisiplinan yang Berkeadaban dan Akuntabel."
                            </h2>
                            <div className="space-y-4 text-gray-600 text-sm sm:text-base leading-relaxed">
                                <p>
                                    <strong className="text-emerald-900 font-semibold">Sampurasun!</strong> Selamat datang di portal resmi informasi dan transparansi akademik SMP Negeri 2 Soreang. Kami mendedikasikan eksistensi sekolah ini sebagai wadah tumbuh kembang insan muda Kabupaten Bandung yang tidak hanya tangguh dalam ranah kognitif dan kompetisi sains, namun juga luhur dalam budi pekerti serta kearifan lokal Sunda.
                                </p>
                                <p>
                                    Tantangan abad ke-21 menuntut sekolah bertransformasi secara dinamis. Melalui peluncuran Sistem Tatakelola &amp; Presensi Digital Terpadu, kami menghadirkan keterbukaan akses jadwal belajar mengajar, pemantauan kedisiplinan guru dan siswa secara real-time, serta pelayanan publik yang inklusif dan transparan.
                                </p>
                                <p>
                                    Kami percaya, keberhasilan pendidikan adalah kolaborasi harmonis antara guru, orang tua murid, dan lingkungan masyarakat. Mari bersama-sama membimbing putra-putri kita menjadi pribadi yang <em>cageur, bageur, bener, pinter, tur singer</em>.
                                </p>
                            </div>

                            <div className="pt-2 flex flex-wrap gap-3 text-xs">
                                <div className="px-3.5 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold">
                                    ✓ Akuntabilitas Publik Terjamin
                                </div>
                                <div className="px-3.5 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold">
                                    ✓ Ekosistem Sekolah Adiwiyata
                                </div>
                                <div className="px-3.5 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold">
                                    ✓ Pelayanan Bebas Pungli
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* VISI & MISI SECTION */}
            <section className="py-16 sm:py-20 bg-[#f7faf8] border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-12">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
                            PANDUAN &amp; ARAH STRATEGIS
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0d2e23] tracking-tight mt-2">
                            Visi &amp; Misi Sekolah
                        </h2>
                        <p className="text-sm text-gray-500 mt-2">
                            Landasan pijak dalam setiap kebijakan dan aktivitas pembelajaran di SMP Negeri 2 Soreang.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Visi Card */}
                        <div className="lg:col-span-5 bg-gradient-to-br from-[#0d2e23] to-[#002114] text-white p-8 sm:p-10 rounded-2xl shadow-lg border border-emerald-900/60 flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 rounded-xl bg-emerald-600/40 text-emerald-300 flex items-center justify-center mb-6">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </div>
                                <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-widest">
                                    VISI SEKOLAH
                                </h3>
                                <p className="text-xl sm:text-2xl font-bold mt-4 leading-snug text-white">
                                    "Terwujudnya Peserta Didik yang Berkarakter Luhur, Unggul dalam Prestasi, Cakap Digital, dan Berwawasan Lingkungan Hidup."
                                </p>
                            </div>
                            <div className="mt-8 pt-6 border-t border-emerald-800/80 text-xs text-emerald-200/80">
                                Berlandaskan Profil Pelajar Pancasila &amp; Kearifan Budaya Sunda
                            </div>
                        </div>

                        {/* Misi Card */}
                        <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-gray-200 space-y-6">
                            <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-widest">
                                MISI SEKOLAH
                            </h3>
                            <ol className="space-y-4">
                                {[
                                    'Menanamkan keimanan, ketaqwaan, dan budi pekerti luhur melalui pembiasaan ibadah dan budaya saling menghormati.',
                                    'Mengembangkan proses pembelajaran bermakna berbasis Kurikulum Merdeka yang memicu daya nalar kritis dan kreativitas.',
                                    'Meningkatkan pencapaian prestasi akademik dan non-akademik di tingkat kabupaten, provinsi, maupun nasional.',
                                    'Memanfaatkan teknologi informasi secara bijak dan akuntabel untuk mendukung sistem pembelajaran dan tata kelola sekolah.',
                                    'Mewujudkan lingkungan sekolah yang bersih, hijau, sehat, dan berkesinambungan (Sekolah Adiwiyata).',
                                    'Melestarikan warisan seni dan budaya Sunda sebagai benteng kepribadian di era keterbukaan informasi.',
                                ].map((misi, idx) => (
                                    <li key={idx} className="flex items-start gap-3.5 text-sm sm:text-base text-gray-700 leading-relaxed">
                                        <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                                            {idx + 1}
                                        </span>
                                        <span>{misi}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </div>
                </div>
            </section>

            {/* IDENTITAS RESMI SEKOLAH */}
            <section className="py-16 sm:py-20 bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
                            DATA POKOK PENDIDIKAN (DAPODIK)
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0d2e23] tracking-tight mt-2">
                            Identitas Resmi Sekolah
                        </h2>
                        <p className="text-sm text-gray-500 mt-2">
                            Legalitas dan parameter kelembagaan SMP Negeri 2 Soreang resmi terdaftar di Kemendikbudristek.
                        </p>
                    </div>

                    <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="divide-y divide-gray-100">
                            {identitasSekolah.map((item, idx) => (
                                <div key={idx} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-gray-50/60 transition">
                                    <span className="text-xs sm:text-sm font-semibold text-gray-500">{item.label}</span>
                                    <span className="text-xs sm:text-sm font-bold text-gray-900">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* FASILITAS UNGGULAN */}
            <section className="py-16 sm:py-20 bg-[#f7faf8] border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
                            SARANA &amp; PRASARANA
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0d2e23] tracking-tight mt-2">
                            Fasilitas Belajar &amp; Praktikum
                        </h2>
                        <p className="text-sm text-gray-500 mt-2">
                            Sarana prasarana yang menunjang eksplorasi minat, bakat, serta kompetensi akademik peserta didik.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {fasilitas.map((f, idx) => (
                            <div key={idx} className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        {f.ikon}
                                    </svg>
                                </div>
                                <h3 className="text-base font-bold text-gray-900">{f.nama}</h3>
                                <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">{f.deskripsi}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 text-center">
                        <Link
                            href="/galeri"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs tracking-wide transition shadow-sm"
                        >
                            <span>Lihat Foto Fasilitas &amp; Kegiatan di Galeri</span>
                            <span>&rarr;</span>
                        </Link>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}

