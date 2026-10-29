<?php

namespace Database\Factories;

use App\Models\Guide;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Guide>
 */
class GuideFactory extends Factory
{
    protected $model = Guide::class;

    public function definition(): array
    {
        $title = $this->faker->unique()->sentence(4);

        return [
            'user_id' => User::factory(),
            'title' => $title,
            'slug' => Str::slug($title),
            'category' => 'general',
            'type' => 'pve',
            'description' => $this->faker->sentence(),
            'is_published' => true,
            'language' => 'en',
        ];
    }
}
