/**
 * Konfigurasi terpusat menu sidebar untuk 4 role SISADA SMPN 2 Soreang.
 *
 * Catatan Tim:
 * Setiap fitur baru cukup menambah 1 baris item menu atau mengisi `route: 'nama.route'`
 * pada file ini tanpa perlu mengubah `AuthenticatedLayout.jsx` (menghindari konflik merge).
 */
export const SIDEBAR_NAV = {
    admin: [
        {
            title: 'DASHBOARD',
            items: [
                { label: 'Dashboard Utama', route: 'dashboard', icon: 'layout-split' },
            ],
        },
        {
            title: 'KESISWAAN & SDM',
            items: [
                { label: 'Master Data Siswa', route: 'admin.siswa.index', icon: 'users-group' },
                { label: 'Manajemen Akun', route: 'users.index', icon: 'user-cog' },
            ],
        },
        {
            title: 'KURIKULUM & KBM',
            items: [
                {
                    label: 'Master Kelas & TA',
                    route: 'kelas.index',
                    icon: 'door-room',
                    activePattern: ['kelas.*', 'tahun-ajaran.*'],
                },
                {
                    label: 'Master Mapel & Jam',
                    route: 'mapel.index',
                    icon: 'open-book',
                    activePattern: ['mapel.*', 'jam-pelajaran.*', 'subjects.*', 'time-slots.*'],
                },
                { label: 'Penjadwalan KBM', route: 'jadwal.index', icon: 'calendar-grid' },
                { label: 'Penugasan Guru Piket', route: 'admin.guru-piket.index', icon: 'portrait-badge' },
            ],
        },
        {
            title: 'PRESENSI & LAPORAN',
            items: [
                { label: 'Monitoring Presensi Guru', route: 'absen-harian.rekap', icon: 'checklist' },
                {
                    label: 'Rekap Absensi Siswa',
                    route: 'admin.rekap-absensi.siswa',
                    icon: 'user-card',
                    activePattern: 'admin.rekap-absensi.*',
                },
                { label: 'Log Notifikasi WA', route: null, icon: 'message-square' },
            ],
        },
        {
            title: 'CMS & INFORMASI',
            items: [
                { label: 'Pengumuman Sekolah', route: 'admin.berita.index', icon: 'megaphone' },
            ],
        },
    ],
    guru: [
        {
            title: 'DASHBOARD',
            items: [
                { label: 'Dashboard Guru', route: 'dashboard', icon: 'layout-split' },
            ],
        },
        {
            title: 'PRESENSI & KBM',
            items: [
                { label: 'Presensi Mandiri', route: 'absen-harian.index', icon: 'portrait-badge' },
                {
                    label: 'Presensi Siswa / KBM',
                    route: 'guru.absen-sesi.index',
                    icon: 'checklist',
                    activePattern: 'guru.absen-sesi.*',
                },
                {
                    label: 'Jadwal Mengajar',
                    route: 'guru.jadwal.index',
                    icon: 'calendar-grid',
                    activePattern: 'guru.jadwal.*',
                },
            ],
        },
    ],
    guru_piket: [
        {
            title: 'DASHBOARD & PIKET',
            items: [
                { label: 'Dashboard Piket', route: 'dashboard', icon: 'layout-split' },
                {
                    label: 'Buka Sesi Pengganti',
                    route: 'guru.absen-sesi.index',
                    icon: 'key',
                    activePattern: 'guru.absen-sesi.*',
                },
                { label: 'Presensi Mandiri', route: 'absen-harian.index', icon: 'portrait-badge' },
                {
                    label: 'Jadwal Mengajar Pribadi',
                    route: 'guru.jadwal.index',
                    icon: 'calendar-grid',
                    activePattern: 'guru.jadwal.*',
                },
            ],
        },
    ],
    kepsek: [
        {
            title: 'MONITORING EKSEKUTIF',
            items: [
                { label: 'Dashboard Monitoring', route: 'dashboard', icon: 'layout-split' },
                { label: 'Monitoring Presensi Guru', route: 'absen-harian.rekap', icon: 'checklist' },
                {
                    label: 'Rekap Absensi Siswa',
                    route: 'kepsek.rekap-absensi.siswa',
                    icon: 'user-card',
                    activePattern: 'kepsek.rekap-absensi.*',
                },
            ],
        },
    ],
};

export function getSidebarNavByRole(role) {
    return SIDEBAR_NAV[role] ?? SIDEBAR_NAV.guru;
}
