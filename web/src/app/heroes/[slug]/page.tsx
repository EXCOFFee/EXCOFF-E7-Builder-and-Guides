import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { HeroDetailClient, type Hero } from './HeroDetailClient';
import { STAT_KEYS, type ClassStatRange, type StatKey } from '@/components/heroes/StatLedger';
import { getHeroSkillMessages, getLocale } from '@/i18n/server';
import type { Locale } from '@/i18n/config';
import type { HeroBuildStats } from '@/components/heroes/PopularBuildStats';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface PageProps {
    params: Promise<{ slug: string }>;
}

/**
 * Mismo pedido para la metadata y la página (cache() lo hace una sola vez por request,
 * y fetch lo guarda 1 h). Con el héroe en el HTML inicial no hay salto de "Cargando..." (CLS).
 */
const fetchHero = cache(async (slug: string, locale: Locale): Promise<{ hero: Hero | null; missing: boolean }> => {
    try {
        const response = await fetch(`${API_URL}/heroes/${encodeURIComponent(slug)}?lang=${locale}`, {
            next: { revalidate: 3600 },
        });
        if (response.status === 404) return { hero: null, missing: true };
        if (!response.ok) return { hero: null, missing: false };
        const data = await response.json();
        return { hero: (data.data || data) as Hero, missing: false };
    } catch {
        // API caída: el cliente reintenta, no es un 404
        return { hero: null, missing: false };
    }
});

/** Estadísticas de builds publicadas en la web: cambian más seguido, 5 min como en el cliente. */
async function fetchBuildStats(slug: string, locale: Locale): Promise<HeroBuildStats | null> {
    try {
        const response = await fetch(`${API_URL}/heroes/${encodeURIComponent(slug)}/stats?lang=${locale}`, {
            next: { revalidate: 300 },
        });
        return response.ok ? ((await response.json()).data as HeroBuildStats) : null;
    } catch {
        return null;
    }
}

/**
 * Mínimo, mediana y máximo de cada stat base entre los héroes de la misma clase (y rareza),
 * para dibujar dónde cae el héroe dentro de su clase. Cambia solo con héroes nuevos: 1 día.
 */
async function fetchClassRange(heroClass: string, rarity: number): Promise<ClassStatRange | null> {
    try {
        const response = await fetch(`${API_URL}/heroes?class=${encodeURIComponent(heroClass)}&rarity=${rarity}`, {
            next: { revalidate: 86400 },
        });
        if (!response.ok) return null;
        const heroes: { base_stats?: Partial<Record<StatKey, number>> }[] = (await response.json()).data || [];
        const range = {} as ClassStatRange;
        for (const key of STAT_KEYS) {
            const values = heroes
                .map((h) => Number(h.base_stats?.[key]))
                .filter((v) => Number.isFinite(v) && v > 0)
                .sort((a, b) => a - b);
            if (values.length < 3) continue;
            const mid = Math.floor(values.length / 2);
            const median = values.length % 2 ? values[mid] : (values[mid - 1] + values[mid]) / 2;
            range[key] = { min: values[0], median, max: values[values.length - 1], count: values.length };
        }
        return Object.keys(range).length ? range : null;
    } catch {
        return null;
    }
}

const capitalize =(value: string) =>
    value.replace('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const { hero } = await fetchHero(slug, await getLocale());

    if (!hero) {
        return {
            title: 'Hero not found',
            description: 'The requested hero could not be found.',
            robots: { index: false },
        };
    }

    const role = `${hero.rarity}★ ${capitalize(hero.element)} ${capitalize(hero.class)}`;
    const title = `${hero.name} Build, Skills & Stats`;
    const description =
        `${hero.name} (${role}) in Epic Seven: base stats, skill details, ` +
        `most used sets and artifacts, and community builds.`;

    return {
        title,
        description,
        alternates: { canonical: './' },
        openGraph: {
            title: `${hero.name} | EXCOFF E7 HUB`,
            description,
            type: 'profile',
            images: hero.image_url ? [hero.image_url] : [],
            url: `https://excoffe7.com/heroes/${slug}/`,
        },
        twitter: {
            card: 'summary_large_image',
            title: `${hero.name} | EXCOFF E7 HUB`,
            description,
            images: hero.image_url ? [hero.image_url] : [],
        },
    };
}

export default async function HeroDetailPage({ params }: PageProps) {
    const { slug } = await params;
    const locale = await getLocale();
    const [{ hero, missing }, stats] = await Promise.all([fetchHero(slug, locale), fetchBuildStats(slug, locale)]);
    if (missing) notFound();
    const [skillMessages, classRange] = await Promise.all([
        hero?.name ? getHeroSkillMessages(locale, hero.name) : null,
        hero ? fetchClassRange(hero.class, hero.rarity) : null,
    ]);

    return (
        <HeroDetailClient
            initialHero={hero}
            initialStats={stats}
            skillMessages={skillMessages}
            classRange={classRange}
        />
    );
}
