<?php

namespace Tests\Feature;

use App\Models\Hero;
use App\Models\UserBuild;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * El formulario copiaba los stats base del héroe como "stats mínimos". La migración borra,
 * clave por clave, los valores idénticos al stat base y deja los que el autor escribió.
 */
class CleanBaseStatsMigrationTest extends TestCase
{
    use RefreshDatabase;

    private function runMigration(): void
    {
        $migration = require database_path('migrations/2026_10_29_000000_clean_base_stats_from_build_min_stats.php');
        $migration->up();
    }

    public function test_removes_values_equal_to_base_stats_and_keeps_the_rest(): void
    {
        $hero = Hero::factory()->create(['base_stats' => [
            'atk' => 830, 'hp' => 6619, 'def' => 713, 'spd' => 106,
            'crit_chance' => 15, 'crit_dmg' => 150, 'eff' => 0, 'res' => 0,
        ]]);

        $copied = UserBuild::factory()->create(['hero_id' => $hero->id, 'min_stats' => [
            'atk' => 830, 'hp' => 6619, 'def' => 713, 'spd' => 106,
            'crit_chance' => 15, 'crit_dmg' => 150, 'eff' => 0, 'res' => 0,
        ]]);
        $mixed = UserBuild::factory()->create(['hero_id' => $hero->id, 'min_stats' => [
            'atk' => 830, 'hp' => 22000, 'spd' => 220, 'crit_chance' => 15, 'res' => 100,
        ]]);
        $untouched = UserBuild::factory()->create(['hero_id' => $hero->id, 'min_stats' => ['hp' => 20000]]);
        $empty = UserBuild::factory()->create(['hero_id' => $hero->id, 'min_stats' => null]);

        $this->runMigration();
        $this->runMigration(); // idempotente

        $this->assertNull($copied->fresh()->min_stats);
        $this->assertSame(['hp' => 22000, 'spd' => 220, 'res' => 100], $mixed->fresh()->min_stats);
        $this->assertSame(['hp' => 20000], $untouched->fresh()->min_stats);
        $this->assertNull($empty->fresh()->min_stats);
    }
}
