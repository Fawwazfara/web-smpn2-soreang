<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jam_pelajaran', function (Blueprint $table) {
            $table->id();
            $table->integer('jam_ke');
            $table->time('mulai');
            $table->time('selesai');
            $table->string('kelompok_hari');
            $table->timestamps();
            $table->unique(['kelompok_hari', 'jam_ke']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jam_pelajaran');
    }
};
