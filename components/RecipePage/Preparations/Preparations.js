import { useState } from 'react';
import generatePreparationParagraph from '../../../utils/generatePreparationParagraph';

import ServingsSelector from './ServingsSelector';
import TotalTimeSection from './TotalTime';
import CookingModeToggle from './CookingModeToggle';
import RatingWidget from '../../RatingWidget.js';

export default function Preparations({
  recipe,
  servings,
  setServings,
  cookingMode,
  setCookingMode
}) {
  const [customServings, setCustomServings] = useState('');
  const presetServings = [1, 2, 4, 8];

  return (
    <section className='vr-card vr-preparations'>
      <h3 className='vr-section-title'>
        Preparations
        <RatingWidget
          recipeId={recipe.id}
          initialRating={recipe.rating}
          initialCount={recipe.rating_count}
        />
      </h3>

      {/* UNIVERSAL PREPARATION PARAGRAPH */}
      <p className='vr-preparations__paragraph'>
        {generatePreparationParagraph(recipe)}
      </p>

      <div className='vr-preparations__row'>
        {/* ===== LEFT SIDE - SERVINGS ===== */}
        <ServingsSelector
          servings={servings}
          setServings={setServings}
          customServings={customServings}
          setCustomServings={setCustomServings}
          presetServings={presetServings}
        />

        {/* ===== MIDDLE SIDE - COOKING MODE ===== */}
        <CookingModeToggle
          mode={cookingMode}
          onChange={setCookingMode}
        />

        {/* ===== RIGHT - TOTAL TIME ===== */}
        <TotalTimeSection
          prepTime={recipe.prep_time}
          cookTime={recipe.cook_time}
          totalTime={recipe.total_time}
        />
      </div>
    </section>
  );
}
