// JSON-LD Structured Data for SEO
// Helps Google understand the website content

export interface StructuredDataProps {
    type?: 'website' | 'organization' | 'game' | 'article';
    title?: string;
    description?: string;
    url?: string;
    image?: string;
    datePublished?: string;
    dateModified?: string;
    author?: string;
}

const BASE_URL = 'https://excoff-e7-orbis-helper.vercel.app';

export function generateWebsiteSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'EXCOFF E7 Hub',
        alternateName: ['Epic Seven Hub', 'E7 Hub', 'excoffe7'],
        url: BASE_URL,
        description: 'Your ultimate Epic Seven (E7) resource hub. Hero builds, guides, tier lists & equipment recommendations.',
        inLanguage: ['en', 'es', 'ko', 'ja', 'zh', 'pt'],
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${BASE_URL}/heroes?search={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
        },
    };
}

export function generateOrganizationSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'EXCOFF E7 Hub',
        url: BASE_URL,
        logo: `${BASE_URL}/images/icon_menu_orbis.png`,
        sameAs: [
            // Add social media links when available
        ],
        contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer support',
            availableLanguage: ['English', 'Spanish', 'Korean', 'Japanese', 'Chinese', 'Portuguese'],
        },
    };
}

export function generateGameSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'VideoGame',
        name: 'Epic Seven',
        alternateName: ['E7', 'Epic7', 'エピックセブン', '에픽세븐'],
        genre: ['RPG', 'Gacha', 'Turn-based'],
        gamePlatform: ['iOS', 'Android'],
        publisher: {
            '@type': 'Organization',
            name: 'Smilegate',
        },
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.5',
            ratingCount: '1000000',
            bestRating: '5',
            worstRating: '1',
        },
    };
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };
}

export function generateHeroGuideSchema(hero: {
    name: string;
    slug: string;
    element: string;
    class: string;
    description?: string;
}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: `${hero.name} Build Guide - Epic Seven`,
        description: hero.description || `Complete ${hero.name} build guide for Epic Seven. Best sets, artifacts, and stats.`,
        image: `${BASE_URL}/images/heroes/${hero.slug}.png`,
        author: {
            '@type': 'Organization',
            name: 'EXCOFF E7 Hub',
        },
        publisher: {
            '@type': 'Organization',
            name: 'EXCOFF E7 Hub',
            logo: {
                '@type': 'ImageObject',
                url: `${BASE_URL}/images/icon_menu_orbis.png`,
            },
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${BASE_URL}/heroes/${hero.slug}`,
        },
        keywords: [
            hero.name,
            'Epic Seven',
            'E7',
            'build',
            'guide',
            hero.element,
            hero.class,
        ],
    };
}

// Component to inject JSON-LD into page head
export function JsonLd({ data }: { data: object }) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}
