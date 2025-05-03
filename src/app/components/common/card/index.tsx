"use client";
import React from "react";

interface CardProps {
    title: string | React.ReactNode;
    titleSize?: 'sm' | 'md' | 'lg' | 'xl';
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

const cardSizes = {
    sm: "p-1",
    md: "p-1",
    lg: "p-2",
    xl: "p-4"
}

const childrenSizes = {
    sm: "mb-1",
    md: "mb-1",
    lg: "mb-2",
    xl: "mb-3"
}

export function Card({ title, titleSize = "sm", children, size = 'lg' }: CardProps) {
    return (
        <div className={`rounded-xl bg-gray-50 shadow-sm ${cardSizes[size]}`}>
            <div className={`flex ${cardSizes[size]}`}>
                {typeof title === "string" ? (
                    <p className={`ml-2 text-${titleSize} font-semibold`}>
                        {title}
                    </p>) : title}
            </div>

            <div className={`${childrenSizes[size]}`}>
                {children}
            </div>
        </div>
    );
}
