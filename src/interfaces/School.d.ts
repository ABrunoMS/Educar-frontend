export interface School {
  id?: string;
  name: string;
  description: string;
  address: string;
  client: string;
  regionalId?: string;
  teacherIds?: string[];
  studentIds?: string[];
}

export interface SchoolType {
  id?: string;
  name?: string;
  description?: string;
  addressId?: string | null;
  clientId?: string;
  regionalId?: string;
  teacherIds?: string[];
  studentIds?: string[];
  address?: {
    id: string;
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    lat?: number;
    lng?: number;
  };
  client?: {
    id: string;
    name?: string;
    description?: string;
  };
  regional?: {
    id: string;
    name?: string;
    subsecretariaId?: string;
  };
}

export interface Regional {
  id: string;
  name: string;
  subsecretariaId: string;
}

export interface Subsecretaria {
  id: string;
  name: string;
  clientId: string;
}