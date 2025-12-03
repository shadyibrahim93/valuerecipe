import { IoShareOutline } from 'react-icons/io5';
import Image from 'next/image';

export default function RecipeBanner({ recipe, onStartCooking, onShare }) {
  return (
    <div className='vr-hero'>
      <Image
        className='vr-hero__image'
        src={`/images/recipes/${recipe.image_url}.jpg`}
        alt={recipe.title}
        width={1920}
        height={600}
      />

      <button
        type='button'
        className='vr-hero__icon-btn'
        onClick={onShare}
        aria-label='Share recipe'
      >
        <IoShareOutline />
      </button>

      <div className='vr-hero__overlay'>
        {/* Top row with share icon */}
        <div className='vr-hero__top'>
          <h1 className='vr-hero__title'>{recipe.title}</h1>
        </div>

        <p className='vr-hero__desc'>{recipe.description}</p>

        <div className='vr-hero__actions'>
          <button
            className='vr-hero__badge'
            onClick={onStartCooking}
          >
            Start Cooking Mode
          </button>
        </div>
      </div>
    </div>
  );
}
