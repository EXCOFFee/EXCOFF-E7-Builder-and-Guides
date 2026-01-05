//  Dynamic sitemap for EXCOFF E7 Hub
// Next.js automatically generates sitemap from this file

import { MetadataRoute } from 'next'

const BASE_URL = 'https://excoffe7.com'
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

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
            url: `${BASE_URL}/artifacts`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
    ]

    // Fetch all dynamic pages
    let dynamicPages: MetadataRoute.Sitemap = []

    try {
        // 1. Hero pages
        const heroesResponse = await fetch(`${API_URL}/heroes`, {
            next: { revalidate: 3600 }
        })
        if (heroesResponse.ok) {
            const heroesData = await heroesResponse.json()
            const heroes = heroesData.data || heroesData || []
            const heroPages = heroes.map((hero: { slug: string; updated_at?: string }) => ({
                url: `${BASE_URL}/heroes/${hero.slug}`,
                lastModified: hero.updated_at ? new Date(hero.updated_at) : new Date(),
                changeFrequency: 'weekly' as const,
                priority: 0.7,
            }))
            dynamicPages = [...dynamicPages, ...heroPages]
        }

        // 2. Build pages
        const buildsResponse = await fetch(`${API_URL}/builds`, {
            next: { revalidate: 3600 }
        })
        if (buildsResponse.ok) {
            const buildsData = await buildsResponse.json()
            const builds = buildsData.data || buildsData || []
            const buildPages = builds.map((build: { id: number; updated_at?: string }) => ({
                url: `${BASE_URL}/builds/${build.id}`,
                lastModified: build.updated_at ? new Date(build.updated_at) : new Date(),
                changeFrequency: 'weekly' as const,
                priority: 0.7,
            }))
            dynamicPages = [...dynamicPages, ...buildPages]
        }

        // 3. Guide pages
        const guidesResponse = await fetch(`${API_URL}/guides`, {
            next: { revalidate: 3600 }
        })
        if (guidesResponse.ok) {
            const guidesData = await guidesResponse.json()
            const guides = guidesData.data || guidesData || []
            const guidePages = guides.map((guide: { slug: string; updated_at?: string }) => ({
                url: `${BASE_URL}/guides/${guide.slug}`,
                lastModified: guide.updated_at ? new Date(guide.updated_at) : new Date(),
                changeFrequency: 'weekly' as const,
                priority: 0.8,
            }))
            dynamicPages = [...dynamicPages, ...guidePages]
        }

        // 4. Guild pages
        const guildsResponse = await fetch(`${API_URL}/guilds`, {
            next: { revalidate: 3600 }
        })
        if (guildsResponse.ok) {
            const guildsData = await guildsResponse.json()
            const guilds = guildsData.data || guildsData || []
            const guildPages = guilds.map((guild: { slug: string; updated_at?: string }) => ({
                url: `${BASE_URL}/guilds/${guild.slug}`,
                lastModified: guild.updated_at ? new Date(guild.updated_at) : new Date(),
                changeFrequency: 'daily' as const,
                priority: 0.7,
            }))
            dynamicPages = [...dynamicPages, ...guildPages]
        }
    } catch (error) {
        console.error('Failed to fetch dynamic pages for sitemap:', error)
    }

    return [...staticPages, ...dynamicPages]
}
