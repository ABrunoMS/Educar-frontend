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
  role: 'Admin' | 'Teacher' | 'Student';
  schoolIds: string[];
  classIds: string[];
  password?: string;
  confirmPassword?: string;
}
