/** @type {import('next').NextConfig} */
const nextConfig = {
    // Remove static export for Vercel deployment
    // output: 'export',
    
    // No basePath needed since we're using a custom domain
    
    // Enable image optimization for Vercel
    images: {
        unoptimized: false,
    },

    // Indicate that these packages should not be bundled by webpack
    experimental: {
        serverComponentsExternalPackages: ['onnxruntime-node'],
    },
};

module.exports = nextConfig