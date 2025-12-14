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
            $table->string('language', 5)->default('en')->after('status');
            $table->index('language');
        });

        Schema::table('guides', function (Blueprint $table) {
            $table->string('language', 5)->default('en')->after('is_published');
            $table->index('language');
        });
    }

    /**
     * Rollback the migrations.
     */
    public function down(): void
    {
        Schema::table('user_builds', function (Blueprint $table) {
            $table->dropIndex(['language']);
            $table->dropColumn('language');
        });

        Schema::table('guides', function (Blueprint $table) {
            $table->dropIndex(['language']);
            $table->dropColumn('language');
        });
    }
};
