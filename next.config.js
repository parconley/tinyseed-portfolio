/** @type {import('next').NextConfig} */
const nextConfig = {
    // Export as static HTML for GitHub Pages
    output: 'export',
    
    // No basePath needed since we're using a custom domain
    
    // Disable image optimization for static export
    images: {
        unoptimized: true,
    },

    // Indicate that these packages should not be bundled by webpack
    experimental: {
        serverComponentsExternalPackages: ['onnxruntime-node'],
    },
};

module.exports = nextConfig