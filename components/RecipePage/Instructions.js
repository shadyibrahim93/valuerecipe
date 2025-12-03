export default function InstructionsSection({ recipe, cookingMode }) {
  // For SEO: when rendered on server, always use full instructions
  const isServer = typeof window === 'undefined';
  const showBeginner =
    isServer || cookingMode === null || cookingMode === 'beginner';

  const instructionsToShow = showBeginner
    ? recipe.instructions
    : recipe.instructions_condensed;

  return (
    <section className='vr-card vr-section-instructions'>
      <h3 className='vr-section-title'>Instructions</h3>

      <ol className='vr-instructions'>
        {instructionsToShow?.map((step, idx) => (
          <li
            className='vr-instructions__step'
            key={idx}
          >
            <div className='vr-step'>
              <div className='vr-step__number'>{step.step}</div>
              <div className='vr-step__text'>{step.text}</div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
