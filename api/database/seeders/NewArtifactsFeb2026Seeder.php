<?php

namespace Database\Seeders;

use App\Models\Artifact;
use Illuminate\Database\Seeder;

class NewArtifactsFeb2026Seeder extends Seeder
{
    /**
     * Run the database seeds to add Gifted Pen and Unleashed Axe of Heavenly Mandate.
     */
    public function run(): void
    {
        // 1. Gifted Pen (Ruiza's artifact)
        Artifact::updateOrCreate(
            ['code' => 'gifted-pen'],
            [
                'name' => 'Gifted Pen',
                'name_es' => 'Pluma de Distinción',
                'slug' => 'gifted-pen',
                'class' => 'ranger',
                'rarity' => 5,
                'description' => "Increases Effectiveness by 10% (Max 15%). After attacking with a Single Attack except for the basic skill, inflicts decreased Hit Chance on the target for 2 turns, and increases Combat Readiness of the ally in the back row by 20% (Max 30%). Can only be activated once every 3 turns.",
                'image_url' => 'https://raw.githubusercontent.com/CeciliaBot/E7Assets-Temp/main/assets/item_arti/art0235_fu.png',
            ]
        );

        $this->command->info('Gifted Pen (art0235) artifact added successfully!');

        // 2. Unleashed Axe of Heavenly Mandate
        Artifact::updateOrCreate(
            ['code' => 'unleashed-axe-of-heavenly-mandate'],
            [
                'name' => 'Unleashed Axe of Heavenly Mandate',
                'name_es' => 'Hacha Desatada del Mandato Celestial',
                'slug' => 'unleashed-axe-of-heavenly-mandate',
                'class' => 'common', // All classes
                'rarity' => 5,
                'description' => "Increases Critical Hit Chance by 6% (Max 10%), and Hit Chance by 12% (Max 20%).",
                'image_url' => 'https://raw.githubusercontent.com/CeciliaBot/E7Assets-Temp/main/assets/item_arti/art0239_fu.png',
            ]
        );

        $this->command->info('Unleashed Axe of Heavenly Mandate (art0239) artifact added successfully!');
    }
}
