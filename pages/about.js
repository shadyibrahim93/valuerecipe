// pages/about.js
import Head from 'next/head';
import Link from 'next/link';
import { useModal } from '../components/ModalContext'; // ⭐ ADD THIS

export default function AboutPage() {
  const { setShowIngredientsModal } = useModal(); // ⭐ ADD THIS

  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ValueRecipe',
    url: 'https://valuerecipekitchen.com',
    logo: 'https://valuerecipekitchen.com/logo.png',
    sameAs: [
      'https://www.facebook.com/ValueRecipe',
      'https://www.instagram.com/ValueRecipe',
      'https://www.pinterest.com/ValueRecipe'
    ]
  };

  const aboutSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About ValueRecipe',
    url: 'https://valuerecipekitchen.com/about',
    description:
      'Learn about ValueRecipe, our mission, our vision, and why we believe cooking should be simple, affordable, and fun for everyone.'
  };

  return (
    <>
      <Head>
        <title>About Us — ValueRecipe</title>
        <meta
          name='description'
          content='Learn about ValueRecipe, our mission, story, and why we believe cooking should be simple, affordable, and fun for everyone.'
        />
        <meta
          name='keywords'
          content='about ValueRecipe, cooking website story, recipe platform, food mission, home cooking help'
        />

        <link
          rel='canonical'
          href='https://valuerecipekitchen.com/about'
        />

        {/* OG */}
        <meta
          property='og:title'
          content='About Us — ValueRecipe'
        />
        <meta
          property='og:description'
          content='Discover the story and mission behind ValueRecipe — a platform built to make cooking simple, affordable, and inspiring.'
        />
        <meta
          property='og:image'
          content='https://valuerecipekitchen.com/images/og-about.jpg'
        />
        <meta
          property='og:url'
          content='https://valuerecipekitchen.com/about'
        />

        {/* Twitter */}
        <meta
          name='twitter:card'
          content='summary_large_image'
        />
        <meta
          name='twitter:title'
          content='About Us — ValueRecipe'
        />
        <meta
          name='twitter:description'
          content='Discover the story and mission behind ValueRecipe — a platform built to make cooking simple, affordable, and inspiring.'
        />
        <meta
          name='twitter:image'
          content='https://valuerecipekitchen.com/images/og-about.jpg'
        />

        {/* Schema */}
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
        />
      </Head>

      <div className='vr-about-page'>
        <section className='vr-about-hero'>
          <h1>About ValueRecipe</h1>
          <p>
            Where simple cooking meets smart technology — built to help you make
            the most of every ingredient.
          </p>
        </section>

        <section className='vr-about-section vr-card'>
          <h3>Our Story</h3>
          <p>
            ValueRecipe began with a simple idea: great food shouldn’t require
            expensive ingredients, complicated techniques, or hours in the
            kitchen. As a developer who loved experimenting in the kitchen, I
            often found myself overwhelmed by recipe websites full of clutter,
            ads, or unclear steps.
          </p>
          <p>
            I wanted something better — clean, efficient, and built around the
            things home cooks actually need. So ValueRecipe was created with a
            mission to blend smart technology with practical cooking guidance,
            helping millions cook confidently at home.
          </p>
        </section>

        <section className='vr-about-section vr-card'>
          <h3>Our Vision</h3>
          <p>
            We’re building a platform that makes cooking approachable, fun, and
            surprisingly simple — no matter your skill level. Our vision is to
            help people cook more at home, save money, reduce food waste, and
            feel inspired every single day.
          </p>
        </section>

        <section className='vr-about-section vr-card'>
          <h3>Why the Name "ValueRecipe"?</h3>
          <p>
            Because value matters — not just in price, but in time, flavor,
            simplicity, and confidence.
          </p>
          <p>
            A “Value Recipe” is one that gives you more: more flavor, more
            clarity, more usefulness, and more enjoyment. Every recipe we
            publish follows that philosophy.
          </p>
        </section>

        <section className='vr-about-section vr-card'>
          <h3>Our Mission</h3>
          <ul>
            <li>✔ Make cooking simple, joyful, and accessible.</li>
            <li>✔ Deliver clear, step-by-step instructions.</li>
            <li>✔ Help home cooks save time and money.</li>
            <li>✔ Showcase recipes anyone can follow.</li>
            <li>✔ Build smart tools that help people cook better.</li>
          </ul>
        </section>

        <section className='vr-about-section vr-card'>
          <h3>Where We’re Going</h3>
          <p>
            ValueRecipe is evolving into a complete cooking companion — offering
            personalized suggestions, meal planners, ingredient-matching
            recipes, and more. We're continuously improving, shaped by real user
            feedback and real cooking needs.
          </p>
        </section>

        <section className='vr-about-footer'>
          <p>
            Thank you for being part of ValueRecipe. We're honored to help you
            cook something amazing today.
          </p>

          <div className='vr-about-footer__actions'>
            <Link
              href='/recipes'
              className='vr-about-btn'
            >
              Explore Recipes →
            </Link>

            <button
              className='vr-about-btn vr-about-btn--secondary'
              onClick={() => setShowIngredientsModal(true)}
            >
              Create From Ingredients →
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
