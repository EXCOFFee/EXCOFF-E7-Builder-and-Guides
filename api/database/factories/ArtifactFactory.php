<?php

namespace Database\Factories;

use App\Models\Artifact;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Artifact>
 */
class ArtifactFactory extends Factory
{
    protected $model = Artifact::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $classes = ['warrior', 'knight', 'thief', 'ranger', 'mage', 'soul_weaver', 'common'];
        $rarities = [3, 4, 5];
        
        $name = $this->faker->unique()->words(3, true);
        
        return [
            'name' => ucwords($name),
            'code' => 'a' . $this->faker->unique()->numberBetween(1000, 9999),
            'class' => $this->faker->randomElement($classes),
            'rarity' => $this->faker->randomElement($rarities),
            'exclusive' => false,
            'image_url' => '/images/artifacts/default.png',
        ];
    }

    /**
     * Indicate that the artifact is 5-star rarity.
     */
    public function fiveStar(): static
    {
        return $this->state(fn (array $attributes) => [
            'rarity' => 5,
        ]);
    }

    /**
     * Indicate that the artifact is exclusive to a class.
     */
    public function forClass(string $class): static
    {
        return $this->state(fn (array $attributes) => [
            'class' => $class,
        ]);
    }
}
