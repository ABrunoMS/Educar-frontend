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
