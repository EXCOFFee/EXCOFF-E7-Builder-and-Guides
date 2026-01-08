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

// Tag with optional note
export interface TagWithNote {
    id: string;
    note?: string;
}

interface ProConsSelectorProps {
    selectedPros: TagWithNote[];
    selectedCons: TagWithNote[];
    onChange: (pros: TagWithNote[], cons: TagWithNote[]) => void;
    disabled?: boolean;
}

/**
 * ProConsSelector - Component for selecting pros and cons tags for builds.
 * Features:
 * - Shows ALL tags when category is "All" (scrollable)
 * - Modal popup to add notes to selected tags
 * - 200 character limit for notes
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

    // Modal state for editing notes
    const [noteModal, setNoteModal] = useState<{
        isOpen: boolean;
        tagId: string;
        type: 'pro' | 'con';
        currentNote: string;
    }>({ isOpen: false, tagId: '', type: 'pro', currentNote: '' });

    // Filter tags based on search and category - NO LIMIT
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

    // Check if tag is selected
    const isProSelected = (tagId: string) => selectedPros.some(t => t.id === tagId);
    const isConSelected = (tagId: string) => selectedCons.some(t => t.id === tagId);

    // Get tag note
    const getProNote = (tagId: string) => selectedPros.find(t => t.id === tagId)?.note || '';
    const getConNote = (tagId: string) => selectedCons.find(t => t.id === tagId)?.note || '';

    const handleProClick = (tagId: string) => {
        if (disabled) return;
        if (isProSelected(tagId)) {
            onChange(selectedPros.filter(t => t.id !== tagId), selectedCons);
        } else if (selectedPros.length < MAX_PROS) {
            onChange([...selectedPros, { id: tagId }], selectedCons);
        }
    };

    const handleConClick = (tagId: string) => {
        if (disabled) return;
        if (isConSelected(tagId)) {
            onChange(selectedPros, selectedCons.filter(t => t.id !== tagId));
        } else if (selectedCons.length < MAX_CONS) {
            onChange(selectedPros, [...selectedCons, { id: tagId }]);
        }
    };

    // Open modal to edit note
    const openNoteModal = (tagId: string, type: 'pro' | 'con') => {
        const currentNote = type === 'pro' ? getProNote(tagId) : getConNote(tagId);
        setNoteModal({ isOpen: true, tagId, type, currentNote });
    };

    // Save note and close modal
    const saveNote = () => {
        const { tagId, type, currentNote } = noteModal;
        if (type === 'pro') {
            const updated = selectedPros.map(t =>
                t.id === tagId ? { ...t, note: currentNote.trim() || undefined } : t
            );
            onChange(updated, selectedCons);
        } else {
            const updated = selectedCons.map(t =>
                t.id === tagId ? { ...t, note: currentNote.trim() || undefined } : t
            );
            onChange(selectedPros, updated);
        }
        setNoteModal({ isOpen: false, tagId: '', type: 'pro', currentNote: '' });
    };

    return (
        <div className="space-y-6">
            {/* Note Modal */}
            {noteModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="bg-e7-dark-light rounded-xl border border-e7-gold/30 p-6 w-full max-w-md mx-4 shadow-2xl">
                        <h3 className="text-lg font-semibold text-e7-gold mb-2">
                            {t('builds.addTagNote', 'Add Note to Tag')}
                        </h3>
                        <p className="text-sm text-gray-400 mb-4">
                            {t('builds.tagNoteDescription', 'Explain why you selected this tag (optional)')}
                        </p>
                        <textarea
                            value={noteModal.currentNote}
                            onChange={(e) => setNoteModal({ ...noteModal, currentNote: e.target.value.slice(0, 200) })}
                            placeholder={t('builds.tagNotePlaceholder', 'Why this tag? (max 200 characters)')}
                            className="w-full h-24 px-4 py-3 rounded-lg bg-e7-dark/50 border border-e7-gold/20 text-white placeholder-gray-500 resize-none focus:border-e7-gold/50 focus:outline-none"
                            maxLength={200}
                        />
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-gray-500">
                                {noteModal.currentNote.length}/200
                            </span>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setNoteModal({ isOpen: false, tagId: '', type: 'pro', currentNote: '' })}
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

            {/* PROS Section */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-green-900/30 to-emerald-900/20 border border-green-500/30">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-green-400 flex items-center gap-2">
                        ✓ {t('builds.pros', 'Pros')}
                        <span className="text-sm font-normal text-green-500/70">
                            ({selectedPros.length}/{MAX_PROS})
                        </span>
                    </h3>
                </div>

                {/* Instruction message */}
                <div className="text-sm text-green-300 bg-gradient-to-r from-green-900/40 to-emerald-800/30 rounded-lg px-4 py-3 mb-4 border-2 border-green-500/30 backdrop-blur-sm">
                    <span className="font-semibold">{t('builds.clickTagForNote', 'Click on a selected tag to add a note')}</span>
                    <span className="text-gray-400 ml-2">({t('common.optional', 'optional')})</span>
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
                                {getCategoryLabel(cat.id, 'pro', locale)}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Selected Tags with notes */}
                {selectedPros.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3 p-3 bg-green-950/30 rounded-lg border border-green-500/20">
                        {selectedPros.map(tagWithNote => {
                            const tag = PROS_TAGS.find(t => t.id === tagWithNote.id);
                            if (!tag) return null;
                            return (
                                <div key={tagWithNote.id} className="flex flex-col">
                                    <button
                                        type="button"
                                        onClick={() => openNoteModal(tagWithNote.id, 'pro')}
                                        disabled={disabled}
                                        className="px-3 py-1.5 text-sm rounded-full bg-green-600/30 border border-green-500/60 text-green-300 hover:bg-green-600/50 transition-colors flex items-center gap-2"
                                        title={tagWithNote.note || t('builds.clickToAddNote', 'Click to add note')}
                                    >
                                        {getTagLabel(tag, locale)}
                                        {tagWithNote.note && <span className="text-yellow-400">📝</span>}
                                        <span
                                            className="text-green-400 hover:text-red-400 ml-1"
                                            onClick={(e) => { e.stopPropagation(); handleProClick(tagWithNote.id); }}
                                        >×</span>
                                    </button>
                                    {tagWithNote.note && (
                                        <span className="text-xs text-green-400/70 mt-1 max-w-[200px] truncate">
                                            {tagWithNote.note}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Available Tags - ALL shown with scroll */}
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 bg-e7-dark/20 rounded-lg">
                    {filteredPros.map(tag => {
                        const isSelected = isProSelected(tag.id);
                        const isDisabledTag = disabled || (!isSelected && selectedPros.length >= MAX_PROS);

                        return (
                            <button
                                key={tag.id}
                                type="button"
                                onClick={() => handleProClick(tag.id)}
                                disabled={isDisabledTag}
                                className={`px-3 py-1.5 text-sm rounded-full transition-all ${isSelected
                                    ? 'bg-green-600/40 border-2 border-green-400 text-green-200 scale-105'
                                    : isDisabledTag
                                        ? 'bg-gray-800/30 border border-gray-600/30 text-gray-500 cursor-not-allowed'
                                        : 'bg-e7-dark/30 border border-green-500/30 text-gray-300 hover:border-green-500/60 hover:text-green-300'
                                    }`}
                            >
                                {getTagLabel(tag, locale)}
                            </button>
                        );
                    })}
                    {filteredPros.length === 0 && (
                        <span className="text-sm text-gray-500 p-2">{t('common.noResults', 'No results found')}</span>
                    )}
                </div>
            </div>

            {/* CONS Section */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-red-900/30 to-rose-900/20 border border-red-500/30">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-red-400 flex items-center gap-2">
                        ✗ {t('builds.cons', 'Cons')}
                        <span className="text-sm font-normal text-red-500/70">
                            ({selectedCons.length}/{MAX_CONS})
                        </span>
                    </h3>
                </div>

                {/* Instruction message */}
                <div className="text-sm text-red-300 bg-gradient-to-r from-red-900/40 to-rose-800/30 rounded-lg px-4 py-3 mb-4 border-2 border-red-500/30 backdrop-blur-sm">
                    <span className="font-semibold">{t('builds.clickTagForNote', 'Click on a selected tag to add a note')}</span>
                    <span className="text-gray-400 ml-2">({t('common.optional', 'optional')})</span>
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
                                {getCategoryLabel(cat.id, 'con', locale)}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Selected Tags with notes */}
                {selectedCons.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3 p-3 bg-red-950/30 rounded-lg border border-red-500/20">
                        {selectedCons.map(tagWithNote => {
                            const tag = CONS_TAGS.find(t => t.id === tagWithNote.id);
                            if (!tag) return null;
                            return (
                                <div key={tagWithNote.id} className="flex flex-col">
                                    <button
                                        type="button"
                                        onClick={() => openNoteModal(tagWithNote.id, 'con')}
                                        disabled={disabled}
                                        className="px-3 py-1.5 text-sm rounded-full bg-red-600/30 border border-red-500/60 text-red-300 hover:bg-red-600/50 transition-colors flex items-center gap-2"
                                        title={tagWithNote.note || t('builds.clickToAddNote', 'Click to add note')}
                                    >
                                        {getTagLabel(tag, locale)}
                                        {tagWithNote.note && <span className="text-yellow-400">📝</span>}
                                        <span
                                            className="text-red-400 hover:text-red-200 ml-1"
                                            onClick={(e) => { e.stopPropagation(); handleConClick(tagWithNote.id); }}
                                        >×</span>
                                    </button>
                                    {tagWithNote.note && (
                                        <span className="text-xs text-red-400/70 mt-1 max-w-[200px] truncate">
                                            {tagWithNote.note}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Available Tags - ALL shown with scroll */}
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 bg-e7-dark/20 rounded-lg">
                    {filteredCons.map(tag => {
                        const isSelected = isConSelected(tag.id);
                        const isDisabledTag = disabled || (!isSelected && selectedCons.length >= MAX_CONS);

                        return (
                            <button
                                key={tag.id}
                                type="button"
                                onClick={() => handleConClick(tag.id)}
                                disabled={isDisabledTag}
                                className={`px-3 py-1.5 text-sm rounded-full transition-all ${isSelected
                                    ? 'bg-red-600/40 border-2 border-red-400 text-red-200 scale-105'
                                    : isDisabledTag
                                        ? 'bg-gray-800/30 border border-gray-600/30 text-gray-500 cursor-not-allowed'
                                        : 'bg-e7-dark/30 border border-red-500/30 text-gray-300 hover:border-red-500/60 hover:text-red-300'
                                    }`}
                            >
                                {getTagLabel(tag, locale)}
                            </button>
                        );
                    })}
                    {filteredCons.length === 0 && (
                        <span className="text-sm text-gray-500 p-2">{t('common.noResults', 'No results found')}</span>
                    )}
                </div>
            </div>
        </div>
    );
}

/**
 * ProConsDisplay - Read-only display of pros and cons with notes.
 * Shows tags in a larger, more readable format.
 */
interface ProConsDisplayProps {
    pros: TagWithNote[] | string[];
    cons: TagWithNote[] | string[];
    compact?: boolean;
}

// Helper to normalize old string[] format to TagWithNote[]
function normalizeTagsWithNotes(tags: TagWithNote[] | string[]): TagWithNote[] {
    if (!tags || tags.length === 0) return [];
    if (typeof tags[0] === 'string') {
        return (tags as string[]).map(id => ({ id }));
    }
    return tags as TagWithNote[];
}

export function ProConsDisplay({ pros, cons, compact = false }: ProConsDisplayProps) {
    const { t, locale } = useTranslations();

    const normalizedPros = normalizeTagsWithNotes(pros);
    const normalizedCons = normalizeTagsWithNotes(cons);

    // Don't render if empty
    if (normalizedPros.length === 0 && normalizedCons.length === 0) return null;

    if (compact) {
        return (
            <div className="flex flex-wrap gap-2">
                {normalizedPros.map(tagWithNote => {
                    const tag = PROS_TAGS.find(t => t.id === tagWithNote.id);
                    if (!tag) return null;
                    return (
                        <span key={tagWithNote.id} className="px-2 py-0.5 text-xs rounded-full bg-green-900/40 border border-green-500/40 text-green-300" title={tagWithNote.note}>
                            ✓ {getTagLabel(tag, locale)}
                            {tagWithNote.note && <span className="ml-1">📝</span>}
                        </span>
                    );
                })}
                {normalizedCons.map(tagWithNote => {
                    const tag = CONS_TAGS.find(t => t.id === tagWithNote.id);
                    if (!tag) return null;
                    return (
                        <span key={tagWithNote.id} className="px-2 py-0.5 text-xs rounded-full bg-red-900/40 border border-red-500/40 text-red-300" title={tagWithNote.note}>
                            ✗ {getTagLabel(tag, locale)}
                            {tagWithNote.note && <span className="ml-1">📝</span>}
                        </span>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pros */}
            {normalizedPros.length > 0 && (
                <div className="p-6 rounded-xl bg-gradient-to-br from-green-900/30 to-emerald-900/20 border border-green-500/40 shadow-lg shadow-green-500/5">
                    <h4 className="text-xl font-display text-green-400 font-semibold mb-5 flex items-center gap-2">
                        ✓ {t('builds.pros', 'Pros')}
                    </h4>
                    <div className="space-y-4">
                        {normalizedPros.map(tagWithNote => {
                            const tag = PROS_TAGS.find(t => t.id === tagWithNote.id);
                            if (!tag) return null;
                            return (
                                <div key={tagWithNote.id} className="bg-gradient-to-r from-green-900/30 to-green-800/10 rounded-lg p-4 border border-green-500/30 hover:border-green-400/50 transition-colors">
                                    <span className="text-lg font-display font-medium text-green-300">
                                        {getTagLabel(tag, locale)}
                                    </span>
                                    {tagWithNote.note && (
                                        <p className="text-sm text-gray-300 mt-3 leading-relaxed">
                                            {tagWithNote.note}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Cons */}
            {normalizedCons.length > 0 && (
                <div className="p-6 rounded-xl bg-gradient-to-br from-red-900/30 to-rose-900/20 border border-red-500/40 shadow-lg shadow-red-500/5">
                    <h4 className="text-xl font-display text-red-400 font-semibold mb-5 flex items-center gap-2">
                        ✗ {t('builds.cons', 'Cons')}
                    </h4>
                    <div className="space-y-4">
                        {normalizedCons.map(tagWithNote => {
                            const tag = CONS_TAGS.find(t => t.id === tagWithNote.id);
                            if (!tag) return null;
                            return (
                                <div key={tagWithNote.id} className="bg-gradient-to-r from-red-900/30 to-red-800/10 rounded-lg p-4 border border-red-500/30 hover:border-red-400/50 transition-colors">
                                    <span className="text-lg font-display font-medium text-red-300">
                                        {getTagLabel(tag, locale)}
                                    </span>
                                    {tagWithNote.note && (
                                        <p className="text-sm text-gray-300 mt-3 leading-relaxed">
                                            {tagWithNote.note}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
