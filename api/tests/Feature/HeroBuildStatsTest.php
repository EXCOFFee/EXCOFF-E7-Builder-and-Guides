<?php

namespace Tests\Feature;

use App\Models\Artifact;
use App\Models\Hero;
use App\Models\UserBuild;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * GET /api/heroes/{slug}/stats: agrega solo builds publicadas, con las claves de stats
 * que guarda el formulario, y se actualiza en cuanto cambia una build (sin esperar el caché).
 */
class HeroBuildStatsTest extends TestCase
{
    use RefreshDatabase;

    private function stats(Hero $hero): array
    {
        return $this->getJson("/api/heroes/{$hero->slug}/stats")->assertOk()->json('data');
    }

    public function test_only_published_builds_are_counted(): void
    {
        $hero = Hero::factory()->create();
        UserBuild::factory()->create(['hero_id' => $hero->id, 'primary_set' => 'set_speed']);
        UserBuild::factory()->draft()->create(['hero_id' => $hero->id, 'primary_set' => 'set_att']);

        $stats = $this->stats($hero);

        $this->assertSame(1, $stats['total_builds']);
        $this->assertSame(['set_speed'], array_column($stats['primary_sets'], 'set'));
    }

    public function test_priority_stats_read_the_keys_the_form_stores(): void
    {
        $hero = Hero::factory()->create();
        UserBuild::factory()->create(['hero_id' => $hero->id, 'min_stats' => ['crit_chance' => 100, 'crit_dmg' => 250, 'res' => 80]]);
        UserBuild::factory()->create(['hero_id' => $hero->id, 'min_stats' => ['crit_chance' => 80, 'crit_dmg' => 300]]);

        $byStat = collect($this->stats($hero)['priority_stats'])->keyBy('stat');

        $this->assertEquals(90, $byStat['crit_chance']['average_value']);
        $this->assertEquals(275, $byStat['crit_dmg']['average_value']);
        $this->assertEquals(80, $byStat['res']['average_value']);
        $this->assertSame(1, $byStat['res']['count']);
        $this->assertArrayNotHasKey('chc', $byStat->all());
    }

    public function test_artifacts_synergies_and_counters_are_resolved(): void
    {
        $hero = Hero::factory()->create();
        $ally = Hero::factory()->create();
        $enemy = Hero::factory()->create();
        $artifact = Artifact::factory()->create();

        UserBuild::factory()->count(2)->create([
            'hero_id' => $hero->id,
            'artifact_id' => $artifact->id,
            'synergy_heroes' => [['id' => $ally->id, 'note' => 'x']],
            'counter_heroes' => [$enemy->id],
        ]);

        $stats = $this->stats($hero);

        $this->assertSame($artifact->id, $stats['artifacts'][0]['artifact_id']);
        $this->assertSame(2, $stats['artifacts'][0]['count']);
        $this->assertSame($ally->slug, $stats['synergy_heroes'][0]['slug']);
        $this->assertSame($enemy->slug, $stats['counter_heroes'][0]['slug']);
    }

    public function test_new_build_shows_up_without_waiting_for_the_cache(): void
    {
        $hero = Hero::factory()->create();
        UserBuild::factory()->create(['hero_id' => $hero->id]);
        $this->assertSame(1, $this->stats($hero)['total_builds']);

        $build = UserBuild::factory()->create(['hero_id' => $hero->id]);
        $this->assertSame(2, $this->stats($hero)['total_builds']);

        $build->delete();
        $this->assertSame(1, $this->stats($hero)['total_builds']);
    }
}
