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
        'name_es', // Spanish
        'name_pt', // Portuguese
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
        'Ritual of Sealing Flames' => 'https://moccasin-sparrow-217730.hostingersite.com/images/artifacts/art0236_fu.png',
        'Gifted Pen' => 'https://raw.githubusercontent.com/CeciliaBot/E7Assets-Temp/main/assets/item_arti/art0235_fu.png',
        'Unleashed Axe of Heavenly Mandate' => 'https://raw.githubusercontent.com/CeciliaBot/E7Assets-Temp/main/assets/item_arti/art0239_fu.png',
        'Shadow Winds 7' => 'https://raw.githubusercontent.com/CeciliaBot/E7Assets-Temp/main/assets/item_arti/art0242_fu.png',
        'Glorious Throne' => 'https://raw.githubusercontent.com/CeciliaBot/E7Assets-Temp/main/assets/item_arti/art0240_fu.png',
        'Veritas' => 'https://raw.githubusercontent.com/CeciliaBot/E7Assets-Temp/main/assets/item_arti/art0234_fu.png',
        "Excommunicant's Censer" => 'https://raw.githubusercontent.com/CeciliaBot/E7Assets-Temp/main/assets/item_arti/art0238_fu.png',
        'With a Little Friend' => 'https://raw.githubusercontent.com/CeciliaBot/E7Assets-Temp/main/assets/item_arti/art0237_fu.png',
        'Audabe Orb' => 'https://raw.githubusercontent.com/CeciliaBot/E7Assets-Temp/main/assets/item_arti/art0243_fu.png',
        "Butterfly's Baptism" => 'https://raw.githubusercontent.com/CeciliaBot/E7Assets-Temp/main/assets/item_arti/art0244_fu.png',
        'Refracted Desire' => 'https://raw.githubusercontent.com/CeciliaBot/E7Assets-Temp/main/assets/item_arti/art0241_fu.png',
        'Intoxicating Indulgence' => 'https://raw.githubusercontent.com/CeciliaBot/E7Assets-Temp/main/assets/item_arti/art0245_fu.png',
        // Add more new artifacts here as needed
    ];

    /**
     * Get the artifact icon URL.
     * Generates URL dynamically from epic7db.com based on artifact slug.
     * Falls back to special mapping for new artifacts not yet in epic7db.
     * 
     * IMPORTANT: Uses $this->slug (always English) instead of $this->name
     * because name may be overwritten with localized translation.
     */
    public function getIconAttribute(): ?string
    {
        // Get the original English name from slug for NEW_ARTIFACT_ICONS check
        // Convert slug back to readable format for checking
        $originalName = $this->getOriginal('name') ?? $this->attributes['name'] ?? null;
        
        // Check if this is a new artifact with special icon mapping
        if ($originalName && isset(self::NEW_ARTIFACT_ICONS[$originalName])) {
            return self::NEW_ARTIFACT_ICONS[$originalName];
        }

        // Use slug field which is always in English and never localized
        // This ensures icon URLs work regardless of current language
        $slug = $this->slug;
        
        if (empty($slug)) {
            // Fallback: generate from original name if slug is missing
            $nameForSlug = $originalName ?? $this->name ?? 'unknown';
            $slug = strtolower(str_replace([' ', "'", "\u{2019}"], ['-', '', ''], $nameForSlug));
            $slug = preg_replace('/[^a-z0-9\-]/', '', $slug);
            $slug = preg_replace('/-+/', '-', $slug);
            $slug = trim($slug, '-');
        }
        
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
