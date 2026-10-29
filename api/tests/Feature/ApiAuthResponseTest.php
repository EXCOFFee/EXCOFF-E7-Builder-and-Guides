<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Sin sesión válida, la API responde 401 en JSON aunque el cliente no mande
 * `Accept: application/json`. Antes Laravel intentaba redirigir a route('login'),
 * que no existe en la API, y devolvía 500 (visto en producción el 2026-10-28).
 */
class ApiAuthResponseTest extends TestCase
{
    use RefreshDatabase;

    public function test_invalid_token_without_json_accept_header_returns_401_json(): void
    {
        $response = $this->get('/api/user', ['Authorization' => 'Bearer token-invalido']);

        $response->assertStatus(401)
            ->assertHeader('Content-Type', 'application/json')
            ->assertJsonPath('message', 'Unauthenticated.');
    }

    public function test_missing_token_without_json_accept_header_returns_401_json(): void
    {
        $this->get('/api/user')->assertStatus(401)->assertJsonPath('message', 'Unauthenticated.');
    }

    public function test_unknown_api_route_returns_json_404(): void
    {
        $this->get('/api/no-existe')->assertStatus(404)->assertHeader('Content-Type', 'application/json');
    }
}
