'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { BuildForm } from '@/components/builds/BuildForm';
import { buildToFormValues, readApiError, type ApiBuild } from '@/components/builds/buildFormModel';
import { useTranslations } from '@/hooks/useTranslations';
import { useRequireAuth } from '@/hooks/useAuth';
import { useNavigateFresh } from '@/hooks/useNavigateFresh';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function EditBuildPage() {
    const params = useParams();
    const buildId = params.id as string;
    const { t, locale } = useTranslations();
    const isAuthenticated = useRequireAuth();
    const navigateFresh = useNavigateFresh();

    const { data: build, isLoading, isError } = useQuery<ApiBuild>({
        queryKey: ['build', buildId, locale],
        queryFn: async () => {
            const response = await fetch(`${API_URL}/builds/${buildId}?lang=${locale}`);
            if (!response.ok) throw new Error('Build not found');
            return response.json();
        },
        enabled: isAuthenticated && Boolean(buildId),
    });

    const updateBuild = async (data: FormData) => {
        const response = await fetch(`${API_URL}/builds/${buildId}`, {
            method: 'POST', // multipart no admite PUT en Laravel: va con _method=PUT
            headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}`, Accept: 'application/json' },
            body: data,
        });
        if (!response.ok) throw new Error(await readApiError(response, t('builds.updateError', 'Error updating build')));
        navigateFresh(`/builds/${buildId}`);
    };

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-e7-void py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <Link href={`/builds/${buildId}`} className="text-e7-gold hover:text-e7-text-gold text-sm mb-2 inline-flex items-center gap-2 group transition-colors">
                        <span className="group-hover:-translate-x-1 transition-transform">←</span> {t('common.back', 'Back')}
                    </Link>
                    <h1 className="font-hero font-normal text-4xl text-slate-50 tracking-normal mb-2">{t('builds.editBuild', 'Edit Build')}</h1>
                    {build?.hero?.name && (
                        <p className="text-slate-400">{`${t('builds.buildFor', 'Build for')} ${build.hero.name}`}</p>
                    )}
                </div>

                {isLoading && <p className="text-e7-gold">{t('common.loading', 'Loading...')}</p>}
                {isError && <p className="text-red-400">{t('builds.notFound', 'Build not found')}</p>}

                {/* Se monta con los datos ya cargados: el estado inicial sale de la build */}
                {build && (
                    <BuildForm
                        key={build.id}
                        mode="edit"
                        initialValues={buildToFormValues(build)}
                        lockedHero={build.hero ?? null}
                        cancelHref={`/builds/${buildId}`}
                        onSubmit={updateBuild}
                    />
                )}
            </div>
        </div>
    );
}
