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
     * Mapping for new artifacts not yet in Fribbels CDN.
     * Maps artifact slug/name to local datamined icon filename.
     */
    private const NEW_ARTIFACT_ICONS = [
        'tome-of-the-lifes-end' => 'icon_art0231.png',
        // Add more new artifacts here as needed
    ];

    /**
     * Get the artifact icon URL.
     * Uses Fribbels CDN images, with fallback to local datamined images for new artifacts.
     */
    public function getIconAttribute(): ?string
    {
        if (!$this->code) {
            return $this->attributes['image_url'] ?? null;
        }

        // Check if this is a new artifact with local icon
        if (isset(self::NEW_ARTIFACT_ICONS[$this->slug])) {
            $baseUrl = rtrim(config('app.url'), '/');
            return $baseUrl . '/images/artifacts/' . self::NEW_ARTIFACT_ICONS[$this->slug];
        }

        // Use Fribbels CDN for artifact images
        // Codes like efk21, efw13, ef504, etc. match Fribbels naming convention
        return 'https://fribbels.github.io/Fribbels-Epic-7-Optimizer/app/assets/images/artifacts/' . $this->code . '.png';
    }

    /**
     * Get all guides that recommend this artifact.
     */
    public function guides(): HasMany
    {
        return $this->hasMany(Guide::class);
    }
}
