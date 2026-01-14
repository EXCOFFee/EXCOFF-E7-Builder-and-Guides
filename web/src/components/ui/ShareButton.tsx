'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShareModal } from './ShareModal';

interface ShareButtonProps {
    title: string;
    url: string;
    description?: string;
    className?: string;
}

export function ShareButton({ title, url, description, className = '' }: ShareButtonProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleShare = async () => {
        // Use native share on mobile if available
        if (navigator.share && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            try {
                await navigator.share({
                    title,
                    text: description || title,
                    url,
                });
                return;
            } catch (err) {
                // User cancelled or error, fall through to modal
                if ((err as Error).name === 'AbortError') return;
            }
        }

        // Desktop: show modal
        setIsOpen(true);
    };

    return (
        <>
            <Button
                variant="outline"
                onClick={handleShare}
                className={`border-e7-gold/30 text-e7-gold flex items-center gap-2 ${className}`}
                title="Share"
            >
                <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                </svg>
                <span className="hidden sm:inline">Share</span>
            </Button>

            <ShareModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title={title}
                url={url}
                description={description}
            />
        </>
    );
}

