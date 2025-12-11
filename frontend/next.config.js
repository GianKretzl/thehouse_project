/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração de imagens externas permitidas
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    minimumCacheTTL: 60,
    formats: ['image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'images.kabum.com.br',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'imgs.casasbahia.com.br',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.samsung.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'a-static.mlcdn.com.br',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'store.storeimages.cdn-apple.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'http2.mlstatic.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'assets.adidas.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'static.nike.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'down-br.img.susercontent.com',
        pathname: '/**',
      },
      // Adicione outros domínios conforme necessário
      {
        protocol: 'https',
        hostname: '**.mercadolivre.com.br',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.magazineluiza.com.br',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.tcdn.com.br',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.tcdn.com.br',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.philco.com.br',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.philco.com.br',
        pathname: '/**',
      },
      // Wildcard para capturar outras lojas brasileiras comuns
      {
        protocol: 'https',
        hostname: '**.com.br',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
