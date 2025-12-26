
/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  sw: 'firebase-messaging-sw.js', // This is the new line
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig = {
  turbopack: {},
};

module.exports = withPWA(nextConfig);
