<?php

namespace Database\Factories;

use App\Models\Comment;
use App\Models\User;
use App\Models\UserBuild;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Comment>
 */
class CommentFactory extends Factory
{
    protected $model = Comment::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'build_id' => UserBuild::factory(),
            'content' => $this->faker->sentence(),
            'is_anonymous' => false,
        ];
    }

    public function anonymous(): static
    {
        return $this->state(fn () => ['is_anonymous' => true]);
    }
}
