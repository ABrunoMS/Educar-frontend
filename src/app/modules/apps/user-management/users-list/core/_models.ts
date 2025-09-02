import {ID, Response} from '../../../../../../_metronic/helpers'
export type User = {
  id?: ID
  name?: string
  avatar?: string
  email?: string
  position?: string
  role?: string
  last_login?: string
  two_steps?: boolean
  joined_day?: string
  online?: boolean
  initials?: {
    label: string
    state: string
  }

    client?: { 
    id: string
    name: string
  }
  clientId?: string
  classIds?: string[]
  schoolIds?: string[]
  schools?: Array<{id: string, name: string}> 
  classes?: Array<{id: string, name: string}>
}

export type UsersQueryResponse = Response<Array<User>>

export const initialUser: User = {
  avatar: 'avatars/300-3.jpg',
  position: 'Art Director',
  role: 'Administrator',
  name: '',
  email: '',
}
