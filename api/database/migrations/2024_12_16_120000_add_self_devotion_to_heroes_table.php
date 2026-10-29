<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Esta migración tiene fecha anterior a create_heroes_table, así que en una DB nueva
     * corre antes de que exista la tabla. No se renombra porque prod ya la tiene registrada:
     * aquí se salta y 2025_12_11_034303_ensure_self_devotion_on_heroes_table agrega la columna.
     */
    public function up(): void
    {
        if (!Schema::hasTable('heroes') || Schema::hasColumn('heroes', 'self_devotion')) {
            return;
        }

        Schema::table('heroes', function (Blueprint $table) {
            $table->json('self_devotion')->nullable()->after('skills');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (!Schema::hasTable('heroes') || !Schema::hasColumn('heroes', 'self_devotion')) {
            return;
        }

        Schema::table('heroes', function (Blueprint $table) {
            $table->dropColumn('self_devotion');
        });
    }
};
