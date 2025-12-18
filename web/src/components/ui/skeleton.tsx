'use client';

import React from 'react';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular';
    width?: string | number;
    height?: string | number;
}

/**
 * Skeleton loading component for better UX during data fetching
 */
export function Skeleton({
    className = '',
    variant = 'rectangular',
    width,
    height
}: SkeletonProps) {
    const baseClasses = 'animate-pulse bg-gradient-to-r from-slate-700/50 via-slate-600/50 to-slate-700/50';

    const variantClasses = {
        text: 'rounded',
        circular: 'rounded-full',
        rectangular: 'rounded-lg',
    };

    const style: React.CSSProperties = {
        width: width || '100%',
        height: height || (variant === 'text' ? '1em' : '100%'),
    };

    return (
        <div
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            style={style}
            aria-hidden="true"
        />
    );
}

/**
 * Hero card skeleton for loading states
 */
export function HeroCardSkeleton() {
    return (
        <div className="glass-panel rounded-xl overflow-hidden">
            <Skeleton className="aspect-square w-full" />
            <div className="p-4 space-y-2">
                <Skeleton variant="text" height={20} width="80%" />
                <Skeleton variant="text" height={14} width="60%" />
            </div>
        </div>
    );
}

/**
 * Grid of hero card skeletons
 */
export function HeroGridSkeleton({ count = 12 }: { count?: number }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <HeroCardSkeleton key={i} />
            ))}
        </div>
    );
}

/**
 * Build card skeleton for loading states
 */
export function BuildCardSkeleton() {
    return (
        <div className="glass-panel rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-3">
                <Skeleton variant="circular" width={48} height={48} />
                <div className="flex-1 space-y-2">
                    <Skeleton variant="text" height={18} width="70%" />
                    <Skeleton variant="text" height={14} width="40%" />
                </div>
            </div>
            <div className="flex gap-2">
                <Skeleton height={24} width={60} />
                <Skeleton height={24} width={60} />
            </div>
            <Skeleton height={60} />
        </div>
    );
}

/**
 * Grid of build card skeletons
 */
export function BuildGridSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <BuildCardSkeleton key={i} />
            ))}
        </div>
    );
}

/**
 * Table row skeleton
 */
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
    return (
        <tr className="border-b border-slate-700/50">
            {Array.from({ length: columns }).map((_, i) => (
                <td key={i} className="px-4 py-3">
                    <Skeleton variant="text" height={16} />
                </td>
            ))}
        </tr>
    );
}

/**
 * Table skeleton with multiple rows
 */
export function TableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
    return (
        <table className="w-full">
            <thead>
                <tr className="border-b border-slate-600">
                    {Array.from({ length: columns }).map((_, i) => (
                        <th key={i} className="px-4 py-3 text-left">
                            <Skeleton variant="text" height={14} width="70%" />
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {Array.from({ length: rows }).map((_, i) => (
                    <TableRowSkeleton key={i} columns={columns} />
                ))}
            </tbody>
        </table>
    );
}

/**
 * Full page loading skeleton
 */
export function PageSkeleton() {
    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            <Skeleton height={40} width="30%" />
            <Skeleton height={20} width="50%" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} height={200} />
                ))}
            </div>
        </div>
    );
}
