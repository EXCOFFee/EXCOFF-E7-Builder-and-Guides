'use client';

import { useState } from 'react';

interface StarRatingProps {
    rating: number;
    totalRatings?: number;
    userRating?: number | null;
    interactive?: boolean;
    onRate?: (rating: number) => void;
    size?: 'sm' | 'md' | 'lg';
}

export function StarRating({
    rating,
    totalRatings = 0,
    userRating = null,
    interactive = false,
    onRate,
    size = 'md',
}: StarRatingProps) {
    const [hoveredStar, setHoveredStar] = useState<number | null>(null);

    const displayRating = hoveredStar ?? userRating ?? rating;

    const sizeClasses = {
        sm: 'text-lg',
        md: 'text-2xl',
        lg: 'text-3xl',
    };

    const handleClick = (star: number) => {
        if (interactive && onRate) {
            onRate(star);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        disabled={!interactive}
                        onClick={() => handleClick(star)}
                        onMouseEnter={() => interactive && setHoveredStar(star)}
                        onMouseLeave={() => setHoveredStar(null)}
                        className={`${sizeClasses[size]} transition-all ${interactive
                                ? 'cursor-pointer hover:scale-110'
                                : 'cursor-default'
                            } ${star <= displayRating
                                ? 'text-yellow-400'
                                : 'text-gray-600'
                            }`}
                    >
                        ★
                    </button>
                ))}
            </div>

            {totalRatings > 0 && (
                <span className="text-sm text-gray-400">
                    ({rating.toFixed(1)} • {totalRatings} {totalRatings === 1 ? 'review' : 'reviews'})
                </span>
            )}

            {userRating && (
                <span className="text-xs text-e7-gold ml-2">
                    Your rating: {userRating}★
                </span>
            )}
        </div>
    );
}
