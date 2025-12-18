'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
            <div className="glass-panel rounded-2xl p-8 md:p-12 text-center max-w-lg">
                {/* Epic Seven styled 404 */}
                <div className="relative mb-6">
                    <span className="text-8xl md:text-9xl font-bold bg-gradient-to-br from-e7-gold via-amber-400 to-e7-gold bg-clip-text text-transparent">
                        404
                    </span>
                </div>

                <h1 className="text-2xl md:text-3xl font-cinzel font-bold text-e7-gold mb-4">
                    Página no encontrada
                </h1>

                <p className="text-slate-400 mb-8">
                    Parece que este héroe se perdió en el Laberinto de Azmakalis.
                    La página que buscas no existe o fue movida.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/"
                        className="px-6 py-3 bg-gradient-to-r from-e7-gold/20 to-amber-600/20 hover:from-e7-gold/30 hover:to-amber-600/30 text-e7-gold rounded-lg transition-all duration-300 font-medium border border-e7-gold/30"
                    >
                        🏠 Volver al inicio
                    </Link>
                    <Link
                        href="/heroes"
                        className="px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-slate-200 rounded-lg transition-all duration-300 font-medium border border-slate-600/30"
                    >
                        ⚔️ Ver héroes
                    </Link>
                </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-e7-gold/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
            </div>
        </div>
    );
}
