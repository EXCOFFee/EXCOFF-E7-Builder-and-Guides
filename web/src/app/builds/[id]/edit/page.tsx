'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const SETS = [
    'speed', 'attack', 'health', 'defense', 'critical',
    'destruction', 'counter', 'lifesteal', 'immunity',
    'rage', 'revenge', 'injury', 'penetration', 'protection',
    'unity', 'hit', 'resist', 'torrent'
];

const SET_IMAGES: Record<string, string> = {
    speed: '/images/sets/SET_Speed.png',
    attack: '/images/sets/SET_Attack.png',
    health: '/images/sets/SET_Health.png',
    defense: '/images/sets/SET_Defense.png',
    critical: '/images/sets/SET_Critical.png',
    destruction: '/images/sets/SET_Destruction.png',
    counter: '/images/sets/SET_Counter.png',
    lifesteal: '/images/sets/SET_Lifesteal.png',
    immunity: '/images/sets/SET_Immunity.png',
    rage: '/images/sets/SET_Revenge.png',
    revenge: '/images/sets/SET_Revenge.png',
    injury: '/images/sets/SET_Injury.png',
    penetration: '/images/sets/SET_Penetration.png',
    protection: '/images/sets/SET_Barrier.png',
    unity: '/images/sets/SET_Unity.png',
    hit: '/images/sets/SET_Hit.png',
    resist: '/images/sets/SET_Resist.png',
    torrent: '/images/sets/SET_Torrent.png',
};

interface Build {
    id: number;
    title: string;
    description: string;
    min_stats: Record<string, number>;
    primary_set: string;
    secondary_set: string;
    hero: {
        id: number;
        name: string;
    };
    artifact?: {
        id: number;
        name: string;
    };
}

export default function EditBuildPage() {
    const router = useRouter();
    const params = useParams();
    const buildId = params.id as string;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [primarySet, setPrimarySet] = useState('');
    const [secondarySet, setSecondarySet] = useState('');
    const [minStats, setMinStats] = useState<Record<string, number>>({
        atk: 0, def: 0, hp: 0, spd: 0, chc: 0, chd: 0, eff: 0, efr: 0
    });

    // Check authentication
    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            localStorage.setItem('return_url', window.location.pathname);
            router.push('/login');
        } else {
            setIsAuthenticated(true);
        }
    }, [router]);

    // Fetch existing build data
    const { data: buildData, isLoading } = useQuery({
        queryKey: ['build', buildId],
        queryFn: async () => {
            const response = await fetch(`${API_URL}/builds/${buildId}`);
            if (!response.ok) throw new Error('Build not found');
            return response.json();
        },
        enabled: isAuthenticated && !!buildId,
    });

    // Pre-fill form when build loads
    useEffect(() => {
        if (buildData) {
            const build = buildData as Build;
            setTitle(build.title || '');
            setDescription(build.description || '');
            setPrimarySet(build.primary_set || '');
            setSecondarySet(build.secondary_set || '');
            if (build.min_stats) {
                setMinStats(build.min_stats);
            }
        }
    }, [buildData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        const token = localStorage.getItem('auth_token');
        if (!token) {
            router.push('/login');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/builds/${buildId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title,
                    description,
                    primary_set: primarySet,
                    secondary_set: secondarySet,
                    min_stats: minStats,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Error al actualizar la build');
            }

            router.push(`/builds/${buildId}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateStat = (stat: string, value: string) => {
        setMinStats(prev => ({
            ...prev,
            [stat]: parseInt(value) || 0
        }));
    };

    if (!isAuthenticated) {
        return null;
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-e7-void py-8 px-4 flex items-center justify-center">
                <div className="text-e7-gold">Cargando...</div>
            </div>
        );
    }

    const build = buildData as Build | undefined;

    return (
        <div className="min-h-screen bg-e7-void py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link href={`/builds/${buildId}`} className="text-e7-gold hover:text-e7-text-gold text-sm mb-2 inline-block">
                        ← Volver a la Build
                    </Link>
                    <h1 className="font-display text-4xl text-e7-text-gold mb-2">Editar Build</h1>
                    <p className="text-gray-400">
                        {build?.hero?.name && `Build para ${build.hero.name}`}
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card className="bg-e7-panel border-e7-gold/30 mb-6">
                        <CardHeader>
                            <CardTitle className="text-e7-gold">Información de la Build</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Título *
                                </label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Ej: Build de Speed para RTA"
                                    className="bg-e7-void border-e7-gold/30 text-white"
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Descripción
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe para qué es esta build..."
                                    rows={4}
                                    className="w-full px-4 py-2 rounded-lg bg-e7-void border border-e7-gold/30 text-white focus:border-e7-gold outline-none resize-none"
                                />
                            </div>

                            {/* Sets */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Set Primario
                                    </label>
                                    <div className="grid grid-cols-6 gap-2">
                                        {SETS.map((set) => (
                                            <button
                                                key={set}
                                                type="button"
                                                onClick={() => setPrimarySet(set)}
                                                className={`p-2 rounded-lg border transition-all ${primarySet === set
                                                        ? 'border-purple-500 bg-purple-500/20'
                                                        : 'border-e7-gold/20 hover:border-e7-gold/50'
                                                    }`}
                                                title={set}
                                            >
                                                <Image
                                                    src={SET_IMAGES[set]}
                                                    alt={set}
                                                    width={24}
                                                    height={24}
                                                    className="mx-auto"
                                                    unoptimized
                                                />
                                            </button>
                                        ))}
                                    </div>
                                    {primarySet && (
                                        <p className="text-sm text-purple-400 mt-2 capitalize">{primarySet}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Set Secundario
                                    </label>
                                    <div className="grid grid-cols-6 gap-2">
                                        {SETS.map((set) => (
                                            <button
                                                key={set}
                                                type="button"
                                                onClick={() => setSecondarySet(set)}
                                                className={`p-2 rounded-lg border transition-all ${secondarySet === set
                                                        ? 'border-blue-500 bg-blue-500/20'
                                                        : 'border-e7-gold/20 hover:border-e7-gold/50'
                                                    }`}
                                                title={set}
                                            >
                                                <Image
                                                    src={SET_IMAGES[set]}
                                                    alt={set}
                                                    width={24}
                                                    height={24}
                                                    className="mx-auto"
                                                    unoptimized
                                                />
                                            </button>
                                        ))}
                                    </div>
                                    {secondarySet && (
                                        <p className="text-sm text-blue-400 mt-2 capitalize">{secondarySet}</p>
                                    )}
                                </div>
                            </div>

                            {/* Min Stats */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Estadísticas Mínimas
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        { key: 'atk', label: 'ATK' },
                                        { key: 'def', label: 'DEF' },
                                        { key: 'hp', label: 'HP' },
                                        { key: 'spd', label: 'SPD' },
                                        { key: 'chc', label: 'CHC %' },
                                        { key: 'chd', label: 'CHD %' },
                                        { key: 'eff', label: 'EFF %' },
                                        { key: 'efr', label: 'RES %' },
                                    ].map((stat) => (
                                        <div key={stat.key}>
                                            <label className="block text-xs text-gray-400 mb-1">{stat.label}</label>
                                            <Input
                                                type="number"
                                                value={minStats[stat.key] || 0}
                                                onChange={(e) => updateStat(stat.key, e.target.value)}
                                                className="bg-e7-void border-e7-gold/30 text-white text-center"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Error message */}
                            {error && (
                                <div className="p-4 rounded-lg bg-red-900/30 border border-red-500/50 text-red-400">
                                    {error}
                                </div>
                            )}

                            {/* Submit buttons */}
                            <div className="flex gap-4 justify-end pt-4">
                                <Link href={`/builds/${buildId}`}>
                                    <Button type="button" variant="outline" className="border-e7-gold/30 text-gray-400">
                                        Cancelar
                                    </Button>
                                </Link>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || !title}
                                    className="bg-e7-gold text-black hover:bg-e7-text-gold"
                                >
                                    {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </div>
    );
}
