'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from '@/hooks/useTranslations';
import { Input } from '@/components/ui/input';
import { buildApi } from '@/lib/api';
import { ELEMENT_IMAGES } from '@/lib/heroAssets';
import { formatSetName } from '@/lib/sets';
import { MAX_TEAMS, TEAM_MODES, isLegacyTeam, type Team, type TeamHero, type TeamMode } from './teamTypes';

export type { Team, TeamHero } from './teamTypes';

interface HeroData {
    id: number;
    name: string;
    slug: string;
    element?: string;
    image_url?: string;
}

interface TeamCompositionSelectorProps {
    teams: Team[];
    onChange: (teams: Team[]) => void;
    availableHeroes: HeroData[];
    disabled?: boolean;
}

interface PickerBuild {
    id: number;
    title: string;
    primary_set: string | null;
    secondary_set: string | null;
    likes: number;
    is_anonymous?: boolean;
    user: { name: string } | null;
}

/** Elegir la build de un héroe del equipo: cualquiera publicada de ese héroe */
function BuildPicker({ hero, value, onChange, disabled }: { hero: HeroData; value?: number; onChange: (id?: number) => void; disabled?: boolean }) {
    const { t } = useTranslations();
    const { data: builds = [], isLoading, refetch, isFetching } = useQuery({
        queryKey: ['team-build-picker', hero.slug],
        queryFn: async () => (await buildApi.getByHero(hero.slug, { per_page: 20 })).data.data as PickerBuild[],
        staleTime: 60_000,
    });

    if (isLoading) return <p className="text-xs text-gray-400">{t('common.loading', 'Loading...')}</p>;

    if (builds.length === 0) {
        return (
            <div className="text-xs text-amber-300">
                <p>{t('guides.teamNoBuilds', 'This hero has no builds yet. Create one, then reload.')}</p>
                <div className="mt-1 flex gap-3">
                    <Link href={`/builds/create?hero_id=${hero.id}`} target="_blank" className="underline hover:text-amber-200">
                        {t('guides.teamCreateBuild', 'Create build')}
                    </Link>
                    <button type="button" onClick={() => refetch()} disabled={isFetching} className="underline hover:text-amber-200 disabled:opacity-50">
                        {t('guides.teamReloadBuilds', 'Reload')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <select
            aria-label={t('guides.teamBuildFor', 'Build for {hero}').replace('{hero}', hero.name)}
            value={value ?? ''}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
            className={`w-full rounded-md border bg-e7-void px-2 py-1.5 text-xs text-white ${value ? 'border-cyan-500/40' : 'border-amber-400'}`}
        >
            <option value="">{t('guides.teamPickBuild', 'Pick a build…')}</option>
            {builds.map((build) => (
                <option key={build.id} value={build.id}>
                    {build.title}
                    {build.primary_set ? ` · ${formatSetName(build.primary_set)}` : ''}
                    {build.secondary_set ? ` + ${formatSetName(build.secondary_set)}` : ''}
                    {build.user ? ` · ${build.user.name}` : ''}
                    {` · ♥ ${build.likes ?? 0}`}
                </option>
            ))}
        </select>
    );
}

/**
 * Editor de equipos de una guía: nombre, modo (fija cuántos héroes entran), nota y, por héroe,
 * la build que usa y una nota. Los equipos viejos (sin modo) se muestran para quitarlos o
 * pasarlos al formato nuevo.
 */
export function TeamCompositionSelector({ teams, onChange, availableHeroes, disabled = false }: TeamCompositionSelectorProps) {
    const { t } = useTranslations();
    const [heroSearch, setHeroSearch] = useState('');
    const [activeTeamIndex, setActiveTeamIndex] = useState<number | null>(null);
    const [showHeroDropdown, setShowHeroDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowHeroDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const modeLabel = (mode: TeamMode) => t(`guides.teamModes.${mode}`, mode);
    const updateTeam = (index: number, patch: Partial<Team>) => onChange(teams.map((team, i) => (i === index ? { ...team, ...patch } : team)));
    const updateHero = (teamIndex: number, heroIndex: number, patch: Partial<TeamHero>) =>
        updateTeam(teamIndex, { heroes: teams[teamIndex].heroes.map((hero, i) => (i === heroIndex ? { ...hero, ...patch } : hero)) });

    const addTeam = () => {
        onChange([...teams, { name: `${t('guides.team', 'Team')} ${teams.length + 1}`, mode: 'arena', note: '', heroes: [] }]);
        setActiveTeamIndex(teams.length);
    };
    const removeTeam = (index: number) => {
        onChange(teams.filter((_, i) => i !== index));
        if (activeTeamIndex === index) setActiveTeamIndex(null);
    };
    // Un modo más chico deja afuera a los últimos héroes
    const setMode = (index: number, mode: TeamMode) => updateTeam(index, { mode, heroes: teams[index].heroes.slice(0, TEAM_MODES[mode]) });
    // Un equipo viejo pasa al formato nuevo con sus héroes; falta elegir las builds
    const convertTeam = (index: number) => {
        const team = teams[index];
        updateTeam(index, { mode: 'pve', note: '', heroes: team.heroes.slice(0, TEAM_MODES.pve).map(({ hero_id, note }) => ({ hero_id, note: note ?? '' })) });
    };
    const addHeroToTeam = (teamIndex: number, heroId: number) => {
        const team = teams[teamIndex];
        if (!team.mode || team.heroes.length >= TEAM_MODES[team.mode] || team.heroes.some((h) => h.hero_id === heroId)) return;
        updateTeam(teamIndex, { heroes: [...team.heroes, { hero_id: heroId, note: '' }] });
        setHeroSearch('');
        setShowHeroDropdown(false);
    };

    const getHeroData = (heroId: number) => availableHeroes.find((h) => h.id === heroId);
    const filteredHeroes = availableHeroes.filter((hero) => hero.name.toLowerCase().includes(heroSearch.toLowerCase()));

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h3 className="text-lg font-semibold text-cyan-300">{t('guides.teamCompositions', 'Team Compositions')}</h3>
                    <p className="text-sm text-gray-400">
                        {t('guides.teamCompositionsBuildsDesc', '(Optional) Add the teams this guide uses. Each hero is linked to a build from the site.')}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={addTeam}
                    disabled={disabled || teams.length >= MAX_TEAMS}
                    className="shrink-0 px-4 py-2 text-sm rounded-lg bg-cyan-600/30 text-cyan-300 border border-cyan-500/50 hover:bg-cyan-600/50 transition-colors disabled:opacity-50"
                >
                    + {t('guides.addTeam', 'Add Team')}
                </button>
            </div>

            {teams.length === 0 ? (
                <div className="text-center py-8 text-gray-400 border border-dashed border-e7-gold/20 rounded-lg">
                    {t('guides.noTeamsYet', 'No teams added yet. Click "Add Team" to create one.')}
                </div>
            ) : (
                <div className="space-y-4">
                    {teams.map((team, teamIndex) => {
                        if (isLegacyTeam(team)) {
                            return (
                                <div key={teamIndex} className="p-4 rounded-xl border border-dashed border-gray-500/40">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="font-semibold text-cyan-200">{team.name}</p>
                                        <button type="button" onClick={() => removeTeam(teamIndex)} disabled={disabled} className="text-red-400 hover:text-red-300 px-2" aria-label={t('guides.removeTeam', 'Remove team')}>
                                            ×
                                        </button>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-400">{team.heroes.map((h) => getHeroData(h.hero_id)?.name ?? '?').join(', ')}</p>
                                    <p className="mt-2 text-xs text-gray-400">{t('guides.teamOldFormat', 'This team uses the old format (no mode or builds). It still shows in the guide.')}</p>
                                    <button type="button" onClick={() => convertTeam(teamIndex)} disabled={disabled} className="mt-2 text-xs text-cyan-300 underline hover:text-cyan-200">
                                        {t('guides.teamConvert', 'Update it: pick a mode and builds')}
                                    </button>
                                </div>
                            );
                        }

                        const mode = team.mode as TeamMode;
                        const size = TEAM_MODES[mode];
                        return (
                            <div key={teamIndex} className="p-4 rounded-xl bg-gradient-to-br from-cyan-900/20 to-teal-900/10 border border-cyan-500/30">
                                <div className="flex items-center gap-3 mb-3">
                                    <Input
                                        type="text"
                                        value={team.name}
                                        maxLength={60}
                                        onChange={(e) => updateTeam(teamIndex, { name: e.target.value })}
                                        aria-label={t('guides.teamName', 'Team Name')}
                                        placeholder={t('guides.teamName', 'Team Name')}
                                        className="bg-e7-dark/50 border-cyan-500/30 text-cyan-300 font-semibold flex-1"
                                        disabled={disabled}
                                    />
                                    <span className="text-sm text-gray-400">{team.heroes.length}/{size}</span>
                                    <button type="button" onClick={() => removeTeam(teamIndex)} disabled={disabled} className="text-red-400 hover:text-red-300 px-2" aria-label={t('guides.removeTeam', 'Remove team')}>
                                        ×
                                    </button>
                                </div>

                                <div role="radiogroup" aria-label={t('guides.teamMode', 'Mode')} className="mb-3 flex flex-wrap gap-2">
                                    {(Object.keys(TEAM_MODES) as TeamMode[]).map((option) => (
                                        <button
                                            key={option}
                                            type="button"
                                            role="radio"
                                            aria-checked={mode === option}
                                            disabled={disabled}
                                            onClick={() => setMode(teamIndex, option)}
                                            className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${mode === option ? 'bg-cyan-500/30 text-cyan-200 border-cyan-400' : 'bg-e7-void text-gray-400 border-cyan-500/20 hover:border-cyan-500/50'}`}
                                        >
                                            {modeLabel(option)} · {TEAM_MODES[option]}
                                        </button>
                                    ))}
                                </div>

                                <textarea
                                    value={team.note ?? ''}
                                    maxLength={200}
                                    onChange={(e) => updateTeam(teamIndex, { note: e.target.value })}
                                    aria-label={t('guides.teamNote', 'How the team plays')}
                                    placeholder={t('guides.teamNotePlaceholder', 'How the team plays, turn order, what it beats… (optional)')}
                                    className="mb-3 w-full h-16 px-3 py-2 rounded-lg bg-e7-dark/50 border border-cyan-500/20 text-sm text-white placeholder-gray-400 resize-none focus:border-cyan-500/50 focus:outline-none"
                                    disabled={disabled}
                                />

                                {team.heroes.length < size && (
                                    <div className="relative mb-3" ref={activeTeamIndex === teamIndex ? dropdownRef : undefined}>
                                        <Input
                                            type="text"
                                            value={activeTeamIndex === teamIndex ? heroSearch : ''}
                                            onChange={(e) => {
                                                setHeroSearch(e.target.value);
                                                setActiveTeamIndex(teamIndex);
                                                setShowHeroDropdown(true);
                                            }}
                                            onFocus={() => {
                                                setActiveTeamIndex(teamIndex);
                                                setShowHeroDropdown(true);
                                            }}
                                            aria-label={t('guides.searchHeroToAdd', 'Search hero to add...')}
                                            placeholder={t('guides.searchHeroToAdd', 'Search hero to add...')}
                                            className="bg-e7-dark/50 border-cyan-500/20 text-white"
                                            disabled={disabled}
                                        />
                                        {showHeroDropdown && activeTeamIndex === teamIndex && filteredHeroes.length > 0 && (
                                            <div className="absolute z-40 w-full mt-1 bg-e7-dark border border-e7-gold/30 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                                {filteredHeroes.slice(0, 20).map((hero) => (
                                                    <button
                                                        key={hero.id}
                                                        type="button"
                                                        onClick={() => addHeroToTeam(teamIndex, hero.id)}
                                                        disabled={team.heroes.some((h) => h.hero_id === hero.id)}
                                                        className="w-full px-4 py-2 text-left hover:bg-e7-gold/20 flex items-center gap-3 disabled:opacity-40"
                                                    >
                                                        <Image src={hero.image_url || `/images/hero/${hero.slug}_su.png`} alt="" width={40} height={40} className="h-10 w-10 rounded-xl object-cover" unoptimized />
                                                        <span className="text-slate-200">{hero.name}</span>
                                                        {hero.element && ELEMENT_IMAGES[hero.element] && (
                                                            <Image src={ELEMENT_IMAGES[hero.element]} alt={hero.element} width={16} height={16} className="ml-auto" />
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {team.heroes.length > 0 ? (
                                    <ul className="grid gap-3 sm:grid-cols-2">
                                        {team.heroes.map((teamHero, heroIndex) => {
                                            const heroData = getHeroData(teamHero.hero_id);
                                            if (!heroData) return null;
                                            return (
                                                <li key={teamHero.hero_id} className="p-3 rounded-xl bg-e7-dark/50 border border-cyan-500/20 space-y-2">
                                                    <div className="flex items-center gap-3">
                                                        <Image src={heroData.image_url || `/images/hero/${heroData.slug}_su.png`} alt="" width={40} height={40} className="h-10 w-10 rounded-xl object-cover" unoptimized />
                                                        <span className="flex-1 font-medium text-cyan-300 truncate">{heroData.name}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => updateTeam(teamIndex, { heroes: team.heroes.filter((_, i) => i !== heroIndex) })}
                                                            disabled={disabled}
                                                            className="text-red-400 hover:text-red-300 px-1"
                                                            aria-label={t('guides.removeHeroFromTeam', 'Remove {hero}').replace('{hero}', heroData.name)}
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                    <BuildPicker hero={heroData} value={teamHero.build_id} disabled={disabled} onChange={(build_id) => updateHero(teamIndex, heroIndex, { build_id })} />
                                                    <Input
                                                        type="text"
                                                        value={teamHero.note ?? ''}
                                                        maxLength={200}
                                                        onChange={(e) => updateHero(teamIndex, heroIndex, { note: e.target.value })}
                                                        aria-label={t('guides.teamHeroNote', 'Role in the team')}
                                                        placeholder={t('guides.teamHeroNote', 'Role in the team')}
                                                        className="h-8 bg-e7-void border-cyan-500/20 text-xs text-white"
                                                        disabled={disabled}
                                                    />
                                                </li>
                                            );
                                        })}
                                    </ul>
                                ) : (
                                    <div className="text-center py-4 text-gray-400 text-sm">{t('guides.noHeroesInTeam', 'Add heroes to this team')}</div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
