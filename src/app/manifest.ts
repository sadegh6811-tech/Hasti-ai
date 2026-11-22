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
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
