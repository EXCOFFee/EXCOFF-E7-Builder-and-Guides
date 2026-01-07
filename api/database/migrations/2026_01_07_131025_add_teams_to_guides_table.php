<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Add teams column for storing team compositions
     * Format: [{ name: string, heroes: [{ hero_id, sets, artifact_id, stats, note }] }]
     */
    public function up(): void
    {
        Schema::table('guides', function (Blueprint $table) {
            $table->json('teams')->nullable()->after('counters');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('guides', function (Blueprint $table) {
            $table->dropColumn('teams');
        });
    }
};
