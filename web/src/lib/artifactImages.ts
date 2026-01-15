// This file maps artifact Fribbels codes (ef###) to datamine art codes (art####)
// The mapping is derived from the order artifacts appear in game data
// Format: "fribbelsCode": "artCode"

export const ARTIFACT_CODE_MAP: Record<string, string> = {
    // 1-star artifacts (ef1##)
    "ef101": "art0007", // Sword of the Sun
    "ef102": "art0008", // Demon's Pistol
    "ef103": "art0009", // Dream Scroll
    "ef104": "art0010", // Biting Wind Star
    "ef105": "art0011", // Venus Orb
    "ef106": "art0012", // Enhanced Gauntlet

    // 2-star artifacts (ef2##)
    "ef201": "art0013", // Deadly Sword
    "ef202": "art0014", // Elf's Bow
    "ef203": "art0015", // Staff of Wisdom
    "ef204": "art0016", // Fairy's Grimoire
    "ef205": "art0017", // Bloodbead Dagger
    "ef206": "art0018", // Firm Shield

    // 3-star artifacts (ef3##)
    "ef301": "art0019", // Grail of Blood
    "ef302": "art0020", // Egg of Delusion
    "ef303": "art0021", // Prophetic Candlestick
    "ef304": "art0022", // Ancient Sheath
    "ef305": "art0023", // Ranon's Memorandum
    "ef306": "art0024", // Atma's Portal
    "ef307": "art0026", // Alsacian Spear
    "ef308": "art0027", // Labyrinth Cube
    "ef309": "art0028", // Cursed Compass
    "ef310": "art0029", // Sword of the Morning
    "ef311": "art0030", // Mighty Yaksha
    "ef312": "art0031", // Devil's Brand
    "ef313": "art0032", // Goblin's Lamp
    "ef314": "art0033", // Aqua Rose
    "ef315": "art0034", // Ascending Axe / Axe of Heavenly Mandate
    "ef316": "art0035", // Exorcist's Tonfa
    "ef317": "art0036", // Daydream Joker
    "ef318": "art0037", // Butterfly Mandolin
    "ef319": "art0038", // Envoy's Pipe
    "ef320": "art0039", // Timeless Anchor
    "ef321": "art0040", // Forest Totem
    "ef322": "art0041", // Oath Key

    // 4-star artifacts (ef4## and efX##)
    "ef401": "art0042", // Card of Small Miracles
    "ef402": "art0043", // Love Potion
    "ef403": "art0044", // Portrait of the Saviors
    "ef404": "art0045", // Rainbow Scale
    "ef405": "art0046", // One Year of Gratitude
    "ef406": "art0047", // Midnight Bloom
    "ef407": "art0048", // Spooky Solayu Stories
    "ef408": "art0049", // Blessings of Camaraderie
    "ef409": "art0050", // Resolute Soldier Series
    "ef410": "art0051", // New Year Cookies
    "ef411": "art0052", // Golden Cocoa Cookie
    "ef412": "art0053", // A Song for Everybody
    "ef413": "art0054", // Super Duper Water Gun Shooter
    "ef414": "art0055", // To a New World
    "ef415": "art0056", // Moonlight's Vestige
    "ef417": "art0058", // XIII. Death
    "ef418": "art0059", // XVI. The Tower
    "ef419": "art0060", // XVIII. The Moon
    "ef420": "art0061", // Days of Destiny
    "ef421": "art0062", // The Guardian Star's Blessing
    "ef422": "art0063", // XIV. Temperance
    "ef423": "art0064", // Official Levulin Beach Volleyball
    "ef424": "art0065", // Records of Unity
    "ef425": "art0066", // Blazing Full Moon Trophy
    "ef426": "art0067", // Brilliant Confidence
    "ef427": "art0068", // Nostalgic Music Box / Succubus Mirror
    "ef428": "art0069", // III. The Empress
    "ef429": "art0070", // IV. The Emperor
    "ef430": "art0071", // XIX. The Sun
    "ef431": "art0073", // VII. The Chariot
    "ef432": "art0076", // Prelude to a New Era
    "ef433": "art0078", // VI. The Lovers
    "ef434": "art0079", // Cutie Pando
    "ef435": "art0080", // Our Beautiful Seasons
    "ef436": "art0081", // New Year's Festival Souvenir
    "ef437": "art0082", // Flames on a snowy mountain
    "ef438": "art0083", // XVII. The Star
    "ef439": "art0084", // Midnight Pizza Delivery
    "ef440": "art0085", // Special Strawberry Cake
    "ef441": "art0086", // XV. The Devil
    "ef442": "art0087", // XII. The Hanged Man
    "ef443": "art0088", // Reingar Festival Dumpling

    // 5-star artifacts - Universal (ef5##)
    "ef501": "art0089", // Proof of Valor
    "ef502": "art0090", // Victorious Flag
    "ef503": "art0091", // Cruel Mischief
    "ef504": "art0092", // A Symbol of Unity
    "ef505": "art0093", // War Horn
    "ef506": "art0094", // Blood-Seared Moon / Guide to a Decision
    "ef507": "art0095", // Bastion of Hope
    "ef508": "art0096", // P.O.S
    "ef509": "art0097", // Frantic Flight

    // Class-specific 5-star artifacts
    // Warrior (efw##)
    "efw01": "art0098", // Sigurd Scythe
    "efw02": "art0099", // Durandal
    "efw03": "art0100", // El's Fist
    "efw04": "art0101", // Hell Cutter
    "efw05": "art0102", // Strak Gauntlet
    "efw06": "art0103", // Uberius's Tooth
    "efw07": "art0104", // Border Coin
    "efw08": "art0105", // Junkyard Dog
    "efw09": "art0106", // Creation & Destruction
    "efw10": "art0107", // Crimson Seed
    "efw11": "art0108", // Draco Plate
    "efw12": "art0109", // Sepulcrum
    "efw13": "art0110", // Alencinox's Wrath
    "efw14": "art0112", // Merciless Glutton
    "efw15": "art0113", // Flower Shower
    "efw16": "art0114", // Cradle of Life
    "efw17": "art0115", // Circus Fantasia
    "efw18": "art0116", // Champion's Trophy
    "efw19": "art0117", // Snow Crystal
    "efw20": "art0119", // Samsara Prayer Beads
    "efw21": "art0120", // A Little Queen's Huge Crown
    "efw22": "art0121", // Azure Comet
    "efw23": "art0122", // Anti-Magic Mask
    "efw24": "art0123", // Pure White Trust
    "efw25": "art0124", // Jack-O's Symbol
    "efw26": "art0125", // Indestructible Gaiters
    "efw27": "art0126", // Spear of Purification
    "efw28": "art0127", // Fullmetal's Automail / Fullmetals Automail
    "efw29": "art0128", // Sword of Autumn Eclipse
    "efw30": "art0129", // Benimaru's Tachi
    "efw31": "art0130", // Golden Rose
    "efw32": "art0131", // Prayer of Solitude
    "efw33": "art0132", // Tyrant's Descent
    "efw34": "art0133", // Pipette Lance
    "efw35": "art0134", // Sweet Miracle
    "efw36": "art0135", // Ruyi Jingu Bang
    "efw37": "art0136", // Thorn of the Blue Rose
    "efw38": "art0137", // Strike of Aspiration
    "efw39": "art0138", // Jumbo Berry Special
    "efw40": "art0139", // Ritual of Sealing Flames
    "efw41": "art0231", // Tome of Life's End

    // Knight (efk##)
    "efk01": "art0140", // Holy Sacrifice
    "efk02": "art0141", // Elbris Ritual Sword
    "efk03": "art0142", // Aurius
    "efk04": "art0143", // Adamant Shield
    "efk05": "art0144", // Hilag Lance
    "efk06": "art0145", // Noble Oath
    "efk07": "art0146", // Justice for All
    "efk08": "art0147", // Sword of Ezera
    "efk09": "art0148", // Bastion of Perlutia
    "efk10": "art0149", // Steadfast Gatekeeper
    "efk11": "art0150", // Glorious Flag - wait, this is assassin
    "efk12": "art0151", // Rise of a Monarch
    "efk13": "art0152", // Crown of Glory
    "efk14": "art0153", // Ancient Dragon's Legacy
    "efk15": "art0154", // Spear of a New Dawn
    "efk16": "art0155", // Wings of Light and Shadow
    "efk17": "art0156", // Sphere of Sadism
    "efk18": "art0157", // Mature Sunglasses
    "efk19": "art0158", // Rocket Punch Gauntlet
    "efk20": "art0159", // Broken Will of the Priest
    "efk21": "art0160", // 3F
    "efk22": "art0161", // M.O.A.S
    "efk23": "art0162", // A Precious Connection

    // Ranger (efr##)
    "efr01": "art0163", // Bloodstone
    "efr02": "art0164", // Song of Stars
    "efr03": "art0165", // Infinity Basket
    "efr04": "art0166", // Sashe Ithanes
    "efr05": "art0167", // Rosa Hargana
    "efr06": "art0168", // Otherworldly Machinery
    "efr07": "art0169", // Ambrote
    "efr08": "art0170", // Iron Fan
    "efr09": "art0171", // Sword of Judgment
    "efr10": "art0172", // Reingar's Special Drink
    "efr11": "art0173", // Andre's Crossbow
    "efr12": "art0174", // Dux Noctis
    "efr13": "art0175", // Guiding Light
    "efr14": "art0176", // Ms. Confille
    "efr15": "art0177", // Wall of Order
    "efr16": "art0178", // Unseen Observer
    "efr17": "art0179", // Air-to-Surface Missile: MISHA
    "efr18": "art0180", // Star of the Deep Sea
    "efr19": "art0181", // Glo-Wings 21
    "efr20": "art0182", // Sharpshooter's Handgun
    "efr21": "art0183", // Spatiotemporal Fan
    "efr22": "art0184", // Seal of Capture
    "efr23": "art0185", // Sphere of Inferno
    "efr24": "art0186", // An Offer You Can't Refuse
    "efr25": "art0187", // Elegiac Candle(s)
    "efr26": "art0188", // Old Gardening Shears
    "efr27": "art0189", // Dreamlike Holiday
    "efr28": "art0190", // Renewed Will
    "efr29": "art0191", // An Assassin's Pledge
    "efr30": "art0192", // Awakened Leaf

    // Mage (efm##)
    "efm01": "art0001", // Abyssal Crown
    "efm02": "art0002", // Etica's Scepter
    "efm03": "art0003", // Tagehel's Ancient Book
    "efm04": "art0004", // Kal'adra
    "efm05": "art0005", // Sira-Ren
    "efm06": "art0006", // Time Matter
    "efm07": "art0193", // Chatty
    "efm08": "art0194", // Iela Violin
    "efm09": "art0195", // Radiant Forever
    "efm10": "art0196", // Necro & Undine
    "efm11": "art0198", // Spirit's Breath
    "efm12": "art0199", // Tear of the Desert
    "efm13": "art0200", // Dignus Orb
    "efm14": "art0201", // Bloody Rose
    "efm15": "art0202", // Barthez's Orbuculum
    "efm16": "art0203", // Black Hand of the Goddess
    "efm17": "art0204", // Last Teatime
    "efm18": "art0205", // Crimson Moon of Nightmares
    "efm19": "art0206", // Fairy Tale for a Nightmare
    "efm20": "art0207", // Knowledge Seed
    "efm21": "art0208", // Twilight Calamity
    "efm22": "art0209", // Severed Horn Wand
    "efm23": "art0210", // Magic for Friends
    "efm24": "art0211", // Upgraded Dragon Knuckles
    "efm25": "art0212", // Scroll of Shadows
    "efm26": "art0213", // Ignition Cloth Gloves
    "efm27": "art0214", // (placeholder)
    "efm28": "art0215", // Frame of Light
    "efm29": "art0216", // Umbral Keystones
    "efm30": "art0217", // Staff of Ainz Ooal Gown
    "efm31": "art0218", // Magic Bubble Maker
    "efm32": "art0219", // Mirrored Lotus Ring
    "efm33": "art0220", // Butterfly Hair Ornament

    // Assassin (efa##)
    "efa01": "art0001", // Rhianna & Luciella - wait needs correction
    "efa02": "art0002", // Wind Rider
    "efa03": "art0003", // Moonlight Dreamblade
    "efa04": "art0004", // Elyha's Knife
    "efa05": "art0005", // Dust Devil
    "efa06": "art0006", // Santa Muerte
    // Note: This needs proper mapping from game data

    // Soul Weaver / Manauser (efh##)
    "efh01": "art0001", // Rod of Amaryllis
    "efh02": "art0002", // Shimadra Staff
    "efh03": "art0003", // Water's Origin
    "efh04": "art0004", // Wondrous Potion Vial
    "efh05": "art0005", // Magaraha's Tome
    "efh06": "art0006", // Celestine
    // Note: This needs proper mapping from game data
};

// Helper function to get the image path for an artifact
export function getArtifactImagePath(fribbelsCode: string): string | null {
    const artCode = ARTIFACT_CODE_MAP[fribbelsCode];
    if (artCode) {
        return `/images/artifacts/icon_${artCode}.png`;
    }
    // Fallback to epic7db if no mapping found
    return null;
}
