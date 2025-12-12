'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { TranslationProvider } from '@/hooks/useTranslations';

interface ProvidersProps {
    children: ReactNode;
}

/**
 * App providers wrapper for React Query and Translations.
 */
export function Providers({ children }: ProvidersProps) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000, // 1 minute
                        refetchOnWindowFocus: false,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            <TranslationProvider>
                {children}
            </TranslationProvider>
        </QueryClientProvider>
    );
}

