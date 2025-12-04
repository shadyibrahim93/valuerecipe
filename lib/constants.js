// --------------------------------------------------------
// GLOBAL CONFIGURATION
// --------------------------------------------------------

/**
 * ISR Revalidation Time (in seconds)
 *
 * This controls how often Netlify/Next.js will attempt to regenerate
 * static pages in the background when a new request comes in.
 *
 * 60    = 1 Minute   (Fastest updates, highest cost)
 * 900   = 15 Minutes (Balanced)
 * 3600  = 1 Hour     (Recommended for Free Tier)
 * 7200  = 2 Hours    (Low Cost)
 * 10800 = 3 Hours    (Lower Cost)
 * 21600 = 6 Hours    (Maximum Savings)
 */
export const REVALIDATE_TIME = 10800;
export const BRAND_NAME = 'RekaDish';
export const BRAND_URL = 'https://rekadish.com';
