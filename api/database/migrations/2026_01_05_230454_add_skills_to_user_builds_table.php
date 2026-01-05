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
            $table->tinyInteger('skill_1')->default(0)->after('counter_heroes');
            $table->tinyInteger('skill_2')->default(0)->after('skill_1');
            $table->tinyInteger('skill_3')->default(0)->after('skill_2');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_builds', function (Blueprint $table) {
            $table->dropColumn(['skill_1', 'skill_2', 'skill_3']);
        });
    }
};
