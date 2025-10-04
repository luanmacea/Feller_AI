import { createSlice } from '@reduxjs/toolkit'
import * as SecureStore from 'expo-secure-store'

import { LocalStore } from '@/constants/environment-variables'
import { IUser } from '@/types/types'

import { changePassword, logOut, signIn, signUp } from './authThunk'

export interface AuthState {
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  user?: IUser
}

const initialState: AuthState = {
  isLoading: false,
  isAuthenticated: false,
  error: null,
  user: undefined,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuth: (state) => {
      state.isAuthenticated = false
      state.error = null
      state.isLoading = false
      state.user = undefined
    },
  },
  extraReducers: (builder) => {
    builder.addCase(signIn.pending, (state) => {
      state.isLoading = true
      state.error = null
      state.isAuthenticated = false
    })
    builder.addCase(signIn.fulfilled, (state, action) => {
      const { token } = action.payload
      SecureStore.setItemAsync(LocalStore.ACCESS_TOKEN, JSON.stringify(token))
      state.isLoading = false
      state.isAuthenticated = true
      state.error = null
    })
    builder.addCase(signIn.rejected, (state, action) => {
      state.isLoading = false
      state.isAuthenticated = false
      state.user = undefined
      state.error =
        (action.payload as string) ||
        action.error.message ||
        'Email ou senha incorretos.'
    })

    builder.addCase(signUp.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(signUp.fulfilled, (state, action) => {
      const { token } = action.payload
      SecureStore.setItemAsync(LocalStore.ACCESS_TOKEN, JSON.stringify(token))
      state.isAuthenticated = true
      state.isLoading = false
      state.error = null
    })
    builder.addCase(signUp.rejected, (state, action) => {
      state.isLoading = false
      state.error =
        (action.payload as string) ||
        action.error.message ||
        'Nao foi possivel criar o usuario.'
    })

    builder.addCase(signUp.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(signUp.fulfilled, (state, action) => {
      const { token } = action.payload
      SecureStore.setItemAsync(LocalStore.ACCESS_TOKEN, JSON.stringify(token))
      state.isAuthenticated = true
      state.isLoading = false
      state.error = null
    })
    builder.addCase(signUp.rejected, (state, action) => {
      state.isLoading = false
      state.error =
        (action.payload as string) ||
        action.error.message ||
        'Nao foi possivel criar o usuario.'
    })

    builder.addCase(changePassword.pending, (state) => {
      state.isLoading = true
      state.error = null
    })
    builder.addCase(changePassword.fulfilled, (state) => {
      state.isLoading = false
      state.error = null
    })
    builder.addCase(changePassword.rejected, (state, action) => {
      state.isLoading = false
      state.error =
        (action.payload as string) ||
        action.error.message ||
        'Nao foi possivel redefinir a senha.'
    })

    builder.addCase(logOut.pending, (state) => {
      state.isLoading = true
    })
    builder.addCase(logOut.fulfilled, (state) => {
      state.user = undefined
      state.isLoading = false
      state.isAuthenticated = false
      state.error = null
    })
    builder.addCase(logOut.rejected, (state, action) => {
      state.isLoading = false
      state.error =
        action.error.message || 'Nao foi possivel encerrar a sessao.'
    })
  },
})

export const { clearAuth } = authSlice.actions
export default authSlice.reducer
