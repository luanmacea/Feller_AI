import { Feather, MaterialIcons } from '@expo/vector-icons'

import { ScreenOption } from '@/types/types'

export const navigationScreensOptions: Record<string, ScreenOption> = {
  'sign-in/index': {
    title: 'Login',
    headerShown: true,
    headerBackVisible: false,
    icon: <Feather name="log-in" size={24} color="grey" />,
  },
  'sign-up/index': {
    title: 'Criar Conta',
    headerShown: true,
    headerBackVisible: true,
    icon: <Feather name="user-plus" size={24} color="grey" />,
  },
  'reset-password/index': {
    title: 'Redefinir Senha',
    headerShown: true,
    headerBackVisible: true,
    icon: <Feather name="key" size={24} color="grey" />,
  },
  'home/index': {
    title: 'Home',
    headerShown: true,
    headerBackVisible: false,
    showInFooter: true,
    icon: <Feather name="home" size={24} color="grey" />,
    isApp: true,
  },
  'investmentDetails/index': {
    title: 'Detalhes do Investimento',
    headerShown: true,
    headerBackVisible: true,
    showInFooter: false,
    isApp: false,
    icon: <MaterialIcons name="insights" size={24} color="black" />,
  },
  'wallet/index': {
    title: 'Carteira',
    headerShown: true,
    headerBackVisible: false,
    showInFooter: true,
    isApp: true,
    icon: <Feather name="dollar-sign" size={24} color="grey" />,
  },
  'menu/index': {
    title: 'Menu',
    headerShown: false,
    headerBackVisible: true,
    showInFooter: true,
    icon: <Feather name="menu" size={24} color="grey" />,
  },
}
