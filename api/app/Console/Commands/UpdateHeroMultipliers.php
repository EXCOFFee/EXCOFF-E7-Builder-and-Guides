<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Hero;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

/**
 * Merge skill multipliers from datamine JSON into heroes.
 * 
 * Usage: php artisan heroes:update-multipliers
 */
class UpdateHeroMultipliers extends Command
{
    protected $signature = 'heroes:update-multipliers 
                            {--dry-run : Show what would be updated without making changes}';

    protected $description = 'Update hero skill multipliers from datamine data';

    public function handle(): int
    {
        $this->info('🔄 Updating hero multipliers from datamine data...');
        $this->newLine();

        $dataPath = database_path('data/hero_multipliers.json');
        
        if (!File::exists($dataPath)) {
            $this->error('Multipliers file not found: ' . $dataPath);
            return self::FAILURE;
        }

        $data = json_decode(File::get($dataPath), true);
        
        if (!$data || !isset($data['heroes'])) {
            $this->error('Invalid JSON format');
            return self::FAILURE;
        }

        $dryRun = $this->option('dry-run');
        $updated = 0;
        $notFound = [];

        foreach ($data['heroes'] as $heroData) {
            $heroName = $heroData['name'];
            $heroCode = $heroData['code'] ?? null;
            
            // Find hero by code or name
            $hero = null;
            if ($heroCode) {
                $hero = Hero::where('code', $heroCode)->first();
            }
            if (!$hero) {
                $hero = Hero::where('name', $heroName)->first();
            }
            
            if (!$hero) {
                $notFound[] = $heroName;
                continue;
            }
            
            // Get current skills or initialize
            $currentSkills = $hero->skills ?? [];
            
            // Merge datamine multipliers into skills
            $updatedSkills = $this->mergeMultipliers($currentSkills, $heroData['skills']);
            
            if ($dryRun) {
                $this->info("Would update: {$heroName}");
                $this->line("  Skills: " . json_encode(array_keys($heroData['skills'])));
            } else {
                $hero->skills = $updatedSkills;
                $hero->save();
                $this->info("✓ Updated: {$heroName}");
            }
            
            $updated++;
        }

        $this->newLine();
        $this->info("Updated: {$updated} heroes");
        
        if (!empty($notFound)) {
            $this->warn("Not found in database (" . count($notFound) . "):");
            foreach ($notFound as $name) {
                $this->line("  - {$name}");
            }
        }

        return self::SUCCESS;
    }

    /**
     * Merge datamine multipliers into existing skills data.
     */
    private function mergeMultipliers(array $currentSkills, array $datamineSkills): array
    {
        $result = $currentSkills;
        
        foreach ($datamineSkills as $skillKey => $skillData) {
            $normalizedKey = strtoupper($skillKey);
            
            // Handle special keys like s1_proc, s2_proc
            if (str_contains($skillKey, '_proc')) {
                $normalizedKey = strtoupper(str_replace('_proc', '', $skillKey));
                $procKey = $normalizedKey . '_proc';
                
                if (!isset($result[$procKey])) {
                    $result[$procKey] = [];
                }
                $result[$procKey] = array_merge($result[$procKey] ?? [], $this->formatSkillData($skillData));
                continue;
            }
            
            // Handle soulburn data
            if (isset($skillData['att_rate_soulburn'])) {
                if (!isset($result[$normalizedKey])) {
                    $result[$normalizedKey] = [];
                }
                $result[$normalizedKey]['soulburn'] = [
                    'rate' => $skillData['att_rate_soulburn'],
                ];
                if (isset($skillData['health_scaling_soulburn'])) {
                    $result[$normalizedKey]['soulburn']['selfHpScaling'] = $this->parsePercentage($skillData['health_scaling_soulburn']);
                }
            }
            
            // Merge main skill data
            if (!isset($result[$normalizedKey])) {
                $result[$normalizedKey] = [];
            }
            
            $result[$normalizedKey] = array_merge($result[$normalizedKey], $this->formatSkillData($skillData));
        }
        
        return $result;
    }

    /**
     * Format skill data from datamine format to Fribbels format.
     */
    private function formatSkillData(array $data): array
    {
        $formatted = [];
        
        // Map att_rate to rate
        if (isset($data['att_rate'])) {
            $formatted['rate'] = $data['att_rate'];
        }
        
        // Keep pow as is
        if (isset($data['pow'])) {
            $formatted['pow'] = $data['pow'];
        }
        
        // Health scaling
        if (isset($data['health_scaling'])) {
            $formatted['selfHpScaling'] = $this->parsePercentage($data['health_scaling']);
            $formatted['hpScalingNote'] = $data['health_scaling'];
        }
        
        // Defense penetration
        if (isset($data['def_pen'])) {
            $formatted['penetration'] = $data['def_pen'];
        }
        
        // Speed scaling
        if (isset($data['speed_scaling'])) {
            $formatted['spdScaling'] = $data['speed_scaling'];
        }
        
        // Detonation multiplier
        if (isset($data['detonation_multiplier'])) {
            $formatted['detonation'] = $data['detonation_multiplier'];
        }
        
        // Heal strength
        if (isset($data['heal_strength'])) {
            $formatted['heal'] = $this->parsePercentage($data['heal_strength']);
            $formatted['healNote'] = $data['heal_strength'];
        }
        
        // Barrier strength
        if (isset($data['barrier_strength'])) {
            $formatted['barrier'] = $this->parsePercentage($data['barrier_strength']);
            $formatted['barrierNote'] = $data['barrier_strength'];
        }
        
        // Lifesteal
        if (isset($data['lifesteal'])) {
            $formatted['lifesteal'] = $this->parsePercentage($data['lifesteal']);
        }
        
        // Damage increase
        if (isset($data['damage_increase'])) {
            $formatted['damageIncrease'] = $data['damage_increase'];
        }
        
        // Lost health scaling
        if (isset($data['lost_health_scaling'])) {
            $formatted['lostHpScaling'] = $data['lost_health_scaling'];
        }
        
        // Notes
        if (isset($data['note'])) {
            $formatted['note'] = $data['note'];
        }
        
        return $formatted;
    }

    /**
     * Parse percentage from string like "12% caster's max Health" to 0.12
     */
    private function parsePercentage(string $text): float
    {
        if (preg_match('/(\d+(?:\.\d+)?)\s*%/', $text, $matches)) {
            return floatval($matches[1]) / 100;
        }
        return 0.0;
    }
}
