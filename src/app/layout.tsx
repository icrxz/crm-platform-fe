import type { Metadata } from "next";
import ProgressBarProvider from "./components/common/progress-bar/ProgressBarProvider";
import { roboto } from './ui/fonts';

import '@uppy/core/dist/style.min.css';
import '@uppy/file-input/dist/style.css';
import 'react-multi-carousel/lib/styles.css';
import "./ui/global.css";

export const metadata: Metadata = {
  title: {
    template: "%s | RD CRM",
    default: "RD CRM",
  },
  description: "CRM platform for RD systems",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={roboto.className}>
        <ProgressBarProvider>
          {children}
        </ProgressBarProvider>
      </body>
    </html>
  );
}
