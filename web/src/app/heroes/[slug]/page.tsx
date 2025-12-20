import type { Metadata, ResolvingMetadata } from 'next';
import { HeroDetailClient } from './HeroDetailClient';

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
            openGraph: {
                title: `${hero.name} | E7 EXCOFF`,
                description,
                type: 'profile',
                images: hero.image_url ? [hero.image_url] : [],
            },
            twitter: {
                card: 'summary_large_image',
                title: `${hero.name} | E7 EXCOFF`,
                description,
                images: hero.image_url ? [hero.image_url] : [],
            },
        };
    } catch {
        return {
            title: 'Hero | E7 EXCOFF',
            description: 'View Epic Seven hero details, builds, and stats.',
        };
    }
}

export default function HeroDetailPage() {
    return <HeroDetailClient />;
}
