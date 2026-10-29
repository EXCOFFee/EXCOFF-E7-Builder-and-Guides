<?php

namespace Database\Factories;

use App\Models\Hero;
use App\Models\User;
use App\Models\UserBuild;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\UserBuild>
 */
class UserBuildFactory extends Factory
{
    protected $model = UserBuild::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'hero_id' => Hero::factory(),
            'title' => $this->faker->sentence(3),
            'description' => $this->faker->sentence(),
            'primary_set' => 'set_speed',
            'secondary_set' => 'set_immune',
            'status' => 'published',
            'language' => 'en',
        ];
    }

    public function draft(): static
    {
        return $this->state(fn () => ['status' => 'draft']);
    }

    public function anonymous(): static
    {
        return $this->state(fn () => ['is_anonymous' => true]);
    }
}
