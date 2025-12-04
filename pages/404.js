// pages/404.js
import Head from 'next/head';
import Link from 'next/link';
import { BRAND_NAME, BRAND_URL } from '../lib/constants';

export default function NotFoundPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: '404 Not Found',
    description:
      'Oops! The page you’re looking for has vanished like leftovers in the office fridge.',
    url: `${BRAND_URL}/404`
  };

  return (
    <>
      <Head>
        <title>404 — This Recipe Got Burned 😅 | {BRAND_NAME}</title>
        <meta
          name='description'
          content='Oops! The page you’re looking for has vanished like leftovers in the office fridge.'
        />

        {/* Structured Data */}
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />

        {/* Noindex so Google doesn't index your 404 page */}
        <meta
          name='robots'
          content='noindex'
        />
      </Head>

      <div className='vr-404'>
        <div className='vr-404__content vr-card'>
          <h1 className='vr-404__title'>404 — Recipe Not Found 🍳</h1>

          <p className='vr-404__subtitle'>
            Looks like this page burned in the oven… or maybe it never existed.
            Either way, let’s get you back to deliciousness.
          </p>

          <Link
            href='/'
            className='vr-404__btn'
          >
            Back to Home →
          </Link>
        </div>
      </div>
    </>
  );
}
