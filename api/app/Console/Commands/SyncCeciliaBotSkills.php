<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Hero;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Sync skill descriptions from CeciliaBot API into heroes.
 * 
 * This command fetches skill names, descriptions, cooldowns, and soulburn info
 * from CeciliaBot and merges them with existing Fribbels multiplier data.
 * 
 * Usage: php artisan heroes:sync-skill-descriptions
 */
class SyncCeciliaBotSkills extends Command
{
    protected $signature = 'heroes:sync-skill-descriptions 
                            {--hero= : Sync only a specific hero by slug}
                            {--dry-run : Show what would be updated without making changes}
                            {--delay=500 : Delay in ms between API calls to avoid rate limiting}';

    protected $description = 'Sync skill descriptions from CeciliaBot API';

    private const CECILIA_API_BASE = 'https://cecilia-bot-api.vercel.app/api/v1';

    public function handle(): int
    {
        $this->info('🔄 Syncing skill descriptions from CeciliaBot API...');
        $this->newLine();

        $dryRun = $this->option('dry-run');
        $delay = (int) $this->option('delay');
        $specificHero = $this->option('hero');

        // Get heroes to process
        if ($specificHero) {
            $heroes = Hero::where('slug', $specificHero)->get();
            if ($heroes->isEmpty()) {
                $this->error("Hero not found: {$specificHero}");
                return self::FAILURE;
            }
        } else {
            $heroes = Hero::all();
        }

        $updated = 0;
        $skipped = 0;
        $errors = [];

        $bar = $this->output->createProgressBar($heroes->count());
        $bar->start();

        foreach ($heroes as $hero) {
            try {
                $ceciliaData = $this->fetchCeciliaData($hero->slug);
                
                if (!$ceciliaData || !isset($ceciliaData['skills'])) {
                    $this->line(" ⚠ No data for: {$hero->name}");
                    $skipped++;
                    $bar->advance();
                    continue;
                }

                // Merge CeciliaBot skill text with existing Fribbels multipliers
                $currentSkills = $hero->skills ?? [];
                $mergedSkills = $this->mergeSkillDescriptions($currentSkills, $ceciliaData['skills']);

                if ($dryRun) {
                    $this->newLine();
                    $this->info("Would update: {$hero->name}");
                    $this->showSkillPreview($mergedSkills);
                } else {
                    $hero->skills = $mergedSkills;
                    $hero->save();
                }

                $updated++;

            } catch (\Exception $e) {
                $errors[] = "{$hero->name}: {$e->getMessage()}";
                Log::error("CeciliaBot sync error for {$hero->name}", ['error' => $e->getMessage()]);
            }

            $bar->advance();

            // Rate limiting delay
            if ($delay > 0 && !$specificHero) {
                usleep($delay * 1000);
            }
        }

        $bar->finish();
        $this->newLine(2);

        $this->info("✅ Updated: {$updated} heroes");
        $this->info("⏭ Skipped: {$skipped} heroes");

        if (!empty($errors)) {
            $this->newLine();
            $this->warn("❌ Errors (" . count($errors) . "):");
            foreach (array_slice($errors, 0, 10) as $error) {
                $this->line("  - {$error}");
            }
            if (count($errors) > 10) {
                $this->line("  ... and " . (count($errors) - 10) . " more");
            }
        }

        return self::SUCCESS;
    }

    /**
     * Fetch hero data from CeciliaBot API.
     */
    private function fetchCeciliaData(string $slug): ?array
    {
        $url = self::CECILIA_API_BASE . "/getItem?list=hero&id={$slug}";
        
        try {
            $response = Http::timeout(10)->get($url);
            
            if ($response->successful()) {
                return $response->json();
            }
            
            return null;
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Merge CeciliaBot skill descriptions with existing Fribbels multipliers.
     * 
     * Preserves: rate, pow, targets, scaling values from Fribbels
     * Adds: name, description, cooldown, soulburn info from CeciliaBot
     */
    private function mergeSkillDescriptions(array $currentSkills, array $ceciliaSkills): array
    {
        $result = $currentSkills;

        foreach ($ceciliaSkills as $skillData) {
            $skillNum = $skillData['skill'] ?? null;
            if (!$skillNum) continue;

            $skillKey = 'S' . $skillNum;

            // Initialize skill if not exists
            if (!isset($result[$skillKey])) {
                $result[$skillKey] = [];
            }

            // Add CeciliaBot text data (preserving existing Fribbels numerics)
            if (isset($skillData['name'])) {
                $result[$skillKey]['name'] = $skillData['name'];
            }

            if (isset($skillData['description'])) {
                // Clean up markdown-style formatting
                $description = $skillData['description'];
                $description = preg_replace('/\*\*([^*]+)\*\*/', '$1', $description); // Remove **bold**
                $description = preg_replace('/--([^-]+)--/', '$1', $description); // Remove --strikethrough--
                $description = preg_replace('/\+\+([^+]+)\+\+/', '$1', $description); // Remove ++underline++
                $description = preg_replace('/\{\{variable\}\}/', '?', $description); // Replace {{variable}}
                $result[$skillKey]['description'] = trim($description);
            }

            if (isset($skillData['cooldown']) && $skillData['cooldown'] > 0) {
                $result[$skillKey]['cooldown'] = (int) $skillData['cooldown'];
            }

            if (isset($skillData['passive'])) {
                $result[$skillKey]['passive'] = (bool) $skillData['passive'];
            }

            // Soulburn info
            if (isset($skillData['soulburn']) && $skillData['soulburn']) {
                $result[$skillKey]['soulburn'] = true;
                
                if (isset($skillData['soul_requirement'])) {
                    $result[$skillKey]['soulburn_souls'] = (int) $skillData['soul_requirement'];
                }
                
                if (isset($skillData['soul_description'])) {
                    $result[$skillKey]['soulburn_effect'] = $skillData['soul_description'];
                }
            }

            // Handle awakened/enhanced skill version
            if (isset($skillData['awakened']) && is_array($skillData['awakened'])) {
                $awakened = $skillData['awakened'];
                if (isset($awakened['description'])) {
                    $awDesc = $awakened['description'];
                    $awDesc = preg_replace('/\*\*([^*]+)\*\*/', '$1', $awDesc);
                    $awDesc = preg_replace('/--([^-]+)--/', '$1', $awDesc);
                    $awDesc = preg_replace('/\+\+([^+]+)\+\+/', '$1', $awDesc);
                    $result[$skillKey]['awakened_description'] = trim($awDesc);
                }
            }

            // Extract targets from common tags
            if (isset($skillData['common']) && is_array($skillData['common'])) {
                foreach ($skillData['common'] as $tag) {
                    if (isset($tag['_id'])) {
                        if ($tag['_id'] === 'cmn_single_target') {
                            $result[$skillKey]['targets'] = 1;
                        } elseif ($tag['_id'] === 'cmn_aoe') {
                            $result[$skillKey]['targets'] = 4;
                        }
                    }
                }
            }
        }

        return $result;
    }

    /**
     * Show preview of skill data for dry-run.
     */
    private function showSkillPreview(array $skills): void
    {
        foreach ($skills as $key => $skill) {
            if (!str_starts_with($key, 'S')) continue;
            
            $name = $skill['name'] ?? '(no name)';
            $cooldown = isset($skill['cooldown']) ? "CD: {$skill['cooldown']}" : '';
            $soulburn = isset($skill['soulburn']) && $skill['soulburn'] ? '⚡ SB' : '';
            
            $this->line("  {$key}: {$name} {$cooldown} {$soulburn}");
        }
    }
}
