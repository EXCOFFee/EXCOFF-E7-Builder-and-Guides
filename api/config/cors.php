<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | E7 EXCOFF Builder & Guides - Headless Architecture
    | Frontend: Vercel | Backend: Hostinger
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'https://excoff-e7-builder-and-guides-q9y8.vercel.app',
        'http://localhost:3000',  // Next.js dev
    ],

    'allowed_origins_patterns' => [
        '/^https:\/\/excoff-e7-builder-and-guides.*\.vercel\.app$/',  // Vercel preview deployments
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 86400, // 24 hours cache

    'supports_credentials' => true, // Required for Sanctum cookies

];
