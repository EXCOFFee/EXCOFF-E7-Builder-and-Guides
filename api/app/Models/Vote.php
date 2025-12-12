<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Vote model for guide upvotes/downvotes.
 * Unique constraint prevents duplicate votes from same user.
 */
class Vote extends Model
{
    protected $fillable = [
        'user_id',
        'guide_id',
        'value',
    ];

    protected $casts = [
        'value' => 'integer',
    ];

    /**
     * Get the user who cast this vote.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the guide this vote is for.
     */
    public function guide(): BelongsTo
    {
        return $this->belongsTo(Guide::class);
    }
}
