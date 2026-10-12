const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Allow access to remote image placeholder.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'venturekartapi.walkershive.com.np',
      },
      {
        protocol: 'https',
        hostname: 'cms.hree.com.np',
      },
    ],
  },
  output: 'standalone',
  transpilePackages: ['motion', 'react-qr-code'],
  webpack: (config, { dev }) => {
    if (dev) {
      // Disable filesystem cache (PackFileCacheStrategy) in dev — it tries to
      // serialize the entire module graph into a large ArrayBuffer on startup,
      // which is the direct cause of ERR_MEMORY_ALLOCATION_FAILED / heap OOM.
      // Using an in-memory cache is faster anyway for a running dev server.
      config.cache = { type: 'memory' };

      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify - file watching is disabled to prevent flickering during agent edits.
      if (process.env.DISABLE_HMR === 'true') {
        config.watchOptions = {
          ignored: /.*/,
        };
      }
    }
    return config;
  },
};

export default nextConfig;
