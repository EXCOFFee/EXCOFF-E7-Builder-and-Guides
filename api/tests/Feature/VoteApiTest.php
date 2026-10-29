<?php

namespace Tests\Feature;

use App\Models\Guide;
use App\Models\User;
use App\Models\UserBuild;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * Likes de builds y guías. like-status es una ruta pública: el token se lee sin el
 * middleware auth:sanctum (en producción el guard por defecto es "web" y lo ignoraba,
 * así que después de recargar un like aparecía desmarcado).
 */
class VoteApiTest extends TestCase
{
    use RefreshDatabase;

    private function bearer(User $user): array
    {
        return ['Authorization' => 'Bearer ' . $user->createToken('t')->plainTextToken];
    }

    private function like(User $user, string $type, int $id): void
    {
        DB::table('votes')->insert([
            'user_id' => $user->id,
            'votable_type' => $type,
            'votable_id' => $id,
            'value' => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function test_build_like_status_recognizes_the_token_on_a_fresh_request(): void
    {
        $user = User::factory()->create();
        $build = UserBuild::factory()->create(['likes' => 1]);
        $this->like($user, UserBuild::class, $build->id);

        $this->withHeaders($this->bearer($user))
            ->getJson("/api/builds/{$build->id}/like-status")
            ->assertOk()
            ->assertJson(['liked' => true, 'likes' => 1]);
    }

    public function test_guide_like_status_recognizes_the_token_on_a_fresh_request(): void
    {
        $user = User::factory()->create();
        $guide = Guide::factory()->create(['likes' => 1]);
        $this->like($user, Guide::class, $guide->id);

        $this->withHeaders($this->bearer($user))
            ->getJson("/api/guides/{$guide->id}/like-status")
            ->assertOk()
            ->assertJson(['liked' => true]);
    }

    public function test_guest_like_status_is_false(): void
    {
        $build = UserBuild::factory()->create();

        $this->getJson("/api/builds/{$build->id}/like-status")
            ->assertOk()
            ->assertJson(['liked' => false]);
    }

    public function test_vote_toggles_like_and_counter(): void
    {
        $user = User::factory()->create();
        $build = UserBuild::factory()->create();
        $headers = $this->bearer($user);

        $this->withHeaders($headers)->postJson("/api/builds/{$build->id}/vote")
            ->assertOk()->assertJson(['liked' => true, 'likes' => 1]);

        $this->withHeaders($headers)->postJson("/api/builds/{$build->id}/vote")
            ->assertOk()->assertJson(['liked' => false, 'likes' => 0]);

        $this->assertDatabaseCount('votes', 0);
    }

    public function test_guests_cannot_vote(): void
    {
        $build = UserBuild::factory()->create();

        $this->postJson("/api/builds/{$build->id}/vote")->assertUnauthorized();
    }
}
