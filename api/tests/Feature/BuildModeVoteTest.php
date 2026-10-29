<?php

namespace Tests\Feature;

use App\Models\Hero;
use App\Models\User;
use App\Models\UserBuild;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Nota por modo que vota la comunidad (D=1 … S=5 en PvE, Arena, GW y RTA): un voto por
 * usuario, build y modo; se cambia o se quita; el autor no vota su build; los promedios
 * quedan guardados en la build y suman en los stats del héroe.
 */
class BuildModeVoteTest extends TestCase
{
    use RefreshDatabase;

    private function bearer(User $user): array
    {
        return ['Authorization' => 'Bearer ' . $user->createToken('t')->plainTextToken];
    }

    private function vote(User $user, UserBuild $build, string $mode, ?int $tier): \Illuminate\Testing\TestResponse
    {
        $this->app['auth']->forgetGuards();

        return $this->withHeaders($this->bearer($user))
            ->postJson("/api/builds/{$build->id}/mode-votes", ['mode' => $mode, 'tier' => $tier]);
    }

    public function test_votes_are_averaged_per_mode(): void
    {
        $build = UserBuild::factory()->create();
        [$a, $b] = User::factory()->count(2)->create();

        $this->vote($a, $build, 'rta', 5)->assertOk();
        $this->vote($b, $build, 'rta', 4)
            ->assertOk()
            ->assertJsonPath('community.rta.count', 2)
            ->assertJsonPath('community.rta.avg', 4.5)
            ->assertJsonPath('my_votes.rta', 4);

        $this->vote($a, $build, 'pve', 3)->assertOk();

        $build->refresh();
        $this->assertEquals(4.5, $build->community_rta_avg);
        $this->assertSame(2, $build->community_rta_count);
        $this->assertSame(1, $build->community_pve_count);
        $this->assertSame(0, $build->community_gw_count);
        $this->assertNull($build->community_gw_avg);
    }

    public function test_changing_and_removing_a_vote(): void
    {
        $build = UserBuild::factory()->create();
        $user = User::factory()->create();

        $this->vote($user, $build, 'gw', 2)->assertOk();
        $this->vote($user, $build, 'gw', 5)->assertOk()->assertJsonPath('community.gw.avg', 5);
        $this->assertDatabaseCount('build_mode_votes', 1);

        $this->vote($user, $build, 'gw', null)
            ->assertOk()
            ->assertJsonPath('community.gw.count', 0)
            ->assertJsonPath('my_votes.gw', null);
        $this->assertDatabaseCount('build_mode_votes', 0);
    }

    public function test_author_cannot_vote_own_build(): void
    {
        $author = User::factory()->create();
        $build = UserBuild::factory()->create(['user_id' => $author->id]);

        $this->vote($author, $build, 'rta', 5)->assertForbidden();
        $this->assertDatabaseCount('build_mode_votes', 0);
    }

    public function test_drafts_cannot_be_voted(): void
    {
        $build = UserBuild::factory()->draft()->create();

        $this->vote(User::factory()->create(), $build, 'rta', 5)->assertNotFound();
    }

    public function test_guests_cannot_vote(): void
    {
        $build = UserBuild::factory()->create();

        $this->postJson("/api/builds/{$build->id}/mode-votes", ['mode' => 'rta', 'tier' => 5])->assertUnauthorized();
    }

    public function test_invalid_mode_or_tier_is_rejected(): void
    {
        $build = UserBuild::factory()->create();
        $user = User::factory()->create();

        $this->vote($user, $build, 'raid', 5)->assertStatus(422)->assertJsonValidationErrors('mode');
        $this->vote($user, $build, 'rta', 6)->assertStatus(422)->assertJsonValidationErrors('tier');
    }

    public function test_community_columns_cannot_be_set_through_the_build_form(): void
    {
        $author = User::factory()->create();
        $build = UserBuild::factory()->create(['user_id' => $author->id]);

        $this->withHeaders($this->bearer($author))
            ->putJson("/api/builds/{$build->id}", ['community_rta_avg' => 5, 'community_rta_count' => 999])
            ->assertOk();

        $this->assertSame(0, $build->fresh()->community_rta_count);
    }

    public function test_show_returns_my_votes_only_with_a_token(): void
    {
        $build = UserBuild::factory()->create();
        $user = User::factory()->create();
        $this->vote($user, $build, 'arena', 4);

        $this->app['auth']->forgetGuards();
        $this->flushHeaders(); // withHeaders queda para los pedidos siguientes: el visitante va sin token
        $this->getJson("/api/builds/{$build->id}/mode-votes")
            ->assertOk()
            ->assertJsonPath('community.arena.count', 1)
            ->assertJsonPath('my_votes', null);

        $this->app['auth']->forgetGuards();
        $this->withHeaders($this->bearer($user))
            ->getJson("/api/builds/{$build->id}/mode-votes")
            ->assertJsonPath('my_votes.arena', 4);
    }

    public function test_hero_stats_include_community_ratings_weighted_by_votes(): void
    {
        $hero = Hero::factory()->create();
        $one = UserBuild::factory()->create(['hero_id' => $hero->id]);
        $two = UserBuild::factory()->create(['hero_id' => $hero->id]);
        [$a, $b, $c] = User::factory()->count(3)->create();

        $this->vote($a, $one, 'rta', 5);
        $this->vote($b, $two, 'rta', 2);
        $this->vote($c, $two, 'rta', 2);

        $this->app['auth']->forgetGuards();
        $this->flushHeaders();
        $this->getJson("/api/heroes/{$hero->slug}/stats")
            ->assertJsonPath('data.community_ratings.rta.count', 3)
            ->assertJsonPath('data.community_ratings.rta.avg', 3)
            ->assertJsonPath('data.community_ratings.pve', null);
    }
}
