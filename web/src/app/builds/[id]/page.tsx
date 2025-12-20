import type { Metadata, ResolvingMetadata } from 'next';
import { BuildDetailClient } from './BuildDetailClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata(
    { params }: PageProps,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    try {
        const response = await fetch(`${API_URL}/builds/${id}`, {
            next: { revalidate: 3600 },
        });

        if (!response.ok) {
            return {
                title: 'Build not found',
                description: 'The requested build could not be found.',
            };
        }

        const build = await response.json();
        const heroName = build.hero?.name || 'Hero';
        const artifactName = build.artifact?.name || '';
        const sets = [build.primary_set, build.secondary_set].filter(Boolean).join(' + ');

        const title = `${heroName} Build - ${build.title || 'Community Build'}`;
        const description = build.description
            ? `${build.description.slice(0, 150)}${build.description.length > 150 ? '...' : ''}`
            : `${heroName} build with ${sets}${artifactName ? ` and ${artifactName}` : ''}. Community build for Epic Seven.`;

        return {
            title,
            description,
            openGraph: {
                title: `${heroName} Build | E7 EXCOFF`,
                description,
                type: 'article',
                images: build.hero?.portrait ? [build.hero.portrait] : [],
            },
            twitter: {
                card: 'summary_large_image',
                title: `${heroName} Build | E7 EXCOFF`,
                description,
                images: build.hero?.portrait ? [build.hero.portrait] : [],
            },
        };
    } catch {
        return {
            title: 'Build | E7 EXCOFF',
            description: 'View community builds for Epic Seven heroes.',
        };
    }
}

export default function BuildDetailPage() {
    return <BuildDetailClient />;
}
