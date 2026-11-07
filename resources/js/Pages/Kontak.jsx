import PublicLayout from '@/Layouts/PublicLayout';
import { useState } from 'react';

export default function Kontak({ auth }) {
    const [nama, setNama] = useState('');
    const [kategori, setKategori] = useState('Administrasi TU & Legalisir');
    const [pesan, setPesan] = useState('');
    const [openFaq, setOpenFaq] = useState(null);

    const faqs = [
        {
            q: 'Kapan jam operasional pelayanan kantor Tata Usaha (TU)?',
            a: 'Pelayanan TU dibuka setiap hari kerja. Senin sampai Kamis pukul 07.30 – 15.00 WIB, dan hari Jumat pukul 07.30 – 14.30 WIB. Hari Sabtu, Minggu, dan libur nasional kantor tutup.',
        },
        {
            q: 'Bagaimana prosedur permohonan legalisir ijazah atau rapor?',
            a: 'Silakan datang langsung ke loket TU dengan membawa dokumen asli dan fotokopi yang akan dilegalisir (maksimal 5 rangkap). Layanan legalisir 100% bebas biaya (bebas pungli).',
        },
        {
            q: 'Apakah orang tua murid bisa berkonsultasi mengenai presensi digital?',
            a: 'Tentu. Orang tua dapat mengonfirmasi ketidakhadiran siswa (Sakit/Izin) melalui link WhatsApp resmi yang dikirimkan oleh sistem atau berkonsultasi langsung dengan bagian kesiswaan dan wali kelas.',
        },
        {
            q: 'Bagaimana alur pendaftaran peserta didik baru (PPDB)?',
            a: 'Informasi dan tahapan PPDB mengikuti petunjuk teknis Dinas Pendidikan Kabupaten Bandung melalui jalur zonasi, afirmasi, prestasi, dan perpindahan tugas orang tua.',
        },
    ];

    const handleKirimWA = (e) => {
        e.preventDefault();
        const text = `Halo Admin TU SMPN 2 Soreang,%0ANama: ${encodeURIComponent(
            nama || 'Wali Murid/Masyarakat'
        )}%0AKeperluan: ${encodeURIComponent(kategori)}%0APesan: ${encodeURIComponent(
            pesan || 'Saya ingin menanyakan informasi terkait layanan sekolah.'
        )}`;
        window.open(`https://wa.me/6281223456819?text=${text}`, '_blank');
    };

    return (
        <PublicLayout
            auth={auth}
            active="kontak"
            title="Kontak & Layanan TU - SMPN 2 Soreang"
            description="Informasi kontak resmi, alamat, jam pelayanan tata usaha, dan saluran pengaduan SMP Negeri 2 Soreang Kabupaten Bandung."
        >
            {/* HERO BANNER */}
            <div className="bg-[#0d2e23] text-white py-14 sm:py-20 border-b border-emerald-900/60 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#82F5C1_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-800/80 text-emerald-300 border border-emerald-600/40 uppercase tracking-wider mb-4">
                        <span>PUSAT LAYANAN &amp; PENGADUAN</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
                        Kontak &amp; Layanan Tata Usaha
                    </h1>
                    <p className="mt-3 text-base sm:text-lg text-emerald-100/80 max-w-2xl leading-relaxed">
                        Kami siap melayani kebutuhan administrasi akademik, legalisir dokumen, konsultasi bimbingan, serta informasi sekolah dengan transparan dan akuntabel.
                    </p>
                </div>
            </div>

            {/* MAIN CONTENT SECTION */}
            <section className="py-14 sm:py-20 bg-[#fafcfb]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                    {/* 4 Info Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-900">Jam Pelayanan TU</h3>
                                <p className="text-xs text-gray-600 mt-1">Senin - Kamis: 07.30 - 15.00 WIB</p>
                                <p className="text-xs text-gray-600">Jumat: 07.30 - 14.30 WIB</p>
                            </div>
                        </div>

                        <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-900">Hotline WhatsApp</h3>
                                <a
                                    href="https://wa.me/6281223456819"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs font-semibold text-emerald-800 hover:underline mt-1 block"
                                >
                                    +62 812-2345-6819
                                </a>
                                <p className="text-[11px] text-gray-400">Respons Cepat Hari Kerja</p>
                            </div>
                        </div>

                        <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-900">Surat Elektronik</h3>
                                <p className="text-xs text-gray-600 mt-1 font-mono">info@smpn2soreang.sch.id</p>
                                <p className="text-[11px] text-gray-400">Kemitraan &amp; Instansi</p>
                            </div>
                        </div>

                        <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-900">Alamat Fisik</h3>
                                <p className="text-xs text-gray-600 mt-1">Jl. Soreang Raya No. 42</p>
                                <p className="text-[11px] text-gray-400">Soreang, Kab. Bandung 40911</p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form & Google Maps */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Form Direct WhatsApp */}
                        <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xs space-y-5">
                            <div>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
                                    KIRIM PESAN LANGSUNG
                                </span>
                                <h2 className="text-xl sm:text-2xl font-extrabold text-[#0d2e23] tracking-tight mt-2">
                                    Hubungi Petugas Tata Usaha
                                </h2>
                                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                    Pesan Anda akan otomatis diformat dan terkirim langsung ke nomor WhatsApp resmi sekolah.
                                </p>
                            </div>

                            <form onSubmit={handleKirimWA} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                        Nama Lengkap Anda
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={nama}
                                        onChange={(e) => setNama(e.target.value)}
                                        placeholder="Contoh: Budi Santoso (Orang Tua Siswa)"
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                        Jenis Keperluan
                                    </label>
                                    <select
                                        value={kategori}
                                        onChange={(e) => setKategori(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                                    >
                                        <option value="Administrasi TU & Legalisir">Administrasi TU &amp; Legalisir Ijazah/Rapor</option>
                                        <option value="Informasi PPDB / Pendaftaran Siswa Baru">Informasi PPDB / Pendaftaran Siswa Baru</option>
                                        <option value="Konfirmasi Absensi & Izin Siswa">Konfirmasi Absensi &amp; Izin Siswa</option>
                                        <option value="Konseling Bimbingan & Konseling (BK)">Konseling Bimbingan &amp; Konseling (BK)</option>
                                        <option value="Pengaduan & Saran Masyarakat">Pengaduan &amp; Saran Masyarakat</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                        Isi Pesan / Pertanyaan
                                    </label>
                                    <textarea
                                        rows={4}
                                        required
                                        value={pesan}
                                        onChange={(e) => setPesan(e.target.value)}
                                        placeholder="Tuliskan pertanyaan atau keperluan Anda secara jelas..."
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3 px-6 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm tracking-wide transition shadow-sm flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.071.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.423-14.416c-6.627 0-12 5.373-12 12 0 2.15.57 4.167 1.564 5.912l-1.564 5.716 5.86-1.536c1.674.928 3.596 1.458 5.64 1.458 6.627 0 12-5.373 12-12 0-6.627-5.373-12-12-12z" />
                                    </svg>
                                    <span>Kirim Chat WhatsApp ke Petugas TU</span>
                                </button>
                            </form>
                        </div>

                        {/* Maps & Address Info */}
                        <div className="lg:col-span-6 space-y-6">
                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
                                <h3 className="text-base font-bold text-gray-900">Peta Lokasi Kampus Sekolah</h3>
                                <div className="w-full rounded-xl overflow-hidden border border-gray-200" style={{ height: '300px' }}>
                                    <iframe
                                        title="Peta Lokasi SMPN 2 Soreang"
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15840.675549078716!2d107.5186!3d-7.0279!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68ec63a6f7b5a1%3A0x6e9f16d7a46c646!2sSoreang%2C%20Bandung%20Regency%2C%20West%20Java!5e0!3m2!1sen!2sid!4v1700000000000!5m2!1sen!2sid"
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        allowFullScreen=""
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    Lokasi strategis di pusat ibukota Kabupaten Bandung, mudah diakses kendaraan umum maupun pribadi, bersebelahan dengan kompleks kantor pemerintahan Soreang.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* FAQ ACCORDION */}
                    <div className="bg-white p-6 sm:p-10 rounded-2xl border border-gray-200 shadow-xs">
                        <div className="text-center max-w-xl mx-auto mb-8">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
                                TANYA JAWAB UMUM
                            </span>
                            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0d2e23] tracking-tight mt-2">
                                Pertanyaan Seputar Layanan Sekolah
                            </h2>
                        </div>

                        <div className="max-w-3xl mx-auto divide-y divide-gray-200">
                            {faqs.map((faq, idx) => {
                                const isOpen = openFaq === idx;
                                return (
                                    <div key={idx} className="py-4">
                                        <button
                                            type="button"
                                            onClick={() => setOpenFaq(isOpen ? null : idx)}
                                            className="w-full flex items-center justify-between text-left gap-4 font-bold text-sm sm:text-base text-gray-900 hover:text-emerald-800 transition"
                                        >
                                            <span>{faq.q}</span>
                                            <svg
                                                className={`w-5 h-5 text-gray-400 transform transition-transform ${
                                                    isOpen ? 'rotate-180 text-emerald-700' : ''
                                                }`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                        {isOpen && (
                                            <p className="mt-3 text-xs sm:text-sm text-gray-600 leading-relaxed">
                                                {faq.a}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}

