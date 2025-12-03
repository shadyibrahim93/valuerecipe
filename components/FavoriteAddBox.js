import Link from 'next/link';

export default function FavoriteAddBox({ label = 'Add Favorite' }) {
  return (
    <Link
      href='/'
      className='vr-favorite-add'
    >
      <div className='vr-favorite-add__inner'>
        <span className='vr-favorite-add__plus'>+</span>
        <p>{label}</p>
      </div>
    </Link>
  );
}
