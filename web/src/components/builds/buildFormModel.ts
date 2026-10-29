// Modelo del formulario de builds, compartido por crear y editar (BuildForm).
import { TIER_CATEGORIES, type TierCategory } from '@/components/ui/tier-rating-selector';
import type { TagWithNote } from '@/components/ui/pro-cons-selector';
import type { HeroWithNote } from '@/components/builds/HeroSelectorWithNotes';

export const MAX_BUILD_IMAGES = 5;

/** Claves de min_stats tal como las guarda la API (y filtra GET /api/builds) */
export const STAT_FIELDS = [
    { key: 'atk', label: 'ATK' },
    { key: 'def', label: 'DEF' },
    { key: 'hp', label: 'HP' },
    { key: 'spd', label: 'SPD' },
    { key: 'crit_chance', label: 'Crit %' },
    { key: 'crit_dmg', label: 'C.Dmg %' },
    { key: 'eff', label: 'EFF %' },
    { key: 'res', label: 'RES %' },
] as const;

export type StatKey = (typeof STAT_FIELDS)[number]['key'];
export type StatValues = Record<StatKey, string>;

// El formulario de edición viejo guardaba estas claves; se traducen al leer una build
const LEGACY_STAT_KEYS: Record<string, StatKey> = { chc: 'crit_chance', chd: 'crit_dmg', efr: 'res' };

export interface BuildFormValues {
    heroId: number | null;
    artifactId: number | null;
    title: string;
    description: string;
    primarySet: string;
    secondarySet: string;
    stats: StatValues;
    skillLevels: [number, number, number];
    /** URLs de imágenes ya subidas (solo al editar) */
    existingImages: string[];
    newImages: File[];
    synergyHeroes: HeroWithNote[];
    counterHeroes: HeroWithNote[];
    isAnonymous: boolean;
    language: string;
    tierRatings: Partial<Record<TierCategory, number | null>>;
    tierReasons: Partial<Record<TierCategory, string>>;
    proTags: TagWithNote[];
    conTags: TagWithNote[];
}

/** Build tal como la devuelve GET /api/builds/{id} (solo lo que usa el formulario) */
export interface ApiBuild {
    id: number;
    hero_id: number;
    title: string;
    description?: string | null;
    min_stats?: Record<string, number | string | null> | null;
    primary_set?: string | null;
    secondary_set?: string | null;
    artifact_id?: number | null;
    synergy_heroes?: (number | HeroWithNote)[] | null;
    counter_heroes?: (number | HeroWithNote)[] | null;
    skill_1?: number | null;
    skill_2?: number | null;
    skill_3?: number | null;
    images?: string[] | null;
    is_anonymous?: boolean | null;
    language?: string | null;
    pro_tags?: (string | TagWithNote)[] | null;
    con_tags?: (string | TagWithNote)[] | null;
    hero?: {
        id: number;
        name: string;
        slug: string;
        hero_code?: string | null;
        skills?: Record<string, { name?: string }> | null;
    } | null;
    [key: `rating_${string}` | `reason_${string}`]: unknown;
}

export const emptyStats = (): StatValues =>
    Object.fromEntries(STAT_FIELDS.map((f) => [f.key, ''])) as StatValues;

export function emptyBuildForm(heroId: number | null = null): BuildFormValues {
    return {
        heroId,
        artifactId: null,
        title: '',
        description: '',
        primarySet: '',
        secondarySet: '',
        stats: emptyStats(),
        skillLevels: [0, 0, 0],
        existingImages: [],
        newImages: [],
        synergyHeroes: [],
        counterHeroes: [],
        isAnonymous: false,
        language: 'en',
        tierRatings: {},
        tierReasons: {},
        proTags: [],
        conTags: [],
    };
}

/** Placeholder de cada stat mínimo: el stat base del héroe (vacío si no se conoce) */
export function baseStatPlaceholders(base: Partial<Record<StatKey, number | null>> | null | undefined): StatValues {
    const placeholders = emptyStats();
    for (const { key } of STAT_FIELDS) {
        const value = base?.[key];
        if (value !== undefined && value !== null) placeholders[key] = String(value);
    }
    return placeholders;
}

function toHeroesWithNote(list: ApiBuild['synergy_heroes']): HeroWithNote[] {
    return (list ?? []).map((item) => (typeof item === 'number' ? { id: item } : item));
}

function toTags(list: ApiBuild['pro_tags']): TagWithNote[] {
    return (list ?? []).map((item) => (typeof item === 'string' ? { id: item } : item));
}

/** Valores del formulario a partir de una build existente (normaliza formatos viejos) */
export function buildToFormValues(build: ApiBuild): BuildFormValues {
    const stats = emptyStats();
    for (const [rawKey, value] of Object.entries(build.min_stats ?? {})) {
        const key = (LEGACY_STAT_KEYS[rawKey] ?? rawKey) as StatKey;
        if (key in stats && value !== null && value !== '' && Number(value) !== 0) stats[key] = String(value);
    }

    const tierRatings: BuildFormValues['tierRatings'] = {};
    const tierReasons: BuildFormValues['tierReasons'] = {};
    for (const cat of TIER_CATEGORIES) {
        const rating = build[`rating_${cat}`];
        const reason = build[`reason_${cat}`];
        if (typeof rating === 'number') tierRatings[cat] = rating;
        if (typeof reason === 'string' && reason) tierReasons[cat] = reason;
    }

    return {
        heroId: build.hero_id ?? build.hero?.id ?? null,
        artifactId: build.artifact_id ?? null,
        title: build.title ?? '',
        description: build.description ?? '',
        primarySet: build.primary_set ?? '',
        secondarySet: build.secondary_set ?? '',
        stats,
        skillLevels: [build.skill_1 ?? 0, build.skill_2 ?? 0, build.skill_3 ?? 0],
        existingImages: build.images ?? [],
        newImages: [],
        synergyHeroes: toHeroesWithNote(build.synergy_heroes),
        counterHeroes: toHeroesWithNote(build.counter_heroes),
        isAnonymous: Boolean(build.is_anonymous),
        language: build.language || 'en',
        tierRatings,
        tierReasons,
        proTags: toTags(build.pro_tags),
        conTags: toTags(build.con_tags),
    };
}

/**
 * Cuerpo multipart para POST /builds (crear) o POST /builds/{id} con _method=PUT (editar).
 * Se mandan todos los campos, también los vacíos: la API solo actualiza lo que recibe, así
 * que omitir un campo vacío impedía borrar una descripción, un set o una lista al editar.
 */
export function toFormData(values: BuildFormValues, mode: 'create' | 'edit'): FormData {
    const data = new FormData();
    if (mode === 'edit') data.append('_method', 'PUT');
    if (mode === 'create' && values.heroId) data.append('hero_id', String(values.heroId));

    data.append('title', values.title.trim());
    data.append('description', values.description);
    data.append('primary_set', values.primarySet);
    data.append('secondary_set', values.secondarySet);
    data.append('artifact_id', values.artifactId ? String(values.artifactId) : '');

    const minStats: Partial<Record<StatKey, number>> = {};
    for (const { key } of STAT_FIELDS) {
        const n = parseInt(values.stats[key], 10);
        if (!Number.isNaN(n)) minStats[key] = n;
    }
    data.append('min_stats', JSON.stringify(minStats));

    values.skillLevels.forEach((level, i) => data.append(`skill_${i + 1}`, String(level)));

    data.append('synergy_heroes', JSON.stringify(values.synergyHeroes));
    data.append('counter_heroes', JSON.stringify(values.counterHeroes));
    data.append('pro_tags', JSON.stringify(values.proTags));
    data.append('con_tags', JSON.stringify(values.conTags));

    for (const cat of TIER_CATEGORIES) {
        const rating = values.tierRatings[cat];
        data.append(`rating_${cat}`, rating ? String(rating) : '');
        data.append(`reason_${cat}`, rating ? values.tierReasons[cat] ?? '' : '');
    }

    data.append('is_anonymous', values.isAnonymous ? '1' : '0');
    data.append('language', values.language);

    if (mode === 'edit') data.append('image_urls', JSON.stringify(values.existingImages));
    values.newImages.forEach((file, i) => data.append(`images[${i}]`, file));

    return data;
}

/** Mensaje de error legible de una respuesta fallida de la API */
export async function readApiError(response: Response, fallback: string): Promise<string> {
    const type = response.headers.get('content-type') ?? '';
    if (type.includes('application/json')) {
        const body = await response.json().catch(() => null);
        const firstValidation = body?.errors ? Object.values(body.errors as Record<string, string[]>)[0]?.[0] : null;
        return firstValidation || body?.message || fallback;
    }
    return `${fallback} (${response.status})`;
}
