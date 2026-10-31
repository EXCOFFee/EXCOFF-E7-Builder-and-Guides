<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Reputación: seguir a otros usuarios y builds verificadas (captura del juego revisada por un
 * admin; proof_ocr guarda lo que leyó el OCR del navegador y cuántos stats coinciden).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('follows', function (Blueprint $table) {
            $table->foreignId('follower_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('followed_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
            $table->primary(['follower_id', 'followed_id']);
            $table->index('followed_id');
        });

        Schema::table('user_builds', function (Blueprint $table) {
            // null (sin captura) / pending / verified / rejected
            $table->string('verification_status', 16)->nullable()->after('proof_image');
            $table->timestamp('verified_at')->nullable()->after('verification_status');
            $table->foreignId('verified_by')->nullable()->after('verified_at')->constrained('users')->nullOnDelete();
            $table->json('proof_ocr')->nullable()->after('verified_by');
            $table->index('verification_status');
        });

        // Las que ya tenían captura quedan para revisar
        DB::table('user_builds')->whereNotNull('proof_image')->update(['verification_status' => 'pending']);
    }

    public function down(): void
    {
        Schema::table('user_builds', function (Blueprint $table) {
            $table->dropIndex(['verification_status']);
            $table->dropConstrainedForeignId('verified_by');
            $table->dropColumn(['verification_status', 'verified_at', 'proof_ocr']);
        });
        Schema::dropIfExists('follows');
    }
};
