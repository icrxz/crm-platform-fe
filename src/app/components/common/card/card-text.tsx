"use client";

import { useSnackbar } from "@/app/context/SnackbarProvider";

interface CardTextProps {
  title: string;
  text: string;
  shouldCopy?: boolean;
}

export function CardText({ title, text, shouldCopy }: CardTextProps) {
  const { showSnackbar } = useSnackbar();

  return (
    <div className="flex items-center space-x-2">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p
        className={`text-sm font-medium text-gray-900 ${shouldCopy ? "hover:cursor-pointer" : ""}`}
        onClick={(e) => {
          if (shouldCopy) {
            navigator.clipboard.writeText(e.currentTarget.innerText);
            showSnackbar("Texto copiado para a área de transferência", 'success');
          }
        }}
      >
        {text}
      </p>
    </div>
  );
}
