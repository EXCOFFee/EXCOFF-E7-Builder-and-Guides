<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SecurityTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test a regular user with a valid token can read their profile.
     */
    public function test_authenticated_user_can_access_profile(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth_token')->plainTextToken;

        $this->withToken($token)
            ->getJson('/api/user')
            ->assertStatus(200)
            ->assertJsonPath('id', $user->id);
    }

    /**
     * Test the old public migration route no longer exists.
     */
    public function test_public_migration_route_is_removed(): void
    {
        $this->getJson('/api/admin/run-migration-translations?key=excoff_secret_migration_key_2026')
            ->assertStatus(404);
    }

    /**
     * Test admin fields cannot be set through mass assignment.
     */
    public function test_admin_fields_are_not_mass_assignable(): void
    {
        $user = User::create([
            'name' => 'Attacker',
            'email' => 'attacker@example.com',
            'is_admin' => true,
            'role' => 'admin',
        ])->fresh();

        $this->assertFalse($user->is_admin);
        $this->assertSame('user', $user->role);
        $this->assertFalse($user->isAdmin());
    }

    /**
     * Test tokens older than 30 days are rejected.
     */
    public function test_expired_token_is_rejected(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth_token')->plainTextToken;

        $this->travel(31)->days();

        $this->withToken($token)
            ->getJson('/api/user')
            ->assertStatus(401);
    }
}
