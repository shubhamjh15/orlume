import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://orlume.site'

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: '/dashboard/',
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
