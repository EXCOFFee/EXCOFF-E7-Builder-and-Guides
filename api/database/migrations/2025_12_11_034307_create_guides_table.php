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
        Schema::create('guides', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->unsignedBigInteger('hero_id')->nullable();
            $table->unsignedBigInteger('artifact_id')->nullable();

            // Category for filtering
            $table->string('category')->default('general'); // 'general', 'pve', 'rta', 'guild_war', 'arena'

            $table->string('title');
            $table->string('slug')->unique();
            $table->string('type')->default('pve'); // 'pvp', 'pve', 'guild', 'oneshot'

            // Build data
            $table->text('sets')->nullable();              // JSON: ["speed", "health"]
            $table->text('stats')->nullable();             // JSON: {atk, def, hp, spd, ...}
            $table->text('stat_priority')->nullable();     // JSON: {spd: "high", ...}
            $table->text('synergies')->nullable();         // JSON: [hero_ids]
            $table->text('counters')->nullable();          // JSON: [hero_ids]
            $table->text('alt_artifacts')->nullable();     // JSON: [artifact_ids]

            // Content
            $table->text('description')->nullable();
            $table->longText('gameplay_content')->nullable();

            // Video support
            $table->string('video_url')->nullable();
            $table->string('video_thumbnail')->nullable();
            $table->string('video_platform')->nullable(); // 'youtube', 'twitch', 'bilibili'

            // Images
            $table->text('images')->nullable(); // JSON: array of image URLs
            $table->string('proof_image')->nullable();

            // Status and engagement
            $table->boolean('is_published')->default(false);
            $table->integer('vote_score')->default(0);
            $table->unsignedInteger('views')->default(0);
            $table->unsignedInteger('likes')->default(0);

            $table->timestamps();

            // Indexes for optimized queries
            $table->index('hero_id');
            $table->index('category');
            $table->index('vote_score');
            $table->index('type');
            $table->index('is_published');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('guides');
    }
};
