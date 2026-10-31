<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * - heroes.game_data_changed_at: cuándo cambiaron por última vez los stats base, los
 *   multiplicadores de skills o la impronta (lo marca data:sync). Las builds anteriores se
 *   avisan como posiblemente desactualizadas.
 * - news.source pasa de enum (youtube, stove) a texto: la web publica sus propias noticias de
 *   balance con source "site".
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('heroes', function (Blueprint $table) {
            $table->timestamp('game_data_changed_at')->nullable();
        });

        Schema::table('news', function (Blueprint $table) {
            $table->string('source', 20)->change();
        });
    }

    public function down(): void
    {
        Schema::table('heroes', function (Blueprint $table) {
            $table->dropColumn('game_data_changed_at');
        });
    }
};
