'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';

const TOKEN_KEY = 'auth_token';

// `storage` avisa cambios desde otras pestañas; `authChange` lo dispara el login en esta.
function subscribe(onChange: () => void) {
    window.addEventListener('storage', onChange);
    window.addEventListener('authChange', onChange);
    return () => {
        window.removeEventListener('storage', onChange);
        window.removeEventListener('authChange', onChange);
    };
}

function readToken(): string | null {
    try {
        return localStorage.getItem(TOKEN_KEY);
    } catch {
        return null;
    }
}

/**
 * Token de sesión guardado en el navegador.
 * `undefined` en el servidor y durante la hidratación (todavía no se sabe), `null` sin sesión.
 */
export function useAuthToken(): string | null | undefined {
    return useSyncExternalStore(subscribe, readToken, () => undefined);
}

/**
 * Para páginas que requieren sesión: sin token guarda a dónde volver y redirige al login.
 * Devuelve true cuando hay sesión.
 */
export function useRequireAuth(): boolean {
    const token = useAuthToken();
    const router = useRouter();

    useEffect(() => {
        if (token !== null) return;
        localStorage.setItem('return_url', window.location.pathname + window.location.search);
        router.push('/login');
    }, [token, router]);

    return Boolean(token);
}
