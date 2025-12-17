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
        'hero_code', // Numeric code for skill icons (e.g., 'c1144')
        'name',
        'name_ko', // Korean
        'name_ja', // Japanese
        'name_zh', // Chinese
        'slug',
        'element',
        'class',
        'rarity',
        'base_stats',
        'skills',
        'self_devotion', // Memory Imprint data
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
        'self_devotion' => 'array',
        'rarity' => 'integer',
        'popular_sets' => 'array',
        'popular_artifacts' => 'array',
        'avg_stats' => 'array',
        'guides_count' => 'integer',
        'stats_updated_at' => 'datetime',
    ];

    /**
     * Attributes to append to JSON
     */
    protected $appends = ['portrait'];

    /**
     * Get the portrait attribute (alias for image_url)
     */
    public function getPortraitAttribute(): ?string
    {
        return $this->image_url;
    }

    /**
     * Get all guides for this hero.
     */
    public function guides(): HasMany
    {
        return $this->hasMany(Guide::class);
    }
}
