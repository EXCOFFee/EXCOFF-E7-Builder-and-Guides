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

    /**
     * Get all guides that recommend this artifact.
     */
    public function guides(): HasMany
    {
        return $this->hasMany(Guide::class);
    }
}
