export interface LessonType {
  id?: string;
  name?: string;
  title?: string; 
  school?: string; 
  class?: string; 
  discipline?: string; 
  schoolYear?: string;
  combat?: string;
  bncc?: string[]; 
  content?: string; 
}

// Interface para Produto
export interface ProductDto {
  id: string;
  name: string;
}

// Interface para Conteúdo
export interface ContentDto {
  id: string;
  name: string;
}

// Interfaces para Quest (Aula) baseadas no modelo do backend
export interface Quest {
  id?: string;             
  name: string;            
  description: string;     
  usageTemplate: boolean;   
  type: string;            
  maxPlayers: number;     
  totalQuestSteps: number; 
  combatDifficulty: string; 
  questSteps: QuestStep[];
  subjectId: string | null;
  gradeId: string | null;
  contentId: string;       // ID do conteúdo (obrigatório)
  productId: string;       // ID do produto (obrigatório)
  subject: string | { id?: string; name: string; [key: string]: any };  
  grade: string | { id?: string; name: string; [key: string]: any };     
  content?: ContentDto;    // Objeto de conteúdo (retornado pelo backend)
  product?: ProductDto;    // Objeto de produto (retornado pelo backend)
  proficiencies: string[];
}

// Interfaces para QuestStep (Etapa da Aula)
export interface QuestStepContentOption {
  description: string;
  is_correct: boolean;
}

export interface QuestStepContentExpectedAnswers {
  questionType: string;
  options: QuestStepContentOption[];
}

export interface QuestStepContent {
  id?: string;
  questStepContentType: string;
  questionType: string;
  title?: string;
  description: string;
  weight: number;
  isActive?: boolean;
  sequence: number;
  expectedAnswers: QuestStepContentExpectedAnswers;
}

export interface QuestStep {
  id?: string;
  name: string;
  description: string;
  order: number;
  npcType: string;
  npcBehaviour: string;
  questStepType: string;
  isActive?: boolean;
  questId?: string;
  contents: QuestStepContent[];
}

export interface AnswerOption {
  id: string | number;
  image: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string | number;
  title: string;  
  activityType: string;
  sequence: number;
  questionType: string;
  weight: number;
  isActive: boolean;
  contentImage: string;
  description: string;
  comments: string;
  options: AnswerOption[];
  shuffleAnswers: boolean;
  alwaysCorrect: boolean;
}

export interface Step {
  id: number;
  type: string;
  title: string;
  active: boolean;
  sequence: number;
  character: string;
  suggestion: string;
  questions: Question[];
}
