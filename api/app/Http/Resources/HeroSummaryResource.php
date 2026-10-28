<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Hero for lists and selectors (GET /api/heroes).
 *
 * Skills (~600 KB for all heroes), self devotion and usage stats are only in HeroResource
 * (GET /api/heroes/{slug}); base_stats stays because the build form uses it.
 */
class HeroSummaryResource extends JsonResource
{
    /** Columns the list needs; the index query selects only these. */
    public const COLUMNS = [
        'id', 'code', 'hero_code', 'name', 'name_ko', 'name_ja', 'name_zh',
        'slug', 'element', 'class', 'rarity', 'base_stats', 'image_url',
    ];

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $lang = $request->query('lang', 'en');

        return [
            'id' => $this->id,
            'code' => $this->code,
            'hero_code' => $this->hero_code,
            'name' => $this->name,
            'display_name' => match ($lang) {
                'ko' => $this->name_ko ?? $this->name,
                'ja' => $this->name_ja ?? $this->name,
                'zh' => $this->name_zh ?? $this->name,
                default => $this->name,
            },
            'name_ko' => $this->name_ko,
            'name_ja' => $this->name_ja,
            'name_zh' => $this->name_zh,
            'slug' => $this->slug,
            'element' => $this->element,
            'class' => $this->class,
            'rarity' => $this->rarity,
            'base_stats' => $this->base_stats,
            'image_url' => $this->image_url,
        ];
    }
}
