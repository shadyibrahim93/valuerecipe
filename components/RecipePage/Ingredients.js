import { useState, useEffect } from 'react';
import { FiSend } from 'react-icons/fi';
import scaleQuantity from '../../utils/scaleQuantity';
import Image from 'next/image';
import { BsAmazon } from 'react-icons/bs';
import { TbBrandWalmart } from 'react-icons/tb';
import { SiTarget } from 'react-icons/si';
import { SiInstacart } from 'react-icons/si';

export default function IngredientsSection({ recipe, servings }) {
  const [ingredientsState, setIngredientsState] = useState(null);

  const storageKey = `vr-cooking-ingredients-${recipe.slug}`;

  // Load initial ingredient state
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const stored = localStorage.getItem(storageKey);

    if (stored) {
      setIngredientsState(JSON.parse(stored));
    } else {
      setIngredientsState(
        recipe.ingredients.map((i) => ({
          ...i,
          hasIt: false
        }))
      );
    }
  }, [recipe.slug]);

  // Save updates to localStorage
  useEffect(() => {
    if (!ingredientsState) return;
    if (typeof window === 'undefined') return;

    localStorage.setItem(storageKey, JSON.stringify(ingredientsState));
  }, [ingredientsState]);

  if (!ingredientsState) return null;

  const toggleIngredient = (index) => {
    setIngredientsState((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, hasIt: !item.hasIt } : item
      )
    );
  };

  // Share ingredient checklist
  const handleShareIngredients = async () => {
    if (!ingredientsState) return;

    const have = ingredientsState.filter((i) => i.hasIt);
    const need = ingredientsState.filter((i) => !i.hasIt);

    const formatLine = (item) => {
      const scaled = item.quantity
        ? scaleQuantity(item.quantity, servings)
        : null;
      return `• ${item.ingredient}${scaled ? ` (${scaled})` : ''}`;
    };

    const title = `Shopping list for ${recipe.title}`;

    let text = `${title}\n\nRecipe Link: ${window.location.href}\n\n`;

    text += 'Items to buy:\n';
    text += need.length ? need.map(formatLine).join('\n') : '• None';

    text += '\n\nItems you already have:\n';
    text += have.length ? have.map(formatLine).join('\n') : '• None';

    try {
      if (navigator.share) {
        await navigator.share({ title, text });
        return;
      }

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        alert('List copied!');
        return;
      }

      alert(text);
    } catch (err) {
      console.log('Share cancelled', err);
    }
  };

  // Generate affiliate links based on ingredient name
  function getAffiliateLinks(ingredientName) {
    const query = encodeURIComponent(ingredientName);

    return {
      amazon: `https://www.amazon.com/s?k=${query}&tag=valuerecipeki-20`,
      walmart: `https://www.walmart.com/search?q=${query}`,
      target: `https://www.target.com/s?searchTerm=${query}`,
      instacart: `https://instacart.app.link/valuerecipe?ingredient=${query}`
    };
  }

  // Find missing ingredients
  const missingIngredients = ingredientsState.filter((i) => !i.hasIt);

  // Pick first missing ingredient for affiliate links
  const firstMissing =
    missingIngredients.length > 0 ? missingIngredients[0] : null;

  const affiliateLinks = firstMissing
    ? getAffiliateLinks(firstMissing.ingredient)
    : null;

  return (
    <>
      <section className='vr-card vr-section-ingredients'>
        {/* HEADER */}
        <div className='vr-section-header'>
          <h3 className='vr-section-title'>Ingredients</h3>

          <button
            type='button'
            className='vr-icon-btn vr-icon-btn--share'
            onClick={handleShareIngredients}
          >
            <FiSend />
            <span className='vr-icon-btn__label'>Share list</span>
          </button>
        </div>

        {/* INGREDIENT GRID */}
        <div className='vr-ingredients'>
          {ingredientsState.map((i, idx) => {
            const scaled = i.quantity
              ? scaleQuantity(i.quantity, servings)
              : null;

            return (
              <div
                className='vr-ingredients__item'
                key={idx}
              >
                {/* Check bubble */}
                <div
                  className={`vr-ingredient-check ${i.hasIt ? 'checked' : ''}`}
                  onClick={() => toggleIngredient(idx)}
                >
                  ✓
                </div>

                {/* Image + info */}
                <div className='vr-ingredients__top'>
                  <Image
                    src={
                      i.image
                        ? `/images/ingredients/${i.image}.webp`
                        : '/images/ingredients/placeholder.webp'
                    }
                    alt={i.ingredient}
                    className='vr-ingredients__img'
                    width={46}
                    height={46}
                  />

                  <div className='vr-ingredients__info'>
                    {scaled && (
                      <span className='vr-ingredients__quantity'>{scaled}</span>
                    )}
                    <span className='vr-ingredients__name'>{i.ingredient}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {affiliateLinks && (
          <section className='vr-ingredients__affiliate-block'>
            <h4 className='vr-section-title'>
              Where to buy missing ingredients?
            </h4>

            <div className='vr-ingredients__affiliate'>
              <a
                href={affiliateLinks.amazon}
                target='_blank'
                rel='noopener noreferrer'
                className='vr-affiliate-link vr-affiliate--amazon'
              >
                <BsAmazon className='vr-affiliate-icon' />
                Amazon
              </a>

              <a
                href={affiliateLinks.walmart}
                target='_blank'
                rel='noopener noreferrer'
                className='vr-affiliate-link vr-affiliate--walmart'
              >
                <TbBrandWalmart className='vr-affiliate-icon' />
                Walmart
              </a>

              <a
                href={affiliateLinks.target}
                target='_blank'
                rel='noopener noreferrer'
                className='vr-affiliate-link vr-affiliate--target'
              >
                <SiTarget className='vr-affiliate-icon' />
                Target
              </a>

              <a
                href={affiliateLinks.instacart}
                target='_blank'
                rel='noopener noreferrer'
                className='vr-affiliate-link vr-affiliate--instacart'
              >
                <SiInstacart className='vr-affiliate-icon' />
                Instacart
              </a>
            </div>
          </section>
        )}
      </section>
    </>
  );
}
