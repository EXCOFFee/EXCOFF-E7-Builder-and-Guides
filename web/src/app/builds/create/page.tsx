'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { BuildForm } from '@/components/builds/BuildForm';
import { emptyBuildForm, readApiError } from '@/components/builds/buildFormModel';
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

    return (
        <div className="min-h-screen bg-e7-void py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <Link href="/heroes" className="text-e7-gold hover:text-e7-text-gold text-sm mb-2 inline-flex items-center gap-2 group transition-colors">
                        <span className="group-hover:-translate-x-1 transition-transform">←</span> {t('builds.backToHeroes', 'Back to Heroes')}
                    </Link>
                    <h1 className="font-display text-4xl text-gold-gradient tracking-wide mb-2">{t('builds.createNewBuild', 'Create New Build')}</h1>
                    <p className="text-slate-400">
                        {preselectedHeroName
                            ? `${t('builds.creatingFor', 'Creating build for')} ${preselectedHeroName}`
                            : t('builds.shareConfig', 'Share your equipment configuration with the community')}
                    </p>
                </div>

                <BuildForm
                    mode="create"
                    initialValues={emptyBuildForm(preselectedHeroId)}
                    cancelHref="/heroes"
                    onSubmit={createBuild}
                />
            </div>
        </div>
    );
}
