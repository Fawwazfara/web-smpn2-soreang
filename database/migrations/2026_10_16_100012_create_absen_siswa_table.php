<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('absen_siswa', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sesi_id')->constrained('sesi')->cascadeOnDelete();
            $table->foreignId('siswa_id')->constrained('siswa')->cascadeOnDelete();
            $table->string('status');
            $table->string('catatan')->nullable();
            $table->string('bukti_path')->nullable();
            $table->foreignId('dicatat_oleh')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('waktu');
            $table->timestamps();
            $table->unique(['sesi_id', 'siswa_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('absen_siswa');
    }
};
