# Product Requirements Document (PRD)

## Sistem Absensi & Manajemen Kehadiran Guru - SMPN Soreang

- **Project Manager:** Fawwaz Fadel Rahman
- **Tech Stack:** Laravel, React, Inertia.js, Tailwind CSS

---

## 1. Ringkasan & Tujuan

Sistem pencatatan kehadiran guru dan siswa secara digital di SMPN Soreang untuk meminimalisir kecurangan, menggantikan absensi manual, dan mempermudah rekapitulasi laporan.

---

## 2. Aktor & Fitur Utama (Roles)

### A. Guru

1. **Login:** Menggunakan NIP/NUPTK dan password.
2. **Absen Guru (Live Camera Strict):**
   - Wajib mengambil foto langsung (*live selfie*) via kamera perangkat.
   - **TIDAK BOLEH** ada opsi upload foto dari galeri.
3. **Absen Siswa (Per Sesi Kelas):**
   - Guru mencatat status siswa di kelas: Hadir (H), Sakit (S), Izin (I), Alfa (A).
   - Siswa sakit/izin melampirkan catatan atau bukti konfirmasi.
4. **Lihat Jadwal:** Guru dapat melihat jadwal mengajar harian dan mingguan (mapel, kelas, jam ke-).

### B. Admin / Tata Usaha (TU)

1. **Manajemen Data Master:** CRUD Data Guru, Siswa, Kelas, dan Mata Pelajaran.
2. **Manajemen Jadwal & Sesi:** Mengatur slot jam pelajaran, versi jadwal, guru piket, dan guru pengganti.
3. **Dashboard Monitoring:**
   - Memantau kehadiran guru secara *real-time* di kelas.
   - Rekapitulasi absensi siswa per kelas.
4. **Landing Page CMS:** Input informasi/pengumuman sekolah (judul, deskripsi, gambar).

---

## 3. Batasan Proyek (Out of Scope / *Strict Rules*)

- **Tidak ada fitur payroll/penggajian** di versi pertama ini.
- **Fokus utama:** Ketepatan presensi guru di kelas dengan validasi kamera langsung.
