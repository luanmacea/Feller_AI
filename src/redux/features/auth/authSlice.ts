import { createSlice } from '@reduxjs/toolkit'
import * as SecureStore from 'expo-secure-store'

import { LocalStore } from '@/constants/environment-variables'
import { IUser } from '@/types/types'

import { changePassword, getLogged, logOut, signIn, signUp } from './authThunk'

export interface AuthState {
  isLoading: boolean
  isAuthenticated: boolean
  user?: IUser
}

const initialState: AuthState = {
  isLoading: false,
  isAuthenticated: false,
  user: undefined,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuth: (state) => {
      state.isAuthenticated = false
      state.isLoading = false
      state.user = undefined
    },
  },
  extraReducers: (builder) => {
    builder.addCase(signIn.pending, (state) => {
      state.isLoading = true
      state.isAuthenticated = false
    })
    builder.addCase(signIn.fulfilled, (state, action) => {
      console.log('succe')
      const { token } = action.payload
      SecureStore.setItemAsync(LocalStore.ACCESS_TOKEN, JSON.stringify(token))
      state.isLoading = false
      state.isAuthenticated = true
    })
    builder.addCase(signIn.rejected, (state, action) => {
      console.log('eerr', action)
      state.isLoading = false
      state.isAuthenticated = false
      state.user = undefined
    })

    builder.addCase(signUp.pending, (state) => {
      state.isLoading = true
    })
    builder.addCase(signUp.fulfilled, (state, action) => {
      const { token } = action.payload
      SecureStore.setItemAsync(LocalStore.ACCESS_TOKEN, JSON.stringify(token))
      state.isAuthenticated = true
      state.isLoading = false
    })
    builder.addCase(signUp.rejected, (state) => {
      state.isLoading = false
    })

    builder.addCase(getLogged.pending, (state) => {
      state.isLoading = true
    })
    builder.addCase(getLogged.fulfilled, (state, action) => {
      const { token } = action.payload
      SecureStore.setItemAsync(LocalStore.ACCESS_TOKEN, JSON.stringify(token))
      state.isAuthenticated = true
      state.isLoading = false
    })
    builder.addCase(getLogged.rejected, (state) => {
      state.isLoading = false
    })
    builder.addCase(changePassword.pending, (state) => {
      state.isLoading = true
    })
    builder.addCase(changePassword.fulfilled, (state) => {
      state.isLoading = false
    })
    builder.addCase(changePassword.rejected, (state) => {
      state.isLoading = false
    })

    builder.addCase(logOut.pending, (state) => {
      state.isLoading = true
    })
    builder.addCase(logOut.fulfilled, (state) => {
      state.user = undefined
      state.isLoading = false
      state.isAuthenticated = false
    })
    builder.addCase(logOut.rejected, (state) => {
      state.isLoading = false
    })
  },
})

export const { clearAuth } = authSlice.actions
export default authSlice.reducer
