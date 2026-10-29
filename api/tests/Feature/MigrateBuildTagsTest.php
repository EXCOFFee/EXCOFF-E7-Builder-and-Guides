<?php

namespace Tests\Feature;

use App\Models\Hero;
use App\Models\UserBuild;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Migración de los tags de las builds al catálogo nuevo (tabla en
 * database/data/tag_migration_2026_10.json): convierte IDs viejos y huérfanos, une duplicados
 * conservando la nota, pasa los "Débil vs [héroe]" a counters y descarta lo que no tiene equivalente.
 */
class MigrateBuildTagsTest extends TestCase
{
    use RefreshDatabase;

    private function runMigration(): void
    {
        $migration = require database_path('migrations/2026_10_29_000002_migrate_build_tags_to_new_catalog.php');
        $migration->up();
    }

    public function test_converts_merges_moves_to_counters_and_drops(): void
    {
        $belian = Hero::factory()->create(['slug' => 'belian', 'name' => 'Belian']);
        $ally = Hero::factory()->create();

        $build = UserBuild::factory()->create([
            'pro_tags' => [
                ['id' => 'cr_pusher', 'note' => 'S2 push'],      // huérfano -> team_cr_push
                ['id' => 'max_hp_scaling'],                       // -> damage_hp_scaling
                ['id' => 'damage_hp_scaling', 'note' => 'S1'],    // duplicado tras convertir: queda uno
                ['id' => 'counter_set_best'],                     // se descarta
                'aoe_damage',                                     // formato viejo (string)
            ],
            'con_tags' => [
                ['id' => 'countered_by_belian', 'note' => 'su S3'], // -> counter Belian
                ['id' => 'requires_high_speed'],                     // -> needs_max_speed
                ['id' => 'weak_to_cc'],                              // ya es del catálogo nuevo
            ],
            'counter_heroes' => [['id' => $ally->id, 'note' => 'x']],
        ]);

        $this->runMigration();
        $this->runMigration(); // idempotente

        $build->refresh();
        $this->assertSame([
            ['id' => 'team_cr_push', 'note' => 'S2 push'],
            ['id' => 'damage_hp_scaling', 'note' => 'S1'],
            ['id' => 'aoe_damage'],
        ], $build->pro_tags);
        $this->assertSame([['id' => 'needs_max_speed'], ['id' => 'weak_to_cc']], $build->con_tags);
        $this->assertSame([
            ['id' => $ally->id, 'note' => 'x'],
            ['id' => $belian->id, 'note' => 'su S3'],
        ], $build->counter_heroes);
    }

    /** En el deploy el caché de config puede ser de antes de que existiera build_tags.php */
    public function test_works_without_the_catalog_in_config(): void
    {
        config(['build_tags' => null]);
        $build = UserBuild::factory()->create(['pro_tags' => [['id' => 'cr_pusher']]]);

        $this->runMigration();

        $this->assertSame([['id' => 'team_cr_push']], $build->fresh()->pro_tags);
    }

    public function test_counter_hero_already_listed_is_not_duplicated(): void
    {
        $belian = Hero::factory()->create(['slug' => 'belian', 'name' => 'Belian']);
        $build = UserBuild::factory()->create([
            'con_tags' => [['id' => 'countered_by_belian']],
            'counter_heroes' => [$belian->id],
        ]);

        $this->runMigration();

        $build->refresh();
        $this->assertSame([], $build->con_tags);
        $this->assertSame([$belian->id], $build->counter_heroes);
    }
}
