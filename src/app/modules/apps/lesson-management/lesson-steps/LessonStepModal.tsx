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
  suggestion: string
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
  type: Yup.string().required('O tipo de etapa é obrigatório'),
  character: Yup.string().required('O personagem é obrigatório'),
  sequence: Yup.number().min(1, 'A sequência deve ser 1 ou mais').required('A sequência é obrigatória'),
  active: Yup.boolean().required('O status é obrigatório'),
  suggestion: Yup.string(),
})

const StepModal: FC<StepModalProps> = ({ show, handleClose, step, lessonSequence, onSave }) => {
  const isEdit = step !== null

  const formik = useFormik({
    initialValues: {
      title: step?.title || '',
      type: step?.type || '',
      active: step?.active ?? true,
      sequence: step?.sequence || lessonSequence,
      character: step?.character || '',
      suggestion: step?.suggestion || '',
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

            {/* Tipo */}
            <div className='col-md-6 fv-row mb-5'>
              <label className='form-label required text-gray-700 dark:text-gray-300'>Tipo da Etapa</label>
              <select
                className='form-select form-select-solid'
                {...formik.getFieldProps('type')}
              >
                <option value=''>Selecione o Tipo</option>
                <option value='Item'>Item</option>
                <option value='Npc'>Npc</option>
              </select>
              {formik.touched.type && formik.errors.type && (
                <div className='fv-plugins-message-container'>
                  <div className='fv-help-block'>{formik.errors.type}</div>
                </div>
              )}
            </div>

            {/* Sequência */}
            <div className='col-md-4 fv-row mb-5'>
              <label className='form-label required text-gray-700 dark:text-gray-300'>Sequência</label>
              <input
                type='number'
                className='form-control form-control-solid'
                {...formik.getFieldProps('sequence')}
              />
              {formik.touched.sequence && formik.errors.sequence && (
                <div className='fv-plugins-message-container'>
                  <div className='fv-help-block'>{formik.errors.sequence}</div>
                </div>
              )}
            </div>

            {/* Personagem */}
            <div className='col-md-4 fv-row mb-5'>
              <label className='form-label required text-gray-700 dark:text-gray-300'>Tipo de NPC</label>
              <select
                className='form-select form-select-solid'
                {...formik.getFieldProps('character')}
              >
                <option value=''>Selecione o Tipo de NPC</option>
                <option value='Passive'>Passive</option>
                <option value='Enemy'>Enemy</option>
                <option value='Friend'>Friend</option>
              </select>
              {formik.touched.character && formik.errors.character && (
                <div className='fv-plugins-message-container'>
                  <div className='fv-help-block'>{formik.errors.character}</div>
                </div>
              )}
            </div>

            {/* Checkbox Ativo */}
            <div className='col-md-4 fv-row mb-5 pt-10'>
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

          {/* Sugestões */}
          <div className='fv-row mb-5'>
            <label className='form-label text-gray-700 dark:text-gray-300'>Sugestões</label>
            <textarea
              className='form-control form-control-solid'
              rows={3}
              placeholder='Sugestões de conteúdo ou links...'
              {...formik.getFieldProps('suggestion')}
            />
            {formik.touched.suggestion && formik.errors.suggestion && (
              <div className='fv-plugins-message-container'>
                <div className='fv-help-block'>{formik.errors.suggestion}</div>
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
