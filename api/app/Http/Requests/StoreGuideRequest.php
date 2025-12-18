<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Validation for creating/updating guides.
 * Implements RF-03: Reject impossible stats.
 */
class StoreGuideRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Auth handled by route middleware
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'hero_id' => 'required|exists:heroes,id',
            'title' => 'required|string|max:100',
            'type' => 'required|in:pvp,pve,guild,oneshot',

            // Sets (RF-07: max 3 sets)
            'sets' => 'required|array|min:1|max:3',
            'sets.*' => 'string|in:speed,health,defense,attack,destruction,lifesteal,counter,resist,unity,rage,immunity,penetration,revenge,injury,protection,torrent,warfare,pursuit',

            // Stats (RF-06: 8 base stats, RF-03: validate ranges)
            'stats' => 'required|array',
            'stats.atk' => 'required|integer|min:0|max:10000',
            'stats.def' => 'required|integer|min:0|max:5000',
            'stats.hp' => 'required|integer|min:0|max:40000',
            'stats.spd' => 'required|integer|min:0|max:450',
            'stats.crit_chance' => 'required|integer|min:0|max:350',
            'stats.crit_dmg' => 'required|integer|min:0|max:500',
            'stats.eff' => 'required|integer|min:0|max:400',
            'stats.res' => 'required|integer|min:0|max:400',

            // Stat Priority (RF-10)
            'stat_priority' => 'nullable|array',
            'stat_priority.*' => 'in:high,mid,low',

            // Artifacts (RF-08: 1 main + 2 alternatives)
            'artifact_id' => 'nullable|exists:artifacts,id',
            'alt_artifacts' => 'nullable|array|max:2',
            'alt_artifacts.*' => 'exists:artifacts,id',

            // Synergies/Counters (RF-09)
            'synergies' => 'nullable|array|max:5',
            'synergies.*' => 'exists:heroes,id',
            'counters' => 'nullable|array|max:5',
            'counters.*' => 'exists:heroes,id',

            // Content
            'gameplay_content' => 'required|string|max:10000',
            'proof_image' => 'nullable|image|max:5120', // 5MB max
        ];
    }

    /**
     * Custom error messages.
     */
    public function messages(): array
    {
        return [
            'stats.spd.max' => 'Speed cannot exceed 450 (game limit).',
            'stats.crit_chance.max' => 'Crit Chance cannot exceed 350%.',
            'sets.max' => 'A build can have maximum 3 sets (6 equipment pieces).',
        ];
    }
}
