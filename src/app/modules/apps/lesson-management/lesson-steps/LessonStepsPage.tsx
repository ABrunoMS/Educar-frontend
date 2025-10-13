import React, { FC, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import StepModal from './LessonStepModal';
import QuestionModal from './LessonQuestionModal';
import { LessonType, Step, Question, AnswerOption } from '@interfaces/Lesson';

// Tipagem para os dados da Aula
interface LessonData {
  title: string;
  period: string;
  discipline: string;
  combat: string;
  bncc: string;
}

const initialLessonData: LessonData = {
  title: 'Aula de Português - Concordância',
  period: '2º Trimestre',
  discipline: 'Português',
  combat: 'Baixo Desempenho em Leitura',
  bncc: 'Língua Portuguesa',
};

const LessonStepPage: FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();

  const [lessonData, setLessonData] = useState<LessonData>(initialLessonData);
  const [steps, setSteps] = useState<Step[]>([]); // Começa sem nenhuma etapa

  // States StepModal
  const [isStepModalOpen, setIsStepModalOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<Step | null>(null);

  // States QuestionModal
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [currentStepId, setCurrentStepId] = useState<number | null>(null);

  const nextSequence = useMemo(() => {
    return steps.length > 0 ? Math.max(...steps.map(s => s.sequence)) + 1 : 1;
  }, [steps]);

  // --- Handlers Step ---
  const handleOpenStepModal = (step: Step | null = null) => {
    setEditingStep(step);
    setIsStepModalOpen(true);
  };

  const handleCloseStepModal = () => {
    setIsStepModalOpen(false);
    setEditingStep(null);
  };

  const handleSaveStep = (newStepData: Omit<Step, 'id' | 'questions'>) => {
    if (editingStep) {
      setSteps(
        steps.map(s =>
          s.id === editingStep.id
            ? { ...newStepData, id: editingStep.id, questions: editingStep.questions } as Step
            : s
        )
      );
    } else {
      const newStep: Step = { ...newStepData, id: Date.now(), questions: [] };
      setSteps([...steps, newStep].sort((a, b) => a.sequence - b.sequence));
    }
    handleCloseStepModal();
  };

  const handleRemoveStep = (stepId: number) => {
    if (window.confirm('Tem certeza que deseja remover esta etapa?')) {
      setSteps(steps.filter(s => s.id !== stepId));
    }
  };

  // --- Handlers Questão ---
  const handleOpenQuestionModal = (stepId: number, question: Question | null = null) => {
    setCurrentStepId(stepId);
    setEditingQuestion(question);
    setIsQuestionModalOpen(true);
  };

  const handleCloseQuestionModal = () => {
    setIsQuestionModalOpen(false);
    setEditingQuestion(null);
    setCurrentStepId(null);
  };

  const handleSaveQuestion = (newQuestionData: Partial<Question>) => {
    if (currentStepId === null) return;

    setSteps(
      steps.map(step => {
        if (step.id === currentStepId) {
          if (editingQuestion) {
            // Atualiza questão existente
            const updatedQuestions = step.questions.map(q =>
              q.id === newQuestionData.id
                ? { ...q, ...newQuestionData } as Question
                : q
            );
            return { ...step, questions: updatedQuestions };
          } else {
            // Adiciona nova questão
            const finalQuestion: Question = {
              id: Date.now(),
              title: newQuestionData.title || 'Nova Questão',
              activityType: newQuestionData.activityType || 'Pergunta',
              sequence: step.questions.length + 1,
              questionType: newQuestionData.questionType || 'Escolha Única',
              weight: newQuestionData.weight || 1,
              isActive: newQuestionData.isActive ?? true,
              contentImage: newQuestionData.contentImage || '',
              description: newQuestionData.description || '',
              comments: newQuestionData.comments || '',
              options: newQuestionData.options || [],
              shuffleAnswers: newQuestionData.shuffleAnswers ?? false,
              alwaysCorrect: newQuestionData.alwaysCorrect ?? false,
            };
            return { ...step, questions: [...step.questions, finalQuestion] };
          }
        }
        return step;
      })
    );

    handleCloseQuestionModal();
  };

  // --- Render Step Cards ---
  const renderStepCard = (step: Step) => (
    <div key={step.id} className='col-xl-6 mb-7'>
      <div className='card h-100 bg-body'>
        <div className='card-body d-flex flex-column'>
          {/* Cabeçalho */}
          <div className='d-flex align-items-center mb-5'>
            <span className='fs-4 fw-bold text-gray-900 dark:text-white me-3'>
              {step.sequence}º - {step.title}
            </span>
            <div
              className={clsx('bullet ms-auto', {
                'bg-success': step.active,
                'bg-danger': !step.active
              })}
              style={{ width: '10px', height: '10px' }}
            ></div>
          </div>

          {/* Detalhes */}
          <div className='d-flex flex-column gap-2 mb-5'>
            <div className='d-flex justify-content-between'>
              <span className='fw-semibold text-gray-600'>Tipo</span>
              <span className='fw-bold text-gray-900 dark:text-white'>{step.type}</span>
            </div>
            <div className='d-flex justify-content-between'>
              <span className='fw-semibold text-gray-600'>Personagem</span>
              <span className='fw-bold text-gray-900 dark:text-white'>{step.character}</span>
            </div>
            <div className='d-flex justify-content-between'>
              <span className='fw-semibold text-gray-600'>Total de Questões</span>
              <span className='fw-bold text-gray-900 dark:text-white'>{step.questions.length}</span>
            </div>
          </div>

          {/* Questões */}
          <h5 className='text-gray-900 dark:text-white mt-5 mb-3 fw-bold'>
            Atividades da Etapa ({step.questions.length})
          </h5>
          <div className='p-5 rounded-3 shadow-sm mb-5 flex-grow-1 bg-light dark:bg-gray-800'>
            {step.questions.length > 0 ? (
              <div className='table-responsive'>
                <table className='table table-row-dashed table-row-gray-300 gy-3 align-middle'>
                  <thead>
                    <tr className='fw-bold fs-7 text-gray-600 dark:text-gray-400'>
                      <th>#</th>
                      <th>Tipo</th>
                      <th>Título</th>
                      <th className='text-center'>Ativo</th>
                      <th className='text-end'>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {step.questions.map(q => (
                      <tr key={q.id} className='fw-semibold fs-7 text-gray-900 dark:text-white'>
                        <td>{q.sequence}</td>
                        <td>{q.questionType}</td>
                        <td>{q.description.length > 30 ? q.description.substring(0, 30) + '...' : q.description}</td>
                        <td className='text-center'>
                          <i
                            className={clsx('ki-duotone fs-4', {
                              'ki-check-circle text-success': q.isActive,
                              'ki-cross-circle text-danger': !q.isActive
                            })}
                          ></i>
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
              <p className='text-gray-500 dark:text-gray-400 fs-6 text-center pt-3'>
                Nenhuma atividade definida para esta etapa.
              </p>
            )}

            <div className='text-end mt-4'>
              <button
                className='btn btn-sm btn-info'
                onClick={() => handleOpenQuestionModal(step.id)}
              >
                <i className='ki-duotone ki-plus fs-5'></i> Adicionar Questão
              </button>
            </div>
          </div>

          {/* Ações da Etapa */}
          <div className='d-flex mt-auto pt-5 justify-content-end'>
            <button
              className='btn btn-sm btn-light-primary me-2'
              onClick={() => handleOpenStepModal(step)}
            >
              <i className='ki-duotone ki-pencil fs-6'></i> Editar Etapa
            </button>
            <button
              className='btn btn-sm btn-light-danger'
              onClick={() => handleRemoveStep(step.id)}
            >
              <i className='ki-duotone ki-trash fs-6'></i> Remover Etapa
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className='d-flex flex-column flex-lg-row'>
      <div className='flex-column flex-lg-row-auto w-100 mb-10'>
        {/* Cabeçalho Aula */}
        <div className='card mb-5 mb-xl-10 bg-body'>
          <div className='card-body pt-9 pb-0'>
            <div className='d-flex flex-wrap flex-sm-nowrap mb-6'>
              <div className='flex-grow-1'>
                <div className='d-flex flex-column'>
                  <div className='d-flex align-items-center mb-2'>
                    <h1 className='fs-2 fw-bold text-gray-900 dark:text-white me-1'>
                      Aula: {lessonData.title} (ID: {lessonId || 'N/A'})
                    </h1>
                  </div>
                </div>
                <div className='row border border-gray-300 rounded p-5 mt-5 g-5'>
                  {Object.entries(lessonData).map(([key, value]) => (
                    <div
                      className='col-md-6 col-lg-3 d-flex flex-column'
                      key={key}
                    >
                      <span className='text-gray-600 fs-7 fw-semibold text-capitalize'>
                        {key}
                      </span>
                      <input
                        type='text'
                        className='form-control form-control-sm form-control-solid'
                        value={value}
                        onChange={e =>
                          setLessonData({ ...lessonData, [key]: e.target.value })
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

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

        {/* Etapas */}
        <div className='row'>
          {steps.sort((a, b) => a.sequence - b.sequence).map(renderStepCard)}
        </div>

        {/* Botão Voltar */}
        <div className='text-end mt-10'>
          <button
            type='button'
            className='btn btn-light-primary'
            onClick={() => navigate('/apps/lesson-management/lessons')}
          >
            Voltar para Aulas
          </button>
        </div>

        {/* Modal Step */}
        <StepModal
          show={isStepModalOpen}
          handleClose={handleCloseStepModal}
          step={editingStep}
          lessonSequence={nextSequence}
          onSave={handleSaveStep}
        />

        {/* Modal Questão */}
        {isQuestionModalOpen && currentStepId !== null && (
          <QuestionModal
            show={isQuestionModalOpen}
            handleClose={handleCloseQuestionModal}
            question={editingQuestion}
            onSave={handleSaveQuestion}
            stepTitle={steps.find(s => s.id === currentStepId)?.title || 'Etapa'}
          />
        )}
      </div>
    </div>
  );
};

export default LessonStepPage;
