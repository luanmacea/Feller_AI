import axios from 'axios'

import { NODE_ENV, uri } from '@/constants/environment-variables'

const environment = NODE_ENV ?? 'development'
const baseURL = uri[environment] || uri.development

const api = axios.create({
  baseURL,
})

export const setAuthorizationHeader = (token?: string) => {
  if (token && token.length > 0) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
    return
  }
  delete api.defaults.headers.common.Authorization
}

export default api
