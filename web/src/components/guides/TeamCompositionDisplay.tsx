'use client';

import Image from 'next/image';
import { useTranslations } from '@/hooks/useTranslations';
import { useQuery } from '@tanstack/react-query';
import { heroApi, artifactApi } from '@/lib/api';

/**
 * Hero in a team composition
 */
export interface TeamHero {
    hero_id: number;
    sets?: string[];
    artifact_id?: number;
    stats?: string;
    note?: string;
}

/**
 * Team composition
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

interface TeamCompositionDisplayProps {
    teams: Team[];
}

/**
 * TeamCompositionDisplay - Read-only display of team compositions in guides
 */
export function TeamCompositionDisplay({ teams }: TeamCompositionDisplayProps) {
    const { t } = useTranslations();

    // Fetch heroes and artifacts data
    const { data: heroesData } = useQuery({
        queryKey: ['heroes-list'],
        queryFn: async () => {
            const response = await heroApi.list({});
            return response.data;
        },
    });

    const { data: artifactsData } = useQuery({
        queryKey: ['artifacts-list'],
        queryFn: async () => {
            const response = await artifactApi.list();
            return response.data;
        },
    });

    const heroes: HeroData[] = heroesData?.data || [];
    const artifacts: ArtifactData[] = artifactsData?.data || [];

    const getHeroData = (heroId: number) => heroes.find(h => h.id === heroId);
    const getArtifactData = (artifactId: number) => artifacts.find(a => a.id === artifactId);

    if (!teams || teams.length === 0) {
        return null;
    }

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-display font-semibold text-cyan-300">
                {t('guides.teamCompositions', 'Team Compositions')}
            </h3>

            <div className="space-y-5">
                {teams.map((team, teamIndex) => (
                    <div
                        key={teamIndex}
                        className="p-5 rounded-xl bg-gradient-to-br from-cyan-900/30 to-teal-900/20 border border-cyan-500/30"
                    >
                        <h4 className="text-lg font-display font-semibold text-cyan-200 mb-5">
                            {team.name || `${t('guides.team', 'Team')} ${teamIndex + 1}`}
                        </h4>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                            {team.heroes.map((teamHero, heroIndex) => {
                                const heroData = getHeroData(teamHero.hero_id);
                                if (!heroData) return null;
                                const artifactData = teamHero.artifact_id ? getArtifactData(teamHero.artifact_id) : null;

                                return (
                                    <div
                                        key={heroIndex}
                                        className="p-4 rounded-xl bg-e7-dark/50 border border-cyan-500/20 min-w-[160px]"
                                    >
                                        {/* Hero Image */}
                                        <div className="text-center mb-4">
                                            <Image
                                                src={heroData.image_url || `/images/hero/${heroData.slug}_s.png`}
                                                alt={heroData.name}
                                                width={120}
                                                height={120}
                                                className="rounded-xl mx-auto ring-2 ring-cyan-500/40 object-cover"
                                                unoptimized
                                            />
                                            <p className="text-base font-display text-cyan-300 mt-3 font-medium">
                                                {heroData.name}
                                            </p>
                                        </div>

                                        {/* Sets */}
                                        {teamHero.sets && teamHero.sets.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 justify-center mb-3">
                                                {teamHero.sets.map((set, i) => (
                                                    <span
                                                        key={i}
                                                        className="px-2 py-1 text-xs rounded-lg bg-e7-gold/20 text-e7-gold capitalize"
                                                    >
                                                        {t(`builds.setNames.${set}`, set)}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Artifact */}
                                        {artifactData && (
                                            <div className="flex items-center justify-center gap-2 mb-3">
                                                <Image
                                                    src={artifactData.icon || `/images/artifacts/${artifactData.code}.png`}
                                                    alt={artifactData.name}
                                                    width={36}
                                                    height={36}
                                                    className="rounded"
                                                    unoptimized
                                                />
                                                <span className="text-sm text-amber-300 truncate max-w-24">
                                                    {artifactData.name}
                                                </span>
                                            </div>
                                        )}

                                        {/* Stats */}
                                        {teamHero.stats && (
                                            <p className="text-sm text-gray-400 text-center mb-2">
                                                {teamHero.stats}
                                            </p>
                                        )}

                                        {/* Note */}
                                        {teamHero.note && (
                                            <p className="text-sm text-slate-400 text-center italic mt-3 border-t border-cyan-500/10 pt-3">
                                                "{teamHero.note}"
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
