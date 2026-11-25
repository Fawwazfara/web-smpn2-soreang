import Dropdown from '@/Components/Dropdown';
import { getSidebarNavByRole } from '@/Config/sidebarNav';
import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

function IconSchoolCrest({ className = 'w-7 h-7' }) {
    return (
        <svg className={className} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M18 3L31 11.2L26.2 31H9.8L5 11.2L18 3Z"
                fill="#143823"
                stroke="#006C4A"
                strokeWidth="1.8"
            />
            <path
                d="M18 7.5L26.5 13L23.3 26.5H12.7L9.5 13L18 7.5Z"
                fill="#006C4A"
                stroke="#82F5C1"
                strokeWidth="1.2"
            />
            <path
                d="M13 20.5C14.8 19.3 16.4 19.3 18 20.5C19.6 19.3 21.2 19.3 23 20.5V15C21.2 13.8 19.6 13.8 18 15C16.4 13.8 14.8 13.8 13 15V20.5Z"
                fill="#FFFFFF"
            />
            <circle cx="18" cy="11.5" r="1.5" fill="#FBBF24" />
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
            <rect x="3.5" y="4" width="17" height="16" rx="2.5" />
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

function IconUserCog({ className = 'w-4 h-4' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
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

function IconUserCard({ className = 'w-4 h-4' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
            <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
            <circle cx="9.5" cy="10.25" r="2.25" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.25 16.25a3.25 3.25 0 016.5 0M15.25 9.75h2.5m-2.5 3.5h2.5" />
        </svg>
    );
}

function IconMessageSquare({ className = 'w-4 h-4' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
        </svg>
    );
}

function IconMegaphone({ className = 'w-4 h-4' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
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

function IconPower({ className = 'w-4 h-4' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v9m6.364-5.364a9 9 0 11-12.728 0" />
        </svg>
    );
}

function IconWavingHand({ className = 'w-5 h-5' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.05 4.575a1.575 1.575 0 10-3.15 0v3m3.15-3v-1.5a1.575 1.575 0 013.15 0v1.5m-3.15 0l.075 5.925m3.075.75V4.575m0 0a1.575 1.575 0 013.15 0V15M6.9 7.575a1.575 1.575 0 10-3.15 0v8.175a6.75 6.75 0 006.75 6.75h2.018a5.25 5.25 0 003.712-1.538l1.732-1.732a5.25 5.25 0 001.538-3.712l.003-2.024a.668.668 0 01.198-.471 1.575 1.575 0 10-2.228-2.228 3.818 3.818 0 00-1.12 2.687M6.9 7.575V12m6.27 4.318A4.49 4.49 0 0116.35 15"
            />
        </svg>
    );
}

const SIDEBAR_ICONS = {
    'grid-4': IconGrid4,
    'layout-split': IconLayoutSplit,
    broadcast: IconBroadcast,
    'users-group': IconUsersGroup,
    'user-cog': IconUserCog,
    'id-card': IconIdCard,
    'door-room': IconDoorRoom,
    'open-book': IconOpenBook,
    'map-pin': IconMapPinBase,
    checklist: IconCheckListRect,
    'user-card': IconUserCard,
    'message-square': IconMessageSquare,
    megaphone: IconMegaphone,
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
    const searchInputRef = useRef(null);

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
            if (Array.isArray(item.activePattern)) {
                return item.activePattern.some((pattern) => route().current(pattern));
            }
            return route().current(item.activePattern);
        }
        if (item.route === 'dashboard') {
            return route().current('dashboard');
        }
        const parts = item.route.split('.');
        if (parts.length >= 3) {
            return route().current(`${parts[0]}.${parts[1]}.*`);
        }
        return route().current(`${parts[0]}.*`);
    };

    const roleSubtitle =
        {
            admin: 'Kepala Tata Usaha',
            kepsek: 'Kepala Sekolah',
            guru: user.jenis_pegawai === 'tenaga_kependidikan' ? 'Tenaga Kependidikan' : 'Guru Pengajar',
            guru_piket: 'Petugas Guru Piket',
        }[user.role] ?? user.role;

    const welcomeRoleLabel =
        {
            admin: 'Admin',
            kepsek: 'Kepala Sekolah',
            guru: user.nama,
            guru_piket: user.nama,
        }[user.role] ?? user.nama;

    const renderNavItems = () => (
        <nav className="px-4 py-2 space-y-5 flex-1 overflow-y-auto">
            {navGroups.map((group, gIdx) => (
                <div key={gIdx}>
                    {group.title && (
                        <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.08em] text-[#5B8E72]">
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
                                        className="flex items-center justify-between px-3.5 py-2.5 text-[13px] font-medium text-[#8FBEA4] rounded-[12px] border border-transparent hover:bg-[#19452B] hover:text-white transition-colors cursor-default select-none"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <Icon className="w-[17px] h-[17px] text-[#68A887] shrink-0" />
                                            <span className="truncate">{item.label}</span>
                                        </div>
                                        {item.liveDot && (
                                            <span className="h-2 w-2 rounded-full bg-[#82F5C1] shrink-0" />
                                        )}
                                    </div>
                                );
                            }

                            return (
                                <Link
                                    key={iIdx}
                                    href={route(item.route, item.routeParams ?? {})}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center justify-between px-3.5 py-2.5 text-[13px] rounded-[12px] border transition-all duration-150 ${
                                        active
                                            ? 'bg-[#1A4B30] border-[#2D7A50] text-white font-bold shadow-2xs'
                                            : 'border-transparent text-[#8FBEA4] font-medium hover:bg-[#19452B] hover:text-white'
                                    }`}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <Icon
                                            className={`w-[17px] h-[17px] shrink-0 ${
                                                active ? 'text-[#5CE1A6]' : 'text-[#68A887]'
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

    const renderSidebarContent = () => (
        <div className="flex h-full flex-col justify-between bg-[#143823] text-white">
            <div className="flex flex-col flex-1 min-h-0">
                {/* Brand Header: SISADA SMPN 2 Soreang */}
                <div className="px-5 pt-5 pb-4">
                    <Link href={route('dashboard')} className="flex items-center gap-3.5">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-white shadow-sm">
                            <IconSchoolCrest className="w-7 h-7" />
                        </div>
                        <div className="min-w-0">
                            <div className="text-[18px] font-extrabold tracking-tight text-white leading-tight">
                                SISADA
                            </div>
                            <div className="text-[12px] font-medium text-[#75A88B] truncate">
                                SMPN 2 Soreang
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Tahun Ajaran Active Card */}
                <div className="mx-4 mb-4 rounded-[16px] border border-[#24553A] bg-[#18432A] px-3.5 py-2.5 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                        <div className="text-[9.5px] font-bold uppercase tracking-wider text-[#75A88B]">
                            TAHUN AJARAN
                        </div>
                        <div className="text-[12.5px] font-bold text-white truncate mt-0.5">
                            {tahunAjaranAktif
                                ? `${tahunAjaranAktif.nama} ${tahunAjaranAktif.semester}`
                                : '2024/2025 Genap'}
                        </div>
                    </div>
                    <span className="inline-flex items-center rounded-full border border-[#3E8E63] bg-[#143823] px-2.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-[#6EE7B7] shrink-0">
                        AKTIF
                    </span>
                </div>

                {renderNavItems()}
            </div>

            {/* Bottom Logout Footer: Keluar Sesi */}
            <div className="border-t border-[#24553A] px-4 py-3.5 bg-[#143823]">
                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="w-full flex items-center justify-center gap-2.5 rounded-[12px] py-2.5 px-3 text-[13px] font-semibold text-[#F43F5E] hover:bg-rose-500/10 hover:text-rose-400 transition"
                >
                    <IconPower className="w-4 h-4" />
                    <span>Keluar Sesi</span>
                </Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F4F7F6] text-[#111C2D] flex font-sans">
            {/* Desktop Fixed Dark Green Sidebar */}
            <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:z-30 bg-[#143823] border-r border-[#002114]">
                {renderSidebarContent()}
            </aside>

            {/* Mobile Sidebar Drawer */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div
                        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
                        onClick={() => setSidebarOpen(false)}
                    />
                    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-[#143823] shadow-2xl border-r border-[#002114] flex flex-col">
                        <div className="absolute right-3 top-3.5 z-10">
                            <button
                                type="button"
                                onClick={() => setSidebarOpen(false)}
                                className="rounded-lg p-1.5 text-[#8FBEA4] hover:bg-[#19452B] hover:text-white"
                                aria-label="Tutup menu navigasi"
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
                {/* Top Header Bar (Exact Match to Figma Header Admin & Header) */}
                <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-[#E2E8F0] bg-[#EEF1F4] px-4 sm:px-6 lg:px-7">
                    {/* Left Greeting + Mobile Hamburger */}
                    <div className="flex items-center gap-2.5 shrink-0">
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(true)}
                            className="rounded-xl p-2 text-[#111C2D] hover:bg-white/70 lg:hidden"
                            aria-label="Buka menu navigasi"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        <div className="flex items-center gap-2">
                            <IconWavingHand className="w-5 h-5 text-[#006C4A] shrink-0" />
                            <span className="text-xs sm:text-[14px] font-bold tracking-tight text-[#111C2D] truncate max-w-[160px] sm:max-w-[240px]">
                                Selamat datang, {welcomeRoleLabel}!
                            </span>
                        </div>
                    </div>

                    {/* Center Search Bar */}
                    <form onSubmit={handleTopSearchSubmit} className="hidden md:block flex-1 max-w-[420px] mx-2">
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
                                placeholder="Cari NISN, NIP, Kelas, Mapel..."
                                className="w-full rounded-[10px] border border-white bg-white py-2 pl-9 pr-16 text-xs text-[#111C2D] placeholder:text-slate-400 shadow-2xs focus:border-[#006C4A] focus:ring-[#006C4A]"
                            />
                            <span className="absolute right-2.5 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-500 shadow-2xs">
                                Ctrl+K
                            </span>
                        </div>
                    </form>

                    {/* Right Utility Icons & User Profile Dropdown */}
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <div className="flex items-center gap-1.5">
                            <Link
                                href={route('profile.edit')}
                                title="Bantuan & Panduan"
                                aria-label="Bantuan & Panduan"
                                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-600 hover:bg-white hover:text-[#111C2D] transition"
                            >
                                <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                                </svg>
                            </Link>

                            <button
                                type="button"
                                title="Notifikasi Sistem"
                                aria-label="Notifikasi Sistem"
                                className="relative flex h-8 w-8 items-center justify-center rounded-full text-slate-600 hover:bg-white hover:text-[#111C2D] transition"
                            >
                                <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                                </svg>
                                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#C41E1E] ring-2 ring-[#EEF1F4]" />
                            </button>
                        </div>

                        <span className="hidden sm:block h-6 w-px bg-slate-300" />

                        {/* User Profile Dropdown */}
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button
                                    type="button"
                                    className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2 hover:bg-white/70 transition text-left"
                                >
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#143823] text-white shadow-2xs">
                                        <IconPortraitBadge className="w-4 h-4 text-[#82F5C1]" />
                                    </div>
                                    <span className="hidden sm:block text-xs sm:text-[13px] font-bold text-[#111C2D] max-w-[160px] truncate">
                                        {user.nama}
                                    </span>
                                    <svg
                                        className="w-3.5 h-3.5 text-slate-500 shrink-0"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="2"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                    </svg>
                                </button>
                            </Dropdown.Trigger>
                            <Dropdown.Content>
                                <div className="px-4 py-2.5 border-b border-slate-100 text-xs">
                                    <p className="font-bold text-slate-800">{user.nama}</p>
                                    <p className="text-[11px] font-medium text-[#006C4A]">{roleSubtitle}</p>
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
                                    Keluar Sesi
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
