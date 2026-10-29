import Dropdown from '@/Components/Dropdown';
import { getSidebarNavByRole } from '@/Config/sidebarNav';
import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

function IconSchoolColumns({ className = 'w-5 h-5' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.5L12 4l9 5.5M5 10.5v7.5m4.5-7.5v7.5m5-7.5v7.5m4.5-7.5v7.5M3.5 18.5h17M2.5 20.5h19" />
        </svg>
    );
}

function IconGrid4({ className = 'w-4 h-4' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
            <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
            <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
            <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
            <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
        </svg>
    );
}

function IconLayoutSplit({ className = 'w-4 h-4' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
            <rect x="3.5" y="4" width="17" height="16" rx="2" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 4v16M9.5 12h11" />
        </svg>
    );
}

function IconBroadcast({ className = 'w-4 h-4' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 14.5a3.5 3.5 0 010-5m7 0a3.5 3.5 0 010 5M5.5 17.5a7.5 7.5 0 010-11m13 0a7.5 7.5 0 010 11M12 12h.01" />
            <circle cx="12" cy="12" r="1.25" fill="currentColor" />
        </svg>
    );
}

function IconUsersGroup({ className = 'w-4 h-4' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 19v-1.25A3.75 3.75 0 0012.25 14h-4.5A3.75 3.75 0 004 17.75V19m16 0v-1.25a3.75 3.75 0 00-2.75-3.61M13.5 6.25a3.25 3.25 0 11-6.5 0 3.25 3.25 0 016.5 0zm5.5 1.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
    );
}

function IconIdCard({ className = 'w-4 h-4' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5.5V4a1 1 0 011-1h4a1 1 0 011 1v1.5M4 6.5h16a1.5 1.5 0 011.5 1.5v10.5A1.5 1.5 0 0120 20H4a1.5 1.5 0 01-1.5-1.5V8A1.5 1.5 0 014 6.5zm4.5 5a1.75 1.75 0 100-3.5 1.75 1.75 0 000 3.5zm-2.75 4.25a2.75 2.75 0 015.5 0m3.25-4.75h4m-4 3h3" />
        </svg>
    );
}

function IconDoorRoom({ className = 'w-4 h-4' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 20h16M6 20V5a1 1 0 011-1h7a1 1 0 011 1v15m0-11h2a1 1 0 011 1v10m-6-7.5h.01" />
        </svg>
    );
}

function IconOpenBook({ className = 'w-4 h-4' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
    );
}

function IconMapPinBase({ className = 'w-4 h-4' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 17.5s5.5-4.75 5.5-9.25a5.5 5.5 0 10-11 0C6.5 12.75 12 17.5 12 17.5zM6 20.5h12" />
        </svg>
    );
}

function IconCheckListRect({ className = 'w-4 h-4' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
            <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 9.5h2m-2 5h2m3.5-2.5l1.75 1.75L17.5 10.5" />
        </svg>
    );
}

function IconDocFold({ className = 'w-4 h-4' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 3.5h8.5L19 8v11.5a1.5 1.5 0 01-1.5 1.5H6a1.5 1.5 0 01-1.5-1.5V5A1.5 1.5 0 016 3.5z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 3.5V8h4.5M8.5 11.5h1m-1 3.5h1" />
        </svg>
    );
}

function IconCalendarGrid({ className = 'w-4 h-4' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
            <rect x="3.5" y="4.5" width="17" height="16" rx="2" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 3v3m8-3v3M3.5 9.5h17M8 13.5h.01M12 13.5h.01M16 13.5h.01M8 17h.01M12 17h.01M16 17h.01" />
        </svg>
    );
}

function IconPortraitBadge({ className = 'w-4 h-4' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
            <rect x="5" y="4" width="14" height="16.5" rx="2" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 4V2.75h4V4m-2 8.25a2 2 0 100-4 2 2 0 000 4zm-3.25 4.75a3.25 3.25 0 016.5 0" />
        </svg>
    );
}

function IconStarOutline({ className = 'w-4 h-4' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
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

function IconShieldBadge({ className = 'w-4 h-4' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 3v5.5c0 4.5-3 8.25-7 9.5-4-1.25-7-5-7-9.5V6l7-3z" />
            <circle cx="14.5" cy="14.5" r="2.25" fill="currentColor" stroke="none" />
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

const SIDEBAR_ICONS = {
    'grid-4': IconGrid4,
    'layout-split': IconLayoutSplit,
    broadcast: IconBroadcast,
    'users-group': IconUsersGroup,
    'id-card': IconIdCard,
    'door-room': IconDoorRoom,
    'open-book': IconOpenBook,
    'map-pin': IconMapPinBase,
    checklist: IconCheckListRect,
    'doc-fold': IconDocFold,
    'calendar-grid': IconCalendarGrid,
    'portrait-badge': IconPortraitBadge,
    star: IconStarOutline,
    key: IconKey,
    lock: IconLock,
};

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

    const formattedDayMonth = now.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: '2-digit',
        month: 'short',
    });
    const formattedYear = now.getFullYear();

    const formattedTimeWIB = now
        .toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        })
        .replace('.', ':');

    const handleTopSearchSubmit = (e) => {
        e.preventDefault();
        if (user.role === 'admin') {
            router.get(route('users.index'), { search: topSearch }, { preserveState: false });
        }
    };

    const navGroups = getSidebarNavByRole(user.role);

    const isRouteActive = (item) => {
        if (!item.route) return false;
        if (item.exactRoleMatch) {
            return false;
        }
        if (item.activePattern) {
            return route().current(item.activePattern);
        }
        if (item.route === 'dashboard') {
            return route().current('dashboard');
        }
        if (item.route === 'admin.berita.index') {
            return route().current('admin.berita.*');
        }
        return route().current(`${item.route.split('.')[0]}.*`);
    };

    const roleSubtitle =
        {
            admin: 'Kepala Tata Usaha',
            kepsek: 'Kepala Sekolah',
            guru: user.jenis_pegawai === 'tenaga_kependidikan' ? 'Tenaga Kependidikan' : 'Guru Pengajar',
            guru_piket: 'Petugas Guru Piket',
        }[user.role] ?? user.role;

    const renderNavItems = () => (
        <nav className={`px-3 ${isOperationalRole ? 'py-2 space-y-1.5' : 'py-4 space-y-5'} flex-1 overflow-y-auto`}>
            {navGroups.map((group, gIdx) => (
                <div key={gIdx}>
                    {group.title && (
                        <div className="px-3.5 mb-2 text-[10px] font-bold uppercase tracking-[0.07em] text-[#64748B]">
                            {group.title}
                        </div>
                    )}
                    <div className="space-y-1">
                        {group.items.map((item, iIdx) => {
                            const active = isRouteActive(item);
                            const Icon =
                                (typeof item.icon === 'string'
                                    ? SIDEBAR_ICONS[item.icon]
                                    : item.icon) ?? IconGrid4;

                            if (!item.route) {
                                return (
                                    <div
                                        key={iIdx}
                                        className="flex items-center justify-between px-3.5 py-2.5 text-[13px] font-medium text-[#334155] rounded-xl hover:bg-[#F3F7F5] transition-colors cursor-default select-none"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <Icon className="w-[17px] h-[17px] text-[#475569] shrink-0" />
                                            <span className="truncate">{item.label}</span>
                                        </div>
                                        {item.liveDot && (
                                            <span className="h-2 w-2 rounded-full bg-[#10B981] shrink-0" />
                                        )}
                                    </div>
                                );
                            }

                            return (
                                <Link
                                    key={iIdx}
                                    href={route(item.route, item.routeParams ?? {})}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center justify-between px-3.5 py-2.5 text-[13px] rounded-xl transition-all duration-150 ${
                                        active
                                            ? 'bg-[#103728] text-white font-semibold shadow-2xs'
                                            : 'text-[#334155] font-medium hover:bg-[#F3F7F5] hover:text-[#0F382A]'
                                    }`}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <Icon
                                            className={`w-[17px] h-[17px] shrink-0 ${
                                                active ? 'text-white' : 'text-[#475569]'
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
        // Operational Sidebar (Exact Match to Figma Image 4)
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
                        <div className="mx-3.5 mb-2.5 rounded-2xl bg-[#EAF6F0] px-3 py-2.5 flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0F382A] text-white">
                                <IconUser className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-[12.5px] font-bold text-slate-900 leading-tight">
                                    {user.nama}
                                </p>
                                <p className="truncate text-[11px] font-bold text-[#0E7452] mt-0.5">
                                    NIP. {user.username}
                                </p>
                            </div>
                        </div>

                        {renderNavItems()}
                    </div>


                    {/* Exact Bottom Status Presensi Card + Footer (Figma Image 4) */}
                    <div className="px-3.5 pb-4 pt-2 space-y-3 bg-white">
                        <div className="rounded-2xl bg-[#F6F9F8] p-3.5">
                            <div className="flex items-center justify-between">
                                <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-600">
                                    STATUS PRESENSI
                                </span>
                                <span className="inline-flex items-center rounded-full bg-[#92F4C2] px-2.5 py-0.5 text-[10.5px] font-bold text-[#064E3B]">
                                    Aktif
                                </span>
                               
                            </div>
                            <p className="mt-2 text-[12px] font-medium text-slate-600 leading-snug">
                                Terkoneksi Radius GPS Sekolah (25m)
                            </p>
                        </div>

                        <div className="flex items-center justify-between px-1 text-[11px] font-bold text-slate-700">
                            <span className="truncate">
                                {tahunAjaranAktif
                                    ? `TA ${tahunAjaranAktif.nama} ${tahunAjaranAktif.semester}`
                                    : 'TA 2024/2025 Genap'}
                            </span>
                            <span className="shrink-0">SIKAD v4.2</span>
                        </div>
                    </div>
                </div>
            );
        }

        // Workspace Sidebar (Exact Match to Figma Image 1 & Image 2)
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

                {/* Exact Bottom Admin/Kepsek Account Card (Figma Image 2) */}
                <div className="border-t border-[#E5ECE9] px-4 py-3.5 bg-white">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E6F5EE] text-[#0E7452]">
                                <IconShieldBadge className="w-5 h-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-[13px] font-bold text-slate-900">
                                    {user.role === 'admin' ? 'Admin Tata Usaha' : 'Kepala Sekolah'}
                                </p>
                                <p className="truncate text-[11.5px] text-slate-400">
                                    {user.email || 'admin@smpn2soreang.sch.id'}
                                </p>
                            </div>
                        </div>
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition shrink-0"
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
                {/* Top Header Bar (Exact Match to Figma Image 1 & Screenshot 3) */}
                <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-[#E5ECE9] bg-white px-4 sm:px-6 lg:px-7">
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
                            <form onSubmit={handleTopSearchSubmit} className="hidden sm:block w-full max-w-[360px]">
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
                                        placeholder="Cari data siswa, NIP, rombel, pengumuman..."
                                        className="w-full rounded-full border border-[#E2E8E5] bg-[#F6F9F8] py-2 pl-9 pr-16 text-xs text-slate-700 placeholder:text-slate-400 focus:border-[#0E7452] focus:bg-white focus:ring-[#0E7452]"
                                    />
                                    <span className="absolute right-2.5 rounded-md border border-[#E2E8E5] bg-white px-2 py-0.5 text-[10px] font-bold text-slate-600 shadow-2xs">
                                        Ctrl K
                                    </span>
                                </div>
                            </form>

                        )}
                    </div>

                    {/* Right Area */}
                    <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
                        {isOperationalRole ? (
                            <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#E6F5EE] px-3 py-1 text-[10.5px] font-bold uppercase tracking-wider text-[#0E7452]">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#0E7452]" />
                                SEMESTER {(tahunAjaranAktif?.semester ?? 'GENAP').toUpperCase()}
                            </div>
                        ) : (
                            <div className="hidden xl:flex items-center gap-3 rounded-full border border-[#E2E8E5] bg-[#F6F9F8] px-3.5 py-1">
                                {user.role === 'admin' ? (
                                    <Link
                                        href={route('tahun-ajaran.index')}
                                        title="Kelola Tahun Ajaran"
                                        className="flex items-center gap-2 hover:opacity-80 transition"
                                    >
                                        <IconCalendarGrid className="w-4 h-4 text-[#0E7452] shrink-0" />
                                        <div className="leading-tight text-[10.5px] font-bold text-slate-800">
                                            <div>T.A.</div>
                                            <div>
                                                {tahunAjaranAktif?.nama ?? '2025/2026'} •{' '}
                                                {tahunAjaranAktif?.semester ?? 'Ganjil'}
                                            </div>
                                        </div>
                                    </Link>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <IconCalendarGrid className="w-4 h-4 text-[#0E7452] shrink-0" />
                                        <div className="leading-tight text-[10.5px] font-bold text-slate-800">
                                            <div>T.A.</div>
                                            <div>
                                                {tahunAjaranAktif?.nama ?? '2025/2026'} •{' '}
                                                {tahunAjaranAktif?.semester ?? 'Ganjil'}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="leading-tight text-[10.5px] text-slate-500">
                                    <div>{formattedDayMonth}</div>
                                    <div>{formattedYear}</div>
                                </div>

                                <div className="rounded-xl bg-[#E3F5EC] px-2.5 py-1 text-center leading-tight text-[10.5px] font-extrabold text-[#0E7452]">
                                    <div>{formattedTimeWIB}</div>
                                    <div className="text-[9px]">WIB</div>
                                </div>
                            </div>
                        )}

                        {/* Sun + Bell + Help Icons (Exact Figma Image 1 Topbar Icons) */}
                        <div className="hidden sm:flex items-center gap-1.5">
                            {!isOperationalRole && (
                                <button
                                    type="button"
                                    title="Tema Tampilan"
                                    className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-[#F2F7F5] hover:text-slate-800 transition"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                                    </svg>
                                </button>
                            )}

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
                                title="Bantuan & Profil"
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
                                {user.role === 'admin' && (
                                    <>
                                        <Dropdown.Link href={route('tahun-ajaran.index')}>
                                            Pengaturan Tahun Ajaran
                                        </Dropdown.Link>
                                        <Dropdown.Link href={route('admin.berita.index')}>
                                            Berita & Pengumuman
                                        </Dropdown.Link>
                                    </>
                                )}
                                <Dropdown.Link href={route('profile.edit')}>
                                    Profil & Password
                                </Dropdown.Link>
                                <Dropdown.Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="text-rose-600 font-semibold"
                                >
                                    Keluar dari Sistem
                                </Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                </header>

                {/* Optional Header Banner */}
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
