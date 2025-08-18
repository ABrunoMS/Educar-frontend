import React from 'react'
import { useQuery, UseQueryResult } from 'react-query'
import { getClientById } from '../../../../modules/apps/client-management/clients-list/core/_requests' 
import { ClientType } from '@interfaces/Client'
import { KTIcon } from '@metronic/helpers' 

type Props = {
  clientId: string
  onClose: () => void
}

const ClientDetailsModal: React.FC<Props> = ({ clientId, onClose }) => {
  const { 
    data: client, 
    isLoading, 
    error 
  }: UseQueryResult<ClientType, Error> = useQuery(
    ['clientDetails', clientId],
    () => getClientById(clientId),
    {
      // A query só será executada se houver um clientId
      enabled: !!clientId, 
    }
  )

  return (

    <div className='modal fade show d-block' tabIndex={-1}>
      <div className='modal-dialog modal-dialog-centered mw-650px'>
        <div className='modal-content'>
          <div className='modal-header'>
            <h2 className='fw-bolder'>Detalhes do Cliente</h2>
            <div
              className='btn btn-icon btn-sm btn-active-icon-primary'
              onClick={onClose}
            >
              <KTIcon iconName='cross' className='fs-1' />
            </div>
          </div>
          <div className='modal-body py-10 px-lg-17'>
            {isLoading && <div>Carregando...</div>}
            {error && <div>Ocorreu um erro: {error.message}</div>}
            {client && (
              <div>
                <div className='row mb-4'>
                  <div className='col-md-4 fw-bold text-muted'>Nome:</div>
                  <div className='col-md-8'>{client.name}</div>
                </div>
                <div className='row mb-4'>
                  <div className='col-md-4 fw-bold text-muted'>Descrição:</div>
                  <div className='col-md-8'>{client.description || 'N/A'}</div>
                </div>
                <div className='row mb-4'>
                  <div className='col-md-4 fw-bold text-muted'>Parceiro:</div>
                  <div className='col-md-8'>{client.partner || 'N/A'}</div>
                </div>
                <div className='row mb-4'>
                  <div className='col-md-4 fw-bold text-muted'>Total de Contas:</div>
                  <div className='col-md-8'>{client.totalAccounts}</div>
                </div>
                <div className='row mb-4'>
                  <div className='col-md-4 fw-bold text-muted'>Contas Restantes:</div>
                  <div className='col-md-8'>{client.remainingAccounts}</div>
                </div>
                {/* Adicione outros campos que desejar */}
              </div>
            )}
          </div>
          <div className='modal-footer flex-center'>
            <button className='btn btn-light' onClick={onClose}>
              Fechar
            </button>
          </div>
        </div>
      {/* Fundo escuro do modal */}
      {/*<div className='modal-backdrop fade show'></div>*/}
      </div>
    </div>
  )
}

export { ClientDetailsModal }