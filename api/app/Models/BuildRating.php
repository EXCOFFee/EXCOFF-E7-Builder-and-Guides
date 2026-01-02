<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BuildRating extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'build_id',
        'rating',
    ];

    protected $casts = [
        'rating' => 'integer',
    ];

    /**
     * Get the user who made this rating
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the build this rating belongs to
     */
    public function build()
    {
        return $this->belongsTo(UserBuild::class, 'build_id');
    }
}
