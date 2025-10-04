import axios from 'axios'
import * as SecureStore from 'expo-secure-store'

import { LocalStore, NODE_ENV, uri } from '@/constants/environment-variables'

const environment = NODE_ENV ?? 'development'
const baseURL = uri[environment] || uri.development

const api = axios.create({
  baseURL,
})

api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync(LocalStore.ACCESS_TOKEN)

    if (token) {
      config.headers.authorization = `Bearer ${token}`
    } else {
      delete config.headers.authorization
    }

    return config
  },
  (error) => Promise.reject(error),
)

export default api
