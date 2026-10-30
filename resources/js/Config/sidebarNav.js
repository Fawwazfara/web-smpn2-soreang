/**
 * Konfigurasi terpusat menu sidebar untuk 4 role SADA SMPN 2 Soreang.
 *
 * Catatan Tim:
 * Setiap fitur baru cukup menambah 1 baris item menu atau mengisi `route: 'nama.route'`
 * pada file ini tanpa perlu mengubah `AuthenticatedLayout.jsx` (menghindari konflik merge).
 *
 * Properti item menu:
 * - label          : Teks menu yang ditampilkan di sidebar
 * - route          : Nama route Laravel/Ziggy (`null` bila fitur belum diaktifkan)
 * - icon           : Kunci ikon SVG (`grid-4`, `layout-split`, `broadcast`, `users-group`, `id-card`, `door-room`, `open-book`, `map-pin`, `checklist`, `doc-fold`, `calendar-grid`, `portrait-badge`, `star`, `key`, `lock`)
 * - routeParams    : (Opsional) Parameter route/query untuk `route(name, params)`
 * - activePattern  : (Opsional) Pola `route().current(...)` khusus penanda menu aktif
 * - exactRoleMatch : (Opsional) Cegah double-highlight jika berbagi route dasar yang sama
 * - liveDot        : (Opsional) Tampilkan indikator titik hijau live di sisi kanan menu
 */
export const SIDEBAR_NAV = {
    admin: [
        {
            title: 'MAIN',
            items: [
                { label: 'Dashboard', route: 'dashboard', icon: 'grid-4' },
                { label: 'Live Monitor Kelas', route: null, icon: 'broadcast', liveDot: true },
            ],
        },
        {
            title: 'MASTER DATA',
            items: [
                { label: 'Data Siswa', route: null, icon: 'users-group' },
                { label: 'Data Guru & Staff', route: 'users.index', icon: 'id-card' },
                { label: 'Kelas & Rombel', route: 'kelas.index', icon: 'door-room' },
                { label: 'Mata Pelajaran', route: null, icon: 'open-book' },
            ],
        },
        {
            title: 'INFORMASI',
            items: [
                { label: 'Berita & Warta', route: 'admin.berita.index', icon: 'doc-fold' },
            ],
        },
        {
            title: 'ATTENDANCE',
            items: [
                { label: 'Presensi Guru (Geofence)', route: null, icon: 'map-pin' },
                { label: 'Presensi Siswa', route: null, icon: 'checklist' },
                { label: 'Rekap & Laporan', route: null, icon: 'doc-fold' },
            ],
        },
        {
            title: 'JADWAL & SESI',
            items: [
                { label: 'Matriks Jadwal KBM', route: null, icon: 'calendar-grid' },
                { label: 'Guru Piket & Pengganti', route: 'users.index', icon: 'portrait-badge', routeParams: { role: 'guru_piket' }, exactRoleMatch: 'guru_piket' },
            ],
        },
    ],
    guru: [
        {
            title: null,
            items: [
                { label: 'Dashboard Guru', route: 'dashboard', icon: 'layout-split' },
                { label: 'Presensi Mandiri', route: null, icon: 'portrait-badge' },
                { label: 'Presensi Siswa / KBM', route: null, icon: 'checklist' },
                { label: 'Jadwal Mengajar', route: null, icon: 'calendar-grid' },
                { label: 'Jurnal Kelas', route: null, icon: 'open-book' },
                { label: 'Nilai & Rapor', route: null, icon: 'star' },
            ],
        },
    ],
    guru_piket: [
        {
            title: null,
            items: [
                { label: 'Dashboard Piket', route: 'dashboard', icon: 'layout-split' },
                { label: 'Buka Sesi Pengganti', route: null, icon: 'key' },
                { label: 'Monitor Kelas Terkunci', route: null, icon: 'lock' },
                { label: 'Presensi Mandiri', route: null, icon: 'portrait-badge' },
                { label: 'Jadwal Piket', route: null, icon: 'calendar-grid' },
                { label: 'Jurnal Kelas', route: null, icon: 'open-book' },
            ],
        },
    ],
    kepsek: [
        {
            title: 'MAIN',
            items: [
                { label: 'Dashboard', route: 'dashboard', icon: 'grid-4' },
                { label: 'Live Monitor Kelas', route: null, icon: 'broadcast', liveDot: true },
            ],
        },
        {
            title: 'INFORMASI',
            items: [
                { label: 'Berita & Warta', route: 'admin.berita.index', icon: 'doc-fold' },
            ],
        },
        {
            title: 'ATTENDANCE',
            items: [
                { label: 'Presensi Guru (Geofence)', route: null, icon: 'map-pin' },
                { label: 'Presensi Siswa', route: null, icon: 'checklist' },
                { label: 'Rekap & Laporan', route: null, icon: 'doc-fold' },
            ],
        },
        {
            title: 'JADWAL & SESI',
            items: [
                { label: 'Matriks Jadwal KBM', route: null, icon: 'calendar-grid' },
                { label: 'Guru Piket & Pengganti', route: null, icon: 'portrait-badge' },
            ],
        },
    ],
};

export function getSidebarNavByRole(role) {
    return SIDEBAR_NAV[role] ?? SIDEBAR_NAV.guru;
}
