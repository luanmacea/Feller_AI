export interface InvestmentItem {
  id: number
  nome: string
  simbolo: string
  categoria: string
  precoBase: number
  precoAtual: number
  variacaoPercentual: number
  descricao: string
  data: string
  liquidez: string
  dividendYield: number
  frequenciaDividendo: number
  ativo: boolean
  visivelParaUsuarios: boolean
  quantidadeTotal: number
  quantidadeDisponivel: number
  risco: string
  createdAt: string
  updatedAt: string
}
