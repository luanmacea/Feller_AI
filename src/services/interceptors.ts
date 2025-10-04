import * as SecureStore from 'expo-secure-store'

import { LocalStore } from '@/constants/environment-variables'
import { setGlobalError } from '@/redux/features/global/globalSlice'
import { store } from '@/redux/store'

import api from './api'

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const data = error.response.data
      const errorResponse = {
        message: data.message || data.error || 'Erro desconhecido',
        errors: data.errors,
      }
      if (error.response.status === 500) {
        store.dispatch(
          setGlobalError({
            message:
              'Desculpe, ocorreu um erro interno no servidor. Por favor, tente novamente mais tarde.',
          }),
        )
      } else {
        store.dispatch(setGlobalError(errorResponse))
      }

      return Promise.reject(errorResponse)
    } else {
      SecureStore.deleteItemAsync(LocalStore.ACCESS_TOKEN)
      SecureStore.deleteItemAsync(LocalStore.USER_DATA)
      return Promise.reject(error)
    }
  },
)
