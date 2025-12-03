import scaleNutritionValue from '../../utils/scaleNutritionValue';

export default function NutritionSidebar({ recipe, servings }) {
  const label = servings === 1 ? 'serving' : 'servings';

  return (
    <div className='vr-card vr-sidebar__block vr-nutrition'>
      <h4 className='vr-sidebar__title'>
        Nutrition{' '}
        <span className='vr-nutrition__per'>
          (per {servings} {label})
        </span>
        <p className='vr-nutrition__subtitle'>
          Calculated using FDA guidelines for nutrition per serving. It should
          not be considered a substitute for a professional nutritionist’s
          advice.
        </p>
      </h4>

      <div className='vr-nutrition__list'>
        {Object.entries(recipe.nutrition).map(([key, value]) => {
          const scaled = scaleNutritionValue(value, servings);
          const formattedKey = key
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase());

          return (
            <div
              className='vr-nutrition__item'
              key={key}
            >
              <span className='vr-nutrition__label'>{formattedKey}</span>
              <span className='vr-nutrition__value'>{scaled}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
