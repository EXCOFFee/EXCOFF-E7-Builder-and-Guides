'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { authApi } from '@/lib/api';

export default function AuthCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState<string | null>(null);
    // The code works only once: avoid a second exchange if the effect runs twice (React Strict Mode)
    const exchanged = useRef(false);

    useEffect(() => {
        const code = searchParams.get('code');
        const failWith = (message: string) => {
            setError(message);
            setTimeout(() => router.push('/login'), 3000);
        };

        if (searchParams.get('error')) {
            failWith('Error al iniciar sesión. Por favor intenta de nuevo.');
            return;
        }
        if (!code) {
            failWith('No se recibió el código de inicio de sesión.');
            return;
        }
        if (exchanged.current) return;
        exchanged.current = true;

        // Remove the code from the address bar and history before using it
        window.history.replaceState(null, '', window.location.pathname);

        authApi.exchangeCode(code)
            .then(({ data }) => {
                localStorage.setItem('auth_token', data.token);

                // Dispatch custom event to notify Navbar
                window.dispatchEvent(new Event('authChange'));

                // Redirect to home or previous page
                const returnUrl = localStorage.getItem('return_url') || '/';
                localStorage.removeItem('return_url');
                router.push(returnUrl);
            })
            .catch(() => failWith('El inicio de sesión expiró. Vuelve a intentarlo.'));
    }, [searchParams, router]);

    if (error) {
        return (
            <div className="min-h-screen bg-e7-void flex items-center justify-center">
                <div className="text-center glass-panel p-8 rounded-2xl border-red-500/30" role="alert">
                    <p className="text-red-400 text-xl mb-4">{error}</p>
                    <p className="text-slate-400">Redirigiendo...</p>
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
