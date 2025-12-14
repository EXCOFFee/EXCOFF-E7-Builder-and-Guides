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
        Schema::create('guild_posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description');
            $table->string('server'); // global, europe, asia, japan, korea, china
            $table->string('language'); // en, es, ko, ja, zh, pt
            $table->json('tags')->nullable(); // casual, chill, semi_competitive, competitive_all, competitive_gw, competitive_rta, whatsapp, discord, other_social, beginner, help_improve, active
            $table->json('images')->nullable(); // array of image URLs
            $table->integer('likes')->default(0);
            $table->integer('dislikes')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['server', 'language']);
            $table->index('is_active');
        });
    }

    /**
     * Rollback the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('guild_posts');
    }
};
