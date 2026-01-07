<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Guide extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'hero_id',
        'artifact_id',
        'category',
        'title',
        'slug',
        'type',
        'sets',
        'stats',
        'stat_priority',
        'synergies',
        'counters',
        'alt_artifacts',
        'recommended_heroes',
        'recommended_artifacts',
        'teams',
        'description',
        'gameplay_content',
        'video_url',
        'video_thumbnail',
        'video_platform',
        'images',
        'proof_image',
        'is_published',
        'vote_score',
        'views',
        'likes',
        'language',
    ];

    protected $casts = [
        'sets' => 'array',
        'stats' => 'array',
        'stat_priority' => 'array',
        'synergies' => 'array',
        'counters' => 'array',
        'alt_artifacts' => 'array',
        'recommended_heroes' => 'array',
        'recommended_artifacts' => 'array',
        'teams' => 'array',
        'images' => 'array',
        'is_published' => 'boolean',
    ];

    /**
     * Get the author of this guide
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the hero for this guide
     */
    public function hero()
    {
        return $this->belongsTo(Hero::class);
    }

    /**
     * Get the artifact for this guide
     */
    public function artifact()
    {
        return $this->belongsTo(Artifact::class);
    }

    /**
     * Get recommended heroes with full data (DRY: reusable accessor pattern)
     */
    public function getRecommendedHeroesListAttribute()
    {
        if (empty($this->recommended_heroes)) {
            return [];
        }
        return Hero::whereIn('id', $this->recommended_heroes)->get();
    }

    /**
     * Get recommended artifacts with full data
     */
    public function getRecommendedArtifactsListAttribute()
    {
        if (empty($this->recommended_artifacts)) {
            return [];
        }
        return Artifact::whereIn('id', $this->recommended_artifacts)->get();
    }

    /**
     * Scope for published guides
     */
    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }
}
