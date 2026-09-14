import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
];

// private = apenas browser, nunca CDN (seguro para rotas autenticadas)
// stale-while-revalidate = browser serve o cache stale enquanto busca fresh em background
const cacheMedium = [
  { key: 'Cache-Control', value: 'private, max-age=60, stale-while-revalidate=300' },
];

const cacheLow = [
  { key: 'Cache-Control', value: 'private, max-age=300, stale-while-revalidate=1800' },
];

const cacheDetailCase = [
  { key: 'Cache-Control', value: 'private, max-age=30, stale-while-revalidate=60' },
];

const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        hostname: 'crm-core-attachments.s3.us-east-2.amazonaws.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },

      // Páginas de média frequência (dados mudam algumas vezes por dia)
      { source: '/cases', headers: cacheMedium },
      { source: '/customers', headers: cacheMedium },
      { source: '/customers/:id', headers: cacheMedium },
      { source: '/payments', headers: cacheMedium },
      { source: '/panel', headers: cacheMedium },

      // Detalhe do case: TTL curto pois o status muda durante o fluxo de atendimento
      { source: '/cases/:caseID', headers: cacheDetailCase },

      // Páginas de baixa frequência (dados mudam raramente)
      { source: '/partners', headers: cacheLow },
      { source: '/partners/:id', headers: cacheLow },
      { source: '/contractors', headers: cacheLow },
      { source: '/contractors/:id', headers: cacheLow },
      { source: '/users', headers: cacheLow },
      { source: '/dashboards', headers: cacheLow },
      { source: '/home', headers: cacheLow },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
