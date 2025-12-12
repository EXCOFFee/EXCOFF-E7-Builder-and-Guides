'use client';

export default function Loading() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-e7-void">
            {/* RasRun Video Animation */}
            <video
                autoPlay
                loop
                muted
                playsInline
                className="w-48 h-48 object-contain"
            >
                <source src="/videos/RasRun.mp4" type="video/mp4" />
            </video>
            <p className="mt-4 text-e7-gold text-xl font-display animate-pulse">
                Loading...
            </p>
        </div>
    );
}
