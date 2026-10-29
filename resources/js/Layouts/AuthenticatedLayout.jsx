import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

// SVG Icons
function IconDashboard({ className = 'w-5 h-5' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
        </svg>
    );
}

function IconUsers({ className = 'w-5 h-5' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
    );
}

function IconCalendar({ className = 'w-5 h-5' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
    );
}

function IconAcademic({ className = 'w-5 h-5' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-5.25 6.557q0 .034.004.067" />
        </svg>
    );
}

function IconNews({ className = 'w-5 h-5' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
        </svg>
    );
}

function IconCamera({ className = 'w-5 h-5' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
        </svg>
    );
}

function IconKey({ className = 'w-5 h-5' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
        </svg>
    );
}

function IconChart({ className = 'w-5 h-5' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
    );
}

function IconUser({ className = 'w-5 h-5' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.964 0a9 9 0 10-11.964 0m11.964 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    );
}

function IconPhone({ className = 'w-5 h-5' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
        </svg>
    );
}

function IconClipboard({ className = 'w-5 h-5' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
        </svg>
    );
}

function IconLogout({ className = 'w-5 h-5' }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
        </svg>
    );
}

const roleConfigs = {
    admin: {
        name: 'Administrator TU',
        badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
        color: 'blue',
    },
    guru: {
        name: 'Guru Pengajar',
        badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        color: 'emerald',
    },
    guru_piket: {
        name: 'Guru Piket',
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
        color: 'amber',
    },
    kepsek: {
        name: 'Kepala Sekolah (Read-Only)',
        badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
        color: 'purple',
    },
};

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const roleConfig = roleConfigs[user.role] ?? {
        name: user.role,
        badgeClass: 'bg-gray-100 text-gray-800 border-gray-200',
    };

    // Sidebar navigation per role
    const getNavGroups = () => {
        if (user.role === 'admin') {
            return [
                {
                    title: 'Menu Utama',
                    items: [
                        { label: 'Dashboard', route: 'dashboard', icon: IconDashboard },
                    ],
                },
                {
                    title: 'Data Master',
                    items: [
                        { label: 'Manajemen Akun', route: 'users.index', icon: IconUsers },
                        { label: 'Tahun Ajaran', route: 'tahun-ajaran.index', icon: IconCalendar },
                        { label: 'Data Kelas', route: 'kelas.index', icon: IconAcademic },
                        { label: 'Berita & Landing CMS', route: 'admin.berita.index', icon: IconNews },
                    ],
                },
                {
                    title: 'Pengaturan Akun',
                    items: [
                        { label: 'Profil Saya', route: 'profile.edit', icon: IconUser },
                    ],
                },
            ];
        }

        if (user.role === 'guru') {
            return [
                {
                    title: 'Menu Guru',
                    items: [
                        { label: 'Dashboard Guru', route: 'dashboard', icon: IconDashboard },
                    ],
                },
                {
                    title: 'Aktivitas Mengajar',
                    items: [
                        { label: 'Absen Harian (Selfie)', route: null, icon: IconCamera, badge: 'Segera' },
                        { label: 'Jadwal Mengajar', route: null, icon: IconCalendar, badge: 'Segera' },
                        { label: 'Presensi Siswa', route: null, icon: IconClipboard, badge: 'Segera' },
                    ],
                },
                {
                    title: 'Pengaturan Akun',
                    items: [
                        { label: 'Profil Saya', route: 'profile.edit', icon: IconUser },
                    ],
                },
            ];
        }

        if (user.role === 'guru_piket') {
            return [
                {
                    title: 'Menu Piket',
                    items: [
                        { label: 'Dashboard Piket', route: 'dashboard', icon: IconDashboard },
                    ],
                },
                {
                    title: 'Aktivitas Piket',
                    items: [
                        { label: 'Buka Sesi Pengganti', route: null, icon: IconKey, badge: 'Segera' },
                        { label: 'Jadwal Piket', route: null, icon: IconCalendar, badge: 'Segera' },
                        { label: 'Absen Harian', route: null, icon: IconCamera, badge: 'Segera' },
                    ],
                },
                {
                    title: 'Pengaturan Akun',
                    items: [
                        { label: 'Profil Saya', route: 'profile.edit', icon: IconUser },
                    ],
                },
            ];
        }

        // Kepsek
        return [
            {
                title: 'Monitoring',
                items: [
                    { label: 'Dashboard Monitoring', route: 'dashboard', icon: IconDashboard },
                ],
            },
            {
                title: 'Laporan & Pemantauan',
                items: [
                    { label: 'Monitoring Guru & Kelas', route: null, icon: IconChart, badge: 'Read-Only' },
                    { label: 'Rekapitulasi Absensi', route: null, icon: IconClipboard, badge: 'Read-Only' },
                ],
            },
            {
                title: 'Pengaturan Akun',
                items: [
                    { label: 'Profil Saya', route: 'profile.edit', icon: IconUser },
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
        return route().current(`${itemRoute.split('.')[0]}.*`);
    };

    const renderNavContent = () => (
        <div className="flex h-full flex-col justify-between">
            {/* Header / Brand */}
            <div>
                <div className="flex items-center gap-3 border-b border-slate-700/60 px-5 py-4">
                    <Link href="/" className="flex items-center gap-2.5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold text-lg shadow-md">
                            S
                        </div>
                        <div>
                            <div className="font-bold tracking-tight text-white leading-none text-base">
                                SADA
                            </div>
                            <div className="text-[11px] text-slate-400 font-medium tracking-wide">
                                SMPN 2 Soreang
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Role Pill */}
                <div className="px-5 py-3 border-b border-slate-700/40 bg-slate-900/40">
                    <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                        Aktor / Role
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${roleConfig.badgeClass}`}>
                            {roleConfig.name}
                        </span>
                    </div>
                </div>

                {/* Nav Links */}
                <nav className="space-y-6 px-3 py-4">
                    {navGroups.map((group, gIdx) => (
                        <div key={gIdx}>
                            <div className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                {group.title}
                            </div>
                            <div className="mt-2 space-y-1">
                                {group.items.map((item, iIdx) => {
                                    const active = isRouteActive(item.route);
                                    const Icon = item.icon;

                                    if (!item.route) {
                                        return (
                                            <div
                                                key={iIdx}
                                                className="flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-400 rounded-lg cursor-not-allowed opacity-75 hover:bg-slate-800/40"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Icon className="w-4 h-4 text-slate-400" />
                                                    <span>{item.label}</span>
                                                </div>
                                                {item.badge && (
                                                    <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
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
                                            className={`flex items-center justify-between px-3 py-2.5 text-xs font-medium rounded-lg transition-colors duration-150 ${
                                                active
                                                    ? 'bg-blue-600 text-white shadow-sm'
                                                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Icon
                                                    className={`w-4 h-4 ${
                                                        active ? 'text-white' : 'text-slate-400'
                                                    }`}
                                                />
                                                <span>{item.label}</span>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>
            </div>

            {/* Sidebar User Footer */}
            <div className="border-t border-slate-700/60 p-4 bg-slate-900/60">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-700 text-white font-semibold text-xs border border-slate-600">
                            {user.nama?.charAt(0)?.toUpperCase() ?? 'U'}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold text-white">
                                {user.nama}
                            </p>
                            <p className="truncate text-[11px] text-slate-400">
                                {user.username}
                            </p>
                        </div>
                    </div>
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-red-400 transition"
                        title="Keluar"
                    >
                        <IconLogout className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:z-30 bg-slate-900 text-slate-100 shadow-xl border-r border-slate-800">
                {renderNavContent()}
            </aside>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div
                        className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm transition-opacity"
                        onClick={() => setSidebarOpen(false)}
                    />
                    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 shadow-2xl flex flex-col">
                        <div className="absolute right-3 top-3">
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        {renderNavContent()}
                    </div>
                </div>
            )}

            {/* Main Area */}
            <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
                {/* Topbar */}
                <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white/95 backdrop-blur px-4 sm:px-6 lg:px-8 shadow-xs">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(true)}
                            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        <div className="hidden sm:block">
                            <span className="text-xs font-medium text-slate-500">
                                Sistem Absensi & Manajemen Kehadiran Digital (SADA)
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Role indicator pill in topbar */}
                        <span className={`hidden md:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${roleConfig.badgeClass}`}>
                            {roleConfig.name}
                        </span>

                        {/* User Dropdown */}
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-[11px] font-bold">
                                        {user.nama?.charAt(0)?.toUpperCase() ?? 'U'}
                                    </div>
                                    <span className="max-w-[120px] truncate sm:max-w-none">{user.nama}</span>
                                    <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </Dropdown.Trigger>
                            <Dropdown.Content>
                                <div className="px-4 py-2 border-b border-slate-100 text-xs">
                                    <p className="font-semibold text-slate-800">{user.nama}</p>
                                    <p className="text-slate-500">{user.username}</p>
                                </div>
                                <Dropdown.Link href={route('profile.edit')}>
                                    Profil & Password
                                </Dropdown.Link>
                                <Dropdown.Link href={route('logout')} method="post" as="button" className="text-red-600">
                                    Keluar
                                </Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                </header>

                {/* Optional Header Banner */}
                {header && (
                    <div className="bg-white border-b border-slate-200/80 px-4 py-4 sm:px-6 lg:px-8">
                        {header}
                    </div>
                )}

                {/* Page Content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
