import { useEffect, useState, useRef } from 'react';

const AdSlot = ({
  id,
  position,
  height,
  marginTop,
  marginBottom,
  placement
}) => {
  const [isDev, setIsDev] = useState(false);
  const isLoaded = useRef(false); // 👈 Prevents double-firing

  useEffect(() => {
    // 1. Check if we are in local development
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        setIsDev(true);
        return;
      }
    }

    // 2. Queue Ezoic Logic (The Safe Way)
    if (typeof window !== 'undefined') {
      window.ezstandalone = window.ezstandalone || {};
      window.ezstandalone.cmd = window.ezstandalone.cmd || [];

      window.ezstandalone.cmd.push(() => {
        // Prevent React from running this twice
        if (isLoaded.current) return;

        try {
          // Define the placeholder
          window.ezstandalone.define(parseInt(id)); // parseInt ensures ID is a number

          // Logic: Enable if new, Refresh if existing
          if (!window.ezstandalone.enabled) {
            window.ezstandalone.enable();
            window.ezstandalone.display();
          } else {
            window.ezstandalone.refresh();
          }

          isLoaded.current = true; // Mark as done
        } catch (err) {
          console.warn('Ezoic ad error:', err);
        }
      });
    }
  }, [id]);

  // LOCAL DEVELOPMENT VISUALIZER
  if (isDev) {
    return (
      <div
        style={{
          position: `${placement}`,
          top: '100px',
          backgroundColor: '#f0f0f0',
          border: '2px dashed #ccc',
          color: '#666',
          padding: '20px',
          height: `${height || 'auto'}`, // Fallback for safety
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          marginTop: `${marginTop}`,
          marginBottom: `${marginBottom ? marginBottom : '1rem'}`,
          borderRadius: '8px'
        }}
      >
        EZOIC AD PLACEHOLDER
        <br />
        ID: {id}
        <br />
        Position: {position}
      </div>
    );
  }

  // LIVE PRODUCTION SLOT
  return (
    <div
      className='ezoic-ad-slot-container'
      style={{
        marginTop: marginTop,
        marginBottom: marginBottom || '1rem',
        minHeight: height // Prevent layout shift (CLS)
      }}
    >
      {/* The ID here must match the placeholder ID generated in Ezoic Dashboard */}
      <div id={`ezoic-pub-ad-placeholder-${id}`}></div>
    </div>
  );
};

export default AdSlot;
