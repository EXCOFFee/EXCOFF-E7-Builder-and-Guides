<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

/**
 * Generates complete artifact translation JSON files for all languages.
 * Creates proper, quality translations for Epic Seven artifacts.
 */
class GenerateArtifactTranslations extends Command
{
    protected $signature = 'generate:artifact-translations';
    protected $description = 'Generate complete artifact translation files for all languages';

    private const ARTIFACT_URL = 'http://e7-optimizer-game-data.s3-accelerate.amazonaws.com/artifactdata.json';

    // Complete translations dictionary - priority over automatic
    private array $completeTranslations = [
        'ko' => [
            // New artifacts that need complete Korean translations
            "An Assassin's Pledge" => "암살자의 서약",
            "Queen's Whistle" => "여왕의 호각",
            "Rocket Punch Gauntlet" => "로켓 펀치 건틀렛",
            "Bird's-Eye View" => "조감도",
            "Awakened Leaf" => "각성한 잎사귀",
            "Axe of Heavenly Mandate" => "천명의 도끼",
            "Biting Wind Star" => "사무친 바람의 별",
            "Bloodbead Dagger" => "핏방울 단검",
            "Blessings of Camaraderie" => "동료애의 축복",
            "Brilliant Confidence" => "빛나는 자신감",
            "Butterfly Mandolin" => "나비 만돌린",
            "Card of Small Miracles" => "작은 기적의 카드",
            "Cursed Compass" => "저주받은 나침반",
            "Cutie Pando" => "귀요미 판도",
            "Dark Blood Keeper" => "암흑 피의 수호자",
            "Deadly Sword" => "치명적인 검",
            "Demon's Pistol" => "악마의 권총",
            "Devil's Brand" => "악마의 낙인",
            "Dream Scroll" => "꿈의 두루마리",
            "Egg of Delusion" => "망상의 알",
            "Elegiac Candle" => "비가의 촛불",
            "Elegiac Candles" => "비가의 촛불",
            "Elf's Bow" => "엘프의 활",
            "Enhanced Gauntlet" => "강화된 건틀렛",
            "Envoy's Pipe" => "사절의 파이프",
            "Exorcist's Tonfa" => "퇴마사의 쌍절곤",
            "EXIF Detective (E.d.) Gadget" => "EXIF 탐정 (E.d.) 가젯",
            "Fairy's Grimoire" => "요정의 마법서",
            "Fan of Light and Dark" => "빛과 어둠의 부채",
            "Firm Shield" => "견고한 방패",
            "Flawless Garments" => "완벽한 의복",
            "Flower Shower" => "꽃비",
            "Forest Totem" => "숲의 토템",
            "Frame of Light" => "빛의 액자",
            "Frantic Flight" => "광란의 비행",
            "Glorious Flag" => "영광의 깃발",
            "Goblet of Oath" => "서약의 성배",
            "Goblin's Lamp" => "고블린의 램프",
            "Golden Cocoa Cookie" => "황금 코코아 쿠키",
            "Grail of Blood" => "피의 성배",
            "Guardian Ice Crystals" => "수호 얼음 결정",
            "Guide to a Decision" => "결정의 안내서",
            "Homage to Tarman" => "타르만에 대한 경의",
            "Hostess of the Banquet" => "연회의 여주인",
            "Ignition Cloth Gloves" => "점화천 장갑",
            "III. The Empress" => "III. 여제",
            "IV. The Emperor" => "IV. 황제",
            "Indestructible Gaiters" => "파괴불능 각반",
            "Jumbo Berry Special" => "점보 베리 스페셜",
            "Labyrinth Cube" => "미궁의 큐브",
            "Lethal Whispers" => "치명적인 속삭임",
            "M.O.A.S" => "M.O.A.S",
            "Magic Bubble Maker" => "마법 거품 메이커",
            "Manica of Control" => "지배의 마니카",
            "Master of the Nightmare" => "악몽의 지배자",
            "Mature Sunglasses" => "성숙한 선글라스",
            "Midnight Bloom" => "자정의 꽃",
            "Midnight Pizza Delivery" => "자정 피자 배달",
            "Mighty Yaksha" => "강력한 야차",
            "Mirrored Lotus Ring" => "거울연꽃 반지",
            "Moonlight's Vestige" => "월광의 흔적",
            "New Year Cookies" => "새해 쿠키",
            "Nostalgic Music Box" => "향수어린 오르골",
            "Oath Key" => "서약의 열쇠",
            "Official Levulin Beach Volleyball" => "공식 레불린 비치 발리볼",
            "Old Gardening Shears" => "낡은 정원 가위",
            "One Year of Gratitude" => "감사의 1년",
            "Our Beautiful Seasons" => "우리의 아름다운 계절",
            "P.O.S" => "P.O.S",
            "Pipette Lance" => "피펫 랜스",
            "Prayer of Solitude" => "고독의 기도",
            "Prelude to a New Era" => "새 시대의 서곡",
            "Proof of Friendship" => "우정의 증거",
            "Proof of Love" => "사랑의 증거",
            "Prophetic Candlestick" => "예언의 촛대",
            "Pure White Trust" => "순백의 신뢰",
            "Radiant Forever" => "영원한 빛",
            "Rainbow Scale" => "무지개 비늘",
            "Ranon's Memorandum" => "라논의 메모",
            "Records of Unity" => "단결의 기록",
            "Reingar Festival Dumpling" => "레인가르 축제 만두",
            "Renewed Will" => "새로워진 의지",
            "Resolute Soldier Series" => "결연한 병사 시리즈",
            "Ruyi Jingu Bang" => "여의금고봉",
            "Sacred Tree Branch" => "신성한 나무 가지",
            "Santa Muerte" => "산타 무에르테",
            "Scroll of Shadows" => "그림자의 두루마리",
            "Seal of Capture" => "포획의 인장",
            "Seductive Flower" => "매혹적인 꽃",
            "Sepulcrum" => "세풀크룸",
            "Severed Horn Wand" => "절단된 뿔 지팡이",
            "Sharpshooters Handgun" => "명사수의 권총",
            "Sharpshooter's Handgun" => "명사수의 권총",
            "Shepherd of the Hollow" => "공동의 양치기",
            "Shepherds of Chaos" => "혼돈의 양치기들",
            "Silver Rain" => "은빛 비",
            "Sira-Ren" => "시라렌",
            "Snow Crystal" => "눈 결정",
            "Sole Consolation" => "유일한 위안",
            "Spatiotemporal Fan" => "시공간의 부채",
            "Spear of a New Dawn" => "새 여명의 창",
            "Spear of Purification" => "정화의 창",
            "Special Strawberry Cake" => "특별 딸기 케이크",
            "Sphere of Inferno" => "지옥의 구",
            "Sphere of Sadism" => "가학의 구",
            "Spirit's Breath" => "정령의 숨결",
            "Spooky Solayu Stories" => "으스스한 솔라유 이야기",
            "Spotted Mouse Hair Tie" => "점박이 쥐 헤어밴드",
            "Staff of Ainz Ooal Gown" => "아인즈 울 고운의 지팡이",
            "Staff of Wisdom" => "지혜의 지팡이",
            "Star of the Deep Sea" => "심해의 별",
            "Steadfast Gatekeeper" => "굳건한 문지기",
            "Strike of Aspiration" => "포부의 일격",
            "Succubus Mirror" => "서큐버스 거울",
            "Summer Photogenic" => "여름 포토제닉",
            "Super Duper Water Gun Shooter" => "초강력 물총",
            "Sweet Miracle" => "달콤한 기적",
            "Sword of Autumn Eclipse" => "가을 일식의 검",
            "Sword of Cycling Seasons" => "순환하는 계절의 검",
            "Sword of Ezera" => "에제라의 검",
            "Sword of Summer Twilight" => "여름 황혼의 검",
            "Sword of the Morning" => "아침의 검",
            "Sword of the Sun" => "태양의 검",
            "Sword of Winter Shadow" => "겨울 그림자의 검",
            "Tear of the Desert" => "사막의 눈물",
            "The Armament" => "병기",
            "The Guardian Star's Blessing" => "수호별의 축복",
            "Thorn of the Blue Rose" => "푸른 장미의 가시",
            "Timeless Anchor" => "영원한 닻",
            "To a New World" => "새로운 세계로",
            "Tome of Life's End" => "생명 종말의 서",
            "Ritual of Sealing Flames" => "봉인 화염의 의식",
            "Tyrant's Descent" => "폭군의 강림",
            "Umbral Keystones" => "음영의 주춧돌",
            "Unseen Observer" => "보이지 않는 관찰자",
            "Upgraded Dragon Knuckles" => "업그레이드된 용 너클",
            "Venus Orb" => "금성의 오브",
            "Victorious Flag" => "승리의 깃발",
            "VI. The Lovers" => "VI. 연인들",
            "VII. The Chariot" => "VII. 전차",
            "Water's Origin" => "물의 기원",
            "Wings of Light and Shadow" => "빛과 그림자의 날개",
            "XII. The Hanged Man" => "XII. 매달린 남자",
            "XIII. Death" => "XIII. 죽음",
            "XIV. Temperance" => "XIV. 절제",
            "XV. The Devil" => "XV. 악마",
            "XVI. The Tower" => "XVI. 탑",
            "XVII. The Star" => "XVII. 별",
            "XVIII. The Moon" => "XVIII. 달",
            "XIX. The Sun" => "XIX. 태양",
            "Flames on a snowy mountain" => "눈 덮인 산의 불꽃",
            "New Year's Festival Souvenir" => "새해 축제 기념품",
            "Cure-All Magic Wand" => "만병통치 마법 지팡이",
            "Discreet Hands" => "신중한 손",
            "Feed of Criticism" => "비평의 피드",
        ],
        'ja' => [
            "An Assassin's Pledge" => "暗殺者の誓い",
            "Queen's Whistle" => "女王の笛",
            "Rocket Punch Gauntlet" => "ロケットパンチガントレット",
            "Bird's-Eye View" => "鳥瞰図",
            "Awakened Leaf" => "覚醒した葉",
            "Frantic Flight" => "狂乱の飛行",
            "Glorious Flag" => "栄光の旗",
            "III. The Empress" => "III. 女帝",
            "IV. The Emperor" => "IV. 皇帝",
            "VI. The Lovers" => "VI. 恋人たち",
            "VII. The Chariot" => "VII. 戦車",
            "XII. The Hanged Man" => "XII. 吊るされた男",
            "XIII. Death" => "XIII. 死神",
            "XIV. Temperance" => "XIV. 節制",
            "XV. The Devil" => "XV. 悪魔",
            "XVI. The Tower" => "XVI. 塔",
            "XVII. The Star" => "XVII. 星",
            "XVIII. The Moon" => "XVIII. 月",
            "XIX. The Sun" => "XIX. 太陽",
            "Tome of Life's End" => "生命終末の書",
            "Ritual of Sealing Flames" => "封印炎の儀式",
        ],
        'zh' => [
            "An Assassin's Pledge" => "刺客的誓言",
            "Queen's Whistle" => "女王的哨子",
            "Rocket Punch Gauntlet" => "火箭拳护手",
            "Bird's-Eye View" => "鸟瞰图",
            "Awakened Leaf" => "觉醒之叶",
            "Frantic Flight" => "狂乱飞行",
            "Glorious Flag" => "荣耀之旗",
            "III. The Empress" => "III. 女皇",
            "IV. The Emperor" => "IV. 皇帝",
            "VI. The Lovers" => "VI. 恋人",
            "VII. The Chariot" => "VII. 战车",
            "XII. The Hanged Man" => "XII. 倒吊者",
            "XIII. Death" => "XIII. 死神",
            "XIV. Temperance" => "XIV. 节制",
            "XV. The Devil" => "XV. 恶魔",
            "XVI. The Tower" => "XVI. 塔",
            "XVII. The Star" => "XVII. 星星",
            "XVIII. The Moon" => "XVIII. 月亮",
            "XIX. The Sun" => "XIX. 太阳",
            "Tome of Life's End" => "生命终结之书",
            "Ritual of Sealing Flames" => "封印火焰仪式",
        ],
        'es' => [
            "An Assassin's Pledge" => "Juramento del Asesino",
            "Queen's Whistle" => "Silbato de la Reina",
            "Rocket Punch Gauntlet" => "Guantelete Puño Cohete",
            "Bird's-Eye View" => "Vista de Pájaro",
            "Awakened Leaf" => "Hoja Despertada",
            "Frantic Flight" => "Vuelo Frenético",
            "Glorious Flag" => "Bandera Gloriosa",
            "III. The Empress" => "III. La Emperatriz",
            "IV. The Emperor" => "IV. El Emperador",
            "VI. The Lovers" => "VI. Los Enamorados",
            "VII. The Chariot" => "VII. El Carro",
            "XII. The Hanged Man" => "XII. El Colgado",
            "XIII. Death" => "XIII. La Muerte",
            "XIV. Temperance" => "XIV. La Templanza",
            "XV. The Devil" => "XV. El Diablo",
            "XVI. The Tower" => "XVI. La Torre",
            "XVII. The Star" => "XVII. La Estrella",
            "XVIII. The Moon" => "XVIII. La Luna",
            "XIX. The Sun" => "XIX. El Sol",
            "Tome of Life's End" => "Tomo del Fin de la Vida",
            "Ritual of Sealing Flames" => "Ritual de Llamas Selladoras",
            "Axe of Heavenly Mandate" => "Hacha del Mandato Celestial",
            "Biting Wind Star" => "Estrella del Viento Cortante",
            "Bloodbead Dagger" => "Daga de Cuentas de Sangre",
            "Blessings of Camaraderie" => "Bendiciones de Camaradería",
            "Brilliant Confidence" => "Confianza Brillante",
            "Butterfly Mandolin" => "Mandolina Mariposa",
            "Card of Small Miracles" => "Carta de Pequeños Milagros",
            "Pure White Trust" => "Confianza Pura y Blanca",
            "Midnight Pizza Delivery" => "Entrega de Pizza a Medianoche",
            "Ruyi Jingu Bang" => "Báculo Mágico Ruyi",
        ],
        'pt' => [
            "An Assassin's Pledge" => "Juramento do Assassino",
            "Queen's Whistle" => "Apito da Rainha",
            "Rocket Punch Gauntlet" => "Manopla do Soco Foguete",
            "Bird's-Eye View" => "Visão Panorâmica",
            "Awakened Leaf" => "Folha Desperta",
            "Frantic Flight" => "Voo Frenético",
            "Glorious Flag" => "Bandeira Gloriosa",
            "III. The Empress" => "III. A Imperatriz",
            "IV. The Emperor" => "IV. O Imperador",
            "VI. The Lovers" => "VI. Os Amantes",
            "VII. The Chariot" => "VII. O Carro",
            "XII. The Hanged Man" => "XII. O Enforcado",
            "XIII. Death" => "XIII. A Morte",
            "XIV. Temperance" => "XIV. A Temperança",
            "XV. The Devil" => "XV. O Diabo",
            "XVI. The Tower" => "XVI. A Torre",
            "XVII. The Star" => "XVII. A Estrela",
            "XVIII. The Moon" => "XVIII. A Lua", 
            "XIX. The Sun" => "XIX. O Sol",
            "Tome of Life's End" => "Tomo do Fim da Vida",
            "Ritual of Sealing Flames" => "Ritual de Chamas Seladas",
        ],
    ];

    // Existing manual translations loaded from files
    private array $existingTranslations = [];

    public function handle()
    {
        $this->info('🌐 Generating artifact translations...');

        // Load existing translations first
        $this->loadExistingTranslations();

        // Fetch all artifacts from Fribbels
        $this->info('📥 Fetching artifact data from Fribbels...');
        $response = Http::timeout(30)->get(self::ARTIFACT_URL);
        
        if (!$response->successful()) {
            $this->error('Failed to fetch artifact data');
            return 1;
        }

        $artifacts = $response->json();
        $this->info('Found ' . count($artifacts) . ' artifacts');

        // Generate translations for each language
        $languages = ['en', 'es', 'ko', 'ja', 'zh', 'pt'];
        $translations = [];

        foreach ($languages as $lang) {
            $translations[$lang] = [];
        }

        $bar = $this->output->createProgressBar(count($artifacts));
        $bar->start();

        foreach ($artifacts as $artifactData) {
            $englishName = $artifactData['name'] ?? 'Unknown';
            
            // English is always the original
            $translations['en'][$englishName] = $englishName;

            // Get translations for each language
            foreach (['es', 'ko', 'ja', 'zh', 'pt'] as $lang) {
                $translations[$lang][$englishName] = $this->getTranslation($englishName, $lang);
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        // Save to JSON files
        $outputPath = base_path('../web/messages/artifacts');
        
        foreach ($languages as $lang) {
            $file = "$outputPath/$lang.json";
            // Sort alphabetically by key
            ksort($translations[$lang]);
            file_put_contents(
                $file,
                json_encode($translations[$lang], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)
            );
            $this->info("✅ Saved $lang.json (" . count($translations[$lang]) . " artifacts)");
        }

        $this->newLine();
        $this->info('🎉 Translation files generated successfully!');

        return 0;
    }

    private function loadExistingTranslations(): void
    {
        $basePath = base_path('../web/messages/artifacts');
        $languages = ['es', 'ko', 'ja', 'zh', 'pt'];

        foreach ($languages as $lang) {
            $file = "$basePath/$lang.json";
            if (file_exists($file)) {
                $content = json_decode(file_get_contents($file), true);
                if ($content) {
                    foreach ($content as $en => $translated) {
                        // Only use if it's actually a quality translation (not partial)
                        if (!empty($translated) && 
                            $translated !== $en && 
                            !preg_match("/'s\s/", $translated) && // Filter out broken "'s " patterns
                            !preg_match('/^[A-Za-z]+\s[^A-Za-z]+$/', $translated) // Filter mixed patterns
                        ) {
                            $this->existingTranslations[$lang][$en] = $translated;
                        }
                    }
                    $this->info("Loaded " . count($this->existingTranslations[$lang] ?? []) . " quality $lang translations");
                }
            }
        }
    }

    private function getTranslation(string $englishName, string $lang): string
    {
        // Priority 1: Use our complete translations dictionary (highest quality)
        if (isset($this->completeTranslations[$lang][$englishName])) {
            return $this->completeTranslations[$lang][$englishName];
        }

        // Priority 2: Use existing file translation if quality
        if (isset($this->existingTranslations[$lang][$englishName])) {
            return $this->existingTranslations[$lang][$englishName];
        }

        // Priority 3: Return English name for untranslated items
        // This is better than partial/broken translations
        return $englishName;
    }
}
