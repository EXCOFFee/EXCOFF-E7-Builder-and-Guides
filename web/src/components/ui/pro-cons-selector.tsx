'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import {
    PROS_TAGS,
    CONS_TAGS,
    TAG_CATEGORIES,
    Tag,
    TagType,
    getTagLabel,
    getCategoryLabel,
    MAX_PROS,
    MAX_CONS,
} from '@/lib/pros-cons-tags';

interface ProConsSelectorProps {
    selectedPros: string[];
    selectedCons: string[];
    onChange: (pros: string[], cons: string[]) => void;
    disabled?: boolean;
}

/**
 * ProConsSelector - Component for selecting pros and cons tags for builds.
 * SRP: Handles tag selection UI only.
 * KISS: Simple chip-based selection with search and category filter.
 */
export function ProConsSelector({
    selectedPros,
    selectedCons,
    onChange,
    disabled = false,
}: ProConsSelectorProps) {
    const { t, locale } = useTranslations();

    // Search and filter state
    const [prosSearch, setProsSearch] = useState('');
    const [consSearch, setConsSearch] = useState('');
    const [prosCategory, setProsCategory] = useState<string>('all');
    const [consCategory, setConsCategory] = useState<string>('all');

    // Filter tags based on search and category
    const filteredPros = useMemo(() => {
        return PROS_TAGS.filter(tag => {
            const matchesSearch = prosSearch === '' ||
                getTagLabel(tag, locale).toLowerCase().includes(prosSearch.toLowerCase());
            const matchesCategory = prosCategory === 'all' || tag.category === prosCategory;
            return matchesSearch && matchesCategory;
        });
    }, [prosSearch, prosCategory, locale]);

    const filteredCons = useMemo(() => {
        return CONS_TAGS.filter(tag => {
            const matchesSearch = consSearch === '' ||
                getTagLabel(tag, locale).toLowerCase().includes(consSearch.toLowerCase());
            const matchesCategory = consCategory === 'all' || tag.category === consCategory;
            return matchesSearch && matchesCategory;
        });
    }, [consSearch, consCategory, locale]);

    const handleProClick = (tagId: string) => {
        if (disabled) return;
        if (selectedPros.includes(tagId)) {
            onChange(selectedPros.filter(id => id !== tagId), selectedCons);
        } else if (selectedPros.length < MAX_PROS) {
            onChange([...selectedPros, tagId], selectedCons);
        }
    };

    const handleConClick = (tagId: string) => {
        if (disabled) return;
        if (selectedCons.includes(tagId)) {
            onChange(selectedPros, selectedCons.filter(id => id !== tagId));
        } else if (selectedCons.length < MAX_CONS) {
            onChange(selectedPros, [...selectedCons, tagId]);
        }
    };

    return (
        <div className="space-y-6">
            {/* PROS Section */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-green-900/30 to-emerald-900/20 border border-green-500/30">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-green-400 flex items-center gap-2">
                        ✓ {t('builds.pros', 'Pros')}
                        <span className="text-sm font-normal text-green-500/70">
                            ({selectedPros.length}/{MAX_PROS})
                        </span>
                    </h3>
                </div>

                {/* Search and Filter */}
                <div className="flex gap-2 mb-3">
                    <input
                        type="text"
                        value={prosSearch}
                        onChange={(e) => setProsSearch(e.target.value)}
                        placeholder={t('builds.searchTags', 'Search tags...')}
                        disabled={disabled}
                        className="flex-1 px-3 py-2 text-sm rounded-lg bg-e7-dark/50 border border-green-500/20 text-white placeholder-gray-500 focus:border-green-500/50 focus:outline-none"
                    />
                    <select
                        value={prosCategory}
                        onChange={(e) => setProsCategory(e.target.value)}
                        disabled={disabled}
                        className="px-3 py-2 text-sm rounded-lg bg-e7-dark/50 border border-green-500/20 text-white focus:border-green-500/50 focus:outline-none"
                    >
                        <option value="all">{t('common.allCategories', 'All')}</option>
                        {TAG_CATEGORIES.pros.map(cat => (
                            <option key={cat.id} value={cat.id}>
                                {locale === 'es' ? cat.es : cat.en}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Selected Tags */}
                {selectedPros.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3 p-2 bg-green-950/30 rounded-lg border border-green-500/20">
                        {selectedPros.map(tagId => {
                            const tag = PROS_TAGS.find(t => t.id === tagId);
                            if (!tag) return null;
                            return (
                                <button
                                    key={tagId}
                                    type="button"
                                    onClick={() => handleProClick(tagId)}
                                    disabled={disabled}
                                    className="px-3 py-1 text-sm rounded-full bg-green-600/30 border border-green-500/60 text-green-300 hover:bg-green-600/50 transition-colors flex items-center gap-1"
                                >
                                    {getTagLabel(tag, locale)}
                                    <span className="text-green-400">×</span>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Available Tags */}
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
                    {filteredPros.slice(0, 30).map(tag => {
                        const isSelected = selectedPros.includes(tag.id);
                        const isDisabled = disabled || (!isSelected && selectedPros.length >= MAX_PROS);

                        return (
                            <button
                                key={tag.id}
                                type="button"
                                onClick={() => handleProClick(tag.id)}
                                disabled={isDisabled}
                                className={`px-3 py-1 text-sm rounded-full transition-all ${isSelected
                                        ? 'bg-green-600/40 border-2 border-green-400 text-green-200 scale-105'
                                        : isDisabled
                                            ? 'bg-gray-800/30 border border-gray-600/30 text-gray-500 cursor-not-allowed'
                                            : 'bg-e7-dark/30 border border-green-500/30 text-gray-300 hover:border-green-500/60 hover:text-green-300'
                                    }`}
                            >
                                {getTagLabel(tag, locale)}
                            </button>
                        );
                    })}
                    {filteredPros.length > 30 && (
                        <span className="text-xs text-gray-500 self-center">+{filteredPros.length - 30} more</span>
                    )}
                </div>
            </div>

            {/* CONS Section */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-red-900/30 to-rose-900/20 border border-red-500/30">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-red-400 flex items-center gap-2">
                        ✗ {t('builds.cons', 'Cons')}
                        <span className="text-sm font-normal text-red-500/70">
                            ({selectedCons.length}/{MAX_CONS})
                        </span>
                    </h3>
                </div>

                {/* Search and Filter */}
                <div className="flex gap-2 mb-3">
                    <input
                        type="text"
                        value={consSearch}
                        onChange={(e) => setConsSearch(e.target.value)}
                        placeholder={t('builds.searchTags', 'Search tags...')}
                        disabled={disabled}
                        className="flex-1 px-3 py-2 text-sm rounded-lg bg-e7-dark/50 border border-red-500/20 text-white placeholder-gray-500 focus:border-red-500/50 focus:outline-none"
                    />
                    <select
                        value={consCategory}
                        onChange={(e) => setConsCategory(e.target.value)}
                        disabled={disabled}
                        className="px-3 py-2 text-sm rounded-lg bg-e7-dark/50 border border-red-500/20 text-white focus:border-red-500/50 focus:outline-none"
                    >
                        <option value="all">{t('common.allCategories', 'All')}</option>
                        {TAG_CATEGORIES.cons.map(cat => (
                            <option key={cat.id} value={cat.id}>
                                {locale === 'es' ? cat.es : cat.en}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Selected Tags */}
                {selectedCons.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3 p-2 bg-red-950/30 rounded-lg border border-red-500/20">
                        {selectedCons.map(tagId => {
                            const tag = CONS_TAGS.find(t => t.id === tagId);
                            if (!tag) return null;
                            return (
                                <button
                                    key={tagId}
                                    type="button"
                                    onClick={() => handleConClick(tagId)}
                                    disabled={disabled}
                                    className="px-3 py-1 text-sm rounded-full bg-red-600/30 border border-red-500/60 text-red-300 hover:bg-red-600/50 transition-colors flex items-center gap-1"
                                >
                                    {getTagLabel(tag, locale)}
                                    <span className="text-red-400">×</span>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Available Tags */}
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
                    {filteredCons.slice(0, 30).map(tag => {
                        const isSelected = selectedCons.includes(tag.id);
                        const isDisabled = disabled || (!isSelected && selectedCons.length >= MAX_CONS);

                        return (
                            <button
                                key={tag.id}
                                type="button"
                                onClick={() => handleConClick(tag.id)}
                                disabled={isDisabled}
                                className={`px-3 py-1 text-sm rounded-full transition-all ${isSelected
                                        ? 'bg-red-600/40 border-2 border-red-400 text-red-200 scale-105'
                                        : isDisabled
                                            ? 'bg-gray-800/30 border border-gray-600/30 text-gray-500 cursor-not-allowed'
                                            : 'bg-e7-dark/30 border border-red-500/30 text-gray-300 hover:border-red-500/60 hover:text-red-300'
                                    }`}
                            >
                                {getTagLabel(tag, locale)}
                            </button>
                        );
                    })}
                    {filteredCons.length > 30 && (
                        <span className="text-xs text-gray-500 self-center">+{filteredCons.length - 30} more</span>
                    )}
                </div>
            </div>
        </div>
    );
}

/**
 * ProConsDisplay - Read-only display of pros and cons.
 * SRP: Only handles tag display, not selection.
 */
interface ProConsDisplayProps {
    pros: string[];
    cons: string[];
    compact?: boolean;
}

export function ProConsDisplay({ pros, cons, compact = false }: ProConsDisplayProps) {
    const { t, locale } = useTranslations();

    // Don't render if empty
    if (pros.length === 0 && cons.length === 0) return null;

    if (compact) {
        return (
            <div className="flex flex-wrap gap-2">
                {pros.map(tagId => {
                    const tag = PROS_TAGS.find(t => t.id === tagId);
                    if (!tag) return null;
                    return (
                        <span key={tagId} className="px-2 py-0.5 text-xs rounded-full bg-green-900/40 border border-green-500/40 text-green-300">
                            ✓ {getTagLabel(tag, locale)}
                        </span>
                    );
                })}
                {cons.map(tagId => {
                    const tag = CONS_TAGS.find(t => t.id === tagId);
                    if (!tag) return null;
                    return (
                        <span key={tagId} className="px-2 py-0.5 text-xs rounded-full bg-red-900/40 border border-red-500/40 text-red-300">
                            ✗ {getTagLabel(tag, locale)}
                        </span>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pros */}
            {pros.length > 0 && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-green-900/20 to-emerald-900/10 border border-green-500/30">
                    <h4 className="text-green-400 font-semibold mb-3 flex items-center gap-2">
                        ✓ {t('builds.pros', 'Pros')}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {pros.map(tagId => {
                            const tag = PROS_TAGS.find(t => t.id === tagId);
                            if (!tag) return null;
                            return (
                                <span key={tagId} className="px-3 py-1 text-sm rounded-full bg-green-600/20 border border-green-500/40 text-green-300">
                                    {getTagLabel(tag, locale)}
                                </span>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Cons */}
            {cons.length > 0 && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-red-900/20 to-rose-900/10 border border-red-500/30">
                    <h4 className="text-red-400 font-semibold mb-3 flex items-center gap-2">
                        ✗ {t('builds.cons', 'Cons')}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {cons.map(tagId => {
                            const tag = CONS_TAGS.find(t => t.id === tagId);
                            if (!tag) return null;
                            return (
                                <span key={tagId} className="px-3 py-1 text-sm rounded-full bg-red-600/20 border border-red-500/40 text-red-300">
                                    {getTagLabel(tag, locale)}
                                </span>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
