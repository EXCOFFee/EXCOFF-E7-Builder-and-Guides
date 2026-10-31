<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * La ficha del héroe ahora muestra solo lo que dicen las builds de la web. Se quitan las
 * columnas que llenaban stats:sync (Hero Library de Fribbels, API privada) y stats:recalculate.
 */
return new class extends Migration
{
    private const COLUMNS = ['popular_sets', 'popular_artifacts', 'avg_stats', 'guides_count', 'stats_updated_at'];

    public function up(): void
    {
        $columns = array_values(array_filter(self::COLUMNS, fn (string $c) => Schema::hasColumn('heroes', $c)));

        if ($columns) {
            Schema::table('heroes', fn (Blueprint $table) => $table->dropColumn($columns));
        }
    }

    /** Mismo esquema que 2025_12_11_184840_add_usage_stats_to_heroes_table */
    public function down(): void
    {
        if (Schema::hasColumn('heroes', 'popular_sets')) {
            return;
        }

        Schema::table('heroes', function (Blueprint $table) {
            $table->json('popular_sets')->nullable()->after('skills');
            $table->json('popular_artifacts')->nullable()->after('popular_sets');
            $table->json('avg_stats')->nullable()->after('popular_artifacts');
            $table->integer('guides_count')->default(0)->after('avg_stats');
            $table->timestamp('stats_updated_at')->nullable()->after('guides_count');
        });
    }
};
