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
        Schema::create('user_builds', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('hero_id');

            $table->string('title');
            $table->text('description')->nullable();

            // Build stats requirements
            $table->text('min_stats')->nullable(); // JSON: {atk: 4000, def: 1200, hp: 15000, spd: 200, ...}

            // Equipment sets
            $table->string('primary_set')->nullable(); // 'speed', 'counter', etc.
            $table->string('secondary_set')->nullable();

            // Artifact
            $table->unsignedBigInteger('artifact_id')->nullable();

            // Synergies and Counters
            $table->text('synergy_heroes')->nullable(); // JSON: Array of hero IDs
            $table->text('counter_heroes')->nullable(); // JSON: Array of hero IDs

            // Media
            $table->text('images')->nullable(); // JSON: Array of image URLs

            // Engagement
            $table->unsignedInteger('views')->default(0);
            $table->unsignedInteger('likes')->default(0);

            // Status
            $table->string('status')->default('published'); // 'draft', 'published', 'archived'

            $table->timestamps();

            $table->index(['hero_id', 'status']);
            $table->index(['user_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_builds');
    }
};
