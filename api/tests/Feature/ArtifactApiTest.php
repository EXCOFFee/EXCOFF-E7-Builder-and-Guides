<?php

namespace Tests\Feature;

use App\Models\Artifact;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class ArtifactApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
    }

    /**
     * Test artifacts index endpoint returns success.
     */
    public function test_artifacts_index_returns_success(): void
    {
        Artifact::factory()->count(3)->create();

        $response = $this->getJson('/api/artifacts');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'rarity', 'class']
                ]
            ]);
    }

    /**
     * Test artifacts index with rarity filter.
     */
    public function test_artifacts_index_filters_by_rarity(): void
    {
        Artifact::factory()->create(['rarity' => 4]);
        Artifact::factory()->create(['rarity' => 5]);
        Artifact::factory()->create(['rarity' => 5]);

        $response = $this->getJson('/api/artifacts?rarity=5');

        $response->assertStatus(200);
        $data = $response->json('data');
        
        $this->assertCount(2, $data);
        foreach ($data as $artifact) {
            $this->assertEquals(5, $artifact['rarity']);
        }
    }

    /**
     * Test artifacts index with class filter.
     */
    public function test_artifacts_index_filters_by_class(): void
    {
        Artifact::factory()->create(['class' => 'warrior']);
        Artifact::factory()->create(['class' => 'mage']);
        Artifact::factory()->create(['class' => 'warrior']);

        $response = $this->getJson('/api/artifacts?class=warrior');

        $response->assertStatus(200);
        $data = $response->json('data');
        
        $this->assertCount(2, $data);
    }

    /**
     * Test artifacts index with search filter.
     */
    public function test_artifacts_index_filters_by_search(): void
    {
        Artifact::factory()->create(['name' => 'Abyss Sword']);
        Artifact::factory()->create(['name' => 'Abyss Crown']);
        Artifact::factory()->create(['name' => 'Divine Shield']);

        $response = $this->getJson('/api/artifacts?search=Abyss');

        $response->assertStatus(200);
        $data = $response->json('data');
        
        $this->assertCount(2, $data);
    }

    /**
     * Test artifact show endpoint.
     */
    public function test_artifact_show_returns_artifact(): void
    {
        $artifact = Artifact::factory()->create([
            'name' => 'Test Artifact',
        ]);

        $response = $this->getJson("/api/artifacts/{$artifact->id}");

        $response->assertStatus(200)
            ->assertJsonPath('name', 'Test Artifact');
    }
}
