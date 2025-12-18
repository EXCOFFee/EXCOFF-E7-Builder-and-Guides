'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log error to console in development
        console.error('Application error:', error);
    }, [error]);

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
            <div className="glass-panel rounded-2xl p-8 md:p-12 text-center max-w-lg">
                {/* Error icon */}
                <div className="text-7xl mb-6">💥</div>

                <h1 className="text-2xl md:text-3xl font-cinzel font-bold text-red-400 mb-4">
                    ¡Algo salió mal!
                </h1>

                <p className="text-slate-400 mb-6">
                    Ha ocurrido un error inesperado. Nuestros héroes están trabajando
                    para solucionarlo.
                </p>

                {/* Error digest for debugging */}
                {error.digest && (
                    <p className="text-xs text-slate-500 mb-6 font-mono">
                        Error ID: {error.digest}
                    </p>
                )}

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={reset}
                        className="px-6 py-3 bg-gradient-to-r from-e7-gold/20 to-amber-600/20 hover:from-e7-gold/30 hover:to-amber-600/30 text-e7-gold rounded-lg transition-all duration-300 font-medium border border-e7-gold/30"
                    >
                        🔄 Intentar de nuevo
                    </button>
                    <Link
                        href="/"
                        className="px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-slate-200 rounded-lg transition-all duration-300 font-medium border border-slate-600/30"
                    >
                        🏠 Volver al inicio
                    </Link>
                </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-500/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl"></div>
            </div>
        </div>
    );
}
