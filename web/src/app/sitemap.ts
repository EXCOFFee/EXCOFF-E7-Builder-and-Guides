import { MetadataRoute } from 'next'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface Hero {
    slug: string;
}

interface Build {
    id: number;
    updated_at?: string;
}

interface Guide {
    slug: string;
    updated_at?: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://excoff-e7-orbis-helper.vercel.app';

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/heroes`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/builds`,
            lastModified: new Date(),
            changeFrequency: 'hourly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/guides`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/guilds`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/credits`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.3,
        },
    ];

    // Dynamic hero pages
    let heroPages: MetadataRoute.Sitemap = [];
    try {
        const response = await fetch(`${API_URL}/heroes`, {
            next: { revalidate: 3600 }, // Cache for 1 hour
        });

        if (response.ok) {
            const data = await response.json();
            const heroes: Hero[] = data.data || [];

            heroPages = heroes.map((hero) => ({
                url: `${baseUrl}/heroes/${hero.slug}`,
                lastModified: new Date(),
                changeFrequency: 'weekly' as const,
                priority: 0.7,
            }));
        }
    } catch (error) {
        console.error('Error fetching heroes for sitemap:', error);
    }

    // Dynamic build pages
    let buildPages: MetadataRoute.Sitemap = [];
    try {
        const response = await fetch(`${API_URL}/builds`, {
            next: { revalidate: 1800 }, // Cache for 30 minutes
        });

        if (response.ok) {
            const data = await response.json();
            const builds: Build[] = data.data || [];

            buildPages = builds.map((build) => ({
                url: `${baseUrl}/builds/${build.id}`,
                lastModified: build.updated_at ? new Date(build.updated_at) : new Date(),
                changeFrequency: 'weekly' as const,
                priority: 0.6,
            }));
        }
    } catch (error) {
        console.error('Error fetching builds for sitemap:', error);
    }

    // Dynamic guide pages
    let guidePages: MetadataRoute.Sitemap = [];
    try {
        const response = await fetch(`${API_URL}/guides`, {
            next: { revalidate: 1800 }, // Cache for 30 minutes
        });

        if (response.ok) {
            const data = await response.json();
            const guides: Guide[] = data.data || [];

            guidePages = guides.map((guide) => ({
                url: `${baseUrl}/guides/${guide.slug}`,
                lastModified: guide.updated_at ? new Date(guide.updated_at) : new Date(),
                changeFrequency: 'weekly' as const,
                priority: 0.6,
            }));
        }
    } catch (error) {
        console.error('Error fetching guides for sitemap:', error);
    }

    return [...staticPages, ...heroPages, ...buildPages, ...guidePages];
}
