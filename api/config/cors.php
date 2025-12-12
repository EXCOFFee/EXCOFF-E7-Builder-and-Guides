<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Configured for E7-Hub (epiccodex.com) - Headless Architecture
    | Frontend: Vercel | Backend: Hostinger
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'https://epiccodex.com',
        'https://www.epiccodex.com',
        'https://epiccodex.vercel.app',
        'http://localhost:3000',  // Next.js dev
    ],

    'allowed_origins_patterns' => [
        '/^https:\/\/epiccodex-.*\.vercel\.app$/',  // Vercel preview deployments
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 86400, // 24 hours cache

    'supports_credentials' => true, // Required for Sanctum cookies

];
