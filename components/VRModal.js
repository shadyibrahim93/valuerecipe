export default function VRModal({ children, onClose }) {
  return (
    <div
      className='vr-modal__backdrop'
      onClick={onClose}
    >
      <div
        className='vr-modal__content'
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className='vr-modal__close'
          onClick={onClose}
          aria-label='Close modal'
        >
          ×
        </button>

        {/* Render whatever content is passed into the modal */}
        {children}
      </div>
    </div>
  );
}
