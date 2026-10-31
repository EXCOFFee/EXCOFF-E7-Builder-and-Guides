'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from '@/hooks/useTranslations';
import { useQuery } from '@tanstack/react-query';
import { heroApi, artifactApi } from '@/lib/api';
import { HeroBanner } from '@/components/heroes/HeroBanner';
import { SET_IMAGES, formatSetName } from '@/lib/sets';
import { isLegacyTeam, type Team, type TeamBuild, type TeamHeroInfo, type TeamMode } from './teamTypes';

export type { Team, TeamHero } from './teamTypes';

/** Stats que se muestran en la tarjeta de cada héroe del equipo (si la build los tiene) */
const KEY_STATS: { key: string; label: string; percent?: boolean }[] = [
    { key: 'spd', label: 'SPD' },
    { key: 'atk', label: 'ATK' },
    { key: 'hp', label: 'HP' },
    { key: 'crit_chance', label: 'CHC', percent: true },
    { key: 'crit_dmg', label: 'CHD', percent: true },
    { key: 'eff', label: 'EFF', percent: true },
    { key: 'res', label: 'RES', percent: true },
];

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
    /** Builds de los equipos, por id (las que ya no están publicadas no vienen) */
    teamBuilds?: Record<string, TeamBuild>;
    teamHeroes?: Record<string, TeamHeroInfo>;
}

/** Un héroe del equipo con su build: banner, sets, artefacto y stats clave; lleva a la build */
function TeamSlot({ hero, build, note }: { hero?: TeamHeroInfo; build?: TeamBuild; note?: string }) {
    const { t } = useTranslations();
    const info = build?.hero ?? hero;
    const stats = KEY_STATS.filter(({ key }) => build?.min_stats?.[key] !== undefined && build?.min_stats?.[key] !== '').slice(0, 4);

    const body = (
        <>
            {info && <HeroBanner src={info.image_url} alt={info.name} element={info.element} heroClass={info.class} />}
            <div className="p-3 space-y-2">
                <p className="font-semibold text-cyan-200">{info?.name ?? '?'}</p>
                {build ? (
                    <>
                        <p className="text-xs text-gray-300 line-clamp-1">{build.title}</p>
                        <div className="flex flex-wrap items-center gap-1.5">
                            {[build.primary_set, build.secondary_set].filter((set): set is string => !!set).map((set) => (
                                <span key={set} className="flex items-center gap-1 rounded-md bg-e7-gold/15 px-1.5 py-0.5 text-[11px] text-e7-gold">
                                    {SET_IMAGES[set] && <Image src={SET_IMAGES[set]} alt="" width={16} height={16} />}
                                    {formatSetName(set)}
                                </span>
                            ))}
                            {build.artifact && <span className="text-[11px] text-amber-300">{build.artifact.name}</span>}
                        </div>
                        {stats.length > 0 && (
                            <dl className="grid grid-cols-4 gap-1 text-center">
                                {stats.map(({ key, label, percent }) => (
                                    <div key={key} className="rounded bg-e7-void/60 py-1">
                                        <dt className="text-[10px] text-gray-400">{label}</dt>
                                        <dd className="text-xs font-semibold text-white">
                                            {build.min_stats![key]}
                                            {percent ? '%' : ''}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        )}
                    </>
                ) : (
                    <p className="text-xs text-gray-400">{t('guides.teamBuildUnavailable', 'Build no longer available')}</p>
                )}
                {note && <p className="border-t border-cyan-500/10 pt-2 text-xs italic text-slate-400">&ldquo;{note}&rdquo;</p>}
            </div>
        </>
    );

    const className = 'block overflow-hidden rounded-xl border border-cyan-500/20 bg-e7-dark/50';
    return build ? (
        <Link href={`/builds/${build.id}`} className={`${className} transition-colors hover:border-cyan-400/60`}>
            {body}
        </Link>
    ) : (
        <div className={className}>{body}</div>
    );
}

/**
 * Equipos de una guía (solo lectura). Los nuevos traen cada héroe con su build; los viejos
 * (sin modo) se muestran como antes.
 */
export function TeamCompositionDisplay({ teams, teamBuilds = {}, teamHeroes = {} }: TeamCompositionDisplayProps) {
    const { t } = useTranslations();
    if (!teams || teams.length === 0) return null;

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-sans font-semibold text-cyan-300">{t('guides.teamCompositions', 'Team Compositions')}</h3>
            <div className="space-y-5">
                {teams.map((team, teamIndex) =>
                    isLegacyTeam(team) ? (
                        <LegacyTeam key={teamIndex} team={team} index={teamIndex} />
                    ) : (
                        <section key={teamIndex} className="p-5 rounded-xl bg-gradient-to-br from-cyan-900/30 to-teal-900/20 border border-cyan-500/30">
                            <div className="mb-4 flex flex-wrap items-center gap-3">
                                <h4 className="text-lg font-sans font-semibold text-cyan-200">{team.name || `${t('guides.team', 'Team')} ${teamIndex + 1}`}</h4>
                                <span className="rounded-full border border-cyan-400/40 px-2.5 py-0.5 text-xs text-cyan-200">
                                    {t(`guides.teamModes.${team.mode}`, team.mode as TeamMode)}
                                </span>
                            </div>
                            {team.note && <p className="mb-4 text-sm text-slate-300 whitespace-pre-line">{team.note}</p>}
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {team.heroes.map((hero) => (
                                    <TeamSlot
                                        key={hero.hero_id}
                                        hero={teamHeroes[hero.hero_id]}
                                        build={hero.build_id ? teamBuilds[hero.build_id] : undefined}
                                        note={hero.note}
                                    />
                                ))}
                            </div>
                        </section>
                    ),
                )}
            </div>
        </div>
    );
}

/** Equipo del formato viejo: héroes con sets/artefacto/stats sueltos */
function LegacyTeam({ team, index: teamIndex }: { team: Team; index: number }) {
    const { t } = useTranslations();

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

    return (
                    <div
                        className="p-5 rounded-xl bg-gradient-to-br from-cyan-900/30 to-teal-900/20 border border-cyan-500/30"
                    >
                        <h4 className="text-lg font-sans font-semibold text-cyan-200 mb-5">
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
                                        className="p-5 rounded-xl bg-e7-dark/50 border border-cyan-500/20 min-w-[180px] min-h-[200px] flex flex-col"
                                    >
                                        {/* Hero Image */}
                                        <div className="text-center mb-4 flex-1 flex flex-col items-center justify-center">
                                            <div className="w-[140px] h-[140px] relative mx-auto">
                                                <Image
                                                    src={heroData.image_url || `/images/hero/${heroData.slug}_su.png`}
                                                    alt={heroData.name}
                                                    fill
                                                    className="rounded-xl ring-2 ring-cyan-500/40 object-cover"
                                                    unoptimized
                                                />
                                            </div>
                                            <p className="text-base font-sans text-cyan-300 mt-3 font-medium">
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
                                                &ldquo;{teamHero.note}&rdquo;
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
    );
}
