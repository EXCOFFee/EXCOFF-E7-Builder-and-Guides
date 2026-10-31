import type { Metadata } from 'next';
import { ProfileClient } from './ProfileClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    try {
        const response = await fetch(`${API_URL}/users/${id}`, { next: { revalidate: 3600 } });
        if (!response.ok) return { title: 'Player not found' };
        const user = await response.json();
        const description = `${user.name}: ${user.stats.builds} Epic Seven builds and ${user.stats.guides} guides on EXCOFF E7 HUB.`;

        return {
            title: `${user.name} | Builds and guides`,
            description,
            alternates: { canonical: './' },
            openGraph: { title: `${user.name} | EXCOFF E7 HUB`, description, type: 'profile' },
        };
    } catch {
        return { title: 'Player | EXCOFF E7 HUB' };
    }
}

export default async function UserProfilePage({ params }: PageProps) {
    const { id } = await params;
    return <ProfileClient userId={id} />;
}
