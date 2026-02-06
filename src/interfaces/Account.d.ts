import { Role } from '../contexts/roles.generated'

export interface Account {
  id?: string;
  avatar?: string;
  name: string;
  lastName: string;
  email: string;
  registrationNumber?: string;
  averageScore?: number;
  eventAverageScore?: number;
  stars?: number;
  clientId: string;
  clientName?: string;
  role: Role;
  schoolIds: string[];
  classIds: string[];
  password?: string;
  confirmPassword?: string;
}
