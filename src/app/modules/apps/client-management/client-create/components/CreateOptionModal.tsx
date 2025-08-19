import React, { useState, useEffect } from 'react'
import { Modal, Button, Form } from 'react-bootstrap'

type Props = {
  show: boolean
  title: string
  placeholder: string
  onClose: () => void
  onCreate: (value: string) => void
}

const CreateOptionModal: React.FC<Props> = ({ show, title, placeholder, onClose, onCreate }) => {
  const [value, setValue] = useState('')

  useEffect(() => {
    if (!show) {
      setValue('')
    }
  }, [show])

  const handleCreate = () => {
    if (value.trim()) {
      onCreate(value.trim())
      onClose()
    }
  }

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group>
          <Form.Control
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleCreate()
              }
            }}
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Fechar
        </Button>
        <Button variant="primary" onClick={handleCreate}>
          Salvar
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export { CreateOptionModal }