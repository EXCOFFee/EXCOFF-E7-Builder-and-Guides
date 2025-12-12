<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Add usage statistics fields to heroes table.
 * These are calculated from community guides.
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::table('heroes', function (Blueprint $table) {
            $table->json('popular_sets')->nullable()->after('skills');       // [{set: "speed", usage: 85}, ...]
            $table->json('popular_artifacts')->nullable()->after('popular_sets'); // [{id: 1, name: "...", usage: 60}, ...]
            $table->json('avg_stats')->nullable()->after('popular_artifacts');    // {atk: 4000, spd: 250, ...}
            $table->integer('guides_count')->default(0)->after('avg_stats');
            $table->timestamp('stats_updated_at')->nullable()->after('guides_count');
        });
    }

    public function down(): void
    {
        Schema::table('heroes', function (Blueprint $table) {
            $table->dropColumn(['popular_sets', 'popular_artifacts', 'avg_stats', 'guides_count', 'stats_updated_at']);
        });
    }
};
