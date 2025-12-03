// components/Footer.js
import Link from 'next/link';
import { useState } from 'react';
import { useModal } from '../components/ModalContext';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { setShowIngredientsModal } = useModal();

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      await fetch('/api/newsletter/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      setSubmitted(true);
      setEmail('');
    } catch (err) {
      console.error('Newsletter subscription failed:', err);
    }
  };

  return (
    <footer
      className='vr-footer'
      role='contentinfo'
    >
      <div className='vr-footer__container'>
        {/* NEWSLETTER */}
        <div className='vr-footer__newsletter'>
          <h3>Join Our Free Recipe Newsletter</h3>
          <p>
            Fresh recipes, cooking tips, and kitchen deals — straight to your
            inbox.
          </p>

          {!submitted ? (
            <form
              onSubmit={handleSubscribe}
              className='vr-footer__newsletter-form'
            >
              <input
                type='email'
                placeholder='Enter your email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type='submit'>Subscribe</button>
            </form>
          ) : (
            <p className='vr-footer__success'>🎉 You’re subscribed!</p>
          )}
        </div>

        {/* LINK SECTIONS */}
        <div className='vr-footer__links-grid'>
          <div>
            <h4>Browse By Cuisine</h4>
            <ul>
              <li>
                <Link href='/categories/American'>American</Link>
              </li>
              <li>
                <Link href='/categories/Italian'>Italian</Link>
              </li>
              <li>
                <Link href='/categories/French'>French</Link>
              </li>
              <li>
                <Link href='/categories/Mexican'>Mexican</Link>
              </li>
              <li>
                <Link href='/categories/Asian'>Asian</Link>
              </li>
              <li>
                <Link href='/categories/Indian'>Indian</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4>Browse By Meal</h4>
            <ul>
              <li>
                <Link href='/categories/breakfast'>Breakfast</Link>
              </li>
              <li>
                <Link href='/categories/lunch'>Lunch</Link>
              </li>
              <li>
                <Link href='/categories/dinner'>Dinner</Link>
              </li>
              <li>
                <Link href='/categories/dessert'>Dessert</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4>Quick Links</h4>
            <ul>
              <li>
                <Link href='/recipes'>All Recipes</Link>
              </li>
              <li>
                <button
                  className='vr-footer__button-link'
                  onClick={() => setShowIngredientsModal(true)}
                >
                  Cook From Ingredients
                </button>
              </li>
              <li>
                <Link href='/about'>About Us</Link>
              </li>
              <li>
                <Link href='/contact'>Contact</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4>Legal</h4>
            <ul>
              <li>
                <Link href='/privacy'>Privacy Policy</Link>
              </li>
              <li>
                <Link href='/terms'>Terms of Service</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className='vr-footer__bottom'>
          © {new Date().getFullYear()} ValueRecipe — Made with ❤️ for home
          cooks.
        </div>
      </div>
    </footer>
  );
}
