<?php

namespace Database\Seeders;

use App\Models\Artifact;
use Illuminate\Database\Seeder;

class TomeOfLifesEndSeeder extends Seeder
{
    /**
     * Run the database seeds to add Tome of the Life's End artifact.
     */
    public function run(): void
    {
        Artifact::updateOrCreate(
            ['code' => 'tome-of-the-lifes-end'],
            [
                'name' => "Tome of the Life's End",
                'slug' => 'tome-of-the-lifes-end',
                'class' => 'warrior',
                'rarity' => 5,
                'description' => "Hecate's exclusive artifact.",
                'image_url' => null, // Will use datamined images
            ]
        );

        $this->command->info("Tome of the Life's End artifact added successfully!");
    }
}
