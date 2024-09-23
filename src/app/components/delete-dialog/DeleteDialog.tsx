import { KTSVG } from '@metronic/helpers';
import React, { useEffect } from 'react';

interface DeleteDialogProps {
  open: boolean;
  closeCallback: () => void;
  actionCallback: () => void;
  loading: boolean;
}

const DeleteDialog: React.FC<DeleteDialogProps> = ({ open, closeCallback, actionCallback, loading }) => {
  // Add 'Esc' key press listener when the modal is open
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeCallback();
      }
    };

    if (open) {
      window.addEventListener('keydown', handleEsc);
    }

    // Cleanup the event listener on unmount or when modal closes
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [open, closeCallback]);

  if (!open) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    // Close modal only if the click happened outside the modal content
    if (e.target === e.currentTarget) {
      closeCallback();
    }
  };

  const handleActionClick = () => {
    if (!loading) {
      actionCallback();
    }
  };

  return (
    <div
      style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
      className="modal fade show"
      onClick={handleOverlayClick} // Handles overlay click
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Ação necessária</h5>
            <div
              style={{ marginLeft: 'auto' }}
              className="btn btn-icon btn-sm btn-active-light-primary"
              onClick={closeCallback} // Close modal when 'X' button is clicked
              aria-label="Close"
            >
              <KTSVG
                path="media/icons/duotune/arrows/arr061.svg"
                className="svg-icon svg-icon-2x"
                />
            </div>
          </div>
          <div className="modal-body">
            <p className='m-0'>Tem certeza que deseja excluir este item?</p>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-light"
              onClick={closeCallback}
            >
              Fechar
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleActionClick}
              disabled={loading} // Disable button when loading
            >
              {loading ? (
                <span className='indicator-progress'>
                  Aguarde...{' '}
                  <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                </span>
              ) : (
                'Remover'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteDialog;
