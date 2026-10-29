import { useState } from 'react';

/**
 * Komponen gambar artikel yang menampilkan gambar utuh tanpa terpotong.
 * Menggunakan teknik background blur + gambar foreground contain.
 * Props:
 * - src: string (URL gambar)
 * - alt: string (alt text)
 * - className: string (kelas CSS tambahan)
 * - aspectRatio: string (default '16/9')
 * - showBadge: boolean (tampilkan badge overlay di kiri atas)
 * - badgeText: string (teks badge)
 * - onClick: function (klik untuk lightbox/detail)
 * - enableLightbox: boolean (aktifkan lightbox saat diklik)
 */
export default function ArticleImage({
    src,
    alt = '',
    className = '',
    aspectRatio = '16/9',
    showBadge = false,
    badgeText = '',
    onClick,
    enableLightbox = false,
}) {
    const [lightboxOpen, setLightboxOpen] = useState(false);

    const handleClick = () => {
        if (onClick) onClick();
        if (enableLightbox) setLightboxOpen(true);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') setLightboxOpen(false);
    };

    // Lightbox modal
    if (lightboxOpen) {
        return (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
                onClick={() => setLightboxOpen(false)}
                onKeyDown={handleKeyDown}
                role="dialog"
                aria-modal="true"
                aria-label="Pratinjau gambar penuh"
            >
                <button
                    onClick={() => setLightboxOpen(false)}
                    className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition"
                    aria-label="Tutup pratinjau"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <img
                    src={src}
                    alt={alt}
                    className="max-w-[90vw] max-h-[90vh] object-contain"
                    onClick={(e) => e.stopPropagation()}
                />
            </div>
        );
    }

    return (
        <div
            className={`relative overflow-hidden rounded-2xl ${className}`}
            style={{ aspectRatio }}
            onClick={handleClick}
            role={enableLightbox || onClick ? 'button' : undefined}
            tabIndex={enableLightbox || onClick ? 0 : undefined}
            onKeyDown={enableLightbox || onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } } : undefined}
        >
            {/* Layer belakang: background blur */}
            <div className="absolute inset-0 z-0">
                <img
                    src={src}
                    alt=""
                    className="w-full h-full object-cover"
                    style={{
                        filter: 'blur(24px)',
                        transform: 'scale(1.15)',
                        opacity: 0.8,
                    }}
                    aria-hidden="true"
                />
                <div className="absolute inset-0 bg-black/25" aria-hidden="true" />
            </div>

            {/* Layer depan: gambar asli utuh (contain) */}
            <img
                src={src}
                alt={alt}
                loading="lazy"
                className="relative z-10 w-full h-full object-contain"
                style={{ backgroundColor: 'transparent' }}
            />

            {/* Badge kategori di pojok kiri atas */}
            {showBadge && badgeText && (
                <div className="absolute top-3 left-3 z-20">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-600 text-white uppercase tracking-wider shadow-sm">
                        {badgeText}
                    </span>
                </div>
            )}

            {/* Indikator klik untuk lightbox */}
            {enableLightbox && (
                <div className="absolute bottom-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <span className="px-2 py-1 rounded bg-black/70 text-white text-xs font-medium flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Perbesar
                    </span>
                </div>
            )}
        </div>
    );
}