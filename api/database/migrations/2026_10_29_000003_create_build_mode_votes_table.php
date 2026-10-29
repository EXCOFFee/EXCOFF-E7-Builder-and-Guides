<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Nota por modo (PvE, Arena, GW, RTA) que vota la comunidad en cada build: un voto por
 * usuario, build y modo (D=1 … S=5). En user_builds queda el promedio y la cantidad por
 * modo para no recalcular en cada lectura.
 */
return new class extends Migration
{
    private const MODES = ['pve', 'arena', 'gw', 'rta'];

    public function up(): void
    {
        Schema::create('build_mode_votes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('build_id')->constrained('user_builds')->cascadeOnDelete();
            $table->string('mode', 10);
            $table->unsignedTinyInteger('tier');
            $table->timestamps();

            $table->unique(['user_id', 'build_id', 'mode']);
            $table->index(['build_id', 'mode']);
        });

        Schema::table('user_builds', function (Blueprint $table) {
            foreach (self::MODES as $mode) {
                $table->decimal("community_{$mode}_avg", 3, 2)->nullable();
                $table->unsignedInteger("community_{$mode}_count")->default(0);
            }
        });
    }

    public function down(): void
    {
        Schema::table('user_builds', function (Blueprint $table) {
            foreach (self::MODES as $mode) {
                $table->dropColumn(["community_{$mode}_avg", "community_{$mode}_count"]);
            }
        });

        Schema::dropIfExists('build_mode_votes');
    }
};
