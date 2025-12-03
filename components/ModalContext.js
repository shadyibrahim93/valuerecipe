import { createContext, useContext, useState } from 'react';

const ModalContext = createContext();

export function ModalProvider({ children }) {
  const [showIngredientsModal, setShowIngredientsModal] = useState(false);

  return (
    <ModalContext.Provider
      value={{
        showIngredientsModal,
        setShowIngredientsModal
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  return useContext(ModalContext);
}
