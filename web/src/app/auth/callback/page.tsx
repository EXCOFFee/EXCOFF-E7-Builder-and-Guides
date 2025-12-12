'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function AuthCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = searchParams.get('token');
        const errorParam = searchParams.get('error');

        if (errorParam) {
            setError('Error al iniciar sesión. Por favor intenta de nuevo.');
            setTimeout(() => router.push('/login'), 3000);
            return;
        }

        if (token) {
            // Save token to localStorage
            localStorage.setItem('auth_token', token);

            // Redirect to home or previous page
            const returnUrl = localStorage.getItem('return_url') || '/';
            localStorage.removeItem('return_url');
            router.push(returnUrl);
        } else {
            setError('No se recibió token de autenticación.');
            setTimeout(() => router.push('/login'), 3000);
        }
    }, [searchParams, router]);

    if (error) {
        return (
            <div className="min-h-screen bg-e7-void flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400 text-xl mb-4">❌ {error}</p>
                    <p className="text-gray-500">Redirigiendo...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-e7-void flex items-center justify-center">
            <LoadingSpinner size="lg" text="Completando inicio de sesión..." />
        </div>
    );
}
