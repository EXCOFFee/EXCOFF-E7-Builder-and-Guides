<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Adds pros and cons tags as JSON arrays of tag IDs.
     * KISS: Simple JSON storage for flexibility, no pivot tables needed.
     */
    public function up(): void
    {
        Schema::table('user_builds', function (Blueprint $table) {
            $table->json('pro_tags')->nullable()->after('reason_rta');
            $table->json('con_tags')->nullable()->after('pro_tags');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_builds', function (Blueprint $table) {
            $table->dropColumn(['pro_tags', 'con_tags']);
        });
    }
};
