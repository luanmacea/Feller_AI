import { RootState } from '@/redux/store'

export const selectAuthState = (state: RootState) => state.auth
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated
export const selectAuthLoading = (state: RootState) => state.auth.isLoading
export const selectUser = (state: RootState) => state.auth.user
export const selectAuthToken = (state: RootState) => state.auth.token
export const selectAuthError = (state: RootState) => state.auth.error
