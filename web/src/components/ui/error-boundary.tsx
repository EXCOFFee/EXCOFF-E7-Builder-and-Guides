'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

/**
 * Error Boundary component to catch and handle errors gracefully
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Error caught by ErrorBoundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                    <div className="glass-panel rounded-xl p-8 max-w-md">
                        <div className="text-6xl mb-4">⚠️</div>
                        <h2 className="text-xl font-bold text-e7-gold mb-2">
                            Algo salió mal
                        </h2>
                        <p className="text-slate-400 mb-4">
                            Ha ocurrido un error inesperado. Por favor, intenta recargar la página.
                        </p>
                        <button
                            onClick={() => this.setState({ hasError: false })}
                            className="px-4 py-2 bg-e7-gold/20 hover:bg-e7-gold/30 text-e7-gold rounded-lg transition-colors"
                        >
                            Intentar de nuevo
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * Error message component for API errors
 */
export function ErrorMessage({
    message = 'Ha ocurrido un error',
    onRetry
}: {
    message?: string;
    onRetry?: () => void;
}) {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="text-4xl mb-3">😵</div>
            <p className="text-slate-400 mb-4">{message}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="px-4 py-2 bg-e7-gold/20 hover:bg-e7-gold/30 text-e7-gold rounded-lg transition-colors"
                >
                    Reintentar
                </button>
            )}
        </div>
    );
}

/**
 * Empty state component for when no data is available
 */
export function EmptyState({
    title = 'No hay datos',
    description = 'No se encontraron resultados.',
    icon = '📭'
}: {
    title?: string;
    description?: string;
    icon?: string;
}) {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="text-5xl mb-3">{icon}</div>
            <h3 className="text-lg font-semibold text-slate-300 mb-1">{title}</h3>
            <p className="text-slate-500">{description}</p>
        </div>
    );
}
