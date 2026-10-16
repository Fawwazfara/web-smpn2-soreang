<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jadwal_versi', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->date('berlaku_mulai');
            $table->date('berlaku_sampai');
            $table->string('status')->default('draf');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jadwal_versi');
    }
};
