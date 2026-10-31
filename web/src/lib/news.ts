// Noticias: las de YouTube y Stove se muestran tal cual; las que publica la web (cambios de
// balance que detecta data:sync) traen datos y el texto se arma en el idioma de la página.

type T = (key: string, fallback: string) => string;

export interface NewsLike {
    title: string;
    description?: string | null;
    source?: string;
    category?: string | null;
}

interface BalancePayload {
    heroes: { name: string; slug: string }[];
    affected_builds: number;
}

function balancePayload(item: NewsLike): BalancePayload | null {
    if (item.source !== 'site' || item.category !== 'balance' || !item.description) return null;
    try {
        const data = JSON.parse(item.description) as BalancePayload;
        return Array.isArray(data.heroes) ? data : null;
    } catch {
        return null;
    }
}

/** Título y descripción para mostrar */
export function newsText(item: NewsLike, t: T): { title: string; description: string | null } {
    const balance = balancePayload(item);
    if (!balance) return { title: item.title, description: item.description ?? null };

    const names = balance.heroes.map((hero) => hero.name).join(', ');
    return {
        title: t('news.balanceTitle', 'Balance changes: {heroes}').replace('{heroes}', names),
        description: balance.affected_builds > 0
            ? t('news.balanceAffected', '{count} builds were made before this change and may need updating.').replace('{count}', String(balance.affected_builds))
            : t('news.balanceNoBuilds', 'Detected by the site in the game data.'),
    };
}

/** Las noticias de la web abren en la misma pestaña; las de afuera, en otra */
export function isSiteNews(item: NewsLike): boolean {
    return item.source === 'site';
}
