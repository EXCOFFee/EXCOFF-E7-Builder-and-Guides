<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Las estrellas de 1 a 5 por build nunca llegaron a la web (el componente no se usaba) y en
 * producción la tabla build_ratings ya no existía. Se quitan tabla y columnas; la nota por
 * modo que vota la comunidad las reemplaza.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('build_ratings');

        $columns = array_values(array_filter(
            ['avg_rating', 'rating_count'],
            fn (string $column) => Schema::hasColumn('user_builds', $column)
        ));

        if ($columns) {
            Schema::table('user_builds', fn (Blueprint $table) => $table->dropColumn($columns));
        }
    }

    public function down(): void
    {
        Schema::table('user_builds', function (Blueprint $table) {
            $table->decimal('avg_rating', 3, 2)->default(0);
            $table->unsignedInteger('rating_count')->default(0);
        });

        Schema::create('build_ratings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('build_id')->constrained('user_builds')->onDelete('cascade');
            $table->tinyInteger('rating');
            $table->timestamps();
            $table->unique(['user_id', 'build_id']);
        });
    }
};
