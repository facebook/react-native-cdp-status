/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    dirs: [
      'app',
      'third-party',
      'ui',
      'data',
      'eslint'
    ],
  }
};

module.exports = nextConfig;
