// pages/privacy.js
import { BRAND_NAME } from '../lib/constants';

export default function PrivacyPage() {
  return (
    <div className='vr-legal-page'>
      <div className='vr-legal-container'>
        <h1>Privacy Policy</h1>
        <p>
          <em>Last Updated: December 01, 2025</em>
        </p>

        <h2>1. Introduction</h2>
        <p>
          This Privacy Policy explains how {BRAND_NAME} (“we,” “our,” “us”)
          collects, uses, and protects information when you use our website. By
          accessing {BRAND_NAME}, you consent to this Privacy Policy.
        </p>

        <h2>2. Information We Collect</h2>

        <h3>A. Information You Provide Directly</h3>
        <ul>
          <li>Email address</li>
          <li>Name</li>
          <li>Account details (if you create an account)</li>
          <li>
            Future submissions such as comments, ratings, or uploaded content
          </li>
        </ul>

        <h3>B. Information Collected Automatically</h3>
        <p>When you use {BRAND_NAME}, we automatically collect:</p>
        <ul>
          <li>IP address</li>
          <li>Device, operating system, and browser type</li>
          <li>Usage logs and interaction behavior</li>
          <li>Advertising identifiers</li>
          <li>Analytics data</li>
          <li>
            Recipe browsing history (this feature will be added in the future
            for personalization)
          </li>
        </ul>

        <h3>C. Cookies</h3>
        <p>ValueRecipe uses:</p>
        <ul>
          <li>
            <strong>Google Analytics cookies</strong> for traffic insights
          </li>
          <li>
            <strong>Google Ads cookies</strong> for ad personalization and
            measurement
          </li>
          <li>
            <strong>Functional cookies</strong> for saving preferences, ratings,
            and user session behavior
          </li>
        </ul>
        <p>
          You can disable cookies through your browser settings, but some
          features may not function correctly.
        </p>

        <h2>3. How We Use Your Information</h2>
        <p>We use collected information for purposes including:</p>
        <ul>
          <li>Personalizing your recipe experience</li>
          <li>Saving account settings and favorites</li>
          <li>Providing analytics to improve the site</li>
          <li>Displaying ads and sponsored content</li>
          <li>Improving future recommendation features</li>
          <li>Ensuring security and preventing abuse</li>
          <li>Communicating with users as needed</li>
        </ul>

        <h2>4. How We Share Information</h2>
        <p>We may share information with:</p>
        <ul>
          <li>Supabase (database & authentication)</li>
          <li>Google Ads</li>
          <li>Google Analytics</li>
          <li>Website hosting providers (when selected)</li>
        </ul>
        <p>
          We do <strong>not</strong> sell personal information to third parties.
        </p>

        <h2>5. Affiliate Links & Sponsored Content</h2>
        <p>
          {BRAND_NAME} may include affiliate links or sponsored posts. When
          users click affiliate links, we may earn a commission at no extra cost
          to the user. All sponsored content will be clearly disclosed.
        </p>

        <h2>6. User Rights</h2>
        <p>Depending on your location, you may have the right to:</p>
        <ul>
          <li>Access the personal data we store about you</li>
          <li>Request deletion of your data</li>
          <li>Request corrections</li>
          <li>Opt out of personalized advertising</li>
          <li>Disable cookies</li>
        </ul>

        <h2>7. Data Security</h2>
        <p>
          We use reasonable security measures to protect personal information,
          but no system is completely secure. Users submit information at their
          own risk.
        </p>

        <h2>8. Children’s Privacy</h2>
        <p>
          {BRAND_NAME} is accessible to all ages. We do not knowingly collect
          personal information from children under 13 without parental consent.
          If you believe information was collected from a child, please contact
          us for removal.
        </p>

        <h2>9. International Users</h2>
        <p>
          {BRAND_NAME} operates in New Jersey, USA. By using the site,
          international users consent to transferring their data to the United
          States.
        </p>

        <h2>10. Data Retention</h2>
        <p>
          We retain information only as long as necessary for business,
          operational, or legal reasons. Users may request deletion of their
          data.
        </p>

        <h2>11. Changes to This Privacy Policy</h2>
        <p>
          We may update this Privacy Policy periodically. Continued use of
          {BRAND_NAME} after updates indicates acceptance of the revised policy.
        </p>

        <h2>12. Contact Us</h2>
        <p>
          For privacy-related questions, contact us at:
          <br />
          <strong>[privacy@valuerecipe.com]</strong>
        </p>
      </div>
    </div>
  );
}
