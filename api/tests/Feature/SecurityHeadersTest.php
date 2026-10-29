<?php

namespace Tests\Feature;

use Tests\TestCase;

/**
 * Cabeceras de seguridad en todas las respuestas, también errores y rutas fuera de /api.
 * (X-Powered-By lo agrega PHP fuera de Laravel: se quita en public/index.php y .htaccess.)
 */
class SecurityHeadersTest extends TestCase
{
    public function test_headers_are_present_on_api_errors_and_health_check(): void
    {
        foreach (['/api/no-existe', '/up'] as $path) {
            $response = $this->get($path);

            $response->assertHeader('X-Frame-Options', 'DENY');
            $response->assertHeader('X-Content-Type-Options', 'nosniff');
            $response->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        }
    }

    public function test_legacy_xss_auditor_is_disabled(): void
    {
        // "1; mode=block" activaba el auditor XSS viejo de los navegadores, que abría fugas
        // de información; la recomendación actual (OWASP) es desactivarlo.
        $this->get('/api/no-existe')->assertHeader('X-XSS-Protection', '0');
    }
}
