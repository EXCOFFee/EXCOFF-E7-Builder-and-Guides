'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { heroApi, guideApi } from '@/lib/api';

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

interface Guide {
    id: number;
    slug: string;
    title: string;
    category: string;
    hero_id: number | null;
    description: string;
    gameplay_content: string;
    video_url: string | null;
    images: string[];
    user: { id: number; name: string };
}

export default function EditGuidePage() {
    const router = useRouter();
    const params = useParams();
    const slug = params.slug as string;

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

    // Fetch existing guide data
    const { data: guideData, isLoading: loadingGuide } = useQuery({
        queryKey: ['guide', slug],
        queryFn: async () => {
            const response = await guideApi.get(slug);
            return response.data.data || response.data;
        },
        enabled: isAuthenticated && !!slug,
    });

    // Pre-fill form when guide loads
    useEffect(() => {
        if (guideData) {
            const guide = guideData as Guide;
            setTitle(guide.title || '');
            setCategory(guide.category || 'general');
            setHeroId(guide.hero_id);
            setDescription(guide.description || '');
            setContent(guide.gameplay_content || '');
            setVideoUrl(guide.video_url || '');
        }
    }, [guideData]);

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
            const response = await fetch(`${API_URL}/guides/${slug}`, {
                method: 'PUT',
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
                throw new Error(data.message || 'Error al actualizar la guía');
            }

            const updated = await response.json();
            router.push(`/guides/${updated.slug || slug}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isAuthenticated) {
        return null;
    }

    if (loadingGuide) {
        return (
            <div className="min-h-screen bg-e7-void py-8 px-4 flex items-center justify-center">
                <div className="text-e7-gold">Cargando...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-e7-void py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link href={`/guides/${slug}`} className="text-e7-gold hover:text-e7-text-gold text-sm mb-2 inline-block">
                        ← Volver a la Guía
                    </Link>
                    <h1 className="font-display text-4xl text-e7-text-gold mb-2">Editar Guía</h1>
                    <p className="text-gray-400">Actualiza el contenido de tu guía</p>
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
                                    placeholder="Escribe el contenido de tu guía aquí..."
                                    rows={15}
                                    className="w-full px-4 py-2 rounded-lg bg-e7-void border border-e7-gold/30 text-white focus:border-e7-gold outline-none resize-none font-mono text-sm"
                                    required
                                />
                            </div>

                            {/* Error message */}
                            {error && (
                                <div className="p-4 rounded-lg bg-red-900/30 border border-red-500/50 text-red-400">
                                    {error}
                                </div>
                            )}

                            {/* Submit buttons */}
                            <div className="flex gap-4 justify-end pt-4">
                                <Link href={`/guides/${slug}`}>
                                    <Button type="button" variant="outline" className="border-e7-gold/30 text-gray-400">
                                        Cancelar
                                    </Button>
                                </Link>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || !title || !content}
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
