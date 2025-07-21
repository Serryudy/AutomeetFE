/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, Cookie'
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true'
          }
        ]
      }
    ];
  },
  
  // Add rewrites for API calls to help with CORS during development
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://3a098ee1-d32d-4afd-9ad3-5fcbb939b60e-dev.e1-us-east-azure.choreoapis.dev/:path*'
      }
    ];
  }
};

export default nextConfig;
