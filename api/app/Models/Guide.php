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
     * Scope for published guides
     */
    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }
}
