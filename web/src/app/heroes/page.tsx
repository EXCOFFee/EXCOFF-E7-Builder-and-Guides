'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { heroApi } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useTranslations } from '@/hooks/useTranslations';
import { useHeroTranslations } from '@/hooks/useNameTranslations';
import { HeroBanner } from '@/components/heroes/HeroBanner';
import { ELEMENT_IMAGES, CLASS_IMAGES } from '@/lib/heroAssets';

interface Hero {
    id: number;
    code: string;
    name: string;
    slug: string;
    element: string;
    class: string;
    rarity: number;
    image_url: string;
    /** Builds publicadas en la web */
    builds_count?: number;
}

// Los retratos ya no se recortan (HeroBanner muestra el banner entero): no hacen falta
// las posiciones a mano que había por héroe

export default function HeroesPage() {
    const { t } = useTranslations();
    const { translateHeroName } = useHeroTranslations();
    // Filtros iniciales desde la URL (los usan los accesos por elemento y el buscador de la home)
    const searchParams = useSearchParams();
    const [search, setSearch] = useState(() => searchParams.get('search') ?? '');
    const [elementFilter, setElementFilter] = useState(() => searchParams.get('element') ?? '');
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
                    <h1 className="font-hero font-normal text-4xl md:text-5xl text-slate-50 tracking-normal mb-2">{t('heroes.title', 'Hero Database')}</h1>
                    <p className="text-slate-400 max-w-xl mx-auto">{t('heroes.description', 'Explore all Epic Seven heroes, their stats and builds')}</p>
                </div>

                {/* Filters */}
                <div className="mb-8 space-y-4 bg-e7-panel p-4 rounded-lg border border-white/6">
                    <Input
                        placeholder={t('heroes.searchPlaceholder', 'Search heroes...')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="max-w-md bg-white/4 border-white/8 text-neutral-200 placeholder:text-neutral-400 focus:border-e7-gold"
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
                                title={t(`elements.${el}`, el)}
                            >
                                <Image
                                    src={img}
                                    alt={t(`elements.${el}`, el)}
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
                                title={t(`classes.${cls}`, cls)}
                            >
                                <Image
                                    src={img}
                                    alt={t(`classes.${cls}`, cls)}
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
                    <div className="flex flex-col items-center justify-center py-20 px-4">
                        <div className="text-center max-w-md">
                            <div className="text-6xl mb-4">😔</div>
                            <h2 className="text-xl font-bold text-red-400 mb-2">
                                {t('common.connectionError', 'No connection')}
                            </h2>
                            <p className="text-gray-400 mb-6">
                                {t('common.networkErrorMsg', 'Could not connect. Check your internet connection.')}
                            </p>
                            <button
                                onClick={() => window.location.reload()}
                                className="btn-gold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
                            >
                                {t('common.retry', 'Retry')}
                            </button>
                        </div>
                    </div>
                )}

                {/* Heroes Grid */}
                {!isLoading && !error && (
                    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                        {heroes.length === 0 ? (
                            <li className="col-span-full py-10 text-center text-slate-400">
                                {t('heroes.noResults', 'No heroes found.')}
                            </li>
                        ) : (
                            heroes.map((hero, index) => (
                                <li key={hero.id} className="min-w-0">
                                    <Link
                                        href={`/heroes/${hero.slug}`}
                                        data-element={hero.element}
                                        className="hero-sheet group flex h-full flex-col overflow-hidden rounded-xl border border-night-line bg-night-panel transition-colors hover:border-el/60"
                                    >
                                        <HeroBanner
                                            src={hero.image_url}
                                            alt=""
                                            element={hero.element}
                                            heroClass={hero.class}
                                            // La primera fila es el LCP de la página
                                            priority={index < 4}
                                            className="mx-auto"
                                        />
                                        <div className="flex flex-1 items-center gap-2 border-t border-night-line/60 p-3">
                                            <div className="min-w-0 flex-1">
                                                <h2 className="truncate text-sm font-semibold text-slate-100 group-hover:text-el-ink">
                                                    {translateHeroName(hero.name)}
                                                </h2>
                                                <p className="mt-1 flex items-center gap-1.5 text-xs">
                                                    <span
                                                        className={hero.rarity === 5 ? 'text-e7-gold' : hero.rarity === 4 ? 'text-purple-300' : 'text-blue-300'}
                                                        aria-label={`${hero.rarity}★`}
                                                    >
                                                        {'★'.repeat(hero.rarity)}
                                                    </span>
                                                    {ELEMENT_IMAGES[hero.element] && (
                                                        <Image src={ELEMENT_IMAGES[hero.element]} alt={t(`elements.${hero.element}`, hero.element)} width={16} height={16} className="h-4 w-4" />
                                                    )}
                                                    {CLASS_IMAGES[hero.class] && (
                                                        <Image src={CLASS_IMAGES[hero.class]} alt={t(`classes.${hero.class}`, hero.class)} width={16} height={16} className="h-4 w-4" />
                                                    )}
                                                </p>
                                            </div>
                                            {(hero.builds_count ?? 0) > 0 && (
                                                <span className="shrink-0 rounded-full bg-night/70 px-2 py-0.5 font-mono text-[11px] tabular-nums text-slate-200">
                                                    {hero.builds_count === 1
                                                        ? t('heroes.buildsShortOne', '1 build')
                                                        : t('heroes.buildsShort', '{count} builds').replace('{count}', String(hero.builds_count))}
                                                </span>
                                            )}
                                        </div>
                                    </Link>
                                </li>
                            ))
                        )}
                    </ul>
                )}
            </div>
        </div>
    );
}
