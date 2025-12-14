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
        'images',
        'views',
        'likes',
        'dislikes',
        'status',
        'language',
        'is_anonymous',
    ];

    protected $casts = [
        'min_stats' => 'array',
        'synergy_heroes' => 'array',
        'counter_heroes' => 'array',
        'images' => 'array',
        'is_anonymous' => 'boolean',
    ];

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
