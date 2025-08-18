/* eslint-disable @typescript-eslint/no-explicit-any */
import { AuthModel } from './_models'
import { refreshSession } from './_requests'

const AUTH_LOCAL_STORAGE_KEY = 'kt-auth-react-v'

const getAuth = (): AuthModel | undefined => {
  if (!localStorage) {
    return
  }

  const lsValue: string | null = localStorage.getItem(AUTH_LOCAL_STORAGE_KEY)
  if (!lsValue) {
    return
  }

  try {
    const auth: AuthModel = JSON.parse(lsValue) as AuthModel
    if (auth) {
      return auth
    }
  } catch (error) {
    console.error('AUTH LOCAL STORAGE PARSE ERROR', error)
  }
}

const setAuth = (auth: AuthModel) => {
  if (!localStorage) {
    return
  }

  try {
    const currentTime = Math.floor(Date.now() / 1000) // current time in seconds
    const lsValue = JSON.stringify({
      ...auth,
      // Converte a duração em segundos para um timestamp absoluto de expiração
      expires_in: auth.expires_in ? currentTime + auth.expires_in : undefined,
      refresh_expires_in: auth.refresh_expires_in ? currentTime + auth.refresh_expires_in : undefined,
    })
    localStorage.setItem(AUTH_LOCAL_STORAGE_KEY, lsValue)
  } catch (error) {
    console.error('AUTH LOCAL STORAGE SAVE ERROR', error)
  }
}

const removeAuth = () => {
  if (!localStorage) {
    return
  }

  try {
    localStorage.removeItem(AUTH_LOCAL_STORAGE_KEY)
  } catch (error) {
    console.error('AUTH LOCAL STORAGE REMOVE ERROR', error)
  }
}

// Helper para verificar se o token de acesso expirou
const isTokenExpired = (auth: AuthModel): boolean => {
  if (!auth?.expires_in) {
    return true
  }
  const currentTime = Math.floor(Date.now() / 1000)
  return currentTime >= auth.expires_in
}

// Helper para verificar se o refresh token expirou
const isRefreshTokenExpired = (auth: AuthModel): boolean => {
  if (!auth?.refresh_expires_in) {
    return true
  }
  const currentTime = Math.floor(Date.now() / 1000)
  return currentTime >= auth.refresh_expires_in
}

// Função para renovar o token
const refreshToken = async (auth?: AuthModel): Promise<AuthModel | undefined> => {
  try {
    const originalAuth = auth || getAuth()

    if (originalAuth && originalAuth.refresh_token && !isRefreshTokenExpired(originalAuth)) {
      const { data } = await refreshSession(originalAuth.refresh_token)
      
      const newAuth: AuthModel = {
        ...originalAuth, // Mantém dados antigos que não vêm na resposta de refresh
        ...data, // Sobrescreve com os novos tokens e durações
      }

      // Salva o objeto 'newAuth' completo, e não apenas a resposta 'data'.
      setAuth(newAuth)
      return newAuth
    } else {
      console.error('Refresh token expirado ou não disponível. Deslogando.')
      removeAuth()
      return undefined
    }
  } catch (error) {
    console.error('Falha ao renovar o token. Deslogando.', error)
    removeAuth()
    return undefined
  }
}

export function setupAxios(axios: any) {
  axios.defaults.headers.Accept = 'application/json'

  axios.interceptors.request.use(
    async (config: { headers: { Authorization: string } }) => {
      let auth = getAuth()

      
      if (auth && isTokenExpired(auth)) {
        console.log('Token de acesso expirado no interceptor, renovando...')
        auth = await refreshToken(auth)
      }

      // Se o auth (novo ou antigo) existir, adiciona o token ao header
      if (auth && auth.access_token) {
        config.headers.Authorization = `Bearer ${auth.access_token}`
      }

      return config
    },
    (err: any) => Promise.reject(err)
  )
}

export { getAuth, setAuth, removeAuth, refreshToken, isTokenExpired, isRefreshTokenExpired }