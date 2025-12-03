// components/RecipeCardSkeleton.js
export default function RecipeCardSkeleton() {
  return (
    <div className='vr-recipe-card vr-recipe-card--skeleton'>
      <div className='vr-recipe-card__media-skeleton' />
      <div className='vr-recipe-card__line-skeleton' />
      <div className='vr-recipe-card__line-skeleton short' />
    </div>
  );
}
