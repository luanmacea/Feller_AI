import AsyncStorage from '@react-native-async-storage/async-storage'
import { createAsyncThunk } from '@reduxjs/toolkit'

import { LocalStore } from '@/constants/environment-variables'
import api from '@/services/api'

interface ISignInProps {
  cpf: string
  password: string
}

interface ISignUpProps {
  name: string
  cpf: string
  email: string
  password: string
}

interface IChangePasswordProps {
  cpf: string
  newPassword: string
}

export const signIn = createAsyncThunk(
  'auth/signIn',
  async (data: ISignInProps, { rejectWithValue }) => {
    try {
      const response = await api.get('/users', {
        params: {
          ...data,
        },
      })

      if (response.data[0]?.id) {
        const user = response.data[0]
        await AsyncStorage.setItem(LocalStore.USER_DATA, JSON.stringify(user))
        return response.data
      }

      return rejectWithValue('CPF ou senha incorretos.')
    } catch (error) {
      console.error('Erro ao fazer login:', error)
      return rejectWithValue('Erro ao fazer login.')
    }
  },
)

export const signUp = createAsyncThunk(
  'auth/signUp',
  async (data: ISignUpProps, { rejectWithValue }) => {
    try {
      const { cpf } = data

      const existingUsersResponse = await api.get('/users', {
        params: { cpf },
      })
      const existingUsers = existingUsersResponse.data

      if (existingUsers.length > 0) {
        return rejectWithValue('Este CPF ja esta cadastrado.')
      }

      const newUser = {
        name: data.name,
        cpf,
        email: data.email,
        password: data.password,
      }
      const response = await api.post('/users', newUser)
      const user = response.data
      await AsyncStorage.setItem(LocalStore.USER_DATA, JSON.stringify(user))
      return response.data
    } catch (error) {
      console.error('Erro ao cadastrar o usuario:', error)
      return rejectWithValue('Erro ao cadastrar o usuario.')
    }
  },
)

export const logOut = createAsyncThunk('auth/logOut', async () => {
  await AsyncStorage.removeItem(LocalStore.USER_DATA)
})

export const verifyCpf = createAsyncThunk(
  'auth/verifyCpf',
  async ({ cpf }: { cpf: string }, { rejectWithValue }) => {
    try {
      const response = await api.get('/users', {
        params: { cpf },
      })
      const users = response.data

      if (!Array.isArray(users) || users.length === 0) {
        return rejectWithValue('CPF nao encontrado.')
      }

      const user = users[0]

      return {
        id: user.id,
        name: user.name,
        cpf: user.cpf,
        email: user.email,
      }
    } catch (error) {
      console.error('Erro ao verificar CPF:', error)
      return rejectWithValue('Erro ao verificar CPF.')
    }
  },
)

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ cpf, newPassword }: IChangePasswordProps, { rejectWithValue }) => {
    try {
      const findResponse = await api.get('/users', {
        params: { cpf },
      })

      const users = findResponse.data

      if (!Array.isArray(users) || users.length === 0) {
        return rejectWithValue('CPF nao encontrado.')
      }

      const user = users[0]
      const updateResponse = await api.patch(`/users/${user.id}`, {
        password: newPassword,
      })
      await AsyncStorage.setItem(LocalStore.USER_DATA, JSON.stringify(user))

      return updateResponse.data
    } catch (error: any) {
      const message =
        error?.response?.data?.message || 'Erro ao alterar a senha.'
      return rejectWithValue(message)
    }
  },
)
