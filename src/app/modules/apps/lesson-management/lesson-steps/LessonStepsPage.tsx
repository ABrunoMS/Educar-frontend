import React, { FC, useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import StepModal from './LessonStepModal';
import QuestionModal from './LessonQuestionModal';
import { LessonType, Step, Question, AnswerOption, Quest, QuestStep } from '@interfaces/Lesson';
import { createQuestStep, getQuestById, updateQuestStep, deleteQuestStep } from '@services/Lesson';  // Importa as funções para salvar e buscar aula


interface PageStep {
 id: string | null; // <-- string (para IDs do backend) ou null (para novas)
 title: string;
 type: string;
 active: boolean;
 sequence: number;
 character: string;
 suggestion: string;
 questions: Question[];
}

// Tipagem para os dados da Aula baseada na interface Quest
interface LessonData {
  name: string;
  description: string;
  usageTemplate: boolean;
  type: string;
  maxPlayers: number;
  totalQuestSteps: number;
  combatDifficulty: string;
  discipline: string;  
  schoolYear: string;  
  bncc: string[];
}

const initialLessonData: LessonData = {
  name: '',
  description: '',
  usageTemplate: true,
  type: '',
  maxPlayers: 0,
  totalQuestSteps: 0,
  combatDifficulty: '',
  discipline: '',
  schoolYear: '',
  bncc: [],
};

const LessonStepPage: FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();

  const [lessonData, setLessonData] = useState<LessonData>(initialLessonData);
  const [steps, setSteps] = useState<PageStep[]>([]); // Começa sem nenhuma 
  const [stepsToDelete, setStepsToDelete] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false); // Estado para controlar o salvamento
  const [isLoading, setIsLoading] = useState(true); // Estado para controlar carregamento dos dados

  // Carregar dados da aula quando o componente montar
  useEffect(() => {
    const loadLessonData = async () => {
      console.log('Carregando dados da aula com ID:', lessonId);
      
      if (!lessonId) {
        console.warn('ID da aula não encontrado na rota');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      
      // Primeiro, definir dados específicos baseados no ID da aula
/*let mockData: LessonData;
      
      if (lessonId === 'aula-portugues-concordancia') {
        mockData = {
          Name: 'Aula de Português - Concordância',
          Description: 'Concordância nominal e verbal',
          UsageTemplate: '2º Trimestre', 
          Type: 'Português',
          MaxPlayers: 35,
          TotalQuestSteps: 0,
          CombatDifficulty: 'Baixo Desempenho',
        };
      } else if (lessonId === 'aula-matematica-fracoes') {
        mockData = {
          Name: 'Aula de Matemática - Frações',
          Description: 'Introdução ao conceito de frações',
          UsageTemplate: 'Ensino Fundamental', 
          Type: 'Matemática',
          MaxPlayers: 30,
          TotalQuestSteps: 0,
          CombatDifficulty: 'Fácil',
        };
      } else if (lessonId === 'aula-ciencias-sistema-solar') {
        mockData = {
          Name: 'Aula de Ciências - Sistema Solar',
          Description: 'Explorando o sistema solar',
          UsageTemplate: 'Ensino Fundamental', 
          Type: 'Ciências',
          MaxPlayers: 25,
          TotalQuestSteps: 0,
          CombatDifficulty: 'Fácil',
        };
      } else {
        // Fallback genérico
        mockData = {
          Name: lessonId, // Usar o ID como nome se for necessário
          Description: 'Aula criada no sistema educativo',
          UsageTemplate: 'Ensino Regular', 
          Type: 'Educativa',
          MaxPlayers: 30,
          TotalQuestSteps: 0,
          CombatDifficulty: 'Médio',
        };
      }*/

      try {
        console.log('Tentando buscar aula no backend...');
        const response = await getQuestById(lessonId);
        console.log('Dados da aula carregados do backend:', response.data);
        
        // Usar dados do backend se disponível
        if (response.data && response.data.id) {
          console.log('Usando dados do backend:', response.data);
          // Mapear campos do backend para o formato esperado pelo frontend
          const backend = response.data as Quest;
          setLessonData({
               name: backend.name || '',
               description: backend.description || '',
               usageTemplate: backend.usageTemplate || true,
               type: backend.type || '',
               maxPlayers: backend.maxPlayers || 0,
               totalQuestSteps: backend.totalQuestSteps || 0,
               combatDifficulty: backend.combatDifficulty || '',
               discipline: (backend.subject as any)?.name || 'Não definida',
               schoolYear: (backend.grade as any)?.name || 'Não definida',
               bncc: backend.proficiencies 
                  ? backend.proficiencies.map((p: any) => p.description || p.name || p.code) 
                  : [],
       });
          
          // Carregar as etapas se existirem
          const questSteps = backend.questSteps || [];
          console.log('QuestSteps do backend:', questSteps);
          
          if (Array.isArray(questSteps) && questSteps.length > 0) {
            const mappedSteps: PageStep[] = questSteps.map((questStep: QuestStep, index: number) => ({
              id: questStep.id || null,
              title: questStep.name || '',
              type: questStep.questStepType || 'Npc',
              active: true,
              sequence: index + 1,
              character: questStep.npcType || 'Passive',
              suggestion: questStep.description || '',
              questions: (questStep.contents || []).map((content, qIndex) => ({ // Mapeia questões
                id: content.id || Date.now() + qIndex,
                activityType: content.questStepContentType || 'Exercise',
                sequence: qIndex + 1,
                questionType: content.questionType || 'MultipleChoice',
                weight: content.weight || 1,
                isActive: true,
                contentImage: '', // TODO: Mapear se existir
                description: content.description || 'Descrição da questão',
                title: content.description || 'Questão',
                comments: '', // TODO: Mapear se existir
                options: (content.expectedAnswers?.options || []).map((opt, oIndex) => ({
                  id: Date.now() + oIndex, // TODO: Usar ID real da opção
                  image: '',
                  text: opt.description,
                  isCorrect: opt.is_correct
                })),
                shuffleAnswers: false,
                alwaysCorrect: false,
              }))
          }));
          setSteps(mappedSteps);
          } else {
            // Aula criada pela primeira vez: garantir que steps fique vazio
            setSteps([]);
            console.log('Nenhuma etapa encontrada para esta aula, steps inicializado vazio');
          }
        } else {
          console.log('Backend retornou dados vazios, usando fallback');
        
        }
      } catch (error) {
        console.error('Erro ao carregar dados da aula', error);
        
        
      } finally {
        console.log('Finalizando carregamento, setIsLoading(false)');
        setIsLoading(false);
      }
    };

    loadLessonData();
  }, [lessonId]);

  // Debug: monitorar mudanças no lessonData
  useEffect(() => {
    console.log('=== DEBUG lessonData ===');
    console.log('lessonData completo:', lessonData);
    console.log('Nome:', lessonData?.name);
    console.log('Nome typeof:', typeof lessonData?.name);
    console.log('Nome length:', lessonData?.name?.length);
    console.log('isLoading:', isLoading);
    console.log('Descrição:', lessonData?.description);
    console.log('Template:', lessonData?.usageTemplate);
    console.log('Tipo:', lessonData?.type);
    console.log('Combate:', lessonData?.combatDifficulty);
    console.log('=== FIM DEBUG ===');
  }, [lessonData, isLoading]);

  // Helper para verificar se um valor é válido para exibição
  const getDisplayValue = (value: string | number | undefined | null, fallback: string) => {
    if (isLoading) return 'Carregando...';
    if (value !== undefined && value !== null && value !== '') {
      return String(value);
    }
    return fallback;
  };

  // States StepModal
  const [isStepModalOpen, setIsStepModalOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<PageStep | null>(null);

  // States QuestionModal
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
 

  const nextSequence = useMemo(() => {
    return steps.length > 0 ? Math.max(...steps.map(s => s.sequence)) + 1 : 1;
  }, [steps]);

  // --- Handlers Step ---
  const handleOpenStepModal = (step: PageStep | null = null) => {
    setEditingStep(step);
    setIsStepModalOpen(true);
  };

  const handleCloseStepModal = () => {
    setIsStepModalOpen(false);
    setEditingStep(null);
  };

  const handleSaveStep = async (stepData: Omit<Step, 'id' | 'questions'>) => {
    if (!lessonId) return;
    
    setIsSaving(true);
    const stepPayload = {
        name: stepData.title,
        description: stepData.suggestion || stepData.title,
        order: stepData.sequence,
        npcType: stepData.character || 'Passive',
        npcBehaviour: 'StandStill', // Valor padrão
        type: stepData.type || 'Npc',
        questId: lessonId,
        contents: [] // Salva a etapa primeiro, depois as questões
    };

    try {
        if (editingStep && editingStep.id) {
            // --- MODO DE ATUALIZAÇÃO ---
            await updateQuestStep(editingStep.id, stepPayload); // Usa updateQuestStep
            setSteps(steps.map(s =>
                s.id === editingStep.id
                ? { ...s, ...stepData } // Atualiza o estado local
                : s
            ));
        } else {
            // --- MODO DE CRIAÇÃO ---
            const response = await createQuestStep(stepPayload); // Usa createQuestStep
            const newStep: PageStep = { 
              ...stepData, 
              id: response.data.id, // <-- Usa o ID real retornado pela API
              questions: [] 
            };
            setSteps([...steps, newStep].sort((a, b) => a.sequence - b.sequence));
        }
        handleCloseStepModal();
    } catch (error) {
        console.error("Erro ao salvar etapa:", error);
        alert("Erro ao salvar etapa.");
    } finally {
        setIsSaving(false);
    }
  };

  const handleRemoveStep = async (stepId: string | null) => {
    if (!stepId) { // Se for uma etapa nova (id=null) que ainda não foi salva
      setSteps(steps.filter(s => s.id !== null));
      return;
    }
    
    if (window.confirm('Tem certeza que deseja remover esta etapa?')) {
          try {
            await deleteQuestStep(stepId); // <-- 1. Chama a API de deleção
            setSteps(steps.filter(s => s.id !== stepId)); // <-- 2. Atualiza o estado local
          } catch (error) {
            console.error("Erro ao deletar etapa:", error);
            alert("Erro ao deletar etapa.");
          }
    }
    };

  // --- Handlers Questão ---
  const [currentStepId, setCurrentStepId] = useState<string | null>(null);
  const handleOpenQuestionModal = (stepId: string | null, question: Question | null = null) => {
    if (!stepId) {
      alert("Salve a etapa primeiro antes de adicionar questões.");
      return;
    }
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

  const handleSaveLesson = async () => {
    if (!lessonId) {
      alert('ID da aula não encontrado!');
      return;
    }

    if (steps.length === 0) {
      alert('Adicione pelo menos uma etapa antes de salvar!');
      return;
    }

    setIsSaving(true);
    try {
      console.log('Iniciando salvamento das etapas...', { lessonId, steps });
      
        // Usamos Promise.all para rodar as atualizações em paralelo
        await Promise.all(steps.map((step, index) => {
          console.log(`Processando etapa ${index + 1}:`, step);

          // Monta o payload (dados) da etapa
          const questStepData = {
             name: step.title,
             description: step.suggestion || step.title || 'Descrição da etapa',
             order: step.sequence,
             npcType: step.character || 'Passive',
             npcBehaviour: 'StandStill',
             type: step.type || 'Npc',
             questId: lessonId,
             contents: step.questions?.map((question) => ({
               questStepContentType: question.activityType || 'Exercise',
               questionType: question.questionType || 'MultipleChoice',
               description: question.description || question.title || 'Pergunta sem descrição',
               weight: question.weight || 1,
               expectedAnswers: {
                  questionType: question.questionType || 'MultipleChoice',
                  options: question.options?.map(opt => ({
                    description: opt.text || '',
                    is_correct: opt.isCorrect || false
                  })) || []
               }
             })) || []
          };

          // --- LÓGICA DA CORREÇÃO ---
          // Se a etapa tem um ID, ela já existe no backend -> ATUALIZAR
          if (step.id) {
             console.log(`Atualizando etapa ID: ${step.id}`);
             return updateQuestStep(step.id, questStepData);
          } else {
             // Se a etapa não tem ID, ela é nova -> CRIAR
             // (Nota: A sua lógica atual de salvar modal já deve dar um ID)
             console.log(`Criando nova etapa: ${step.title}`);
             return createQuestStep(questStepData);
          }
          // --- FIM DA CORREÇÃO ---
        }));

        alert('Aula salva com sucesso!');
        navigate('/apps/lesson-management/lessons');
     } catch (error: any) {
        console.error('Erro detalhado ao salvar aula:', error);
        alert(`Erro ao salvar aula: ${error.response?.data?.message || error.message}`);
     } finally {
        setIsSaving(false);
     }
   };

  // --- Render Step Cards ---
  const renderStepCard = (step: PageStep, index: number) => (
    <div key={step.id || `step-${index}`} className='col-xl-6 mb-7'>
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
                        <td>{q.title.length > 30 ? q.title.substring(0, 30) + '...' : q.title}</td>
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
            {isLoading ? (
              <div className='d-flex justify-content-center py-10'>
                <div className='spinner-border text-primary' role='status'>
                  <span className='visually-hidden'>Carregando...</span>
                </div>
              </div>
            ) : (
              <div className='d-flex flex-wrap flex-sm-nowrap mb-6'>
                <div className='flex-grow-1'>
                  <div className='d-flex flex-column'>
                    <div className='d-flex align-items-center mb-2'>
                      <h1 className='fs-2 fw-bold text-gray-900 dark:text-white me-1'>
                        Aula: {getDisplayValue(lessonData.name, lessonId || 'Não identificada')}
                      </h1>
                    </div>
                  </div>
                  {!isLoading && lessonData.name ? (
                    <div className='row border border-gray-300 rounded p-5 mt-5 g-5'>
                      <div className='col-md-6 col-lg-3 d-flex flex-column'>
                        <span className='text-gray-600 fs-7 fw-semibold'>Nome da Aula</span>
                        <input
                          type='text'
                          className='form-control form-control-sm form-control-solid'
                          value={lessonData.name}
                          readOnly
                        />
                      </div>
                      <div className='col-md-6 col-lg-3 d-flex flex-column'>
                        <span className='text-gray-600 fs-7 fw-semibold'>Período</span>
                        <input
                          type='text'
                          className='form-control form-control-sm form-control-solid'
                          value={lessonData.schoolYear}
                          readOnly
                        />
                      </div>
                      <div className='col-md-6 col-lg-3 d-flex flex-column'>
                        <span className='text-gray-600 fs-7 fw-semibold'>Disciplina</span>
                        <input
                          type='text'
                          className='form-control form-control-sm form-control-solid'
                          value={lessonData.discipline}
                          readOnly
                        />
                      </div>
                      <div className='col-md-6 col-lg-3 d-flex flex-column'>
                        <span className='text-gray-600 fs-7 fw-semibold'>Combate</span>
                        <input
                          type='text'
                          className='form-control form-control-sm form-control-solid'
                          value={lessonData.combatDifficulty}
                          readOnly
                        />
                      </div>
                      <div className='col-md-6 col-lg-3 d-flex flex-column'>
                        <span className='text-gray-600 fs-7 fw-semibold'>BNCC</span>
                        <input
                          type='text'
                          className='form-control form-control-sm form-control-solid'
                          value={lessonData.bncc.join(', ')}
                          readOnly
                        />
                      </div>
                      <div className='col-md-6 col-lg-3 d-flex flex-column'>
                        <span className='text-gray-600 fs-7 fw-semibold'>Total de Etapas</span>
                        <input
                          type='text'
                          className='form-control form-control-sm form-control-solid'
                          value={lessonData.totalQuestSteps}
                          readOnly
                        />
                      </div>
                    </div>
                  ) : (
                    <div className='row border border-gray-300 rounded p-5 mt-5 g-5'>
                      <div className='col-12 text-center text-muted'>Carregando informações da aula...</div>
                    </div>
                  )}
                </div>
              </div>
            )}

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
          {steps
            .filter(step => step.title && step.title.trim() !== '')
            .sort((a, b) => a.sequence - b.sequence)
            .map(renderStepCard)}
        </div>

        {/* Botões de Ação */}
        <div className='d-flex justify-content-between mt-10'>
          <button
            type='button'
            className='btn btn-light-primary'
            onClick={() => navigate('/apps/lesson-management/lessons')}
          >
            Voltar para Aulas
          </button>
          
          <button
            type='button'
            className='btn btn-success'
            onClick={handleSaveLesson}
            disabled={isSaving || steps.length === 0}
          >
            {isSaving ? (
              <>
                <span className='spinner-border spinner-border-sm me-2' role='status'></span>
                Salvando...
              </>
            ) : (
              <>
                <i className='ki-duotone ki-check fs-5 me-2'></i>
                Salvar Aula
              </>
            )}
          </button>
        </div>

        {/* Modal Step */}
        <StepModal
          show={isStepModalOpen}
          handleClose={handleCloseStepModal}
          step={editingStep}
          lessonSequence={nextSequence}
          onSave={handleSaveStep as (step: Omit<any, 'id'>) => void}
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
