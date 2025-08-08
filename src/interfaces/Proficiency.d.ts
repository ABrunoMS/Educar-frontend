export interface Proficiency {
  id?: string;
  name: string;
  description: string;
  purpose: string;
}

export interface ProficiencyGroup {
  id?: string;
  name: string;
  description: string;
  proficiencyIds: string[];
}