// This file is generated from backend enum UserRole.
// Keep in sync with backend `UserRole` enum (src/Domain/Enums/UserRole.cs)

export type Role =
  | 'Admin'
  | 'AgenteComercial'
  | 'Diretor'
  | 'Distribuidor'
  | 'Secretario'
  | 'Teacher'
  | 'TeacherEducar'
  | 'Student'

export const ALL_ROLES: Role[] = [
  'Admin',
  'AgenteComercial',
  'Diretor',
  'Distribuidor',
  'Secretario',
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
      return 'AgenteComercial'
    case 'diretor':
      return 'Diretor'
    case 'distribuidor':
      return 'Distribuidor'
    case 'secretario':
    case 'secretária':
    case 'secretaria':
      return 'Secretario'
    case 'teacher':
      return 'Teacher'
    case 'teachereducar':
    case 'teacher_educar':
    case 'teacher-educar':
      return 'TeacherEducar'
      case 'professor':
        return 'Teacher'
      case 'professor_educar':
      case 'professoreducar':
      case 'professor-educar':
        return 'TeacherEducar'
    case 'student':
    case 'aluno':
      return 'Student'
      case 'secretário':
      case 'secretario':
        return 'Secretario'
      case 'distribuidor':
        return 'Distribuidor'
      case 'agentecomercial':
      case 'agente_comercial':
      case 'agente-comercial':
      case 'agente comercial':
        return 'AgenteComercial'
      case 'diretor':
        return 'Diretor'
    default:
      // try to match by removing non-alphanumeric
      const alpha = cleaned.replace(/[^a-z0-9]/g, '')
      for (const r of ALL_ROLES) {
        if (r.toLowerCase().replace(/[^a-z0-9]/g, '') === alpha) return r
      }
      return undefined
  }
}
