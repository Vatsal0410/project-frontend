import { createContext, useContext, useState, type FC, type ReactNode } from 'react';
import type { ConfirmationType } from '../utils/ConfirmationModal';
import ConfirmationModal from '../utils/ConfirmationModal';

export interface ConfirmationConfig {
  title: string;
  message: string;
  type?: ConfirmationType;
  confirmText?: string;
  cancelText?: string;
}

interface ModalState {
  isOpen: boolean;
  config: ConfirmationConfig & {
    onConfirm: () => void;
    onCancel: () => void;
  } | null;
}

interface ConfirmationContextType {
  confirm: (config: ConfirmationConfig) => Promise<boolean>;
  setLoading: (loading: boolean) => void;
}

const ConfirmationContext = createContext<ConfirmationContextType | undefined>(undefined);

export const ConfirmationProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    config: null
  });
  const [loading, setLoading] = useState(false);

  const confirm = (config: ConfirmationConfig): Promise<boolean> => {
    return new Promise((resolve) => {
      const handleConfirm = () => {
        resolve(true);
        setModalState({ isOpen: false, config: null });
      };

      const handleCancel = () => {
        resolve(false);
        setModalState({ isOpen: false, config: null });
      };

      setModalState({
        isOpen: true,
        config: {
          type: 'warning',
          confirmText: 'Yes, Continue',
          cancelText: 'Cancel',
          ...config,
          onConfirm: handleConfirm,
          onCancel: handleCancel
        }
      });
    });
  };

  const handleClose = () => {
    if (!loading && modalState.config) {
      modalState.config.onCancel();
    }
  };

  return (
    <ConfirmationContext.Provider value={{ confirm, setLoading }}>
      {children}
      
      {modalState.config && (
        <ConfirmationModal
          isOpen={modalState.isOpen}
          onClose={handleClose}
          onConfirm={modalState.config.onConfirm}
          title={modalState.config.title}
          message={modalState.config.message}
          type={modalState.config.type}
          confirmText={modalState.config.confirmText}
          cancelText={modalState.config.cancelText}
          isLoading={loading}
        />
      )}
    </ConfirmationContext.Provider>
  );
};

export const useConfirm = (): ConfirmationContextType => {
  const context = useContext(ConfirmationContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmationProvider');
  }
  return context;
};