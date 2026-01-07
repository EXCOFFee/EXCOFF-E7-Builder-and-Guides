<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Adds tier ratings (D=1 to S=5) for 4 categories with optional justifications.
     * Design: KISS - simple columns vs complex JSON for better query performance.
     */
    public function up(): void
    {
        Schema::table('user_builds', function (Blueprint $table) {
            // Tier ratings (1=D, 2=C, 3=B, 4=A, 5=S), nullable for backwards compatibility
            $table->unsignedTinyInteger('rating_pve')->nullable()->after('rating_count');
            $table->unsignedTinyInteger('rating_arena')->nullable()->after('rating_pve');
            $table->unsignedTinyInteger('rating_gw')->nullable()->after('rating_arena');
            $table->unsignedTinyInteger('rating_rta')->nullable()->after('rating_gw');
            
            // Optional justifications for each rating
            $table->string('reason_pve', 255)->nullable()->after('rating_rta');
            $table->string('reason_arena', 255)->nullable()->after('reason_pve');
            $table->string('reason_gw', 255)->nullable()->after('reason_arena');
            $table->string('reason_rta', 255)->nullable()->after('reason_gw');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_builds', function (Blueprint $table) {
            $table->dropColumn([
                'rating_pve', 'rating_arena', 'rating_gw', 'rating_rta',
                'reason_pve', 'reason_arena', 'reason_gw', 'reason_rta'
            ]);
        });
    }
};
