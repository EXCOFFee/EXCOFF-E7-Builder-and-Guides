/**
 * Equipos de una guía. Formato actual: modo + cada héroe atado a una build publicada de ese
 * héroe. Los equipos viejos (sin `mode`) traían sets/artefacto/stats sueltos: se siguen
 * mostrando, pero los nuevos siempre van con build.
 */

/** Modos y cuántos héroes entran en cada uno (igual que GuideTeams::SIZES en la API) */
export const TEAM_MODES = {
    arena: 4,
    gw_attack: 3,
    gw_defense: 3,
    rta: 5,
    pve: 4,
} as const;

export type TeamMode = keyof typeof TEAM_MODES;

export const MAX_TEAMS = 6;

export interface TeamHero {
    hero_id: number;
    build_id?: number;
    note?: string;
    // Solo equipos viejos
    sets?: string[];
    artifact_id?: number;
    stats?: string;
}

export interface Team {
    name: string;
    mode?: TeamMode;
    note?: string;
    heroes: TeamHero[];
}

/** Resumen de una build de un equipo, como lo devuelve GET /guides/{slug} en `team_builds` */
export interface TeamBuild {
    id: number;
    title: string;
    hero_id: number;
    primary_set: string | null;
    secondary_set: string | null;
    min_stats: Record<string, number | string> | null;
    likes: number;
    user: { id: number; name: string } | null;
    hero: TeamHeroInfo;
    artifact: { id: number; name: string; code: string; image_url?: string | null } | null;
}

export interface TeamHeroInfo {
    id: number;
    name: string;
    slug: string;
    element: string;
    class?: string;
    image_url?: string | null;
}

export const isLegacyTeam = (team: Team) => !team.mode;

/** Qué le falta a los equipos antes de guardar la guía (null si están bien) */
export function teamsProblem(teams: Team[]): 'empty' | 'build' | null {
    for (const team of teams) {
        if (isLegacyTeam(team)) continue;
        if (team.heroes.length === 0) return 'empty';
        if (team.heroes.some((hero) => !hero.build_id)) return 'build';
    }
    return null;
}
