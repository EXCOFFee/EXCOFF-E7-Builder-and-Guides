'use client';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    text?: string;
}

export function LoadingSpinner({ size = 'md', text }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'w-16 h-16',
        md: 'w-32 h-32',
        lg: 'w-48 h-48',
    };

    return (
        <div className="flex flex-col items-center justify-center gap-4">
            <video
                autoPlay
                loop
                muted
                playsInline
                className={`${sizeClasses[size]} object-contain`}
            >
                <source src="/videos/RasRun.mp4" type="video/mp4" />
            </video>
            {text && (
                <p className="text-e7-gold font-display animate-pulse">
                    {text}
                </p>
            )}
        </div>
    );
}
