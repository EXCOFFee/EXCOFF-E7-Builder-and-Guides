<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Qué builds usan los equipos de cada guía (los equipos viven en guides.teams; esta tabla es su
 * índice): "usada en N guías" en la build y el filtro por héroe de las guías. Al borrar la build
 * o la guía, la fila se va sola.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('guide_team_builds', function (Blueprint $table) {
            $table->foreignId('guide_id')->constrained()->cascadeOnDelete();
            $table->foreignId('build_id')->constrained('user_builds')->cascadeOnDelete();
            $table->foreignId('hero_id')->constrained()->cascadeOnDelete();
            $table->primary(['guide_id', 'build_id']);
            $table->index('build_id');
            $table->index('hero_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('guide_team_builds');
    }
};
