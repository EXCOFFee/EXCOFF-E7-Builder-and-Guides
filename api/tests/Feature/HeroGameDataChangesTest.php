<?php

namespace Tests\Feature;

use App\Models\Hero;
use App\Models\News;
use App\Models\UserBuild;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

/**
 * data:sync marca cuándo cambió lo que define a un héroe en el juego (stats base,
 * multiplicadores de skills, impronta) y publica una noticia de balance con los héroes
 * afectados y cuántas builds quedaron de antes del cambio.
 */
class HeroGameDataChangesTest extends TestCase
{
    use RefreshDatabase;

    private function fribbelsHero(array $overrides = []): array
    {
        return array_replace_recursive([
            '_id' => 'test-hero', 'code' => 'c9999', 'name' => 'Test Hero', 'rarity' => 5,
            'attribute' => 'wind', 'role' => 'assassin',
            'calculatedStatus' => ['lv60SixStarFullyAwakened' => [
                'atk' => 1200, 'def' => 600, 'hp' => 6000, 'spd' => 120, 'chc' => 0.15, 'chd' => 1.5, 'eff' => 0, 'efr' => 0,
            ]],
            'self_devotion' => ['type' => 'att_rate', 'grades' => ['B' => 0.07, 'SSS' => 0.21]],
            'skills' => ['S1' => ['rate' => 1.1, 'pow' => 1, 'targets' => 1, 'options' => []]],
        ], $overrides);
    }

    /** Lo que "publica" Fribbels en cada corrida (un segundo Http::fake no reemplaza al primero) */
    private array $fribbels = [];

    protected function setUp(): void
    {
        parent::setUp();
        Http::fake(fn ($request) => str_ends_with($request->url(), 'herodata.json')
            ? Http::response(['Test Hero' => $this->fribbels])
            : Http::response([]));
    }

    private function sync(array $hero): void
    {
        $this->fribbels = $hero;
        $this->artisan('data:sync', ['--heroes-only' => true])->assertSuccessful();
    }

    public function test_new_hero_is_not_a_balance_change(): void
    {
        $this->sync($this->fribbelsHero());

        $this->assertNull(Hero::firstWhere('code', 'test-hero')->game_data_changed_at);
        $this->assertSame(0, News::count());
    }

    public function test_same_game_data_with_a_new_hash_is_not_a_change(): void
    {
        $this->sync($this->fribbelsHero());
        // Fribbels agrega un campo que no usamos: cambia el hash, no el héroe
        $this->sync($this->fribbelsHero(['someNewField' => 'x']));

        $this->assertNull(Hero::firstWhere('code', 'test-hero')->game_data_changed_at);
        $this->assertSame(0, News::count());
    }

    public function test_changed_stats_mark_the_hero_and_publish_balance_news(): void
    {
        $this->sync($this->fribbelsHero());
        $hero = Hero::firstWhere('code', 'test-hero');
        UserBuild::factory()->count(2)->create(['hero_id' => $hero->id, 'updated_at' => now()->subDays(3)]);
        UserBuild::factory()->draft()->create(['hero_id' => $hero->id, 'updated_at' => now()->subDays(3)]);

        $this->sync($this->fribbelsHero(['calculatedStatus' => ['lv60SixStarFullyAwakened' => ['atk' => 1300]]]));

        $this->assertNotNull($hero->fresh()->game_data_changed_at);

        $news = News::sole();
        $this->assertSame('site', $news->source);
        $this->assertSame('balance', $news->category);
        $payload = json_decode($news->description, true);
        $this->assertSame([['name' => 'Test Hero', 'slug' => $hero->slug]], $payload['heroes']);
        $this->assertSame(2, $payload['affected_builds']);
    }

    public function test_changed_skill_multiplier_counts_and_same_day_changes_share_one_news(): void
    {
        $this->sync($this->fribbelsHero());
        $this->sync($this->fribbelsHero(['skills' => ['S1' => ['rate' => 1.2]]]));
        $this->sync($this->fribbelsHero(['skills' => ['S1' => ['rate' => 1.3]]]));

        $this->assertSame(1, News::count());
    }

    public function test_too_many_changes_at_once_are_not_marked(): void
    {
        $heroes = [];
        for ($i = 1; $i <= 41; $i++) {
            $heroes["Hero {$i}"] = $this->fribbelsHero(['_id' => "hero-{$i}", 'name' => "Hero {$i}"]);
        }
        Http::fake(fn ($request) => str_ends_with($request->url(), 'herodata.json') ? Http::response($heroes) : Http::response([]));
        $this->artisan('data:sync', ['--heroes-only' => true])->assertSuccessful();

        // Todos "cambian" a la vez (como si Fribbels cambiara de formato)
        foreach ($heroes as &$hero) {
            $hero['calculatedStatus']['lv60SixStarFullyAwakened']['atk'] = 999;
        }
        unset($hero);
        $this->artisan('data:sync', ['--heroes-only' => true])->assertSuccessful();

        $this->assertSame(0, Hero::whereNotNull('game_data_changed_at')->count());
        $this->assertSame(0, News::count());
    }

    /** updated_at es la última edición: si una vista o un like lo cambiaran, el aviso se perdería */
    public function test_views_and_likes_do_not_count_as_edits(): void
    {
        $build = UserBuild::factory()->create(['updated_at' => now()->subWeek()]);
        $before = $build->fresh()->updated_at;
        $fan = \App\Models\User::factory()->create();

        $this->getJson("/api/builds/{$build->id}")->assertOk()->assertJsonPath('views', 1);
        $this->withHeaders(['Authorization' => 'Bearer ' . $fan->createToken('t')->plainTextToken])
            ->postJson("/api/builds/{$build->id}/vote")->assertOk()->assertJsonPath('likes', 1);

        $this->assertEquals($before, $build->fresh()->updated_at);
        $this->assertSame(1, $build->fresh()->views);
    }

    public function test_marking_a_change_refreshes_the_cached_build_list(): void
    {
        $this->sync($this->fribbelsHero());
        $hero = Hero::firstWhere('code', 'test-hero');
        UserBuild::factory()->create(['hero_id' => $hero->id]);
        $this->assertNull($this->getJson('/api/builds')->json('data.0.hero.game_data_changed_at'));

        $this->sync($this->fribbelsHero(['calculatedStatus' => ['lv60SixStarFullyAwakened' => ['atk' => 1400]]]));

        $this->assertNotNull($this->getJson('/api/builds')->json('data.0.hero.game_data_changed_at'));
    }

    public function test_clearing_news_keeps_the_site_balance_news(): void
    {
        News::create(['title' => 'X', 'url' => 'https://x.test', 'source' => 'site', 'category' => 'balance', 'external_id' => 'site-balance-2026-10-30']);
        News::create(['title' => 'Y', 'url' => 'https://y.test', 'source' => 'youtube', 'external_id' => 'yt-1']);

        $this->artisan('app:sync-news', ['--clear' => true])->assertSuccessful();

        $this->assertSame(['site'], News::pluck('source')->all());
    }

    public function test_build_payload_carries_when_its_hero_changed(): void
    {
        $this->sync($this->fribbelsHero());
        $hero = Hero::firstWhere('code', 'test-hero');
        $build = UserBuild::factory()->create(['hero_id' => $hero->id]);
        $this->sync($this->fribbelsHero(['calculatedStatus' => ['lv60SixStarFullyAwakened' => ['spd' => 125]]]));

        $this->assertNotNull($this->getJson("/api/builds/{$build->id}")->json('hero.game_data_changed_at'));
        $this->assertNotNull($this->getJson('/api/builds')->json('data.0.hero.game_data_changed_at'));
    }
}
