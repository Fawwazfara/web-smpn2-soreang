import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#F4F7F6] px-4 py-10 text-slate-900">
            <div className="w-full max-w-md">
                <Link href="/" className="flex flex-col items-center text-center group">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0F382A] text-white shadow-sm group-hover:bg-[#164B38] transition">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.5L12 4l9 5.5M5 10.5v7.5m4.5-7.5v7.5m5-7.5v7.5m4.5-7.5v7.5M3.5 18.5h17M2.5 20.5h19" />
                        </svg>
                    </div>
                    <span className="mt-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[#0E7452]">
                        SMPN 2 SOREANG • SADA V2.0
                    </span>
                </Link>

                <div className="mt-5 w-full overflow-hidden rounded-2xl border border-[#E5ECE9] bg-white p-6 sm:p-8 shadow-xs">
                    {children}
                </div>

                <p className="mt-5 text-center text-[11px] text-slate-400">
                    Sistem Absensi & Manajemen Kehadiran Digital SMPN 2 Soreang
                </p>
            </div>
        </div>
    );
}
