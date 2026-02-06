import React, { useState, useEffect } from 'react'
import { Modal, Button, Form } from 'react-bootstrap'

export interface SelectOption {
  value: string
  label: string
}

// Dados para edição
export interface EditData {
  name: string
  secretarioId?: string
}

type Props = {
  show: boolean
  title: string
  placeholder: string
  onClose: () => void
  onCreate: (name: string, secretarioId?: string) => void
  // Opções de secretário para vincular
  secretarioOptions?: SelectOption[]
  secretarioLabel?: string
  secretarioPlaceholder?: string
  isLoadingSecretarios?: boolean
  // Modo de edição
  editMode?: boolean
  editData?: EditData
  // Props antigas mantidas para compatibilidade
  subsecretariaOptions?: SelectOption[]
  selectedSubsecretaria?: string
  onSelectSubsecretaria?: (value: string) => void
}

const CreateOptionModal: React.FC<Props> = ({
  show,
  title,
  placeholder,
  onClose,
  onCreate,
  secretarioOptions,
  secretarioLabel,
  secretarioPlaceholder,
  isLoadingSecretarios,
  editMode = false,
  editData,
  subsecretariaOptions,
  selectedSubsecretaria,
  onSelectSubsecretaria
}) => {
  const [name, setName] = useState('')
  const [selectedSecretarioId, setSelectedSecretarioId] = useState<string>('')

  useEffect(() => {
    if (show && editMode && editData) {
      setName(editData.name || '')
      setSelectedSecretarioId(editData.secretarioId || '')
    } else if (!show) {
      setName('')
      setSelectedSecretarioId('')
    }
  }, [show, editMode, editData])

  const handleCreate = () => {
    if (name.trim()) {
      onCreate(name.trim(), selectedSecretarioId || undefined)
      onClose()
    }
  }

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Campo nome */}
        <Form.Group className='mb-4'>
          <Form.Label className='fw-bold'>Nome <span className='text-danger'>*</span></Form.Label>
          <Form.Control
            type='text'
            placeholder={placeholder}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleCreate()
              }
            }}
          />
        </Form.Group>

        {/* Campo para selecionar secretário */}
        {secretarioOptions && (
          <Form.Group className='mb-3'>
            <Form.Label className='fw-bold'>
              {secretarioLabel || 'Secretário'} <span className='text-muted fs-7'>(opcional)</span>
            </Form.Label>
            {isLoadingSecretarios ? (
              <div className='d-flex align-items-center text-muted fs-7'>
                <span className='spinner-border spinner-border-sm me-2'></span>
                Carregando...
              </div>
            ) : (
              <Form.Select
                value={selectedSecretarioId}
                onChange={(e) => setSelectedSecretarioId(e.target.value)}
              >
                <option value=''>{secretarioPlaceholder || 'Selecione um secretário...'}</option>
                {secretarioOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Form.Select>
            )}
          </Form.Group>
        )}

        {/* Exibe as opções de subsecretaria se existirem (mantido para compatibilidade) */}
        {subsecretariaOptions && subsecretariaOptions.length > 0 && (
          <div className='mb-3'>
            <strong>Subsecretarias disponíveis:</strong>
            <ul>
              {subsecretariaOptions.map((opt) => (
                <li
                  key={opt.value}
                  style={{ fontWeight: selectedSubsecretaria === opt.value ? 'bold' : 'normal' }}
                >
                  {opt.label}
                  {onSelectSubsecretaria && (
                    <Button
                      size='sm'
                      variant='outline-primary'
                      className='ms-2'
                      onClick={() => onSelectSubsecretaria(opt.value)}
                    >
                      Selecionar
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant='secondary' onClick={onClose}>
          Cancelar
        </Button>
        <Button variant='primary' onClick={handleCreate} disabled={!name.trim()}>
          {editMode ? 'Atualizar' : 'Salvar'}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export { CreateOptionModal }