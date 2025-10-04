import AsyncStorage from '@react-native-async-storage/async-storage'
import { createAsyncThunk } from '@reduxjs/toolkit'
import type { AxiosError } from 'axios'

import { LocalStore } from '@/constants/environment-variables'
import api, { setAuthorizationHeader } from '@/services/api'
import type {
  InvestorProfileType,
  LoginResponse,
  UsuarioResponse,
} from '@/types/apiTypes'
import type { IUser } from '@/types/types'

interface SignInPayload {
  email: string
  password: string
}

interface SignUpPayload {
  nomeUsuario: string
  email: string
  cpf: string
  password: string
  dtNascimento: string
  tipo?: InvestorProfileType
}

interface ResetPasswordPayload {
  cpf: string
  newPassword: string
}

export interface AuthSuccessPayload {
  token: string
  user: IUser
}

type ApiErrorPayload = {
  mensagem?: string
  mensagemErro?: string
  mensagemRetorno?: string
  mensaje?: string
  erro?: string
  error?: string
  message?: string
  errors?: Array<{ message?: string; mensagem?: string }>
}

const stripNonDigits = (value: string | number) =>
  value?.toString().replace(/\D/g, '') || ''

const normaliseCpfString = (value: string | number) =>
  stripNonDigits(value).padStart(11, '0')

const parseApiError = (error: unknown, fallback: string) => {
  const axiosError = error as AxiosError<ApiErrorPayload>

  if (axiosError?.response?.data) {
    const data = axiosError.response.data

    if (Array.isArray(data.errors) && data.errors.length > 0) {
      const nested = data.errors.find((item) => item?.message || item?.mensagem)
      if (nested?.message) {
        return nested.message
      }
      if (nested?.mensagem) {
        return nested.mensagem
      }
    }

    return (
      data.message ||
      data.mensagem ||
      data.mensagemErro ||
      data.mensagemRetorno ||
      data.erro ||
      data.mensaje ||
      data.error ||
      fallback
    )
  }

  if (axiosError?.message) {
    return axiosError.message
  }

  return fallback
}

const mapUsuarioToUser = (usuario: UsuarioResponse): IUser => ({
  ...usuario,
  cpf: normaliseCpfString(usuario.cpf),
  nomePreferencial: usuario.nomeUsuario.split(' ')[0] || usuario.nomeUsuario,
})

const persistSession = async ({ token, user }: AuthSuccessPayload) => {
  setAuthorizationHeader(token)
  await AsyncStorage.multiSet([
    [LocalStore.ACCESS_TOKEN, token],
    [LocalStore.USER_DATA, JSON.stringify(user)],
  ])
}

const authenticateUser = async (
  payload: SignInPayload,
): Promise<AuthSuccessPayload> => {
  const loginResponse = await api.post<LoginResponse>('/usuarios/login', {
    email: payload.email,
    senha: payload.password,
  })

  const { token, userId } = loginResponse.data

  setAuthorizationHeader(token)

  const userResponse = await api.get<UsuarioResponse>(`/usuarios/${userId}`)
  const user = mapUsuarioToUser(userResponse.data)

  await persistSession({ token, user })

  return { token, user }
}

export const signIn = createAsyncThunk(
  'auth/signIn',
  async (data: SignInPayload, { rejectWithValue }) => {
    try {
      const session = await authenticateUser(data)
      return session
    } catch (error) {
      const message = parseApiError(error, 'Email ou senha incorretos.')
      return rejectWithValue(message)
    }
  },
)

export const signUp = createAsyncThunk(
  'auth/signUp',
  async (data: SignUpPayload, { rejectWithValue }) => {
    try {
      const cpfDigits = stripNonDigits(data.cpf)
      if (!cpfDigits) {
        throw new Error('CPF invalido')
      }

      const payload: {
        nomeUsuario: string
        email: string
        senha: string
        cpf: number
        dt_nascimento: string
        tipo?: InvestorProfileType
      } = {
        nomeUsuario: data.nomeUsuario.trim(),
        email: data.email.trim().toLowerCase(),
        senha: data.password,
        cpf: Number(cpfDigits),
        dt_nascimento: data.dtNascimento,
      }

      if (data.tipo) {
        payload.tipo = data.tipo
      }

      await api.post('/usuarios/criar', payload)

      const session = await authenticateUser({
        email: data.email,
        password: data.password,
      })

      return session
    } catch (error) {
      const message = parseApiError(error, 'Erro ao criar usuario.')
      return rejectWithValue(message)
    }
  },
)

export const logOut = createAsyncThunk('auth/logOut', async () => {
  await AsyncStorage.multiRemove([
    LocalStore.ACCESS_TOKEN,
    LocalStore.USER_DATA,
  ])
  setAuthorizationHeader()
})

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ cpf, newPassword }: ResetPasswordPayload, { rejectWithValue }) => {
    try {
      const cpfDigits = stripNonDigits(cpf)
      if (!cpfDigits) {
        throw new Error('CPF invalido')
      }

      const response = await api.post('/usuarios/criar-senha', {
        cpf: Number(cpfDigits),
        senhaNova: newPassword,
      })

      return response.data
    } catch (error) {
      const message = parseApiError(error, 'Erro ao redefinir a senha.')
      return rejectWithValue(message)
    }
  },
)
