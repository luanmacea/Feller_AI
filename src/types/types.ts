import type { ReactNode } from 'react'

import type {
  CarteiraPosicaoResponse,
  CarteiraResumoResponse,
  ExtratoResponse,
  InvestimentoDetalhe,
  InvestimentoListItem,
  UsuarioResponse,
} from './apiTypes'

export interface ScreenOption {
  title: string
  headerShown: boolean
  headerBackVisible: boolean
  showInFooter?: boolean
  isApp?: boolean
  icon?: ReactNode
}

export interface AuthRouteParams {
  screen: string
}

export interface IUser extends UsuarioResponse {
  avatarUrl?: string
  nomePreferencial?: string
}

export type WalletPosition = CarteiraPosicaoResponse
export type WalletSummary = CarteiraResumoResponse
export type WalletStatementEntry = ExtratoResponse

export type InvestmentListItem = InvestimentoListItem
export type InvestmentDetails = InvestimentoDetalhe
