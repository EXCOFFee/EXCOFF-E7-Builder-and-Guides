<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserBuild extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'hero_id',
        'title',
        'description',
        'min_stats',
        'primary_set',
        'secondary_set',
        'artifact_id',
        'synergy_heroes',
        'counter_heroes',
        'skill_1',
        'skill_2',
        'skill_3',
        'images',
        'views',
        'likes',
        'dislikes',
        'status',
        'language',
        'is_anonymous',
        'avg_rating',
        'rating_count',
        // Tier ratings (D=1 to S=5)
        'rating_pve',
        'rating_arena',
        'rating_gw',
        'rating_rta',
        'reason_pve',
        'reason_arena',
        'reason_gw',
        'reason_rta',
        // Pros/Cons tags
        'pro_tags',
        'con_tags',
    ];

    protected $casts = [
        'min_stats' => 'array',
        'synergy_heroes' => 'array',
        'counter_heroes' => 'array',
        'images' => 'array',
        'is_anonymous' => 'boolean',
        'avg_rating' => 'decimal:2',
        'skill_1' => 'integer',
        'skill_2' => 'integer',
        'skill_3' => 'integer',
        'rating_pve' => 'integer',
        'rating_arena' => 'integer',
        'rating_gw' => 'integer',
        'rating_rta' => 'integer',
        'pro_tags' => 'array',
        'con_tags' => 'array',
    ];

    /**
     * Tier rating constants (KISS: simple enum-like values)
     */
    public const TIER_D = 1;
    public const TIER_C = 2;
    public const TIER_B = 3;
    public const TIER_A = 4;
    public const TIER_S = 5;

    /**
     * Convert numeric tier to letter grade.
     * SRP: Single method for tier conversion, reusable across the app.
     */
    public static function tierToLetter(?int $tier): ?string
    {
        return match ($tier) {
            self::TIER_S => 'S',
            self::TIER_A => 'A',
            self::TIER_B => 'B',
            self::TIER_C => 'C',
            self::TIER_D => 'D',
            default => null,
        };
    }

    /**
     * Calculate the general tier rating (average of all categories).
     * Uses round() with standard rounding: 4.5+ = S, 3.5-4.4 = A, etc.
     */
    public function getGeneralTierAttribute(): ?int
    {
        $ratings = array_filter([
            $this->rating_pve,
            $this->rating_arena,
            $this->rating_gw,
            $this->rating_rta,
        ], fn($r) => $r !== null);

        if (empty($ratings)) {
            return null;
        }

        return (int) round(array_sum($ratings) / count($ratings));
    }

    /**
     * Get the user who created this build
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the hero for this build
     */
    public function hero()
    {
        return $this->belongsTo(Hero::class);
    }

    /**
     * Get the artifact for this build
     */
    public function artifact()
    {
        return $this->belongsTo(Artifact::class);
    }

    /**
     * Get all ratings for this build
     */
    public function ratings()
    {
        return $this->hasMany(BuildRating::class, 'build_id');
    }

    /**
     * Get synergy heroes
     */
    public function getSynergyHeroesListAttribute()
    {
        if (empty($this->synergy_heroes)) {
            return [];
        }
        return Hero::whereIn('id', $this->synergy_heroes)->get();
    }

    /**
     * Get counter heroes
     */
    public function getCounterHeroesListAttribute()
    {
        if (empty($this->counter_heroes)) {
            return [];
        }
        return Hero::whereIn('id', $this->counter_heroes)->get();
    }

    /**
     * Scope for published builds
     */
    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }
}
