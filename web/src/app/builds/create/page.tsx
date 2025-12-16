'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useQuery } from '@tanstack/react-query';
import { heroApi, buildApi } from '@/lib/api';
import Image from 'next/image';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const SETS = [
    'speed', 'attack', 'health', 'defense', 'critical',
    'destruction', 'counter', 'lifesteal', 'immunity',
    'rage', 'revenge', 'injury', 'penetration', 'protection',
    'unity', 'hit', 'resist', 'torrent'
];

// Set to image mapping
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

const SET_NAMES: Record<string, string> = {
    speed: 'Speed',
    attack: 'Attack',
    health: 'Health',
    defense: 'Defense',
    critical: 'Critical',
    destruction: 'Destruction',
    counter: 'Counter',
    lifesteal: 'Lifesteal',
    immunity: 'Immunity',
    rage: 'Rage',
    revenge: 'Revenge',
    injury: 'Injury',
    penetration: 'Penetration',
    protection: 'Protection',
    unity: 'Unity',
    hit: 'Hit',
    resist: 'Resist',
    torrent: 'Torrent',
};

interface Hero {
    id: number;
    name: string;
    slug: string;
    image_url?: string;
}

interface Artifact {
    id: number;
    name: string;
    code: string;
    icon?: string;
}

export default function CreateBuildPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const preselectedHeroId = searchParams.get('hero_id');
    const preselectedHeroName = searchParams.get('hero_name');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Form state
    const [heroId, setHeroId] = useState<number | null>(preselectedHeroId ? parseInt(preselectedHeroId) : null);
    const [artifactId, setArtifactId] = useState<number | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [primarySet, setPrimarySet] = useState('');
    const [secondarySet, setSecondarySet] = useState('');

    // Search states for dropdowns
    const [heroSearch, setHeroSearch] = useState('');
    const [artifactSearch, setArtifactSearch] = useState('');
    const [showHeroDropdown, setShowHeroDropdown] = useState(false);
    const [showArtifactDropdown, setShowArtifactDropdown] = useState(false);

    // Stats
    const [stats, setStats] = useState({
        atk: '',
        def: '',
        hp: '',
        spd: '',
        crit_chance: '',
        crit_dmg: '',
        eff: '',
        res: ''
    });

    // Images
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    // Check authentication
    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            localStorage.setItem('return_url', window.location.pathname + window.location.search);
            router.push('/login');
        } else {
            setIsAuthenticated(true);
        }
    }, [router]);

    // Set preselected hero
    useEffect(() => {
        if (preselectedHeroId && !heroId) {
            setHeroId(parseInt(preselectedHeroId));
        }
    }, [preselectedHeroId, heroId]);

    // Fetch heroes for selector
    const { data: heroesData } = useQuery({
        queryKey: ['heroes-list'],
        queryFn: async () => {
            const response = await heroApi.list({});
            return response.data;
        },
        enabled: isAuthenticated,
    });

    const heroes: Hero[] = heroesData?.data || [];
    const filteredHeroes = heroes.filter(h =>
        h.name.toLowerCase().includes(heroSearch.toLowerCase())
    );
    const selectedHero = heroes.find(h => h.id === heroId);

    // Fetch artifacts for selector
    const { data: artifactsData } = useQuery({
        queryKey: ['artifacts-list'],
        queryFn: async () => {
            const response = await fetch(`${API_URL}/artifacts`);
            return response.json();
        },
        enabled: isAuthenticated,
    });

    const artifacts: Artifact[] = artifactsData?.data || [];
    const filteredArtifacts = artifacts.filter(a =>
        a.name.toLowerCase().includes(artifactSearch.toLowerCase())
    );
    const selectedArtifact = artifacts.find(a => a.id === artifactId);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        const token = localStorage.getItem('auth_token');
        if (!token) {
            router.push('/login');
            return;
        }

        // Convert stats to numbers
        const minStats: Record<string, number> = {};
        Object.entries(stats).forEach(([key, value]) => {
            if (value) minStats[key] = parseInt(value);
        });

        try {
            // Use FormData to support image uploads
            const formData = new FormData();
            if (heroId) formData.append('hero_id', heroId.toString());
            formData.append('title', title);
            if (description) formData.append('description', description);
            if (primarySet) formData.append('primary_set', primarySet);
            if (secondarySet) formData.append('secondary_set', secondarySet);
            if (Object.keys(minStats).length > 0) {
                formData.append('min_stats', JSON.stringify(minStats));
            }

            // Add images
            images.forEach((image, index) => {
                formData.append(`images[${index}]`, image);
            });

            const response = await fetch(`${API_URL}/builds`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Error al crear la build');
            }

            const build = await response.json();
            // Redirect to hero page
            const selectedHero = heroes.find(h => h.id === heroId);
            if (selectedHero) {
                router.push(`/heroes/${selectedHero.slug}`);
            } else {
                router.push('/heroes');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-e7-void py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/heroes" className="text-e7-gold hover:text-e7-text-gold text-sm mb-2 inline-block">
                        ← Volver a Héroes
                    </Link>
                    <h1 className="font-display text-4xl text-e7-text-gold mb-2">Crear Nueva Build</h1>
                    <p className="text-gray-400">
                        {preselectedHeroName
                            ? `Creando build para ${decodeURIComponent(preselectedHeroName)}`
                            : 'Comparte tu configuración de equipo con la comunidad'
                        }
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card className="bg-e7-panel border-e7-gold/30">
                        <CardHeader>
                            <CardTitle className="text-e7-gold">Información de la Build</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Hero selector with search */}
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Héroe *
                                </label>
                                <div
                                    className="w-full px-4 py-2 rounded-lg bg-e7-void border border-e7-gold/30 text-white cursor-pointer flex items-center gap-2"
                                    onClick={() => setShowHeroDropdown(!showHeroDropdown)}
                                >
                                    {selectedHero ? (
                                        <>
                                            <span>{selectedHero.name}</span>
                                        </>
                                    ) : (
                                        <span className="text-gray-400">Buscar héroe...</span>
                                    )}
                                </div>
                                {showHeroDropdown && (
                                    <div className="absolute z-50 w-full mt-1 bg-e7-panel border border-e7-gold/30 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                        <Input
                                            value={heroSearch}
                                            onChange={(e) => setHeroSearch(e.target.value)}
                                            placeholder="Escribe para buscar..."
                                            className="m-2 w-[calc(100%-16px)] bg-e7-void border-e7-gold/30 text-white"
                                            autoFocus
                                        />
                                        {filteredHeroes.slice(0, 20).map((hero) => (
                                            <div
                                                key={hero.id}
                                                className="px-4 py-2 hover:bg-e7-gold/20 cursor-pointer text-white"
                                                onClick={() => {
                                                    setHeroId(hero.id);
                                                    setShowHeroDropdown(false);
                                                    setHeroSearch('');
                                                }}
                                            >
                                                {hero.name}
                                            </div>
                                        ))}
                                        {filteredHeroes.length === 0 && (
                                            <div className="px-4 py-2 text-gray-400">No se encontraron héroes</div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Artifact selector with search */}
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Artefacto (opcional)
                                </label>
                                <div
                                    className="w-full px-4 py-2 rounded-lg bg-e7-void border border-e7-gold/30 text-white cursor-pointer flex items-center gap-2"
                                    onClick={() => setShowArtifactDropdown(!showArtifactDropdown)}
                                >
                                    {selectedArtifact ? (
                                        <>
                                            <span>{selectedArtifact.name}</span>
                                        </>
                                    ) : (
                                        <span className="text-gray-400">Buscar artefacto...</span>
                                    )}
                                </div>
                                {showArtifactDropdown && (
                                    <div className="absolute z-50 w-full mt-1 bg-e7-panel border border-e7-gold/30 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                        <Input
                                            value={artifactSearch}
                                            onChange={(e) => setArtifactSearch(e.target.value)}
                                            placeholder="Escribe para buscar..."
                                            className="m-2 w-[calc(100%-16px)] bg-e7-void border-e7-gold/30 text-white"
                                            autoFocus
                                        />
                                        {filteredArtifacts.slice(0, 20).map((artifact) => (
                                            <div
                                                key={artifact.id}
                                                className="px-4 py-2 hover:bg-e7-gold/20 cursor-pointer text-white"
                                                onClick={() => {
                                                    setArtifactId(artifact.id);
                                                    setShowArtifactDropdown(false);
                                                    setArtifactSearch('');
                                                }}
                                            >
                                                {artifact.name}
                                            </div>
                                        ))}
                                        {filteredArtifacts.length === 0 && (
                                            <div className="px-4 py-2 text-gray-400">No se encontraron artefactos</div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Título de la Build *
                                </label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Ej: Build Speed DPS para RTA"
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
                                    placeholder="Explica cuándo usar esta build, contra qué equipos funciona bien, etc."
                                    rows={3}
                                    className="w-full px-4 py-2 rounded-lg bg-e7-void border border-e7-gold/30 text-white focus:border-e7-gold outline-none resize-none"
                                />
                            </div>

                            {/* Sets */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Set Principal
                                    </label>
                                    <div className="grid grid-cols-6 gap-2 p-3 bg-e7-void rounded-lg border border-e7-gold/30">
                                        {SETS.map((set) => (
                                            <button
                                                key={set}
                                                type="button"
                                                onClick={() => setPrimarySet(primarySet === set ? '' : set)}
                                                className={`relative w-10 h-10 rounded-lg transition-all ${primarySet === set
                                                    ? 'ring-2 ring-e7-gold bg-e7-gold/30 scale-110'
                                                    : 'hover:bg-e7-panel hover:scale-105 opacity-70 hover:opacity-100'
                                                    }`}
                                                title={SET_NAMES[set]}
                                            >
                                                <Image
                                                    src={SET_IMAGES[set]}
                                                    alt={SET_NAMES[set]}
                                                    width={40}
                                                    height={40}
                                                    className="w-full h-full object-contain"
                                                    unoptimized
                                                />
                                            </button>
                                        ))}
                                    </div>
                                    {primarySet && (
                                        <p className="text-sm text-e7-gold mt-1 capitalize">{SET_NAMES[primarySet]}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Set Secundario
                                    </label>
                                    <div className="grid grid-cols-6 gap-2 p-3 bg-e7-void rounded-lg border border-e7-gold/30">
                                        {SETS.map((set) => (
                                            <button
                                                key={set}
                                                type="button"
                                                onClick={() => setSecondarySet(secondarySet === set ? '' : set)}
                                                className={`relative w-10 h-10 rounded-lg transition-all ${secondarySet === set
                                                    ? 'ring-2 ring-e7-gold bg-e7-gold/30 scale-110'
                                                    : 'hover:bg-e7-panel hover:scale-105 opacity-70 hover:opacity-100'
                                                    }`}
                                                title={SET_NAMES[set]}
                                            >
                                                <Image
                                                    src={SET_IMAGES[set]}
                                                    alt={SET_NAMES[set]}
                                                    width={40}
                                                    height={40}
                                                    className="w-full h-full object-contain"
                                                    unoptimized
                                                />
                                            </button>
                                        ))}
                                    </div>
                                    {secondarySet && (
                                        <p className="text-sm text-e7-gold mt-1 capitalize">{SET_NAMES[secondarySet]}</p>
                                    )}
                                </div>
                            </div>

                            {/* Minimum Stats */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-3">
                                    Stats Mínimos Recomendados
                                </label>
                                <div className="grid grid-cols-4 gap-3">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">ATK</label>
                                        <Input
                                            type="number"
                                            value={stats.atk}
                                            onChange={(e) => setStats({ ...stats, atk: e.target.value })}
                                            placeholder="4000"
                                            className="bg-e7-void border-e7-gold/30 text-white text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">DEF</label>
                                        <Input
                                            type="number"
                                            value={stats.def}
                                            onChange={(e) => setStats({ ...stats, def: e.target.value })}
                                            placeholder="1200"
                                            className="bg-e7-void border-e7-gold/30 text-white text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">HP</label>
                                        <Input
                                            type="number"
                                            value={stats.hp}
                                            onChange={(e) => setStats({ ...stats, hp: e.target.value })}
                                            placeholder="15000"
                                            className="bg-e7-void border-e7-gold/30 text-white text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">SPD</label>
                                        <Input
                                            type="number"
                                            value={stats.spd}
                                            onChange={(e) => setStats({ ...stats, spd: e.target.value })}
                                            placeholder="250"
                                            className="bg-e7-void border-e7-gold/30 text-white text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Crit %</label>
                                        <Input
                                            type="number"
                                            value={stats.crit_chance}
                                            onChange={(e) => setStats({ ...stats, crit_chance: e.target.value })}
                                            placeholder="100"
                                            className="bg-e7-void border-e7-gold/30 text-white text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">C.Dmg %</label>
                                        <Input
                                            type="number"
                                            value={stats.crit_dmg}
                                            onChange={(e) => setStats({ ...stats, crit_dmg: e.target.value })}
                                            placeholder="300"
                                            className="bg-e7-void border-e7-gold/30 text-white text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">EFF %</label>
                                        <Input
                                            type="number"
                                            value={stats.eff}
                                            onChange={(e) => setStats({ ...stats, eff: e.target.value })}
                                            placeholder="0"
                                            className="bg-e7-void border-e7-gold/30 text-white text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">RES %</label>
                                        <Input
                                            type="number"
                                            value={stats.res}
                                            onChange={(e) => setStats({ ...stats, res: e.target.value })}
                                            placeholder="0"
                                            className="bg-e7-void border-e7-gold/30 text-white text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Images */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Imágenes de la Build (Screenshots)
                                </label>
                                <div className="border-2 border-dashed border-e7-gold/30 rounded-lg p-4 hover:border-e7-gold/50 transition-colors">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        id="build-images"
                                        onChange={(e) => {
                                            const files = Array.from(e.target.files || []);
                                            if (files.length + images.length > 5) {
                                                alert('Máximo 5 imágenes');
                                                return;
                                            }
                                            setImages([...images, ...files]);
                                            // Create previews
                                            files.forEach((file) => {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setImagePreviews((prev) => [...prev, reader.result as string]);
                                                };
                                                reader.readAsDataURL(file);
                                            });
                                        }}
                                    />
                                    <label htmlFor="build-images" className="cursor-pointer flex flex-col items-center">
                                        <span className="text-3xl mb-2">📷</span>
                                        <span className="text-gray-400 text-sm">Click para subir imágenes</span>
                                        <span className="text-gray-500 text-xs mt-1">Máximo 5 imágenes (PNG, JPG)</span>
                                    </label>
                                </div>
                                {/* Image previews */}
                                {imagePreviews.length > 0 && (
                                    <div className="grid grid-cols-5 gap-2 mt-4">
                                        {imagePreviews.map((preview, index) => (
                                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-e7-void border border-e7-gold/20">
                                                <Image
                                                    src={preview}
                                                    alt={`Preview ${index + 1}`}
                                                    fill
                                                    className="object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setImages(images.filter((_, i) => i !== index));
                                                        setImagePreviews(imagePreviews.filter((_, i) => i !== index));
                                                    }}
                                                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Error message */}
                            {error && (
                                <div className="p-4 rounded-lg bg-red-900/30 border border-red-500/50 text-red-400">
                                    {error}
                                </div>
                            )}

                            {/* Submit buttons */}
                            <div className="flex gap-4 justify-end pt-4">
                                <Link href="/heroes">
                                    <Button type="button" variant="outline" className="border-e7-gold/30 text-gray-400">
                                        Cancelar
                                    </Button>
                                </Link>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || !heroId || !title}
                                    className="bg-purple-600 text-white hover:bg-purple-700"
                                >
                                    {isSubmitting ? 'Guardando...' : 'Publicar Build'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </div>
    );
}
