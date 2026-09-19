import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, '../dist');
const rootPublicPath = path.join(__dirname, '../../public');
const frontendPublicPath = path.join(__dirname, '../public');

const DOMAIN = 'https://ooplabdh.shop';

const routes = [
  { path: '', priority: '1.0', changefreq: 'daily' },
  { path: 'about', priority: '0.8', changefreq: 'monthly' },
  { path: 'academic', priority: '0.9', changefreq: 'daily' },
  { path: 'events', priority: '0.9', changefreq: 'daily' },
  { path: 'lost-found', priority: '0.8', changefreq: 'daily' },
  { path: 'faq', priority: '0.8', changefreq: 'weekly' },
  { path: 'contact', priority: '0.7', changefreq: 'monthly' },
  { path: 'privacy', priority: '0.5', changefreq: 'yearly' },
  { path: 'terms', priority: '0.5', changefreq: 'yearly' },
  { path: 'safety', priority: '0.6', changefreq: 'monthly' },
  { path: 'login', priority: '0.6', changefreq: 'monthly' },
  { path: 'register', priority: '0.6', changefreq: 'monthly' }
];

const currentDate = new Date().toISOString().split('T')[0];

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    r => `  <url>
    <loc>${DOMAIN}${r.path ? '/' + r.path : ''}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /Opadmin
Disallow: /messages
Disallow: /profile
Disallow: /checkout
Disallow: /settings

Sitemap: ${DOMAIN}/sitemap.xml
`;

// Map of route paths to specific SEO metadata & JSON-LD schemas
const seoMap = {
  default: {
    title: 'OOPLABDH | Official Platform',
    description: 'Welcome to OOPLABDH (ooplabdh.shop). Discover our latest resources, tools, and services.',
    canonical: `${DOMAIN}/`,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "OOPLABDH",
        "alternateName": "Ooplabdh Shop",
        "url": DOMAIN,
        "logo": `${DOMAIN}/logo.png`
      },
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "OOPLABDH",
        "url": DOMAIN,
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${DOMAIN}/?search={search_term_string}`,
          "query-input": "required name=search_term_string"
        },
        "description": "Welcome to OOPLABDH (ooplabdh.shop). Discover our latest resources, tools, and services."
      },
      {
        "@context": "https://schema.org",
        "@type": "Person",
        "@id": `${DOMAIN}/#founder`,
        "name": "MD AMANAT ULLAH",
        "jobTitle": "Founder & CEO",
        "worksFor": {
          "@type": "Organization",
          "name": "OOPLABDH",
          "url": DOMAIN
        },
        "sameAs": [
          "https://www.linkedin.com/in/mdamanatullah"
        ],
        "url": `${DOMAIN}/about`,
        "image": `${DOMAIN}/assets/images/team/amanat.png`
      }
    ]
  },
  'faq': {
    title: 'Frequently Asked Questions (FAQ) - Ooplabdh',
    description: 'Find answers to common questions about buying & selling on Ooplabdh, escrow safety, account verification, PYQs & notes downloads, and campus guidelines.',
    canonical: `${DOMAIN}/faq`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How does buying & selling work on Ooplabdh?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Buyers can browse products listed by students in their college, chat directly via in-app live chat, and arrange safe campus handovers."
          }
        },
        {
          "@type": "Question",
          "name": "How do I download PYQs & study notes?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Go to the Academic Resources tab, select your branch and semester, and preview or download study materials directly."
          }
        },
        {
          "@type": "Question",
          "name": "Are transactions safe on Ooplabdh?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, Ooplabdh uses student ID verification and optional escrow protection so funds stay safe until the deal is completed."
          }
        }
      ]
    }
  },
  'academic': {
    title: 'Academic Resources - PYQs, Study Notes & Syllabus | Ooplabdh',
    description: 'Download free previous year question papers (PYQs), engineering study notes, lab manuals, and syllabus for CSE, ECE, EE, ME, and more.',
    canonical: `${DOMAIN}/academic`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      "name": "Ooplabdh Academic Portal",
      "url": `${DOMAIN}/academic`,
      "description": "Free university question papers, study notes, and syllabus repository for college students."
    }
  },
  'events': {
    title: 'Campus Events & Workshops - Ooplabdh',
    description: 'Discover upcoming college fests, technical workshops, cultural events, sports tournaments, and hackathons across campus.',
    canonical: `${DOMAIN}/events`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "EventSeries",
      "name": "Ooplabdh Campus Events",
      "url": `${DOMAIN}/events`,
      "description": "College events, fests, technical workshops, and campus activities."
    }
  },
  'lost-found': {
    title: 'Campus Lost & Found Portal - Ooplabdh',
    description: 'Report or search for lost keys, IDs, wallets, water bottles, earphones, and personal items across campus.',
    canonical: `${DOMAIN}/lost-found`
  },
  'about': {
    title: 'MD AMANAT ULLAH - Founder & CEO of Ooplabdh | About Us',
    description: 'MD AMANAT ULLAH is the Founder & CEO of Ooplabdh, leading the premier college marketplace and student community hub.',
    canonical: `${DOMAIN}/about`,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Person",
        "@id": `${DOMAIN}/#founder`,
        "name": "MD AMANAT ULLAH",
        "jobTitle": "Founder & CEO",
        "worksFor": {
          "@type": "Organization",
          "name": "Ooplabdh",
          "url": DOMAIN
        },
        "sameAs": [
          "https://www.linkedin.com/in/mdamanatullah"
        ],
        "url": `${DOMAIN}/about`,
        "image": `${DOMAIN}/assets/images/team/amanat.png`
      },
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": `${DOMAIN}/#organization`,
        "name": "Ooplabdh",
        "url": DOMAIN,
        "logo": `${DOMAIN}/assets/images/icon.png`,
        "founder": {
          "@type": "Person",
          "@id": `${DOMAIN}/#founder`,
          "name": "MD AMANAT ULLAH",
          "jobTitle": "Founder & CEO",
          "sameAs": [
            "https://www.linkedin.com/in/mdamanatullah"
          ]
        },
        "sameAs": [
          "https://instagram.com/ooplabdh",
          "https://linkedin.com/company/ooplabdh",
          "https://www.linkedin.com/in/mdamanatullah"
        ]
      }
    ]
  },
  'contact': {
    title: 'Contact Us & Support - Ooplabdh',
    description: 'Have questions, feedback, or need help? Contact the Ooplabdh support team for campus marketplace assistance.',
    canonical: `${DOMAIN}/contact`
  },
  'privacy': {
    title: 'Privacy Policy - Ooplabdh',
    description: 'Read Ooplabdh privacy policy regarding student user data, security practices, and campus marketplace guidelines.',
    canonical: `${DOMAIN}/privacy`
  },
  'terms': {
    title: 'Terms of Service - Ooplabdh',
    description: 'Review the terms and conditions for using Ooplabdh college marketplace and student portal.',
    canonical: `${DOMAIN}/terms`
  },
  'safety': {
    title: 'Campus Safety Guidelines - Ooplabdh',
    description: 'Learn safety best practices for meetups, verified transactions, and escrow payments on Ooplabdh.',
    canonical: `${DOMAIN}/safety`
  }
};

function getSEOForFile(relPath) {
  const norm = relPath.replace(/\\/g, '/').replace(/^\//, '').replace(/\.html$/, '');
  if (norm === 'index' || norm === 'home' || norm === 'marketplace' || norm === '(tabs)/index' || norm === '(tabs)/marketplace') {
    return seoMap.default;
  }
  if (norm.startsWith('academic')) return seoMap.academic;
  if (norm.startsWith('events')) return seoMap.events;
  if (norm.startsWith('lost-found')) return seoMap['lost-found'];
  if (norm.startsWith('product')) {
    return {
      title: 'College Product Listing - Ooplabdh Marketplace',
      description: 'Buy second-hand textbooks, engineering tools, electronics, and college gear from verified campus sellers on Ooplabdh.',
      canonical: `${DOMAIN}/${norm}`,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "Campus Marketplace Product",
        "description": "Second-hand student gear listed on Ooplabdh college marketplace.",
        "offers": {
          "@type": "Offer",
          "priceCurrency": "INR",
          "itemCondition": "https://schema.org/UsedCondition",
          "availability": "https://schema.org/InStock"
        }
      }
    };
  }
  return seoMap[norm] || seoMap.default;
}

function injectSEOIntoHTML(filePath, baseDir) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  const relPath = path.relative(baseDir, filePath);
  const norm = relPath.replace(/\\/g, '/').replace(/^\//, '').replace(/\.html$/, '');
  const seo = getSEOForFile(relPath);

  // Strip existing meta/title/og/twitter tags & json-ld scripts to prevent duplicates
  content = content.replace(/<title[^>]*>.*?<\/title>/gi, '');
  content = content.replace(/<meta name="(title|description|keywords|author|robots|theme-color)"[^>]*\/?>/gi, '');
  content = content.replace(/<meta property="og:[^"]+"[^>]*\/?>/gi, '');
  content = content.replace(/<meta name="twitter:[^"]+"[^>]*\/?>/gi, '');
  content = content.replace(/<link rel="canonical"[^>]*\/?>/gi, '');
  content = content.replace(/<script type="application\/ld\+json">.*?<\/script>/gi, '');

  const isDefault = norm === 'index' || norm === 'home' || norm === '' || norm === 'marketplace' || norm === '(tabs)/index' || norm === '(tabs)/marketplace';
  const ogTitle = isDefault ? 'OOPLABDH' : seo.title;
  const twitterTitle = isDefault ? 'OOPLABDH' : seo.title;

  const headTags = `
    <title>${seo.title}</title>
    <meta name="title" content="${seo.title}" />
    <meta name="description" content="${seo.description}" />
    <meta name="keywords" content="OOPLABDH, ooplabdh.shop, MD AMANAT ULLAH, Founder of OOPLABDH, OOPLABDH Founder, college marketplace, campus store, buy sell used books, college pyq notes, student marketplace, campus lost and found, college events" />
    <meta name="author" content="OOPLABDH" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <meta name="theme-color" content="#4F46E5" />
    <link rel="canonical" href="${seo.canonical}" />

    <!-- Open Graph -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${seo.canonical}" />
    <meta property="og:title" content="${ogTitle}" />
    <meta property="og:description" content="${seo.description}" />
    <meta property="og:image" content="${DOMAIN}/assets/images/og-banner.png" />
    <meta property="og:site_name" content="OOPLABDH" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${seo.canonical}" />
    <meta name="twitter:title" content="${twitterTitle}" />
    <meta name="twitter:description" content="${seo.description}" />
    <meta name="twitter:image" content="${DOMAIN}/assets/images/og-banner.png" />

    ${seo.jsonLd ? `<script type="application/ld+json">${JSON.stringify(seo.jsonLd)}</script>` : ''}
  `;

  if (content.includes('</head>')) {
    content = content.replace('</head>', `${headTags}\n</head>`);
  } else if (content.includes('<head>')) {
    content = content.replace('<head>', `<head>${headTags}`);
  }

  fs.writeFileSync(filePath, content, 'utf8');
}

function processDirectoryHTML(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectoryHTML(fullPath);
    } else if (file.endsWith('.html')) {
      injectSEOIntoHTML(fullPath, dir);
    }
  });
}

function writeSEOFiles(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const sitemapFile = path.join(dir, 'sitemap.xml');
  const robotsFile = path.join(dir, 'robots.txt');

  fs.writeFileSync(sitemapFile, sitemapXml, 'utf8');
  fs.writeFileSync(robotsFile, robotsTxt, 'utf8');
  console.log(`[SEO Generator] Successfully generated sitemap.xml & robots.txt in ${dir}`);
}

writeSEOFiles(rootPublicPath);
processDirectoryHTML(rootPublicPath);

if (fs.existsSync(distPath)) {
  writeSEOFiles(distPath);
  processDirectoryHTML(distPath);
}

if (fs.existsSync(frontendPublicPath)) {
  writeSEOFiles(frontendPublicPath);
  processDirectoryHTML(frontendPublicPath);
}
