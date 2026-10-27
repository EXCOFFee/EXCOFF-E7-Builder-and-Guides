<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Agrega heroes.self_devotion en instalaciones nuevas (tests, CI, servidor nuevo).
 *
 * 2024_12_16_120000_add_self_devotion_to_heroes_table corre antes de create_heroes_table
 * por su fecha. En prod la columna ya existe, así que esta migración no hace nada.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('heroes', 'self_devotion')) {
            return;
        }

        Schema::table('heroes', function (Blueprint $table) {
            $table->json('self_devotion')->nullable()->after('skills');
        });
    }

    public function down(): void
    {
        // La columna la revierte 2024_12_16_120000_add_self_devotion_to_heroes_table
    }
};
