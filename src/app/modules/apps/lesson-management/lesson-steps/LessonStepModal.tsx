import React, { FC } from 'react'
import { Modal } from 'react-bootstrap'
import { useFormik } from 'formik'
import * as Yup from 'yup'

// Tipagem para a Etapa
interface Step {
  id: string | null
  type: string
  title: string
  active: boolean
  sequence: number
  character: string
  statement: string
}

// Props do Modal
interface StepModalProps {
  show: boolean
  handleClose: () => void
  step: Step | null
  lessonSequence: number
  onSave: (step: Omit<Step, 'id'>) => void
}

const stepSchema = Yup.object().shape({
  title: Yup.string().required('O título (apelido) é obrigatório'),
  active: Yup.boolean().required('O status é obrigatório'),
  statement: Yup.string(),
})

const StepModal: FC<StepModalProps> = ({ show, handleClose, step, lessonSequence, onSave }) => {
  const isEdit = step !== null

  const formik = useFormik({
    initialValues: {
      title: step?.title || '',
      type: step?.type || 'Npc',
      active: step?.active ?? true,
      sequence: step?.sequence || lessonSequence,
      character: step?.character || 'Passive',
      statement: step?.statement || '',
    },
    validationSchema: stepSchema,
    enableReinitialize: true,
    onSubmit: (values, { setSubmitting }) => {
      onSave(values)
      setSubmitting(false)
      handleClose()
    },
  })

  const titleText = isEdit ? `Editar Etapa: ${step?.title}` : `Adicionar Nova Etapa (${lessonSequence}º)`

  return (
    <Modal show={show} onHide={handleClose} size='lg' centered>
      {/* Header */}
      <Modal.Header closeButton className='bg-body border-0'>
        <Modal.Title className='fs-3 fw-bold text-gray-900 dark:text-white'>{titleText}</Modal.Title>
      </Modal.Header>

      {/* Body */}
      <Modal.Body className='bg-body'>
        <form className='form' onSubmit={formik.handleSubmit} noValidate>
          <div className='row mb-5'>

            {/* Apelido/Título */}
            <div className='col-md-6 fv-row mb-5'>
              <label className='form-label required text-gray-700 dark:text-gray-300'>Apelido/Título</label>
              <input
                type='text'
                className='form-control form-control-solid'
                placeholder='Ex: Quiz Básico de Verbos'
                {...formik.getFieldProps('title')}
              />
              {formik.touched.title && formik.errors.title && (
                <div className='fv-plugins-message-container'>
                  <div className='fv-help-block'>{formik.errors.title}</div>
                </div>
              )}
            </div>

            {/* Checkbox Ativo */}
            <div className='col-md-6 fv-row mb-5 pt-10'>
              <div className='form-check form-check-custom form-check-solid'>
                <input
                  className='form-check-input'
                  type='checkbox'
                  id='active'
                  checked={formik.values.active}
                  {...formik.getFieldProps('active')}
                />
                <label className='form-check-label text-gray-700 dark:text-gray-300' htmlFor='active'>
                  Está Ativo?
                </label>
              </div>
            </div>
          </div>

          {/* Enunciado */}
          <div className='fv-row mb-5'>
            <label className='form-label text-gray-700 dark:text-gray-300'>Enunciado</label>
            <textarea
              className='form-control form-control-solid'
              rows={3}
              placeholder='Enunciado da etapa...'
              {...formik.getFieldProps('statement')}
            />
            {formik.touched.statement && formik.errors.statement && (
              <div className='fv-plugins-message-container'>
                <div className='fv-help-block'>{formik.errors.statement}</div>
              </div>
            )}
          </div>

          {/* Botões */}
          <div className='text-end pt-5'>
            <button
              type='button'
              className='btn btn-light me-3'
              onClick={handleClose}
              disabled={formik.isSubmitting}
            >
              Cancelar
            </button>
            <button
              type='submit'
              className='btn btn-primary'
              disabled={formik.isSubmitting || !formik.isValid || !formik.touched}
            >
              <span className='indicator-label'>
                {formik.isSubmitting ? 'Salvando...' : (isEdit ? 'Salvar Edição' : 'Adicionar Etapa')}
              </span>
            </button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  )
}

export default StepModal
