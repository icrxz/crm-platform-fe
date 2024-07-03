import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ProgressBarProvider from "./components/common/progress-bar/ProgressBarProvider";
import "./ui/global.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s | RD CRM",
    default: "RD CRM",
  },
  description: "CRM platform from RD systems",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <ProgressBarProvider>
          {children}
        </ProgressBarProvider>
      </body>
    </html>
  );
}
