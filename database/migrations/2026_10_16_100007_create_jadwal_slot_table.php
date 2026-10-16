<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jadwal_slot', function (Blueprint $table) {
            $table->id();
            $table->foreignId('versi_id')->constrained('jadwal_versi')->cascadeOnDelete();
            $table->integer('hari');
            $table->foreignId('jam_pelajaran_id')->constrained('jam_pelajaran')->cascadeOnDelete();
            $table->foreignId('kelas_id')->constrained('kelas')->cascadeOnDelete();
            $table->foreignId('mapel_id')->constrained('mapel')->cascadeOnDelete();
            $table->foreignId('guru_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['versi_id', 'hari', 'jam_pelajaran_id', 'kelas_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jadwal_slot');
    }
};
