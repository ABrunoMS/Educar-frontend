export interface Game {
  id?: string;
  name: string;
  description: string;
  lore: string;
  purpose: string;
  subjectIds: string[];
  proficiencyGroupIds: string[];
}