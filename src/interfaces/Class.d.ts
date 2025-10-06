export interface Class {
  id: string;
  name: string;
  description: string;
  //clientId: string;
  schoolId: string;
  purpose: 'Reinforcement' | 'Default' | 'SpecialProficiencies';
  accountIds: string[];
  isActive: string;
  schoolYear: string;
  schoolShift: string;
}