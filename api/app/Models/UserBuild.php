<?php

declare(strict_types=1);

namespace App\Models;

use App\Support\BuildCache;
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
     * Cualquier cambio en una build renueva las claves de caché de la lista y de los stats
     * por héroe. increment() de likes/views no dispara "saved": esos contadores esperan al TTL.
     */
    protected static function booted(): void
    {
        static::saved(fn () => BuildCache::bump());
        static::deleted(fn () => BuildCache::bump());
    }

    /**
     * Una build anónima no expone a su autor en la API: ni el usuario ni su id. Para el botón
     * de editar, el controlador agrega is_owner comparando con el usuario del token.
     */
    public function toArray(): array
    {
        $data = parent::toArray();

        if ($this->is_anonymous) {
            unset($data['user_id']);
            if (array_key_exists('user', $data)) {
                $data['user'] = null;
            }
        }

        return $data;
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
     * Get synergy heroes with optional notes
     * Handles both old format (number[]) and new format ({id, note}[])
     */
    public function getSynergyHeroesListAttribute()
    {
        if (empty($this->synergy_heroes)) {
            return [];
        }

        $heroesData = $this->synergy_heroes;
        $heroIds = [];
        $notes = [];

        foreach ($heroesData as $item) {
            if (is_array($item) && isset($item['id'])) {
                // New format: {id, note}
                $heroIds[] = $item['id'];
                if (!empty($item['note'])) {
                    $notes[$item['id']] = $item['note'];
                }
            } else {
                // Old format: just the ID
                $heroIds[] = $item;
            }
        }

        $heroes = Hero::whereIn('id', $heroIds)->get();
        
        // Merge notes into hero objects
        return $heroes->map(function ($hero) use ($notes) {
            $heroArray = $hero->toArray();
            $heroArray['note'] = $notes[$hero->id] ?? null;
            return $heroArray;
        });
    }

    /**
     * Get counter heroes with optional notes
     * Handles both old format (number[]) and new format ({id, note}[])
     */
    public function getCounterHeroesListAttribute()
    {
        if (empty($this->counter_heroes)) {
            return [];
        }

        $heroesData = $this->counter_heroes;
        $heroIds = [];
        $notes = [];

        foreach ($heroesData as $item) {
            if (is_array($item) && isset($item['id'])) {
                // New format: {id, note}
                $heroIds[] = $item['id'];
                if (!empty($item['note'])) {
                    $notes[$item['id']] = $item['note'];
                }
            } else {
                // Old format: just the ID
                $heroIds[] = $item;
            }
        }

        $heroes = Hero::whereIn('id', $heroIds)->get();
        
        // Merge notes into hero objects
        return $heroes->map(function ($hero) use ($notes) {
            $heroArray = $hero->toArray();
            $heroArray['note'] = $notes[$hero->id] ?? null;
            return $heroArray;
        });
    }

    /**
     * Builds que tienen (o, con $without, que no tienen) el tag en pro_tags / con_tags.
     * Los tags se guardan como [{id, note}]: whereJsonContains no sirve en SQLite con objetos,
     * así que se compara el id con SQL propio de cada motor.
     */
    public function scopeWithTag($query, string $field, string $tagId, bool $without = false)
    {
        abort_unless(in_array($field, ['pro_tags', 'con_tags'], true), 500);

        $sql = $query->getConnection()->getDriverName() === 'sqlite'
            ? "exists (select 1 from json_each({$field}) where json_extract(json_each.value, '$.id') = ?)"
            : "coalesce(json_contains(json_extract({$field}, '$[*].id'), json_quote(?)), 0) = 1";

        return $without
            ? $query->where(fn ($q) => $q->whereNull($field)->orWhereRaw("not ({$sql})", [$tagId]))
            : $query->whereRaw($sql, [$tagId]);
    }

    /**
     * Scope for published builds
     */
    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }
}
