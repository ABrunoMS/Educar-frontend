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

  const titleText = isEdit ? `Editar Etapa: ${step?.title}` : `Adicionar Nova Etapa`

  return (
    <Modal show={show} onHide={handleClose} size='lg' centered backdrop='static'>
      {/* Header */}
      <Modal.Header closeButton className='bg-body border-0 pb-0'>
        <Modal.Title className='fs-3 fw-bold text-gray-900'>{titleText}</Modal.Title>
      </Modal.Header>

      {/* Body */}
      <Modal.Body className='bg-body px-10 py-8'>
        {/* Cabeçalho com ícone */}
        <div className='text-center mb-10'>
          <div className='rounded-circle bg-primary d-flex align-items-center justify-content-center mx-auto mb-5' style={{ width: '80px', height: '80px' }}>
            <i className='ki-duotone ki-flag fs-2x text-white'>
              <span className='path1'></span>
              <span className='path2'></span>
            </i>
          </div>
          <h3 className='fs-2 fw-bold text-gray-900 mb-2'>
            {isEdit ? 'Editar Etapa' : `Etapa ${lessonSequence}º`}
          </h3>
          <p className='text-gray-600'>
            {isEdit 
              ? 'Atualize as informações da etapa abaixo' 
              : 'Preencha as informações para criar uma nova etapa na aula'}
          </p>
        </div>

        <form className='form' onSubmit={formik.handleSubmit} noValidate>
          {/* Card com os campos */}
          <div className='card card-body shadow-sm mb-8'>
            <div className='row g-5'>
              {/* Apelido/Título */}
              <div className='col-md-8'>
                <label className='form-label required text-gray-700 fw-bold'>
                  <i className='ki-duotone ki-pencil fs-5 me-2 text-primary'>
                    <span className='path1'></span>
                    <span className='path2'></span>
                  </i>
                  Título da Etapa
                </label>
                <input
                  type='text'
                  className='form-control form-control-lg form-control-solid'
                  placeholder='Ex: Quiz Básico de Verbos'
                  {...formik.getFieldProps('title')}
                />
                {formik.touched.title && formik.errors.title && (
                  <div className='fv-help-block text-danger mt-2'>
                    <i className='ki-duotone ki-information-5 fs-5 me-1'></i>
                    {formik.errors.title}
                  </div>
                )}
              </div>

              {/* Toggle Ativo */}
              <div className='col-md-4'>
                <label className='form-label text-gray-700 fw-bold'>Status</label>
                <div 
                  className={`card card-bordered cursor-pointer p-4 ${
                    formik.values.active ? 'border-success bg-light-success' : 'border-secondary'
                  }`}
                  onClick={() => formik.setFieldValue('active', !formik.values.active)}
                >
                  <div className='d-flex align-items-center'>
                    <div className='form-check form-switch form-check-custom form-check-solid'>
                      <input
                        className='form-check-input'
                        type='checkbox'
                        id='active'
                        checked={formik.values.active}
                        onChange={() => formik.setFieldValue('active', !formik.values.active)}
                        style={{ width: '50px', height: '26px' }}
                      />
                    </div>
                    <div className='ms-3'>
                      <span className={`fw-bold ${formik.values.active ? 'text-success' : 'text-gray-600'}`}>
                        {formik.values.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enunciado */}
            <div className='mt-8'>
              <label className='form-label text-gray-700 fw-bold'>
                <i className='ki-duotone ki-message-text fs-5 me-2 text-primary'>
                  <span className='path1'></span>
                  <span className='path2'></span>
                  <span className='path3'></span>
                </i>
                Enunciado / Descrição
                <span className='text-gray-500 fs-7 ms-2'>(opcional)</span>
              </label>
              <textarea
                className='form-control form-control-solid'
                rows={4}
                placeholder='Descreva o contexto ou instruções desta etapa para o aluno...'
                {...formik.getFieldProps('statement')}
              />
            </div>
          </div>

          {/* Informação adicional */}
          <div className='alert alert-light-info d-flex align-items-center mb-8'>
            <i className='ki-duotone ki-information-5 fs-2 text-info me-3'>
              <span className='path1'></span>
              <span className='path2'></span>
              <span className='path3'></span>
            </i>
            <div>
              <span className='text-gray-700'>
                Após criar a etapa, você poderá adicionar <strong>questões</strong> (exercícios ou conteúdos informativos) a ela.
              </span>
            </div>
          </div>

          {/* Botões */}
          <div className='d-flex justify-content-between pt-5 border-top'>
            <div></div>
            <div className='d-flex gap-3'>
              <button
                type='button'
                className='btn btn-light'
                onClick={handleClose}
                disabled={formik.isSubmitting}
              >
                Cancelar
              </button>
              <button
                type='submit'
                className='btn btn-primary'
                disabled={formik.isSubmitting || !formik.values.title}
              >
                {formik.isSubmitting ? (
                  <span className='indicator-progress d-block'>
                    Salvando...
                    <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                  </span>
                ) : (
                  <>
                    <i className='ki-duotone ki-check fs-4 me-1'></i>
                    {isEdit ? 'Salvar Alterações' : 'Criar Etapa'}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  )
}

export default StepModal
