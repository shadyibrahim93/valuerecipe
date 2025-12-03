export default function RatingStars({ rating = 0 }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className='flex items-center gap-1 text-yellow-500'>
      {stars.map((s) => (
        <svg
          key={s}
          width='16'
          height='16'
          viewBox='0 0 24 24'
          fill={s <= rating ? 'currentColor' : 'none'}
          stroke='currentColor'
          strokeWidth='1.2'
          className='stroke-yellow-400'
        >
          <path d='M12 .587l3.668 7.431L24 9.75l-6 5.847 1.416 8.253L12 19.897 4.584 23.85 6 15.597 0 9.75l8.332-1.732z' />
        </svg>
      ))}
    </div>
  );
}
