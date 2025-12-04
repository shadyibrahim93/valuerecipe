// pages/terms.js
import { BRAND_NAME } from '../lib/constants';

export default function TermsPage() {
  return (
    <div className='vr-legal-page'>
      <div className='vr-legal-container'>
        <h1>Terms of Service</h1>
        <p>
          <em>Last Updated: December 01, 2025</em>
        </p>

        <h2>1. About {BRAND_NAME}</h2>
        <p>
          {BRAND_NAME} (“we,” “our,” “us”) operates as an online recipe and
          food-content platform under the name “ValueRecipe,” without a formal
          company entity. These Terms of Service are governed by the laws of New
          Jersey, USA.
        </p>

        <h2>2. Eligibility</h2>
        <p>
          Anyone may view {BRAND_NAME}. To create an account, save favorites,
          leave ratings, or submit future content, you must be at least 13 years
          old in accordance with U.S. online service guidelines.
        </p>

        <h2>3. User Accounts</h2>
        <p>
          If you create an account on {BRAND_NAME}, you agree to provide
          accurate information. You are responsible for safeguarding your login
          credentials. You must notify us immediately of any unauthorized
          access. We reserve the right to suspend or terminate accounts that
          violate these Terms or pose security concerns.
        </p>

        <h2>4. Ownership of Content</h2>
        <p>
          All recipes, images, photos, text, instructions, videos, designs, and
          all other content on {BRAND_NAME} are owned exclusively by{' '}
          {BRAND_NAME} unless otherwise stated.
        </p>
        <p>
          Users are encouraged to share public recipe links on social media
          platforms. Social previews—including images—may appear automatically
          when sharing links.
        </p>
        <p>
          Users may <strong>not</strong>:
        </p>
        <ul>
          <li>Scrape or extract data from the website</li>
          <li>Copy recipes or photos and republish them elsewhere</li>
          <li>
            Use our content for commercial purposes without written permission
          </li>
          <li>Bulk download, distribute, or mirror any content</li>
        </ul>

        <h2>5. User-Submitted Content</h2>
        <p>
          In the future, users may submit ratings, comments, or recipe-related
          content. By submitting any content, you grant {BRAND_NAME} a
          non-exclusive, royalty-free, perpetual, worldwide license to use,
          modify, display, promote, and distribute your content as part of the
          platform.
        </p>
        <p>
          You represent that your submissions are original, lawful, and do not
          infringe on the intellectual property rights of others. {BRAND_NAME}
          reserves the right to remove or moderate any submitted content.
        </p>

        <h2>6. Disclaimer: Allergies, Nutrition, and Recipe Outcomes</h2>
        <p>
          {BRAND_NAME} provides recipes for informational and entertainment
          purposes only. We do not guarantee nutritional accuracy, allergen
          safety, ingredient accuracy, or recipe results. Cooking results can
          vary widely due to equipment, ingredient variations, experience
          levels, and preparation differences.
        </p>
        <p>
          You are fully responsible for checking ingredients for allergens,
          reviewing compatibility with dietary restrictions, and ensuring
          personal safety when cooking.
        </p>
        <p>ValueRecipe is not liable for:</p>
        <ul>
          <li>Food allergies or reactions</li>
          <li>Cooking accidents, injuries, or illness</li>
          <li>Property damage during food preparation</li>
          <li>Inconsistent or unexpected recipe outcomes</li>
        </ul>

        <h2>7. Updates to Recipes and Content</h2>
        <p>
          {BRAND_NAME} may update or modify recipes, instructions, images, or
          other content at any time to improve clarity, accuracy, or user
          experience.
        </p>

        <h2>8. Prohibited Conduct</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Scrape, harvest, or extract site data</li>
          <li>Copy or republish {BRAND_NAME} content elsewhere</li>
          <li>Bypass security measures</li>
          <li>Use automated bots (other than search engine indexing)</li>
          <li>Upload harmful, offensive, or unlawful content</li>
        </ul>
        <p>
          Sharing links to {BRAND_NAME} recipes is allowed and encouraged as
          part of normal, acceptable use.
        </p>

        <h2>9. Advertising, Sponsors, and Affiliate Links</h2>
        <p>
          {BRAND_NAME} displays advertising and may include sponsored content,
          brand partnerships, and affiliate links. When affiliate links are
          used,
          {BRAND_NAME} may earn a commission at no additional cost to the user.
          Sponsored posts will be clearly disclosed.
        </p>

        <h2>10. Third-Party Services</h2>
        <p>ValueRecipe uses third-party tools and services including:</p>
        <ul>
          <li>Supabase (database & authentication)</li>
          <li>Google Ads</li>
          <li>Google Analytics</li>
        </ul>
        <p>
          We are not responsible for the actions, availability, or policies of
          these third-party providers.
        </p>

        <h2>11. Termination</h2>
        <p>
          We may suspend or terminate your account or access to {BRAND_NAME} if
          you violate these Terms or if such action is required to protect the
          website, users, or compliance obligations. You may delete your account
          at any time.
        </p>

        <h2>12. Limitation of Liability</h2>
        <p>
          To the fullest extent allowed by law, {BRAND_NAME} is not liable for
          any direct, indirect, incidental, special, or consequential damages
          related to your use of the website, cooking outcomes, or reliance on
          recipe content. Use of the platform is at your own risk.
        </p>

        <h2>13. Changes to These Terms</h2>
        <p>
          We may update these Terms periodically. Continued use of {BRAND_NAME}
          after updates signifies acceptance of the revised Terms.
        </p>

        <h2>14. Contact</h2>
        <p>
          For questions regarding these Terms, please contact us at:
          <br />
          <strong>[support@valuerecipe.com]</strong>
        </p>
      </div>
    </div>
  );
}
