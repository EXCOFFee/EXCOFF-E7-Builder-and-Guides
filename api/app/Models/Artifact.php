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
     * Uses Fribbels CDN images based on artifact code.
     */
    public function getIconAttribute(): ?string
    {
        if (!$this->code) {
            return $this->attributes['image_url'] ?? null;
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
