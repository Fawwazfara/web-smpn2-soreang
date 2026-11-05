<?php

return [
    'timezone' => env('ABSENSI_TIMEZONE', 'Asia/Jakarta'),
    'jam_mulai_masuk' => env('ABSENSI_JAM_MULAI_MASUK', '06:30'),
    'jam_masuk' => env('ABSENSI_JAM_MASUK', '07:00'),
    'toleransi_menit' => (int) env('ABSENSI_TOLERANSI_MENIT', 15),
    'jam_pulang' => env('ABSENSI_JAM_PULANG', '14:30'),
    'max_capture_age_seconds' => (int) env('ABSENSI_MAX_CAPTURE_AGE', 300),
    'face_recognition' => [
        'threshold' => (float) env('ABSENSI_FACE_THRESHOLD', 0.55),
        'descriptor_length' => 128,
    ],
    'sekolah' => [
        'nama' => 'SMPN 2 Soreang',
        'latitude' => -7.02614,
        'longitude' => 107.51928,
        'radius_meter' => 50,
        'titik_acuan' => 'Tiang Bendera Utama Kampus',
        'wifi_ssid' => 'SMPN2_GURU_5G',
    ],
];
