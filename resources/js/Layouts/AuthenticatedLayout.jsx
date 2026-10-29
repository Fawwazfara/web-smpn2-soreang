import Dropdown from '@/Components/Dropdown';
import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

function IconSchoolColumns({ className = 'w-5 h-5' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.5L12 4l9 5.5M5 10.5v7.5m4.5-7.5v7.5m5-7.5v7.5m4.5-7.5v7.5M3.5 18.5h17M2.5 20.5h19" />
        </svg>
    );
}

function IconGrid({ className = 'w-4 h-4' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
        </svg>
    );
}

function IconBroadcast({ className = 'w-4 h-4' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.348 14.651a3.75 3.75 0 010-5.303m5.304 0a3.75 3.75 0 010 5.303m-7.425 2.122a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.808-3.808-9.98 0-13.789m13.788 0c3.808 3.808 3.808 9.981 0 13.79M12 12h.008v.007H12V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
    );
}

function IconUsers({ className = 'w-4 h-4' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
    );
}

function IconBadgeCard({ className = 'w-4 h-4' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
        </svg>
    );
}

function IconBuilding({ className = 'w-4 h-4' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
        </svg>
    );
}

function IconBook({ className = 'w-4 h-4' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
    );
}

function IconCalendar({ className = 'w-4 h-4' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
    );
}

function IconNews({ className = 'w-4 h-4' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
        </svg>
    );
}

function IconCamera({ className = 'w-4 h-4' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
        </svg>
    );
}

function IconCheckSquare({ className = 'w-4 h-4' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );
}

function IconDocument({ className = 'w-4 h-4' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
    );
}

function IconKey({ className = 'w-4 h-4' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
        </svg>
    );
}

function IconLock({ className = 'w-4 h-4' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
    );
}

function IconUser({ className = 'w-4 h-4' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
    );
}

function IconShieldCheck({ className = 'w-4 h-4' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
    );
}

function IconLogout({ className = 'w-4 h-4' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
        </svg>
    );
}

function IconAcademicCap({ className = 'w-4 h-4' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
        </svg>
    );
}

export default function AuthenticatedLayout({ header, children }) {
    const { auth, tahunAjaranAktif } = usePage().props;
    const user = auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [topSearch, setTopSearch] = useState('');
    const [now, setNow] = useState(() => new Date());
    const searchInputRef = useRef(null);

    const isOperationalRole = user.role === 'guru' || user.role === 'guru_piket';

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 30000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const onKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                if (searchInputRef.current) {
                    e.preventDefault();
                    searchInputRef.current.focus();
                }
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    const formattedShortDate = now.toLocaleDateString('id-ID', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });

    const formattedTimeWIB = `${now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).replace('.', ':')} WIB`;

    const handleTopSearchSubmit = (e) => {
        e.preventDefault();
        if (user.role === 'admin') {
            router.get(route('users.index'), { search: topSearch }, { preserveState: false });
        }
    };

    const getNavGroups = () => {
        if (user.role === 'admin') {
            return [
                {
                    title: 'MAIN',
                    items: [
                        { label: 'Dashboard', route: 'dashboard', icon: IconGrid },
                        { label: 'Live Monitor Kelas', route: null, icon: IconBroadcast, liveDot: true },
                    ],
                },
                {
                    title: 'MASTER DATA',
                    items: [
                        { label: 'Data Siswa', route: null, icon: IconUsers },
                        { label: 'Data Guru & Staff', route: 'users.index', icon: IconBadgeCard },
                        { label: 'Kelas & Rombel', route: 'kelas.index', icon: IconBuilding },
                        { label: 'Tahun Ajaran', route: 'tahun-ajaran.index', icon: IconCalendar },
                        { label: 'Mata Pelajaran', route: null, icon: IconBook },
                        { label: 'Berita & Pengumuman', route: 'admin.berita.index', icon: IconNews },
                    ],
                },
                {
                    title: 'ATTENDANCE',
                    items: [
                        { label: 'Presensi Guru (Selfie)', route: null, icon: IconCamera },
                        { label: 'Presensi Siswa', route: null, icon: IconCheckSquare },
                        { label: 'Rekap & Laporan', route: null, icon: IconDocument },
                    ],
                },
                {
                    title: 'JADWAL & SESI',
                    items: [
                        { label: 'Matriks Jadwal KBM', route: null, icon: IconCalendar },
                        { label: 'Guru Piket & Pengganti', route: null, icon: IconBadgeCard },
                    ],
                },
            ];
        }

        if (user.role === 'kepsek') {
            return [
                {
                    title: 'MAIN',
                    items: [
                        { label: 'Dashboard', route: 'dashboard', icon: IconGrid },
                        { label: 'Live Monitor Kelas', route: null, icon: IconBroadcast, liveDot: true },
                    ],
                },
                {
                    title: 'MONITORING & REKAP',
                    items: [
                        { label: 'Presensi Guru (Selfie)', route: null, icon: IconCamera, badge: 'Read-Only' },
                        { label: 'Presensi Siswa', route: null, icon: IconCheckSquare, badge: 'Read-Only' },
                        { label: 'Rekap & Laporan', route: null, icon: IconDocument, badge: 'Read-Only' },
                    ],
                },
                {
                    title: 'PENGATURAN AKUN',
                    items: [
                        { label: 'Profil & Password', route: 'profile.edit', icon: IconUser },
                    ],
                },
            ];
        }

        if (user.role === 'guru_piket') {
            return [
                {
                    title: null,
                    items: [
                        { label: 'Dashboard Piket', route: 'dashboard', icon: IconGrid },
                        { label: 'Buka Sesi Pengganti', route: null, icon: IconKey },
                        { label: 'Monitor Kelas Terkunci', route: null, icon: IconLock },
                        { label: 'Presensi Mandiri', route: null, icon: IconCamera },
                        { label: 'Jadwal Piket', route: null, icon: IconCalendar },
                        { label: 'Profil & Password', route: 'profile.edit', icon: IconUser },
                    ],
                },
            ];
        }

        // Default: guru
        return [
            {
                title: null,
                items: [
                    { label: 'Dashboard Guru', route: 'dashboard', icon: IconGrid },
                    { label: 'Presensi Mandiri', route: null, icon: IconCamera },
                    { label: 'Presensi Siswa / KBM', route: null, icon: IconCheckSquare },
                    { label: 'Jadwal Mengajar', route: null, icon: IconCalendar },
                    { label: 'Jurnal & Kode Pengganti', route: null, icon: IconBook },
                    { label: 'Profil & Password', route: 'profile.edit', icon: IconUser },
                ],
            },
        ];
    };

    const navGroups = getNavGroups();

    const isRouteActive = (itemRoute) => {
        if (!itemRoute) return false;
        if (itemRoute === 'dashboard') {
            return route().current('dashboard');
        }
        if (itemRoute === 'admin.berita.index') {
            return route().current('admin.berita.*');
        }
        return route().current(`${itemRoute.split('.')[0]}.*`);
    };

    const roleSubtitle = {
        admin: 'Kepala Tata Usaha',
        kepsek: 'Kepala Sekolah',
        guru: user.jenis_pegawai === 'tenaga_kependidikan' ? 'Tenaga Kependidikan' : 'Guru Pengajar',
        guru_piket: 'Petugas Guru Piket',
    }[user.role] ?? user.role;

    const renderNavItems = () => (
        <nav className={`px-3 ${isOperationalRole ? 'py-2 space-y-1' : 'py-4 space-y-5'} flex-1 overflow-y-auto`}>
            {navGroups.map((group, gIdx) => (
                <div key={gIdx}>
                    {group.title && (
                        <div className="px-3.5 mb-2 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                            {group.title}
                        </div>
                    )}
                    <div className="space-y-1">
                        {group.items.map((item, iIdx) => {
                            const active = isRouteActive(item.route);
                            const Icon = item.icon;

                            if (!item.route) {
                                return (
                                    <div
                                        key={iIdx}
                                        title="Modul terintegrasi pada sprint berikutnya"
                                        className="flex items-center justify-between px-3.5 py-2.5 text-[12.5px] font-medium text-slate-500 rounded-xl hover:bg-[#F5F8F7] transition-colors cursor-default select-none"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <Icon className="w-[17px] h-[17px] text-slate-400 shrink-0" />
                                            <span className="truncate">{item.label}</span>
                                        </div>
                                        {item.liveDot && (
                                            <span className="h-2 w-2 rounded-full bg-[#10B981] shrink-0" />
                                        )}
                                        {item.badge && (
                                            <span className="text-[9.5px] font-semibold bg-[#EDF6F1] text-[#0E7452] px-1.5 py-0.5 rounded-md">
                                                {item.badge}
                                            </span>
                                        )}
                                    </div>
                                );
                            }

                            return (
                                <Link
                                    key={iIdx}
                                    href={route(item.route)}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center justify-between px-3.5 py-2.5 text-[12.5px] rounded-xl transition-all duration-150 ${
                                        active
                                            ? 'bg-[#103728] text-white font-semibold shadow-2xs'
                                            : 'text-slate-700 font-medium hover:bg-[#F2F7F5] hover:text-[#0F382A]'
                                    }`}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <Icon
                                            className={`w-[17px] h-[17px] shrink-0 ${
                                                active ? 'text-white' : 'text-slate-500'
                                            }`}
                                        />
                                        <span className="truncate">{item.label}</span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            ))}
        </nav>
    );

    const renderSidebarContent = () => {
        if (isOperationalRole) {
            return (
                <div className="flex h-full flex-col justify-between bg-white">
                    <div className="flex flex-col flex-1 min-h-0">
                        {/* SiSADA Brand Header */}
                        <div className="px-5 pt-5 pb-3.5">
                            <Link href={route('dashboard')} className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0F382A] text-white shadow-xs">
                                    <IconSchoolColumns className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-[16px] font-extrabold tracking-tight text-slate-900 leading-none">
                                        SiSADA
                                    </div>
                                    <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-500 mt-1 truncate">
                                        SMPN 2 SOREANG • {user.role === 'guru_piket' ? 'PIKET' : 'GURU'}
                                    </div>
                                </div>
                            </Link>
                        </div>

                        {/* Mint User Profile Pill Card */}
                        <div className="mx-3.5 mb-2 rounded-xl bg-[#EDF6F1] border border-[#DCEEE4] p-2.5 flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0F382A] text-white">
                                <IconUser className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-bold text-slate-900 leading-tight">
                                    {user.nama}
                                </p>
                                <p className="truncate text-[10.5px] font-bold text-[#0E7452] mt-0.5">
                                    NIP. {user.username}
                                </p>
                            </div>
                        </div>

                        {renderNavItems()}
                    </div>

                    {/* Bottom Status Presensi Card + Footer */}
                    <div className="p-3.5 space-y-3 border-t border-[#E5ECE9]/70 bg-white">
                        <div className="rounded-xl bg-[#F7FAF8] border border-[#E5ECE9] p-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                    STATUS PRESENSI
                                </span>
                                <span className="inline-flex items-center rounded-full bg-[#D8F3E5] px-2 py-0.5 text-[10px] font-bold text-[#0E7452]">
                                    Aktif
                                </span>
                            </div>
                            <p className="mt-1.5 text-[11px] font-medium text-slate-600 leading-snug">
                                {user.role === 'guru_piket'
                                    ? 'Validasi Kode Sesi 6-Digit & Kamera Live Aktif'
                                    : 'Validasi Kamera Live Selfie Aktif'}
                            </p>
                        </div>

                        <div className="flex items-center justify-between px-1 text-[10.5px] font-semibold text-slate-500">
                            <span className="truncate">
                                {tahunAjaranAktif
                                    ? `TA ${tahunAjaranAktif.nama} ${tahunAjaranAktif.semester}`
                                    : 'TA Aktif'}
                            </span>
                            <div className="flex items-center gap-2 shrink-0">
                                <span className="font-bold text-slate-700">SADA v2.0</span>
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                                    title="Keluar"
                                >
                                    <IconLogout className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        // Workspace Sidebar (Admin & Kepsek)
        return (
            <div className="flex h-full flex-col justify-between bg-white">
                <div className="flex flex-col flex-1 min-h-0">
                    {/* Workspace Brand Header */}
                    <div className="px-5 py-4 border-b border-[#E5ECE9]">
                        <Link href={route('dashboard')} className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0F382A] text-white shadow-xs">
                                <IconSchoolColumns className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                                <div className="text-[13.5px] font-extrabold tracking-tight text-slate-900 leading-tight">
                                    SMPN 2 SOREANG
                                </div>
                                <div className="text-[9.5px] font-bold uppercase tracking-wider text-[#0E7452] mt-0.5 truncate">
                                    {user.role === 'admin'
                                        ? 'ADMIN & TU WORKSPACE V2.0'
                                        : 'KEPSEK MONITORING V2.0'}
                                </div>
                            </div>
                        </Link>
                    </div>

                    {renderNavItems()}
                </div>

                {/* Bottom Admin/Kepsek Account Card */}
                <div className="border-t border-[#E5ECE9] p-3.5 bg-white">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E6F5EE] text-[#0E7452] border border-[#CBE9DA]">
                                <IconShieldCheck className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-bold text-slate-800">
                                    {user.role === 'admin' ? 'Admin Tata Usaha' : 'Kepala Sekolah'}
                                </p>
                                <p className="truncate text-[11px] text-slate-400">
                                    {user.email || user.username}
                                </p>
                            </div>
                        </div>
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition shrink-0"
                            title="Keluar"
                        >
                            <IconLogout className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#F4F7F6] text-slate-900 flex">
            {/* Desktop Fixed White Sidebar */}
            <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:z-30 bg-white border-r border-[#E5ECE9]">
                {renderSidebarContent()}
            </aside>

            {/* Mobile Sidebar Drawer */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
                        onClick={() => setSidebarOpen(false)}
                    />
                    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-2xl border-r border-[#E5ECE9] flex flex-col">
                        <div className="absolute right-3 top-3.5 z-10">
                            <button
                                type="button"
                                onClick={() => setSidebarOpen(false)}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        {renderSidebarContent()}
                    </div>
                </div>
            )}

            {/* Main Workspace Canvas */}
            <div className="flex-1 lg:pl-64 flex flex-col min-h-screen min-w-0">
                {/* Top Header Bar */}
                <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-[#E5ECE9] bg-white px-4 sm:px-6 lg:px-8">
                    {/* Left Area */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(true)}
                            className="rounded-xl p-2 text-slate-600 hover:bg-[#F2F7F5] lg:hidden"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        {isOperationalRole ? (
                            <div className="flex items-center gap-2 text-slate-800">
                                <IconAcademicCap className="w-4 h-4 text-[#0F382A]" />
                                <span className="text-xs sm:text-[13px] font-bold tracking-tight">
                                    {user.role === 'guru_piket' ? 'Portal Guru Piket' : 'Portal Tenaga Pendidik'}
                                </span>
                            </div>
                        ) : (
                            <form onSubmit={handleTopSearchSubmit} className="hidden sm:block w-full max-w-sm">
                                <div className="relative flex items-center">
                                    <svg
                                        className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                    </svg>
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        value={topSearch}
                                        onChange={(e) => setTopSearch(e.target.value)}
                                        placeholder={
                                            user.role === 'admin'
                                                ? 'Cari data guru, NIP, rombel, pengumuman...'
                                                : 'Monitoring kehadiran guru & rombel...'
                                        }
                                        className="w-full rounded-full border border-[#E2E8E5] bg-[#F8FAF9] py-1.5 pl-9 pr-16 text-xs text-slate-700 placeholder:text-slate-400 focus:border-[#0E7452] focus:bg-white focus:ring-[#0E7452]"
                                    />
                                    <span className="absolute right-2.5 rounded-md border border-[#E2E8E5] bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                                        Ctrl K
                                    </span>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Right Area */}
                    <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
                        {isOperationalRole ? (
                            <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#E6F5EE] px-3 py-1 text-[10.5px] font-bold uppercase tracking-wider text-[#0E7452]">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#0E7452]" />
                                SEMESTER {(tahunAjaranAktif?.semester ?? 'AKTIF').toUpperCase()}
                            </div>
                        ) : (
                            <div className="hidden xl:flex items-center gap-3 rounded-full border border-[#E2E8E5] bg-[#F8FAF9] px-3.5 py-1.5">
                                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-800">
                                    <IconCalendar className="w-3.5 h-3.5 text-[#0E7452]" />
                                    <span>
                                        T.A. {tahunAjaranAktif?.nama ?? '2025/2026'} • {tahunAjaranAktif?.semester ?? 'Ganjil'}
                                    </span>
                                </div>
                                <span className="h-3.5 w-px bg-[#DCE5E1]" />
                                <span className="text-[11px] font-medium text-slate-500">
                                    {formattedShortDate}
                                </span>
                                <span className="rounded-full bg-[#E6F5EE] px-2.5 py-0.5 text-[10.5px] font-bold text-[#0E7452]">
                                    {formattedTimeWIB}
                                </span>
                            </div>
                        )}

                        {/* Notification & Help Icons */}
                        <div className="hidden sm:flex items-center gap-1.5">
                            <button
                                type="button"
                                title="Notifikasi Sistem"
                                className={`relative flex h-8 w-8 items-center justify-center rounded-full transition ${
                                    isOperationalRole
                                        ? 'bg-[#EEF3FA] text-slate-700 hover:bg-[#E2EAF5]'
                                        : 'text-slate-500 hover:bg-[#F2F7F5] hover:text-slate-800'
                                }`}
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                                </svg>
                                {!isOperationalRole && (
                                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
                                )}
                            </button>
                            <Link
                                href={route('profile.edit')}
                                title="Pengaturan Profil & Bantuan"
                                className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
                                    isOperationalRole
                                        ? 'bg-[#EEF3FA] text-slate-700 hover:bg-[#E2EAF5]'
                                        : 'text-slate-500 hover:bg-[#F2F7F5] hover:text-slate-800'
                                }`}
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                                </svg>
                            </Link>
                        </div>

                        <span className="hidden sm:block h-7 w-px bg-[#E5ECE9]" />

                        {/* User Profile Dropdown */}
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button
                                    type="button"
                                    className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-1.5 hover:bg-[#F4F7F6] transition text-left"
                                >
                                    {isOperationalRole ? (
                                        <>
                                            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0F382A] text-white">
                                                <IconUser className="w-4 h-4" />
                                            </div>
                                            <div className="hidden md:block leading-tight pr-1">
                                                <div className="text-xs font-bold text-slate-900 max-w-[150px] truncate">
                                                    {user.nama}
                                                </div>
                                                <div className="text-[10.5px] font-semibold text-slate-500">
                                                    NIP. {user.username}
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="hidden md:block text-right leading-tight pl-1">
                                                <div className="text-xs font-bold text-slate-900 max-w-[160px] truncate">
                                                    {user.nama}
                                                </div>
                                                <div className="text-[10.5px] font-bold text-[#0E7452]">
                                                    {roleSubtitle}
                                                </div>
                                            </div>
                                            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0F382A] text-white">
                                                <IconUser className="w-4 h-4" />
                                                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#10B981] ring-2 ring-white" />
                                            </div>
                                        </>
                                    )}
                                </button>
                            </Dropdown.Trigger>
                            <Dropdown.Content>
                                <div className="px-4 py-2.5 border-b border-slate-100 text-xs">
                                    <p className="font-bold text-slate-800">{user.nama}</p>
                                    <p className="text-[11px] font-medium text-[#0E7452]">{roleSubtitle}</p>
                                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">{user.username}</p>
                                </div>
                                <Dropdown.Link href={route('profile.edit')}>
                                    Profil & Password
                                </Dropdown.Link>
                                <Dropdown.Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="text-rose-600 font-semibold"
                                >
                                    Keluar dari SADA
                                </Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                </header>

                {/* Optional Legacy Header Banner (for Kelas, Tahun Ajaran, Berita, Profile) */}
                {header && (
                    <div className="bg-white border-b border-[#E5ECE9] px-4 py-4 sm:px-6 lg:px-8">
                        {header}
                    </div>
                )}

                {/* Main Canvas */}
                <main className="flex-1 p-4 sm:p-6 lg:p-7">
                    {children}
                </main>
            </div>
        </div>
    );
}
