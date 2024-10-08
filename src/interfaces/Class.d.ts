export interface Class {
  id: string;
  name: string;
  description: string;
  purpose: 'Reinforcement' | 'Default' | 'SpecialProficiencies';
  accountIds: string[]
}