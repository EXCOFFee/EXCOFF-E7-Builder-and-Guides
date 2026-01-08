'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useTranslations } from '@/hooks/useTranslations';
import { Input } from '@/components/ui/input';

/**
 * Hero with optional note
 */
export interface HeroWithNote {
    id: number;
    note?: string;
}

interface HeroData {
    id: number;
    name: string;
    slug: string;
    element?: string;
    image_url?: string;
}

interface HeroSelectorWithNotesProps {
    label: string;
    description?: string;
    selectedHeroes: HeroWithNote[];
    availableHeroes: HeroData[];
    onChange: (heroes: HeroWithNote[]) => void;
    type: 'synergy' | 'counter';
    maxHeroes?: number;
    disabled?: boolean;
}

const ELEMENT_IMAGES: Record<string, string> = {
    fire: '/images/elements/ElementFire.png',
    ice: '/images/elements/ElementWater.png',
    earth: '/images/elements/ElementEarth.png',
    light: '/images/elements/ElementLight.png',
    dark: '/images/elements/ElementDark.png',
};

/**
 * HeroSelectorWithNotes - Component for selecting synergy/counter heroes with optional notes
 * Features:
 * - Search dropdown for hero selection
 * - Modal popup to add notes (200 char limit)
 * - Click on selected hero to add/edit note
 */
export function HeroSelectorWithNotes({
    label,
    description,
    selectedHeroes,
    availableHeroes,
    onChange,
    type,
    maxHeroes,
    disabled = false,
}: HeroSelectorWithNotesProps) {
    const { t } = useTranslations();
    const [search, setSearch] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Modal state
    const [noteModal, setNoteModal] = useState<{
        isOpen: boolean;
        heroId: number;
        heroName: string;
        currentNote: string;
    }>({ isOpen: false, heroId: 0, heroName: '', currentNote: '' });

    const isSynergy = type === 'synergy';
    const colors = isSynergy
        ? { border: 'border-green-500/30', bg: 'from-green-900/30 to-emerald-900/20', ring: 'ring-green-500/60', text: 'text-green-300', btnBg: 'bg-green-600/30', btnBorder: 'border-green-500/60' }
        : { border: 'border-red-500/30', bg: 'from-red-900/30 to-rose-900/20', ring: 'ring-red-500/60', text: 'text-red-300', btnBg: 'bg-red-600/30', btnBorder: 'border-red-500/60' };

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filter available heroes (no limit - show all matches)
    const filteredHeroes = availableHeroes.filter(hero =>
        hero.name.toLowerCase().includes(search.toLowerCase()) &&
        !selectedHeroes.some(sh => sh.id === hero.id)
    );

    // Add hero (no limit)
    const addHero = (heroId: number) => {
        onChange([...selectedHeroes, { id: heroId }]);
        setSearch('');
        setShowDropdown(false);
    };

    // Remove hero
    const removeHero = (heroId: number) => {
        onChange(selectedHeroes.filter(h => h.id !== heroId));
    };

    // Open note modal
    const openNoteModal = (hero: HeroWithNote) => {
        const heroData = availableHeroes.find(h => h.id === hero.id);
        setNoteModal({
            isOpen: true,
            heroId: hero.id,
            heroName: heroData?.name || 'Unknown',
            currentNote: hero.note || '',
        });
    };

    // Save note
    const saveNote = () => {
        const { heroId, currentNote } = noteModal;
        const updated = selectedHeroes.map(h =>
            h.id === heroId ? { ...h, note: currentNote.trim() || undefined } : h
        );
        onChange(updated);
        setNoteModal({ isOpen: false, heroId: 0, heroName: '', currentNote: '' });
    };

    // Get hero data
    const getHeroData = (heroId: number) => availableHeroes.find(h => h.id === heroId);

    return (
        <div className={`p-5 rounded-xl bg-gradient-to-br ${colors.bg} border ${colors.border}`}>
            {/* Note Modal */}
            {noteModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="bg-e7-dark-light rounded-xl border border-e7-gold/30 p-6 w-full max-w-md mx-4 shadow-2xl">
                        <h3 className="text-lg font-semibold text-e7-gold mb-2">
                            {t('builds.addHeroNote', 'Add Note for')} {noteModal.heroName}
                        </h3>
                        <p className="text-sm text-gray-400 mb-4">
                            {isSynergy
                                ? t('builds.synergyNoteDesc', 'Explain why this hero works well (optional)')
                                : t('builds.counterNoteDesc', 'Explain why this hero is a counter (optional)')
                            }
                        </p>
                        <textarea
                            value={noteModal.currentNote}
                            onChange={(e) => setNoteModal({ ...noteModal, currentNote: e.target.value.slice(0, 200) })}
                            placeholder={t('builds.heroNotePlaceholder', 'Why this hero? (max 200 characters)')}
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
                                    onClick={() => setNoteModal({ isOpen: false, heroId: 0, heroName: '', currentNote: '' })}
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

            {/* Header */}
            <div className="mb-4">
                <label className={`block text-lg font-semibold ${colors.text} mb-1`}>
                    {label}
                    <span className="text-sm font-normal text-gray-500 ml-2">
                        ({selectedHeroes.length})
                    </span>
                </label>
                {description && (
                    <p className="text-sm text-gray-500">{description}</p>
                )}
            </div>

            {/* Instruction */}
            <div className={`text-sm ${colors.text} bg-gradient-to-r ${isSynergy ? 'from-green-900/40 to-emerald-800/30' : 'from-red-900/40 to-rose-800/30'} rounded-lg px-4 py-3 mb-4 border-2 ${colors.border} backdrop-blur-sm`}>
                <span className="font-semibold">{t('builds.clickHeroForNote', 'Click on a selected hero to add a note')}</span>
                <span className="text-gray-400 ml-2">({t('common.optional', 'optional')})</span>
            </div>

            {/* Search Input */}
            <div className="relative mb-4" ref={dropdownRef}>
                <Input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onFocus={() => setShowDropdown(true)}
                    placeholder={t('builds.searchHeroToAdd', 'Search hero to add...')}
                    disabled={disabled}
                    className={`bg-e7-dark/50 border ${colors.border} text-white`}
                />

                {showDropdown && filteredHeroes.length > 0 && (
                    <div className="absolute z-40 w-full mt-1 bg-e7-dark border border-e7-gold/30 rounded-lg shadow-xl max-h-96 overflow-y-auto">
                        {filteredHeroes.map(hero => (
                            <button
                                key={hero.id}
                                type="button"
                                onClick={() => addHero(hero.id)}
                                className="w-full px-4 py-3 text-left hover:bg-e7-gold/20 flex items-center gap-3 transition-colors"
                            >
                                <Image
                                    src={hero.image_url || `/images/hero/${hero.slug}_s.png`}
                                    alt={hero.name}
                                    width={64}
                                    height={64}
                                    className="rounded-full"
                                    unoptimized
                                />
                                <span className="text-slate-200">{hero.name}</span>
                                {hero.element && ELEMENT_IMAGES[hero.element] && (
                                    <Image
                                        src={ELEMENT_IMAGES[hero.element]}
                                        alt={hero.element}
                                        width={16}
                                        height={16}
                                        className="ml-auto"
                                    />
                                )}
                            </button>
                        ))}
                        <button
                            type="button"
                            onClick={() => setShowDropdown(false)}
                            className="w-full px-4 py-2 text-gray-500 text-sm border-t border-e7-gold/10"
                        >
                            {t('common.close', 'Close')}
                        </button>
                    </div>
                )}
            </div>

            {/* Selected Heroes */}
            {selectedHeroes.length > 0 && (
                <div className="space-y-3">
                    {selectedHeroes.map(heroWithNote => {
                        const hero = getHeroData(heroWithNote.id);
                        if (!hero) return null;

                        return (
                            <div
                                key={heroWithNote.id}
                                className={`flex items-start gap-4 p-4 rounded-xl ${colors.btnBg} border-2 ${colors.btnBorder} group hover:scale-[1.01] transition-all`}
                            >
                                <button
                                    type="button"
                                    onClick={() => openNoteModal(heroWithNote)}
                                    className="flex items-center gap-4 flex-1 text-left"
                                    title={t('builds.clickToAddNote', 'Click to add note')}
                                >
                                    <div className="relative">
                                        <Image
                                            src={hero.image_url || `/images/hero/${hero.slug}_s.png`}
                                            alt={hero.name}
                                            width={80}
                                            height={80}
                                            className={`rounded-xl ring-2 ${colors.ring} object-cover`}
                                            unoptimized
                                        />
                                        {hero.element && ELEMENT_IMAGES[hero.element] && (
                                            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-e7-dark border border-e7-gold/30 flex items-center justify-center">
                                                <Image
                                                    src={ELEMENT_IMAGES[hero.element]}
                                                    alt={hero.element}
                                                    width={16}
                                                    height={16}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className={`font-display font-semibold text-lg ${colors.text}`}>{hero.name}</span>
                                            {heroWithNote.note && <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">+{t('builds.note', 'Note')}</span>}
                                        </div>
                                        {heroWithNote.note ? (
                                            <p className="text-sm text-gray-300 mt-1 line-clamp-2">{heroWithNote.note}</p>
                                        ) : (
                                            <p className={`text-sm ${colors.text} mt-1 opacity-70 font-medium`}>{t('builds.clickToAddNote', 'Click to add note')}</p>
                                        )}
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => removeHero(heroWithNote.id)}
                                    disabled={disabled}
                                    className="text-gray-400 hover:text-red-400 text-2xl font-bold transition-colors p-2 rounded-lg hover:bg-red-500/10"
                                >
                                    ×
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Empty state */}
            {selectedHeroes.length === 0 && (
                <div className="text-center py-4 text-gray-500 text-sm">
                    {t('builds.noHeroesSelected', 'No heroes selected yet')}
                </div>
            )}
        </div>
    );
}
