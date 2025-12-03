import { useModal } from './ModalContext';

export default function VRModal({ children }) {
  const { showIngredientsModal, setShowIngredientsModal } = useModal();

  if (!showIngredientsModal) return null;

  return (
    <div
      className='vr-modal__backdrop'
      onClick={() => setShowIngredientsModal(false)}
    >
      <div
        className='vr-modal__content'
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className='vr-modal__close'
          onClick={() => setShowIngredientsModal(false)}
        >
          ×
        </button>

        {children}
      </div>
    </div>
  );
}
