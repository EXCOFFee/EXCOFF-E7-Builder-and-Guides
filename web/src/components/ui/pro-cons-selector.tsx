'use client';

import { useId, useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from '@/hooks/useTranslations';
import {
    PROS_TAGS,
    CONS_TAGS,
    TAG_GROUPS,
    TAG_CATEGORIES,
    getTagById,
    getTagLabel,
    getGroupLabel,
    getCategoryLabel,
    tagMatches,
    MAX_PROS,
    MAX_CONS,
    type Tag,
    type TagType,
} from '@/lib/pros-cons-tags';

// Tag with optional note
export interface TagWithNote {
    id: string;
    note?: string;
}

const NOTE_MAX = 200;

/** Colores por tipo: verde para pros, rojo para contras */
const TONE = {
    pro: {
        panel: 'from-green-900/30 to-emerald-900/20 border-green-500/30',
        title: 'text-green-400',
        count: 'text-green-500/70',
        field: 'border-green-500/20 focus:border-green-500/50',
        chip: 'bg-green-600/30 border-green-500/60 text-green-300',
        idle: 'border-green-500/30 hover:border-green-500/60 hover:text-green-300',
        on: 'bg-green-600/40 border-green-400 text-green-200',
        heading: 'text-green-400/80',
        icon: '✓',
    },
    con: {
        panel: 'from-red-900/30 to-rose-900/20 border-red-500/30',
        title: 'text-red-400',
        count: 'text-red-500/70',
        field: 'border-red-500/20 focus:border-red-500/50',
        chip: 'bg-red-600/30 border-red-500/60 text-red-300',
        idle: 'border-red-500/30 hover:border-red-500/60 hover:text-red-300',
        on: 'bg-red-600/40 border-red-400 text-red-200',
        heading: 'text-red-400/80',
        icon: '✗',
    },
} as const;

interface ProConsSelectorProps {
    selectedPros: TagWithNote[];
    selectedCons: TagWithNote[];
    onChange: (pros: TagWithNote[], cons: TagWithNote[]) => void;
    disabled?: boolean;
}

/**
 * Selector de pros y contras del formulario de builds: filtro por grupo y categoría,
 * búsqueda en los 6 idiomas (y sinónimos), hasta 5 por lado y una nota opcional por tag.
 */
export function ProConsSelector({ selectedPros, selectedCons, onChange, disabled = false }: ProConsSelectorProps) {
    const { t } = useTranslations();
    const [noteFor, setNoteFor] = useState<{ type: TagType; id: string; text: string } | null>(null);

    const sides = { pro: selectedPros, con: selectedCons };
    const setSide = (type: TagType, tags: TagWithNote[]) =>
        type === 'pro' ? onChange(tags, selectedCons) : onChange(selectedPros, tags);

    const saveNote = () => {
        if (!noteFor) return;
        const note = noteFor.text.trim() || undefined;
        setSide(noteFor.type, sides[noteFor.type].map((tag) => (tag.id === noteFor.id ? { ...tag, note } : tag)));
        setNoteFor(null);
    };

    return (
        <div className="space-y-6">
            {noteFor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="tag-note-title">
                    <div className="bg-e7-dark-light rounded-xl border border-e7-gold/30 p-6 w-full max-w-md mx-4 shadow-2xl">
                        <h3 id="tag-note-title" className="text-lg font-semibold text-e7-gold mb-2">
                            {t('builds.addTagNote', 'Add Note to Tag')}
                        </h3>
                        <p className="text-sm text-gray-400 mb-4">
                            {t('builds.tagNoteDescription', 'Explain why you selected this tag (optional)')}
                        </p>
                        <textarea
                            value={noteFor.text}
                            onChange={(e) => setNoteFor({ ...noteFor, text: e.target.value.slice(0, NOTE_MAX) })}
                            placeholder={t('builds.tagNotePlaceholder', 'Why this tag? (max 200 characters)')}
                            aria-label={t('builds.addTagNote', 'Add Note to Tag')}
                            className="w-full h-24 px-4 py-3 rounded-lg bg-e7-dark/50 border border-e7-gold/20 text-white placeholder-gray-400 resize-none focus:border-e7-gold/50 focus:outline-none"
                            maxLength={NOTE_MAX}
                            autoFocus
                        />
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-gray-400">{noteFor.text.length}/{NOTE_MAX}</span>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setNoteFor(null)}
                                    className="px-4 py-2 text-sm rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
                                >
                                    {t('common.cancel', 'Cancel')}
                                </button>
                                <button
                                    type="button"
                                    onClick={saveNote}
                                    className="px-4 py-2 text-sm rounded-lg bg-e7-gold text-black font-semibold hover:bg-yellow-400 transition-colors"
                                >
                                    {t('common.save', 'Save')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {(['pro', 'con'] as const).map((type) => (
                <TagSide
                    key={type}
                    type={type}
                    selected={sides[type]}
                    disabled={disabled}
                    onChange={(tags) => setSide(type, tags)}
                    onEditNote={(id) => setNoteFor({ type, id, text: sides[type].find((tag) => tag.id === id)?.note ?? '' })}
                />
            ))}
        </div>
    );
}

interface TagSideProps {
    type: TagType;
    selected: TagWithNote[];
    disabled: boolean;
    onChange: (tags: TagWithNote[]) => void;
    onEditNote: (id: string) => void;
}

function TagSide({ type, selected, disabled, onChange, onEditNote }: TagSideProps) {
    const { t, locale } = useTranslations();
    const fieldId = useId();
    const tone = TONE[type];
    const max = type === 'pro' ? MAX_PROS : MAX_CONS;
    const [search, setSearch] = useState('');
    const [group, setGroup] = useState('all');
    const [category, setCategory] = useState('all');

    const groups = TAG_GROUPS.filter((g) => g.type === type);
    const categories = TAG_CATEGORIES.filter((c) => c.type === type && (group === 'all' || c.group === group));

    // Tags visibles agrupados por categoría, en el orden del catálogo
    const sections = useMemo(() => {
        const all = type === 'pro' ? PROS_TAGS : CONS_TAGS;
        const visible = all.filter((tag) =>
            (group === 'all' || tag.group === group) &&
            (category === 'all' || tag.category === category) &&
            tagMatches(tag, search));
        const byCategory = new Map<string, Tag[]>();
        for (const tag of visible) byCategory.set(tag.category, [...(byCategory.get(tag.category) ?? []), tag]);
        return [...byCategory.entries()];
    }, [type, group, category, search]);

    const isSelected = (id: string) => selected.some((tag) => tag.id === id);
    const toggle = (id: string) => {
        if (disabled) return;
        if (isSelected(id)) onChange(selected.filter((tag) => tag.id !== id));
        else if (selected.length < max) onChange([...selected, { id }]);
    };

    const title = type === 'pro' ? t('builds.pros', 'Pros') : t('builds.cons', 'Cons');
    const fieldClass = `px-3 py-2 text-sm rounded-lg bg-e7-dark/50 border text-white placeholder-gray-400 focus:outline-none ${tone.field}`;

    return (
        <fieldset className={`p-5 rounded-xl bg-gradient-to-br border ${tone.panel}`} disabled={disabled}>
            <legend className="sr-only">{title}</legend>
            <h3 className={`text-lg font-semibold flex items-center gap-2 mb-4 ${tone.title}`} aria-hidden>
                {tone.icon} {title}
                <span className={`text-sm font-normal ${tone.count}`}>({selected.length}/{max})</span>
            </h3>

            <div className="flex flex-col gap-2 mb-3 sm:flex-row">
                <input
                    id={`${fieldId}-search`}
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t('builds.searchTags', 'Search tags...')}
                    aria-label={`${title}: ${t('builds.searchTags', 'Search tags...')}`}
                    className={`flex-1 ${fieldClass}`}
                />
                <select
                    aria-label={`${title}: ${t('builds.tagGroup', 'Group')}`}
                    value={group}
                    onChange={(e) => {
                        setGroup(e.target.value);
                        setCategory('all');
                    }}
                    className={`pr-8 ${fieldClass}`}
                >
                    <option value="all">{t('builds.allTagGroups', 'All groups')}</option>
                    {groups.map((g) => (
                        <option key={g.id} value={g.id}>{getGroupLabel(g.id, locale)}</option>
                    ))}
                </select>
                <select
                    aria-label={`${title}: ${t('guides.category', 'Category')}`}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={`pr-8 ${fieldClass}`}
                >
                    <option value="all">{t('common.allCategories', 'All')}</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>{getCategoryLabel(c.id, locale)}</option>
                    ))}
                </select>
            </div>

            {selected.length > 0 && (
                <ul className="flex flex-wrap gap-2 mb-3 p-3 bg-black/20 rounded-lg" aria-label={t('builds.selectedTags', 'Selected tags')}>
                    {selected.map((item) => {
                        const tag = getTagById(item.id);
                        if (!tag) return null;
                        const label = getTagLabel(tag, locale);
                        return (
                            <li key={item.id} className="flex flex-col">
                                <span className={`inline-flex items-center rounded-full border text-sm ${tone.chip}`}>
                                    <button
                                        type="button"
                                        onClick={() => onEditNote(item.id)}
                                        className="pl-3 pr-1 py-1.5"
                                        title={item.note || t('builds.clickToAddNote', 'Click to add note')}
                                    >
                                        {label}
                                        {item.note && <span className="ml-1 text-yellow-400" aria-label={t('builds.hasNote', 'has a note')}>📝</span>}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => toggle(item.id)}
                                        className="px-2 py-1.5 hover:text-white"
                                        aria-label={`${t('common.remove', 'Remove')} ${label}`}
                                    >
                                        ×
                                    </button>
                                </span>
                                {item.note && <span className="text-xs text-gray-400 mt-1 max-w-[200px] truncate">{item.note}</span>}
                            </li>
                        );
                    })}
                </ul>
            )}

            <p className="text-xs text-gray-400 mb-2">
                {t('builds.clickTagForNote', 'Click on a selected tag to add a note')} ({t('common.optional', 'optional')})
            </p>

            <div className="max-h-64 overflow-y-auto p-2 bg-e7-dark/20 rounded-lg space-y-3">
                {sections.map(([categoryId, tags]) => (
                    <div key={categoryId}>
                        <p className={`text-[11px] uppercase tracking-wider mb-1.5 ${tone.heading}`}>
                            {getCategoryLabel(categoryId, locale)}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {tags.map((tag) => {
                                const on = isSelected(tag.id);
                                const blocked = !on && selected.length >= max;
                                return (
                                    <button
                                        key={tag.id}
                                        type="button"
                                        onClick={() => toggle(tag.id)}
                                        disabled={blocked}
                                        aria-pressed={on}
                                        className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${on
                                            ? `border-2 ${tone.on}`
                                            : blocked
                                                ? 'bg-gray-800/30 border-gray-600/30 text-gray-400 cursor-not-allowed'
                                                : `bg-e7-dark/30 text-gray-300 ${tone.idle}`}`}
                                    >
                                        {getTagLabel(tag, locale)}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
                {sections.length === 0 && (
                    <p className="text-sm text-gray-400 p-2">{t('common.noResults', 'No results found')}</p>
                )}
            </div>
        </fieldset>
    );
}

/**
 * ProConsDisplay - pros y contras de una build (solo lectura). Cada tag lleva a la lista de
 * builds que lo tienen.
 */
interface ProConsDisplayProps {
    pros: TagWithNote[] | string[];
    cons: TagWithNote[] | string[];
    compact?: boolean;
}

// Helper to normalize old string[] format to TagWithNote[]
export function normalizeTagsWithNotes(tags: TagWithNote[] | string[] | null | undefined): TagWithNote[] {
    if (!tags || tags.length === 0) return [];
    return (tags as (TagWithNote | string)[]).map((tag) => (typeof tag === 'string' ? { id: tag } : tag));
}

/** Link a /builds filtrado por el tag */
export function tagHref(id: string): string {
    return `/builds?tags=${encodeURIComponent(id)}`;
}

export function ProConsDisplay({ pros, cons, compact = false }: ProConsDisplayProps) {
    const { t, locale } = useTranslations();
    const sides = [
        { type: 'pro' as const, items: normalizeTagsWithNotes(pros), title: t('builds.pros', 'Pros') },
        { type: 'con' as const, items: normalizeTagsWithNotes(cons), title: t('builds.cons', 'Cons') },
    ].map((side) => ({ ...side, items: side.items.filter((item) => getTagById(item.id)) }));

    if (sides.every((side) => side.items.length === 0)) return null;

    if (compact) {
        return (
            <div className="flex flex-wrap gap-2">
                {sides.flatMap(({ type, items }) =>
                    items.map((item) => (
                        <Link
                            key={`${type}-${item.id}`}
                            href={tagHref(item.id)}
                            title={item.note}
                            className={`px-2 py-0.5 text-xs rounded-full border hover:underline ${type === 'pro' ? 'bg-green-900/40 border-green-500/40 text-green-300' : 'bg-red-900/40 border-red-500/40 text-red-300'}`}
                        >
                            {TONE[type].icon} {getTagLabel(getTagById(item.id)!, locale)}
                            {item.note && <span className="ml-1">📝</span>}
                        </Link>
                    )))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sides.filter((side) => side.items.length > 0).map(({ type, items, title }) => (
                <section
                    key={type}
                    className={`p-6 rounded-xl bg-gradient-to-br border shadow-lg ${type === 'pro' ? 'from-green-900/30 to-emerald-900/20 border-green-500/40 shadow-green-500/5' : 'from-red-900/30 to-rose-900/20 border-red-500/40 shadow-red-500/5'}`}
                >
                    <h3 className={`text-xl font-sans font-semibold mb-5 flex items-center gap-2 ${TONE[type].title}`}>
                        {TONE[type].icon} {title}
                    </h3>
                    <ul className="space-y-4">
                        {items.map((item) => (
                            <li
                                key={item.id}
                                className={`rounded-lg p-4 border transition-colors ${type === 'pro' ? 'bg-gradient-to-r from-green-900/30 to-green-800/10 border-green-500/30 hover:border-green-400/50' : 'bg-gradient-to-r from-red-900/30 to-red-800/10 border-red-500/30 hover:border-red-400/50'}`}
                            >
                                <Link
                                    href={tagHref(item.id)}
                                    className={`text-lg font-sans font-medium hover:underline ${type === 'pro' ? 'text-green-300' : 'text-red-300'}`}
                                    title={t('builds.seeBuildsWithTag', 'See builds with this tag')}
                                >
                                    {getTagLabel(getTagById(item.id)!, locale)}
                                </Link>
                                {item.note && <p className="text-sm text-gray-300 mt-3 leading-relaxed">{item.note}</p>}
                            </li>
                        ))}
                    </ul>
                </section>
            ))}
        </div>
    );
}
