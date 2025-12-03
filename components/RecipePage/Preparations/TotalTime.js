import Tooltip from '../../Tooltip';

export default function TotalTimeSection({ prepTime, cookTime, totalTime }) {
  const prepDisplay = prepTime ? `${prepTime} min` : 'N/A';
  const cookDisplay = cookTime ? `${cookTime} min` : 'N/A';
  const totalDisplay = totalTime ? `${totalTime} min` : 'N/A';

  return (
    <div className='vr-total-time'>
      <h4 className='vr-section-subtitle'>
        Total Time
        <Tooltip text='Prep Time includes washing, chopping, and setup. Cook Time includes the actual cooking steps. Total Time is the full start-to-finish duration so you can plan ahead.' />
      </h4>

      <div className='vr-total-time__stats'>
        <span className='vr-total-time__item'>
          <strong>Prep:</strong> {prepDisplay}
        </span>

        <span className='vr-total-time__item'>
          <strong>Cook:</strong> {cookDisplay}
        </span>

        <span className='vr-total-time__item'>
          <strong>Total:</strong> {totalDisplay}
        </span>
      </div>
    </div>
  );
}
