'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { heroApi } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const CATEGORIES = [
    { id: 'general', label: 'General', emoji: '📖' },
    { id: 'pve', label: 'PVE', emoji: '🐉' },
    { id: 'rta', label: 'RTA', emoji: '⚔️' },
    { id: 'guild_war', label: 'Guerra de Gremios', emoji: '🏰' },
    { id: 'arena', label: 'Arena', emoji: '🏆' },
];

interface Hero {
    id: number;
    name: string;
    slug: string;
}

export default function CreateGuidePage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('general');
    const [heroId, setHeroId] = useState<number | null>(null);
    const [description, setDescription] = useState('');
    const [content, setContent] = useState('');
    const [videoUrl, setVideoUrl] = useState('');

    // Get search params for pre-selection
    const searchParams = useSearchParams();
    const preselectedHeroId = searchParams.get('hero_id');
    const preselectedHeroName = searchParams.get('hero_name');

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

        try {
            const response = await fetch(`${API_URL}/guides`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title,
                    category,
                    hero_id: heroId,
                    description,
                    gameplay_content: content,
                    video_url: videoUrl || null,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Error al crear la guía');
            }

            const guide = await response.json();
            router.push(`/guides/${guide.slug}`);
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
                    <Link href="/guides" className="text-e7-gold hover:text-e7-text-gold text-sm mb-2 inline-block">
                        ← Volver a Guías
                    </Link>
                    <h1 className="font-display text-4xl text-e7-text-gold mb-2">Crear Nueva Guía</h1>
                    <p className="text-gray-400">
                        {preselectedHeroName
                            ? `Creando guía para ${decodeURIComponent(preselectedHeroName)}`
                            : 'Comparte tu conocimiento con la comunidad'
                        }
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card className="bg-e7-panel border-e7-gold/30">
                        <CardHeader>
                            <CardTitle className="text-e7-gold">Información de la Guía</CardTitle>
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
                                    placeholder="Ej: Guía completa de Arbiter Vildred para RTA"
                                    className="bg-e7-void border-e7-gold/30 text-white"
                                    required
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Categoría *
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {CATEGORIES.map((cat) => (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => setCategory(cat.id)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${category === cat.id
                                                ? 'bg-e7-gold/20 text-e7-gold border border-e7-gold'
                                                : 'bg-e7-void text-gray-400 border border-e7-gold/20 hover:border-e7-gold/50'
                                                }`}
                                        >
                                            <span className="mr-2">{cat.emoji}</span>
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Hero selector */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Héroe relacionado (opcional)
                                </label>
                                <select
                                    value={heroId || ''}
                                    onChange={(e) => setHeroId(e.target.value ? parseInt(e.target.value) : null)}
                                    className="w-full px-4 py-2 rounded-lg bg-e7-void border border-e7-gold/30 text-white focus:border-e7-gold outline-none"
                                >
                                    <option value="">Sin héroe específico</option>
                                    {heroes.map((hero) => (
                                        <option key={hero.id} value={hero.id}>
                                            {hero.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Video URL */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    URL de Video (opcional)
                                </label>
                                <Input
                                    value={videoUrl}
                                    onChange={(e) => setVideoUrl(e.target.value)}
                                    placeholder="https://youtube.com/watch?v=..."
                                    className="bg-e7-void border-e7-gold/30 text-white"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Soportamos YouTube, Twitch y Bilibili
                                </p>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Descripción breve
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Una breve descripción de lo que cubre esta guía..."
                                    rows={3}
                                    className="w-full px-4 py-2 rounded-lg bg-e7-void border border-e7-gold/30 text-white focus:border-e7-gold outline-none resize-none"
                                />
                            </div>

                            {/* Content */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Contenido de la Guía *
                                </label>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Escribe el contenido de tu guía aquí. Puedes usar formato Markdown..."
                                    rows={15}
                                    className="w-full px-4 py-2 rounded-lg bg-e7-void border border-e7-gold/30 text-white focus:border-e7-gold outline-none resize-none font-mono text-sm"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Soporta formato Markdown: **negrita**, *cursiva*, ## Títulos, - Listas
                                </p>
                            </div>

                            {/* Error message */}
                            {error && (
                                <div className="p-4 rounded-lg bg-red-900/30 border border-red-500/50 text-red-400">
                                    {error}
                                </div>
                            )}

                            {/* Submit buttons */}
                            <div className="flex gap-4 justify-end pt-4">
                                <Link href="/guides">
                                    <Button type="button" variant="outline" className="border-e7-gold/30 text-gray-400">
                                        Cancelar
                                    </Button>
                                </Link>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || !title || !content}
                                    className="bg-e7-gold text-black hover:bg-e7-text-gold"
                                >
                                    {isSubmitting ? 'Publicando...' : 'Publicar Guía'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </div>
    );
}
