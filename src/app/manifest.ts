import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AlgoSave',
    short_name: 'AlgoSave',
    description: 'A micro-savings goal tracker to help students achieve their financial goals on the Algorand blockchain.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f0f8ff',
    theme_color: '#3498db',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}