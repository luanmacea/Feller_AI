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
      // Cookies.remove(COOKIES.ACCESS_TOKEN)
      return Promise.reject(error)
    }
  },
)
