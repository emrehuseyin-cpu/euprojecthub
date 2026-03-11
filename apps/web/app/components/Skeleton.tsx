"use client";

import React from 'react';

export function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={`animate-pulse rounded-md bg-gray-200 skeleton ${className || ''}`}
            {...props}
        />
    );
}

export function SkeletonCard() {
    return (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <Skeleton className="w-9 h-9 rounded-xl mb-3" />
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-24" />
        </div>
    );
}

export function SkeletonRow() {
    return (
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
        </div>
    );
}
