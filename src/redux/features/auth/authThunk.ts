import { createAsyncThunk } from '@reduxjs/toolkit'
import * as SecureStore from 'expo-secure-store'

import { LocalStore } from '@/constants/environment-variables'
import api from '@/services/api'

interface SignInPayload {
  cpf: string
  password: string
}

interface SignUpPayload {
  nomeUsuario: string
  email: string
  cpf: string
  password: string
  dtNascimento: string
  tipo?: string
}

interface ResetPasswordPayload {
  cpf: string
  newPassword: string
}

// const persistSession = async ({ token, user }: AuthSuccessPayload) => {
//   setAuthorizationHeader(token)
//   await AsyncStorage.multiSet([
//     [LocalStore.ACCESS_TOKEN, token],
//     [LocalStore.USER_DATA, JSON.stringify(user)],
//   ])
// }

export const signIn = createAsyncThunk(
  'auth/signIn',
  async (data: SignInPayload) => {
    const response = await api.post('/usuarios/login', {
      cpf: data.cpf,
      senha: data.password,
    })
    SecureStore.setItemAsync(LocalStore.ACCESS_TOKEN, response.data.token)
    return response.data
  },
)

export const signUp = createAsyncThunk(
  'auth/signUp',
  async (data: SignUpPayload) => {
    const response = await api.post('/usuarios/criar', data)
    return response.data
  },
)

export const getLogged = createAsyncThunk('auth/getLogged', async () => {
  console.log('antes thunk')
  const response = await api.get('/usuarios/logged')
  console.log('depois thunk', response.data)

  return response.data
})

export const logOut = createAsyncThunk('auth/logOut', async () => {
  await SecureStore.deleteItemAsync(LocalStore.ACCESS_TOKEN)
  await SecureStore.deleteItemAsync(LocalStore.USER_DATA)
})

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ cpf, newPassword }: ResetPasswordPayload) => {
    const response = await api.post('/usuarios/criar-senha', {
      cpf,
      senhaNova: newPassword,
    })

    return response.data
  },
)
