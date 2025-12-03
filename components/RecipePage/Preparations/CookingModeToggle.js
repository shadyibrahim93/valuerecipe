import Tooltip from '../../Tooltip';

export default function CookingModeToggle({ mode, onChange }) {
  const isBeginner = mode === 'beginner';

  // Flip between beginner/advanced
  const toggleMode = () => {
    onChange(isBeginner ? 'advanced' : 'beginner');
  };

  return (
    <div className='vr-cooking-mode'>
      <div className='vr-cooking-mode__header'>
        <h4 className='vr-section-subtitle'>
          Cooking Mode
          <Tooltip text='Beginner Mode gives detailed, step-by-step guidance. Advanced Mode shows short, high-level instructions.' />
        </h4>
      </div>

      {/* Entire toggle is clickable */}
      <div
        className='vr-cooking-mode__toggle'
        onClick={toggleMode}
      >
        {/* Sliding highlight */}
        <div
          className={`vr-cooking-mode__switch ${
            isBeginner ? '' : 'is-advanced'
          }`}
        />

        {/* Labels (no own onClick, they use the parent click) */}
        <div
          className={`vr-cooking-mode__option ${isBeginner ? 'is-active' : ''}`}
        >
          Beginner
        </div>

        <div
          className={`vr-cooking-mode__option ${
            !isBeginner ? 'is-active' : ''
          }`}
        >
          Advanced
        </div>
      </div>
    </div>
  );
}
