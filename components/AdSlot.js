import { useEffect, useState } from 'react';

const AdSlot = ({
  id,
  position,
  height,
  marginTop,
  marginBottom,
  placement
}) => {
  const [isDev, setIsDev] = useState(false);

  useEffect(() => {
    // Check if we are in local development
    if (
      typeof window !== 'undefined' &&
      window.location.hostname === 'localhost'
    ) {
      setIsDev(true);
      return;
    }

    // Ezoic Standalone Logic
    if (typeof window !== 'undefined' && window.ezstandalone) {
      try {
        // 1. Define the placeholder
        window.ezstandalone.define(id);

        // 2. Refresh/Enable it (Short delay ensures DOM is ready)
        setTimeout(() => {
          window.ezstandalone.enable();
          window.ezstandalone.display();
        }, 500);
      } catch (err) {
        console.warn('Ezoic ad error:', err);
      }
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
          height: `${height}`,
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
    <div className='ezoic-ad-slot-container'>
      {/* The ID here must match the placeholder ID generated in Ezoic Dashboard */}
      <div id={`ezoic-pub-ad-placeholder-${id}`}></div>
    </div>
  );
};

export default AdSlot;
