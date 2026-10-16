<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sesi', function (Blueprint $table) {
            $table->id();
            $table->date('tanggal');
            $table->foreignId('kelas_id')->constrained('kelas')->cascadeOnDelete();
            $table->foreignId('jam_pelajaran_id')->constrained('jam_pelajaran')->cascadeOnDelete();
            $table->foreignId('mapel_id')->constrained('mapel')->cascadeOnDelete();
            $table->foreignId('guru_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('guru_pengganti_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('slot_id')->nullable()->constrained('jadwal_slot')->nullOnDelete();
            $table->string('status')->default('terjadwal');
            $table->string('alasan')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sesi');
    }
};
