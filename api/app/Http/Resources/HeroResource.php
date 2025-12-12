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
        return [
            'id' => $this->id,
            'code' => $this->code,
            'name' => $this->name,
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
}
