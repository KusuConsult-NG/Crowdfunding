/** @type {import('next').NextConfig} */
const nextConfig = {
    /* config options here */
    experimental: {
        // Disable middleware bundling
        middlewarePrefetch: 'strict',
    },
    // Skip building middleware
    skipMiddlewareUrlNormalize: true,
};

export default nextConfig;
