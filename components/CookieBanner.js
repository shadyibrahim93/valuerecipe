import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('vr-cookies-accepted');
    if (!accepted) {
      setVisible(true);
    }
  }, []);

  function acceptCookies() {
    localStorage.setItem('vr-cookies-accepted', 'true');

    // Tell Ezoic CMP that user accepted everything
    if (window.ezConsent) {
      window.ezConsent.acceptAll();
    }

    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className='vr-cookie-banner'>
      <div className='vr-cookie-banner__content'>
        <p>
          We use cookies for website functionality, analytics, and personalized
          ads. By using ValueRecipe, you agree to our{' '}
          <Link href='/privacy'>Privacy Policy</Link> and{' '}
          <Link href='/terms'>Terms of Service</Link>.
        </p>
      </div>

      <button
        className='vr-cookie-banner__button'
        onClick={acceptCookies}
      >
        Accept
      </button>
    </div>
  );
}
