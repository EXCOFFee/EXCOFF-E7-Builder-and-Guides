<?php

namespace Tests\Feature;

use App\Models\Hero;
use App\Models\User;
use App\Models\UserBuild;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Pros y contras de las builds: solo IDs del catálogo (config/build_tags.php), como máximo 5
 * por lado, notas de hasta 200 caracteres, y filtro de la lista por tags (incluir / excluir).
 */
class BuildTagsTest extends TestCase
{
    use RefreshDatabase;

    private function create(array $tags): \Illuminate\Testing\TestResponse
    {
        $user = User::factory()->create();

        return $this->actingAs($user)->postJson('/api/builds', array_merge([
            'hero_id' => Hero::factory()->create()->id,
            'title' => 'Tag build',
        ], $tags));
    }

    public function test_valid_tags_are_saved_and_plain_ids_become_objects(): void
    {
        $this->create([
            'pro_tags' => json_encode([['id' => 'team_cr_push', 'note' => 'S3'], 'aoe_damage']),
            'con_tags' => json_encode([['id' => 'needs_dupes']]),
        ])->assertCreated();

        $build = UserBuild::first();
        $this->assertSame([['id' => 'team_cr_push', 'note' => 'S3'], ['id' => 'aoe_damage']], $build->pro_tags);
        $this->assertSame([['id' => 'needs_dupes']], $build->con_tags);
    }

    public function test_unknown_tag_is_rejected(): void
    {
        $this->create(['pro_tags' => json_encode([['id' => 'not_a_tag']])])
            ->assertStatus(422)
            ->assertJsonValidationErrors('pro_tags.0.id');
    }

    public function test_con_tag_cannot_be_used_as_pro(): void
    {
        $this->create(['pro_tags' => json_encode([['id' => 'needs_dupes']])])
            ->assertStatus(422);
    }

    public function test_at_most_five_tags_per_side_and_short_notes(): void
    {
        $six = array_map(fn ($id) => ['id' => $id], ['stun', 'sleep', 'silence', 'provoke', 'restrict', 'aoe_damage']);
        $this->create(['pro_tags' => json_encode($six)])->assertStatus(422);

        $this->create(['pro_tags' => json_encode([['id' => 'stun', 'note' => str_repeat('a', 201)]])])
            ->assertStatus(422)
            ->assertJsonValidationErrors('pro_tags.0.note');
    }

    public function test_same_tag_twice_is_rejected(): void
    {
        $this->create(['pro_tags' => json_encode([['id' => 'stun'], ['id' => 'stun']])])
            ->assertStatus(422);
    }

    public function test_broken_json_is_rejected_instead_of_clearing_tags(): void
    {
        $owner = User::factory()->create();
        $build = UserBuild::factory()->create(['user_id' => $owner->id, 'con_tags' => [['id' => 'weak_to_cc']]]);

        $this->actingAs($owner)
            ->putJson("/api/builds/{$build->id}", ['con_tags' => '[{"id":"weak_to_cc"'])
            ->assertStatus(422);

        $this->assertSame([['id' => 'weak_to_cc']], $build->fresh()->con_tags);
    }

    public function test_update_validates_tags_too(): void
    {
        $owner = User::factory()->create();
        $build = UserBuild::factory()->create(['user_id' => $owner->id]);

        $this->actingAs($owner)
            ->putJson("/api/builds/{$build->id}", ['con_tags' => json_encode([['id' => 'stun']])])
            ->assertStatus(422);

        $this->actingAs($owner)
            ->putJson("/api/builds/{$build->id}", ['con_tags' => json_encode([['id' => 'weak_to_cc']])])
            ->assertOk();
        $this->assertSame([['id' => 'weak_to_cc']], $build->fresh()->con_tags);
    }

    public function test_list_filters_by_included_and_excluded_tags(): void
    {
        UserBuild::factory()->create(['title' => 'Pusher', 'pro_tags' => [['id' => 'team_cr_push']], 'con_tags' => [['id' => 'needs_dupes']]]);
        UserBuild::factory()->create(['title' => 'Pusher sin dupes', 'pro_tags' => [['id' => 'team_cr_push'], ['id' => 'aoe_damage']]]);
        UserBuild::factory()->create(['title' => 'Otro', 'pro_tags' => [['id' => 'aoe_damage']]]);

        $titles = fn (string $query) => collect($this->getJson("/api/builds?{$query}")->assertOk()->json('data'))
            ->pluck('title')->sort()->values()->all();

        $this->assertSame(['Pusher', 'Pusher sin dupes'], $titles('tags[]=team_cr_push'));
        $this->assertSame(['Pusher sin dupes'], $titles('tags[]=team_cr_push&tags[]=aoe_damage'));
        $this->assertSame(['Pusher sin dupes'], $titles('tags=team_cr_push&exclude_tags=needs_dupes'));
        $this->assertSame(['Otro', 'Pusher sin dupes'], $titles('exclude_tags[]=needs_dupes'));
    }

    public function test_unknown_filter_tags_are_ignored(): void
    {
        UserBuild::factory()->create(['pro_tags' => [['id' => 'aoe_damage']]]);

        $this->assertCount(1, $this->getJson('/api/builds?tags[]=whatever')->assertOk()->json('data'));
    }
}
