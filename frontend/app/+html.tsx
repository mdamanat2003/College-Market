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
        <title>Ooplabdh - College Student Marketplace & Campus Community Hub</title>
        <meta name="title" content="Ooplabdh - College Student Marketplace & Campus Community Hub" />
        <meta name="description" content="Ooplabdh is the ultimate college marketplace and campus hub. Buy & sell used books, PYQs, study notes, electronics, report lost & found items, and discover campus events." />
        <meta name="keywords" content="college marketplace, campus store, buy sell used books, college pyq notes, student marketplace, campus lost and found, college events, campus notes, engineering notes, university market" />
        <meta name="author" content="Ooplabdh Team" />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta name="theme-color" content="#4F46E5" />
        <link rel="canonical" href="https://ooplabdh.shop" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ooplabdh.shop" />
        <meta property="og:title" content="Ooplabdh - College Student Marketplace & Campus Community Hub" />
        <meta property="og:description" content="Buy & sell books, access study materials & PYQs, check campus events, and report lost & found items." />
        <meta property="og:image" content="https://ooplabdh.shop/assets/images/og-banner.png" />
        <meta property="og:site_name" content="Ooplabdh" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://ooplabdh.shop" />
        <meta name="twitter:title" content="Ooplabdh - College Student Marketplace & Campus Community Hub" />
        <meta name="twitter:description" content="Buy & sell books, access study materials & PYQs, check campus events, and report lost & found items." />
        <meta name="twitter:image" content="https://ooplabdh.shop/assets/images/og-banner.png" />

        {/* Mobile Web App Capable */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

        {/* Schema.org Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Ooplabdh",
              "url": "https://ooplabdh.shop",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://ooplabdh.shop/?search={search_term_string}",
                "query-input": "required name=search_term_string"
              },
              "description": "College marketplace & student community hub for buying/selling books, notes, PYQs, events, and lost & found items."
            })
          }}
        />

        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
