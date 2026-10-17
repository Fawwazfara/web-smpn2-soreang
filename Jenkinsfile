// ============================================================================
//  Jenkinsfile - Pipeline CI (Continuous Integration)
//  Proyek : Web Absen SMPN 2 Soreang (Laravel + Inertia + React)
//  ---------------------------------------------------------------------------
//  !! FILE INI DIKELOLA OLEH PM. JANGAN DIUBAH / DIHAPUS TANPA IZIN PM. !!
//  Semua perubahan pada file ini harus lewat persetujuan PM (lihat AGENTS.md).
//  Jika ada yang dirasa perlu diubah, tanyakan PM terlebih dahulu.
//
//  Yang dijalankan tiap push / pull request ke semua branch:
//    1. composer install
//    2. build frontend (vite)
//    3. jalankan test (phpunit)
//  TIDAK ada tahap deploy di sini (fokus CI saja).
// ============================================================================

@Library('shared-library@main') _

appPipeline(
    type: 'laravel',
    agent: 'docker',
    laravel: [
        withNode: true,                 // build asset Vite supaya test Inertia lolos
        lint    : [ enabled: false ]    // setelah kode dirapikan, pakai: [ enabled: true, args: '--test' ]
    ],
    skipDocker: true                    // CI saja: tidak build/push image Docker
)


