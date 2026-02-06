// This file is generated from backend enum UserRole.
// Keep in sync with backend `UserRole` enum (src/Domain/Enums/UserRole.cs)

export type Role =
  | 'Admin'
  | 'AgenteComercial'
  | 'Diretor'
  | 'Distribuidor'
  | 'Secretario'           // Secretário Geral - vê tudo do cliente em que está vinculado
  | 'Subsecretario'        // Vê apenas a subsecretaria em que está vinculado
  | 'SecretarioRegional'   // Vê apenas a regional em que está vinculado
  | 'Teacher'
  | 'TeacherEducar'
  | 'Student'

export const ALL_ROLES: Role[] = [
  'Admin',
  'AgenteComercial',
  'Diretor',
  'Distribuidor',
  'Secretario',
  'Subsecretario',
  'SecretarioRegional',
  'Teacher',
  'TeacherEducar',
  'Student',
]

export default ALL_ROLES

// Robust mapping from raw role strings (from Keycloak/token) to our Role type.
export function mapRoleString(raw?: string): Role | undefined {
  if (!raw) return undefined
  const cleaned = raw.trim().toLowerCase()
  switch (cleaned) {
    case 'admin':
    case 'administrator':
      return 'Admin'
    case 'agentecomercial':
    case 'agente_comercial':
    case 'agente-comercial':
    case 'agente comercial':
      return 'AgenteComercial'
    case 'diretor':
      return 'Diretor'
    case 'distribuidor':
      return 'Distribuidor'
    
    // Secretário (Geral) - acesso total ao cliente
    case 'secretario':
    case 'secretário':
    case 'secretaria':
    case 'secretária':
      return 'Secretario'
    
    // Subsecretário - acesso à subsecretaria
    case 'subsecretario':
    case 'subsecretário':
    case 'sub_secretario':
    case 'sub-secretario':
      return 'Subsecretario'
    
    // Secretário Regional - acesso à regional
    case 'secretarioregional':
    case 'secretario_regional':
    case 'secretario-regional':
    case 'secretário regional':
    case 'secretario regional':
      return 'SecretarioRegional'
    
    case 'teacher':
    case 'professor':
      return 'Teacher'
    case 'teachereducar':
    case 'teacher_educar':
    case 'teacher-educar':
    case 'professor_educar':
    case 'professoreducar':
    case 'professor-educar':
      return 'TeacherEducar'
    case 'student':
    case 'aluno':
      return 'Student'
    default:
      // try to match by removing non-alphanumeric
      const alpha = cleaned.replace(/[^a-z0-9]/g, '')
      for (const r of ALL_ROLES) {
        if (r.toLowerCase().replace(/[^a-z0-9]/g, '') === alpha) return r
      }
      return undefined
  }
}
