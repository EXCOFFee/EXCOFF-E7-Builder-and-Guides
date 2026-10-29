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
        // create_user_builds_table ya define estas columnas en instalaciones nuevas
        if (Schema::hasColumn('user_builds', 'synergy_heroes')) {
            return;
        }

        Schema::table('user_builds', function (Blueprint $table) {
            $table->json('synergy_heroes')->nullable();
            $table->json('counter_heroes')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_builds', function (Blueprint $table) {
            $table->dropColumn(['synergy_heroes', 'counter_heroes']);
        });
    }
};
