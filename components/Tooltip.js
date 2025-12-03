import { useState, useEffect } from 'react';

export default function Tooltip({ text }) {
  const [open, setOpen] = useState(false);

  // Close on outside click (mobile & desktop)
  useEffect(() => {
    function handleClickOutside() {
      setOpen(false);
    }

    if (open) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [open]);

  function toggleTooltip(e) {
    e.stopPropagation(); // Prevent closing instantly
    setOpen(!open);
  }

  return (
    <span className='vr-tooltip'>
      <span
        className='vr-tooltip__icon'
        onClick={toggleTooltip}
      >
        ?
      </span>

      {open && <span className='vr-tooltip__bubble'>{text}</span>}
    </span>
  );
}
