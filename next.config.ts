import type { Configuration } from 'webpack';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack: (config: Configuration) => {
    config.externals = [
      ...(Array.isArray(config.externals) ? config.externals : 
          typeof config.externals === 'object' ? [config.externals] : []),
      {
        'utf-8-validate': 'commonjs utf-8-validate',
        'bufferutil': 'commonjs bufferutil',
      },
    ];
    return config;
  },
  experimental: {}
}

export default nextConfig;
