<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Hero API Resource - Transforms Hero model for JSON output.
 */
class HeroResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Get the localized name based on ?lang parameter
        $lang = $request->query('lang', 'en');
        $localizedName = $this->getLocalizedName($lang);

        return [
            'id' => $this->id,
            'code' => $this->code,
            'name' => $this->name, // Always include English name
            'display_name' => $localizedName, // Localized name for display
            'name_ko' => $this->name_ko,
            'name_ja' => $this->name_ja,
            'name_zh' => $this->name_zh,
            'slug' => $this->slug,
            'element' => $this->element,
            'class' => $this->class,
            'rarity' => $this->rarity,
            'base_stats' => $this->base_stats,
            'skills' => $this->skills,
            'image_url' => $this->image_url,
            // Usage statistics (from community guides)
            'popular_sets' => $this->popular_sets,
            'popular_artifacts' => $this->popular_artifacts,
            'avg_stats' => $this->avg_stats,
            'guides_count' => $this->guides_count ?? 0,
            'stats_updated_at' => $this->stats_updated_at?->toISOString(),
            // Relationships
            'guides' => GuideResource::collection($this->whenLoaded('guides')),
        ];
    }

    /**
     * Get the localized name based on language code.
     */
    private function getLocalizedName(string $lang): string
    {
        return match ($lang) {
            'ko' => $this->name_ko ?? $this->name,
            'ja' => $this->name_ja ?? $this->name,
            'zh' => $this->name_zh ?? $this->name,
            default => $this->name,
        };
    }
}
