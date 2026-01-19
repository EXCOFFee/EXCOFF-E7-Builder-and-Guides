<?php

declare(strict_types=1);

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\File;

class GenerateSkillTranslations extends Command
{
    protected $signature = 'skills:generate-translations 
                            {--hero= : Process only a specific hero by name/key}
                            {--lang= : Process only a specific language (es, pt, ja, ko, zh)}
                            {--force : Force re-translation even if exists}';

    protected $description = 'Generate skill translations using LLM (OpenAI) from en.json source';

    private const LANGUAGES = ['es', 'pt', 'ja', 'ko', 'zh'];
    
    // Glossary to ensure consistent terminology
    private const GLOSSARY = "
    - Combat Readiness: Preparación de Combate (ES), Prontidão de Combate (PT), Hành động (VI), ゲージ (JA), 행동 게이지 (KO), 速攻值 (ZH)
    - Soulburn: Quema de Alma (ES), Queima de Alma (PT), Linh Hồn (VI), ソウルバーン (JA), 소울번 (KO), 灵魂燃烧 (ZH)
    - Stun: Aturdimiento
    - Silence: Silencio
    - Provoke: Provocación
    - Sleep: Sueño
    - Defense Break: Romper Defensa
    - Attack Down: Disminución de Ataque
    - Unbuffable: Bloqueo de Mejoras
    - Buff: Mejora / Beneficio
    - Debuff: Desventaja / Debilitación
    - Dispel: Disipar / Eliminar
    - Strip: Eliminar (buffs)
    - Cleanse: Limpiar / Eliminar (debuffs)
    - CR Push: Aumento de Preparación de Combate
    - Dual Attack: Ataque Dual
    - Penetrate Defense: Penetrar Defensa
    - Extinction: Extinción 
    - Injury: Lesión
    - Restrict: Restricción
    - Seal: Sellar
    - Bind: Atar
    - Venom: Veneno
    ";

    public function handle(): int
    {
        $apiKey = env('OPENAI_API_KEY');
        if (!$apiKey) {
            $this->error('OPENAI_API_KEY is not set in .env');
            return self::FAILURE;
        }

        $sourcePath = base_path('web/src/messages/skills/en.json');
        if (!File::exists($sourcePath)) {
            $this->error("Source file not found: {$sourcePath}");
            return self::FAILURE;
        }

        $enData = json_decode(File::get($sourcePath), true);
        if (!$enData) {
            $this->error("Failed to parse en.json");
            return self::FAILURE;
        }

        $targetLangs = $this->option('lang') ? explode(',', $this->option('lang')) : self::LANGUAGES;
        $specificHero = $this->option('hero');
        $force = $this->option('force');

        foreach ($targetLangs as $lang) {
            $this->info("🚀 Processing language: {$lang}");
            $targetPath = base_path("web/src/messages/skills/{$lang}.json");
            
            // Load existing or init empty
            $targetData = File::exists($targetPath) ? json_decode(File::get($targetPath), true) : [];
            
            $updatesCount = 0;
            $totalHeroes = count($enData);
            $bar = $this->output->createProgressBar($totalHeroes);
            $bar->start();

            foreach ($enData as $heroKey => $heroData) {
                // Skip if not the requested hero
                if ($specificHero && $heroKey !== $specificHero) {
                    $bar->advance();
                    continue;
                }

                // Check if needs translation
                $needsTranslation = $force || !isset($targetData[$heroKey]);
                
                // Also check if any skill is missing (deep check)
                if (!$needsTranslation && isset($heroData['skills'])) {
                    foreach ($heroData['skills'] as $skillKey => $skillVal) {
                        if (!isset($targetData[$heroKey]['skills'][$skillKey])) {
                            $needsTranslation = true;
                            break;
                        }
                    }
                }

                if (!$needsTranslation) {
                    $bar->advance();
                    continue;
                }

                // Translate this hero
                try {
                    $translatedHero = $this->translateHero($heroData, $lang);
                    if ($translatedHero) {
                        $targetData[$heroKey] = $translatedHero;
                        $updatesCount++;
                        
                        // Save periodically (every 5 updates) to avoid data loss
                        if ($updatesCount % 5 === 0) {
                            File::put($targetPath, json_encode($targetData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
                        }
                    }
                } catch (\Exception $e) {
                    $this->error("\nFailed to translate {$heroKey}: " . $e->getMessage());
                }

                $bar->advance();
                
                // Rate limit niceness
                sleep(1); 
            }

            $bar->finish();
            $this->newLine();
            
            // Final save
            File::put($targetPath, json_encode($targetData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            $this->info("✅ Saved {$updatesCount} updates to {$lang}.json");
        }

        return self::SUCCESS;
    }

    private function translateHero(array $heroData, string $lang): ?array
    {
        // Construct prompt
        $skillsJson = json_encode($heroData['skills'], JSON_UNESCAPED_UNICODE);
        
        $prompt = "You are an expert translator for the game Epic Seven. 
        Translate the following skill data from English to Language Code: '{$lang}'.
        
        Rules:
        1. Keep the JSON structure exactly the same. Keys: 'name', 'description', 'soulburn_effect'.
        2. Use the provided Glossary for game terms.
        3. Keep numeric values unchanged.
        4. Return ONLY valid JSON.
        
        Glossary:
        " . self::GLOSSARY . "
        
        Input JSON:
        {$skillsJson}
        ";

        $response = Http::withToken(env('OPENAI_API_KEY'))
            ->timeout(60)
            ->post('https://api.openai.com/v1/chat/completions', [
                'model' => 'gpt-4o-mini',
                'messages' => [
                    ['role' => 'system', 'content' => 'You are a helpful assistant that translates game data JSON.'],
                    ['role' => 'user', 'content' => $prompt]
                ],
                'temperature' => 0.3,
                'response_format' => ['type' => 'json_object']
            ]);

        if ($response->failed()) {
            throw new \Exception("API Error: " . $response->body());
        }

        $content = $response->json('choices.0.message.content');
        $translatedSkills = json_decode($content, true);
        
        // Handle "skills" wrapper if the LLM includes it
        if (isset($translatedSkills['skills'])) {
            $translatedSkills = $translatedSkills['skills'];
        }

        if (!$translatedSkills) {
            throw new \Exception("Failed to decode JSON response");
        }

        return [
            '_name' => $heroData['_name'], // Keep original name mapping key
            'skills' => $translatedSkills
        ];
    }
}
