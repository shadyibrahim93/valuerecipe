import useSWR from 'swr';

const fetcher = (url) => fetch(url).then((r) => r.json());

export default function AdSlot({ position }) {
  const { data } = useSWR('/api/ads', fetcher);
  if (!data) return <div className='vr-ad'>Ad loading…</div>;
  const slots = data?.data || [];
  const slot = slots.find((s) => s.position === position) || slots[0];
  if (!slot) return <div className='vr-ad'>Sponsored Space Available</div>;
  // Be careful with dangerouslySetInnerHTML for security — ensure admin sanitizes content before storing
  return (
    <div
      className='vr-ad vr-card--ads'
      dangerouslySetInnerHTML={{ __html: slot.html_content }}
    />
  );
}
