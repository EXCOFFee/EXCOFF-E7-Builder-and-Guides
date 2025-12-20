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
     * Mapping for new artifacts not yet in epic7db.com.
     * Maps artifact name to local datamined icon URL.
     */
    private const NEW_ARTIFACT_ICONS = [
        'Tome of the Life\'s End' => 'https://moccasin-sparrow-217730.hostingersite.com/images/artifacts/icon_art0231.png',
        // Add more new artifacts here as needed
    ];

    /**
     * Get the artifact icon URL.
     * Generates URL dynamically from epic7db.com based on artifact name.
     * Falls back to special mapping for new artifacts not yet in epic7db.
     */
    public function getIconAttribute(): ?string
    {
        // Check if this is a new artifact with special icon mapping
        if (isset(self::NEW_ARTIFACT_ICONS[$this->name])) {
            return self::NEW_ARTIFACT_ICONS[$this->name];
        }

        // Generate URL from epic7db.com using artifact name
        // Pattern: https://epic7db.com/images/artifacts/{slug}.webp
        // Name is converted to lowercase with dashes instead of spaces
        $slug = strtolower(str_replace([' ', "'", "\u{2019}"], ['-', '', ''], $this->name));
        $slug = preg_replace('/[^a-z0-9\-]/', '', $slug);
        $slug = preg_replace('/-+/', '-', $slug); // Remove consecutive dashes
        $slug = trim($slug, '-');
        
        return 'https://epic7db.com/images/artifacts/' . $slug . '.webp';
    }

    /**
     * Get all guides that recommend this artifact.
     */
    public function guides(): HasMany
    {
        return $this->hasMany(Guide::class);
    }
}
