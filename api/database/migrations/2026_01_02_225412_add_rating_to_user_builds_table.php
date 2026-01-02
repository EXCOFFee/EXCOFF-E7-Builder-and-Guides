<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('user_builds', function (Blueprint $table) {
            $table->decimal('avg_rating', 3, 2)->default(0)->after('likes');
            $table->unsignedInteger('rating_count')->default(0)->after('avg_rating');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_builds', function (Blueprint $table) {
            $table->dropColumn(['avg_rating', 'rating_count']);
        });
    }
};
