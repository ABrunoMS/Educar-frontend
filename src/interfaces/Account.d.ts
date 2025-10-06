export interface Account {
  id?: string;
  avatar?: string;
  name: string;
  lastName: string;
  email: string;
  registrationNumber: string;
  averageScore: 0;
  eventAverageScore: 0;
  stars: 0;
  clientId: string;
  role: 'Admin' | 'Teacher' | 'Student';
  schoolIds: string[];
  classIds: string[];
  password?: string;
  confirmPassword?: string;
}
