import type { Metadata, ResolvingMetadata } from 'next';
import { GuideDetailClient } from './GuideDetailClient';

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
        const response = await fetch(`${API_URL}/guides/${slug}`, {
            next: { revalidate: 3600 },
        });

        if (!response.ok) {
            return {
                title: 'Guide not found',
                description: 'The requested guide could not be found.',
            };
        }

        const data = await response.json();
        const guide = data.data || data;
        const heroName = guide.hero?.name || '';
        const category = guide.category || 'General';

        const title = heroName
            ? `${guide.title} - ${heroName} Guide`
            : guide.title || 'Epic Seven Guide';
        const description = guide.description
            ? `${guide.description.slice(0, 150)}${guide.description.length > 150 ? '...' : ''}`
            : `${category} guide for Epic Seven${heroName ? ` featuring ${heroName}` : ''}.`;

        return {
            title,
            description,
            openGraph: {
                title: `${title} | E7 Orbis Helper`,
                description,
                type: 'article',
                images: guide.hero?.portrait ? [guide.hero.portrait] : [],
            },
            twitter: {
                card: 'summary_large_image',
                title: `${title} | E7 Orbis Helper`,
                description,
                images: guide.hero?.portrait ? [guide.hero.portrait] : [],
            },
        };
    } catch {
        return {
            title: 'Guide | E7 Orbis Helper',
            description: 'View community guides for Epic Seven.',
        };
    }
}

export default function GuideDetailPage() {
    return <GuideDetailClient />;
}
