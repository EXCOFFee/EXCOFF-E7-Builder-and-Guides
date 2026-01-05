'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { heroApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useTranslations } from '@/hooks/useTranslations';
import { useHeroTranslations } from '@/hooks/useNameTranslations';

interface Hero {
    id: number;
    code: string;
    name: string;
    slug: string;
    element: string;
    class: string;
    rarity: number;
    image_url: string;
}

// Element to image mapping
const ELEMENT_IMAGES: Record<string, string> = {
    fire: '/images/elements/ElementFire.png',
    ice: '/images/elements/ElementWater.png',
    earth: '/images/elements/ElementEarth.png',
    light: '/images/elements/ElementLight.png',
    dark: '/images/elements/ElementDark.png',
};

const ELEMENT_NAMES: Record<string, string> = {
    fire: 'Fire',
    ice: 'Ice',
    earth: 'Earth',
    light: 'Light',
    dark: 'Dark',
};

// Class to image mapping
const CLASS_IMAGES: Record<string, string> = {
    knight: '/images/classes/ClassKnight.png',
    warrior: '/images/classes/ClassWarrior.png',
    thief: '/images/classes/ClassThief.png',
    ranger: '/images/classes/ClassRanger.png',
    mage: '/images/classes/ClassMage.png',
    soul_weaver: '/images/classes/ClassSoul_Waver.png',
};

const CLASS_NAMES: Record<string, string> = {
    knight: 'Knight',
    warrior: 'Warrior',
    thief: 'Thief',
    ranger: 'Ranger',
    mage: 'Mage',
    soul_weaver: 'Soul Weaver',
};

// Hero portraits that need custom positioning (faces cut off with center)
// Values: CSS object-position (higher % = shows more of the right side)
const HERO_POSITION_OVERRIDE: Record<string, string> = {
    // Batch from user screenshots - 80+ heroes
    'abyssal-yufine': '15% 30%',
    'afternoon-soak-flan': '20% 35%',
    'ainz-ooal-gown': 'center 30%',
    'amid': '25% 30%',
    'angel-of-light-angelica': '20% 30%',
    'apocalypse-ravi': '15% 35%',
    'archdemon-shadow': '10% 35%',
    'archemons-shadow': '10% 35%',
    'archduke-tywin': '30% 30%',
    'architect-laika': 'center 20%',
    'aria': '15% 25%',
    'arunka': '75% 30%',
    'assassin-cidd': '40% 30%',
    'astromancer-elena': '25% 30%',
    'auxiliary-lots': '20% 25%',
    'basar': '30% 30%',
    'bask': '85% center',
    'belian': '30% 25%',
    'birgitta': '35% 30%',
    'blessed-crozet': '30% 30%',
    'blood-moon-haste': '20% 30%',
    'blooming-lidica': '25% 35%',
    'boss-arunka': '75% 30%',
    'briar-witch-iseria': '30% 30%',
    'butcher-corps-inquisitor': '20% 35%',
    'caides': 'center 30%',
    'captain-rikoris': '30% 30%',
    'celestial-mercedes': '25% 30%',
    'cerise': '25% 30%',
    'challenger-dominiel': '25% 30%',
    'champion-zerato': '30% 30%',
    'chaos-inquisitor': '25% 30%',
    'chaos-sect-axe': '85% center',
    'charles': '30% 30%',
    'charlotte': '25% 35%',
    'choux': '30% 30%',
    'cidd': '70% 30%',
    'cici': '25% 30%',
    'clarissa': '25% 30%',
    'closer-charles': '30% 30%',
    'closest-kin-yulha': '30% 25%',
    'coli': '25% 30%',
    'commander-lorina': '25% 30%',
    'conqueror-lilias': '35% 30%',
    'crimson-armin': '30% 30%',
    'dark-corvus': '40% 30%',
    'designer-lilibet': '25% 30%',
    'desert-jewel-basar': '30% 30%',
    'diene': '25% 30%',
    'dominiel': '25% 30%',
    'elena': '25% 30%',
    'elphelt-valentine': '30% 30%',
    'emilia': '25% 30%',
    'faithless-lidica': '25% 30%',
    'falconer-kluri': '25% 30%',
    'fighter-maya': '30% 30%',
    'free-spirit-tieria': '25% 30%',
    'furious': '70% 30%',
    'goddess-of-vengeful-light-achates': '25% 25%',
    'guiding-light-elson': '30% 30%',
    'gunther': '30% 30%',
    'haste': '25% 30%',
    'hasteloch-seeker-yulha': '30% 25%',
    'hataan': '30% 30%',
    'heavenly-blade-shikinomai': '30% 25%',
    'helen': '25% 30%',
    'holiday-yufine': '25% 30%',
    'hwayoung': '30% 30%',
    'ilynav': '25% 30%',
    'iseria': '25% 30%',
    'judge-kise': '25% 30%',
    'karin': '25% 30%',
    'kawerik': '30% 30%',
    'kayron': '70% 30%',
    'ken': '30% 30%',
    'kikirat-v2': '85% center',
    'kise': '25% 30%',
    'kitty-clarissa': '25% 30%',
    'landy': '30% 30%',
    'last-rider-krau': '35% 30%',
    'lilias': '30% 30%',
    'lilibet': '25% 30%',
    'luna': '70% 30%',
    'magic-scholar-doris': '25% 30%',
    'maid-chloe': '85% center',
    'martial-artist-ken': '30% 30%',
    'mascot-hazel': '85% center',
    'mediator-kawerik': '30% 30%',
    'melissa': '25% 30%',
    'moon-bunny-dominiel': '25% 30%',
    'mort': '35% 30%',
    'penelope': '25% 30%',
    'politis': '25% 30%',
    'purple-phantom-sharun': '30% 30%',
    'ran': '30% 30%',
    'remnant-violet': '70% 30%',
    'righteous-thief-roozid': '85% center',
    'roaming-warrior-leo': '85% center',
    'sage-baal-and-sezan': '30% 30%',
    'school-nurse-yulha': '30% 25%',
    'seal-guardian-arowell': '30% 30%',
    'seaside-bellona': '85% center',
    'senya': '25% 30%',
    'serila': '25% 30%',
    'shepherd-of-the-dark-diene': '25% 30%',
    'solitaria-of-the-snow': '25% 30%',
    'specimen-sez': '85% center',
    'summertime-iseria': '30% 25%',
    'tempest-surin': '25% 30%',
    'troublemaker-crozet': '30% 30%',
    'vildred': '70% 30%',
    'violet': '70% 30%',
    'vivian': '85% center',
    'watcher-schuri': '85% center',
    'yoonseok': '30% 30%',
    'zeno': '85% center',
    'zio': '30% 30%',
};

export default function HeroesPage() {
    const { t } = useTranslations();
    const { translateHeroName } = useHeroTranslations();
    const [search, setSearch] = useState('');
    const [elementFilter, setElementFilter] = useState('');
    const [classFilter, setClassFilter] = useState('');
    const [rarityFilter, setRarityFilter] = useState<number | null>(null);

    const { data, isLoading, error } = useQuery({
        queryKey: ['heroes', search, elementFilter, classFilter, rarityFilter],
        queryFn: async () => {
            const params: Record<string, string> = {};
            if (search) params.search = search;
            if (elementFilter) params.element = elementFilter;
            if (classFilter) params.class = classFilter;
            if (rarityFilter) params.rarity = rarityFilter.toString();

            const response = await heroApi.list(params);
            return response.data;
        },
    });

    const heroes: Hero[] = data?.data || [];

    return (
        <div className="min-h-screen bg-e7-void py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-10 text-center">
                    <h1 className="font-display text-4xl md:text-5xl text-gold-gradient tracking-wide mb-2">{t('heroes.title', 'Hero Database')}</h1>
                    <p className="text-slate-400 max-w-xl mx-auto">{t('heroes.description', 'Explore all Epic Seven heroes, their stats and builds')}</p>
                </div>

                {/* Filters */}
                <div className="mb-8 space-y-4 bg-e7-panel p-4 rounded-lg border border-white/6">
                    <Input
                        placeholder={t('heroes.searchPlaceholder', 'Search heroes...')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="max-w-md bg-white/4 border-white/8 text-neutral-200 placeholder:text-neutral-500 focus:border-e7-gold"
                    />

                    {/* Element Filter */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-gray-400 text-sm mr-2">{t('heroes.filterElement', 'Element')}:</span>
                        {Object.entries(ELEMENT_IMAGES).map(([el, img]) => (
                            <button
                                key={el}
                                onClick={() => setElementFilter(elementFilter === el ? '' : el)}
                                className={`relative w-9 h-9 rounded-md transition-colors ${elementFilter === el
                                    ? 'bg-e7-gold/20 ring-1 ring-e7-gold'
                                    : 'hover:bg-white/6 opacity-70 hover:opacity-100'
                                    }`}
                                title={ELEMENT_NAMES[el]}
                            >
                                <Image
                                    src={img}
                                    alt={ELEMENT_NAMES[el]}
                                    width={40}
                                    height={40}
                                    className="w-full h-full object-contain"
                                />
                            </button>
                        ))}
                    </div>

                    {/* Class Filter */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-gray-400 text-sm mr-2">{t('heroes.filterClass', 'Class')}:</span>
                        {Object.entries(CLASS_IMAGES).map(([cls, img]) => (
                            <button
                                key={cls}
                                onClick={() => setClassFilter(classFilter === cls ? '' : cls)}
                                className={`relative w-9 h-9 rounded-md transition-colors ${classFilter === cls
                                    ? 'bg-e7-gold/20 ring-1 ring-e7-gold'
                                    : 'hover:bg-white/6 opacity-70 hover:opacity-100'
                                    }`}
                                title={CLASS_NAMES[cls]}
                            >
                                <Image
                                    src={img}
                                    alt={CLASS_NAMES[cls]}
                                    width={40}
                                    height={40}
                                    className="w-full h-full object-contain"
                                />
                            </button>
                        ))}
                    </div>

                    {/* Rarity Filter */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-gray-400 text-sm mr-2">{t('heroes.filterRarity', 'Rarity')}:</span>
                        {[5, 4, 3].map((rarity) => (
                            <button
                                key={rarity}
                                onClick={() => setRarityFilter(rarityFilter === rarity ? null : rarity)}
                                className={`px-3 py-1.5 rounded-md transition-colors text-sm ${rarityFilter === rarity
                                    ? 'bg-e7-gold/20 ring-1 ring-e7-gold'
                                    : 'hover:bg-white/6 opacity-70 hover:opacity-100 bg-white/4'
                                    } ${rarity === 5 ? 'text-e7-gold' : rarity === 4 ? 'text-purple-400' : 'text-blue-400'}`}
                                title={`${rarity} ${t('common.stars', 'Stars')}`}
                            >
                                {'★'.repeat(rarity)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex justify-center py-20">
                        <LoadingSpinner size="lg" text={t('heroes.loadingHeroes', 'Loading heroes...')} />
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="text-center text-red-400 py-20">
                        <p>{t('heroes.loadError', 'Error loading heroes. Make sure the API is running.')}</p>
                        <p className="text-sm text-gray-500 mt-2">
                            API URL: {process.env.NEXT_PUBLIC_API_URL || t('common.notConfigured', 'Not configured')}
                        </p>
                    </div>
                )}

                {/* Heroes Grid */}
                {!isLoading && !error && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                        {heroes.length === 0 ? (
                            <p className="text-slate-400 col-span-full text-center py-10">
                                {t('heroes.noResults', 'No heroes found.')}
                            </p>
                        ) : (
                            heroes.map((hero) => (
                                <Link key={hero.id} href={`/heroes/${hero.slug}`}>
                                    <div className="bg-e7-panel rounded-lg overflow-hidden border border-white/6 hover:border-e7-gold/30 transition-colors h-full group">
                                        {/* Hero Image Container */}
                                        <div className="aspect-square bg-e7-dark relative overflow-hidden">
                                            {hero.image_url ? (
                                                <Image
                                                    src={hero.image_url}
                                                    alt={hero.name}
                                                    width={256}
                                                    height={256}
                                                    className="w-full h-full object-cover"
                                                    style={{
                                                        objectPosition: HERO_POSITION_OVERRIDE[hero.slug] || 'center',
                                                    }}
                                                    unoptimized
                                                    priority={false}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Image
                                                        src={CLASS_IMAGES[hero.class] || '/images/classes/ClassWarrior.png'}
                                                        alt={hero.class}
                                                        width={80}
                                                        height={80}
                                                        className="opacity-30"
                                                    />
                                                </div>
                                            )}

                                            {/* Element & Class floating badges */}
                                            <div className="absolute top-2 left-2 flex gap-1">
                                                <div className="w-7 h-7 rounded-lg glass-panel flex items-center justify-center">
                                                    <Image
                                                        src={ELEMENT_IMAGES[hero.element] || '/images/elements/ElementFire.png'}
                                                        alt={ELEMENT_NAMES[hero.element] || hero.element}
                                                        width={20}
                                                        height={20}
                                                        className="w-5 h-5"
                                                    />
                                                </div>
                                                <div className="w-7 h-7 rounded-lg glass-panel flex items-center justify-center">
                                                    <Image
                                                        src={CLASS_IMAGES[hero.class] || '/images/classes/ClassWarrior.png'}
                                                        alt={CLASS_NAMES[hero.class] || hero.class}
                                                        width={20}
                                                        height={20}
                                                        className="w-5 h-5"
                                                    />
                                                </div>
                                            </div>

                                            {/* Rarity stars badge */}
                                            <div className="absolute top-2 right-2 px-2 py-1 rounded-lg glass-panel">
                                                <span className={`text-xs font-bold ${hero.rarity === 5 ? 'text-e7-gold' :
                                                    hero.rarity === 4 ? 'text-purple-400' :
                                                        'text-blue-400'
                                                    }`}>
                                                    {'★'.repeat(hero.rarity)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Hero Name Footer */}
                                        <div className="p-3 bg-gradient-to-t from-e7-dark/80 to-transparent -mt-8 relative z-10 pt-10">
                                            <h3 className="text-slate-100 text-sm font-semibold truncate group-hover:text-e7-gold transition-colors duration-300 text-center">
                                                {translateHeroName(hero.name)}
                                            </h3>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
