export interface ScreenOption {
  title: string
  headerShown: boolean
  headerBackVisible: boolean
  showInFooter?: boolean
  isApp?: boolean
  icon?: React.ReactNode
}

export interface AuthRouteParams {
  screen: string
}

export interface IUser {
  id: string
  name: string
  cpf: string
  email: string
}

export interface MonthlyReport {
  month: string
  profit: number
  loss: number
}

export interface WalletSummary {
  balance: number
  profits: number
  losses: number
  history: MonthlyReport[]
}

export interface Investment {
  name: string
  variation: number
  isPositive: boolean
}

export interface InvestmentSummary {
  portfolioChange: number
  actives: Investment[]
  negatives: Investment[]
}

export interface InvestmentItem {
  id: string
  name: string
  amount: number
  date: string
  time: string
}
export interface InvestmentDetails {
  id: string
  name: string
  description: string
  variation: number
  value: number
  lastUpdate: string
  category: string
  dividendYield: number
}
