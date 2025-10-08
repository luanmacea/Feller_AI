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

export interface IWalletSummary {
  valorTotalInvestido: number
  valorAtualCarteira: number
  ganhoTotalCarteira: number
  percentualGanhoCarteira: number
  totalDividendosCarteira: number
  quantidadePosicoes: number
  posicoes: Array<{
    id: number
    investimentoId: number
    nomeInvestimento: string
    simboloInvestimento: string
    categoria: string
    risco: string
    quantidadeTotal: number
    precoMedio: number
    valorInvestido: number
    precoAtual: number
    valorAtual: number
    ganhoPerda: number
    percentualGanhoPerda: number
    totalDividendosRecebidos: number
    dataPrimeiraCompra: string
    dataUltimaMovimentacao: string
  }>
}

export interface IComment {
  id: number
  conteudo: string
  usuarioId: number
  nomeUsuario: string
  emailUsuario: string
  investimentoId: number
  nomeInvestimento: string
  simboloInvestimento: string
  dataCriacao: string
  dataAtualizacao: string | null
  editado: boolean
  ativo: boolean
  comentarioPaiId: number | null
  numeroRespostas: number
  respostas: IComment[]
}

export interface ICommentSection {
  investimentoId: number
  totalComentarios: number
  comentarios: IComment[]
}

export interface IPlaylistItem {
  id: number
  nome: string
  descricao: string
  criadorNome: string
  criadorEmail: string
  tipo: string
  permiteColaboracao: boolean
  totalInvestimentos: number
  totalSeguidores: number
  dataCriacao: string
  dataAtualizacao: string
  isCriador: boolean
  isFollowing: boolean
  publica: boolean
  privada: boolean
  compartilhada: boolean
}

export interface IPlaylistDetail extends IPlaylistItem {
  investimentos: {
    id: number
    nome: string
    simbolo: string
    categoria: string
    risco: string
    precoAtual: string
    variacaoPercentual: string
    descricao: string
    recomendadoParaVoce: boolean
  }[]
  seguidores: {
    id: number
    nomeUsuario: string
    email: string
  }[]
}
