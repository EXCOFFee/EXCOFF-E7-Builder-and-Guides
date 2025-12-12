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

interface Hero {
    id: number;
    name: string;
    slug: string;
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
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [primarySet, setPrimarySet] = useState('');
    const [secondarySet, setSecondarySet] = useState('');

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
            const response = await fetch(`${API_URL}/builds`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    hero_id: heroId,
                    title,
                    description,
                    primary_set: primarySet || null,
                    secondary_set: secondarySet || null,
                    min_stats: Object.keys(minStats).length > 0 ? minStats : null,
                }),
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
                            {/* Hero selector */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Héroe *
                                </label>
                                <select
                                    value={heroId || ''}
                                    onChange={(e) => setHeroId(e.target.value ? parseInt(e.target.value) : null)}
                                    className="w-full px-4 py-2 rounded-lg bg-e7-void border border-e7-gold/30 text-white focus:border-e7-gold outline-none"
                                    required
                                >
                                    <option value="">Selecciona un héroe</option>
                                    {heroes.map((hero) => (
                                        <option key={hero.id} value={hero.id}>
                                            {hero.name}
                                        </option>
                                    ))}
                                </select>
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
                                    <select
                                        value={primarySet}
                                        onChange={(e) => setPrimarySet(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg bg-e7-void border border-e7-gold/30 text-white focus:border-e7-gold outline-none capitalize"
                                    >
                                        <option value="">Ninguno</option>
                                        {SETS.map((set) => (
                                            <option key={set} value={set} className="capitalize">
                                                {set}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Set Secundario
                                    </label>
                                    <select
                                        value={secondarySet}
                                        onChange={(e) => setSecondarySet(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg bg-e7-void border border-e7-gold/30 text-white focus:border-e7-gold outline-none capitalize"
                                    >
                                        <option value="">Ninguno</option>
                                        {SETS.map((set) => (
                                            <option key={set} value={set} className="capitalize">
                                                {set}
                                            </option>
                                        ))}
                                    </select>
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
