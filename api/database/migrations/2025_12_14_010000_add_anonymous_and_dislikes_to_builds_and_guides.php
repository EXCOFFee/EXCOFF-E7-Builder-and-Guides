<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('user_builds', function (Blueprint $table) {
            $table->boolean('is_anonymous')->default(false)->after('language');
            $table->integer('dislikes')->default(0)->after('likes');
        });

        Schema::table('guides', function (Blueprint $table) {
            $table->boolean('is_anonymous')->default(false)->after('language');
            $table->integer('dislikes')->default(0)->after('likes');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_builds', function (Blueprint $table) {
            $table->dropColumn(['is_anonymous', 'dislikes']);
        });

        Schema::table('guides', function (Blueprint $table) {
            $table->dropColumn(['is_anonymous', 'dislikes']);
        });
    }
};
