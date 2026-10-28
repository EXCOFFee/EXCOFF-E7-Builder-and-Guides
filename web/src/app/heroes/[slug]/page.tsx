import type { Metadata, ResolvingMetadata } from 'next';
import { HeroDetailClient } from './HeroDetailClient';
import { getHeroSkillMessages, getLocale } from '@/i18n/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata(
    { params }: PageProps,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const resolvedParams = await params;
    const slug = resolvedParams.slug;

    try {
        const response = await fetch(`${API_URL}/heroes/${slug}`, {
            next: { revalidate: 3600 },
        });

        if (!response.ok) {
            return {
                title: 'Hero not found',
                description: 'The requested hero could not be found.',
            };
        }

        const data = await response.json();
        const hero = data.data || data;
        const stars = '★'.repeat(hero.rarity || 5);

        const title = `${hero.name} - ${hero.element} ${hero.class}`.replace('_', ' ');
        const description = `${hero.name} is a ${stars} ${hero.element} ${hero.class?.replace('_', ' ')} in Epic Seven. View builds, stats, skills, and community guides.`;

        return {
            title,
            description,
            alternates: {
                canonical: './',
            },
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
    } catch {
        return {
            title: 'Hero | EXCOFF E7 HUB',
            description: 'View Epic Seven hero details, builds, and stats.',
        };
    }
}

export default async function HeroDetailPage({ params }: PageProps) {
    const { slug } = await params;
    const locale = await getLocale();

    // Misma petición que generateMetadata: Next la deduplica y la cachea 1 h
    let skillMessages = null;
    try {
        const response = await fetch(`${API_URL}/heroes/${slug}`, { next: { revalidate: 3600 } });
        if (response.ok) {
            const data = await response.json();
            const hero = data.data || data;
            if (hero?.name) skillMessages = await getHeroSkillMessages(locale, hero.name);
        }
    } catch {
        // Sin traducción: el cliente muestra el texto de la API
    }

    return <HeroDetailClient skillMessages={skillMessages} />;
}
