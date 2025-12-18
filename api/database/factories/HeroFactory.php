<?php

namespace Database\Factories;

use App\Models\Hero;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Hero>
 */
class HeroFactory extends Factory
{
    protected $model = Hero::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $elements = ['fire', 'ice', 'earth', 'light', 'dark'];
        $classes = ['warrior', 'knight', 'thief', 'ranger', 'mage', 'soul_weaver'];
        $rarities = [3, 4, 5];
        
        $name = $this->faker->unique()->firstName() . ' ' . $this->faker->lastName();
        
        return [
            'name' => $name,
            'slug' => Str::slug($name),
            'code' => 'c' . $this->faker->unique()->numberBetween(1000, 9999),
            'element' => $this->faker->randomElement($elements),
            'class' => $this->faker->randomElement($classes),
            'rarity' => $this->faker->randomElement($rarities),
            'zodiac' => $this->faker->randomElement(['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo']),
            'portrait' => '/images/heroes/default.png',
            'description' => $this->faker->paragraph(),
        ];
    }

    /**
     * Indicate that the hero is fire element.
     */
    public function fire(): static
    {
        return $this->state(fn (array $attributes) => [
            'element' => 'fire',
        ]);
    }

    /**
     * Indicate that the hero is 5-star rarity.
     */
    public function fiveStar(): static
    {
        return $this->state(fn (array $attributes) => [
            'rarity' => 5,
        ]);
    }

    /**
     * Indicate that the hero is a warrior.
     */
    public function warrior(): static
    {
        return $this->state(fn (array $attributes) => [
            'class' => 'warrior',
        ]);
    }
}
