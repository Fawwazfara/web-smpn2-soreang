<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('absen_siswa', function (Blueprint $table) {
            $table->string('status_konfirmasi')->default('tidak perlu')->after('waktu');
            $table->string('konfirmasi_token')->nullable()->unique()->after('status_konfirmasi');
            $table->dateTime('token_berlaku_sampai')->nullable()->after('konfirmasi_token');
            $table->dateTime('bukti_diunggah_pada')->nullable()->after('token_berlaku_sampai');
            $table->string('keterangan_konfirmasi')->nullable()->after('bukti_diunggah_pada');
        });
    }

    public function down(): void
    {
        Schema::table('absen_siswa', function (Blueprint $table) {
            $table->dropUnique(['konfirmasi_token']);
            $table->dropColumn([
                'status_konfirmasi',
                'konfirmasi_token',
                'token_berlaku_sampai',
                'bukti_diunggah_pada',
                'keterangan_konfirmasi',
            ]);
        });
    }
};
