# Phase 3: Build and Deployment Optimizations

This document outlines the implementation details for Phase 3 of our performance optimization plan, focusing on build and deployment optimizations to ensure the best possible performance in production.

## 1. Configure Next.js Production Build

### Implementation Steps:

1. **Optimize next.config.js**:
   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     output: 'standalone', // Optimized for containerized deployments
     poweredByHeader: false, // Remove X-Powered-By header for security
     reactStrictMode: true,
     compress: true, // Enable gzip compression
     
     // Image optimization
     images: {
       formats: ['image/avif', 'image/webp'],
       deviceSizes: [640, 750, 828, 1080, 1200, 1920],
       imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
       minimumCacheTTL: 60, // Cache optimized images for 60 seconds
     },
     
     // Enable production source maps for better error tracking
     productionBrowserSourceMaps: true,
     
     // Disable ESLint during build to speed up builds
     eslint: {
       ignoreDuringBuilds: true,
     },
     
     // Disable TypeScript type checking during build
     typescript: {
       ignoreBuildErrors: true,
     },
     
     // Experimental features
     experimental: {
       // Enable server components where applicable
       serverComponents: true,
       // Optimize CSS
       optimizeCss: true,
       // Enable modern JavaScript features
       optimizePackageImports: ['react-icons', 'date-fns', 'lodash'],
     },
   };
   
   module.exports = nextConfig;
   ```

2. **Configure PostCSS for Production**:
   ```javascript
   // postcss.config.mjs
   const config = {
     plugins: [
       "tailwindcss",
       "autoprefixer",
       process.env.NODE_ENV === 'production' 
         ? [
             '@fullhuman/postcss-purgecss',
             {
               content: [
                 './src/pages/**/*.{js,ts,jsx,tsx}',
                 './src/components/**/*.{js,ts,jsx,tsx}',
                 './src/app/**/*.{js,ts,jsx,tsx}',
               ],
               defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
               safelist: ['html', 'body'],
             },
           ]
         : undefined,
     ].filter(Boolean),
   };
   
   export default config;
   ```

3. **Add Bundle Analyzer**:
   ```bash
   npm install --save-dev @next/bundle-analyzer
   ```

   ```javascript
   // next.config.js
   const withBundleAnalyzer = require('@next/bundle-analyzer')({
     enabled: process.env.ANALYZE === 'true',
   });
   
   module.exports = withBundleAnalyzer(nextConfig);
   ```

   Add to package.json:
   ```json
   "scripts": {
     "analyze": "ANALYZE=true next build",
     "analyze:server": "ANALYZE=true BUNDLE_ANALYZE=server next build",
     "analyze:browser": "ANALYZE=true BUNDLE_ANALYZE=browser next build"
   }
   ```

## 2. Implement Proper Caching Strategies

### Implementation Steps:

1. **Configure Cache Headers in API Routes**:
   ```typescript
   // src/app/api/tasks/route.ts
   export async function GET(req: NextRequest) {
     try {
       // Existing code...
       
       // Add cache headers
       const headers = new Headers();
       headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
       
       return NextResponse.json(tasks, { 
         status: 200,
         headers
       });
     } catch (error) {
       // Error handling...
     }
   }
   ```

2. **Implement Middleware for Static Asset Caching**:
   ```typescript
   // src/middleware.ts
   import { NextResponse } from 'next/server';
   import type { NextRequest } from 'next/server';

   export function middleware(request: NextRequest) {
     const response = NextResponse.next();
     
     // Add cache headers for static assets
     const url = request.nextUrl.pathname;
     if (
       url.includes('/_next/static') || 
       url.includes('/images/') ||
       url.endsWith('.svg') ||
       url.endsWith('.png') ||
       url.endsWith('.jpg') ||
       url.endsWith('.jpeg')
     ) {
       response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
     }
     
     return response;
   }

   export const config = {
     matcher: [
       '/((?!api|_next/static|_next/image|favicon.ico).*)',
       '/_next/static/:path*',
       '/images/:path*',
     ],
   };
   ```

3. **Implement Service Worker for Offline Support**:
   ```typescript
   // public/service-worker.js
   const CACHE_NAME = 'calendar-view-cache-v1';
   const urlsToCache = [
     '/',
     '/index.html',
     '/Shreeyafavicon.svg',
     '/styles/main.css',
     '/scripts/main.js',
   ];

   self.addEventListener('install', (event) => {
     event.waitUntil(
       caches.open(CACHE_NAME)
         .then((cache) => {
           return cache.addAll(urlsToCache);
         })
     );
   });

   self.addEventListener('fetch', (event) => {
     event.respondWith(
       caches.match(event.request)
         .then((response) => {
           if (response) {
             return response;
           }
           return fetch(event.request);
         })
     );
   });
   ```

   Register the service worker in `_app.tsx`:
   ```typescript
   useEffect(() => {
     if ('serviceWorker' in navigator) {
       window.addEventListener('load', function() {
         navigator.serviceWorker.register('/service-worker.js').then(
           function(registration) {
             console.log('ServiceWorker registration successful');
           },
           function(err) {
             console.log('ServiceWorker registration failed: ', err);
           }
         );
       });
     }
   }, []);
   ```

## 3. Optimize Vercel Deployment

### Implementation Steps:

1. **Configure Vercel.json**:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "package.json",
         "use": "@vercel/next"
       }
     ],
     "routes": [
       {
         "src": "/api/(.*)",
         "headers": {
           "cache-control": "public, s-maxage=60, stale-while-revalidate=300"
         },
         "continue": true
       },
       {
         "src": "/_next/static/(.*)",
         "headers": {
           "cache-control": "public, max-age=31536000, immutable"
         },
         "continue": true
       },
       {
         "src": "/static/(.*)",
         "headers": {
           "cache-control": "public, max-age=31536000, immutable"
         },
         "continue": true
       },
       {
         "src": "/(.*\\.(js|css|svg|png|jpg|jpeg|gif|ico|json)$)",
         "headers": {
           "cache-control": "public, max-age=31536000, immutable"
         },
         "continue": true
       },
       {
         "src": "/(.*)",
         "headers": {
           "cache-control": "public, s-maxage=60, stale-while-revalidate=300"
         },
         "continue": true
       }
     ]
   }
   ```

2. **Configure Environment Variables**:
   - Set up environment variables in Vercel dashboard
   - Ensure MongoDB connection string is properly configured
   - Add any API keys or secrets needed for production

3. **Enable Edge Functions for API Routes**:
   ```typescript
   // src/app/api/tasks/route.ts
   export const config = {
     runtime: 'edge',
   };
   ```

## 4. Implement Performance Monitoring

### Implementation Steps:

1. **Add Web Vitals Reporting**:
   ```typescript
   // src/app/layout.tsx
   import { useReportWebVitals } from 'next/web-vitals';

   export function reportWebVitals(metric) {
     console.log(metric);
     
     // Send to analytics service
     if (window.gtag) {
       window.gtag('event', metric.name, {
         value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
         event_category: 'Web Vitals',
         event_label: metric.id,
         non_interaction: true,
       });
     }
   }

   export default function RootLayout({ children }) {
     useReportWebVitals(reportWebVitals);
     
     return (
       <html lang="en">
         <body>
           <AppProvider>
             <MainLayout>{children}</MainLayout>
           </AppProvider>
         </body>
       </html>
     );
   }
   ```

2. **Add Error Boundary**:
   ```typescript
   // src/components/ErrorBoundary.tsx
   import React from 'react';

   interface ErrorBoundaryProps {
     children: React.ReactNode;
     fallback: React.ReactNode;
   }

   interface ErrorBoundaryState {
     hasError: boolean;
     error?: Error;
   }

   class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
     constructor(props: ErrorBoundaryProps) {
       super(props);
       this.state = { hasError: false };
     }

     static getDerivedStateFromError(error: Error) {
       return { hasError: true, error };
     }

     componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
       console.error('Error caught by boundary:', error, errorInfo);
       // Log to error reporting service
     }

     render() {
       if (this.state.hasError) {
         return this.props.fallback;
       }

       return this.props.children;
     }
   }

   export default ErrorBoundary;
   ```

   Use in layout:
   ```tsx
   <ErrorBoundary fallback={<div>Something went wrong. Please try again later.</div>}>
     {children}
   </ErrorBoundary>
   ```

## 5. Final Performance Testing and Optimization

### Implementation Steps:

1. **Run Lighthouse Audits**:
   - Test performance, accessibility, best practices, and SEO
   - Address any issues found in the audit

2. **Test Core Web Vitals**:
   - Ensure LCP (Largest Contentful Paint) is under 2.5s
   - Ensure FID (First Input Delay) is under 100ms
   - Ensure CLS (Cumulative Layout Shift) is under 0.1

3. **Test on Various Devices and Connections**:
   - Test on mobile devices
   - Test on slow connections (3G)
   - Test on various browsers

## Expected Outcomes

After implementing these Phase 3 optimizations, we expect:

1. **Optimized Build Size**: Smaller JavaScript bundles
2. **Faster Initial Load**: Through proper caching and compression
3. **Better User Experience**: Through optimized Core Web Vitals
4. **Improved SEO**: Through better performance metrics
5. **Reliable Error Handling**: Through proper error boundaries and monitoring

These build and deployment optimizations will ensure that the application performs optimally in production, providing users with a fast and responsive experience.
