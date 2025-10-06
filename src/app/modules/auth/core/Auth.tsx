/* eslint-disable react-refresh/only-export-components */
import { FC, useState, useEffect, createContext, useContext, Dispatch, SetStateAction } from 'react'
import { LayoutSplashScreen } from '@metronic/layout/core'
import { AuthModel, UserModel } from './_models'
import * as authHelper from './AuthHelpers' // Assuming this import was missing
import { getUserByToken } from './_requests'
import { WithChildren } from '@metronic/helpers'
import { useRole } from '@contexts/RoleContext'

type AuthContextProps = {
  auth: AuthModel | undefined
  saveAuth: (auth: AuthModel | undefined) => void
  currentUser: UserModel | undefined
  setCurrentUser: Dispatch<SetStateAction<UserModel | undefined>>
  logout: () => void
}

const initAuthContextPropsState = {
  auth: authHelper.getAuth(),
  saveAuth: () => {},
  currentUser: undefined,
  setCurrentUser: () => {},
  logout: () => {},
}

const AuthContext = createContext<AuthContextProps>(initAuthContextPropsState)

const useAuth = () => {
  return useContext(AuthContext)
}

const AuthProvider: FC<WithChildren> = ({ children }) => {
  const [auth, setAuth] = useState<AuthModel | undefined>(authHelper.getAuth())
  const [currentUser, setCurrentUser] = useState<UserModel | undefined>()

  const saveAuth = (auth: AuthModel | undefined) => {
    setAuth(auth)
    if (auth) {
      authHelper.setAuth(auth)
    } else {
      authHelper.removeAuth()
    }
  }

  const logout = () => {
    saveAuth(undefined)
    setCurrentUser(undefined)
  }

  return (
    <AuthContext.Provider value={{ auth, saveAuth, currentUser, setCurrentUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

const AuthInit: FC<WithChildren> = ({ children }) => {
  const { auth, logout, setCurrentUser } = useAuth();
  const [showSplashScreen, setShowSplashScreen] = useState(true);
  const { setRole } = useRole();

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (auth?.access_token) {
          // 1. CHAMADA CORRIGIDA: Não passamos mais o token como argumento
          const user = await getUserByToken();

          if (user?.roles) {
            setCurrentUser(user);

            // 2. LÓGICA DE PERFIL ROBUSTA
            const roles = user.roles.map(r => r.toLowerCase());
            let userRole: 'Admin' | 'Teacher' | 'Student' = 'Student';

            if (roles.includes('admin')) {
              userRole = 'Admin';
            } else if (roles.includes('teacher')) {
              userRole = 'Teacher';
            }
            
            setRole(userRole);
          } else {
            // Se getUserByToken não retornar um usuário, fazemos logout
            logout();
          }
        } else {
          logout();
        }
      } catch (error) {
        console.error(error);
        logout();
      } finally {
        setShowSplashScreen(false);
      }
    };

    initAuth();
  }, []);

  return showSplashScreen ? <LayoutSplashScreen /> : <>{children}</>;
};

export { AuthProvider, AuthInit, useAuth };