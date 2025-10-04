export type InvestorProfileType =
  | 'PERFIL_CONSERVADOR'
  | 'PERFIL_MODERADO'
  | 'PERFIL_ARROJADO'

export type UserRole = 'ROLE_USER' | 'ROLE_ADMIN' | string

export interface UsuarioResponse {
  id: number
  nomeUsuario: string
  email: string
  cpf: number | string
  role: UserRole
  userIsActive: boolean
  firstLogin?: boolean
  dt_nascimento?: string
  tipo?: InvestorProfileType
  saldoCarteira?: number
  user_permissions?: string
}

export interface LoginResponse {
  token: string
  userId: number
}

export type InvestmentRisk = 'BAIXO' | 'MEDIO' | 'ALTO' | string

export type InvestmentCategory =
  | 'RENDA_FIXA'
  | 'RENDA_VARIAVEL'
  | 'FUNDO_IMOBILIARIO'
  | 'CRIPTO'
  | 'OUTROS'
  | 'FUNDO'
  | 'TESOURO_DIRETO'
  | string

export interface InvestimentoListItem {
  id: number
  nome: string
  simbolo: string
  categoria: InvestmentCategory
  precoAtual: number
  descricao?: string
  risco?: InvestmentRisk
  ativo?: boolean
  visivelParaUsuarios?: boolean
  variacaoPercentual?: number
}

export interface InvestimentoDetalhe extends InvestimentoListItem {
  precoBase?: number
  ultimaAtualizacaoPreco?: string
  data?: string
  liquidez?: string
  quantidadeTotal?: number
  quantidadeDisponivel?: number
  dividendYield?: number
  frequenciaDividendo?: number
  createdAt?: string
  updatedAt?: string
}

export interface PlaylistSeguidorResponse {
  id: number
  nomeUsuario: string
  email: string
}

export interface PlaylistInvestimentoResponse {
  id: number
  nome: string
  simbolo: string
  categoria?: string
  risco?: InvestmentRisk
  precoAtual?: number
  variacaoPercentual?: number
  descricao?: string
}

export interface PlaylistResumoResponse {
  id: number
  nome: string
  descricao?: string
  criadorNome?: string
  criadorEmail?: string
  publica: boolean
  permiteColaboracao?: boolean
  totalInvestimentos?: number
  totalSeguidores?: number
  dataCriacao?: string
  dataAtualizacao?: string
  isCriador?: boolean
  isFollowing?: boolean
}

export interface PlaylistDetalheResponse extends PlaylistResumoResponse {
  investimentos?: PlaylistInvestimentoResponse[]
  seguidores?: PlaylistSeguidorResponse[]
}

export type ExtratoTransacaoTipo =
  | 'COMPRA_ACAO'
  | 'VENDA_ACAO'
  | 'DIVIDENDO_RECEBIDO'
  | 'DEPOSITO'
  | 'SAQUE'
  | string

export interface ExtratoResponse {
  id: number
  nomeInvestimento?: string
  simboloInvestimento?: string
  tipoTransacao?: ExtratoTransacaoTipo
  descricaoTransacao?: string
  quantidade?: number
  precoUnitario?: number
  valorTotal?: number
  saldoAnterior?: number
  saldoAtual?: number
  descricao?: string
  dataTransacao: string
}

export interface CarteiraPosicaoResponse {
  id: number
  nomeInvestimento: string
  simboloInvestimento: string
  categoria?: string
  risco?: InvestmentRisk
  quantidadeTotal: number
  precoMedio?: number
  valorInvestido?: number
  precoAtual?: number
  valorAtual?: number
  ganhoPerda?: number
  percentualGanhoPerda?: number
  dataPrimeiraCompra?: string
  dataUltimaMovimentacao?: string
}

export interface CarteiraResumoResponse {
  saldoDisponivel: number
  valorTotalInvestido: number
  valorAtualCarteira: number
  ganhoTotalCarteira: number
  percentualGanhoCarteira: number
  quantidadePosicoes: number
  posicoes?: CarteiraPosicaoResponse[]
}

export interface ComentarioResponse {
  id: number
  conteudo: string
  autor?: string
  dataComentario: string
  editado?: boolean
}

export interface CotacaoResponse {
  investimentoId: number
  precoAtual: number
  timestamp: string
}

export interface DividendosPendentesResponse {
  totalPendentes: number
  dividendos: Array<{
    id: number
    investimentoNome: string
    valorTotal: number
    dataCriacao: string
  }>
  timestamp?: string
}

export interface DividendosStatusResponse {
  sistemaAtivo: boolean
  fluxo?: string
  dividendosPendentes?: number
  modoOperacao?: string
  endpoints?: Record<string, string>
  timestamp?: string
}
