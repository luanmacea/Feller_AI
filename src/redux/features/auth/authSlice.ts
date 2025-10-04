import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { IUser } from '@/types/types'

import {
  AuthSuccessPayload,
  changePassword,
  logOut,
  signIn,
  signUp,
} from './authThunk'

export interface AuthState {
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  token: string | null
  user?: IUser
}

const initialState: AuthState = {
  isLoading: false,
  isAuthenticated: false,
  error: null,
  token: null,
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
      state.token = null
      state.user = undefined
    },
    setSession: (
      state,
      action: PayloadAction<{ user: IUser; token?: string }>,
    ) => {
      state.user = action.payload.user
      if (action.payload.token) {
        state.token = action.payload.token
      }
      state.isAuthenticated = true
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder.addCase(signIn.pending, (state) => {
      state.isLoading = true
      state.error = null
      state.isAuthenticated = false
    })
    builder.addCase(signIn.fulfilled, (state, action) => {
      const { token, user } = action.payload as AuthSuccessPayload
      state.user = user
      state.token = token
      state.isLoading = false
      state.isAuthenticated = true
      state.error = null
    })
    builder.addCase(signIn.rejected, (state, action) => {
      state.isLoading = false
      state.isAuthenticated = false
      state.token = null
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
      const { token, user } = action.payload as AuthSuccessPayload
      state.user = user
      state.token = token
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
      state.token = null
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

export const { clearAuth, setSession } = authSlice.actions
export default authSlice.reducer
