import type { Metadata } from 'next';
import ProgressBarProvider from './components/common/progress-bar/ProgressBarProvider';
import {
  SIDEBAR_COLLAPSED_CLASS,
  SIDEBAR_COLLAPSED_STORAGE_KEY,
} from './components/sidebar/constants';
import { Providers } from './providers';
import { roboto } from './ui/fonts';

import '@uppy/core/dist/style.min.css';
import '@uppy/file-input/dist/style.css';
import './ui/global.css';

export const metadata: Metadata = {
  title: {
    template: '%s | RD CRM',
    default: 'RD CRM',
  },
  description: 'CRM platform for RD systems',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={roboto.className}>
        <script
          // Runs synchronously before hydration, so a collapsed sidebar
          // renders collapsed on the very first paint instead of flashing
          // open. See the matching CSS in ui/global.css.
          dangerouslySetInnerHTML={{
            __html: `try {
              if (localStorage.getItem('${SIDEBAR_COLLAPSED_STORAGE_KEY}') === 'true') {
                document.documentElement.classList.add('${SIDEBAR_COLLAPSED_CLASS}');
              }
            } catch (e) {}`,
          }}
        />
        <Providers>
          <ProgressBarProvider>{children}</ProgressBarProvider>
        </Providers>
      </body>
    </html>
  );
}
