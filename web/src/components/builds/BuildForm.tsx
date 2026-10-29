'use client';

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SkillUpgradeInput } from '@/components/builds/SkillUpgradeInput';
import { TierRatingSelector } from '@/components/ui/tier-rating-selector';
import { ProConsSelector } from '@/components/ui/pro-cons-selector';
import { HeroSelectorWithNotes } from '@/components/builds/HeroSelectorWithNotes';
import { useTranslations } from '@/hooks/useTranslations';
import { heroApi } from '@/lib/api';
import { previewUrl } from '@/lib/objectUrl';
import { SETS, SET_IMAGES, SET_NAMES } from '@/lib/sets';
import {
    MAX_BUILD_IMAGES,
    STAT_FIELDS,
    baseStatPlaceholders,
    toFormData,
    type BuildFormValues,
    type StatKey,
} from './buildFormModel';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const SKILL_KEYS = ['S1', 'S2', 'S3'] as const;
const LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'pt', name: 'Português' },
    { code: 'ko', name: '한국어' },
    { code: 'ja', name: '日本語' },
    { code: 'zh', name: '简体中文' },
];

type HeroSkills = Record<string, { name?: string }> | null | undefined;

export interface BuildFormHero {
    id: number;
    name: string;
    slug: string;
    image_url?: string;
    hero_code?: string | null;
    base_stats?: Partial<Record<StatKey, number | null>> | null;
    skills?: HeroSkills;
}

interface BuildFormArtifact {
    id: number;
    name: string;
    icon: string;
}

interface BuildFormProps {
    mode: 'create' | 'edit';
    initialValues: BuildFormValues;
    /** Al editar, el héroe de la build: no se puede cambiar */
    lockedHero?: BuildFormHero | null;
    cancelHref: string;
    /** Envía el FormData a la API; si falla, lanzar un Error con el mensaje para el usuario */
    onSubmit: (data: FormData, context: { heroSlug?: string }) => Promise<void>;
}

/**
 * Formulario de builds compartido por /builds/create y /builds/[id]/edit.
 * Antes eran dos copias de ~800 líneas que habían divergido (claves de stats distintas,
 * campos que no se podían vaciar, la opción anónima que se perdía al editar).
 */
export function BuildForm({ mode, initialValues, lockedHero, cancelHref, onSubmit }: BuildFormProps) {
    const { t, locale } = useTranslations();
    const [values, setValues] = useState(initialValues);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const update = <K extends keyof BuildFormValues>(key: K, value: BuildFormValues[K]) =>
        setValues((current) => ({ ...current, [key]: value }));

    const { data: heroesData } = useQuery({
        queryKey: ['heroes-list', locale],
        queryFn: async () => (await heroApi.list({ lang: locale })).data,
    });
    const heroes: BuildFormHero[] = heroesData?.data || [];

    const { data: artifactsData } = useQuery({
        queryKey: ['artifacts-list', locale],
        queryFn: async () => (await fetch(`${API_URL}/artifacts?lang=${locale}`)).json(),
    });
    const artifacts: BuildFormArtifact[] = artifactsData?.data || [];

    const selectedHero = lockedHero ?? heroes.find((h) => h.id === values.heroId) ?? null;
    const selectedArtifact = artifacts.find((a) => a.id === values.artifactId) ?? null;

    // Skills del héroe elegido: la lista de héroes no las trae; mismo queryKey que el detalle de héroe
    const { data: heroDetail } = useQuery({
        queryKey: ['hero', selectedHero?.slug, locale],
        queryFn: async () => (await heroApi.get(selectedHero!.slug, locale)).data,
        enabled: !lockedHero && Boolean(selectedHero?.slug),
    });
    const skills: HeroSkills = lockedHero?.skills ?? (heroDetail?.data ?? heroDetail)?.skills;
    const skillNames = SKILL_KEYS.map((key) => skills?.[key]?.name);
    const heroCode = lockedHero?.hero_code ?? selectedHero?.hero_code ?? (heroDetail?.data ?? heroDetail)?.hero_code;

    // Los stats base del héroe se muestran como placeholder: antes se copiaban como valores y
    // terminaban guardados como "stats mínimos" de la build
    const statPlaceholders = baseStatPlaceholders(selectedHero?.base_stats);

    const imageCount = values.existingImages.length + values.newImages.length;

    const addImages = (files: File[]) => {
        if (imageCount + files.length > MAX_BUILD_IMAGES) {
            setError(t('builds.maxImages', 'Maximum 5 images'));
            return;
        }
        setError(null);
        update('newImages', [...values.newImages, ...files]);
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (!values.heroId || !values.title.trim()) return;
        setError(null);
        setIsSubmitting(true);
        try {
            await onSubmit(toFormData(values, mode), { heroSlug: selectedHero?.slug });
        } catch (err) {
            setError(err instanceof Error ? err.message : t('common.error', 'Error'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const otherHeroes = heroes.filter((h) => h.id !== values.heroId);

    return (
        <form onSubmit={handleSubmit}>
            <Card className="glass-panel border-e7-gold/20 rounded-xl overflow-hidden">
                <CardHeader className="border-b border-e7-gold/10">
                    <CardTitle className="text-e7-gold">{t('builds.buildInfo', 'Build Information')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    {/* Héroe: se elige al crear; al editar es el de la build */}
                    {lockedHero ? null : (
                        <SearchPicker
                            label={`${t('builds.hero', 'Hero')} *`}
                            placeholder={t('builds.searchHero', 'Search hero...')}
                            emptyText={t('heroes.noResults', 'No heroes found')}
                            items={heroes}
                            selected={selectedHero}
                            onSelect={(hero) => update('heroId', hero.id)}
                            limit={20}
                            renderItem={(hero, size) =>
                                hero.image_url ? (
                                    <Image src={hero.image_url} alt="" width={size} height={size} className="rounded-full" />
                                ) : null
                            }
                        />
                    )}

                    <SearchPicker
                        label={`${t('builds.artifact', 'Artifact')} (${t('common.optional', 'optional')})`}
                        placeholder={t('builds.searchArtifact', 'Search artifact...')}
                        emptyText={t('builds.noArtifactsFound', 'No artifacts found')}
                        items={artifacts}
                        selected={selectedArtifact}
                        onSelect={(artifact) => update('artifactId', artifact.id)}
                        onClear={() => update('artifactId', null)}
                        renderItem={(artifact, size) => (
                            <Image src={artifact.icon} alt="" width={size} height={size} className="rounded-lg" />
                        )}
                    />

                    {/* Mejoras de skills: la API devuelve las skills como objeto S1/S2/S3 */}
                    {skillNames.every(Boolean) && (
                        <section>
                            <h2 className="text-xl font-semibold mb-4 text-gold-gradient flex items-center gap-2">
                                ⚡ {t('builds.skillRecommendations', 'Skill Upgrade Recommendations')}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {SKILL_KEYS.map((key, i) => (
                                    <SkillUpgradeInput
                                        key={key}
                                        skillNumber={(i + 1) as 1 | 2 | 3}
                                        name={skillNames[i]!}
                                        heroCode={heroCode}
                                        value={values.skillLevels[i]}
                                        onChange={(level) => {
                                            const next = [...values.skillLevels] as BuildFormValues['skillLevels'];
                                            next[i] = level;
                                            update('skillLevels', next);
                                        }}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    <Field id="build-title" label={`${t('builds.titleLabel', 'Title')} *`}>
                        <Input
                            id="build-title"
                            value={values.title}
                            onChange={(e) => update('title', e.target.value)}
                            placeholder={t('builds.titlePlaceholder', 'E.g., Fast Cleave, RTA Counter, etc.')}
                            className="bg-e7-void border-e7-gold/30 text-white"
                            maxLength={255}
                            required
                        />
                    </Field>

                    <Field id="build-description" label={t('builds.descriptionLabel', 'Description (optional)')}>
                        <textarea
                            id="build-description"
                            value={values.description}
                            onChange={(e) => update('description', e.target.value)}
                            placeholder={t('builds.descriptionPlaceholder', 'Explain how to use this build...')}
                            rows={4}
                            className="w-full px-4 py-2 rounded-lg bg-e7-void border border-e7-gold/30 text-white focus:border-e7-gold outline-none resize-none"
                        />
                    </Field>

                    <div className="grid md:grid-cols-2 gap-4">
                        <SetPicker
                            label={t('builds.primarySet', 'Primary Set')}
                            value={values.primarySet}
                            onChange={(set) => update('primarySet', set)}
                        />
                        <SetPicker
                            label={t('builds.secondarySet', 'Secondary Set')}
                            value={values.secondarySet}
                            onChange={(set) => update('secondarySet', set)}
                        />
                    </div>

                    <fieldset>
                        <legend className="block text-sm font-medium text-gray-300 mb-3">
                            {t('builds.minStats', 'Minimum Recommended Stats')}
                        </legend>
                        <p className="-mt-2 mb-3 text-xs text-gray-400">
                            {t('builds.minStatsHint', 'Fill in only the stats that matter for this build. The grey numbers are the hero’s base stats.')}
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {STAT_FIELDS.map((stat) => (
                                <div key={stat.key}>
                                    <label htmlFor={`stat-${stat.key}`} className="block text-xs text-gray-400 mb-1">
                                        {stat.label}
                                    </label>
                                    <Input
                                        id={`stat-${stat.key}`}
                                        type="number"
                                        inputMode="numeric"
                                        min={0}
                                        value={values.stats[stat.key]}
                                        onChange={(e) => update('stats', { ...values.stats, [stat.key]: e.target.value })}
                                        placeholder={statPlaceholders[stat.key]}
                                        className="bg-e7-void border-e7-gold/30 text-white text-sm"
                                    />
                                </div>
                            ))}
                        </div>
                    </fieldset>

                    <div>
                        <span className="block text-sm font-medium text-gray-300 mb-2">
                            {t('builds.images', 'Build Images (Screenshots)')}
                        </span>
                        <label
                            htmlFor="build-images"
                            className={`flex flex-col items-center border-2 border-dashed border-e7-gold/30 rounded-lg p-4 transition-colors ${
                                imageCount >= MAX_BUILD_IMAGES ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-e7-gold/50'
                            }`}
                        >
                            <span className="text-3xl mb-2" aria-hidden="true">📷</span>
                            <span className="text-gray-400 text-sm">{t('builds.clickToUpload', 'Click to upload images')}</span>
                            <span className="text-gray-400 text-xs mt-1">
                                {t('builds.maxImages', 'Maximum 5 images')} · {imageCount}/{MAX_BUILD_IMAGES}
                            </span>
                        </label>
                        <input
                            id="build-images"
                            type="file"
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            multiple
                            disabled={imageCount >= MAX_BUILD_IMAGES}
                            className="sr-only"
                            onChange={(e) => {
                                addImages(Array.from(e.target.files || []));
                                e.target.value = '';
                            }}
                        />
                        {imageCount > 0 && (
                            <ul className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-4">
                                {values.existingImages.map((url, index) => (
                                    <ImageThumb
                                        key={url}
                                        src={url}
                                        removeLabel={t('builds.removeImage', 'Remove image')}
                                        onRemove={() => update('existingImages', values.existingImages.filter((_, i) => i !== index))}
                                    />
                                ))}
                                {values.newImages.map((file, index) => (
                                    <ImageThumb
                                        key={`${file.name}-${file.lastModified}-${index}`}
                                        src={previewUrl(file)}
                                        removeLabel={t('builds.removeImage', 'Remove image')}
                                        onRemove={() => update('newImages', values.newImages.filter((_, i) => i !== index))}
                                    />
                                ))}
                            </ul>
                        )}
                    </div>

                    <HeroSelectorWithNotes
                        label={t('builds.synergyHeroes', 'Synergy Heroes')}
                        description={t('builds.synergyDesc', '(Heroes that work well with this hero)')}
                        selectedHeroes={values.synergyHeroes}
                        availableHeroes={otherHeroes}
                        onChange={(list) => update('synergyHeroes', list)}
                        type="synergy"
                    />

                    <HeroSelectorWithNotes
                        label={t('builds.counterHeroes', 'Counter Heroes')}
                        description={t('builds.counterDesc', '(Heroes that counter this hero)')}
                        selectedHeroes={values.counterHeroes}
                        availableHeroes={otherHeroes}
                        onChange={(list) => update('counterHeroes', list)}
                        type="counter"
                    />

                    <TierRatingSelector
                        ratings={values.tierRatings}
                        reasons={values.tierReasons}
                        onChange={(ratings, reasons) =>
                            setValues((current) => ({ ...current, tierRatings: ratings, tierReasons: reasons ?? current.tierReasons }))
                        }
                        showReasons={true}
                    />

                    <ProConsSelector
                        selectedPros={values.proTags}
                        selectedCons={values.conTags}
                        onChange={(pros, cons) => setValues((current) => ({ ...current, proTags: pros, conTags: cons }))}
                    />

                    <Field id="build-language" label={t('language.selectLanguage', 'Language')}>
                        <select
                            id="build-language"
                            value={values.language}
                            onChange={(e) => update('language', e.target.value)}
                            className="w-full bg-e7-void/50 border border-e7-gold/20 text-slate-200 rounded-lg px-4 py-3 focus:border-e7-gold focus:ring-e7-gold/30"
                        >
                            {LANGUAGES.map((lang) => (
                                <option key={lang.code} value={lang.code} lang={lang.code}>
                                    {lang.name}
                                </option>
                            ))}
                        </select>
                    </Field>

                    <div className="flex items-center gap-3 p-4 bg-e7-void/30 rounded-lg border border-e7-gold/20">
                        <input
                            type="checkbox"
                            id="build-anonymous"
                            checked={values.isAnonymous}
                            onChange={(e) => update('isAnonymous', e.target.checked)}
                            className="w-5 h-5 rounded border-e7-gold/30 bg-e7-void text-e7-gold focus:ring-e7-gold/30 cursor-pointer"
                        />
                        <label htmlFor="build-anonymous" className="text-slate-300 cursor-pointer">
                            {t('builds.publishAnonymous', 'Publish anonymously')}
                            <span className="block text-xs text-slate-400">
                                {t('builds.anonymousDescription', 'Your username will not appear on this build')}
                            </span>
                        </label>
                    </div>

                    {error && (
                        <div role="alert" className="p-4 rounded-lg bg-red-900/30 border border-red-500/50 text-red-400">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-4 justify-end pt-6 border-t border-e7-gold/10">
                        <Link href={cancelHref}>
                            <Button type="button" variant="outline" className="border-e7-gold/30 text-slate-400 hover:text-slate-200 hover:border-e7-gold/50">
                                {t('common.cancel', 'Cancel')}
                            </Button>
                        </Link>
                        <Button
                            type="submit"
                            disabled={isSubmitting || !values.heroId || !values.title.trim()}
                            className="btn-gold shadow-lg shadow-e7-gold/20 hover:shadow-e7-gold/40 disabled:opacity-50"
                        >
                            {mode === 'create'
                                ? isSubmitting ? t('builds.publishing', 'Publishing...') : t('builds.publishBuild', 'Publish Build')
                                : isSubmitting ? t('builds.updating', 'Updating...') : t('builds.updateBuild', 'Update Build')}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}

function Field({ id, label, children }: { id: string; label: string; children: ReactNode }) {
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-2">
                {label}
            </label>
            {children}
        </div>
    );
}

function SetPicker({ label, value, onChange }: { label: string; value: string; onChange: (set: string) => void }) {
    return (
        <fieldset>
            <legend className="block text-sm font-medium text-gray-300 mb-2">{label}</legend>
            <div className="grid grid-cols-6 gap-2 p-3 bg-e7-void rounded-lg border border-e7-gold/30">
                {SETS.map((set) => (
                    <button
                        key={set}
                        type="button"
                        onClick={() => onChange(value === set ? '' : set)}
                        aria-pressed={value === set}
                        aria-label={SET_NAMES[set]}
                        title={SET_NAMES[set]}
                        className={`relative w-10 h-10 rounded-lg transition-all ${
                            value === set
                                ? 'ring-2 ring-e7-gold bg-e7-gold/30 scale-110'
                                : 'hover:bg-e7-panel hover:scale-105 opacity-70 hover:opacity-100'
                        }`}
                    >
                        <Image src={SET_IMAGES[set]} alt="" width={40} height={40} className="w-full h-full object-contain" unoptimized />
                    </button>
                ))}
            </div>
            {value && <p className="text-sm text-e7-gold mt-1 capitalize">{SET_NAMES[value]}</p>}
        </fieldset>
    );
}

function ImageThumb({ src, removeLabel, onRemove }: { src: string; removeLabel: string; onRemove: () => void }) {
    return (
        <li className="relative aspect-square rounded-lg overflow-hidden bg-e7-void border border-e7-gold/20">
            {/* eslint-disable-next-line @next/next/no-img-element -- previsualización en el formulario (blob: o imagen ya subida), no pasa por next/image */}
            <img src={src} alt="" className="w-full h-full object-cover" />
            <button
                type="button"
                onClick={onRemove}
                aria-label={removeLabel}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600 text-white text-xs flex items-center justify-center hover:bg-red-500"
            >
                ✕
            </button>
        </li>
    );
}

interface PickerItem {
    id: number;
    name: string;
}

/** Selector con búsqueda (héroe, artefacto): se cierra al hacer clic afuera o con Escape */
function SearchPicker<T extends PickerItem>({
    label,
    placeholder,
    emptyText,
    items,
    selected,
    onSelect,
    onClear,
    renderItem,
    limit,
}: {
    label: string;
    placeholder: string;
    emptyText: string;
    items: T[];
    selected: T | null;
    onSelect: (item: T) => void;
    onClear?: () => void;
    renderItem: (item: T, size: number) => ReactNode;
    limit?: number;
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open]);

    const matches = items.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));
    const visible = limit ? matches.slice(0, limit) : matches;

    const choose = (item: T) => {
        onSelect(item);
        setOpen(false);
        setSearch('');
    };

    return (
        <div className="relative" ref={containerRef} onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}>
            <span className="block text-sm font-medium text-gray-300 mb-2">{label}</span>
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    aria-expanded={open}
                    aria-label={selected ? `${label}: ${selected.name}` : label}
                    className="flex-1 min-w-0 px-4 py-2 rounded-lg bg-e7-void border border-e7-gold/30 text-white text-left flex items-center gap-2"
                >
                    {selected ? (
                        <>
                            {renderItem(selected, 40)}
                            <span className="text-base truncate">{selected.name}</span>
                        </>
                    ) : (
                        <span className="text-gray-400">{placeholder}</span>
                    )}
                </button>
                {selected && onClear && (
                    <button
                        type="button"
                        onClick={onClear}
                        aria-label={`✕ ${selected.name}`}
                        className="px-3 rounded-lg border border-e7-gold/30 text-gray-400 hover:text-white"
                    >
                        ✕
                    </button>
                )}
            </div>
            {open && (
                <div className="absolute z-50 w-full mt-1 bg-e7-panel border border-e7-gold/30 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={placeholder}
                        aria-label={placeholder}
                        className="m-2 w-[calc(100%-16px)] bg-e7-void border-e7-gold/30 text-white"
                        autoFocus
                    />
                    <ul>
                        {visible.map((item) => (
                            <li key={item.id}>
                                <button
                                    type="button"
                                    onClick={() => choose(item)}
                                    className="w-full px-4 py-3 hover:bg-e7-gold/20 focus-visible:bg-e7-gold/20 focus-visible:outline-none text-white flex items-center gap-3 text-left"
                                >
                                    {renderItem(item, 56)}
                                    <span className="text-base">{item.name}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                    {matches.length === 0 && <p className="px-4 py-2 text-gray-400">{emptyText}</p>}
                </div>
            )}
        </div>
    );
}
