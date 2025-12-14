<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\HeroController;
use App\Http\Controllers\Api\ArtifactController;
use App\Http\Controllers\Api\GuildPostController;
use App\Http\Controllers\GuideController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserBuildController;
use App\Http\Controllers\VoteController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\ReportController;

// Public routes
Route::get('/heroes', [HeroController::class, 'index']);
Route::get('/heroes/{hero:slug}', [HeroController::class, 'show']);
Route::get('/artifacts', [ArtifactController::class, 'index']);
Route::get('/artifacts/{artifact}', [ArtifactController::class, 'show']);
Route::get('/guides', [GuideController::class, 'index']);
Route::get('/guides/{guide:slug}', [GuideController::class, 'show']);

// Public user builds
Route::get('/heroes/{hero:slug}/builds', [UserBuildController::class, 'indexByHero']);
Route::get('/builds', [UserBuildController::class, 'index']); // All builds for /builds page
Route::get('/builds/{build}', [UserBuildController::class, 'show']);

// Public guild posts
Route::get('/guilds', [GuildPostController::class, 'index']);
Route::get('/guilds/options', [GuildPostController::class, 'options']);
Route::get('/guilds/{slug}', [GuildPostController::class, 'show']);

// Public comments
Route::get('/builds/{build}/comments', [CommentController::class, 'getBuildComments']);
Route::get('/guides/{guide}/comments', [CommentController::class, 'getGuideComments']);

// Like status (public, will return liked=false if not logged in)
Route::get('/guides/{guide}/like-status', [VoteController::class, 'checkGuideLike']);
Route::get('/builds/{build}/like-status', [VoteController::class, 'checkBuildLike']);

// OAuth routes
Route::get('/auth/{provider}', [AuthController::class, 'redirectToProvider']);
Route::get('/auth/{provider}/callback', [AuthController::class, 'handleProviderCallback']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // User
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // User Builds CRUD
    Route::post('/builds', [UserBuildController::class, 'store']);
    Route::put('/builds/{build}', [UserBuildController::class, 'update']);
    Route::delete('/builds/{build}', [UserBuildController::class, 'destroy']);

    // Guides CRUD
    Route::post('/guides', [GuideController::class, 'store']);
    Route::put('/guides/{guide:slug}', [GuideController::class, 'update']);
    Route::delete('/guides/{guide:slug}', [GuideController::class, 'destroy']);

    // Guild Posts CRUD
    Route::post('/guilds', [GuildPostController::class, 'store']);
    Route::put('/guilds/{id}', [GuildPostController::class, 'update']);
    Route::delete('/guilds/{id}', [GuildPostController::class, 'destroy']);

    // Votes (likes)
    Route::post('/guides/{guide}/vote', [VoteController::class, 'voteGuide']);
    Route::post('/builds/{build}/vote', [VoteController::class, 'voteBuild']);

    // Comments
    Route::post('/comments', [CommentController::class, 'store']);
    Route::delete('/comments/{comment}', [CommentController::class, 'destroy']);

    // Reports
    Route::post('/reports', [ReportController::class, 'store']);

    // Admin routes
    Route::middleware('admin')->group(function () {
        Route::get('/admin/reports', [ReportController::class, 'index']);
        Route::put('/admin/reports/{report}', [ReportController::class, 'update']);
    });
});

