<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Hero;
use Illuminate\Console\Command;

/**
 * Generate skill translations for all heroes.
 * 
 * This command:
 * 1. Loads custom hero data from JSON files for priority heroes
 * 2. Uses existing skill descriptions for other heroes
 * 3. Generates translations to all 6 supported languages
 * 
 * Usage: php artisan skills:generate-translations
 */
class GenerateSkillTranslations extends Command
{
    protected $signature = 'skills:generate-translations 
                            {--hero= : Process only a specific hero by slug}
                            {--dry-run : Show what would be updated without making changes}';

    protected $description = 'Generate skill translations for all heroes in 6 languages';

    // Languages to generate translations for
    private const LANGUAGES = ['en', 'es', 'ko', 'ja', 'zh', 'pt'];

    // Common skill-related terms and their translations
    private const TERM_TRANSLATIONS = [
        // Attack/Damage terms
        'Attacks' => ['es' => 'Ataca', 'ko' => '공격', 'ja' => '攻撃', 'zh' => '攻击', 'pt' => 'Ataca'],
        'attacks' => ['es' => 'ataca', 'ko' => '공격', 'ja' => '攻撃', 'zh' => '攻击', 'pt' => 'ataca'],
        'the enemy' => ['es' => 'al enemigo', 'ko' => '적', 'ja' => '敵', 'zh' => '敌人', 'pt' => 'o inimigo'],
        'all enemies' => ['es' => 'a todos los enemigos', 'ko' => '모든 적', 'ja' => '全ての敵', 'zh' => '所有敌人', 'pt' => 'todos os inimigos'],
        'damage' => ['es' => 'daño', 'ko' => '피해', 'ja' => 'ダメージ', 'zh' => '伤害', 'pt' => 'dano'],
        'Damage' => ['es' => 'Daño', 'ko' => '피해', 'ja' => 'ダメージ', 'zh' => '伤害', 'pt' => 'Dano'],
        
        // Stats
        'Attack' => ['es' => 'Ataque', 'ko' => '공격력', 'ja' => '攻撃力', 'zh' => '攻击力', 'pt' => 'Ataque'],
        'Defense' => ['es' => 'Defensa', 'ko' => '방어력', 'ja' => '防御力', 'zh' => '防御力', 'pt' => 'Defesa'],
        'Health' => ['es' => 'Vida', 'ko' => '체력', 'ja' => 'HP', 'zh' => '生命值', 'pt' => 'Vida'],
        'Speed' => ['es' => 'Velocidad', 'ko' => '속도', 'ja' => 'スピード', 'zh' => '速度', 'pt' => 'Velocidade'],
        'max Health' => ['es' => 'Vida máxima', 'ko' => '최대 체력', 'ja' => '最大HP', 'zh' => '最大生命值', 'pt' => 'Vida máxima'],
        'Critical Hit' => ['es' => 'Golpe Crítico', 'ko' => '치명타', 'ja' => 'クリティカル', 'zh' => '暴击', 'pt' => 'Golpe Crítico'],
        
        // Effects
        'increases' => ['es' => 'aumenta', 'ko' => '증가', 'ja' => '増加', 'zh' => '增加', 'pt' => 'aumenta'],
        'decreases' => ['es' => 'disminuye', 'ko' => '감소', 'ja' => '減少', 'zh' => '减少', 'pt' => 'diminui'],
        'grants' => ['es' => 'otorga', 'ko' => '부여', 'ja' => '付与', 'zh' => '赋予', 'pt' => 'concede'],
        'dispels' => ['es' => 'disipa', 'ko' => '해제', 'ja' => '解除', 'zh' => '驱散', 'pt' => 'dissipa'],
        'heals' => ['es' => 'cura', 'ko' => '회복', 'ja' => '回復', 'zh' => '治疗', 'pt' => 'cura'],
        'recovers' => ['es' => 'recupera', 'ko' => '회복', 'ja' => '回復', 'zh' => '恢复', 'pt' => 'recupera'],
        'recovering' => ['es' => 'recuperando', 'ko' => '회복', 'ja' => '回復', 'zh' => '恢复', 'pt' => 'recuperando'],
        
        // Buffs
        'increased Attack' => ['es' => 'Aumento de Ataque', 'ko' => '공격력 증가', 'ja' => '攻撃力アップ', 'zh' => '攻击力增加', 'pt' => 'Aumento de Ataque'],
        'increased Defense' => ['es' => 'Aumento de Defensa', 'ko' => '방어력 증가', 'ja' => '防御力アップ', 'zh' => '防御力增加', 'pt' => 'Aumento de Defesa'],
        'increased Speed' => ['es' => 'Aumento de Velocidad', 'ko' => '속도 증가', 'ja' => 'スピードアップ', 'zh' => '速度增加', 'pt' => 'Aumento de Velocidade'],
        'immunity' => ['es' => 'inmunidad', 'ko' => '면역', 'ja' => '免疫', 'zh' => '免疫', 'pt' => 'imunidade'],
        'Immunity' => ['es' => 'Inmunidad', 'ko' => '면역', 'ja' => '免疫', 'zh' => '免疫', 'pt' => 'Imunidade'],
        'barrier' => ['es' => 'barrera', 'ko' => '보호막', 'ja' => 'バリア', 'zh' => '护盾', 'pt' => 'barreira'],
        'Skill Nullifier' => ['es' => 'Anulador de Habilidad', 'ko' => '스킬 무효', 'ja' => 'スキル無効', 'zh' => '技能无效', 'pt' => 'Anulador de Habilidade'],
        
        // Debuffs
        'stun' => ['es' => 'aturdimiento', 'ko' => '기절', 'ja' => 'スタン', 'zh' => '眩晕', 'pt' => 'atordoamento'],
        'Stun' => ['es' => 'Aturdimiento', 'ko' => '기절', 'ja' => 'スタン', 'zh' => '眩晕', 'pt' => 'Atordoamento'],
        'silence' => ['es' => 'silencio', 'ko' => '침묵', 'ja' => '沈黙', 'zh' => '沉默', 'pt' => 'silêncio'],
        'Silence' => ['es' => 'Silencio', 'ko' => '침묵', 'ja' => '沈黙', 'zh' => '沉默', 'pt' => 'Silêncio'],
        'provoke' => ['es' => 'provocar', 'ko' => '도발', 'ja' => '挑発', 'zh' => '嘲讽', 'pt' => 'provocar'],
        'Provoke' => ['es' => 'Provocación', 'ko' => '도발', 'ja' => '挑発', 'zh' => '嘲讽', 'pt' => 'Provocação'],
        'decrease Defense' => ['es' => 'reducir Defensa', 'ko' => '방어력 감소', 'ja' => '防御力ダウン', 'zh' => '防御力下降', 'pt' => 'reduzir Defesa'],
        'decrease Attack' => ['es' => 'reducir Ataque', 'ko' => '공격력 감소', 'ja' => '攻撃力ダウン', 'zh' => '攻击力下降', 'pt' => 'reduzir Ataque'],
        'Burn' => ['es' => 'Quemadura', 'ko' => '화상', 'ja' => 'バーン', 'zh' => '灼烧', 'pt' => 'Queimadura'],
        'Bleed' => ['es' => 'Sangrado', 'ko' => '출혈', 'ja' => '出血', 'zh' => '流血', 'pt' => 'Sangramento'],
        'Poison' => ['es' => 'Veneno', 'ko' => '독', 'ja' => '毒', 'zh' => '中毒', 'pt' => 'Veneno'],
        
        // Combat terms
        'Combat Readiness' => ['es' => 'Preparación de Combate', 'ko' => '전투 준비', 'ja' => '戦闘準備', 'zh' => '战意', 'pt' => 'Prontidão de Combate'],
        'counterattack' => ['es' => 'contraataque', 'ko' => '반격', 'ja' => '反撃', 'zh' => '反击', 'pt' => 'contra-ataque'],
        'Counterattack' => ['es' => 'Contraataque', 'ko' => '반격', 'ja' => '反撃', 'zh' => '反击', 'pt' => 'Contra-ataque'],
        'Dual Attack' => ['es' => 'Ataque Dual', 'ko' => '협동 공격', 'ja' => '連携攻撃', 'zh' => '联合攻击', 'pt' => 'Ataque Duplo'],
        'extra turn' => ['es' => 'turno adicional', 'ko' => '추가 턴', 'ja' => '追加ターン', 'zh' => '额外回合', 'pt' => 'turno adicional'],
        'penetrates Defense' => ['es' => 'penetra Defensa', 'ko' => '방어력 관통', 'ja' => '防御力貫通', 'zh' => '穿透防御', 'pt' => 'penetra Defesa'],
        'penetrates' => ['es' => 'penetra', 'ko' => '관통', 'ja' => '貫通', 'zh' => '穿透', 'pt' => 'penetra'],
        'ignores' => ['es' => 'ignora', 'ko' => '무시', 'ja' => '無視', 'zh' => '无视', 'pt' => 'ignora'],
        
        // General terms
        'turn' => ['es' => 'turno', 'ko' => '턴', 'ja' => 'ターン', 'zh' => '回合', 'pt' => 'turno'],
        'turns' => ['es' => 'turnos', 'ko' => '턴', 'ja' => 'ターン', 'zh' => '回合', 'pt' => 'turnos'],
        'caster' => ['es' => 'lanzador', 'ko' => '술자', 'ja' => '術者', 'zh' => '施法者', 'pt' => 'conjurador'],
        'ally' => ['es' => 'aliado', 'ko' => '아군', 'ja' => '味方', 'zh' => '队友', 'pt' => 'aliado'],
        'allies' => ['es' => 'aliados', 'ko' => '아군', 'ja' => '味方', 'zh' => '队友', 'pt' => 'aliados'],
        'all allies' => ['es' => 'todos los aliados', 'ko' => '모든 아군', 'ja' => '全ての味方', 'zh' => '所有队友', 'pt' => 'todos os aliados'],
        'target' => ['es' => 'objetivo', 'ko' => '대상', 'ja' => 'ターゲット', 'zh' => '目标', 'pt' => 'alvo'],
        'chance' => ['es' => 'probabilidad', 'ko' => '확률', 'ja' => '確率', 'zh' => '几率', 'pt' => 'chance'],
        'proportional' => ['es' => 'proporcional', 'ko' => '비례', 'ja' => '比例', 'zh' => '根据', 'pt' => 'proporcional'],
        
        // Soulburn
        'Soulburn' => ['es' => 'Quema de Alma', 'ko' => '소울번', 'ja' => 'ソウルバーン', 'zh' => '灵魂燃烧', 'pt' => 'Queima de Alma'],
        'soulburn' => ['es' => 'quema de alma', 'ko' => '소울번', 'ja' => 'ソウルバーン', 'zh' => '灵魂燃烧', 'pt' => 'queima de alma'],
        'Ignores Effect Resistance' => ['es' => 'Ignora Resistencia a Efectos', 'ko' => '효과 저항 무시', 'ja' => '効果抵抗無視', 'zh' => '无视效果抵抗', 'pt' => 'Ignora Resistência a Efeitos'],
        
        // Passive terms
        'passive' => ['es' => 'pasiva', 'ko' => '패시브', 'ja' => 'パッシブ', 'zh' => '被动', 'pt' => 'passiva'],
        'At the start of battle' => ['es' => 'Al inicio del combate', 'ko' => '전투 시작 시', 'ja' => '戦闘開始時', 'zh' => '战斗开始时', 'pt' => 'No início da batalha'],
        'When attacked' => ['es' => 'Al ser atacado', 'ko' => '피격 시', 'ja' => '攻撃を受けた時', 'zh' => '被攻击时', 'pt' => 'Ao ser atacado'],
    ];

    public function handle(): int
    {
        $this->info('🌐 Generating skill translations for all heroes...');
        $this->newLine();

        $dryRun = $this->option('dry-run');
        $specificHero = $this->option('hero');

        // Load custom hero data for priority translations
        $customHeroes = $this->loadCustomHeroData();
        $this->info("📚 Loaded " . count($customHeroes) . " custom hero entries");

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

        $bar = $this->output->createProgressBar($heroes->count());
        $bar->start();

        foreach ($heroes as $hero) {
            $skills = $hero->skills ?? [];
            
            if (empty($skills)) {
                $skipped++;
                $bar->advance();
                continue;
            }

            // Check if this hero has custom data
            $customData = $customHeroes[$hero->slug] ?? null;
            
            // Add translations to each skill
            $translatedSkills = $this->addSkillTranslations($skills, $customData);

            if ($dryRun) {
                $this->newLine();
                $this->info("Would update: {$hero->name}");
                $this->showTranslationPreview($translatedSkills);
            } else {
                $hero->skills = $translatedSkills;
                $hero->save();
            }

            $updated++;
            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $this->info("✅ Updated: {$updated} heroes");
        $this->info("⏭ Skipped: {$skipped} heroes (no skills)");

        return self::SUCCESS;
    }

    /**
     * Load custom hero data from JSON files.
     */
    private function loadCustomHeroData(): array
    {
        $customHeroes = [];
        
        $customPath = database_path('data/custom_heroes.json');
        if (file_exists($customPath)) {
            $data = json_decode(file_get_contents($customPath), true);
            foreach ($data as $slug => $heroData) {
                if ($slug !== '_meta' && isset($heroData['skills'])) {
                    $customHeroes[$slug] = $heroData;
                }
            }
        }

        // Load balance patches
        $balancePaths = glob(database_path('data/balance_patch_*.json'));
        foreach ($balancePaths as $path) {
            $data = json_decode(file_get_contents($path), true);
            if (is_array($data)) {
                foreach ($data as $slug => $heroData) {
                    if (isset($heroData['skills'])) {
                        $customHeroes[$slug] = $heroData;
                    }
                }
            }
        }

        return $customHeroes;
    }

    /**
     * Add translations to skill data.
     */
    private function addSkillTranslations(array $skills, ?array $customData): array
    {
        $result = $skills;

        foreach ($result as $skillKey => &$skill) {
            if (!str_starts_with($skillKey, 'S')) continue;

            // Get English name and description
            $enName = $skill['name'] ?? null;
            $enDesc = $skill['description'] ?? null;
            $enSoulburn = $skill['soulburn_effect'] ?? null;

            // If custom data has this skill with better description, use it
            if ($customData && isset($customData['skills'][$skillKey])) {
                $customSkill = $customData['skills'][$skillKey];
                if (isset($customSkill['name'])) {
                    $enName = $customSkill['name'];
                    $skill['name'] = $enName;
                }
                if (isset($customSkill['description'])) {
                    $enDesc = $customSkill['description'];
                    $skill['description'] = $enDesc;
                }
                if (isset($customSkill['soulburn_effect'])) {
                    $enSoulburn = $customSkill['soulburn_effect'];
                    $skill['soulburn_effect'] = $enSoulburn;
                }
            }

            // Generate translations for name
            if ($enName) {
                foreach (self::LANGUAGES as $lang) {
                    if ($lang === 'en') continue;
                    $skill["name_{$lang}"] = $this->translateText($enName, $lang, 'name');
                }
            }

            // Generate translations for description
            if ($enDesc) {
                foreach (self::LANGUAGES as $lang) {
                    if ($lang === 'en') continue;
                    $skill["description_{$lang}"] = $this->translateText($enDesc, $lang, 'description');
                }
            }

            // Generate translations for soulburn effect
            if ($enSoulburn) {
                foreach (self::LANGUAGES as $lang) {
                    if ($lang === 'en') continue;
                    $skill["soulburn_effect_{$lang}"] = $this->translateText($enSoulburn, $lang, 'soulburn');
                }
            }
        }

        return $result;
    }

    /**
     * Translate text using term dictionary.
     */
    private function translateText(string $text, string $lang, string $type): string
    {
        $translated = $text;

        // Sort terms by length (longest first) to avoid partial replacements
        $terms = self::TERM_TRANSLATIONS;
        uksort($terms, fn($a, $b) => strlen($b) - strlen($a));

        foreach ($terms as $en => $translations) {
            if (isset($translations[$lang])) {
                $translated = str_replace($en, $translations[$lang], $translated);
            }
        }

        return $translated;
    }

    /**
     * Show preview of translations.
     */
    private function showTranslationPreview(array $skills): void
    {
        foreach ($skills as $key => $skill) {
            if (!str_starts_with($key, 'S')) continue;
            
            $name = $skill['name'] ?? '(no name)';
            $nameEs = $skill['name_es'] ?? '-';
            
            $this->line("  {$key}: {$name}");
            $this->line("    ES: {$nameEs}");
        }
    }
}
