import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
  output: 'standalone',
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      'recharts',
      'react-markdown',
      'framer-motion',
      '@tanstack/react-query',
    ],
  },
  async redirects() {
    return [
      { source: '/projeler', destination: '/projects', permanent: true },
      { source: '/projeler/yeni', destination: '/projects/new', permanent: true },
      { source: '/projeler/:id', destination: '/projects/:id', permanent: true },
      { source: '/ortaklar', destination: '/partners', permanent: true },
      { source: '/ortaklar/yeni', destination: '/partners/new', permanent: true },
      { source: '/faaliyetler', destination: '/activities', permanent: true },
      { source: '/faaliyetler/yeni', destination: '/activities/new', permanent: true },
      { source: '/butce', destination: '/budget', permanent: true },
      { source: '/butce/yeni', destination: '/budget/new', permanent: true },
      { source: '/raporlar', destination: '/reports', permanent: true },
      { source: '/raporlar/yeni', destination: '/reports/new', permanent: true },
      { source: '/raporlar/otomatik', destination: '/reports/auto', permanent: true },
      { source: '/raporlar/:id', destination: '/reports/:id', permanent: true },
      { source: '/katilimcilar', destination: '/participants', permanent: true },
      { source: '/katilimcilar/yeni', destination: '/participants/new', permanent: true },
      { source: '/katilimcilar/:id', destination: '/participants/:id', permanent: true },
      { source: '/sozlesmeler', destination: '/contracts', permanent: true },
      { source: '/sozlesmeler/yeni', destination: '/contracts/new', permanent: true },
      { source: '/ai-asistan', destination: '/ai-assistant', permanent: true },
      { source: '/ayarlar', destination: '/settings', permanent: true },
      { source: '/ayarlar/feedback', destination: '/settings/feedback', permanent: true },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/ingest/static/:path*',
        destination: 'https://us-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/ingest/:path*',
        destination: 'https://us.i.posthog.com/:path*',
      },
    ]
  }
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "modern-gelisim-dernegi",

  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  }
});
