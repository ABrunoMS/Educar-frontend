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
    auth.expires_in
    const currentTime = Math.floor(Date.now() / 1000) // current time in seconds
    const lsValue = JSON.stringify({
      ...auth,
      expires_in: auth.expires_in! + currentTime,
      refresh_expires_in: auth.refresh_expires_in! + currentTime,
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

// Helper function to check if the access token is expired
const isTokenExpired = (auth: AuthModel): boolean => {
  if (!auth || !auth.expires_in) {
    return true
  }
  const currentTime = Math.floor(Date.now() / 1000) // current time in seconds
  return currentTime >= auth.expires_in // Assuming expires_in is in seconds
}

// Helper function to check if the refresh token is expired
const isRefreshTokenExpired = (auth: AuthModel): boolean => {
  if (!auth || !auth.refresh_expires_in) {
    return true
  }
  const currentTime = Math.floor(Date.now() / 1000)
  return currentTime >= auth.refresh_expires_in
}

// Helper function to refresh the token
const refreshToken = async (auth?: AuthModel): Promise<AuthModel | undefined> => {
  try {
    const oringinalAuth = auth || await getAuth()

    if (oringinalAuth && oringinalAuth.refresh_token && !isRefreshTokenExpired(oringinalAuth)) {
      const { data } = await refreshSession(oringinalAuth.refresh_token)
      const currentTime = Math.floor(Date.now() / 1000) // current time in seconds

      const newAuth: AuthModel = {
        ...oringinalAuth,
        access_token: data.access_token,
        expires_in: (data.expires_in) ? currentTime + data.expires_in : oringinalAuth.expires_in,
        refresh_token: data.refresh_token,
        refresh_expires_in: (data.refresh_expires_in) ? currentTime + data.refresh_expires_in : oringinalAuth.refresh_expires_in,
      }

      setAuth(data)
      return newAuth
    } else {
      console.error('Refresh token expired or not available')
      removeAuth()
      return undefined
    }
  } catch (error) {
    console.error('Token refresh failed', error)
    removeAuth()
    return undefined
  }
}

export function setupAxios(axios: any) {
  axios.defaults.headers.Accept = 'application/json'

  axios.interceptors.request.use(
    async (config: { headers: { Authorization: string } }) => {
      let auth = getAuth()

      // Check if the access token is expired and refresh if needed
      // if (auth && isTokenExpired(auth)) {
      //   auth = await refreshToken()
      // }

      // If auth exists and access_token is available, add it to the headers
      if (auth && auth.access_token) {
        config.headers.Authorization = `Bearer ${auth.access_token}`
      }

      return config
    },
    (err: any) => Promise.reject(err)
  )
}

export { getAuth, setAuth, removeAuth, refreshToken, isTokenExpired, isRefreshTokenExpired, AUTH_LOCAL_STORAGE_KEY }