'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { BuildForm } from '@/components/builds/BuildForm';
import { duplicateBuildValues, emptyBuildForm, readApiError, type ApiBuild } from '@/components/builds/buildFormModel';
import { useTranslations } from '@/hooks/useTranslations';
import { useRequireAuth } from '@/hooks/useAuth';
import { useNavigateFresh } from '@/hooks/useNavigateFresh';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function CreateBuildPage() {
    const searchParams = useSearchParams();
    const { t } = useTranslations();
    const isAuthenticated = useRequireAuth();
    const navigateFresh = useNavigateFresh();

    const preselectedHeroId = Number(searchParams.get('hero_id')) || null;
    const preselectedHeroName = searchParams.get('hero_name');
    // ?from=<id>: variante de una build (botón "Duplicar"): mismos datos, sin imágenes
    const fromId = Number(searchParams.get('from')) || null;

    const { data: source, isLoading: loadingSource, isError: sourceFailed } = useQuery<ApiBuild>({
        queryKey: ['build', String(fromId), 'duplicate'],
        queryFn: async () => {
            const response = await fetch(`${API_URL}/builds/${fromId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
            });
            if (!response.ok) throw new Error('Build not found');
            return response.json();
        },
        enabled: isAuthenticated && Boolean(fromId),
    });

    const createBuild = async (data: FormData, { heroSlug }: { heroSlug?: string }) => {
        const response = await fetch(`${API_URL}/builds`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}`, Accept: 'application/json' },
            body: data,
        });
        if (!response.ok) throw new Error(await readApiError(response, t('builds.createError', 'Error creating build')));
        navigateFresh(heroSlug ? `/heroes/${heroSlug}` : '/heroes');
    };

    if (!isAuthenticated) return null;
    if (fromId && loadingSource) {
        return <div className="min-h-screen bg-e7-void" aria-busy="true" />;
    }

    const initialValues = source
        ? duplicateBuildValues(source, t('builds.copySuffix', '(copy)'))
        : emptyBuildForm(preselectedHeroId);

    return (
        <div className="min-h-screen bg-e7-void py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <Link href="/heroes" className="text-e7-gold hover:text-e7-text-gold text-sm mb-2 inline-flex items-center gap-2 group transition-colors">
                        <span className="group-hover:-translate-x-1 transition-transform">←</span> {t('builds.backToHeroes', 'Back to Heroes')}
                    </Link>
                    <h1 className="font-hero font-normal text-4xl text-slate-50 tracking-normal mb-2">{t('builds.createNewBuild', 'Create New Build')}</h1>
                    {sourceFailed && (
                        <p role="alert" className="mb-2 text-sm text-amber-300">
                            {t('builds.duplicateFailed', 'The build to duplicate couldn’t be loaded (it may have been deleted). You can start a new one here.')}
                        </p>
                    )}
                    <p className="text-slate-400">
                        {source
                            ? t('builds.duplicatingFrom', 'Variant of “{title}”: change what you need and publish it as a new build.').replace('{title}', source.title)
                            : preselectedHeroName
                                ? `${t('builds.creatingFor', 'Creating build for')} ${preselectedHeroName}`
                                : t('builds.shareConfig', 'Share your equipment configuration with the community')}
                    </p>
                </div>

                <BuildForm
                    mode="create"
                    initialValues={initialValues}
                    cancelHref="/heroes"
                    onSubmit={createBuild}
                />
            </div>
        </div>
    );
}
