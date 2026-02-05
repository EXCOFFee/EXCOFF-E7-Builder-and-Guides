<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Hero;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class ImportHeroFromCeciliaBot extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'heroes:import {slug : The slug of the hero to import (e.g. monarch-of-the-sword-iseria)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import a new hero from Cecilia Bot API';

    private const CECILIA_API_BASE = 'https://cecilia-bot-api.vercel.app/api/v1';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $slug = $this->argument('slug');
        $this->info("🔍 Fetching data for '{$slug}' from Cecilia Bot...");

        $url = self::CECILIA_API_BASE . "/getItem?list=hero&id={$slug}";
        $response = Http::timeout(10)->get($url);

        if ($response->failed()) {
            $this->error("❌ Failed to fetch data: " . $response->body());
            return self::FAILURE;
        }

        $data = $response->json();
        
        if (empty($data) || !isset($data['id'])) {
             $this->error("❌ Hero not found or invalid data.");
             return self::FAILURE;
        }

        $this->info("✅ Found: {$data['name']} ({$data['id']})");

        // Map Data
        $heroCode = $data['id']; // e.g., c6024
        $name = $data['name'];
        $element = strtolower($data['attribute']);
        $class = strtolower($data['role']); // knight, warrior, etc.
        $rarity = (int) $data['rarity'];
        
        // Zodaic mapping
        $zodiac = $data['zodiac'] ?? 'unknown';

        // Skills Mapping
        $skills = $this->mapSkills($data['skills'] ?? []);

        // Image URL Construction (Guessing based on pattern)
        // Usually https://raw.githubusercontent.com/CeciliaBot/E7Tools/master/public/assets/hero/{code}_su.png
        $imageUrl = "https://raw.githubusercontent.com/CeciliaBot/E7Tools/master/public/assets/hero/{$heroCode}_su.png";
        
        // Check if hero exists
        $hero = Hero::where('slug', $slug)->first();
        
        if ($hero) {
            if (!$this->confirm("Hero '{$name}' already exists. Overwrite?")) {
                return self::SUCCESS;
            }
        } else {
            $hero = new Hero();
            $hero->slug = $slug;
            $hero->code = $slug; // Our internal code is often the slug
        }

        $hero->hero_code = $heroCode;
        $hero->name = $name;
        $hero->element = $element;
        $hero->class = $class;
        $hero->rarity = $rarity;
        $hero->image_url = $imageUrl;
        $hero->skills = $skills;

        // Placeholder Stats (User must update manually)
        $hero->base_stats = [
            'atk' => 0,
            'def' => 0,
            'hp' => 0,
            'spd' => 0,
            'crit_chance' => 0,
            'crit_dmg' => 0,
            'eff' => 0,
            'res' => 0,
            'dual_attack' => 5, // Standard
        ];
        
        // Basic devotion placeholder
        $hero->self_devotion = [
            'type' => 'unknown',
            'grades' => ['D'=>0,'C'=>0,'B'=>0,'A'=>0,'S'=>0,'SS'=>0,'SSS'=>0]
        ];

        $hero->data_hash = md5(json_encode($data));
        $hero->save();

        $this->newLine();
        $this->info("🎉 Hero imported successfully!");
        $this->warn("⚠ Please manually update Base Stats and Self Devotion in the database.");

        return self::SUCCESS;
    }

    private function mapSkills(array $ceciliaSkills): array
    {
        $mapped = [];
        foreach ($ceciliaSkills as $skill) {
             $skillNum = $skill['skill'] ?? null;
             if (!$skillNum) continue;
             
             $key = 'S' . $skillNum;
             $mapped[$key] = [
                 'name' => $skill['name'] ?? '',
                 'description' => $this->cleanText($skill['description'] ?? ''),
                 'cooldown' => $skill['cooldown'] ?? 0,
                 'soulburn' => isset($skill['soulburn']) && $skill['soulburn'] ? true : false,
             ];

             if (isset($skill['soulburn']) && $skill['soulburn']) {
                 $mapped[$key]['soulburn_souls'] = $skill['soul_requirement'] ?? 0;
                 $mapped[$key]['soulburn_effect'] = $this->cleanText($skill['soul_description'] ?? '');
             }
             
             if (isset($skill['passive']) && $skill['passive']) {
                 $mapped[$key]['passive'] = true;
             }
        }
        return $mapped;
    }

    private function cleanText(string $text): string
    {
        $text = preg_replace('/\*\*([^*]+)\*\*/', '$1', $text); // Remove **bold**
        $text = preg_replace('/--([^-]+)--/', '$1', $text); // Remove --strikethrough--
        $text = preg_replace('/\+\+([^+]+)\+\+/', '$1', $text); // Remove ++underline++
        $text = preg_replace('/\{\{variable\}\}/', '?', $text);
        return trim($text);
    }
}
