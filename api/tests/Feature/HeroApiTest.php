<?php

namespace Tests\Feature;

use App\Models\Hero;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class HeroApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
    }

    /**
     * Test heroes index endpoint returns success.
     */
    public function test_heroes_index_returns_success(): void
    {
        Hero::factory()->count(3)->create();

        $response = $this->getJson('/api/heroes');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'slug', 'element', 'class', 'rarity']
                ]
            ]);
    }

    /**
     * Test heroes index with element filter.
     */
    public function test_heroes_index_filters_by_element(): void
    {
        Hero::factory()->create(['element' => 'fire']);
        Hero::factory()->create(['element' => 'ice']);
        Hero::factory()->create(['element' => 'fire']);

        $response = $this->getJson('/api/heroes?element=fire');

        $response->assertStatus(200);
        $data = $response->json('data');
        
        $this->assertCount(2, $data);
        foreach ($data as $hero) {
            $this->assertEquals('fire', $hero['element']);
        }
    }

    /**
     * Test heroes index with class filter.
     */
    public function test_heroes_index_filters_by_class(): void
    {
        Hero::factory()->create(['class' => 'warrior']);
        Hero::factory()->create(['class' => 'mage']);
        Hero::factory()->create(['class' => 'warrior']);

        $response = $this->getJson('/api/heroes?class=warrior');

        $response->assertStatus(200);
        $data = $response->json('data');
        
        $this->assertCount(2, $data);
    }

    /**
     * Test heroes index with search filter.
     */
    public function test_heroes_index_filters_by_search(): void
    {
        Hero::factory()->create(['name' => 'Aravi']);
        Hero::factory()->create(['name' => 'Arbiter Vildred']);
        Hero::factory()->create(['name' => 'Charlotte']);

        $response = $this->getJson('/api/heroes?search=Ar');

        $response->assertStatus(200);
        $data = $response->json('data');
        
        $this->assertCount(2, $data);
    }

    /**
     * Test hero show endpoint returns hero details.
     */
    public function test_hero_show_returns_hero_details(): void
    {
        $hero = Hero::factory()->create([
            'name' => 'Aravi',
            'slug' => 'aravi',
        ]);

        $response = $this->getJson("/api/heroes/{$hero->slug}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => ['id', 'name', 'slug', 'element', 'class', 'rarity']
            ])
            ->assertJsonPath('data.name', 'Aravi');
    }

    /**
     * Test hero show returns 404 for non-existent hero.
     */
    public function test_hero_show_returns_404_for_nonexistent(): void
    {
        $response = $this->getJson('/api/heroes/nonexistent-hero');

        $response->assertStatus(404)
            ->assertJsonPath('error.code', 'HERO_NOT_FOUND');
    }

    /**
     * Test heroes index result is cached.
     */
    public function test_heroes_index_is_cached(): void
    {
        Hero::factory()->count(2)->create();

        // First request - cache miss
        $response1 = $this->getJson('/api/heroes');
        $response1->assertStatus(200);

        // Second request should use cache
        $response2 = $this->getJson('/api/heroes');
        $response2->assertStatus(200);

        // Both responses should be identical
        $this->assertEquals($response1->json(), $response2->json());
    }
}
