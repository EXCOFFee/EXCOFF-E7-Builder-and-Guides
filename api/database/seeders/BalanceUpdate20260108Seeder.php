<?php

namespace Database\Seeders;

use App\Models\Hero;
use Illuminate\Database\Seeder;

class BalanceUpdate20260108Seeder extends Seeder
{
    /**
     * Run the database seeds to apply balance patch 2026-01-08.
     */
    public function run(): void
    {
        // Last Rider Krau: S2 Barrier 10% -> 14% (15% -> 21% at max)
        $hero = Hero::where('slug', 'last-rider-krau')->first();
        if ($hero) {
            $skills = $hero->skills ?? [];
            $skills['S2']['barrier_base'] = 0.14;
            $skills['S2']['barrier_max'] = 0.21;
            $skills['S2']['notes'] = 'Barrier from 10% to 14% caster max HP (15% to 21% at max enhance)';
            $hero->skills = $skills;
            $hero->data_hash = md5($hero->data_hash . '-balance-2026-01-08');
            $hero->save();
            $this->command->info('✓ Last Rider Krau updated');
        }

        // Dragon Bride Senya: S3 Health scaling 9% -> 11%, removed 11% from soulburn
        $hero = Hero::where('slug', 'dragon-bride-senya')->first();
        if ($hero) {
            $skills = $hero->skills ?? [];
            $skills['S3']['hp_scaling'] = 0.11;
            $skills['S3']['soulburn_hp_scaling'] = 0;
            $skills['S3']['notes'] = 'Health scaling from 9% to 11%, removed 11% health scaling from soulburn';
            $hero->skills = $skills;
            $hero->data_hash = md5($hero->data_hash . '-balance-2026-01-08');
            $hero->save();
            $this->command->info('✓ Dragon Bride Senya updated');
        }

        // Hwayoung: S3 Penetration from 0.000196 to 0.000213 * ATK_DIFF
        $hero = Hero::where('slug', 'hwayoung')->first();
        if ($hero) {
            $skills = $hero->skills ?? [];
            $skills['S3']['penetration_rate'] = 0.000213;
            $skills['S3']['notes'] = 'Penetration from 0.000196 to 0.000213 * ATK_DIFF (4.695 ATK diff for 100% pen)';
            $hero->skills = $skills;
            $hero->data_hash = md5($hero->data_hash . '-balance-2026-01-08');
            $hero->save();
            $this->command->info('✓ Hwayoung updated');
        }

        // Landy: S3 Barrier 80% ATK
        $hero = Hero::where('slug', 'landy')->first();
        if ($hero) {
            $skills = $hero->skills ?? [];
            $skills['S3']['barrier'] = 0.80;
            $skills['S3']['barrier_stat'] = 'atk';
            $skills['S3']['notes'] = 'Added barrier 80% caster Attack';
            $hero->skills = $skills;
            $hero->data_hash = md5($hero->data_hash . '-balance-2026-01-08');
            $hero->save();
            $this->command->info('✓ Landy updated');
        }

        // Midnight Gala Lilias: S1 Heal 30% -> 40% ATK, S1 SB att_rate 1.1 -> 1.8, heal 50% -> 40%
        $hero = Hero::where('slug', 'midnight-gala-lilias')->first();
        if ($hero) {
            $skills = $hero->skills ?? [];
            $skills['S1']['heal'] = 0.40;
            $skills['S1']['soulburn_rate'] = 1.8;
            $skills['S1']['soulburn_heal'] = 0.40;
            $skills['S1']['notes'] = 'Heal from 30% to 40% ATK, SB att_rate from 1.1 to 1.8, SB heal from 50% to 40% ATK';
            $hero->skills = $skills;
            $hero->data_hash = md5($hero->data_hash . '-balance-2026-01-08');
            $hero->save();
            $this->command->info('✓ Midnight Gala Lilias updated');
        }

        // Savior Adin: S3 att_rate 1.1 -> 1.2, SB att_rate 1.65
        $hero = Hero::where('slug', 'savior-adin')->first();
        if ($hero) {
            $skills = $hero->skills ?? [];
            $skills['S3']['rate'] = 1.2;
            $skills['S3']['soulburn_rate'] = 1.65;
            $skills['S3']['soulburn_pow'] = 1.0;
            $skills['S3']['notes'] = 'att_rate from 1.1 to 1.2, SB att_rate 1.65 pow 1.0';
            $hero->skills = $skills;
            $hero->data_hash = md5($hero->data_hash . '-balance-2026-01-08');
            $hero->save();
            $this->command->info('✓ Savior Adin updated');
        }

        $this->command->info('');
        $this->command->info('🎮 Balance Update 2026-01-08 applied successfully!');
    }
}
