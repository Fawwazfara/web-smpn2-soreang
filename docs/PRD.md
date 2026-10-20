# Product Requirements Document (PRD)

## Sistem Absensi & Manajemen Kehadiran - SMPN Soreang

- **Project Manager:** Fawwaz Fadel Rahman
- **Tech Stack:** Laravel, React, Inertia.js, Tailwind CSS

---

## 1. Ringkasan & Tujuan

Sistem pencatatan kehadiran guru dan siswa secara digital di SMPN Soreang untuk meminimalisir kecurangan, menggantikan absensi manual, dan mempermudah rekapitulasi laporan.

---

## 2. Aktor & Role

Ada **4 role**: `admin`, `guru`, `guru_piket`, dan `kepsek`. Role `guru` punya kolom `jenis_pegawai` (`guru` / `tenaga_kependidikan`).

### A. Admin / Tata Usaha (TU)

1. **Akun terpisah:** akun admin berdiri sendiri, bukan menyatu dengan akun guru. Satu orang boleh punya **2 akun** (akun guru untuk mengajar, akun admin untuk tugas administrasi).
2. **Tidak wajib absen:** admin dikecualikan dari kewajiban absen harian.
3. **Manajemen Data Master:** CRUD Data Guru, Siswa, Kelas, dan Mata Pelajaran.
4. **Manajemen Jadwal Mengajar:** mengatur slot jam pelajaran, versi jadwal, kelas, mapel, dan guru pengampu.
5. **Manajemen Jadwal Guru Piket:** mengatur **penugasan piket** (guru piket mana pada hari apa) dan jumlahnya.
6. **Dashboard Monitoring (terbatas):**
   - Monitoring seperlunya saja; **monitoring menyeluruh dialihkan ke role Kepsek**.
   - Rekapitulasi absensi siswa per kelas.
7. **Landing Page CMS:** input informasi/pengumuman sekolah (judul, deskripsi, gambar).
8. **Manajemen Akun Pengguna:** membuat & mengelola akun `guru`, `guru_piket`, dan `kepsek` (buat, ubah, hapus). Admin **tidak** membuat akun `admin` baru; admin pertama dibuat via seeder.

### B. Guru

1. **Role:** `guru`, dengan `jenis_pegawai` = `guru` atau `tenaga_kependidikan`. Tenaga kependidikan juga wajib absen (permintaan pihak sekolah).
2. **Login:** Menggunakan NIP/NUPTK dan password.
3. **Absen Harian (Live Camera Strict):**
   - Absen dilakukan **setiap hari kerja**.
   - Wajib *live selfie* via kamera perangkat.
   - **TIDAK BOLEH** ada opsi upload foto dari galeri.
4. **Absen Siswa (Per Sesi Kelas):**
   - Guru mencatat status siswa di kelas: Hadir (H), Sakit (S), Izin (I), Alfa (A).
5. **Lihat Jadwal:** jadwal mengajar harian dan mingguan (mapel, kelas, jam ke-).
6. **Bila tidak bisa hadir:** berkoordinasi manual ke guru piket (lihat Bagian 3), lalu generate kode unik bila disetujui.

### C. Guru Piket

1. **Role tersendiri:** `guru_piket`. Jadwal piket diatur admin (hari tertentu, tidak semua hari; jumlah orang diatur admin).
2. **Dashboard Piket:** semua kelas tampil sebagai kotak/section dengan status **terkunci (locked)**.
3. **Membuka absen sesi:** untuk mengabsen suatu sesi kelas, guru piket **wajib memasukkan kode unik** dari guru yang digantikan.
   - Kode hanya berlaku untuk **sesi itu saja** (kelas + jam pelajaran + tanggal); tidak bisa dipakai membuka sesi/kelas lain.
   - Kode punya **masa kadaluarsa**.
   - Sebelum kode valid diinput, status sesi **terkunci**; setelah kode valid, status sesi terbuka dan guru piket dapat mengabsen sebagai **guru pengganti**.

### D. Kepala Sekolah (Kepsek)

1. **Role tersendiri:** `kepsek`, bersifat **read-only** (hanya melihat, tidak bisa mengubah data maupun mengabsen).
2. **Monitoring menyeluruh:** dashboard kepsek menampilkan pemantauan **semua guru dan kelas** secara menyeluruh (real-time), rekapitulasi absensi, dan laporan.
3. Monitoring menyeluruh inilah yang **dipindahkan dari admin ke kepsek**; admin hanya menyisakan monitoring seperlunya.

---

## 3. Alur Penggantian Absen (Manual + Kode)

Tidak ada trigger otomatis. Alur:

1. Guru tiba-tiba tidak bisa hadir (mis. rapat mendadak).
2. Guru melihat **daftar guru piket hari tersebut** di halaman guru, lalu klik tombol **"Hubungi"** → langsung membuka chat WhatsApp guru piket lewat `https://wa.me/<no_wa>` (tanpa perlu mencari kontak manual / keluar aplikasi web lebih dulu). Nomor WA diambil dari akun guru piket, jadi **`no_wa` wajib diisi saat admin membuat akun `guru_piket`**.
3. Bila guru piket bersedia, guru **generate kode unik 6 digit numerik** untuk sesi yang ditinggalkan. Kode berlaku **sejak dibuat sampai jam pelajaran sesi itu selesai**, sekali pakai, dan hanya **guru pemilik sesi** yang boleh generate.
4. Guru mengirim kode unik ke guru piket.
5. Guru piket memasukkan kode → sesi terkait **terbuka** → guru piket mengabsen kelas sebagai guru pengganti.
6. Halaman guru menampilkan status **"sudah digantikan"** (update otomatis via polling berkala).

Catatan: rapat mendadak dihitung **tetap hadir** untuk absen harian; yang dialihkan hanya absen sesi kelasnya.

---

## 4. Absen Siswa & Konfirmasi Orang Tua

1. Status: Hadir (H), Sakit (S), Izin (I), Alfa (A).
2. **Sakit (S) dan Izin (I) wajib melampirkan bukti** yang jelas membuktikan (jenis bebas: foto/dokumen, mis. surat dokter).
3. **Link konfirmasi unik** dikirim ke orang tua/wali saat siswa berstatus S/I:
   - Masa berlaku **1 minggu**, **sekali pakai**.
   - Setelah kadaluarsa, link tidak bisa dibuka lagi dan siswa tidak memiliki bukti/konfirmasi.
   - **Status absen tetap sesuai input guru** walau bukti tidak pernah diunggah.
4. Bukti diunggah oleh orang tua tanpa perlu akun (cukup via link token).

---

## 5. Notifikasi WhatsApp (WA Blast)

1. **Blast WA ke orang tua/wali** untuk siswa berstatus **Alfa (A)**, **Sakit (S)**, dan **Izin (I)**. Blast dikirim **real-time saat guru menandai** status tersebut.
2. Khusus Sakit/Izin, WA berisi **link konfirmasi + permintaan bukti**.
3. **Anti-spam:** maksimal **1 blast per murid per hari**, meski murid ditandai berbeda di beberapa sesi. Blast hanya dikirim pada penandaan pertama; perubahan status setelah blast tidak memicu blast ulang (untuk S/I, token/link konfirmasi diperbarui).
4. **Provider:** **fonnte** (unofficial gateway, harga rupiah). Provider dibungkus lewat interface agar mudah diganti.
5. **Anti-ban:** wajib pasang **delay acak** antar pesan dan batasi laju kirim (jangan kirim puluhan pesan dalam 1 detik — ini penyebab nomor diblokir).
6. Setiap pengiriman dicatat di **log notifikasi**.
7. **Masa development** memakai paket gratis fonnte (**1.000 pesan/bulan**); paket produksi ditentukan menyusul.

---

## 6. Kebijakan Absen Harian

- Semua pegawai (`guru`, `tenaga_kependidikan`, `guru_piket`) wajib absen harian.
- **Admin dan Kepsek dikecualikan** (tidak absen; kepsek read-only).

---

## 7. Batasan Proyek (Out of Scope / *Strict Rules*)

- **Tidak ada fitur payroll/penggajian** di versi pertama ini.
- **Fokus utama:** ketepatan presensi dengan validasi kamera langsung dan validasi kode penggantian.

---

## 8. Catatan Perubahan (Notulensi)

Perubahan hasil notulensi:

1. Blast WA ke orang tua untuk status **Alfa, Sakit, Izin** (S/I + link konfirmasi & bukti).
2. Tenaga kependidikan juga absen via web (`jenis_pegawai`).
3. Guru, tenaga kependidikan, dan guru piket absen **setiap hari**.
4. Penambahan **2 role baru: Guru Piket dan Kepsek**.
5. Guru piket punya jadwal pada **hari tertentu** (tidak semua hari).
6. Penggantian absen **manual via WA + kode unik per sesi**, tanpa trigger otomatis.
7. Sesi piket terkunci sampai kode unik valid dimasukkan.
8. Admin mengatur **jadwal guru piket**, bukan hanya jadwal mengajar.
9. Admin adalah **akun/role terpisah**; 1 orang boleh punya 2 akun; admin tidak absen.
10. **Kepsek = role read-only** dengan monitoring menyeluruh; monitoring menyeluruh dipindah dari admin ke kepsek, admin tinggal monitoring terbatas.
11. **Provider WA final: fonnte**, dengan delay acak + rate limit anti-ban.

---

## 9. KEPUTUSAN FINAL (JANGAN DIUBAH TANPA APPROVAL PM)

Aturan berikut sudah final. AI/developer **tidak boleh** menambah, mengurangi, atau mengubah perilakunya.

1. **Role = 4:** `admin`, `guru`, `guru_piket`, `kepsek`. Tidak ada role lain.
2. **Yang absen harian:** `guru` (termasuk `tenaga_kependidikan`) dan `guru_piket`. **`admin` dan `kepsek` tidak absen.**
3. **Absen guru/pegawai = live camera.** Endpoint hanya menerima hasil capture kamera. **Dilarang** sediakan opsi upload dari galeri.
4. **Absen siswa:** guru mencatat per sesi kelas dengan status **H, S, I, A**.
5. **Guru piket:** jadwal hanya pada hari tertentu; di dashboard, semua kelas tampil **terkunci**.
6. **Kode unik penggantian:** per **sesi** (kelas + jam + tanggal), **punya masa kadaluarsa**, dan **tidak bisa** membuka sesi/kelas lain.
7. **Alur penggantian manual:** tidak ada trigger otomatis. Guru → WA guru piket → guru generate kode → piket input kode → sesi terbuka → piket absen sebagai **guru pengganti**.
8. **Rapat mendadak:** tetap dihitung **hadir** untuk absen harian; hanya absen sesi kelas yang dialihkan.
9. **Sakit & Izin wajib bukti**, diunggah orang tua lewat **link token unik** (berlaku **1 minggu**, sekali pakai). Setelah kadaluarsa link mati, tetapi **status absen tetap** sesuai input guru.
10. **Blast WA (fonnte)** hanya untuk status **A, S, I**. Maksimal **1 blast per murid per hari**. Wajib **delay acak + rate limit**. Semua pengiriman **dicatat** di log notifikasi.
11. **Kepsek read-only:** boleh melihat monitoring menyeluruh, **tidak boleh** input/ubah data.
12. **Database:** perubahan skema **hanya** lewat migrasi baru; jangan edit migrasi lama; jangan drop tanpa approval PM. Acuan skema: `mermaid.mmd`.
13. **Login:** satu halaman login memakai **NIP/NUPTK** (`username`) + password; redirect sesuai role.
14. **Tanpa registrasi publik.** Akun tidak dibuat sendiri; **akun dibuat admin**. Admin pertama dibuat via **seeder**.
15. **Hak buat akun:** admin boleh membuat akun `guru`, `guru_piket`, dan `kepsek`; admin **tidak boleh** membuat akun `admin` baru; kepsek (read-only) **tidak boleh** membuat akun apa pun.
16. **`jenis_pegawai`** (`guru` / `tenaga_kependidikan`) wajib untuk akun ber-role `guru`, dikosongkan untuk role lain.
17. **Kode unik penggantian:** **6 digit numerik**, dibuat hanya oleh **guru pemilik sesi**, berlaku **sejak dibuat sampai jam pelajaran sesi tersebut selesai**, dan **sekali pakai**.
18. **Blast WA dikirim real-time** saat guru menandai **A/S/I**, dengan **dedupe 1x per murid per hari**. Perubahan status setelah blast tidak memicu blast ulang; untuk S/I token/link konfirmasi diperbarui.
19. **Kontak guru piket:** akun `guru_piket` **wajib punya `no_wa`**; tombol **"Hubungi"** di halaman guru membuka chat `wa.me`. Tidak ada tipe notifikasi WA `pengganti`.
20. **Password:** `wajib_ganti_password = true` saat akun dibuat atau direset admin. **Lupa password diselesaikan lewat link reset via email**.
21. **Hapus akun = nonaktifkan** (`aktif = false`), bukan hapus permanen.
22. **fonnte masa development:** paket gratis **1.000 pesan/bulan**.

---

## 10. BELUM DIPUTUSKAN — WAJIB TANYA PM (JANGAN DIKARANG)

Untuk poin di bawah ini, AI/developer **harus berhenti dan bertanya ke PM**, **bukan** menebak. Kolom *Usulan* adalah ide (belum mengikat) sampai disetujui.

1. **Batasan monitoring admin (persisnya apa).**
   *Usulan:* kepsek = monitoring menyeluruh (semua guru & kelas real-time + rekap + tren). Admin = operasional saja (data master, jadwal, rekap absensi siswa per kelas, daftar absen hari ini) tanpa dashboard monitoring menyeluruh.
2. **Aturan jam absen harian (tepat waktu/terlambat, jam pulang).**
   *Usulan:* satu absen masuk/hari; admin mengatur jam masuk + toleransi (mis. 07:00 + 15 menit) → status tepat waktu/terlambat. **Jam pulang belum ada** di v1.
3. **Token konfirmasi: 1 token per sesi atau per murid harian?**
   *Usulan:* 1 token per (murid, tanggal); dipakai ulang bila murid S/I lagi hari itu; route publik `GET/POST /konfirmasi/{token}`.
4. **Reset password untuk akun tanpa email.** Email bersifat opsional (login memakai NIP/NUPTK). Keputusan saat ini: reset lewat link email. Perlu dipastikan apakah akun tanpa email wajib diisi emailnya atau direset manual oleh admin.
5. **Paket fonnte untuk produksi** (masa development memakai paket gratis 1.000 pesan/bulan). Dicek di dashboard fonnte sebelum go-live.

---

## 11. ATURAN UNTUK AI / DEVELOPER (ANTI-HALUSINASI)

1. **PRD ini adalah sumber kebenaran tunggal.** Bila ada pertanyaan, ikuti PRD, bukan asumsi.
2. **Jangan** menambah fitur, halaman, endpoint, tabel, atau dependency di luar PRD.
3. **Jangan** mengubah/menghapus fungsi pada Bagian 9 (Keputusan Final).
4. Bila menemui hal yang belum ada di PRD (terutama Bagian 10), **berhenti dan tanya PM**; jangan mengarang aturan.
5. Satu task = satu modul. Setelah selesai, **lapor** dan **tunggu konfirmasi** sebelum lanjut (lihat `AGENTS.md`).

