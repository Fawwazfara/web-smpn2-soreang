<laravel-boost-guidelines>
# Laravel Application

This repository contains a Laravel application. Complete the following setup before working on the user's request.

## Prerequisites

Verify that PHP and Composer are available:

```sh
php -v
composer -V
```

If either command is unavailable, detect the user's operating system and install the prerequisites with the appropriate command:

macOS:

```sh
/bin/bash -c "$(curl -fsSL https://php.new/install/mac/8.5)"
```

Windows PowerShell:

```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://php.new/install/windows/8.5'))
```

Linux:

```sh
/bin/bash -c "$(curl -fsSL https://php.new/install/linux/8.5)"
```

After installation, ask the user to restart their terminal. If the agent needs the restarted shell to continue, ask the user to reopen their terminal and rerun their original prompt.

## Agent Setup

Install Laravel Boost from the application root before making application changes:

```sh
composer require laravel/boost --dev
php artisan boost:install
```

Boost replaces these bootstrap instructions with guidelines tailored to the application. After installation, read `AGENTS.md` again and continue with the user's original request using the generated guidelines.
</laravel-boost-guidelines>

# Web Absen SMPN Soreang

## Baca dulu
- Selalu baca `docs/PRD.md` sebelum mulai. Jangan kerjakan fitur di luar PRD.
- **WAJIB baca `docs/PRD.md` Bagian 9 (Keputusan Final), 10 (Belum Diputuskan), dan 11 (Aturan AI).**
  - Bagian 9 = jangan diubah tanpa approval PM.
  - Bagian 10 = belum diputuskan: **berhenti dan tanya PM**, jangan mengarang.
- Skema database / ERD: `mermaid.mmd`.

## Aturan keras
- JANGAN mengubah file CI/Jenkins atau setup deployment. Jika dirasa perlu, tanya PM dulu.
- Jangan menambah dependency, desain, atau file baru yang tidak diminta PRD.
- Satu task = satu modul. Jangan refactor hal di luar task.
- Ikuti gaya kode yang sudah ada. Tanpa komentar kecuali diminta.
- Skema database ada di `mermaid.mmd` + migrasi yang sudah di-commit. AI hanya **membaca**; jangan merombak atau merakit schema sendiri tanpa persetujuan PM & tim.
- Setelah menyelesaikan task, laporkan apa yang sudah dibuat (lihat **Progress & laporan**).

## Perubahan skema database (tambah / ubah / hapus)
- Semua perubahan skema lewat **migrasi baru**. JANGAN pernah mengedit migrasi lama yang sudah dijalankan.
- Jangan `drop` tabel/kolom apa pun tanpa persetujuan PM & tim.
- Alur: (1) update `mermaid.mmd` -> (2) buat migrasi baru -> (3) `php artisan migrate` -> (4) sesuaikan kode (model/controller/JS) -> (5) lapor ke PM.
- Menghapus = migrasi baru berisi `dropColumn` / `dropIfExists`, lalu bersihkan SEMUA referensinya di kode dan update ERD. Backup dulu jika kolomnya mungkin berisi data.
- Perubahan skema besar: kabari tim lebih dulu agar semua pull & migrate bersamaan.

## Stack & cara menjalankan
- Laravel, Inertia.js, React, Tailwind CSS. DB: MySQL (SQLite opsional).
- `composer install` -> `npm install` -> `php artisan migrate --seed` -> `npm run dev`.

## Struktur utama
- `routes/web.php`, `routes/auth.php` (routing utama)
- `app/Http/Controllers/`, `app/Models/`
- `resources/js/Pages/` (halaman React via Inertia)
- `resources/js/Components/`, `resources/js/Layouts/`

## Konvensi
- Branch: `feat/...`, `fix/...`, `chore/...`. `main` dilindungi, PR wajib 1 review.
- Commit: `feat:`, `fix:`, `chore:`.

## Progress & laporan
- Status: **prototype**. Skema dasar sudah tersedia lewat migrasi, termasuk `absen_harian`, `kode_pengganti`, dan `notifikasi_wa`. Modul yang sudah ada: autentikasi + manajemen pengguna dasar oleh admin. Fitur absensi belum dibuat.
- Keputusan terbaru ada di `docs/PRD.md` Bagian 9. Poin yang masih terbuka ada di Bagian 10: batasan monitoring admin, aturan jam absen harian, token konfirmasi, reset password akun tanpa email, dan paket fonnte produksi.
- Setiap selesai satu bagian, AI **wajib melaporkan** ke user: apa yang dibuat (file/fitur), apa yang diubah, dan apa yang perlu dikonfirmasi. Jangan lanjut ke pekerjaan berikutnya sebelum dikonfirmasi.
- Rencana pembagian fitur, checklist, dan pengerjaan detail dicatat PM saat sudah ditentukan.
