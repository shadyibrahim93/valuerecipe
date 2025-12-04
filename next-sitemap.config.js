/** @type {import('next-sitemap').IConfig} */

// 1. Explicitly load .env.local to ensure keys are available during postbuild
const env = require('dotenv').config({ path: '.env.local' });

module.exports = {
  siteUrl: process.env.SITE_URL || process.env.URL || 'https://rekadish.com',
  generateRobotsTxt: true,

  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        disallow: '/' // Change to allow: '/' when you go live
      }
    ]
  },

  exclude: ['/admin/*', '/api/*'],

  additionalPaths: async (config) => {
    const result = [];

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        return result;
      }

      // 3. Fetch Data
      const res = await fetch(
        `${supabaseUrl}/rest/v1/recipes?select=slug,created_at`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`
          }
        }
      );

      if (!res.ok) {
        return result;
      }

      const recipes = await res.json();

      if (Array.isArray(recipes)) {
        recipes.forEach((recipe) => {
          result.push({
            loc: `/recipes/${recipe.slug}`,
            changefreq: 'weekly',
            priority: 0.8,
            lastmod: recipe.created_at || new Date().toISOString()
          });
        });
      }
    } catch (e) {
      console.error('Error generating dynamic sitemap paths:', e);
    }

    return result;
  }
};
