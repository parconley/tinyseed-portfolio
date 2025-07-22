/** @type {import('next').NextConfig} */
const nextConfig = {
    // Export as static HTML for GitHub Pages
    output: 'export',
    
    // GitHub Pages serves from subdirectory if not using custom domain
    // Update this if your repo name is different
    basePath: process.env.NODE_ENV === 'production' ? '/tinyseed-portfolio' : '',
    
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