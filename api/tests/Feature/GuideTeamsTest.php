<?php

namespace Tests\Feature;

use App\Models\Guide;
use App\Models\Hero;
use App\Models\User;
use App\Models\UserBuild;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * Equipos dentro de las guías: cada héroe del equipo va atado a una build publicada de ese
 * héroe. Se validan al guardar y se indexan en guide_team_builds ("usada en N guías").
 */
class GuideTeamsTest extends TestCase
{
    use RefreshDatabase;

    private User $author;

    protected function setUp(): void
    {
        parent::setUp();
        $this->author = User::factory()->create();
    }

    private function postGuide(array $teams, array $extra = [])
    {
        return $this->actingAs($this->author, 'sanctum')->postJson('/api/guides', array_merge([
            'title' => 'Arena offense',
            'category' => 'arena',
            'gameplay_content' => 'How to play it',
            'teams' => json_encode($teams),
        ], $extra));
    }

    /** @return array{0: Hero, 1: UserBuild} */
    private function heroWithBuild(array $build = []): array
    {
        $hero = Hero::factory()->create();

        return [$hero, UserBuild::factory()->create(array_merge(['hero_id' => $hero->id], $build))];
    }

    public function test_saves_a_team_tied_to_builds_and_indexes_it(): void
    {
        [$a, $buildA] = $this->heroWithBuild();
        [$b, $buildB] = $this->heroWithBuild();

        $guide = $this->postGuide([[
            'name' => 'Cleave',
            'mode' => 'arena',
            'note' => 'Open with A',
            'heroes' => [
                ['hero_id' => $a->id, 'build_id' => $buildA->id, 'note' => 'Opener'],
                ['hero_id' => $b->id, 'build_id' => $buildB->id],
            ],
        ]])->assertCreated()->json();

        $this->assertSame('arena', $guide['teams'][0]['mode']);
        $this->assertSame($buildA->id, $guide['teams'][0]['heroes'][0]['build_id']);
        $this->assertSame(2, DB::table('guide_team_builds')->where('guide_id', $guide['id'])->count());
    }

    public function test_rejects_invalid_teams(): void
    {
        [$a, $buildA] = $this->heroWithBuild();
        [$b, $buildB] = $this->heroWithBuild();
        [, $draft] = $this->heroWithBuild(['status' => 'draft']);
        $heroes = fn (int $n) => array_map(function () {
            [$hero, $build] = $this->heroWithBuild();

            return ['hero_id' => $hero->id, 'build_id' => $build->id];
        }, range(1, $n));

        $cases = [
            'unknown mode' => [['name' => 'X', 'mode' => 'raid', 'heroes' => [['hero_id' => $a->id, 'build_id' => $buildA->id]]]],
            'too many for GW' => [['name' => 'X', 'mode' => 'gw_attack', 'heroes' => $heroes(4)]],
            'build of another hero' => [['name' => 'X', 'mode' => 'pve', 'heroes' => [['hero_id' => $a->id, 'build_id' => $buildB->id]]]],
            'build not published' => [['name' => 'X', 'mode' => 'pve', 'heroes' => [['hero_id' => $draft->hero_id, 'build_id' => $draft->id]]]],
            'missing build' => [['name' => 'X', 'mode' => 'pve', 'heroes' => [['hero_id' => $a->id]]]],
            'repeated hero' => [['name' => 'X', 'mode' => 'pve', 'heroes' => [['hero_id' => $a->id, 'build_id' => $buildA->id], ['hero_id' => $a->id, 'build_id' => $buildA->id]]]],
        ];

        foreach ($cases as $label => $teams) {
            $this->postGuide($teams)->assertStatus(422)->assertJsonValidationErrors('teams');
        }
        $this->postGuide([], ['teams' => '{not json'])->assertStatus(422)->assertJsonValidationErrors('teams');
        $this->assertSame(0, Guide::count(), 'ninguna guía inválida se guardó');
    }

    public function test_old_teams_without_mode_are_kept(): void
    {
        $hero = Hero::factory()->create();

        $guide = $this->postGuide([['name' => 'Old', 'heroes' => [['hero_id' => $hero->id, 'sets' => ['speed'], 'stats' => '250+ spd', 'note' => 'x']]]])
            ->assertCreated()->json();

        $this->assertSame('250+ spd', $guide['teams'][0]['heroes'][0]['stats']);
        $this->assertSame(0, DB::table('guide_team_builds')->count());
    }

    public function test_show_embeds_team_builds_respecting_anonymous_authors(): void
    {
        [$a, $buildA] = $this->heroWithBuild(['title' => 'Speedy A']);
        [$b, $buildB] = $this->heroWithBuild(['is_anonymous' => true]);
        $guide = $this->postGuide([['name' => 'T', 'mode' => 'rta', 'heroes' => [
            ['hero_id' => $a->id, 'build_id' => $buildA->id],
            ['hero_id' => $b->id, 'build_id' => $buildB->id],
        ]]])->json();

        $shown = $this->getJson("/api/guides/{$guide['slug']}")->assertOk()->json();

        $this->assertSame('Speedy A', $shown['team_builds'][$buildA->id]['title']);
        $this->assertSame($a->slug, $shown['team_builds'][$buildA->id]['hero']['slug']);
        $this->assertNull($shown['team_builds'][$buildB->id]['user']);
        $this->assertArrayNotHasKey('user_id', $shown['team_builds'][$buildB->id]);
    }

    public function test_deleted_build_leaves_the_slot_and_drops_the_index(): void
    {
        [$a, $buildA] = $this->heroWithBuild();
        $guide = $this->postGuide([['name' => 'T', 'mode' => 'pve', 'heroes' => [['hero_id' => $a->id, 'build_id' => $buildA->id]]]])->json();

        $buildA->delete();

        $this->assertSame(0, DB::table('guide_team_builds')->count());
        $shown = $this->getJson("/api/guides/{$guide['slug']}")->assertOk()->json();
        $this->assertSame($a->id, $shown['teams'][0]['heroes'][0]['hero_id']);
        $this->assertEmpty($shown['team_builds']);
        $this->assertSame($a->name, $shown['team_heroes'][$a->id]['name']);
    }

    public function test_update_replaces_and_clears_teams(): void
    {
        [$a, $buildA] = $this->heroWithBuild();
        [$b, $buildB] = $this->heroWithBuild();
        $guide = $this->postGuide([['name' => 'T', 'mode' => 'pve', 'heroes' => [['hero_id' => $a->id, 'build_id' => $buildA->id]]]])->json();

        $this->actingAs($this->author, 'sanctum')->putJson("/api/guides/{$guide['slug']}", [
            'teams' => json_encode([['name' => 'T', 'mode' => 'pve', 'heroes' => [['hero_id' => $b->id, 'build_id' => $buildB->id]]]]),
        ])->assertOk();
        $this->assertSame([$buildB->id], DB::table('guide_team_builds')->pluck('build_id')->all());

        $this->actingAs($this->author, 'sanctum')->putJson("/api/guides/{$guide['slug']}", ['teams' => '[]'])->assertOk();
        $this->assertSame(0, DB::table('guide_team_builds')->count());
        $this->assertSame([], Guide::first()->teams);
    }

    public function test_hero_filter_finds_guides_where_the_hero_is_in_a_team(): void
    {
        [$a, $buildA] = $this->heroWithBuild();
        $this->postGuide([['name' => 'T', 'mode' => 'pve', 'heroes' => [['hero_id' => $a->id, 'build_id' => $buildA->id]]]], ['title' => 'Team guide']);
        Guide::factory()->create(['title' => 'About the hero', 'hero_id' => $a->id]);
        Guide::factory()->create(['title' => 'Unrelated']);

        $titles = collect($this->getJson("/api/guides?hero={$a->slug}")->json('data'))->pluck('title')->sort()->values()->all();
        $this->assertSame(['About the hero', 'Team guide'], $titles);

        $byBuild = collect($this->getJson("/api/guides?build={$buildA->id}")->json('data'))->pluck('title')->all();
        $this->assertSame(['Team guide'], $byBuild);
    }

    public function test_build_detail_counts_published_guides_using_it(): void
    {
        [$a, $buildA] = $this->heroWithBuild();
        $this->postGuide([['name' => 'T', 'mode' => 'pve', 'heroes' => [['hero_id' => $a->id, 'build_id' => $buildA->id]]]]);
        $draft = $this->postGuide([['name' => 'T', 'mode' => 'pve', 'heroes' => [['hero_id' => $a->id, 'build_id' => $buildA->id]]]])->json();
        Guide::whereKey($draft['id'])->update(['is_published' => false]);

        $this->getJson("/api/builds/{$buildA->id}")->assertJsonPath('guides_count', 1);
    }
}
