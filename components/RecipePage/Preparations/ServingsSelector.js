// components/RecipePage/Preparations/ServingsSelector.jsx
import Tooltip from '../../Tooltip';

function recordServingChoice(serving) {
  let counts = JSON.parse(localStorage.getItem('vr-serving-counts') || '{}');

  counts[serving] = (counts[serving] || 0) + 1;

  // Save counts
  localStorage.setItem('vr-serving-counts', JSON.stringify(counts));

  // If user selects a serving 2 times → set as default
  if (counts[serving] >= 2) {
    localStorage.setItem('vr-default-servings', serving);
  }
}

export default function ServingsSelector({
  servings,
  setServings,
  customServings,
  setCustomServings
}) {
  const presetServings = [1, 2, 4, 8];

  const handleCustomChange = (e) => {
    const val = e.target.value;
    setCustomServings(val);

    const num = parseFloat(val);
    if (!Number.isNaN(num) && num > 0) {
      setServings(num);
    }
  };

  return (
    <div className='vr-preparations__servings'>
      <h4 className='vr-section-subtitle'>
        Choose Your Servings
        <Tooltip text='Choosing your servings adjusts all ingredient measurements and nutrition automatically.' />
      </h4>

      <div className='vr-servings__options'>
        {presetServings.map((s) => (
          <button
            key={s}
            className={`vr-servings__chip 
              ${servings === s ? 'is-active' : ''} 
              ${servings === 1 ? 'pulse' : ''}
            `}
            onClick={() => {
              setServings(s);
              setCustomServings('');
              recordServingChoice(s);
            }}
          >
            {s}
          </button>
        ))}

        <input
          type='number'
          min='1'
          placeholder='Custom'
          className='vr-servings__custom'
          value={customServings}
          onChange={handleCustomChange}
        />
      </div>
    </div>
  );
}
