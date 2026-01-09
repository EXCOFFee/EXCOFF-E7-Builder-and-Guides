<?php

namespace Database\Seeders;

use App\Models\Artifact;
use Illuminate\Database\Seeder;

class RitualOfSealingFlamesSeeder extends Seeder
{
    /**
     * Run the database seeds to add Ritual of Sealing Flames artifact.
     */
    public function run(): void
    {
        Artifact::updateOrCreate(
            ['code' => 'ritual-of-sealing-flames'],
            [
                'name' => 'Ritual of Sealing Flames',
                'name_ko' => '봉인의 불꽃 의식',
                'name_ja' => '封印の炎の儀式',
                'name_zh' => '封印之焰仪式',
                'slug' => 'ritual-of-sealing-flames',
                'class' => 'warrior',
                'rarity' => 5,
                'description' => "Aki's exclusive artifact. Enhances burn damage and detonation effects.",
                'image_url' => null, // Will use datamined images from NEW_ARTIFACT_ICONS
            ]
        );

        $this->command->info('Ritual of Sealing Flames artifact added successfully!');
    }
}
