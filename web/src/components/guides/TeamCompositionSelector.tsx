'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useTranslations } from '@/hooks/useTranslations';
import { Input } from '@/components/ui/input';

/**
 * Hero for team composition with optional build info
 */
export interface TeamHero {
    hero_id: number;
    sets?: string[];       // e.g., ["speed", "immunity"]
    artifact_id?: number;
    stats?: string;        // Free text e.g., "250+ Speed, 20k HP"
    note?: string;         // Build notes
}

/**
 * Team with heroes
 */
export interface Team {
    name: string;
    heroes: TeamHero[];
}

interface HeroData {
    id: number;
    name: string;
    slug: string;
    element?: string;
    image_url?: string;
}

interface ArtifactData {
    id: number;
    name: string;
    code: string;
    icon?: string;
}

interface TeamCompositionSelectorProps {
    teams: Team[];
    onChange: (teams: Team[]) => void;
    availableHeroes: HeroData[];
    availableArtifacts: ArtifactData[];
    disabled?: boolean;
}

// Common sets in Epic Seven
const AVAILABLE_SETS = [
    'speed', 'attack', 'health', 'defense', 'critical', 'destruction',
    'hit', 'resist', 'lifesteal', 'counter', 'immunity', 'rage',
    'unity', 'revenge', 'injury', 'penetration', 'torrent', 'protection'
];

const ELEMENT_IMAGES: Record<string, string> = {
    fire: '/images/elements/ElementFire.png',
    ice: '/images/elements/ElementWater.png',
    earth: '/images/elements/ElementEarth.png',
    light: '/images/elements/ElementLight.png',
    dark: '/images/elements/ElementDark.png',
};

/**
 * TeamCompositionSelector - Component for creating team compositions in guides
 * Features:
 * - Multiple teams with custom names
 * - 1-4 heroes per team
 * - Each hero can have: sets, artifact, stats (text), note
 * - All fields optional
 */
export function TeamCompositionSelector({
    teams,
    onChange,
    availableHeroes,
    availableArtifacts,
    disabled = false,
}: TeamCompositionSelectorProps) {
    const { t } = useTranslations();
    const [heroSearch, setHeroSearch] = useState('');
    const [activeTeamIndex, setActiveTeamIndex] = useState<number | null>(null);
    const [showHeroDropdown, setShowHeroDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Modal state for hero build
    const [buildModal, setBuildModal] = useState<{
        isOpen: boolean;
        teamIndex: number;
        heroIndex: number;
        hero: TeamHero;
    } | null>(null);

    // Artifact search in modal
    const [artifactSearch, setArtifactSearch] = useState('');
    const [showArtifactDropdown, setShowArtifactDropdown] = useState(false);

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowHeroDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Add new team
    const addTeam = () => {
        const newTeam: Team = {
            name: t('guides.team', 'Team') + ' ' + (teams.length + 1),
            heroes: [],
        };
        onChange([...teams, newTeam]);
        setActiveTeamIndex(teams.length);
    };

    // Remove team
    const removeTeam = (index: number) => {
        const updated = teams.filter((_, i) => i !== index);
        onChange(updated);
        if (activeTeamIndex === index) setActiveTeamIndex(null);
    };

    // Update team name
    const updateTeamName = (index: number, name: string) => {
        const updated = [...teams];
        updated[index] = { ...updated[index], name };
        onChange(updated);
    };

    // Add hero to team
    const addHeroToTeam = (teamIndex: number, heroId: number) => {
        if (teams[teamIndex].heroes.length >= 4) return;
        const updated = [...teams];
        updated[teamIndex].heroes.push({ hero_id: heroId });
        onChange(updated);
        setHeroSearch('');
        setShowHeroDropdown(false);
    };

    // Remove hero from team
    const removeHeroFromTeam = (teamIndex: number, heroIndex: number) => {
        const updated = [...teams];
        updated[teamIndex].heroes.splice(heroIndex, 1);
        onChange(updated);
    };

    // Open build modal for hero
    const openBuildModal = (teamIndex: number, heroIndex: number) => {
        setBuildModal({
            isOpen: true,
            teamIndex,
            heroIndex,
            hero: { ...teams[teamIndex].heroes[heroIndex] },
        });
        setArtifactSearch('');
    };

    // Save build modal
    const saveBuildModal = () => {
        if (!buildModal) return;
        const updated = [...teams];
        updated[buildModal.teamIndex].heroes[buildModal.heroIndex] = buildModal.hero;
        onChange(updated);
        setBuildModal(null);
    };

    // Get hero data
    const getHeroData = (heroId: number) => availableHeroes.find(h => h.id === heroId);
    const getArtifactData = (artifactId: number) => availableArtifacts.find(a => a.id === artifactId);

    // Filter heroes for search
    const filteredHeroes = availableHeroes.filter(hero =>
        hero.name.toLowerCase().includes(heroSearch.toLowerCase())
    );

    return (
        <div className="space-y-4">
            {/* Build Modal */}
            {buildModal?.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="bg-e7-dark-light rounded-xl border border-e7-gold/30 p-6 w-full max-w-lg mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold text-e7-gold mb-4 flex items-center gap-3">
                            {(() => {
                                const heroData = getHeroData(buildModal.hero.hero_id);
                                return heroData ? (
                                    <>
                                        <Image
                                            src={heroData.image_url || `/images/hero/${heroData.slug}_s.png`}
                                            alt={heroData.name}
                                            width={48}
                                            height={48}
                                            className="rounded-full"
                                            unoptimized
                                        />
                                        {t('guides.heroBuild', 'Build for')} {heroData.name}
                                    </>
                                ) : t('guides.heroBuild', 'Hero Build');
                            })()}
                        </h3>

                        {/* Sets Selection */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                {t('guides.sets', 'Sets')}
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {AVAILABLE_SETS.map(set => (
                                    <button
                                        key={set}
                                        type="button"
                                        onClick={() => {
                                            const current = buildModal.hero.sets || [];
                                            const updated = current.includes(set)
                                                ? current.filter(s => s !== set)
                                                : [...current, set];
                                            setBuildModal({
                                                ...buildModal,
                                                hero: { ...buildModal.hero, sets: updated },
                                            });
                                        }}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${(buildModal.hero.sets || []).includes(set)
                                            ? 'bg-e7-gold/30 text-e7-gold border border-e7-gold'
                                            : 'bg-e7-void text-gray-400 border border-e7-gold/20 hover:border-e7-gold/50'
                                            }`}
                                    >
                                        {t(`builds.setNames.${set}`, set)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Artifact Selection */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                {t('guides.artifact', 'Artifact')}
                            </label>
                            {buildModal.hero.artifact_id ? (
                                <div className="flex items-center gap-3 bg-amber-900/30 border border-amber-500/30 rounded-lg p-3">
                                    {(() => {
                                        const artifact = getArtifactData(buildModal.hero.artifact_id!);
                                        return artifact ? (
                                            <>
                                                <Image
                                                    src={artifact.icon || `/images/artifacts/${artifact.code}.png`}
                                                    alt={artifact.name}
                                                    width={48}
                                                    height={48}
                                                    className="rounded"
                                                    unoptimized
                                                />
                                                <span className="text-amber-300">{artifact.name}</span>
                                            </>
                                        ) : null;
                                    })()}
                                    <button
                                        type="button"
                                        onClick={() => setBuildModal({
                                            ...buildModal,
                                            hero: { ...buildModal.hero, artifact_id: undefined },
                                        })}
                                        className="ml-auto text-red-400 hover:text-red-300"
                                    >
                                        ×
                                    </button>
                                </div>
                            ) : (
                                <div className="relative">
                                    <Input
                                        type="text"
                                        value={artifactSearch}
                                        onChange={(e) => setArtifactSearch(e.target.value)}
                                        onFocus={() => setShowArtifactDropdown(true)}
                                        placeholder={t('guides.searchArtifact', 'Search artifact...')}
                                        className="bg-e7-dark/50 border-e7-gold/30 text-white"
                                    />
                                    {showArtifactDropdown && (
                                        <div className="absolute z-50 w-full mt-1 bg-e7-dark border border-e7-gold/30 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                                            {availableArtifacts
                                                .filter(a => a.name.toLowerCase().includes(artifactSearch.toLowerCase()))
                                                .slice(0, 10)
                                                .map(artifact => (
                                                    <button
                                                        key={artifact.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setBuildModal({
                                                                ...buildModal,
                                                                hero: { ...buildModal.hero, artifact_id: artifact.id },
                                                            });
                                                            setShowArtifactDropdown(false);
                                                            setArtifactSearch('');
                                                        }}
                                                        className="w-full px-4 py-2 text-left hover:bg-e7-gold/20 flex items-center gap-3"
                                                    >
                                                        <Image
                                                            src={artifact.icon || `/images/artifacts/${artifact.code}.png`}
                                                            alt={artifact.name}
                                                            width={40}
                                                            height={40}
                                                            className="rounded"
                                                            unoptimized
                                                        />
                                                        <span className="text-slate-200">{artifact.name}</span>
                                                    </button>
                                                ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Stats (free text) */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                {t('guides.stats', 'Stats')}
                                <span className="text-gray-500 text-xs ml-2">{t('guides.statsExample', '(e.g., 250+ Speed, 20k HP)')}</span>
                            </label>
                            <Input
                                type="text"
                                value={buildModal.hero.stats || ''}
                                onChange={(e) => setBuildModal({
                                    ...buildModal,
                                    hero: { ...buildModal.hero, stats: e.target.value },
                                })}
                                placeholder="250+ Speed, 20k HP, 100% crit..."
                                className="bg-e7-dark/50 border-e7-gold/30 text-white"
                            />
                        </div>

                        {/* Note */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                {t('guides.note', 'Note')}
                            </label>
                            <textarea
                                value={buildModal.hero.note || ''}
                                onChange={(e) => setBuildModal({
                                    ...buildModal,
                                    hero: { ...buildModal.hero, note: e.target.value.slice(0, 200) },
                                })}
                                placeholder={t('guides.heroNotePlaceholder', 'Role, positioning, or other notes...')}
                                className="w-full h-20 px-4 py-3 rounded-lg bg-e7-dark/50 border border-e7-gold/20 text-white placeholder-gray-500 resize-none focus:border-e7-gold/50 focus:outline-none"
                                maxLength={200}
                            />
                            <div className="text-xs text-gray-500 text-right">
                                {(buildModal.hero.note || '').length}/200
                            </div>
                        </div>

                        {/* Modal Actions */}
                        <div className="flex gap-3 justify-end">
                            <button
                                type="button"
                                onClick={() => setBuildModal(null)}
                                className="px-4 py-2 text-sm rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
                            >
                                {t('common.cancel', 'Cancel')}
                            </button>
                            <button
                                type="button"
                                onClick={saveBuildModal}
                                className="px-4 py-2 text-sm rounded-lg bg-e7-gold text-black font-semibold hover:bg-yellow-400 transition-colors"
                            >
                                {t('common.save', 'Save')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-cyan-300">
                        {t('guides.teamCompositions', 'Team Compositions')}
                    </h3>
                    <p className="text-sm text-gray-500">
                        {t('guides.teamCompositionsDesc', '(Optional) Add recommended teams for this guide')}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={addTeam}
                    disabled={disabled}
                    className="px-4 py-2 text-sm rounded-lg bg-cyan-600/30 text-cyan-300 border border-cyan-500/50 hover:bg-cyan-600/50 transition-colors disabled:opacity-50"
                >
                    + {t('guides.addTeam', 'Add Team')}
                </button>
            </div>

            {/* Teams */}
            {teams.length === 0 ? (
                <div className="text-center py-8 text-gray-500 border border-dashed border-e7-gold/20 rounded-lg">
                    {t('guides.noTeamsYet', 'No teams added yet. Click "Add Team" to create one.')}
                </div>
            ) : (
                <div className="space-y-4">
                    {teams.map((team, teamIndex) => (
                        <div
                            key={teamIndex}
                            className="p-4 rounded-xl bg-gradient-to-br from-cyan-900/20 to-teal-900/10 border border-cyan-500/30"
                        >
                            {/* Team Header */}
                            <div className="flex items-center gap-3 mb-4">
                                <Input
                                    type="text"
                                    value={team.name}
                                    onChange={(e) => updateTeamName(teamIndex, e.target.value)}
                                    placeholder={t('guides.teamName', 'Team Name')}
                                    className="bg-e7-dark/50 border-cyan-500/30 text-cyan-300 font-semibold flex-1"
                                    disabled={disabled}
                                />
                                <span className="text-sm text-gray-500">
                                    {team.heroes.length}/4
                                </span>
                                <button
                                    type="button"
                                    onClick={() => removeTeam(teamIndex)}
                                    disabled={disabled}
                                    className="text-red-400 hover:text-red-300 px-2"
                                >
                                    ×
                                </button>
                            </div>

                            {/* Hero Search */}
                            {team.heroes.length < 4 && (
                                <div className="relative mb-4" ref={activeTeamIndex === teamIndex ? dropdownRef : undefined}>
                                    <Input
                                        type="text"
                                        value={activeTeamIndex === teamIndex ? heroSearch : ''}
                                        onChange={(e) => {
                                            setHeroSearch(e.target.value);
                                            setActiveTeamIndex(teamIndex);
                                        }}
                                        onFocus={() => {
                                            setActiveTeamIndex(teamIndex);
                                            setShowHeroDropdown(true);
                                        }}
                                        placeholder={t('guides.searchHeroToAdd', 'Search hero to add...')}
                                        className="bg-e7-dark/50 border-cyan-500/20 text-white"
                                        disabled={disabled}
                                    />
                                    {showHeroDropdown && activeTeamIndex === teamIndex && filteredHeroes.length > 0 && (
                                        <div className="absolute z-40 w-full mt-1 bg-e7-dark border border-e7-gold/30 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                            {filteredHeroes.slice(0, 20).map(hero => (
                                                <button
                                                    key={hero.id}
                                                    type="button"
                                                    onClick={() => addHeroToTeam(teamIndex, hero.id)}
                                                    className="w-full px-4 py-2 text-left hover:bg-e7-gold/20 flex items-center gap-3"
                                                >
                                                    <Image
                                                        src={hero.image_url || `/images/hero/${hero.slug}_s.png`}
                                                        alt={hero.name}
                                                        width={48}
                                                        height={48}
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
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Heroes Grid */}
                            {team.heroes.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {team.heroes.map((teamHero, heroIndex) => {
                                        const heroData = getHeroData(teamHero.hero_id);
                                        if (!heroData) return null;
                                        const hasInfo = teamHero.sets?.length || teamHero.artifact_id || teamHero.stats || teamHero.note;

                                        return (
                                            <div
                                                key={heroIndex}
                                                className="relative p-4 rounded-xl bg-e7-dark/50 border border-cyan-500/20 hover:border-cyan-500/50 transition-all group min-w-[160px]"
                                            >
                                                {/* Remove button */}
                                                <button
                                                    type="button"
                                                    onClick={() => removeHeroFromTeam(teamIndex, heroIndex)}
                                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full text-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    ×
                                                </button>

                                                {/* Hero Image */}
                                                <button
                                                    type="button"
                                                    onClick={() => openBuildModal(teamIndex, heroIndex)}
                                                    className="w-full text-center"
                                                >
                                                    <Image
                                                        src={heroData.image_url || `/images/hero/${heroData.slug}_s.png`}
                                                        alt={heroData.name}
                                                        width={80}
                                                        height={80}
                                                        className="rounded-full mx-auto ring-2 ring-cyan-500/40"
                                                        unoptimized
                                                    />
                                                    <p className="text-base text-cyan-300 mt-3 font-medium truncate">
                                                        {heroData.name}
                                                    </p>
                                                    {hasInfo && (
                                                        <span className="text-yellow-400 text-sm mt-1 inline-block">📝 {t('guides.hasBuild', 'Has build')}</span>
                                                    )}
                                                    {!hasInfo && (
                                                        <span className="text-gray-500 text-sm mt-1 inline-block">{t('guides.clickToAddBuild', 'Click to add build')}</span>
                                                    )}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-4 text-gray-500 text-sm">
                                    {t('guides.noHeroesInTeam', 'Add heroes to this team')}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
