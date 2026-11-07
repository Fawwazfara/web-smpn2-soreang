<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->text('face_descriptor')->nullable()->after('aktif');
            $table->dateTime('face_registered_at')->nullable()->after('face_descriptor');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['face_descriptor', 'face_registered_at']);
        });
    }
};
