<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class GuildPost extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'slug',
        'description',
        'server',
        'language',
        'tags',
        'images',
        'likes',
        'dislikes',
        'is_active',
    ];

    protected $casts = [
        'tags' => 'array',
        'images' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Available servers
     */
    public const SERVERS = [
        'global',
        'europe',
        'asia',
        'japan',
        'korea',
        'china',
    ];

    /**
     * Available languages
     */
    public const LANGUAGES = [
        'en',
        'es',
        'ko',
        'ja',
        'zh',
        'pt',
    ];

    /**
     * Available tags
     */
    public const TAGS = [
        'casual',
        'chill',
        'semi_competitive',
        'competitive_all',
        'competitive_gw',
        'competitive_rta',
        'whatsapp',
        'discord',
        'other_social',
        'beginner',
        'help_improve',
        'active',
    ];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($guildPost) {
            if (!$guildPost->slug) {
                $guildPost->slug = Str::slug($guildPost->title) . '-' . Str::random(6);
            }
        });
    }

    /**
     * Get the user that owns the guild post.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope to only active posts.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to filter by server.
     */
    public function scopeByServer($query, string $server)
    {
        return $query->where('server', $server);
    }

    /**
     * Scope to filter by language.
     */
    public function scopeByLanguage($query, string $language)
    {
        return $query->where('language', $language);
    }

    /**
     * Scope to filter by tags.
     */
    public function scopeByTags($query, array $tags)
    {
        foreach ($tags as $tag) {
            $query->whereJsonContains('tags', $tag);
        }
        return $query;
    }

    /**
     * Scope to search by title.
     */
    public function scopeSearch($query, string $search)
    {
        return $query->where('title', 'like', "%{$search}%");
    }
}
