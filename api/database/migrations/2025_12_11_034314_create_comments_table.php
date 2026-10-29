<?php

use Illuminate\Database\Migrations\Migration;

/**
 * Reemplazada por 2025_12_14_025000_create_comments_table (agrega build_id, is_anonymous
 * y guide_id nullable). Se deja vacía en vez de borrarla porque prod ya la tiene registrada;
 * si creara la tabla, la migración del 12/14 fallaría en instalaciones nuevas.
 */
return new class extends Migration {
    public function up(): void
    {
        //
    }

    public function down(): void
    {
        //
    }
};
