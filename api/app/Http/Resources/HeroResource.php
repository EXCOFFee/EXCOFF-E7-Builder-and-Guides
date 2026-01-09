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
            'hero_code' => $this->hero_code, // Numeric code for skill icons
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
            'skills' => $this->getLocalizedSkills($lang),
            'self_devotion' => $this->self_devotion,
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

    /**
     * Get skills with localized name, description, and soulburn_effect.
     */
    private function getLocalizedSkills(string $lang): ?array
    {
        if (!$this->skills || !is_array($this->skills)) {
            return $this->skills;
        }

        $localizedSkills = [];
        
        foreach ($this->skills as $key => $skill) {
            if (!is_array($skill)) {
                $localizedSkills[$key] = $skill;
                continue;
            }

            // Get localized values with fallback to English
            $localizedSkills[$key] = [
                'name' => $this->getLocalizedField($skill, 'name', $lang),
                'description' => $this->getLocalizedField($skill, 'description', $lang),
                'soulburn_effect' => $this->getLocalizedField($skill, 'soulburn_effect', $lang),
                // Keep other fields as-is
                'rate' => $skill['rate'] ?? null,
                'pow' => $skill['pow'] ?? null,
                'cooldown' => $skill['cooldown'] ?? null,
                'souls' => $skill['souls'] ?? null,
                'soulburn' => $skill['soulburn'] ?? false,
                'soulburn_souls' => $skill['soulburn_souls'] ?? null,
                'targets' => $skill['targets'] ?? null,
                'selfHpScaling' => $skill['selfHpScaling'] ?? null,
                'selfAtkScaling' => $skill['selfAtkScaling'] ?? null,
                'selfDefScaling' => $skill['selfDefScaling'] ?? null,
                'selfSpdScaling' => $skill['selfSpdScaling'] ?? null,
                'penetration' => $skill['penetration'] ?? null,
                'hitTypes' => $skill['hitTypes'] ?? null,
                'passive' => $skill['passive'] ?? null,
            ];
        }

        return $localizedSkills;
    }

    /**
     * Get a localized field value with fallback to English.
     */
    private function getLocalizedField(array $skill, string $field, string $lang): ?string
    {
        // Map language codes to field suffixes
        $langKey = match ($lang) {
            'es' => 'es',
            'ko' => 'ko',
            'ja' => 'ja',
            'zh' => 'zh',
            'pt' => 'pt',
            default => null, // English uses base field
        };

        // Try localized field first
        if ($langKey !== null) {
            $localizedField = "{$field}_{$langKey}";
            if (!empty($skill[$localizedField])) {
                return $skill[$localizedField];
            }
        }

        // Fallback to English (base field)
        return $skill[$field] ?? null;
    }
}

