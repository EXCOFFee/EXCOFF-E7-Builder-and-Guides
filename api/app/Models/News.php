<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class News extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'thumbnail',
        'url',
        'source',
        'category',
        'external_id',
        'published_at',
    ];

    protected $casts = [
        'published_at' => 'datetime',
    ];

    /**
     * Scope for YouTube news
     */
    public function scopeYoutube($query)
    {
        return $query->where('source', 'youtube');
    }

    /**
     * Scope for Stove news
     */
    public function scopeStove($query)
    {
        return $query->where('source', 'stove');
    }
}
