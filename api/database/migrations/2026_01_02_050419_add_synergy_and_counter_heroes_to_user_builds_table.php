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
        Schema::table('user_builds', function (Blueprint $table) {
            $table->json('synergy_heroes')->nullable()->after('notes');
            $table->json('counter_heroes')->nullable()->after('synergy_heroes');
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
