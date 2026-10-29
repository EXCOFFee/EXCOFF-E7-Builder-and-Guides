'use client';

import { useId, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslations } from '@/hooks/useTranslations';
import { useHeroTranslations } from '@/hooks/useNameTranslations';
import { appendImageVersion } from '@/lib/heroImages';

export interface HeroListItem {
    id: number;
    name: string;
    slug: string;
    element: string;
    rarity: number;
    image_url: string | null;
}

const ELEMENT_IMAGES: Record<string, string> = {
    fire: '/images/elements/ElementFire.png',
    ice: '/images/elements/ElementWater.png',
    earth: '/images/elements/ElementEarth.png',
    light: '/images/elements/ElementLight.png',
    dark: '/images/elements/ElementDark.png',
};

const MAX_RESULTS = 6;

/**
 * Buscador de la home: filtra en el navegador la lista de héroes que manda el servidor
 * (busca por nombre en inglés y por el nombre traducido) y lleva directo a la ficha.
 */
export function HeroFinder({ heroes }: { heroes: HeroListItem[] }) {
    const { t } = useTranslations();
    const { translateHeroName } = useHeroTranslations();
    const router = useRouter();
    const listId = useId();
    const [query, setQuery] = useState('');
    const [active, setActive] = useState(0);

    const results = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return [];
        return heroes
            .filter((hero) => hero.name.toLowerCase().includes(q) || translateHeroName(hero.name).toLowerCase().includes(q))
            .sort((a, b) => Number(!a.name.toLowerCase().startsWith(q)) - Number(!b.name.toLowerCase().startsWith(q)))
            .slice(0, MAX_RESULTS);
    }, [heroes, query, translateHeroName]);

    const open = results.length > 0;

    return (
        <form
            role="search"
            className="relative w-full max-w-xl"
            onSubmit={(e) => {
                e.preventDefault();
                const hero = results[active] ?? results[0];
                router.push(hero ? `/heroes/${hero.slug}` : `/heroes?search=${encodeURIComponent(query.trim())}`);
            }}
        >
            <label htmlFor={`${listId}-input`} className="sr-only">
                {t('home.searchLabel', 'Search a hero')}
            </label>
            <input
                id={`${listId}-input`}
                type="search"
                autoComplete="off"
                role="combobox"
                aria-expanded={open}
                aria-controls={`${listId}-list`}
                aria-activedescendant={open ? `${listId}-${active}` : undefined}
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setActive(0);
                }}
                onKeyDown={(e) => {
                    if (!open) return;
                    if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        setActive((i) => (i + 1) % results.length);
                    } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        setActive((i) => (i - 1 + results.length) % results.length);
                    } else if (e.key === 'Escape') {
                        setQuery('');
                    }
                }}
                placeholder={t('heroes.searchPlaceholder', 'Search heroes...')}
                className="h-14 w-full rounded-xl border border-night-line bg-night-panel px-5 text-lg text-slate-50 placeholder:text-night-muted focus:border-e7-gold"
            />
            {open && (
                <ul
                    id={`${listId}-list`}
                    role="listbox"
                    className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-night-line bg-night-panel shadow-2xl shadow-black/40"
                >
                    {results.map((hero, i) => (
                        <li key={hero.id} id={`${listId}-${i}`} role="option" aria-selected={i === active}>
                            <Link
                                href={`/heroes/${hero.slug}`}
                                onMouseEnter={() => setActive(i)}
                                className={`flex items-center gap-3 px-4 py-2.5 ${i === active ? 'bg-night-line/70' : ''}`}
                            >
                                {hero.image_url ? (
                                    <Image
                                        src={appendImageVersion(hero.image_url)}
                                        alt=""
                                        width={36}
                                        height={36}
                                        className="h-9 w-9 rounded-md object-cover"
                                    />
                                ) : (
                                    <span className="h-9 w-9 rounded-md bg-night-line" aria-hidden />
                                )}
                                <span className="flex-1 truncate text-slate-100">{translateHeroName(hero.name)}</span>
                                <span className="font-mono text-xs text-e7-gold" aria-label={`${hero.rarity}★`}>
                                    {hero.rarity}★
                                </span>
                                {ELEMENT_IMAGES[hero.element] && (
                                    <Image src={ELEMENT_IMAGES[hero.element]} alt={hero.element} width={18} height={18} className="h-[18px] w-[18px]" />
                                )}
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
            {query.trim() && !open && (
                <p className="absolute inset-x-0 top-full mt-2 text-sm text-night-muted" role="status">
                    {t('heroes.noResults', 'No heroes found.')}
                </p>
            )}
        </form>
    );
}

/** Héroes más nuevos: retrato con el borde inferior del color de su elemento */
export function NewestHeroes({ heroes }: { heroes: HeroListItem[] }) {
    const { translateHeroName } = useHeroTranslations();

    return (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {heroes.map((hero) => (
                <li key={hero.id}>
                    <Link
                        href={`/heroes/${hero.slug}`}
                        data-element={hero.element}
                        className="hero-sheet group block overflow-hidden rounded-xl border border-night-line bg-night-panel transition-colors hover:border-el/70"
                    >
                        <div className="aspect-square overflow-hidden border-b-2 border-el">
                            {hero.image_url && (
                                <Image
                                    src={appendImageVersion(hero.image_url)}
                                    alt=""
                                    width={160}
                                    height={160}
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none"
                                />
                            )}
                        </div>
                        <p className="truncate px-2 py-2 text-center text-sm text-slate-100">{translateHeroName(hero.name)}</p>
                    </Link>
                </li>
            ))}
        </ul>
    );
}
