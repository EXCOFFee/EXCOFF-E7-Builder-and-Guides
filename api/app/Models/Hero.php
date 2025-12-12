<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Hero model representing game characters from Epic Seven.
 * Data is synchronized from Fribbels repository.
 */
class Hero extends Model
{
    protected $fillable = [
        'code',
        'name',
        'slug',
        'element',
        'class',
        'rarity',
        'base_stats',
        'skills',
        'image_url',
        'data_hash',
        // Usage stats (calculated from community guides)
        'popular_sets',
        'popular_artifacts',
        'avg_stats',
        'guides_count',
        'stats_updated_at',
    ];

    protected $casts = [
        'base_stats' => 'array',
        'skills' => 'array',
        'rarity' => 'integer',
        'popular_sets' => 'array',
        'popular_artifacts' => 'array',
        'avg_stats' => 'array',
        'guides_count' => 'integer',
        'stats_updated_at' => 'datetime',
    ];

    /**
     * Get all guides for this hero.
     */
    public function guides(): HasMany
    {
        return $this->hasMany(Guide::class);
    }
}
