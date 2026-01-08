'use client';

import { useState } from 'react';
import { useTranslations } from '@/hooks/useTranslations';

/**
 * Tier Rating Categories - matches backend enum (KISS: simple constants)
 */
export const TIER_CATEGORIES = ['pve', 'arena', 'gw', 'rta'] as const;
export type TierCategory = typeof TIER_CATEGORIES[number];

/**
 * Tier values (D=1 to S=5) - SRP: single source of truth for tier mapping
 */
export const TIER_VALUES = {
    D: 1,
    C: 2,
    B: 3,
    A: 4,
    S: 5,
} as const;

export type TierLetter = keyof typeof TIER_VALUES;
export type TierValue = typeof TIER_VALUES[TierLetter];

/**
 * Convert numeric tier to letter grade (DRY: matches backend logic)
 */
export function tierToLetter(tier: number | null | undefined): TierLetter | null {
    switch (tier) {
        case 5: return 'S';
        case 4: return 'A';
        case 3: return 'B';
        case 2: return 'C';
        case 1: return 'D';
        default: return null;
    }
}

/**
 * Calculate general tier from individual ratings (DRY: matches backend logic)
 */
export function calculateGeneralTier(ratings: Partial<Record<TierCategory, number | null>>): TierLetter | null {
    const values = TIER_CATEGORIES
        .map(cat => ratings[cat])
        .filter((v): v is number => v !== null && v !== undefined);

    if (values.length === 0) return null;

    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return tierToLetter(Math.round(avg));
}

/**
 * Color mapping for each tier - single responsibility
 */
const TIER_COLORS: Record<TierLetter, { bg: string; text: string; border: string; hover: string }> = {
    S: { bg: 'bg-gradient-to-br from-yellow-500/30 to-amber-500/20', text: 'text-yellow-300', border: 'border-yellow-500/60', hover: 'hover:border-yellow-400' },
    A: { bg: 'bg-gradient-to-br from-purple-500/30 to-violet-500/20', text: 'text-purple-300', border: 'border-purple-500/60', hover: 'hover:border-purple-400' },
    B: { bg: 'bg-gradient-to-br from-blue-500/30 to-cyan-500/20', text: 'text-blue-300', border: 'border-blue-500/60', hover: 'hover:border-blue-400' },
    C: { bg: 'bg-gradient-to-br from-green-500/30 to-emerald-500/20', text: 'text-green-300', border: 'border-green-500/60', hover: 'hover:border-green-400' },
    D: { bg: 'bg-gradient-to-br from-gray-500/30 to-slate-500/20', text: 'text-gray-300', border: 'border-gray-500/60', hover: 'hover:border-gray-400' },
};

interface TierRatingSelectorProps {
    ratings: Partial<Record<TierCategory, number | null>>;
    reasons?: Partial<Record<TierCategory, string>>;
    onChange: (ratings: Partial<Record<TierCategory, number | null>>, reasons?: Partial<Record<TierCategory, string>>) => void;
    showReasons?: boolean;
    disabled?: boolean;
}

/**
 * TierRatingSelector - Component for selecting D-S ratings for each category.
 * Features:
 * - Larger textarea for reasons (instead of input)
 * - Better visibility for text entry
 */
export function TierRatingSelector({
    ratings,
    reasons = {},
    onChange,
    showReasons = true,
    disabled = false,
}: TierRatingSelectorProps) {
    const { t } = useTranslations();

    const handleRatingChange = (category: TierCategory, value: number | null) => {
        onChange({ ...ratings, [category]: value }, reasons);
    };

    const handleReasonChange = (category: TierCategory, value: string) => {
        onChange(ratings, { ...reasons, [category]: value });
    };

    const generalTier = calculateGeneralTier(ratings);

    return (
        <div className="space-y-4">
            {/* Header with General Rating */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-e7-gold">
                    {t('builds.tierRatings', 'Tier Ratings')}
                </h3>
                {generalTier && (
                    <div className={`px-5 py-3 rounded-lg font-bold text-2xl ${TIER_COLORS[generalTier].bg} ${TIER_COLORS[generalTier].text} ${TIER_COLORS[generalTier].border} border`}>
                        {t('builds.general', 'General')}: {generalTier}
                    </div>
                )}
            </div>

            {/* Category Ratings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {TIER_CATEGORIES.map((category) => (
                    <div key={category} className="p-5 rounded-xl bg-e7-void/50 border border-e7-gold/20">
                        {/* Category Label */}
                        <label className="block text-sm font-medium text-gray-300 mb-3 uppercase tracking-wider">
                            {t(`builds.tier_${category}`, category.toUpperCase())}
                        </label>

                        {/* Tier Buttons */}
                        <div className="flex gap-2 mb-3">
                            {(['D', 'C', 'B', 'A', 'S'] as TierLetter[]).map((tier) => {
                                const isSelected = ratings[category] === TIER_VALUES[tier];
                                const colors = TIER_COLORS[tier];

                                return (
                                    <button
                                        key={tier}
                                        type="button"
                                        onClick={() => handleRatingChange(category, isSelected ? null : TIER_VALUES[tier])}
                                        disabled={disabled}
                                        className={`
                                            w-14 h-14 rounded-lg font-bold text-xl transition-all duration-200
                                            ${isSelected
                                                ? `${colors.bg} ${colors.text} ${colors.border} border-2 scale-110 shadow-lg`
                                                : `bg-e7-panel/50 text-gray-400 border border-white/10 ${colors.hover}`
                                            }
                                            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                        `}
                                    >
                                        {tier}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Reason Textarea - LARGER */}
                        {showReasons && (
                            <textarea
                                value={reasons[category] || ''}
                                onChange={(e) => handleReasonChange(category, e.target.value)}
                                placeholder={t('builds.tierReasonPlaceholder', 'Why this rating? (optional)')}
                                disabled={disabled}
                                maxLength={255}
                                rows={3}
                                className="w-full px-4 py-3 text-sm rounded-lg bg-e7-dark/50 border border-e7-gold/20 text-white placeholder-gray-500 focus:border-e7-gold/50 focus:outline-none resize-none"
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

/**
 * TierRatingDisplay - Read-only display of tier ratings.
 * Features:
 * - Larger text for readability
 * - Full text display (no truncation)
 * - Expandable reasons
 */
interface TierRatingDisplayProps {
    ratings: Partial<Record<TierCategory, number | null>>;
    reasons?: Partial<Record<TierCategory, string>>;
    compact?: boolean;
}

export function TierRatingDisplay({ ratings, reasons = {}, compact = false }: TierRatingDisplayProps) {
    const { t } = useTranslations();
    const [expandedReasons, setExpandedReasons] = useState<Record<string, boolean>>({});
    const generalTier = calculateGeneralTier(ratings);

    // Don't render if no ratings
    const hasRatings = TIER_CATEGORIES.some(cat => ratings[cat] !== null && ratings[cat] !== undefined);
    if (!hasRatings) return null;

    const toggleExpand = (category: string) => {
        setExpandedReasons(prev => ({ ...prev, [category]: !prev[category] }));
    };

    if (compact) {
        // Compact mode: single row with all ratings
        return (
            <div className="flex flex-wrap gap-2">
                {generalTier && (
                    <div className={`px-2 py-1 rounded-md text-sm font-bold ${TIER_COLORS[generalTier].bg} ${TIER_COLORS[generalTier].text} ${TIER_COLORS[generalTier].border} border`}>
                        {generalTier}
                    </div>
                )}
                {TIER_CATEGORIES.map((category) => {
                    const tier = tierToLetter(ratings[category]);
                    if (!tier) return null;

                    return (
                        <div key={category} className="flex items-center gap-1 text-xs text-gray-400">
                            <span className="uppercase">{category}:</span>
                            <span className={`font-bold ${TIER_COLORS[tier].text}`}>{tier}</span>
                        </div>
                    );
                })}
            </div>
        );
    }

    // Full mode: detailed display with expandable reasons
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-e7-gold">
                    {t('builds.tierRatings', 'Tier Ratings')}
                </h3>
                {generalTier && (
                    <div className={`px-4 py-2 rounded-lg font-bold text-2xl ${TIER_COLORS[generalTier].bg} ${TIER_COLORS[generalTier].text} ${TIER_COLORS[generalTier].border} border-2`}>
                        {generalTier}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {TIER_CATEGORIES.map((category) => {
                    const tier = tierToLetter(ratings[category]);
                    if (!tier) return null;
                    const colors = TIER_COLORS[tier];
                    const reason = reasons[category];
                    const isLong = reason && reason.length > 80;
                    const isExpanded = expandedReasons[category];

                    return (
                        <div key={category} className={`p-4 rounded-xl ${colors.bg} ${colors.border} border`}>
                            <div className="text-sm text-gray-400 uppercase tracking-wider mb-2">
                                {t(`builds.tier_${category}`, category.toUpperCase())}
                            </div>
                            <div className={`text-3xl font-bold ${colors.text} mb-2`}>{tier}</div>
                            {reason && (
                                <div className="text-sm text-gray-200 leading-relaxed">
                                    {isLong && !isExpanded ? (
                                        <>
                                            {reason.slice(0, 80)}...
                                            <button
                                                onClick={() => toggleExpand(category)}
                                                className="text-e7-gold hover:underline ml-1"
                                            >
                                                {t('common.showMore', 'Show more')}
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            {reason}
                                            {isLong && (
                                                <button
                                                    onClick={() => toggleExpand(category)}
                                                    className="text-e7-gold hover:underline ml-1 block mt-1"
                                                >
                                                    {t('common.showLess', 'Show less')}
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
