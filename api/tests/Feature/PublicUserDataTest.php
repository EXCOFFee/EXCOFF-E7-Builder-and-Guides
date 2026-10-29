<?php

namespace Tests\Feature;

use App\Models\Guide;
use App\Models\Hero;
use App\Models\User;
use App\Models\UserBuild;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Las respuestas públicas solo muestran nombre y avatar del autor: nunca su email, id de
 * Google ni rol. Una build anónima no muestra autor.
 */
class PublicUserDataTest extends TestCase
{
    use RefreshDatabase;

    private const PRIVATE_FIELDS = ['email', 'provider_id', 'provider', 'role', 'is_admin'];

    private function makeBuild(User $owner, bool $anonymous = false): UserBuild
    {
        return UserBuild::create([
            'user_id' => $owner->id,
            'hero_id' => Hero::factory()->create()->id,
            'title' => $anonymous ? 'Hidden author' : 'Public author',
            'status' => 'published',
            'language' => 'en',
            'is_anonymous' => $anonymous,
        ]);
    }

    private function assertNoPrivateFields(?array $user): void
    {
        $this->assertNotNull($user);
        foreach (self::PRIVATE_FIELDS as $field) {
            $this->assertArrayNotHasKey($field, $user, "La API expone el campo privado '$field'");
        }
        $this->assertSame(['avatar', 'id', 'name'], collect($user)->keys()->sort()->values()->all());
    }

    public function test_build_list_and_detail_hide_private_user_fields(): void
    {
        $owner = User::factory()->create(['email' => 'owner@example.com']);
        $build = $this->makeBuild($owner);

        $list = $this->getJson('/api/builds')->assertOk();
        $this->assertNoPrivateFields($list->json('data.0.user'));
        $this->assertStringNotContainsString('owner@example.com', $list->getContent());

        $detail = $this->getJson("/api/builds/{$build->id}")->assertOk();
        $this->assertNoPrivateFields($detail->json('data.user') ?? $detail->json('user'));
        $this->assertStringNotContainsString('owner@example.com', $detail->getContent());
    }

    public function test_anonymous_build_does_not_reveal_its_author(): void
    {
        $owner = User::factory()->create(['name' => 'Secret Author', 'email' => 'secret@example.com']);
        $build = $this->makeBuild($owner, anonymous: true);

        foreach (['/api/builds', "/api/builds/{$build->id}", "/api/heroes/{$build->hero->slug}/builds"] as $url) {
            $content = $this->getJson($url)->assertOk()->getContent();
            $this->assertStringNotContainsString('Secret Author', $content, $url);
            $this->assertStringNotContainsString('secret@example.com', $content, $url);
        }
    }

    public function test_guide_list_hides_private_user_fields(): void
    {
        $author = User::factory()->create(['email' => 'guide@example.com']);
        Guide::create([
            'user_id' => $author->id,
            'title' => 'Arena basics',
            'slug' => 'arena-basics',
            'category' => 'arena',
            'gameplay_content' => 'Text',
            'is_published' => true,
            'language' => 'en',
        ]);

        $response = $this->getJson('/api/guides')->assertOk();
        $this->assertNoPrivateFields($response->json('data.0.user'));
        $this->assertStringNotContainsString('guide@example.com', $response->getContent());
    }
}
