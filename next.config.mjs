/** @type {import('next').NextConfig} */

// GitHub Pages serves a project site from https://<user>.github.io/<repo>/.
// The deploy workflow sets NEXT_PUBLIC_BASE_PATH=/<repo>. For a user site
// (wesleyharuo.github.io) or a custom domain, leave it empty.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig = {
  output: "export",
  basePath,
  assetPrefix: process.env.NEXT_ASSET_PREFIX || basePath || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
