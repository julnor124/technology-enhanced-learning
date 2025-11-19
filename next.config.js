/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    
    // Externalize pdf-parse and its dependencies for server-side only
    if (isServer) {
      config.externals = config.externals || [];
      if (typeof config.externals === 'function') {
        const originalExternals = config.externals;
        config.externals = [
          (context, request, callback) => {
            if (request === 'pdf-parse' || request.startsWith('pdf-parse/')) {
              return callback(null, `commonjs ${request}`);
            }
            return originalExternals(context, request, callback);
          },
        ];
      } else if (Array.isArray(config.externals)) {
        config.externals.push('pdf-parse');
      } else {
        config.externals = [config.externals, 'pdf-parse'];
      }
    }
    
    return config;
  },
}

module.exports = nextConfig

