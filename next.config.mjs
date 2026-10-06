/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    // pdfjs-dist lazily requires the Node-only `canvas` package inside a
    // factory that never runs in the browser — stub it so the build resolves.
    resolveAlias: {
      canvas: './src/lib/emptyModule.js',
    },
  },
  webpack: (config) => {
    config.resolve.alias = { ...(config.resolve.alias || {}), canvas: false };
    return config;
  },
};

export default nextConfig;
