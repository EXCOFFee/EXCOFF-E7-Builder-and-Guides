<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\HeroController;
use App\Http\Controllers\Api\ArtifactController;
use App\Http\Controllers\GuideController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserBuildController;
use App\Http\Controllers\VoteController;

// Public routes
Route::get('/heroes', [HeroController::class, 'index']);
Route::get('/heroes/{hero:slug}', [HeroController::class, 'show']);
Route::get('/artifacts', [ArtifactController::class, 'index']);
Route::get('/artifacts/{artifact}', [ArtifactController::class, 'show']);
Route::get('/guides', [GuideController::class, 'index']);
Route::get('/guides/{guide:slug}', [GuideController::class, 'show']);

// Public user builds
Route::get('/heroes/{hero:slug}/builds', [UserBuildController::class, 'indexByHero']);
Route::get('/builds/{build}', [UserBuildController::class, 'show']);

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
    Route::put('/guides/{guide}', [GuideController::class, 'update']);
    Route::delete('/guides/{guide}', [GuideController::class, 'destroy']);

    // Votes
    Route::post('/guides/{guide}/vote', [VoteController::class, 'voteGuide']);
    Route::post('/builds/{build}/vote', [VoteController::class, 'voteBuild']);
});
