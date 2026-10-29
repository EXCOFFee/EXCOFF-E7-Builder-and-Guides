<?php

namespace Tests\Feature;

use App\Models\Hero;
use App\Models\User;
use App\Models\UserBuild;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * El formulario de edición (BuildForm) manda todos los campos, también los vacíos,
 * para que el usuario pueda borrar lo que había cargado.
 */
class BuildUpdateTest extends TestCase
{
    use RefreshDatabase;

    private function makeBuild(User $owner, array $extra = []): UserBuild
    {
        return UserBuild::create(array_merge([
            'user_id' => $owner->id,
            'hero_id' => Hero::factory()->create()->id,
            'title' => 'Speed build',
            'description' => 'Old description',
            'primary_set' => 'set_speed',
            'synergy_heroes' => [['id' => 1, 'note' => 'x']],
            'pro_tags' => [['id' => 'tanky']],
            'images' => [config('app.url') . '/storage/builds/a.png'],
            'status' => 'published',
            'language' => 'en',
        ], $extra));
    }

    /** Lo que envía BuildForm en modo edición: multipart con _method=PUT */
    private function formPayload(array $overrides = []): array
    {
        return $overrides + [
            '_method' => 'PUT',
            'title' => 'Speed build',
            'description' => '',
            'primary_set' => '',
            'secondary_set' => '',
            'artifact_id' => '',
            'min_stats' => '{}',
            'synergy_heroes' => '[]',
            'counter_heroes' => '[]',
            'pro_tags' => '[]',
            'con_tags' => '[]',
            'image_urls' => '[]',
            'is_anonymous' => '0',
            'language' => 'en',
        ];
    }

    public function test_edit_form_can_clear_optional_fields_and_images(): void
    {
        $owner = User::factory()->create();
        $build = $this->makeBuild($owner);

        $this->actingAs($owner)
            ->post("/api/builds/{$build->id}", $this->formPayload())
            ->assertOk();

        $build->refresh();
        $this->assertNull($build->description);
        $this->assertNull($build->primary_set);
        $this->assertSame([], $build->synergy_heroes);
        $this->assertSame([], $build->pro_tags);
        $this->assertSame([], $build->images);
    }

    public function test_edit_form_keeps_owned_images_it_sends_back(): void
    {
        $owner = User::factory()->create();
        $kept = config('app.url') . '/storage/builds/a.png';
        $build = $this->makeBuild($owner);

        $this->actingAs($owner)
            ->post("/api/builds/{$build->id}", $this->formPayload(['image_urls' => json_encode([$kept])]))
            ->assertOk();

        $this->assertSame([$kept], $build->fresh()->images);
    }

    public function test_update_without_image_fields_leaves_images_alone(): void
    {
        $owner = User::factory()->create();
        $build = $this->makeBuild($owner);

        $this->actingAs($owner)
            ->putJson("/api/builds/{$build->id}", ['title' => 'Only the title'])
            ->assertOk();

        $this->assertCount(1, $build->fresh()->images);
    }

    public function test_min_stat_filters_use_the_stored_stat_keys(): void
    {
        $owner = User::factory()->create();
        $this->makeBuild($owner, ['title' => 'Crit build', 'min_stats' => ['crit_chance' => 100, 'crit_dmg' => 300]]);
        $this->makeBuild($owner, ['title' => 'Tank build', 'min_stats' => ['crit_chance' => 15, 'crit_dmg' => 150]]);

        foreach (['min_crit=90', 'min_cdmg=250'] as $filter) {
            $titles = collect($this->getJson("/api/builds?{$filter}")->assertOk()->json('data'))->pluck('title');
            $this->assertSame(['Crit build'], $titles->all(), $filter);
        }
    }

    public function test_migration_moves_legacy_min_stats_keys(): void
    {
        $owner = User::factory()->create();
        $legacy = $this->makeBuild($owner, ['min_stats' => ['atk' => 1000, 'chc' => 100, 'chd' => 250, 'efr' => 0]]);
        $both = $this->makeBuild($owner, ['min_stats' => ['crit_chance' => 90, 'chc' => 100]]);
        $clean = $this->makeBuild($owner, ['min_stats' => ['crit_chance' => 50]]);

        $migration = require database_path('migrations/2026_10_28_000001_normalize_build_min_stats_keys.php');
        $migration->up();
        $migration->up(); // idempotente

        $this->assertSame(['atk' => 1000, 'crit_chance' => 100, 'crit_dmg' => 250], $legacy->fresh()->min_stats);
        $this->assertSame(['crit_chance' => 90], $both->fresh()->min_stats);
        $this->assertSame(['crit_chance' => 50], $clean->fresh()->min_stats);
    }

    public function test_edit_form_preserves_anonymous_flag(): void
    {
        $owner = User::factory()->create();
        $build = $this->makeBuild($owner, ['is_anonymous' => true]);

        $this->actingAs($owner)
            ->post("/api/builds/{$build->id}", $this->formPayload(['is_anonymous' => '1']))
            ->assertOk();

        $this->assertTrue((bool) $build->fresh()->is_anonymous);
    }
}
