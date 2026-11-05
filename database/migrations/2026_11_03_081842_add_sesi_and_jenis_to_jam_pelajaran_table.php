<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('jam_pelajaran', function (Blueprint $table) {
            $table->enum('sesi', ['pagi', 'siang'])->default('pagi')->after('jam_ke');
            $table->unsignedTinyInteger('hari')->default(1)->after('sesi');
            $table->enum('jenis_kegiatan', ['kbm', 'upacara', 'mengaji', 'dhuha', 'istirahat'])->default('kbm')->after('selesai');
        });

        Schema::table('jam_pelajaran', function (Blueprint $table) {
            $table->dropUnique(['kelompok_hari', 'jam_ke']);
            $table->unique(['sesi', 'hari', 'jam_ke']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('jam_pelajaran', function (Blueprint $table) {
            $table->dropUnique(['sesi', 'hari', 'jam_ke']);
            $table->unique(['kelompok_hari', 'jam_ke']);
            $table->dropColumn(['sesi', 'hari', 'jenis_kegiatan']);
        });
    }
};