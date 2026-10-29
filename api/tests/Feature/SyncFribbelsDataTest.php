<?php

namespace Tests\Feature;

use App\Models\Artifact;
use App\Models\Hero;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

/**
 * data:sync must refresh what Fribbels owns (stats, imprint, multipliers) without
 * wiping curated data (skill texts, names, slugs, artifact descriptions and codes).
 */
class SyncFribbelsDataTest extends TestCase
{
    use RefreshDatabase;

    private function fribbelsHero(string $id, string $name, array $overrides = []): array
    {
        return array_replace_recursive([
            '_id' => $id, 'code' => 'c9999', 'name' => $name, 'rarity' => 5,
            'attribute' => 'wind', 'role' => 'assassin',
            'calculatedStatus' => ['lv60SixStarFullyAwakened' => [
                'atk' => 1200, 'def' => 600, 'hp' => 6000, 'spd' => 120, 'chc' => 0.15, 'chd' => 1.5, 'eff' => 0, 'efr' => 0,
            ]],
            'self_devotion' => ['type' => 'att_rate', 'grades' => ['B' => 0.07, 'SSS' => 0.21]],
            'skills' => ['S1' => ['rate' => 1.1, 'pow' => 1, 'targets' => 1, 'hitTypes' => ['crit'], 'options' => []]],
        ], $overrides);
    }

    private function fakeFribbels(array $heroes, array $artifacts = []): void
    {
        Http::fake([
            '*herodata.json' => Http::response($heroes),
            '*artifactdata.json' => Http::response($artifacts),
        ]);
    }

    private function existingHero(string $code, string $name, array $overrides = []): Hero
    {
        return Hero::create(array_merge([
            'code' => $code, 'hero_code' => 'c9999', 'name' => $name, 'slug' => 'my-curated-slug',
            'element' => 'earth', 'class' => 'thief', 'rarity' => 5,
            'base_stats' => ['atk' => 1, 'def' => 1, 'hp' => 1, 'spd' => 1],
            'skills' => ['S1' => ['name' => 'Curated Strike', 'description' => 'Curated text', 'cooldown' => 0, 'soulburn' => true, 'soulburn_effect' => 'Extra turn', 'rate' => 0.5]],
            'self_devotion' => ['type' => 'att_rate', 'grades' => ['SSS' => 0.168]],
            'image_url' => 'https://example.test/curated.png',
            'data_hash' => 'old',
        ], $overrides));
    }

    public function test_sync_refreshes_fribbels_data_and_keeps_curated_fields(): void
    {
        $hero = $this->existingHero('test-hero', 'Test Hero');
        $this->fakeFribbels(['Test Hero' => $this->fribbelsHero('test-hero', 'Test Hero Renamed')]);

        $this->artisan('data:sync', ['--heroes-only' => true])->assertSuccessful();

        $hero->refresh();
        $this->assertSame(1200, $hero->base_stats['atk']);
        $this->assertSame(0.21, $hero->self_devotion['grades']['SSS']);
        $this->assertSame(1.1, $hero->skills['S1']['rate']);
        $this->assertSame(1, $hero->skills['S1']['targets']);
        // Curated fields survive
        $this->assertSame('Curated Strike', $hero->skills['S1']['name']);
        $this->assertSame('Curated text', $hero->skills['S1']['description']);
        $this->assertTrue($hero->skills['S1']['soulburn']);
        $this->assertSame('Test Hero', $hero->name);
        $this->assertSame('my-curated-slug', $hero->slug);
        $this->assertSame('https://example.test/curated.png', $hero->image_url);
    }

    public function test_sync_skips_stats_known_to_be_wrong_in_fribbels(): void
    {
        $diene = $this->existingHero('diene', 'Diene', ['base_stats' => ['atk' => 649, 'def' => 694, 'hp' => 5254, 'spd' => 105]]);
        $this->fakeFribbels(['Diene' => $this->fribbelsHero('diene', 'Diene')]);

        $this->artisan('data:sync', ['--heroes-only' => true])->assertSuccessful();

        $diene->refresh();
        $this->assertSame(649, $diene->base_stats['atk']);
        $this->assertSame(0.21, $diene->self_devotion['grades']['SSS']);
    }

    public function test_sync_creates_new_heroes(): void
    {
        $this->fakeFribbels(['Brand New' => $this->fribbelsHero('brand-new', 'Brand New')]);

        $this->artisan('data:sync', ['--heroes-only' => true])->assertSuccessful();

        $hero = Hero::where('code', 'brand-new')->firstOrFail();
        $this->assertSame('earth', $hero->element);
        $this->assertSame('thief', $hero->class);
        $this->assertSame('brand-new', $hero->slug);
    }

    public function test_sync_keeps_artifact_description_code_and_image(): void
    {
        // Artefacto que NO está en custom_artifacts.json: solo lo toca la parte de Fribbels
        $artifact = Artifact::create([
            'code' => 'a9001', 'name' => 'Test Relic', 'slug' => 'test-relic', 'name_es' => 'Reliquia de prueba',
            'class' => 'warrior', 'rarity' => 4, 'description' => 'Increases Attack by 20%.',
            'image_url' => 'https://example.test/art9001.png',
        ]);
        $this->fakeFribbels([], ['Test Relic' => [
            'code' => 'efz99', 'name' => 'Test Relic', 'rarity' => 5, 'role' => 'assassin', 'stats' => ['attack' => 21],
        ]]);

        $this->artisan('data:sync', ['--artifacts-only' => true])->assertSuccessful();

        $artifact->refresh();
        $this->assertSame('thief', $artifact->class);
        $this->assertSame(5, $artifact->rarity);
        $this->assertSame('a9001', $artifact->code);
        $this->assertSame('Increases Attack by 20%.', $artifact->description);
        $this->assertSame('https://example.test/art9001.png', $artifact->image_url);
        $this->assertSame('Reliquia de prueba', $artifact->name_es);
    }

    public function test_custom_artifacts_keep_their_curated_text(): void
    {
        $this->fakeFribbels([], ["Flame Dragon's Jewel" => [
            'code' => 'efa34', 'name' => "Flame Dragon's Jewel", 'rarity' => 5, 'role' => 'assassin',
        ]]);

        $this->artisan('data:sync', ['--artifacts-only' => true])->assertSuccessful();

        $artifact = Artifact::where('slug', 'flame-dragons-jewel')->firstOrFail();
        $this->assertSame('a0247', $artifact->code);
        $this->assertStringStartsWith('Increases Attack by 20%.', $artifact->description);
        $this->assertStringEndsWith('art0247_fu.png', $artifact->image_url);
    }
}
