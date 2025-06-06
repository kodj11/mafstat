/** @type {import('next').NextConfig} */
const API_BASE_URL = 'http://localhost:8000';
const nextConfig = {
    images: {
      domains: ['raw.githubusercontent.com'],
    },
    webpack(config) {
      config.module.rules.push({
        test: /\.svg$/,
        use: [{
          loader: '@svgr/webpack',
          options: {
            svgo: false, // Отключаем оптимизацию SVGO
          },
        }],
      });
  
      return config;
    },
    staticPageGenerationTimeout: 120,
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: `${API_BASE_URL}/api/:path*`,
        },
        {
          source: '/docs',
          destination: `${API_BASE_URL}/docs`,
        },
      ];
    },
  };
  
  export default nextConfig;