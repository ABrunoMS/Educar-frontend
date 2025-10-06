export interface Class {
  id: string;
  name: string;
  description: string;
  //clientId: string;
  schoolId: string;
  purpose: 'Reinforcement' | 'Default' | 'SpecialProficiencies';
  accountIds: string[];
  isActive: boolean;
  schoolYear: string;
  schoolShift: 'morning' | 'afternoon' | 'night' | '';
  content: string[];
  teacherIds?: string[];
  studentIds?: string[];
}