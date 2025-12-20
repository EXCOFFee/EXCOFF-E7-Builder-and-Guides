<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Artifact model representing equippable items in Epic Seven.
 */
class Artifact extends Model
{
    use HasFactory;
    protected $fillable = [
        'code',
        'name',
        'name_ko', // Korean
        'name_ja', // Japanese
        'name_zh', // Chinese
        'slug',
        'class',
        'rarity',
        'description',
        'image_url',
    ];

    protected $casts = [
        'rarity' => 'integer',
    ];

    protected $appends = ['icon'];

    /**
     * Get the artifact icon URL.
     * Uses local datamined images based on artifact code.
     */
    public function getIconAttribute(): ?string
    {
        if (!$this->code) {
            return $this->attributes['image_url'] ?? null;
        }

        // Convert code (e.g., 'art0001' or 'efk21') to icon filename
        // Datamined files are named 'icon_art0001.png', 'icon_art3_1.png', etc.
        $baseUrl = rtrim(config('app.url'), '/');
        
        // Check if code matches pattern like 'art0001'
        if (preg_match('/^art(\d+)$/', $this->code, $matches)) {
            return $baseUrl . '/images/artifacts/icon_' . $this->code . '.png';
        }
        
        // Check if code matches pattern like 'art3_1' (3-star artifacts)
        if (preg_match('/^art(\d)_(\d+)$/', $this->code, $matches)) {
            return $baseUrl . '/images/artifacts/icon_' . $this->code . '.png';
        }

        // Fallback to stored image_url
        return $this->attributes['image_url'] ?? null;
    }

    /**
     * Get all guides that recommend this artifact.
     */
    public function guides(): HasMany
    {
        return $this->hasMany(Guide::class);
    }
}
