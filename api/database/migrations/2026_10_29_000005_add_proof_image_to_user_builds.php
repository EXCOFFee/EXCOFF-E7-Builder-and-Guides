<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Captura del juego que el autor sube como prueba de la build (aparte de las imágenes).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_builds', function (Blueprint $table) {
            $table->string('proof_image')->nullable()->after('images');
        });
    }

    public function down(): void
    {
        Schema::table('user_builds', function (Blueprint $table) {
            $table->dropColumn('proof_image');
        });
    }
};
