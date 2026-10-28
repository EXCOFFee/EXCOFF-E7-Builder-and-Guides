'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Navega después de crear, editar o borrar algo, con los datos al día.
 * Reemplaza a `window.location.href = ...`, que recargaba toda la página solo para eso:
 * marca todas las consultas como desactualizadas (sin volver a pedir las de la página actual)
 * y la página de destino las vuelve a pedir al montarse.
 */
export function useNavigateFresh() {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useCallback(
        (href: string) => {
            queryClient.invalidateQueries({ refetchType: 'none' });
            router.push(href);
        },
        [queryClient, router]
    );
}
