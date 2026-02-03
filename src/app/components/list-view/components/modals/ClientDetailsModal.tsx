import React, { useState, useEffect } from 'react'
import { getClientById } from '../../../../modules/apps/client-management/clients-list/core/_requests'
import { getAccountById } from '@services/Accounts'
import { ClientType } from '@interfaces/Client'

type Props = {
  clientId: string
  onClose: () => void
}

const ClientDetailsModal: React.FC<Props> = ({ clientId, onClose }) => {
  const [client, setClient] = useState<ClientType | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [partnerDisplay, setPartnerDisplay] = useState<string | null>(null)
  const [contactDisplay, setContactDisplay] = useState<string | null>(null)

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

  // When we have a client, try to resolve partner and contacts (they may be IDs)
  useEffect(() => {
    if (!client) {
      setPartnerDisplay(null)
      setContactDisplay(null)
      return
    }

    const resolvePartner = async () => {
      if (client.partner) {
        try {
          const acc = await getAccountById(client.partner)
          setPartnerDisplay(acc?.name || acc?.userName || acc?.email || client.partner)
        } catch {
          setPartnerDisplay(client.partner)
        }
      } else if (client.partnerName) {
        setPartnerDisplay(client.partnerName)
      } else {
        setPartnerDisplay(null)
      }
    }

    const resolveContact = async () => {
      if (client.contacts) {
        try {
          const acc = await getAccountById(client.contacts)
          setContactDisplay(acc?.name || acc?.userName || acc?.email || client.contacts)
        } catch {
          setContactDisplay(client.contacts)
        }
      } else {
        setContactDisplay(null)
      }
    }

    resolvePartner()
    resolveContact()
  }, [client])

  const CrossIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect opacity="0.5" x="6" y="17.3137" width="16" height="2" rx="1" transform="rotate(-45 6 17.3137)" fill="currentColor" />
      <rect x="7.41422" y="6" width="16" height="2" rx="1" transform="rotate(45 7.41422 6)" fill="currentColor" />
    </svg>
  )

  const formatDate = (value?: string) => {
    if (!value) return 'N/A'
    const d = new Date(value)
    return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString()
  }

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
                  <div className="col-md-8">{partnerDisplay || 'N/A'}</div>
                </div>
                <div className="row mb-4">
                  <div className="col-md-4 fw-bold text-muted">Contatos:</div>
                  <div className="col-md-8">{contactDisplay || 'N/A'}</div>
                </div>
                <div className="row mb-4">
                  <div className="col-md-4 fw-bold text-muted">Data de Assinatura:</div>
                  <div className="col-md-8">{formatDate(client.signatureDate)}</div>
                </div>
                <div className="row mb-4">
                  <div className="col-md-4 fw-bold text-muted">Macro Região:</div>
                  <div className="col-md-8">{client.macroRegionName || 'N/A'}</div>
                </div>
                <div className="row mb-4">
                  <div className="col-md-4 fw-bold text-muted">Subsecretarias:</div>
                  <div className="col-md-8">
                    {client.subsecretarias && client.subsecretarias.length > 0 
                      ? client.subsecretarias.map(sub => sub.name).join(', ')
                      : 'N/A'}
                  </div>
                </div>
                <div className="row mb-4">
                  <div className="col-md-4 fw-bold text-muted">Regionais:</div>
                  <div className="col-md-8">
                    {client.subsecretarias && client.subsecretarias.length > 0 
                      ? client.subsecretarias
                          .flatMap(sub => sub.regionais || [])
                          .map(reg => reg.name)
                          .join(', ') || 'N/A'
                      : 'N/A'}
                  </div>
                </div>
                <div className="row mb-4">
                  <div className="col-md-4 fw-bold text-muted">Produto:</div>
                  <div className="col-md-8">{client.products && client.products.length > 0 
                        ? client.products.map(p => p.name).join(', ')
                        : 'N/A'}</div>
                </div>
                 <div className="row mb-4">
                  <div className="col-md-4 fw-bold text-muted">Conteudo:</div>
                  <div className="col-md-8">{client.contents && client.contents.length > 0
                        ? client.contents.map(c => c.name).join(', ')
                        : 'N/A'}</div>
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
