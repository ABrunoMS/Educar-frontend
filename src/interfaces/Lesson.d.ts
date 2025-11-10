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

// Interfaces para Quest (Aula) baseadas no modelo do backend
export interface Quest {
  Id?: string;
  Name: string;
  Description: string;
  UsageTemplate: string;
  Type: string;
  MaxPlayers: number;
  TotalQuestSteps: number;
  CombatDifficulty: string;
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
  questStepContentType: string;
  questionType: string;
  description: string;
  weight: number;
  expectedAnswers: QuestStepContentExpectedAnswers;
}

export interface QuestStep {
  name: string;
  description: string;
  order: number;
  npcType: string;
  npcBehaviour: string;
  questStepType: string;
  questId: string;
  contents: QuestStepContent[];
}

export interface AnswerOption {
  id: number;
  image: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: number;
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
