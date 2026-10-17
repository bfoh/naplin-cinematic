import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Hair By Naplin',
    short_name: 'Naplin',
    description:
      'Luxury hair, salon styling and practical training in Kumasi, Ghana.',
    start_url: '/',
    display: 'browser',
    background_color: '#0a090b',
    theme_color: '#0a090b',
    icons: [{ src: '/icon.png', sizes: '512x512', type: 'image/png' }],
  };
}
