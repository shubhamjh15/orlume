export default function JsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Orlume',
    url: 'https://orlume.site',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://orlume.site/?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
