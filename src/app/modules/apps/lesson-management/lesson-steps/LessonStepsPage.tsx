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
      
      if (!lessonId) return;
      setIsLoading(true);
      
      try {
        const response = await getQuestById(lessonId);
        
        if (response.data && response.data.id) {
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
               bncc: backend.proficiencies ? backend.proficiencies.map((p: any) => p.description || p.code) : [],
          });
          
          // --- CORREÇÃO: Helper que aceita String ou Número ---
          const getFrontendQuestionType = (backendType: number | string): string => {
              // Se vier String do backend (ex: "SingleChoice")
              if (typeof backendType === 'string') {
                  if (backendType === 'Text') return 'text';
                  if (backendType === 'Video') return 'video';
                  // Retorna a própria string se for compatível (MultipleChoice, etc)
                  return backendType;
              }

              // Se vier Número (ex: 5)
              switch (backendType) {
                case 1: return 'text';           
                case 2: return 'video';          
                case 3: return 'MultipleChoice';
                case 4: return 'TrueOrFalse';
                case 5: return 'SingleChoice';
                case 6: return 'Dissertative';
                case 7: return 'ColumnFill';
                case 8: return 'AlwaysCorrect';
                case 9: return 'Ordering';       
                case 10: return 'MatchTwoRows';
                default: return 'MultipleChoice';
              }
          };

          const questSteps = backend.questSteps || [];
          
          if (Array.isArray(questSteps) && questSteps.length > 0) {
            const mappedSteps: PageStep[] = questSteps.map((questStep: any, index: number) => {
              const contents = questStep.contents || questStep.Contents || [];

              return {
                id: questStep.id || null,
                title: questStep.name || '',
                // Aceita string "Npc" ou número 1
                type: (questStep.questStepType === 'Npc' || questStep.questStepType === 1) ? 'Npc' : 'Npc', 
                active: questStep.isActive ?? true,
                sequence: questStep.order || (index + 1),
                character: (questStep.npcType === 'Passive' || questStep.npcType === 1) ? 'Passive' : 'Passive',
                statement: questStep.description || '',
                questions: contents
                  .sort((a: any, b: any) => (a.sequence || 0) - (b.sequence || 0))
                  .map((content: any, qIndex: number) => {
                    
                    // 1. Identificação do Tipo (Trata String e Number)
                    const contentTypeVal = content.questStepContentType ?? content.QuestStepContentType;
                    const itemTypeVal = content.questStepContentItemType ?? content.QuestStepContentItemType;
                    
                    // Verifica se é informativo (pode vir 1 ou "Informative")
                    const isInformative = contentTypeVal === 1 || contentTypeVal === 'Informative'; 
                    
                    let activityType = 'Exercise';
                    let questionType = 'MultipleChoice';

                    if (isInformative) {
                        activityType = 'Informative';
                        // Se for Video (2 ou "Video")
                        const isVideo = itemTypeVal === 2 || itemTypeVal === 'Video';
                        questionType = isVideo ? 'video' : 'text'; 
                    } else {
                        questionType = getFrontendQuestionType(itemTypeVal);
                    }

                    // 2. Recuperar Itens (Respostas)
                    const rawItems = content.items || content.Items || [];
                    
                    let options: any[] = [];
                    let orderingItems: string[] | undefined;
                    let columnFillMatches: any[] | undefined;
                    
                    // Arrays vazios para Match (se precisar no futuro)
                    let matchLeft: string[] | undefined;
                    let matchRight: string[] | undefined;
                    let matchPairs: any[] | undefined;

                    if (questionType === 'Dissertative') {
                        options = []; 
                    } 
                    else if (questionType === 'Ordering') {
                        orderingItems = rawItems
                            .sort((a: any, b: any) => a.order - b.order)
                            .map((i: any) => i.title || i.textContent);
                        options = [];
                    }
                    else if (questionType === 'ColumnFill') {
                        columnFillMatches = rawItems.map((item: any) => ({
                            left: item.title,       
                            right: item.textContent 
                        }));
                        options = []; 
                    }
                    else {
                        // MultipleChoice, SingleChoice, TrueOrFalse
                        options = rawItems.map((item: any, oIndex: number) => ({
                            id: item.id || Date.now() + oIndex,
                            image: '', 
                            text: item.title || item.textContent, 
                            isCorrect: item.isCorrect
                        }));
                    }

                    return {
                      id: content.id || Date.now() + qIndex,
                      activityType: activityType,
                      sequence: content.sequence || (qIndex + 1),
                      questionType: questionType,
                      weight: content.weight || 1,
                      isActive: content.isActive ?? true,
                      contentImage: '', 
                      description: content.description || content.textContent || '', 
                      title: content.title || 'Questão',
                      comments: '',
                      options: options,
                      orderingItems: orderingItems,
                      columnFillMatches: columnFillMatches,
                      matchLeft: matchLeft,
                      matchRight: matchRight,
                      matchPairs: matchPairs,
                      shuffleAnswers: false,
                      alwaysCorrect: false,
                    };
                  })
              };
            });
            setSteps(mappedSteps);
          } else {
            setSteps([]);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados da aula', error);
      } finally {
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
                 const isInformative = newQuestionData.activityType === 'Informative';
                 finalQuestion = {
                    id: Date.now(), // ID temporário para o front
                    title: newQuestionData.title || 'Nova Questão',
                    activityType: newQuestionData.activityType || 'Exercise',
                    sequence: targetSequence,
                    questionType: isInformative ? 'AlwaysCorrect' : (newQuestionData.questionType || 'MultipleChoice'),
                    weight: isInformative ? 1 : (newQuestionData.weight || 1),
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

  const handleRemoveQuestion = (stepId: string | null, questionId: string | number) => {
    if (window.confirm('Tem certeza que deseja remover esta questão?')) {
      setSteps(prevSteps => 
        prevSteps.map(step => {
          if (step.id === stepId) {
            const updatedQuestions = step.questions.filter(q => q.id !== questionId);
            // Reorganiza as sequências após a remoção
            const reorderedQuestions = updatedQuestions.map((q, index) => ({
              ...q,
              sequence: index + 1
            }));
            return { ...step, questions: reorderedQuestions };
          }
          return step;
        })
      );
    }
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
  const ContentTypeEnum = {
      None: 0,
      Informative: 1,
      Exercise: 2
    };

    const ItemTypeEnum = {
      None: 0,
      Text: 1,
      Video: 2,
      MultipleChoice: 3,
      TrueOrFalse: 4,
      SingleChoice: 5,
      Dissertative: 6,
      ColumnFill: 7,
      AlwaysCorrect: 8,
      Ordering: 9,      // Agora tem número oficial!
      MatchTwoRows: 10  // Agora tem número oficial!
    };

  const QuestStepTypeEnum = {
        Npc: 1 // Assumindo que 1 = Npc
    };

  const NpcTypeEnum = {
        Passive: 1 // Assumindo que 1 = Passive
    };

  const NpcBehaviourEnum = {
        StandStill: 1 // Assumindo que 1 = StandStill
    };

    // Helper para converter string do Front para Inteiro do Back
    const getBackendItemType = (frontType: string, isInformative: boolean): number => {
      if (isInformative) {
         // Se o front diz que é 'video', manda 2. Se for 'text' (ou qualquer outra coisa), manda 1.
         return frontType === 'video' ? ItemTypeEnum.Video : ItemTypeEnum.Text;
      }

      switch (frontType) {
        case 'MultipleChoice': return ItemTypeEnum.MultipleChoice; // 3
        case 'TrueOrFalse': return ItemTypeEnum.TrueOrFalse;       // 4
        case 'SingleChoice': return ItemTypeEnum.SingleChoice;     // 5
        case 'Dissertative': return ItemTypeEnum.Dissertative;     // 6
        case 'ColumnFill': return ItemTypeEnum.ColumnFill;         // 7
        case 'AlwaysCorrect': return ItemTypeEnum.AlwaysCorrect;   // 8
        case 'Ordering': return ItemTypeEnum.Ordering;             // 9
        case 'MatchTwoRows': return ItemTypeEnum.MatchTwoRows;     // 10
        default: return ItemTypeEnum.None;
      }
    };

    // 2. Monta o Payload
    const stepsPayload = steps.map((step, index) => {
        console.log(`\n--- Processando etapa ${index + 1}/${steps.length} ---`);
        
        const contents = (step.questions || []).map((question) => {
          
          const isInformative = question.activityType === 'Informative';
          const contentTypeInt = isInformative ? ContentTypeEnum.Informative : ContentTypeEnum.Exercise;
          const itemTypeInt = getBackendItemType(question.questionType, isInformative);

          // Lista unificada de items (antigo ExpectedAnswers)
          let itemsPayload: any[] = [];

          if (isInformative) {
              // --- CENÁRIO: INFORMATIVO (Texto ou Vídeo) ---
              itemsPayload.push({
                  itemType: itemTypeInt,
                  order: 1,
                  title: question.title, 
                  // Se for Texto, o conteúdo vai em textContent. Se for Vídeo, a URL vai em videoUrl
                  textContent: itemTypeInt === ItemTypeEnum.Text ? question.description : null,
                  videoUrl: itemTypeInt === ItemTypeEnum.Video ? question.description : null, // Assumindo que a URL tá na description
                  videoProvider: itemTypeInt === ItemTypeEnum.Video ? 'YouTube' : null, // Exemplo
                  isCorrect: null
              });
          } else {
              // --- CENÁRIO: EXERCÍCIOS ---

              // 1. Múltipla Escolha / Single / TrueOrFalse
              if (['MultipleChoice', 'SingleChoice', 'TrueOrFalse'].includes(question.questionType)) {
                  itemsPayload = (question.options || []).map((opt, i) => ({
                      itemType: itemTypeInt,
                      order: i + 1,
                      title: opt.text,        // O texto da opção
                      textContent: null,      // Geralmente null para opções simples
                      isCorrect: opt.isCorrect,
                      videoUrl: null
                  }));
              }
              
              // 2. Dissertativa
              else if (question.questionType === 'Dissertative') {
                  itemsPayload.push({
                      itemType: itemTypeInt,
                      order: 1,
                      title: "Resposta Esperada",
                      textContent: question.description || "", // O gabarito ou texto de apoio
                      isCorrect: true,
                      videoUrl: null
                  });
              }

              // 3. Column Fill (Preencher Lacunas)
              else if (question.questionType === 'ColumnFill') {
                   // Mapeia pares chave-valor
                   if (question.columnFillMatches) {
                       itemsPayload = question.columnFillMatches.map((pair, i) => ({
                           itemType: itemTypeInt,
                           order: i + 1,
                           title: pair.left,       // Lado Esquerdo (Chave)
                           textContent: pair.right, // Lado Direito (Resposta/Valor)
                           isCorrect: true,
                           videoUrl: null
                       }));
                   } else if (question.options) {
                       // Fallback se estiver usando options
                       itemsPayload = question.options.map((opt, i) => ({
                           itemType: itemTypeInt,
                           order: i + 1,
                           title: String(i),
                           textContent: opt.text,
                           isCorrect: true,
                           videoUrl: null
                       }));
                   }
              }

              // 4. Ordenação (Ordering) - Tratamento genérico pois não tem Enum específico na lista 0-8
              else if (question.questionType === 'Ordering') {
                   const itemsList = question.orderingItems || (question.options || []).map(o => o.text);
                   itemsPayload = itemsList.map((text, i) => ({
                      itemType: itemTypeInt, // Vai ser 0 (None)
                      order: i + 1,          // A ordem correta é definida pelo índice aqui
                      title: text,
                      textContent: null,
                      isCorrect: true,
                      videoUrl: null
                   }));
              }
              
              // 5. MatchTwoRows - Tratamento genérico
              else if (question.questionType === 'MatchTwoRows') {
                  // Lógica customizada se necessário, ou enviar como None
                  // Implemente conforme necessidade do back para esse tipo específico
              }
          }

          // Retorna estrutura do CONTENT (conforme imagem do JSON)
          return {
            questStepContentType: contentTypeInt,
            questStepContentItemType: itemTypeInt,
            title: question.title || 'Título da Questão', // Novo campo Title no Content
            description: question.title || '',
            weight: question.weight || 1,
            isActive: question.isActive ?? true,
            sequence: question.sequence || 1,
            items: itemsPayload // A lista "items" substitui o "expectedAnswers"
          };
        });

        // Retorna estrutura do STEP
        return {
          name: step.title,
          description: step.statement || step.title || 'Descrição da etapa',
          order: step.sequence,
          npcType: NpcTypeEnum.Passive,
          npcBehaviour: NpcBehaviourEnum.StandStill,
          type: QuestStepTypeEnum.Npc,
          contents: contents,
          npcIds: [],
          mediaIds: [],
          itemIds: []
        };
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

  // Helper para mapear tipos de questão para nomes amigáveis
  const getQuestionTypeLabel = (question: Question): string => {
    // Se for informativo, retorna "Informativo"
    if (question.activityType === 'Informative') {
      return 'Informativo';
    }
    
    // Mapeia os tipos de exercício
    const typeMap: Record<string, string> = {
      'MultipleChoice': 'Múltipla Escolha',
      'SingleChoice': 'Escolha Única',
      'TrueOrFalse': 'Verdadeiro ou Falso',
      'Dissertative': 'Dissertativa',
      'AlwaysCorrect': 'Informativo',
      'ColumnFill': 'Preencher Colunas',
      'Ordering': 'Ordenação',
      'MatchTwoRows': 'Corresponder Duas Fileiras',
      'None': 'Informativo'
    };
    
    return typeMap[question.questionType] || question.questionType;
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
            <div className='d-flex align-items-center ms-auto'>
              <div
                className={clsx('bullet me-2', {
                  'bg-success': step.active,
                  'bg-danger': !step.active
                })}
                style={{ width: '10px', height: '10px' }}
              ></div>
              <span className={clsx('fw-semibold fs-7', {
                'text-success': step.active,
                'text-danger': !step.active
              })}>
                {step.active ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </div>

          {/* Detalhes */}
          <div className='d-flex flex-column gap-2 mb-5'>
            <div className='d-flex justify-content-between'>
              <span className='fw-semibold text-gray-600'>Total de Questões</span>
              <span className='fw-bold text-gray-900 dark:text-white'>{step.questions.length}</span>
            </div>
          </div>

          {/* Questões */}
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
                        <td>{getQuestionTypeLabel(q)}</td>
                        <td>{q.title.length > 30 ? q.title.substring(0, 30) + '...' : q.title}</td>
                        <td className='text-center'>
                          <span className={clsx('badge badge-sm', {
                            'badge-light-success': q.isActive,
                            'badge-light-danger': !q.isActive
                          })}>
                            {q.isActive ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className='text-end'>
                          <button
                            type='button'
                            className='btn btn-icon btn-sm btn-light-primary me-2'
                            onClick={() => handleOpenQuestionModal(step.id, q)}
                            title='Editar Questão'
                          >
                            <i className='ki-duotone ki-pencil fs-6'>
                              <span className='path1'></span>
                              <span className='path2'></span>
                            </i>
                          </button>
                          <button
                            type='button'
                            className='btn btn-icon btn-sm btn-light-danger'
                            onClick={() => handleRemoveQuestion(step.id, q.id)}
                            title='Deletar Questão'
                          >
                            <i className='ki-duotone ki-trash fs-6'>
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
            ) : (
              <p className='text-gray-500 dark:text-gray-400 fs-6 text-center pt-3'>
                Nenhuma atividade definida para esta etapa.
              </p>
            )}

            <div className='text-end mt-4'>
              <button
                className='btn btn-sm btn-primary'
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
                          value={steps.length}
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
