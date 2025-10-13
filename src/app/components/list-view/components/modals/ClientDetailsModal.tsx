import React, { useState, useEffect } from 'react'
import { getClientById } from '../../../../modules/apps/client-management/clients-list/core/_requests'
import { ClientType } from '@interfaces/Client'

type Props = {
  clientId: string
  onClose: () => void
}

const ClientDetailsModal: React.FC<Props> = ({ clientId, onClose }) => {
  const [client, setClient] = useState<ClientType | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!clientId) return
    setIsLoading(true)
    setError(null)

    getClientById(clientId)
      .then((data: ClientType) => {
        setClient(data)
        setIsLoading(false)
      })
      .catch(() => {
        setError('Ocorreu um erro ao carregar os dados.')
        setIsLoading(false)
      })
  }, [clientId])

  const CrossIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect opacity="0.5" x="6" y="17.3137" width="16" height="2" rx="1" transform="rotate(-45 6 17.3137)" fill="currentColor" />
      <rect x="7.41422" y="6" width="16" height="2" rx="1" transform="rotate(45 7.41422 6)" fill="currentColor" />
    </svg>
  )

  return (
    <div className="modal fade show d-block" tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered mw-650px">
        <div className="modal-content">

          <div className="modal-header d-flex justify-content-between align-items-center">
            <h2 className="fw-bolder">Detalhes do Cliente</h2>
            <div className="btn btn-icon btn-sm btn-active-icon-primary" onClick={onClose}>
              <CrossIcon />
            </div>
          </div>

          <div className="modal-body py-10 px-lg-17">
            {isLoading && <div>Carregando...</div>}
            {error && <div>{error}</div>}
            {client && (
              <>
              <div>
                <div className="row mb-4">
                  <div className="col-md-4 fw-bold text-muted">Nome:</div>
                  <div className="col-md-8">{client.name}</div>
                </div>
                <div className="row mb-4">
                  <div className="col-md-4 fw-bold text-muted">Descrição:</div>
                  <div className="col-md-8">{client.description || 'N/A'}</div>
                </div>
                <div className="row mb-4">
                  <div className="col-md-4 fw-bold text-muted">Parceiro:</div>
                  <div className="col-md-8">{client.partner || 'N/A'}</div>
                </div>
                <div className="row mb-4">
                  <div className="col-md-4 fw-bold text-muted">Regional:</div>
                  <div className="col-md-8">{client.regional || 'N/A'}</div>
                </div>
                <div className="row mb-4">
                  <div className="col-md-4 fw-bold text-muted">Subsecretaria:</div>
                  <div className="col-md-8">{client.subSecretary || 'N/A'}</div>
                </div>
                <div className="row mb-4">
                  <div className="col-md-4 fw-bold text-muted">Total de Contas:</div>
                  <div className="col-md-8">{client.totalAccounts}</div>
                </div>
                <div className="row mb-4">
                  <div className="col-md-4 fw-bold text-muted">Contas Restantes:</div>
                  <div className="col-md-8">{client.remainingAccounts}</div>
                </div>
                <div className="row mb-4">
                  <div className="col-md-4 fw-bold text-muted">Produto:</div>
                  <div className="col-md-8">{client.selectedProducts && client.selectedProducts.length > 0 ? client.selectedProducts.join(', ') : 'N/A'}</div>
                </div>
                 <div className="row mb-4">
                  <div className="col-md-4 fw-bold text-muted">Conteudo:</div>
                  <div className="col-md-8">{client.selectedContents && client.selectedContents.length > 0 ? client.selectedContents.join(', ') : 'N/A'}</div>
                </div>
              </div>
              </>
            )}
          </div>

          <div className="modal-footer flex-center">
            <button className="btn btn-light" onClick={onClose}>Fechar</button>
          </div>

        </div>
      </div>
    </div>
  )
}

export default ClientDetailsModal
