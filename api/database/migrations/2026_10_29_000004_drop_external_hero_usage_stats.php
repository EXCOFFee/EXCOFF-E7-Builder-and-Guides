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

    public function down(): void
    {
        Schema::table('heroes', function (Blueprint $table) {
            $table->json('popular_sets')->nullable();
            $table->json('popular_artifacts')->nullable();
            $table->json('avg_stats')->nullable();
            $table->unsignedInteger('guides_count')->default(0);
            $table->timestamp('stats_updated_at')->nullable();
        });
    }
};
