<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Voto de un usuario a la nota de una build en un modo (D=1 … S=5).
 */
class BuildModeVote extends Model
{
    public const MODES = ['pve', 'arena', 'gw', 'rta'];

    protected $fillable = ['user_id', 'build_id', 'mode', 'tier'];

    protected $casts = [
        'tier' => 'integer',
    ];

    public function build(): BelongsTo
    {
        return $this->belongsTo(UserBuild::class, 'build_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
