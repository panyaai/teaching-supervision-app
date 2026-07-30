import type { NextConfig } from "next";

const isGithubActions = process.env.GITHUB_ACTIONS || false;
let repo = '';
if (isGithubActions && process.env.GITHUB_REPOSITORY) {
  repo = '/' + process.env.GITHUB_REPOSITORY.split('/')[1];
}

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: repo,
  assetPrefix: repo,
};

export default nextConfig;
