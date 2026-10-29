'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { TranslationProvider } from '@/hooks/useTranslations';
import type { Locale, Messages } from '@/i18n/config';

interface ProvidersProps {
    locale: Locale;
    messages: Messages;
    children: ReactNode;
}

/**
 * App providers wrapper for React Query and Translations.
 */
export function Providers({ locale, messages, children }: ProvidersProps) {
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
            <TranslationProvider locale={locale} messages={messages}>
                {children}
            </TranslationProvider>
        </QueryClientProvider>
    );
}

