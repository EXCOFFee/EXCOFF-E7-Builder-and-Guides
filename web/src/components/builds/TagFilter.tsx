'use client';

import { useId, useMemo, useState } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import {
    TAG_GROUPS,
    getTagById,
    getTagLabel,
    getGroupLabel,
    getCategoryLabel,
    groupTagsByCategory,
    type TagType,
} from '@/lib/pros-cons-tags';

interface TagFilterProps {
    included: string[];
    excluded: string[];
    onChange: (included: string[], excluded: string[]) => void;
}

/**
 * Filtro de la lista de builds por pros/contras. Cada clic en un tag pasa por
 * incluir (la build lo tiene) → excluir (no lo tiene) → sin filtro.
 */
export function TagFilter({ included, excluded, onChange }: TagFilterProps) {
    const { t, locale } = useTranslations();
    const fieldId = useId();
    const [type, setType] = useState<TagType>('pro');
    const [group, setGroup] = useState('all');
    const [search, setSearch] = useState('');

    const state = (id: string) => (included.includes(id) ? 'in' : excluded.includes(id) ? 'out' : null);
    const cycle = (id: string) => {
        const current = state(id);
        const inc = included.filter((x) => x !== id);
        const exc = excluded.filter((x) => x !== id);
        if (current === null) onChange([...inc, id], exc);
        else if (current === 'in') onChange(inc, [...exc, id]);
        else onChange(inc, exc);
    };

    const sections = useMemo(() => groupTagsByCategory(type, { group, search }), [type, group, search]);

    const active = [...included.map((id) => ({ id, mode: 'in' as const })), ...excluded.map((id) => ({ id, mode: 'out' as const }))]
        .filter(({ id }) => getTagById(id));
    const fieldClass = 'px-3 py-2 text-sm rounded-lg bg-e7-void/50 border border-e7-gold/20 text-slate-200 placeholder:text-slate-400 focus:border-e7-gold focus:outline-none';

    return (
        <div className="space-y-3">
            {active.length > 0 && (
                <ul className="flex flex-wrap items-center gap-2" aria-label={t('builds.activeTagFilters', 'Active tag filters')}>
                    {active.map(({ id, mode }) => {
                        const label = getTagLabel(getTagById(id)!, locale);
                        return (
                            <li key={id}>
                                <button
                                    type="button"
                                    onClick={() => onChange(included.filter((x) => x !== id), excluded.filter((x) => x !== id))}
                                    className={`rounded-full border px-3 py-1 text-xs ${mode === 'in' ? 'border-emerald-400/60 bg-emerald-900/40 text-emerald-200' : 'border-rose-400/60 bg-rose-900/40 text-rose-200 line-through'}`}
                                    aria-label={`${t('common.remove', 'Remove')} ${label}`}
                                >
                                    {mode === 'in' ? '+' : '−'} {label} ×
                                </button>
                            </li>
                        );
                    })}
                    <li>
                        <button type="button" onClick={() => onChange([], [])} className="text-xs text-slate-400 hover:text-e7-gold">
                            {t('common.clearFilters', 'Clear filters')}
                        </button>
                    </li>
                </ul>
            )}

            <div className="flex flex-wrap items-center gap-2">
                <div role="group" aria-label={t('builds.tagType', 'Tag type')} className="flex rounded-lg border border-e7-gold/20 p-0.5">
                    {(['pro', 'con'] as const).map((value) => (
                        <button
                            key={value}
                            type="button"
                            aria-pressed={type === value}
                            onClick={() => {
                                setType(value);
                                setGroup('all');
                            }}
                            className={`rounded-md px-3 py-1.5 text-sm ${type === value ? 'bg-e7-gold/20 text-e7-gold' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            {value === 'pro' ? t('builds.pros', 'Pros') : t('builds.cons', 'Cons')}
                        </button>
                    ))}
                </div>
                <select
                    aria-label={t('builds.tagGroup', 'Group')}
                    value={group}
                    onChange={(e) => setGroup(e.target.value)}
                    className={`pr-8 ${fieldClass}`}
                >
                    <option value="all">{t('builds.allTagGroups', 'All groups')}</option>
                    {TAG_GROUPS.filter((g) => g.type === type).map((g) => (
                        <option key={g.id} value={g.id}>{getGroupLabel(g.id, locale)}</option>
                    ))}
                </select>
                <input
                    id={`${fieldId}-search`}
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t('builds.searchTags', 'Search tags...')}
                    aria-label={t('builds.searchTags', 'Search tags...')}
                    className={`w-full sm:w-auto sm:min-w-48 sm:flex-1 ${fieldClass}`}
                />
            </div>
            <p className="text-xs text-slate-400">{t('builds.tagFilterHint', 'Click once to include, twice to exclude, three times to remove.')}</p>

            <div className="max-h-72 space-y-3 overflow-y-auto rounded-lg bg-e7-void/30 p-3">
                {sections.map(([categoryId, tags]) => (
                    <div key={categoryId}>
                        <p className="mb-1.5 text-[11px] uppercase tracking-wider text-slate-400">{getCategoryLabel(categoryId, locale)}</p>
                        <div className="flex flex-wrap gap-2">
                            {tags.map((tag) => {
                                const mode = state(tag.id);
                                return (
                                    <button
                                        key={tag.id}
                                        type="button"
                                        onClick={() => cycle(tag.id)}
                                        aria-label={`${getTagLabel(tag, locale)}: ${mode === 'in' ? t('builds.tagIncluded', 'included') : mode === 'out' ? t('builds.tagExcluded', 'excluded') : t('builds.tagNotFiltered', 'not filtered')}`}
                                        className={`rounded-full border px-3 py-1 text-sm transition-colors ${mode === 'in'
                                            ? 'border-emerald-400 bg-emerald-900/50 text-emerald-100'
                                            : mode === 'out'
                                                ? 'border-rose-400 bg-rose-900/50 text-rose-100 line-through'
                                                : 'border-slate-600/50 text-slate-300 hover:border-e7-gold/60 hover:text-e7-gold'}`}
                                    >
                                        {mode === 'in' ? '+ ' : mode === 'out' ? '− ' : ''}{getTagLabel(tag, locale)}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
                {sections.length === 0 && <p className="text-sm text-slate-400">{t('common.noResults', 'No results found')}</p>}
            </div>
        </div>
    );
}
