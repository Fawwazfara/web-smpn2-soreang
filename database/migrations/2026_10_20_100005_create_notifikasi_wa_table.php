<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifikasi_wa', function (Blueprint $table) {
            $table->id();
            $table->foreignId('siswa_id')->nullable()->constrained('siswa')->nullOnDelete();
            $table->foreignId('absen_siswa_id')->nullable()->constrained('absen_siswa')->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('tujuan');
            $table->string('tipe');
            $table->text('pesan');
            $table->string('status')->default('antrian');
            $table->string('provider')->default('fonnte');
            $table->string('provider_message_id')->nullable();
            $table->dateTime('waktu');
            $table->timestamps();

            $table->index(['siswa_id', 'waktu']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifikasi_wa');
    }
};
