import {
  InvestmentDetails,
  InvestmentItem,
  InvestmentSummary,
  WalletSummary,
} from '@/types/types'

export const walletMock: WalletSummary = {
  balance: 31893,
  profits: 22431.32,
  losses: 2598.21,
  history: [
    { month: 'Jan', profit: 1500, loss: 900 },
    { month: 'Feb', profit: 2100, loss: 1100 },
    { month: 'Apr', profit: 1800, loss: 950 },
    { month: 'May', profit: 2200, loss: 1200 },
    { month: 'June', profit: 2600, loss: 2000 },
    { month: 'July', profit: 2400, loss: 1900 },
    { month: 'Aug', profit: 1900, loss: 1300 },
  ],
}

export const summary: InvestmentSummary = {
  portfolioChange: 28.5,
  actives: [
    { name: 'Owen Corp', variation: 4.2, isPositive: true },
    { name: 'NeuroTech', variation: 3.7, isPositive: true },
    { name: 'Solstice SA', variation: 2.9, isPositive: true },
  ],
  negatives: [
    { name: 'Horizon Ltd', variation: -2.1, isPositive: false },
    { name: 'Ventura', variation: -1.8, isPositive: false },
    { name: 'Lunaris', variation: -1.3, isPositive: false },
  ],
}

export const investmentList: InvestmentItem[] = [
  {
    id: '1',
    name: 'NeuroTech',
    amount: -60,
    date: '18 July',
    time: '10:00 AM',
  },
  {
    id: '2',
    name: 'Owen Corp',
    amount: 75,
    date: '17 July',
    time: '01:30 PM',
  },
  {
    id: '3',
    name: 'Horizon Ltd',
    amount: -45,
    date: '16 July',
    time: '11:00 AM',
  },
  {
    id: '4',
    name: 'Solstice SA',
    amount: 90,
    date: '15 July',
    time: '09:00 AM',
  },
  {
    id: '5',
    name: 'Ventura',
    amount: -30,
    date: '14 July',
    time: '02:00 PM',
  },
]

export const investmentDetails: Record<string, InvestmentDetails> = {
  '1': {
    id: '1',
    name: 'NeuroTech',
    description: 'Startup de biotecnologia com foco em IA aplicada à saúde.',
    variation: 3.7,
    value: 125.0,
    lastUpdate: '18 July, 10:00 AM',
    category: 'Biotecnologia',
    dividendYield: 1.5,
  },
  '2': {
    id: '2',
    name: 'Owen Corp',
    description:
      'Conglomerado financeiro com forte presença no setor bancário.',
    variation: 4.2,
    value: 75.0,
    lastUpdate: '17 July, 01:30 PM',
    category: 'Financeiro',
    dividendYield: 2.0,
  },
  '3': {
    id: '3',
    name: 'Horizon Ltd',
    description: 'Empresa tradicional no setor de energia renovável.',
    variation: -2.1,
    value: 95.6,
    lastUpdate: '16 July, 11:00 AM',
    category: 'Energia',
    dividendYield: 1.2,
  },
  '4': {
    id: '4',
    name: 'Solstice SA',
    description: 'Empresa nacional focada em infraestrutura e logística.',
    variation: 2.9,
    value: 90.4,
    lastUpdate: '15 July, 09:00 AM',
    category: 'Logística',
    dividendYield: 1.7,
  },
  '5': {
    id: '5',
    name: 'Ventura',
    description: 'Holding internacional com foco em mineração.',
    variation: -1.8,
    value: 88.2,
    lastUpdate: '14 July, 02:00 PM',
    category: 'Mineração',
    dividendYield: 2.1,
  },
}
