<?php

namespace Tests\Feature;

use App\Models\Guide;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Public guide endpoints: list with filters, detail by slug and comments by id.
 */
class GuideApiTest extends TestCase
{
    use RefreshDatabase;

    private function makeGuide(array $attributes = []): Guide
    {
        return Guide::create(array_merge([
            'user_id' => User::factory()->create()->id,
            'title' => 'RTA basics',
            'slug' => 'rta-basics-' . uniqid(),
            'category' => 'rta',
            'gameplay_content' => 'Content',
            'is_published' => true,
            'language' => 'en',
        ], $attributes));
    }

    public function test_index_lists_only_published_guides(): void
    {
        $this->makeGuide(['title' => 'Visible']);
        $this->makeGuide(['title' => 'Draft', 'is_published' => false]);

        $this->getJson('/api/guides')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Visible')
            ->assertJsonStructure(['data' => [['id', 'title', 'slug', 'category', 'user']], 'current_page', 'last_page', 'total']);
    }

    public function test_index_filters_by_category_language_and_search(): void
    {
        $this->makeGuide(['title' => 'Arena speed tuning', 'category' => 'arena', 'language' => 'es']);
        $this->makeGuide(['title' => 'RTA drafts', 'category' => 'rta', 'language' => 'es']);
        $this->makeGuide(['title' => 'Arena in English', 'category' => 'arena', 'language' => 'en']);

        $this->getJson('/api/guides?category=arena&language=es&search=speed')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Arena speed tuning');
    }

    public function test_index_filters_by_hero_slug_and_mode(): void
    {
        $hero = \App\Models\Hero::factory()->create();
        Guide::factory()->create(['title' => 'Hero RTA', 'hero_id' => $hero->id, 'type' => 'pvp']);
        Guide::factory()->create(['title' => 'Hero PvE', 'hero_id' => $hero->id, 'type' => 'pve']);
        Guide::factory()->create(['title' => 'Otro']);

        $titles = fn (string $q) => collect($this->getJson("/api/guides?{$q}")->assertOk()->json('data'))->pluck('title')->sort()->values()->all();

        $this->assertSame(['Hero PvE', 'Hero RTA'], $titles("hero={$hero->slug}"));
        $this->assertSame(['Hero RTA'], $titles("hero={$hero->slug}&type=pvp"));
    }

    public function test_index_sorts_on_the_server(): void
    {
        Guide::factory()->create(['title' => 'Vieja popular', 'likes' => 9, 'views' => 1, 'created_at' => now()->subDays(5)]);
        Guide::factory()->create(['title' => 'Nueva', 'likes' => 1, 'views' => 50, 'created_at' => now()]);

        $first = fn (string $q) => $this->getJson("/api/guides?{$q}")->json('data.0.title');

        $this->assertSame('Nueva', $first('sort=newest'));
        $this->assertSame('Vieja popular', $first('sort=likes'));
        $this->assertSame('Nueva', $first('sort=views'));
        $this->assertSame('Vieja popular', $first('sort=views&order=asc'));
        $this->assertSame('Nueva', $first('sort=newest&order=drop'));
    }

    public function test_index_with_no_matches_returns_empty_page(): void
    {
        $this->makeGuide();

        $this->getJson('/api/guides?search=nothing-matches-this')
            ->assertOk()
            ->assertJsonCount(0, 'data');
    }

    public function test_show_returns_guide_and_counts_view(): void
    {
        $guide = $this->makeGuide(['teams' => [['name' => 'Team A', 'heroes' => []]]]);

        $this->getJson("/api/guides/{$guide->slug}")
            ->assertOk()
            ->assertJsonPath('slug', $guide->slug)
            ->assertJsonPath('teams.0.name', 'Team A')
            ->assertJsonStructure(['recommended_heroes_list', 'recommended_artifacts_list']);

        $this->assertSame(1, $guide->fresh()->views);
    }

    public function test_show_unknown_slug_returns_404(): void
    {
        $this->getJson('/api/guides/does-not-exist')->assertNotFound();
    }

    public function test_guide_comments_endpoint_responds(): void
    {
        $guide = $this->makeGuide();

        $this->getJson("/api/guides/{$guide->id}/comments")->assertOk()->assertJsonCount(0);
    }
}
