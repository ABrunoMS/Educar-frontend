export interface User {
  id?: ID;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  registration?: string;
  institution?: string;
  characters?: string[];
  average?: number;
  averageEvent?: number;
  completedQuests?: number;
  failedQuests?: number;
  stars?: number;
  // Backwards-compatible fields
  first_name?: string;
  last_name?: string;
}
