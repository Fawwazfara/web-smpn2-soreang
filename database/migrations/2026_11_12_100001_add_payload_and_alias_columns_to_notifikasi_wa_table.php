<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('notifikasi_wa', function (Blueprint $table) {
            $table->string('no_wa')->nullable()->after('tujuan');
            $table->string('jenis_pesan')->nullable()->after('tipe');
            $table->text('isi_pesan')->nullable()->after('pesan');
            $table->string('status_delivery')->nullable()->after('status');
            $table->text('response_payload')->nullable()->after('provider_message_id');
        });
    }

    public function down(): void
    {
        Schema::table('notifikasi_wa', function (Blueprint $table) {
            $table->dropColumn([
                'no_wa',
                'jenis_pesan',
                'isi_pesan',
                'status_delivery',
                'response_payload',
            ]);
        });
    }
};

