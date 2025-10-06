import React, { FC, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import StepModal from './LessonStepModal' 
import QuestionModal from './LessonQuestionModal' // Importa o novo Modal de Questão

// ----------------------
// Tipagem da Questão (COPIADA DE QuestionModal.tsx)
// ----------------------
interface AnswerOption {
    id: number
    image: string
    text: string
    isCorrect: boolean
}

interface Question {
    id: number
    activityType: string 
    sequence: number
    questionType: string 
    weight: number 
    isActive: boolean
    contentImage: string 
    description: string
    comments: string 
    options: AnswerOption[]
    shuffleAnswers: boolean
    alwaysCorrect: boolean
}

// ----------------------
// Tipagem da Etapa (ATUALIZADA)
// ----------------------
interface Step {
    id: number
    type: string
    title: string
    active: boolean
    sequence: number
    character: string
    suggestion: string
    questions: Question[] // NOVO: Armazena as questões (atividades)
}

// Tipagem para os dados da Aula
interface LessonData {
    title: string
    period: string
    discipline: string
    combat: string
    bncc: string
}

// Mock inicial de etapas (ATUALIZADO com Question)
const initialSteps: Step[] = [
    { 
        id: 1, 
        type: 'Conteúdo', 
        title: 'Visão Geral', 
        active: true, 
        sequence: 1, 
        character: 'Professor', 
        suggestion: '',
        questions: [] // Sem questões
    },
    { 
        id: 2, 
        type: 'Atividade', 
        title: 'Quiz Básico', 
        active: true, 
        sequence: 2, 
        character: 'Aluno-Guia', 
        suggestion: 'Usar o template de Quiz Nível 1.',
        questions: [{ // Mock de uma questão
            id: 101,
            activityType: 'Pergunta',
            sequence: 1,
            questionType: 'Escolha Única',
            weight: 1,
            isActive: true,
            contentImage: '',
            description: 'Pergunta de exemplo',
            comments: '',
            options: [{ id: 1, image: '', text: 'Opção A', isCorrect: true }],
            shuffleAnswers: false,
            alwaysCorrect: false
        }]
    },
]

// ... (initialLessonData não precisa de alteração)

const initialLessonData: LessonData = {
    title: 'Aula de Português - Concordância',
    period: '2º Trimestre',
    discipline: 'Português',
    combat: 'Baixo Desempenho em Leitura',
    bncc: 'Língua Portuguesa',
}


const LessonStepPage: FC = () => {
    // ... (Hooks e States de Aula/Etapas)
    const { lessonId } = useParams<{ lessonId: string }>()
    const navigate = useNavigate()
    const [lessonData, setLessonData] = useState<LessonData>(initialLessonData)
    const [steps, setSteps] = useState<Step[]>(initialSteps)
    
    // States para o Modal de Etapa (StepModal)
    const [isStepModalOpen, setIsStepModalOpen] = useState(false)
    const [editingStep, setEditingStep] = useState<Step | null>(null)

    // States para o Modal de Questão (QuestionModal)
    const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false)
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
    const [currentStepId, setCurrentStepId] = useState<number | null>(null) // Etapa à qual a questão pertence

    // ... (nextSequence e Handlers de StepModal permanecem)
    const nextSequence = useMemo(() => {
        return steps.length > 0 ? Math.max(...steps.map(s => s.sequence)) + 1 : 1
    }, [steps])

    const handleOpenStepModal = (step: Step | null = null) => {
        setEditingStep(step)
        setIsStepModalOpen(true)
    }

    const handleCloseStepModal = () => {
        setIsStepModalOpen(false)
        setEditingStep(null)
    }
    
    // ... (handleSaveStep e handleRemoveStep permanecem)
    const handleSaveStep = (newStepData: Omit<Step, 'id' | 'questions'>) => {
        if (editingStep) {
            setSteps(steps.map(s => s.id === editingStep.id ? { ...newStepData, id: editingStep.id, questions: editingStep.questions } as Step : s));
        } else {
            const newStep: Step = { ...newStepData, id: Date.now(), questions: [] } as Step
            setSteps([...steps, newStep].sort((a, b) => a.sequence - b.sequence))
        }
        handleCloseStepModal()
    }
    
    const handleRemoveStep = (stepId: number) => {
        if (window.confirm('Tem certeza que deseja remover esta etapa?')) {
            setSteps(steps.filter(s => s.id !== stepId));
        }
    }
    
    // --- Handlers de Questão ---

    const handleOpenQuestionModal = (stepId: number, question: Question | null = null) => {
        setCurrentStepId(stepId)
        setEditingQuestion(question)
        setIsQuestionModalOpen(true)
    }

    const handleCloseQuestionModal = () => {
        setIsQuestionModalOpen(false)
        setEditingQuestion(null)
        setCurrentStepId(null)
    }

    const handleSaveQuestion = (newQuestionData: Question) => {
        if (!currentStepId) return;

        setSteps(steps.map(step => {
            if (step.id === currentStepId) {
                // Encontrando a etapa para atualizar as questões
                if (editingQuestion) {
                    // Edição: mapeia as questões para encontrar e atualizar
                    const updatedQuestions = step.questions.map(q => 
                        q.id === newQuestionData.id ? newQuestionData : q
                    );
                    return { ...step, questions: updatedQuestions };
                } else {
                    // Criação: adiciona a nova questão e garante que a sequência é definida
                    const finalQuestion: Question = {
                        ...newQuestionData,
                        id: newQuestionData.id || Date.now(), // Garante um ID
                        sequence: step.questions.length + 1 // Define a próxima sequência
                    }
                    return { ...step, questions: [...step.questions, finalQuestion] };
                }
            }
            return step;
        }));
        handleCloseQuestionModal();
    }
    
    // --- Renderização dos Cards de Etapas (AJUSTADO PARA MELHOR LEITURA NO DARK MODE) ---
    const renderStepCard = (step: Step) => (
        <div key={step.id} className='col-xl-6 mb-7'>
            {/* Card Principal: #2b2b35 */}
            <div className='card h-100' style={{ backgroundColor: '#2b2b35' }}>
                <div className='card-body d-flex flex-column'>
                    
                    {/* Cabeçalho do Card */}
                    <div className='d-flex align-items-center mb-5'>
                        <span className='fs-4 text-white fw-bold me-3'>
                            {step.sequence}º - {step.title}
                        </span>
                        <div 
                            className={clsx('bullet ms-auto', {'bg-success': step.active, 'bg-danger': !step.active})} 
                            style={{width: '10px', height: '10px'}}
                        ></div>
                    </div>
                    
                    {/* Detalhes da Etapa */}
                    <div className='d-flex flex-column gap-2 mb-5'>
                        <div className='d-flex justify-content-between'>
                            <span className='fw-semibold text-gray-500'>Tipo</span>
                            <span className='fw-bold text-white'>{step.type}</span>
                        </div>
                        <div className='d-flex justify-content-between'>
                            <span className='fw-semibold text-gray-500'>Personagem</span>
                            <span className='fw-bold text-white'>{step.character}</span>
                        </div>
                        <div className='d-flex justify-content-between'>
                            <span className='fw-semibold text-gray-500'>Total de Questões</span>
                            <span className='fw-bold text-white'>{step.questions.length}</span>
                        </div>
                    </div>

                    {/* Espaço da Questão/Atividade */}
                    <h5 className='text-white mt-5'>Atividades da Etapa ({step.questions.length})</h5>
                    {/* Fundo da Tabela de Atividades: #1e1e2d (para contrastar com o corpo do card) */}
                    <div className='p-3 rounded mb-5 flex-grow-1' style={{ backgroundColor: '#1e1e2d' }}>
                        {step.questions.length > 0 ? (
                            <div className='table-responsive'>
                                <table className='table table-sm table-striped gs-2'>
                                    <thead>
                                        <tr className='fw-bold fs-7 text-gray-400'>
                                            <th>#</th>
                                            <th>Tipo</th>
                                            <th>Título</th>
                                            <th className='text-center'>Ativo</th>
                                            <th className='text-end'>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* A classe 'table-striped' em Dark Mode usa `bg-light` para linhas alternadas, por isso vamos usar `text-white` no tbody. */}
                                        {step.questions.map(q => (
                                            <tr key={q.id} className='text-white fw-semibold fs-7'>
                                                <td>{q.sequence}</td>
                                                <td>{q.questionType}</td>
                                                <td>{q.description.substring(0, 20)}...</td>
                                                <td className='text-center'>
                                                    <i className={clsx('ki-duotone fs-4', {'ki-check-circle text-success': q.isActive, 'ki-cross-circle text-danger': !q.isActive})}></i>
                                                </td>
                                                <td className='text-end'>
                                                    <button 
                                                        type='button' 
                                                        className='btn btn-icon btn-sm btn-light-primary me-2' 
                                                        onClick={() => handleOpenQuestionModal(step.id, q)}
                                                        title='Editar Questão'
                                                    >
                                                        <i className='ki-duotone ki-pencil fs-6'></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className='text-gray-500 fs-6 text-center pt-3'>Nenhuma atividade definida para esta etapa.</p>
                        )}
                        
                        {/* Botão Adicionar Questão */}
                        <div className='text-end mt-3'>
                            <button 
                                className='btn btn-sm btn-info' 
                                onClick={() => handleOpenQuestionModal(step.id)}
                            >
                                <i className='ki-duotone ki-plus fs-5'></i> Adicionar Questão
                            </button>
                        </div>
                    </div>


                    {/* Botões de Ação da Etapa */}
                    <div className='d-flex mt-auto pt-5 justify-content-end'>
                        {/* Botão para abrir o modal de edição de ETAPA */}
                        <button className='btn btn-sm btn-light-primary me-2' onClick={() => handleOpenStepModal(step)}>
                            <i className='ki-duotone ki-pencil fs-6'></i> Editar Etapa
                        </button>
                        <button className='btn btn-sm btn-light-danger' onClick={() => handleRemoveStep(step.id)}>
                            <i className='ki-duotone ki-trash fs-6'></i> Remover Etapa
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )


    return (
        <div className='d-flex flex-column flex-lg-row'>
            <div className='flex-column flex-lg-row-auto w-100 mb-10'>
                {/* CABEÇALHO DA AULA (Dark Mode) */}
                <div className='card mb-5 mb-xl-10' style={{ backgroundColor: '#1e1e2d' }}>
                    <div className='card-body pt-9 pb-0'>
                        <div className='d-flex flex-wrap flex-sm-nowrap mb-6'>
                            <div className='flex-grow-1'>
                                <div className='d-flex flex-column'>
                                    <div className='d-flex align-items-center mb-2'>
                                        <h1 className='text-white fs-2 fw-bold me-1'>
                                            Aula: {lessonData.title} (ID: {lessonId || 'N/A'})
                                        </h1>
                                    </div>
                                </div>
                                <div className='row border border-gray-600 rounded p-5 mt-5 g-5'>
                                    {Object.entries(lessonData).map(([key, value]) => (
                                        <div className='col-md-6 col-lg-3 d-flex flex-column' key={key}>
                                            <span className='text-gray-400 fs-7 fw-semibold text-capitalize'>{key}</span>
                                            <input
                                                type='text'
                                                className='form-control form-control-sm form-control-solid'
                                                value={value}
                                                onChange={(e) => setLessonData({...lessonData, [key]: e.target.value})}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Botão Adicionar Etapas (Abre o StepModal) */}
                        <div className='d-flex justify-content-center py-5'>
                            <button 
                                className='btn btn-sm btn-info' 
                                onClick={() => handleOpenStepModal(null)} 
                            >
                                <i className='ki-duotone ki-plus fs-5'></i> Adicionar etapas
                            </button>
                        </div>
                    </div>
                </div>


                {/* VISUALIZAÇÃO DAS ETAPAS */}
                <div className='row'>
                    {steps.sort((a, b) => a.sequence - b.sequence).map(renderStepCard)}
                </div>

                {/* BOTÃO VOLTAR */}
                <div className='text-end mt-10'>
                    <button
                        type='button'
                        className='btn btn-light-primary'
                        onClick={() => navigate('/apps/lesson-management/lessons')}
                    >
                        Voltar para Aulas
                    </button>
                </div>
                
                {/* MODAL DE CRIAÇÃO/EDIÇÃO DE ETAPA */}
                <StepModal 
                    show={isStepModalOpen} 
                    handleClose={handleCloseStepModal}
                    step={editingStep}
                    lessonSequence={nextSequence}
                    onSave={handleSaveStep}
                />
                
                {/* MODAL DE CRIAÇÃO/EDIÇÃO DE QUESTÃO (Renderizado apenas se tiver um stepId válido) */}
                {isQuestionModalOpen && currentStepId && (
                    <QuestionModal 
                        show={isQuestionModalOpen} 
                        handleClose={handleCloseQuestionModal}
                        question={editingQuestion}
                        onSave={handleSaveQuestion}
                        // Busca o título da etapa para exibir no cabeçalho do modal
                        stepTitle={steps.find(s => s.id === currentStepId)?.title || 'Etapa'}
                    />
                )}
            </div>
        </div>
    )
}

export default LessonStepPage