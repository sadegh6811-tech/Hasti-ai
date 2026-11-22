import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'هستی — دستیار هوش مصنوعی',
    short_name: 'هستی',
    description: 'دستیار هوش مصنوعی خصوصی و امن',
    start_url: '/',
    display: 'standalone',
    background_color: '#05070d',
    theme_color: '#1a1a3e',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
