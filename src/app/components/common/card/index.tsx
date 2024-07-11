"use client";
import React from "react";

interface CardProps {
    title: string | React.ReactNode;
    titleSize?: string;
    children: React.ReactNode;
}

export function Card({ title, titleSize = "sm", children }: CardProps) {
    return (
        <div className="rounded-xl bg-gray-50 p-2 shadow-sm">
            <div className="flex p-3">
                {typeof title === "string" ? (
                    <h2 className={`ml-2 ${titleSize} font-semibold`}>
                        {title}
                    </h2>) : title}
            </div>

            <div className="mb-2">
                {children}
            </div>
        </div>
    );
}
