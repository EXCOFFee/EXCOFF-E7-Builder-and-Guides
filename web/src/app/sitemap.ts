//  Dynamic sitemap for EXCOFF E7 Hub
// Next.js automatically generates sitemap from this file

import { MetadataRoute } from 'next'

const BASE_URL = 'https://excoff-e7-orbis-helper.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: BASE_URL,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${BASE_URL}/heroes`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/builds`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/guides`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/guilds`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/login`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.3,
        },
    ]

    // Try to fetch dynamic hero pages
    let heroPages: MetadataRoute.Sitemap = []
    try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
        const response = await fetch(`${API_URL}/heroes`, {
            next: { revalidate: 3600 } // Cache for 1 hour
        })
        if (response.ok) {
            const data = await response.json()
            const heroes = data.data || data || []
            heroPages = heroes.map((hero: { slug: string }) => ({
                url: `${BASE_URL}/heroes/${hero.slug}`,
                lastModified: new Date(),
                changeFrequency: 'weekly' as const,
                priority: 0.7,
            }))
        }
    } catch (error) {
        console.error('Failed to fetch heroes for sitemap:', error)
    }

    return [...staticPages, ...heroPages]
}
