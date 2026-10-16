<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('absen_guru', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sesi_id')->constrained('sesi')->cascadeOnDelete();
            $table->foreignId('guru_id')->constrained('users')->cascadeOnDelete();
            $table->dateTime('waktu');
            $table->dateTime('waktu_ambil')->nullable();
            $table->string('foto_path')->nullable();
            $table->string('sumber')->default('live');
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->string('status')->default('tepat waktu');
            $table->string('catatan')->nullable();
            $table->foreignId('diverifikasi_oleh')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->unique(['sesi_id', 'guru_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('absen_guru');
    }
};
