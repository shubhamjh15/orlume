import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Orlume | The AI Website Builder',
        short_name: 'Orlume',
        description: 'Create stunning, production-ready websites in seconds with Orlume AI.',
        start_url: '/',
        display: 'standalone',
        background_color: '#0a0a0a',
        theme_color: '#0a0a0a',
        icons: [
            {
                src: '/favicon.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/favicon.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}
