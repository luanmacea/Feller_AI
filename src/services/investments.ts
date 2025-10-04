import type {
  InvestimentoDetalhe,
  InvestimentoListItem,
} from '@/types/apiTypes'

import api from './api'

export const fetchInvestments = async (
  params?: Partial<{
    nome: string
    simbolo: string
    categoria: string
    risco: string
    ativo: boolean
    visivel: boolean
    precoMin: string
    precoMax: string
  }>,
) => {
  const response = await api.get<InvestimentoListItem[]>('/investimentos', {
    params,
  })
  return response.data
}

export const fetchInvestmentById = async (id: number) => {
  const response = await api.get<InvestimentoDetalhe>(`/investimentos/${id}`)
  return response.data
}
