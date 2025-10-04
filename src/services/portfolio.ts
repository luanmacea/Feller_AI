import type {
  CarteiraPosicaoResponse,
  CarteiraResumoResponse,
  ExtratoResponse,
} from '@/types/apiTypes'

import api from './api'

export const fetchWalletSummary = async () => {
  const response = await api.get<CarteiraResumoResponse>('/carteira/resumo')
  return response.data
}

export const fetchWalletPositions = async () => {
  const response =
    await api.get<CarteiraPosicaoResponse[]>('/carteira/posicoes')
  return response.data
}

export const fetchWalletStatement = async () => {
  const response = await api.get<ExtratoResponse[]>('/extrato')
  return response.data
}
