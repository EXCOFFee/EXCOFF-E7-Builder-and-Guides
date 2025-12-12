<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Guide API Resource - Transforms Guide model for JSON output.
 */
class GuideResource extends JsonResource
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
            'title' => $this->title,
            'slug' => $this->slug,
            'type' => $this->type,
            'sets' => $this->sets,
            'stats' => $this->stats,
            'stat_priority' => $this->stat_priority,
            'synergies' => $this->synergies,
            'counters' => $this->counters,
            'gameplay_content' => $this->gameplay_content,
            'proof_image' => $this->proof_image ? asset('storage/' . $this->proof_image) : null,
            'vote_score' => $this->vote_score,
            'is_published' => $this->is_published,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),

            // Relationships
            'hero' => new HeroResource($this->whenLoaded('hero')),
            'artifact' => $this->whenLoaded('artifact'),
            'alt_artifacts' => $this->alt_artifacts,
            'author' => $this->when($this->relationLoaded('user'), [
                'id' => $this->user?->id,
                'name' => $this->user?->name,
            ]),
            'comments' => CommentResource::collection($this->whenLoaded('comments')),
        ];
    }
}
