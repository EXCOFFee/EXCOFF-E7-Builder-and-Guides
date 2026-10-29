<?php

namespace Tests\Feature;

use App\Models\Hero;
use App\Models\User;
use App\Models\UserBuild;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * GET /api/builds y GET /api/builds/{id}: filtro por héroe (el link "ver todas las builds"
 * de la ficha), orden validado, caché que se renueva al publicar y anonimato del autor.
 */
class BuildListTest extends TestCase
{
    use RefreshDatabase;

    public function test_filters_by_hero_slug(): void
    {
        $hero = Hero::factory()->create();
        UserBuild::factory()->create(['hero_id' => $hero->id, 'title' => 'Mine']);
        UserBuild::factory()->create(['title' => 'Other hero']);

        $titles = collect($this->getJson("/api/builds?hero={$hero->slug}")->assertOk()->json('data'))->pluck('title');

        $this->assertSame(['Mine'], $titles->all());
    }

    public function test_invalid_order_falls_back_to_desc(): void
    {
        UserBuild::factory()->create(['title' => 'Old', 'created_at' => now()->subDay()]);
        UserBuild::factory()->create(['title' => 'New']);

        $titles = collect($this->getJson('/api/builds?sort=newest&order=drop')->assertOk()->json('data'))->pluck('title');

        $this->assertSame(['New', 'Old'], $titles->all());
    }

    public function test_new_build_appears_in_the_list_right_away(): void
    {
        UserBuild::factory()->create();
        $this->assertCount(1, $this->getJson('/api/builds')->json('data'));

        UserBuild::factory()->create();
        $this->assertCount(2, $this->getJson('/api/builds')->json('data'));
    }

    public function test_anonymous_build_hides_author_and_tells_the_owner(): void
    {
        $owner = User::factory()->create();
        $build = UserBuild::factory()->anonymous()->create(['user_id' => $owner->id]);

        $public = $this->getJson("/api/builds/{$build->id}")->assertOk()->json();
        $this->assertNull($public['user']);
        $this->assertArrayNotHasKey('user_id', $public);
        $this->assertFalse($public['is_owner']);

        $listed = $this->getJson('/api/builds')->json('data.0');
        $this->assertArrayNotHasKey('user_id', $listed);

        $token = $owner->createToken('t')->plainTextToken;
        $this->withHeaders(['Authorization' => "Bearer {$token}"])
            ->getJson("/api/builds/{$build->id}")
            ->assertJsonPath('is_owner', true);
    }
}
