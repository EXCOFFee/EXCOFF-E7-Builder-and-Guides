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
        Schema::create('heroes', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();      // "c1001"
            $table->string('name');
            $table->string('slug')->unique();
            $table->enum('element', ['fire', 'ice', 'earth', 'light', 'dark']);
            $table->enum('class', ['knight', 'warrior', 'thief', 'ranger', 'mage', 'soul_weaver']);
            $table->unsignedTinyInteger('rarity'); // 3, 4, 5
            $table->json('base_stats');            // {atk, def, hp, spd, crit, cdmg, eff, res}
            $table->json('skills')->nullable();    // Array of skill data
            $table->string('image_url')->nullable();
            $table->string('data_hash', 64);       // SHA256 for sync detection
            $table->timestamps();
            
            $table->index('element');
            $table->index('class');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('heroes');
    }
};
