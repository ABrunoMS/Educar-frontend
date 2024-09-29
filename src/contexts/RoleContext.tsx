import React, {createContext, useContext, useState, ReactNode} from 'react'

// Define a type for the possible roles
export type Role = 'Admin' | 'Teacher' | 'Student'

// Define the structure of the context
interface RoleContextType {
  role: Role
  setRole: (role: Role) => void
}

// Initialize the context with default values
const RoleContext = createContext<RoleContextType | undefined>(undefined)

export const RoleProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const [role, setRole] = useState<Role>('Student') // Default role

  return (
    <RoleContext.Provider value={{role, setRole}}>
      {children}
    </RoleContext.Provider>
  )
}

// Hook for accessing the role context
export const useRole = (): RoleContextType => {
  const context = useContext(RoleContext)
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider')
  }
  return context
}