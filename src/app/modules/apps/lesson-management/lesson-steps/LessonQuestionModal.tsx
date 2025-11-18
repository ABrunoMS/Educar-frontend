import React, { FC, useState, useEffect } from 'react'
import { Modal } from 'react-bootstrap'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { Question, AnswerOption } from '@interfaces/Lesson'

// Tipagem simplificada para a Opção de Resposta
/*interface AnswerOption {
  id: number
  image: string
  text: string
  isCorrect: boolean
}*/

// Tipagem da Questão (Atividade)
/*interface Question {
  id: number
  activityType: string
  sequence: number
  questionType: string
  weight: number
  isActive: boolean
  contentImage: string
  title: string
  comments: string
  options: AnswerOption[]
  shuffleAnswers: boolean
  alwaysCorrect: boolean
}
*/
interface QuestionModalProps {
  show: boolean
  handleClose: () => void
  question: Question | null
  onSave: (question: Question) => void
  stepTitle: string
}

const questionSchema = Yup.object().shape({
  activityType: Yup.string().required('Atividade é obrigatória'),
  questionType: Yup.string().required('Tipo de questão é obrigatório'),
  title: Yup.string().required('Titulo é obrigatória'),
  sequence: Yup.number()
    .min(1, 'A sequência deve ser no mínimo 1')
    .required('Sequência é obrigatória'),
})

const defaultInitialValues: Question = {
  id: Date.now(),
  activityType: 'Exercise',
  sequence: 1,
  questionType: 'MultipleChoice',
  weight: 1,
  isActive: true,
  contentImage: '',
  title: '',
  comments: '',
  options: [],
  description: '',
  shuffleAnswers: false,
  alwaysCorrect: false,
}

const LessonQuestionModal: FC<QuestionModalProps> = ({
  show,
  handleClose,
  question,
  onSave,
  stepTitle,
}) => {
  const isEdit = question !== null
  const [answerOptions, setAnswerOptions] = useState<AnswerOption[]>([])

  const formik = useFormik<Question>({
    initialValues: question || defaultInitialValues,
    validationSchema: questionSchema,
    enableReinitialize: true,
    onSubmit: (values, { setSubmitting }) => {
      const finalQuestion: Question = { ...values, options: answerOptions }
      onSave(finalQuestion)
      setSubmitting(false)
    },
  })

  useEffect(() => {
    if (question) {
      setAnswerOptions(
        question.options && question.options.length > 0
          ? question.options
          : [{ id: Date.now(), image: '', text: '', isCorrect: false }]
      )
    } else {
      setAnswerOptions([{ id: Date.now(), image: '', text: '', isCorrect: false }])
    }
  }, [question])

  const handleModalClose = () => {
    formik.resetForm()
    setAnswerOptions([])
    handleClose()
  }

  const handleAddOption = () => {
    setAnswerOptions([...answerOptions, { id: Date.now(), image: '', text: '', isCorrect: false }])
  }

  const handleRemoveOption = (id: string | number) => {
    if (answerOptions.length > 1) {
      setAnswerOptions(answerOptions.filter(opt => opt.id !== id))
    }
  }

  const handleUpdateOption = (id: string | number, key: keyof AnswerOption, value: any) => {
    setAnswerOptions(prev =>
      prev.map(opt => {
        if (opt.id === id) {
          // Escolha Única: se marcou como correta, desmarca as outras
          if (key === 'isCorrect' && formik.values.questionType === 'Escolha Única' && value) {
            return { ...opt, [key]: value }
          }
          return { ...opt, [key]: value }
        }
        if (key === 'isCorrect' && formik.values.questionType === 'Escolha Única' && value) {
          return { ...opt, isCorrect: false }
        }
        return opt
      })
    )
  }

  const titleText = isEdit
    ? `Editar Questão para Etapa: ${stepTitle}`
    : `Criar Questão para Etapa: ${stepTitle}`

  return (
    <Modal show={show} onHide={handleModalClose} size='xl' centered scrollable backdrop='static'>
      <Modal.Header closeButton className='bg-body border-0'>
        <Modal.Title className='fs-3 fw-bold text-gray-900 dark:text-white'>{titleText}</Modal.Title>
      </Modal.Header>

      <Modal.Body className='bg-body p-8'>
        <form className='form' onSubmit={formik.handleSubmit} noValidate>
          {/* Configurações básicas */}
          <div className='row mb-8 g-5 align-items-end'>
            <div className='col-md-3 fv-row'>
              <label className='form-label required text-gray-700 dark:text-gray-300'>Atividade</label>
              <select className='form-select form-select-solid' {...formik.getFieldProps('activityType')}>
                <option value='Exercise'>Exercise (Pergunta)</option>
                <option value='Informative'>Informative (Conteúdo)</option>
              </select>
            </div>
            <div className='col-md-3 fv-row'>
              <label className='form-label required text-gray-700 dark:text-gray-300'>Sequência</label>
              <input type='number' className='form-control form-control-solid' {...formik.getFieldProps('sequence')} />
              {formik.touched.sequence && formik.errors.sequence && (
                <div className='fv-help-block text-danger'>{formik.errors.sequence}</div>
              )}
            </div>
            <div className='col-md-3 fv-row'>
              <label className='form-label required text-gray-700 dark:text-gray-300'>Tipo de pergunta</label>
              <select className='form-select form-select-solid' {...formik.getFieldProps('questionType')}>
                <option value='MultipleChoice'>Múltipla Escolha</option>
                <option value='SingleChoice'>Escolha Única</option>
                <option value='TrueOrFalse'>Verdadeiro ou Falso</option>
                <option value='Dissertative'>Dissertativa</option>
                <option value='ColumnFill'>Preencher Colunas</option>
                <option value='AlwaysCorrect'>Sempre Correta</option>
              </select>
            </div>
            <div className='col-md-2 fv-row'>
              <label className='form-label text-gray-700 dark:text-gray-300'>Peso</label>
              <input type='number' className='form-control form-control-solid' {...formik.getFieldProps('weight')} />
            </div>
            <div className='col-md-1 fv-row pt-8'>
              <label className='form-check form-switch form-check-custom form-check-solid'>
                <input
                  className='form-check-input'
                  type='checkbox'
                  id='isActive'
                  {...formik.getFieldProps('isActive')}
                  checked={formik.values.isActive}
                />
                <span className='form-check-label text-gray-700 dark:text-gray-300'>Ativo</span>
              </label>
            </div>
          </div>

          {/* Imagem do conteúdo */}
          <div className='mb-8'>
            <label className='form-label text-gray-700 dark:text-gray-300 fw-bold'>Imagem do Conteúdo</label>
            <input type='text' className='form-control form-control-solid mb-3' {...formik.getFieldProps('contentImage')} placeholder='URL da Imagem' />
            {formik.values.contentImage && (
              <img src={formik.values.contentImage} alt='Conteúdo' className='img-fluid rounded border' style={{ maxHeight: '200px', objectFit: 'contain' }} />
            )}
          </div>

          {/*title */}
          <div className='fv-row mb-8'>
            <label className='form-label required text-gray-700 dark:text-gray-300'>Título da Atividade</label>
            <textarea className='form-control form-control-solid' rows={3} {...formik.getFieldProps('title')} />
            {formik.touched.title && formik.errors.title && (
              <div className='fv-help-block text-danger'>{formik.errors.title}</div>
            )}
          </div>

          {/* Comentários */}
          <div className='fv-row mb-8'>
            <label className='form-label text-gray-700 dark:text-gray-300'>Comentários (Espaço do Prof. Regente)</label>
            <textarea className='form-control form-control-solid' rows={5} {...formik.getFieldProps('comments')} placeholder='Comentários e feedback para o professor regente...' />
          </div>

          {/* Opções de Resposta */}
          <div className='card card-body shadow-sm border border-dashed'>
            <h4 className='mb-5 text-gray-900 dark:text-white'>Opções de Resposta ({formik.values.questionType})</h4>
            <div className='table-responsive'>
              <table className='table table-row-bordered table-rounded gs-7'>
                <thead>
                  <tr className='fw-bold fs-6 text-gray-600 dark:text-gray-400'>
                    <th className='w-50px'>#</th>
                    <th className='w-100px'>Imagem</th>
                    <th>Opção de resposta</th>
                    <th className='w-120px text-center'>Correta?</th>
                    <th className='w-100px text-center'>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {answerOptions.map((opt, index) => (
                    <tr key={opt.id}>
                      <td>{index + 1}</td>
                      <td>
                        <div className='d-flex align-items-center justify-content-center' style={{ height: '50px' }}>
                          <i className='ki-duotone ki-picture fs-3 text-gray-600'></i>
                        </div>
                      </td>
                      <td>
                        <input
                          type='text'
                          className='form-control form-control-sm form-control-solid'
                          value={opt.text}
                          onChange={e => handleUpdateOption(opt.id, 'text', e.target.value)}
                          required
                        />
                      </td>
                      <td className='text-center'>
                        <input
                          className='form-check-input'
                          type='checkbox'
                          checked={opt.isCorrect}
                          onChange={e => handleUpdateOption(opt.id, 'isCorrect', e.target.checked)}
                        />
                      </td>
                      <td className='text-center'>
                        <button type='button' className='btn btn-icon btn-sm btn-light-danger me-2' onClick={() => handleRemoveOption(opt.id)} disabled={answerOptions.length === 1}>
                          <i className='ki-duotone ki-trash fs-5'></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button type='button' className='btn btn-light-info btn-sm mt-3' onClick={handleAddOption}>
                <i className='ki-duotone ki-plus fs-5'></i> Adicionar Opção
              </button>
            </div>
          </div>

          {/* Botões */}
          <div className='text-end pt-10'>
            <button type='button' className='btn btn-light me-3' onClick={handleModalClose}>
              Cancelar
            </button>
            <button type='submit' className='btn btn-primary' disabled={formik.isSubmitting || !formik.isValid}>
              {formik.isSubmitting ? 'Salvando...' : isEdit ? 'Salvar e Voltar' : 'Criar Questão'}
            </button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  )
}

export default LessonQuestionModal
