import React, { FC, PropsWithChildren, useEffect, useRef } from 'react'
import { Modal as BsModal } from 'bootstrap' // Importa o JS do Bootstrap
import clsx from 'clsx'

type Props = {
  show: boolean
  onClose: () => void
  size?: 'sm' | 'lg' | 'xl'
}

const Modal: FC<PropsWithChildren<Props>> = ({
  show,
  onClose,
  size,
  children,
}) => {
  const modalRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!modalRef.current) {
      return
    }

    const modal = new BsModal(modalRef.current)

    if (show) {
      modal.show()
    } else {
      // O evento 'hidden.bs.modal' garante que 'onClose' só é chamado
      // após a animação de "fechar" terminar, evitando flicker.
      const handleHidden = () => {
        onClose()
        modalRef.current?.removeEventListener('hidden.bs.modal', handleHidden)
      }
      modalRef.current.addEventListener('hidden.bs.modal', handleHidden)
      modal.hide()
    }

    // Limpeza: remove o modal do DOM quando o componente é destruído
    return () => {
      // modal.dispose() // Cuidado ao usar 'dispose' se o modal for reutilizado
    }
  }, [show, onClose])

  const modalDialogClasses = clsx('modal-dialog modal-dialog-centered', {
    [`modal-${size}`]: size,
  })

  return (
    <div
      className='modal fade'
      tabIndex={-1}
      ref={modalRef}
      // Não adicione 'show' ou 'display: block' aqui, o JS do Bootstrap cuida disso
    >
      <div className={modalDialogClasses}>
        <div className='modal-content'>{children}</div>
      </div>
    </div>
  )
}

// Helper para o Header
const ModalHeader: FC<PropsWithChildren<{ title: string; onClose: () => void }>> = ({
  title,
  onClose,
  children,
}) => (
  <div className='modal-header'>
    <h2 className='fw-bold'>{title}</h2>
    <div
      className='btn btn-icon btn-sm btn-active-icon-primary'
      onClick={onClose}
      style={{ cursor: 'pointer' }}
    >
      <i className='fas fa-times fs-2'></i>
    </div>
    {children}
  </div>
)

// Helper para o Body
const ModalBody: FC<PropsWithChildren<{}>> = ({ children }) => (
  <div className='modal-body py-10 px-lg-17'>{children}</div>
)

export { Modal, ModalHeader, ModalBody }