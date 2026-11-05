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
        Schema::table('jadwal_slot', function (Blueprint $table) {
            $table->unsignedTinyInteger('durasi')->default(1)->after('guru_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('jadwal_slot', function (Blueprint $table) {
            $table->dropColumn('durasi');
        });
    }
};
