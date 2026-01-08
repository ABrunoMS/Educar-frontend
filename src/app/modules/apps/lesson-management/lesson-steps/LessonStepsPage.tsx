import React, { FC, useState, useMemo, useEffect } from 'react';
// Drag-and-drop nativo
import { useFormik } from 'formik';
import AsyncSelectField from '@components/form/AsyncSelectField';
import { useParams, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import StepModal from './LessonStepModal';
import QuestionModal from './LessonQuestionModal';
import { LessonType, Step, Question, AnswerOption, Quest, QuestStep } from '@interfaces/Lesson';
import { createQuestStep, getQuestById, updateQuestStep, deleteQuestStep, replaceAllQuestSteps } from '@services/Lesson';  // Importa as funções para salvar e buscar aula


interface PageStep {
 id: string | null; // <-- string (para IDs do backend) ou null (para novas)
 title: string;
 type: string;
 active: boolean;
 sequence: number;
 character: string;
 statement: string;
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

const bnccOptionsMock = [
  { value: 'BNCC1', label: 'Conteúdo BNCC 1' },
  { value: 'BNCC2', label: 'Conteúdo BNCC 2' },
  { value: 'BNCC3', label: 'Conteúdo BNCC 3' },
];

const LessonStepPage: FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();

  const [lessonData, setLessonData] = useState<LessonData>(initialLessonData);
  const [steps, setSteps] = useState<PageStep[]>([]); // Começa sem nenhuma 
  const [stepsToDelete, setStepsToDelete] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false); // Estado para controlar o salvamento
  const [isLoading, setIsLoading] = useState(true); // Estado para controlar carregamento dos dados
  const [editingBncc, setEditingBncc] = useState(false);
  const [bnccOptions, setBnccOptions] = useState(bnccOptionsMock);

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
            console.log('Mapeando', questSteps.length, 'etapas...');
            const mappedSteps: PageStep[] = questSteps.map((questStep: QuestStep, index: number) => {
              console.log(`Etapa ${index + 1}:`, questStep.name, '- Contents:', questStep.contents?.length || 0);
              if (questStep.contents && questStep.contents.length > 0) {
                console.log('  Contents completos:', JSON.stringify(questStep.contents, null, 2));
              }
              
              return {
              id: questStep.id || null,
              title: questStep.name || '',
              type: questStep.questStepType || 'Npc',
              active: true,
              sequence: index + 1,
              character: questStep.npcType || 'Passive',
              statement: questStep.description || '',
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
            }});
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
  const [nextQuestionSequence, setNextQuestionSequence] = useState(1);

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

  const handleSaveStep = async (stepData: Omit<PageStep, 'id' | 'questions'>) => {
     if (!lessonId) return;
    
     setIsSaving(true);
    
    
    const targetSequence = stepData.sequence;

     const stepPayload = {
          name: stepData.title,
          description: stepData.statement || stepData.title,
          order: targetSequence, // Usa a sequência nova
          npcType: stepData.character || 'Passive',
          npcBehaviour: 'StandStill', 
          questStepType: stepData.type || 'Npc', // Campo correto: questStepType
          questId: lessonId,
          contents: [] 
     };

     try {
        let savedStep: PageStep;

          if (editingStep && editingStep.id) {
               // --- MODO DE ATUALIZAÇÃO ---
            // 1. Atualiza a etapa atual no backend imediatamente
               await updateQuestStep(editingStep.id, stepPayload);
            
            // 2. Prepara o objeto atualizado para o estado local
            savedStep = { 
                ...editingStep, 
                ...stepData, 
                sequence: targetSequence 
            };
          } else {
           
               const response = await createQuestStep(stepPayload);
            
            
               savedStep = { 
                  ...stepData, 
                  id: response.data.id, 
              sequence: targetSequence,
                  questions: [] 
               };
          }

        
        setSteps(prevSteps => {
            // A. Removemos a etapa que estamos salvando da lista (para não duplicar/colidir com ela mesma)
            const otherSteps = prevSteps.filter(s => s.id !== savedStep.id);

            // B. Verificamos se existe conflito de sequência
            const hasCollision = otherSteps.some(s => s.sequence === targetSequence);

            let newStepList = otherSteps;

            // C. Se houver colisão, aumentamos +1 em quem estiver na frente
            if (hasCollision) {
                newStepList = otherSteps.map(s => {
                    // Se a etapa da lista for >= à sequência nova, ela sobe um número
                    if (s.sequence >= targetSequence) {
                        return { ...s, sequence: s.sequence + 1 };
                    }
                    return s;
                });
            }

            // D. Adiciona a etapa salva e reordena visualmente
            return [...newStepList, savedStep].sort((a, b) => a.sequence - b.sequence);
        });

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
    const step = steps.find(s => s.id === stepId);
    let nextSeq = 1;

    // Se a etapa existe e tem questões, pegamos a maior sequência e somamos 1
    if (step && step.questions && step.questions.length > 0) {
        const maxSeq = Math.max(...step.questions.map(q => q.sequence));
        nextSeq = maxSeq + 1;
    }
     setNextQuestionSequence(nextSeq);
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

    // Pega a sequência que o usuário digitou no modal
    const targetSequence = newQuestionData.sequence || 1;

    setSteps(prevSteps => 
      prevSteps.map(step => {
        // Encontramos a etapa que está sendo editada
        if (step.id === currentStepId) {
            
            // 1. Removemos a questão que está sendo salva da lista temporária
            // (para não compararmos ela com ela mesma se for edição)
            let otherQuestions = step.questions.filter(q => 
                editingQuestion ? q.id !== editingQuestion.id : true
            );

            // 2. Verificamos se existe colisão na sequência (alguém já usa esse número?)
            const hasCollision = otherQuestions.some(q => q.sequence === targetSequence);

            // 3. Se houver colisão, empurramos as questões existentes para frente (+1)
            if (hasCollision) {
                otherQuestions = otherQuestions.map(q => {
                    // Se a questão já existente tem uma sequência igual ou maior que a nova,
                    // ela precisa "dar espaço" e subir um número.
                    if (q.sequence >= targetSequence) {
                        return { ...q, sequence: q.sequence + 1 };
                    }
                    return q;
                });
            }

            // 4. Montamos o objeto final da questão salva
            let finalQuestion: Question;
            
            if (editingQuestion) {
                 // --- MODO EDIÇÃO ---
                 // Mantém os dados antigos e sobrepõe com os novos
                 finalQuestion = { ...editingQuestion, ...newQuestionData, sequence: targetSequence } as Question;
            } else {
                 // --- MODO CRIAÇÃO ---
                 finalQuestion = {
                    id: Date.now(), // ID temporário para o front
                    title: newQuestionData.title || 'Nova Questão',
                    activityType: newQuestionData.activityType || 'Exercise',
                    sequence: targetSequence,
                    questionType: newQuestionData.questionType || 'MultipleChoice',
                    weight: newQuestionData.weight || 1,
                    isActive: newQuestionData.isActive ?? true,
                    contentImage: newQuestionData.contentImage || '',
                    description: newQuestionData.description || '',
                    comments: newQuestionData.comments || '',
                    options: newQuestionData.options || [],
                    shuffleAnswers: newQuestionData.shuffleAnswers ?? false,
                    alwaysCorrect: newQuestionData.alwaysCorrect ?? false,
                 };
            }

            // 5. Junta a lista atualizada com a questão salva e reordena visualmente
            const updatedList = [...otherQuestions, finalQuestion].sort((a, b) => a.sequence - b.sequence);

            return { ...step, questions: updatedList };
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
      console.log('=== INICIANDO SALVAMENTO COMPLETO ===');
      console.log('LessonId:', lessonId);
      console.log('Total de etapas:', steps.length);
      
      // Coleta todos os IDs das etapas existentes (do backend)
      const existingStepIds = steps
        .filter(step => step.id && typeof step.id === 'string' && step.id.includes('-'))
        .map(step => step.id as string);
      
      console.log('IDs de etapas existentes para deletar:', existingStepIds);
      
      // Monta o payload de todas as etapas com seus conteúdos
      const stepsPayload = steps.map((step, index) => {
        console.log(`\n--- Processando etapa ${index + 1}/${steps.length} ---`);
        console.log('Etapa título:', step.title);
        console.log('Total de questões:', step.questions?.length || 0);

        // Monta o ExpectedAnswers para cada questão
        const contents = (step.questions || []).map((question) => {
          console.log('  -> Mapeando questão:', question.title);
          
          // IMPORTANTE: O backend requer o campo "questionType" no expectedAnswers para deserialização
          let expectedAnswers: any;
          
          switch (question.questionType) {
            case 'Dissertative':
              expectedAnswers = { 
                questionType: 'Dissertative',
                text: question.description || question.title || 'Resposta esperada' // Backend valida que text não pode ser vazio
              };
              break;
            case 'MultipleChoice':
              const mcOptions = (question.options || []).map(opt => ({
                description: opt.text || 'Opção sem descrição', // Backend valida que description não pode ser vazio
                is_correct: opt.isCorrect || false
              }));
              // Backend valida que deve ter pelo menos uma opção correta
              const hasCorrectOption = mcOptions.some(opt => opt.is_correct);
              if (!hasCorrectOption && mcOptions.length > 0) {
                mcOptions[0].is_correct = true; // Marca a primeira como correta se nenhuma estiver marcada
              }
              expectedAnswers = {
                questionType: 'MultipleChoice',
                options: mcOptions
              };
              break;
            case 'TrueOrFalse':
              expectedAnswers = {
                questionType: 'TrueOrFalse',
                options: (question.options || []).map(opt => ({
                  description: opt.text || 'Opção sem descrição',
                  is_correct: opt.isCorrect || false
                }))
              };
              break;
            case 'SingleChoice':
              expectedAnswers = {
                questionType: 'SingleChoice',
                option: question.options && question.options.length > 0 
                  ? (question.options[0].text || 'Opção sem descrição')
                  : 'Opção sem descrição' // Backend valida que option não pode ser vazio
              };
              break;
            default:
              expectedAnswers = {
                questionType: 'MultipleChoice',
                options: (question.options || []).map(opt => ({
                  description: opt.text || 'Opção sem descrição',
                  is_correct: opt.isCorrect || false
                }))
              };
          }
          
          return {
            questStepContentType: question.activityType || 'Exercise',
            questionType: question.questionType || 'MultipleChoice',
            description: question.description || question.title || 'Pergunta sem descrição',
            weight: question.weight || 1,
            expectedAnswers: expectedAnswers
          };
        });

        console.log(`  -> Total de contents mapeados: ${contents.length}`);
        console.log(`  -> Contents:`, JSON.stringify(contents, null, 2));

        // Retorna o payload da etapa no formato esperado pelo bulk endpoint
        const stepPayload = {
          name: step.title,
          description: step.statement || step.title || 'Descrição da etapa',
          order: step.sequence,
          npcType: step.character || 'Passive',
          npcBehaviour: 'StandStill',
          type: step.type || 'Npc', // Note: aqui é "type", não "questStepType" para o FullQuestStepDto
          contents: contents,
          npcIds: [],
          mediaIds: [],
          itemIds: []
        };
        
        console.log(`  -> Payload da etapa completo:`, JSON.stringify(stepPayload, null, 2));
        return stepPayload;
      });

      console.log('\n=== PAYLOAD COMPLETO PARA BULK ===');
      console.log(JSON.stringify({ questId: lessonId, steps: stepsPayload }, null, 2));

      // Deleta todas as etapas antigas e cria as novas usando o endpoint bulk
      const response = await replaceAllQuestSteps(lessonId, existingStepIds, stepsPayload);
      
      console.log('\n=== SALVAMENTO CONCLUÍDO COM SUCESSO ===');
      console.log('Novas etapas criadas:', response.data);
      
      alert('Aula e todas as questões foram salvas com sucesso!');
      navigate('/apps/lesson-management/lessons');
    } catch (error: any) {
      console.error('❌ ERRO DETALHADO AO SALVAR:', error);
      console.error('Resposta do servidor:', error.response?.data);
      console.error('Status:', error.response?.status);
      console.error('Headers:', error.response?.headers);
      
      // Tenta extrair detalhes de validação se existirem
      const validationErrors = error.response?.data?.errors || error.response?.data?.Errors;
      if (validationErrors) {
        console.error('Erros de validação detalhados:', validationErrors);
        const errorMessages = Object.entries(validationErrors)
          .map(([field, messages]: [string, any]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('\n');
        alert(`Erro de validação:\n\n${errorMessages}`);
      } else {
        alert(`Erro ao salvar aula: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // --- Render Step Cards ---
  const renderStepCard = (step: PageStep, index: number) => (
      <div className='card h-100 bg-body w-100'>
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
                <div className='flex-grow-1 position-relative'>
                  <div className='d-flex flex-column'>
                    <div className='d-flex align-items-center mb-2 gap-2'>
                      <h1 className='fs-2 fw-bold text-gray-900 dark:text-white me-1'>
                        Aula: {getDisplayValue(lessonData.name, lessonId || 'Não identificada')}
                      </h1>
                    </div>
                  </div>
                  <button
                  className='btn btn-icon btn-xs btn-light-primary position-absolute top-0 end-0 mt-2 me-2 d-flex align-items-center justify-content-center shadow-sm'
                      title='Editar informações da aula'
                      onClick={() => navigate(`/apps/lesson-management/lessonEdit/${lessonId}`)}
                      style={{ width: 28, height: 28, zIndex: 2 }}
                    >
                      {/* Ícone atualizado para o estilo quadrado */}
                      <i className="bi bi-pencil-square fs-5"></i>
                </button>
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
                     {/* <div className='col-md-6 col-lg-3 d-flex flex-column'>
                        <span className='text-gray-600 fs-7 fw-semibold'>Combate</span>
                        <input
                          type='text'
                          className='form-control form-control-sm form-control-solid'
                          value={lessonData.combatDifficulty}
                          readOnly
                        />
                      </div>*/}
                      
                      
                      <div className='col-md-6 col-lg-3 d-flex flex-column'>
                        <span className='text-gray-600 fs-7 fw-semibold'>Total de Etapas</span>
                        <input
                          type='text'
                          className='form-control form-control-sm form-control-solid'
                          value={lessonData.totalQuestSteps}
                          readOnly
                        />
                      </div>
                      <div className='col-12 col-lg-12 d-flex flex-column mt-2'>
                        <span className='text-gray-600 fs-7 fw-semibold mb-1'>BNCC</span>
                        <div className='d-flex flex-wrap align-items-center gap-2' style={{ minHeight: 40 }}>
                          {lessonData.bncc.length > 0 ? lessonData.bncc.map((bncc, idx) => (
                            <span
                              key={idx}
                              className="d-flex align-items-center px-3 py-1 rounded-pill border border-gray-200 bg-gray-100 fw-semibold"
                              style={{ fontSize: '0.95rem', marginBottom: '4px', color: 'var(--bs-gray-700)', maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                              title={bncc}
                            >
                              {bncc.length > 70 ? bncc.slice(0, 70) + '...' : bncc}
                            </span>
                          )) : <span className='text-muted'>Nenhum conteúdo BNCC</span>}
                        </div>
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
                className='btn btn-lg btn-primary d-flex align-items-center gap-2 px-4 py-2 shadow-sm'
                onClick={() => handleOpenStepModal(null)}
              >
                <i className='ki-duotone ki-plus fs-4'></i>
                <span className='fw-bold'>Adicionar etapas</span>
              </button>
            </div>
          </div>
        </div>


        {/* Etapas com Drag and Drop nativo */}
        <div
          className='steps-flex-container'
          onDragOver={e => e.preventDefault()}
        >
          {steps
            .filter(step => step.title && step.title.trim() !== '')
            .sort((a, b) => a.sequence - b.sequence)
            .map((step, index) => (
              <div
                key={step.id || `step-${index}`}
                className='step-card-container'
                draggable
                onDragStart={e => {
                  e.dataTransfer.setData('stepIndex', String(index));
                  e.currentTarget.classList.add('dragging-step');
                }}
                onDragEnd={e => {
                  e.currentTarget.classList.remove('dragging-step');
                }}
                onDragEnter={e => {
                  e.currentTarget.classList.add('drag-over-step');
                }}
                onDragLeave={e => {
                  e.currentTarget.classList.remove('drag-over-step');
                }}
                onDrop={e => {
                  const fromIndex = Number(e.dataTransfer.getData('stepIndex'));
                  const toIndex = index;
                  if (fromIndex === toIndex) return;
                  const filteredSteps = steps.filter(s => s.title && s.title.trim() !== '');
                  const reordered = Array.from(filteredSteps);
                  const [removed] = reordered.splice(fromIndex, 1);
                  reordered.splice(toIndex, 0, removed);
                  // Atualiza sequence
                  const updated = reordered.map((s, idx) => ({ ...s, sequence: idx + 1 }));
                  setSteps([
                    ...updated,
                    ...steps.filter(s => !(s.title && s.title.trim() !== ''))
                  ]);
                  e.currentTarget.classList.remove('drag-over-step');
                }}
                style={{ cursor: 'grab', transition: 'box-shadow 0.2s, border 0.2s' }}
              >
                {renderStepCard(step, index)}
              </div>
            ))}
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
            defaultSequence={nextQuestionSequence}
          />
        )}
      </div>
    </div>
  );
};

// Estilos para feedback visual do drag-and-drop e layout dos cards
const style = document.createElement('style');
style.innerHTML = `
  .steps-flex-container {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
    padding: 0;
    margin: 0;
    align-items: flex-start;
    width: 100%;
  }
  .step-card-container {
    flex: 0 0 calc(50% - 12px);
    min-width: 320px;
    max-width: calc(50% - 12px);
    margin: 0 !important;
    padding: 0 !important;
    box-sizing: border-box;
    background: none !important;
    display: block;
    border-radius: 8px;
  }
  @media (max-width: 768px) {
    .step-card-container {
      flex: 0 0 100%;
      max-width: 100%;
    }
  }
  .dragging-step {
    opacity: 0.6 !important;
    box-shadow: 0 0 16px 2px #007bff55 !important;
  }
  .drag-over-step {
    border: 2px dashed #007bff !important;
    border-radius: 8px;
    background: rgba(0, 123, 255, 0.1) !important;
  }
`;
document.head.appendChild(style);

export default LessonStepPage;
