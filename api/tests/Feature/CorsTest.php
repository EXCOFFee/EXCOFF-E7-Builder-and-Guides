<?php

namespace Tests\Feature;

use Tests\TestCase;

/**
 * Solo el frontend real (y las vistas previas de Vercel de este equipo) pueden llamar a la API
 * desde el navegador con credenciales. Los orígenes salen de CORS_ALLOWED_ORIGINS en el .env.
 */
class CorsTest extends TestCase
{
    private function preflight(string $origin)
    {
        return $this->call('OPTIONS', '/api/heroes', [], [], [], [
            'HTTP_ORIGIN' => $origin,
            'HTTP_ACCESS_CONTROL_REQUEST_METHOD' => 'GET',
            'HTTP_ACCESS_CONTROL_REQUEST_HEADERS' => 'authorization',
        ]);
    }

    /**
     * Rechazado = la cabecera no devuelve ese origen (el navegador bloquea la respuesta).
     * Con un único origen permitido, la librería siempre responde ese origen fijo.
     */
    private function assertRejected(string $origin): void
    {
        $this->assertNotSame($origin, $this->preflight($origin)->headers->get('Access-Control-Allow-Origin'), $origin);
    }

    public function test_production_frontend_is_allowed_with_credentials(): void
    {
        $response = $this->preflight('https://excoffe7.com');

        $response->assertHeader('Access-Control-Allow-Origin', 'https://excoffe7.com');
        $response->assertHeader('Access-Control-Allow-Credentials', 'true');
    }

    public function test_this_teams_vercel_previews_are_allowed(): void
    {
        $origin = 'https://web-git-feature-x-excoffees-projects.vercel.app';

        $this->preflight($origin)->assertHeader('Access-Control-Allow-Origin', $origin);
    }

    public function test_other_vercel_projects_with_a_similar_name_are_rejected(): void
    {
        // El patrón viejo (.*excoff.*\.vercel\.app) aceptaba cualquier proyecto con "excoff" en el nombre
        foreach (['https://excoff-phishing.vercel.app', 'https://evil-excoffees-projects.vercel.app.attacker.com', 'https://excoff67.com'] as $origin) {
            $this->assertRejected($origin);
        }
    }

    public function test_origins_come_from_the_environment(): void
    {
        config(['cors.allowed_origins' => ['https://staging.example.com'], 'cors.allowed_origins_patterns' => []]);

        $this->preflight('https://staging.example.com')->assertHeader('Access-Control-Allow-Origin', 'https://staging.example.com');
        $this->assertRejected('https://excoffe7.com');
    }
}
