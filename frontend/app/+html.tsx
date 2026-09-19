import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

/**
 * Root HTML layout for Expo Router static web export.
 * Configures primary SEO meta tags, OpenGraph, Twitter Cards, and Schema.org structured data.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        
        {/* Primary Meta Tags */}
        <title>OOPLABDH | Official Platform</title>
        <meta name="title" content="OOPLABDH | Official Platform" />
        <meta name="description" content="Welcome to OOPLABDH (ooplabdh.shop). Discover our latest resources, tools, and services." />
        <meta name="keywords" content="OOPLABDH, ooplabdh.shop, MD AMANAT ULLAH, Founder of OOPLABDH, OOPLABDH Founder, college marketplace, campus store, buy sell used books, college pyq notes, student marketplace, campus lost and found, college events" />
        <meta name="author" content="OOPLABDH" />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta name="theme-color" content="#4F46E5" />
        <link rel="canonical" href="https://ooplabdh.shop/" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ooplabdh.shop/" />
        <meta property="og:title" content="OOPLABDH" />
        <meta property="og:description" content="Welcome to OOPLABDH (ooplabdh.shop). Discover our latest resources, tools, and services." />
        <meta property="og:image" content="https://ooplabdh.shop/assets/images/og-banner.png" />
        <meta property="og:site_name" content="OOPLABDH" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://ooplabdh.shop/" />
        <meta name="twitter:title" content="OOPLABDH" />
        <meta name="twitter:description" content="Welcome to OOPLABDH (ooplabdh.shop). Discover our latest resources, tools, and services." />
        <meta name="twitter:image" content="https://ooplabdh.shop/assets/images/og-banner.png" />

        {/* Mobile Web App Capable */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

        {/* Schema.org Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "OOPLABDH",
                "alternateName": "Ooplabdh Shop",
                "url": "https://ooplabdh.shop",
                "logo": "https://ooplabdh.shop/logo.png"
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "OOPLABDH",
                "url": "https://ooplabdh.shop",
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": "https://ooplabdh.shop/?search={search_term_string}",
                  "query-input": "required name=search_term_string"
                },
                "description": "Welcome to OOPLABDH (ooplabdh.shop). Discover our latest resources, tools, and services."
              },
              {
                "@context": "https://schema.org",
                "@type": "Person",
                "@id": "https://ooplabdh.shop/#founder",
                "name": "MD AMANAT ULLAH",
                "jobTitle": "Founder & CEO",
                "worksFor": {
                  "@type": "Organization",
                  "name": "OOPLABDH",
                  "url": "https://ooplabdh.shop"
                },
                "sameAs": [
                  "https://www.linkedin.com/in/mdamanatullah"
                ],
                "url": "https://ooplabdh.shop/about",
                "image": "https://ooplabdh.shop/assets/images/team/amanat.png"
              }
            ])
          }}
        />

        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
