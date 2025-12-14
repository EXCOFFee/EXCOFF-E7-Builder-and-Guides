<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     * Adds localized name fields for Korean, Japanese, and Chinese
     */
    public function up(): void
    {
        // Add localized names to heroes table
        Schema::table('heroes', function (Blueprint $table) {
            $table->string('name_ko')->nullable()->after('name'); // Korean
            $table->string('name_ja')->nullable()->after('name_ko'); // Japanese
            $table->string('name_zh')->nullable()->after('name_ja'); // Chinese
        });

        // Add localized names to artifacts table
        Schema::table('artifacts', function (Blueprint $table) {
            $table->string('name_ko')->nullable()->after('name'); // Korean
            $table->string('name_ja')->nullable()->after('name_ko'); // Japanese
            $table->string('name_zh')->nullable()->after('name_ja'); // Chinese
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('heroes', function (Blueprint $table) {
            $table->dropColumn(['name_ko', 'name_ja', 'name_zh']);
        });

        Schema::table('artifacts', function (Blueprint $table) {
            $table->dropColumn(['name_ko', 'name_ja', 'name_zh']);
        });
    }
};
