import React, { FC, useState, useEffect, useRef } from 'react'
import { Modal } from 'react-bootstrap'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { Question, AnswerOption } from '@interfaces/Lesson'

interface QuestionModalProps {
  show: boolean
  handleClose: () => void
  question: Question | null
  onSave: (question: Question) => void
  stepTitle: string
  defaultSequence?: number
}

// Tipos de atividade
type ActivityType = 'Exercise' | 'Informative'
// Tipos de conteúdo informativo
type ContentType = 'text' | 'video'
// Tipos de questão
type QuestionTypeOption = 'MultipleChoice' | 'SingleChoice' | 'TrueOrFalse' | 'Dissertative' | 'Ordering' | 'ColumnFill' | 'MatchTwoRows'

// Schema de validação
const validationSchema = Yup.object().shape({
  title: Yup.string().required('Título é obrigatório'),
  sequence: Yup.number().min(1, 'Mínimo 1').required('Sequência é obrigatória'),
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
  defaultSequence = 1,
}) => {
  const isEdit = question !== null
  
  // Estado do wizard
  const [currentStep, setCurrentStep] = useState(1)
  const [activityType, setActivityType] = useState<ActivityType>('Exercise')
  const [contentType, setContentType] = useState<ContentType>('text')
  const [questionType, setQuestionType] = useState<QuestionTypeOption>('MultipleChoice')
  
  // Estado das opções de resposta
  const [answerOptions, setAnswerOptions] = useState<AnswerOption[]>([
    { id: Date.now(), image: '', text: '', isCorrect: false }
  ])
  
  // Estado do upload
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  // Estados para novos tipos de questão
  const [orderingItems, setOrderingItems] = useState<string[]>(['Item 1', 'Item 2'])
  const [correctOrder, setCorrectOrder] = useState<number[] | null>(null)

  const [columnPairs, setColumnPairs] = useState<{ left: string; right: string }[]>([
    { left: 'Chave 1', right: 'Resposta 1' }
  ])
  const [fillText, setFillText] = useState<string>('')
  const [fillAnswers, setFillAnswers] = useState<string[]>([''])

  const [matchLeft, setMatchLeft] = useState<string[]>(['Esquerda 1', 'Esquerda 2'])
  const [matchRight, setMatchRight] = useState<string[]>(['Direita 1', 'Direita 2'])
  const [matchMap, setMatchMap] = useState<Record<number, number>>({ 0: 0, 1: 1 })

  const formik = useFormik<Question>({
    initialValues: question || { ...defaultInitialValues, sequence: defaultSequence },
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values, { setSubmitting }) => {
      // Só permite salvar se estiver na última etapa
      const lastStep = activityType === 'Informative' ? 2 : 3
      if (currentStep !== lastStep) {
        setSubmitting(false)
        return
      }
      
      const finalQuestion: Question = {
        ...values,
        description: questionType === 'ColumnFill' && fillText ? fillText : values.description,
        activityType,
        questionType: activityType === 'Exercise' ? questionType : 'AlwaysCorrect',
        options: activityType === 'Exercise' && questionType !== 'Dissertative' ? answerOptions : [],
        weight: activityType === 'Exercise' ? values.weight : 1,
        // incluir campos custom para os novos tipos (serão serializados pelo page)
        orderingItems: questionType === 'Ordering' ? orderingItems : undefined,
        correctOrder: questionType === 'Ordering' ? (correctOrder ?? orderingItems.map((_, i) => i)) : undefined,
        columnFillMatches: questionType === 'ColumnFill'
          ? (fillAnswers && fillAnswers.length > 0
              ? fillAnswers.map((ans, i) => ({ left: String(i), right: ans }))
              : columnPairs)
          : undefined,
        matchLeft: questionType === 'MatchTwoRows' ? matchLeft : undefined,
        matchRight: questionType === 'MatchTwoRows' ? matchRight : undefined,
        matchPairs: questionType === 'MatchTwoRows' ? Object.entries(matchMap).map(([l, r]) => ({ leftIndex: Number(l), rightIndex: Number(r) })) : undefined,
      }
      onSave(finalQuestion)
      setSubmitting(false)
    },
  })

  // Referência para saber se é a primeira vez abrindo o modal
  const isFirstOpen = useRef(true)

  // Inicializa estados quando abre o modal com uma questão existente
  useEffect(() => {
    // Só executa quando o modal abre (show muda para true)
    if (!show) {
      isFirstOpen.current = true
      return
    }
    
    // Só reseta na primeira abertura
    if (!isFirstOpen.current) {
      return
    }
    isFirstOpen.current = false

    if (question) {
      setActivityType(question.activityType as ActivityType || 'Exercise')
      setQuestionType(question.questionType as QuestionTypeOption || 'MultipleChoice')
      setAnswerOptions(
        question.options && question.options.length > 0
          ? question.options
          : getDefaultOptionsForType(question.questionType as QuestionTypeOption || 'MultipleChoice')
      )
      // Initialize fill-in-the-blank answers when editing an existing ColumnFill
      if (question.questionType === 'ColumnFill') {
        // Try to read columnFillMatches which may be an object map or an array
        const ea: any = (question as any).columnFillMatches || (question as any).expectedAnswers?.matches || (question as any).matches
        if (ea) {
          try {
            if (Array.isArray(ea)) {
              setFillAnswers(ea.map((p: any) => p.right || ''))
            } else if (typeof ea === 'object') {
              const keys = Object.keys(ea).sort((a, b) => Number(a) - Number(b))
              const answers = keys.map(k => ea[k])
              setFillAnswers(answers.length > 0 ? answers : [''])
            }
          } catch (e) {
            // ignore malformed
          }
        }
        // If description contains placeholder text, use it as fillText
        if (question.description) setFillText(question.description)
      }
      // Se está editando, vai direto para a última etapa relevante
      if (question.activityType === 'Exercise') {
        setCurrentStep(3)
      } else {
        setCurrentStep(2)
      }
    } else {
      setCurrentStep(1)
      setActivityType('Exercise')
      setContentType('text')
      setQuestionType('MultipleChoice')
      setAnswerOptions([{ id: Date.now(), image: '', text: '', isCorrect: false }])
    }
  }, [question, show])

  // Função para obter opções padrão baseado no tipo de questão
  const getDefaultOptionsForType = (type: QuestionTypeOption): AnswerOption[] => {
    // Todos os tipos começam com uma opção vazia
    return [{ id: Date.now(), image: '', text: '', isCorrect: false }]
  }

  const handleModalClose = () => {
    formik.resetForm()
    setCurrentStep(1)
    setActivityType('Exercise')
    setContentType('text')
    setQuestionType('MultipleChoice')
    setAnswerOptions([{ id: Date.now(), image: '', text: '', isCorrect: false }])
    setUploadedFile(null)
    // reset novos tipos
    setOrderingItems(['Item 1', 'Item 2'])
    setCorrectOrder(null)
    setColumnPairs([{ left: 'Chave 1', right: 'Resposta 1' }])
    setFillText('')
    setFillAnswers([''])
    setMatchLeft(['Esquerda 1', 'Esquerda 2'])
    setMatchRight(['Direita 1', 'Direita 2'])
    setMatchMap({ 0: 0, 1: 1 })
    handleClose()
  }

  // Navegação do wizard
  const goToStep = (step: number) => setCurrentStep(step)
  const nextStep = () => setCurrentStep(prev => prev + 1)
  const prevStep = () => setCurrentStep(prev => prev - 1)

  // Handlers das opções
  const handleAddOption = () => {
    setAnswerOptions([...answerOptions, { id: Date.now(), image: '', text: '', isCorrect: false }])
  }

  const handleRemoveOption = (id: string | number) => {
    if (answerOptions.length > 1) {
      setAnswerOptions(answerOptions.filter(opt => opt.id !== id))
    }
  }

  const handleUpdateOption = (id: string | number, key: keyof AnswerOption, value: any) => {
    const isSingleSelection = questionType === 'SingleChoice'
    
    setAnswerOptions(prev =>
      prev.map(opt => {
        if (opt.id === id) {
          return { ...opt, [key]: value }
        }
        if (key === 'isCorrect' && isSingleSelection && value) {
          return { ...opt, isCorrect: false }
        }
        return opt
      })
    )
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      const localUrl = URL.createObjectURL(file)
      formik.setFieldValue('contentImage', localUrl)
    }
  }

  const titleText = isEdit
    ? `Editar Questão para Etapa: ${stepTitle}`
    : `Criar Questão para Etapa: ${stepTitle}`

  // Verifica se pode avançar
  const canProceed = () => {
    if (currentStep === 1) return true
    if (currentStep === 2) {
      if (activityType === 'Informative') return formik.values.title.trim() !== ''
      return formik.values.title.trim() !== ''
    }
    return true
  }

  // Renderiza indicador de progresso
  const renderProgressIndicator = () => {
    const steps = activityType === 'Informative' 
      ? ['Tipo de Atividade', 'Conteúdo']
      : ['Tipo de Atividade', 'Configuração', 'Opções de Resposta']

    return (
      <div className='d-flex justify-content-center mb-10'>
        {steps.map((label, index) => {
          const stepNum = index + 1
          const isActive = currentStep === stepNum
          const isCompleted = currentStep > stepNum
          
          return (
            <div key={index} className='d-flex align-items-center'>
              <div 
                className={`d-flex flex-column align-items-center ${isCompleted ? 'cursor-pointer' : ''}`}
                onClick={() => isCompleted && goToStep(stepNum)}
              >
                <div 
                  className={`rounded-circle d-flex align-items-center justify-content-center mb-2 ${
                    isActive 
                      ? 'bg-primary text-white' 
                      : isCompleted 
                        ? 'bg-success text-white' 
                        : 'bg-light-secondary text-gray-600'
                  }`}
                  style={{ width: '40px', height: '40px' }}
                >
                  {isCompleted ? (
                    <i className='ki-duotone ki-check fs-3'></i>
                  ) : (
                    <span className='fw-bold'>{stepNum}</span>
                  )}
                </div>
                <span className={`text-center fs-7 ${isActive ? 'text-primary fw-bold' : 'text-gray-600'}`} style={{ maxWidth: '100px' }}>
                  {label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div 
                  className={`mx-3 ${isCompleted ? 'bg-success' : 'bg-light-secondary'}`} 
                  style={{ width: '60px', height: '3px', marginBottom: '20px' }}
                />
              )}
            </div>
          )
        })}
      </div>
    )
  }

  // ETAPA 1: Escolha do tipo de atividade
  const renderStep1 = () => (
    <div className='text-center'>
      <h3 className='fs-2 fw-bold text-gray-900 mb-3'>Qual tipo de atividade você deseja criar?</h3>
      <p className='text-gray-600 mb-10'>Escolha o tipo de conteúdo que será apresentado ao aluno</p>
      
      <div className='row g-5 justify-content-center'>
        {/* Card Exercício */}
        <div className='col-md-5'>
          <div 
            className={`card card-bordered h-100 cursor-pointer hover-elevate-up ${
              activityType === 'Exercise' ? 'border-primary border-2' : ''
            }`}
            onClick={() => setActivityType('Exercise')}
          >
            <div className='card-body d-flex flex-column align-items-center p-10'>
              <div className={`rounded-circle d-flex align-items-center justify-content-center mb-5 ${
                activityType === 'Exercise' ? 'bg-primary' : 'bg-light-primary'
              }`} style={{ width: '80px', height: '80px' }}>
                <i className={`ki-duotone ki-notepad-edit fs-2x ${
                  activityType === 'Exercise' ? 'text-white' : 'text-primary'
                }`}>
                  <span className='path1'></span>
                  <span className='path2'></span>
                </i>
              </div>
              <h4 className='fw-bold text-gray-900 mb-3'>Exercício</h4>
              <p className='text-gray-600 text-center mb-0'>
                Crie perguntas com opções de resposta como múltipla escolha, verdadeiro/falso ou dissertativa.
              </p>
              {activityType === 'Exercise' && (
                <div className='mt-5'>
                  <span className='badge badge-primary'>Selecionado</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card Informativo */}
        <div className='col-md-5'>
          <div 
            className={`card card-bordered h-100 cursor-pointer hover-elevate-up ${
              activityType === 'Informative' ? 'border-primary border-2' : ''
            }`}
            onClick={() => setActivityType('Informative')}
          >
            <div className='card-body d-flex flex-column align-items-center p-10'>
              <div className={`rounded-circle d-flex align-items-center justify-content-center mb-5 ${
                activityType === 'Informative' ? 'bg-primary' : 'bg-light-info'
              }`} style={{ width: '80px', height: '80px' }}>
                <i className={`ki-duotone ki-book-open fs-2x ${
                  activityType === 'Informative' ? 'text-white' : 'text-info'
                }`}>
                  <span className='path1'></span>
                  <span className='path2'></span>
                  <span className='path3'></span>
                  <span className='path4'></span>
                </i>
              </div>
              <h4 className='fw-bold text-gray-900 mb-3'>Informativo</h4>
              <p className='text-gray-600 text-center mb-0'>
                Apresente conteúdo informativo ao aluno através de texto ou vídeo, sem perguntas.
              </p>
              {activityType === 'Informative' && (
                <div className='mt-5'>
                  <span className='badge badge-primary'>Selecionado</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // ETAPA 2 para Informativo: Tipo de conteúdo
  const renderStep2Informative = () => (
    <div className='text-center'>
      <h3 className='fs-2 fw-bold text-gray-900 mb-3'>Qual tipo de conteúdo informativo?</h3>
      <p className='text-gray-600 mb-10'>Escolha como o conteúdo será apresentado ao aluno</p>
      
      <div className='row g-5 justify-content-center mb-10'>
        {/* Card Texto */}
        <div className='col-md-5'>
          <div 
            className={`card card-bordered h-100 cursor-pointer hover-elevate-up ${
              contentType === 'text' ? 'border-primary border-2' : ''
            }`}
            onClick={() => setContentType('text')}
          >
            <div className='card-body d-flex flex-column align-items-center p-8'>
              <div className={`rounded-circle d-flex align-items-center justify-content-center mb-4 ${
                contentType === 'text' ? 'bg-primary' : 'bg-light-primary'
              }`} style={{ width: '60px', height: '60px' }}>
                <i className={`ki-duotone ki-document fs-2x ${
                  contentType === 'text' ? 'text-white' : 'text-primary'
                }`}>
                  <span className='path1'></span>
                  <span className='path2'></span>
                </i>
              </div>
              <h5 className='fw-bold text-gray-900 mb-2'>Texto</h5>
              <p className='text-gray-600 text-center small mb-0'>
                Conteúdo em formato de texto
              </p>
            </div>
          </div>
        </div>

        {/* Card Vídeo */}
        <div className='col-md-5'>
          <div 
            className={`card card-bordered h-100 cursor-pointer hover-elevate-up ${
              contentType === 'video' ? 'border-primary border-2' : ''
            }`}
            onClick={() => setContentType('video')}
          >
            <div className='card-body d-flex flex-column align-items-center p-8'>
              <div className={`rounded-circle d-flex align-items-center justify-content-center mb-4 ${
                contentType === 'video' ? 'bg-primary' : 'bg-light-warning'
              }`} style={{ width: '60px', height: '60px' }}>
                <i className={`ki-duotone ki-youtube fs-2x ${
                  contentType === 'video' ? 'text-white' : 'text-warning'
                }`}>
                  <span className='path1'></span>
                  <span className='path2'></span>
                </i>
              </div>
              <h5 className='fw-bold text-gray-900 mb-2'>Vídeo</h5>
              <p className='text-gray-600 text-center small mb-0'>
                Conteúdo em formato de vídeo
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Campos do conteúdo */}
      <div className='text-start mt-8'>
        <div className='fv-row mb-5'>
          <label className='form-label required text-gray-700'>Título do Conteúdo</label>
          <input 
            type='text'
            className='form-control form-control-solid' 
            {...formik.getFieldProps('title')}
            placeholder='Digite o título do conteúdo...'
          />
          {formik.touched.title && formik.errors.title && (
            <div className='fv-help-block text-danger'>{formik.errors.title}</div>
          )}
        </div>

        {contentType === 'text' ? (
          <div className='fv-row mb-5'>
            <label className='form-label text-gray-700'>Texto do Conteúdo</label>
            <textarea 
              className='form-control form-control-solid' 
              rows={6}
              {...formik.getFieldProps('description')}
              placeholder='Digite o conteúdo informativo...'
            />
          </div>
        ) : (
          <div className='fv-row mb-5'>
            <label className='form-label text-gray-700'>Selecionar Vídeo</label>
            <div className='alert alert-warning d-flex align-items-center'>
              <i className='ki-duotone ki-information-5 fs-2 text-warning me-3'>
                <span className='path1'></span>
                <span className='path2'></span>
                <span className='path3'></span>
              </i>
              <span>Funcionalidade de seleção de vídeo ainda não disponível.</span>
            </div>
          </div>
        )}

        <div className='row g-5'>
          <div className='col-md-4'>
            <label className='form-label required text-gray-700'>Sequência</label>
            <input 
              type='number' 
              min={1}
              className='form-control form-control-solid'
              {...formik.getFieldProps('sequence')}
            />
          </div>
          <div className='col-md-4'>
            <label className='form-check form-switch form-check-custom form-check-solid mt-8'>
              <input
                className='form-check-input'
                type='checkbox'
                {...formik.getFieldProps('isActive')}
                checked={formik.values.isActive}
              />
              <span className='form-check-label text-gray-700'>Ativo</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )

  // ETAPA 2 para Exercício: Configuração da questão
  const renderStep2Exercise = () => (
    <div>
      <div className='text-center mb-10'>
        <h3 className='fs-2 fw-bold text-gray-900 mb-3'>Configure a questão</h3>
        <p className='text-gray-600'>Escolha o modelo e defina as configurações básicas</p>
      </div>

      {/* Tipo e Configurações (inputs movidos para o topo para melhor UX) */}
      <div className='mb-8'>
        <div className='row g-5 align-items-end'>
          <div className='col-md-4'>
            <label className='form-label fw-bold text-gray-700'>Modelo da Questão</label>
            <select
              className='form-select form-select-solid'
              value={questionType}
              onChange={e => setQuestionType(e.target.value as QuestionTypeOption)}
            >
              <option value='MultipleChoice'>Múltipla Escolha</option>
              <option value='SingleChoice'>Escolha Única</option>
              <option value='TrueOrFalse'>Verdadeiro ou Falso</option>
              <option value='Dissertative'>Dissertativa</option>
              <option value='Ordering'>Ordenação</option>
              <option value='ColumnFill'>Preencher Lacuna</option>
              <option value='MatchTwoRows'>Corresponder Duas Fileiras</option>
            </select>
          </div>

          <div className='col-md-2'>
            <label className='form-label text-gray-700'>Peso</label>
            <input
              type='number'
              min={0}
              step={0.1}
              className='form-control form-control-solid'
              {...formik.getFieldProps('weight')}
            />
          </div>

          <div className='col-md-2'>
            <label className='form-label required text-gray-700'>Sequência</label>
            <input
              type='number'
              min={1}
              className='form-control form-control-solid'
              {...formik.getFieldProps('sequence')}
            />
          </div>

          <div className='col-md-2'>
            <label className='form-check form-switch form-check-custom form-check-solid'>
              <input
                className='form-check-input'
                type='checkbox'
                {...formik.getFieldProps('isActive')}
                checked={formik.values.isActive}
              />
              <span className='form-check-label text-gray-700'>Ativo</span>
            </label>
          </div>
        </div>

        <div className='fv-row mb-5 mt-4'>
          <label className='form-label required text-gray-700'>Título da Questão</label>
          <textarea
            className='form-control form-control-solid'
            rows={3}
            {...formik.getFieldProps('title')}
            placeholder='Digite a pergunta ou enunciado da questão...'
          />
          {formik.touched.title && formik.errors.title && (
            <div className='fv-help-block text-danger'>{formik.errors.title}</div>
          )}
        </div>
      </div>

      {/* Upload de imagem */}
      <div className='mt-8'>
        <label className='form-label text-gray-700'>Imagem do Conteúdo (opcional)</label>
        <div className='d-flex gap-3 align-items-center'>
          <input
            type='file'
            ref={fileInputRef}
            className='d-none'
            accept='image/*'
            onChange={handleFileUpload}
          />
          <button 
            type='button' 
            className='btn btn-light-primary btn-sm'
            onClick={() => fileInputRef.current?.click()}
          >
            <i className='ki-duotone ki-file-up fs-4 me-2'>
              <span className='path1'></span>
              <span className='path2'></span>
            </i>
            {uploadedFile ? 'Alterar' : 'Upload'}
          </button>
          {uploadedFile && (
            <div className='d-flex align-items-center gap-2'>
              <span className='text-gray-600 small'>{uploadedFile.name}</span>
              <button 
                type='button' 
                className='btn btn-icon btn-sm btn-light-danger'
                onClick={() => {
                  setUploadedFile(null)
                  formik.setFieldValue('contentImage', '')
                }}
              >
                <i className='ki-duotone ki-cross fs-5'></i>
              </button>
            </div>
          )}
        </div>
        {formik.values.contentImage && (
          <img 
            src={formik.values.contentImage} 
            alt='Preview' 
            className='img-fluid rounded border mt-3' 
            style={{ maxHeight: '150px' }} 
          />
        )}
      </div>
    </div>
  )

  // ETAPA 3 para Exercício: Opções de resposta
  const renderStep3Exercise = () => {
    const isSingleChoice = questionType === 'SingleChoice'
    const isTrueOrFalse = questionType === 'TrueOrFalse'
    
    // Se for dissertativa, apenas confirmação (campo será exibido na plataforma do aluno)
    if (questionType === 'Dissertative') {
      return (
        <div>
          <div className='text-center mb-10'>
            <div className='rounded-circle bg-primary d-flex align-items-center justify-content-center mx-auto mb-5' style={{ width: '80px', height: '80px' }}>
              <i className='ki-duotone ki-message-text-2 fs-2x text-white'>
                <span className='path1'></span>
                <span className='path2'></span>
                <span className='path3'></span>
              </i>
            </div>
            <h3 className='fs-2 fw-bold text-gray-900 mb-3'>Questão Dissertativa</h3>
            <p className='text-gray-600'>O aluno terá um campo de texto livre para responder na plataforma.</p>
          </div>

          <div className='alert alert-info d-flex align-items-center mb-8'>
            <i className='ki-duotone ki-information-5 fs-2 text-info me-3'>
              <span className='path1'></span>
              <span className='path2'></span>
              <span className='path3'></span>
            </i>
            <span>Não é necessário configurar opções de resposta. O campo de texto será exibido automaticamente para o aluno na plataforma de atividades.</span>
          </div>

          {/* Resumo da configuração */}
          <div className='card card-body bg-light-secondary'>
            <h6 className='text-gray-900 mb-4'>Resumo da Questão</h6>
            <div className='row'>
              <div className='col-md-6'>
                <p className='text-gray-600 mb-1'>Título:</p>
                <p className='fw-bold text-gray-900'>{formik.values.title || '-'}</p>
              </div>
              <div className='col-md-3'>
                <p className='text-gray-600 mb-1'>Peso:</p>
                <p className='fw-bold text-gray-900'>{formik.values.weight}</p>
              </div>
              <div className='col-md-3'>
                <p className='text-gray-600 mb-1'>Sequência:</p>
                <p className='fw-bold text-gray-900'>{formik.values.sequence}</p>
              </div>
            </div>
            <div className='d-flex flex-wrap gap-3 mt-4'>
              <span className='badge badge-light-primary p-3'>
                <i className='ki-duotone ki-message-text-2 me-2'></i>
                Dissertativa
              </span>
              <span className='badge badge-light-success p-3'>
                {formik.values.isActive ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </div>
        </div>
      )
    }

    // Se for Verdadeiro ou Falso, usa checkboxes (múltiplas corretas permitidas)
    // Opções marcadas como corretas = Verdadeiras
    if (isTrueOrFalse) {
      return (
        <div>
          <div className='text-center mb-8'>
            <h3 className='fs-2 fw-bold text-gray-900 mb-3'>Verdadeiro ou Falso</h3>
            <p className='text-gray-600'>Adicione as opções e marque as que são Verdadeiras</p>
          </div>

          <div className='alert alert-info d-flex align-items-center mb-5'>
            <i className='ki-duotone ki-information-5 fs-2 text-info me-3'>
              <span className='path1'></span>
              <span className='path2'></span>
              <span className='path3'></span>
            </i>
            <span>As opções marcadas como corretas serão consideradas <strong>Verdadeiras</strong>. As demais serão <strong>Falsas</strong>.</span>
          </div>

          <div className='card card-body shadow-sm'>
            <div className='table-responsive'>
              <table className='table table-row-bordered align-middle gs-5'>
                <thead>
                  <tr className='fw-bold fs-6 text-gray-600'>
                    <th className='w-50px'>#</th>
                    <th>Opção de resposta</th>
                    <th className='w-120px text-center'>Verdadeira?</th>
                    <th className='w-80px text-center'>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {answerOptions.map((opt, index) => (
                    <tr key={opt.id}>
                      <td className='text-gray-600 fw-bold'>{index + 1}</td>
                      <td>
                        <input
                          type='text'
                          className='form-control form-control-solid'
                          value={opt.text}
                          onChange={e => handleUpdateOption(opt.id, 'text', e.target.value)}
                          placeholder='Digite a opção de resposta...'
                        />
                      </td>
                      <td className='text-center'>
                        <input
                          className='form-check-input'
                          type='checkbox'
                          checked={opt.isCorrect}
                          onChange={e => handleUpdateOption(opt.id, 'isCorrect', e.target.checked)}
                          style={{ width: '20px', height: '20px' }}
                        />
                      </td>
                      <td className='text-center'>
                        <button 
                          type='button' 
                          className='btn btn-icon btn-sm btn-light-danger' 
                          onClick={() => handleRemoveOption(opt.id)} 
                          disabled={answerOptions.length === 1}
                        >
                          <i className='ki-duotone ki-trash fs-5'>
                            <span className='path1'></span>
                            <span className='path2'></span>
                            <span className='path3'></span>
                            <span className='path4'></span>
                            <span className='path5'></span>
                          </i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <button type='button' className='btn btn-light-primary btn-sm mt-3' onClick={handleAddOption}>
              <i className='ki-duotone ki-plus fs-5 me-1'></i> Adicionar Opção
            </button>
          </div>

          {/* Resumo */}
          <div className='card card-body bg-light-secondary mt-8'>
            <h6 className='text-gray-900 mb-4'>Resumo da Questão</h6>
            <div className='d-flex flex-wrap gap-3'>
              <span className='badge badge-light-primary p-3'>
                <i className='ki-duotone ki-like-dislike me-2'></i>
                Verdadeiro ou Falso
              </span>
              <span className='badge badge-light-info p-3'>
                Peso: {formik.values.weight}
              </span>
              <span className='badge badge-light-success p-3'>
                Sequência: {formik.values.sequence}
              </span>
              <span className='badge badge-light-warning p-3'>
                {answerOptions.filter(o => o.isCorrect).length} verdadeira(s)
              </span>
            </div>
          </div>
        </div>
      )
    }

    // Ordenação
    if (questionType === 'Ordering') {
      const moveItem = (index: number, dir: -1 | 1) => {
        const newItems = [...orderingItems]
        const target = index + dir
        if (target < 0 || target >= newItems.length) return
        const tmp = newItems[target]
        newItems[target] = newItems[index]
        newItems[index] = tmp
        setOrderingItems(newItems)
        setCorrectOrder(newItems.map((_, i) => i))
      }

      const addItem = () => setOrderingItems(prev => [...prev, `Item ${prev.length + 1}`])
      const removeItem = (i: number) => setOrderingItems(prev => prev.filter((_, idx) => idx !== i))
      const updateItem = (i: number, value: string) => setOrderingItems(prev => prev.map((v, idx) => idx === i ? value : v))

      return (
        <div>
          <div className='text-center mb-8'>
            <h3 className='fs-2 fw-bold text-gray-900 mb-3'>Ordenação</h3>
            <p className='text-gray-600'>Adicione os itens que o aluno deverá ordenar na sequência correta.</p>
          </div>

          <div className='card card-body shadow-sm'>
            <div className='table-responsive'>
              <table className='table table-row-bordered align-middle gs-5'>
                <thead>
                  <tr className='fw-bold fs-6 text-gray-600'>
                    <th className='w-50px'>#</th>
                    <th>Item</th>
                    <th className='w-120px text-center'>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {orderingItems.map((item, index) => (
                    <tr key={index}>
                      <td className='text-gray-600 fw-bold'>{index + 1}</td>
                      <td>
                        <input type='text' className='form-control form-control-solid' value={item} onChange={e => updateItem(index, e.target.value)} />
                      </td>
                      <td className='text-center'>
                        <div className='btn-group'>
                          <button type='button' className='btn btn-sm btn-light-primary' onClick={() => moveItem(index, -1)} disabled={index === 0}>↑</button>
                          <button type='button' className='btn btn-sm btn-light-primary' onClick={() => moveItem(index, 1)} disabled={index === orderingItems.length - 1}>↓</button>
                          <button type='button' className='btn btn-sm btn-light-danger' onClick={() => removeItem(index)}>Remover</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className='mt-3'>
              <button type='button' className='btn btn-light-primary btn-sm' onClick={addItem}>Adicionar Item</button>
            </div>
          </div>

          <div className='card card-body bg-light-secondary mt-8'>
            <h6 className='text-gray-900 mb-4'>Resumo</h6>
            <div className='d-flex flex-wrap gap-3'>
              <span className='badge badge-light-primary p-3'>Ordenação</span>
              <span className='badge badge-light-info p-3'>Itens: {orderingItems.length}</span>
            </div>
          </div>
        </div>
      )
    }

    // Preencher lacuna (fill-in-the-blank)
    if (questionType === 'ColumnFill') {
      const detectPlaceholders = (text: string) => {
        const re = /\{(\d+)\}/g
        const found: number[] = []
        let m
        while ((m = re.exec(text)) !== null) {
          const idx = Number(m[1])
          if (!Number.isNaN(idx) && !found.includes(idx)) found.push(idx)
        }
        return found.sort((a, b) => a - b)
      }

      const syncAnswersToPlaceholders = () => {
        const placeholders = detectPlaceholders(fillText)
        const maxIdx = placeholders.length ? Math.max(...placeholders) : -1
        const size = Math.max(maxIdx + 1, fillAnswers.length)
        const newAnswers = Array.from({ length: size }, (_, i) => fillAnswers[i] ?? '')
        setFillAnswers(newAnswers)
      }

      const addBlank = () => setFillAnswers(prev => [...prev, ''])
      const removeBlank = (i: number) => setFillAnswers(prev => prev.filter((_, idx) => idx !== i))
      const updateBlank = (i: number, v: string) => setFillAnswers(prev => prev.map((x, idx) => idx === i ? v : x))

      return (
        <div>
          <div className='text-center mb-8'>
            <h3 className='fs-2 fw-bold text-gray-900 mb-3'>Preencher Lacuna</h3>
            <p className='text-gray-600'>Escreva um texto com placeholders usando <code>{'{0}'}</code>, <code>{'{1}'}</code> etc., e defina as respostas esperadas para cada lacuna.</p>
          </div>

          <div className='card card-body shadow-sm'>
            <div className='fv-row mb-4'>
              <label className='form-label text-gray-700'>Texto (use <code>{'{0}'}</code>, <code>{'{1}'}</code> ...)</label>
              <textarea className='form-control form-control-solid' rows={4} value={fillText} onChange={e => setFillText(e.target.value)} placeholder='Digite o texto com lacunas, ex: "O sol é {0} e a lua é {1}."' />
            </div>

            <div className='d-flex gap-2 mb-3'>
              <button type='button' className='btn btn-sm btn-light-primary' onClick={syncAnswersToPlaceholders}>Detectar lacunas do texto</button>
              <button type='button' className='btn btn-sm btn-light-primary' onClick={addBlank}>Adicionar Lacuna</button>
            </div>

            <div className='table-responsive mb-3'>
              <table className='table table-row-bordered align-middle gs-5'>
                <thead>
                  <tr className='fw-bold fs-6 text-gray-600'><th>#</th><th>Resposta esperada</th><th>Ações</th></tr>
                </thead>
                <tbody>
                  {fillAnswers.map((ans, i) => (
                    <tr key={i}>
                      <td className='text-gray-600 fw-bold'>{i}</td>
                      <td><input type='text' className='form-control form-control-solid' value={ans} onChange={e => updateBlank(i, e.target.value)} /></td>
                      <td><button type='button' className='btn btn-sm btn-light-danger' onClick={() => removeBlank(i)}>Remover</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className='card card-body bg-light-secondary'>
              <h6 className='mb-3'>Pré-visualização</h6>
              <div>
                {fillText ? (
                  <div className='p-3' style={{ whiteSpace: 'pre-wrap' }}>
                    {fillText.split(/(\{\d+\})/g).map((part, idx) => {
                      const m = /\{(\d+)\}/.exec(part)
                      if (m) {
                        const n = Number(m[1])
                        return (
                          <span key={idx} className='badge bg-warning text-dark me-1' style={{ padding: '6px 8px' }}>
                            {`[${n}]`}
                          </span>
                        )
                      }
                      return <span key={idx}>{part}</span>
                    })}
                  </div>
                ) : (
                  <div className='text-muted small'>Nenhum texto fornecido ainda.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )
    }

    // Corresponder duas fileiras
    if (questionType === 'MatchTwoRows') {
      const updateLeft = (i: number, v: string) => setMatchLeft(prev => prev.map((x, idx) => idx === i ? v : x))
      const updateRight = (i: number, v: string) => setMatchRight(prev => prev.map((x, idx) => idx === i ? v : x))
      const addLeft = () => setMatchLeft(prev => [...prev, `Esquerda ${prev.length + 1}`])
      const addRight = () => setMatchRight(prev => [...prev, `Direita ${prev.length + 1}`])
      const setPair = (leftIndex: number, rightIndex: number) => setMatchMap(prev => ({ ...prev, [leftIndex]: rightIndex }))

      return (
        <div>
          <div className='text-center mb-8'>
            <h3 className='fs-2 fw-bold text-gray-900 mb-3'>Corresponder Duas Fileiras</h3>
            <p className='text-gray-600'>Defina os itens à esquerda e à direita e crie as correspondências.</p>
          </div>

          <div className='row g-4'>
            <div className='col-md-6'>
              <div className='card card-body shadow-sm'>
                <h6>Esquerda</h6>
                {matchLeft.map((it, i) => (
                  <div key={i} className='d-flex gap-2 mb-2'>
                    <input className='form-control form-control-solid' value={it} onChange={e => updateLeft(i, e.target.value)} />
                  </div>
                ))}
                <div className='mt-2'><button className='btn btn-sm btn-light-primary' onClick={addLeft}>Adicionar</button></div>
              </div>
            </div>
            <div className='col-md-6'>
              <div className='card card-body shadow-sm'>
                <h6>Direita</h6>
                {matchRight.map((it, i) => (
                  <div key={i} className='d-flex gap-2 mb-2'>
                    <input className='form-control form-control-solid' value={it} onChange={e => updateRight(i, e.target.value)} />
                  </div>
                ))}
                <div className='mt-2'><button className='btn btn-sm btn-light-primary' onClick={addRight}>Adicionar</button></div>
              </div>
            </div>
          </div>

          <div className='card card-body bg-light-secondary mt-4'>
            <h6>Correspondências</h6>
            <div className='text-muted small mb-3'>Clique no círculo para ciclar a associação (1..N). Clique novamente para remover.</div>
            <div className='row'>
              <div className='col-md-5'>
                <div className='fw-semibold mb-2'>Esquerda</div>
                {matchLeft.map((l, i) => (
                  <div key={i} className='py-2 border-bottom'>{l}</div>
                ))}
              </div>

              <div className='col-md-5'>
                <div className='fw-semibold mb-2'>Direita</div>
                {matchRight.map((r, i) => (
                  <div key={i} className='py-2 border-bottom'>{r}</div>
                ))}
              </div>

                <div className='col-md-2 text-center'>
                  <div className='fw-semibold mb-2'>Correlação</div>
                  {matchLeft.map((_, i) => {
                    const val = matchMap[i]
                    const last = matchRight.length - 1
                    const display = val == null || val === -1 ? '-' : String((val ?? -1) + 1)
                    const cycle = () => {
                      if (matchRight.length === 0) return
                      setMatchMap(prev => {
                        const cur = prev[i]
                        // advance: if null -> 0, if last -> null, else +1
                        let next: number | undefined | -1
                        if (cur == null || cur === -1) next = 0
                        else if (cur >= last) next = -1
                        else next = cur + 1
                        const copy = { ...prev }
                        if (next === -1) delete copy[i]
                        else copy[i] = next as number
                        return copy
                      })
                    }

                    return (
                      <div key={i} className='py-2 d-flex justify-content-center'>
                        <button
                          type='button'
                          onClick={cycle}
                          aria-label={val == null || val === -1 ? `Sem associação para item ${i+1}` : `Associado a ${val + 1}`}
                          title={val == null || val === -1 ? 'Sem associação' : `Associado a ${val + 1}`}
                          className={`btn ${val != null && val !== -1 ? 'btn-primary' : 'btn-light'} btn-sm rounded-circle`}
                          style={{
                            width: 36,
                            height: 36,
                            padding: 0,
                            transition: 'transform .12s ease, box-shadow .12s ease',
                            transform: val != null && val !== -1 ? 'scale(1.03)' : 'none',
                            boxShadow: val != null && val !== -1 ? '0 3px 10px rgba(0,0,0,0.18)' : 'none'
                          }}
                        >
                          <span className='fw-bold' style={{ lineHeight: '36px' }}>{display}</span>
                        </button>
                      </div>
                    )
                  })}
                </div>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div>
        <div className='text-center mb-8'>
          <h3 className='fs-2 fw-bold text-gray-900 mb-3'>Opções de Resposta</h3>
          <p className='text-gray-600'>
            {isSingleChoice 
              ? 'Adicione as opções e marque apenas UMA como correta' 
              : 'Adicione as opções e marque as corretas'}
          </p>
        </div>

        {isSingleChoice && (
          <div className='alert alert-info d-flex align-items-center mb-5'>
            <i className='ki-duotone ki-information-5 fs-2 text-info me-3'>
              <span className='path1'></span>
              <span className='path2'></span>
              <span className='path3'></span>
            </i>
            <span>Apenas <strong>uma</strong> opção pode ser marcada como correta.</span>
          </div>
        )}

        <div className='card card-body shadow-sm'>
          <div className='table-responsive'>
            <table className='table table-row-bordered align-middle gs-5'>
              <thead>
                <tr className='fw-bold fs-6 text-gray-600'>
                  <th className='w-50px'>#</th>
                  <th>Opção de resposta</th>
                  <th className='w-100px text-center'>Correta?</th>
                  <th className='w-80px text-center'>Ações</th>
                </tr>
              </thead>
              <tbody>
                {answerOptions.map((opt, index) => (
                  <tr key={opt.id}>
                    <td className='text-gray-600 fw-bold'>{index + 1}</td>
                    <td>
                      <input
                        type='text'
                        className='form-control form-control-solid'
                        value={opt.text}
                        onChange={e => handleUpdateOption(opt.id, 'text', e.target.value)}
                        placeholder='Digite a opção de resposta...'
                      />
                    </td>
                    <td className='text-center'>
                      {isSingleChoice ? (
                        <input
                          className='form-check-input'
                          type='radio'
                          name='correctOption'
                          checked={opt.isCorrect}
                          onChange={() => handleUpdateOption(opt.id, 'isCorrect', true)}
                          style={{ width: '20px', height: '20px' }}
                        />
                      ) : (
                        <input
                          className='form-check-input'
                          type='checkbox'
                          checked={opt.isCorrect}
                          onChange={e => handleUpdateOption(opt.id, 'isCorrect', e.target.checked)}
                          style={{ width: '20px', height: '20px' }}
                        />
                      )}
                    </td>
                    <td className='text-center'>
                      <button 
                        type='button' 
                        className='btn btn-icon btn-sm btn-light-danger' 
                        onClick={() => handleRemoveOption(opt.id)} 
                        disabled={answerOptions.length === 1}
                      >
                        <i className='ki-duotone ki-trash fs-5'>
                          <span className='path1'></span>
                          <span className='path2'></span>
                          <span className='path3'></span>
                          <span className='path4'></span>
                          <span className='path5'></span>
                        </i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <button type='button' className='btn btn-light-primary btn-sm mt-3' onClick={handleAddOption}>
            <i className='ki-duotone ki-plus fs-5 me-1'></i> Adicionar Opção
          </button>
        </div>

        {/* Resumo */}
        <div className='card card-body bg-light-secondary mt-8'>
          <h6 className='text-gray-900 mb-4'>Resumo da Questão</h6>
          <div className='d-flex flex-wrap gap-3'>
            <span className='badge badge-light-primary p-3'>
              {questionType === 'MultipleChoice' ? 'Múltipla Escolha' : 'Escolha Única'}
            </span>
            <span className='badge badge-light-info p-3'>
              Peso: {formik.values.weight}
            </span>
            <span className='badge badge-light-success p-3'>
              Sequência: {formik.values.sequence}
            </span>
            <span className='badge badge-light-warning p-3'>
              {answerOptions.length} opções
            </span>
          </div>
        </div>
      </div>
    )
  }

  // Renderiza o conteúdo da etapa atual
  const renderStepContent = () => {
    if (currentStep === 1) {
      return renderStep1()
    }
    
    if (activityType === 'Informative') {
      if (currentStep === 2) return renderStep2Informative()
    } else {
      if (currentStep === 2) return renderStep2Exercise()
      if (currentStep === 3) return renderStep3Exercise()
    }
    
    return null
  }

  // Verifica se é a última etapa
  const isLastStep = (): boolean => {
    // Para Informativo, a última etapa é a 2
    if (activityType === 'Informative') {
      return currentStep === 2
    }
    // Para Exercise, a última etapa é a 3
    return currentStep === 3
  }

  return (
    <Modal show={show} onHide={handleModalClose} size='xl' centered scrollable backdrop='static'>
      <Modal.Header closeButton className='bg-body border-0 pb-0'>
        <Modal.Title className='fs-3 fw-bold text-gray-900'>{titleText}</Modal.Title>
      </Modal.Header>

      <Modal.Body className='bg-body px-10 py-8'>
        <div className='wizard-container'>
          {/* Indicador de progresso */}
          {renderProgressIndicator()}

          {/* Conteúdo da etapa */}
          <div className='min-h-400px'>
            {renderStepContent()}
          </div>

          {/* Navegação */}
          <div className='d-flex justify-content-between pt-10 border-top mt-10'>
            <div>
              {currentStep > 1 && (
                <button 
                  type='button' 
                  className='btn btn-light'
                  onClick={prevStep}
                >
                  <i className='ki-duotone ki-arrow-left fs-4 me-1'></i>
                  Voltar
                </button>
              )}
            </div>
            
            <div className='d-flex gap-3'>
              <button type='button' className='btn btn-light' onClick={handleModalClose}>
                Cancelar
              </button>
              
              {isLastStep() ? (
                <button 
                  type='button' 
                  className='btn btn-primary'
                  disabled={formik.isSubmitting || !formik.values.title}
                  onClick={() => formik.handleSubmit()}
                >
                  {formik.isSubmitting ? (
                    <span className='indicator-progress d-block'>
                      Salvando...
                      <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                    </span>
                  ) : (
                    <>
                      <i className='ki-duotone ki-check fs-4 me-1'></i>
                      {isEdit ? 'Salvar Alterações' : 'Criar Questão'}
                    </>
                  )}
                </button>
              ) : (
                <button 
                  type='button' 
                  className='btn btn-primary'
                  onClick={nextStep}
                  disabled={!canProceed()}
                >
                  Próximo
                  <i className='ki-duotone ki-arrow-right fs-4 ms-1'></i>
                </button>
              )}
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  )
}

export default LessonQuestionModal
