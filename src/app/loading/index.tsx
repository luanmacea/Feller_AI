import { useEffect, useState } from 'react'
import { StyleSheet } from 'react-native'

import AsyncStorage from '@react-native-async-storage/async-storage'
import { Redirect } from 'expo-router'

import Container from '@/components/Container'
import { Loading } from '@/components/Loading'
import Text from '@/components/Text'
import { LocalStore } from '@/constants/environment-variables'
import { clearAuth, setSession } from '@/redux/features/auth/authSlice'
import { setThemeMode, THEME_KEY } from '@/redux/features/theme/themeSlice'
import { useAppDispatch } from '@/redux/hook'
import { setAuthorizationHeader } from '@/services/api'

export default function LoadingPage() {
  const dispatch = useAppDispatch()
  const [initialRoute, setInitialRoute] = useState<string | null>(null)
  const [redirectReady, setRedirectReady] = useState(false)

  const handleGetTheme = async () => {
    const savedMode = await AsyncStorage.getItem(THEME_KEY)
    if (savedMode === 'light' || savedMode === 'dark') {
      dispatch(setThemeMode(savedMode))
    }
  }

  const checkUserAuthentication = async () => {
    try {
      const entries = await AsyncStorage.multiGet([
        LocalStore.USER_DATA,
        LocalStore.ACCESS_TOKEN,
      ])

      const userValue = entries.find(
        ([key]) => key === LocalStore.USER_DATA,
      )?.[1]
      const tokenValue = entries.find(
        ([key]) => key === LocalStore.ACCESS_TOKEN,
      )?.[1]

      if (userValue && tokenValue) {
        try {
          const parsedUser = JSON.parse(userValue)
          dispatch(setSession({ user: parsedUser, token: tokenValue }))
          setAuthorizationHeader(tokenValue)
          setInitialRoute('/(app)/home')
          return
        } catch (parseError) {
          console.warn('Falha ao ler usuario armazenado:', parseError)
        }
      }

      dispatch(clearAuth())
      setInitialRoute('/(auth)/sign-in')
    } catch (error) {
      console.warn('Falha ao recuperar sessao:', error)
      dispatch(clearAuth())
      setInitialRoute('/(auth)/sign-in')
    }
  }

  useEffect(() => {
    handleGetTheme()
    checkUserAuthentication()
  }, [])

  useEffect(() => {
    if (initialRoute) {
      const timer = setTimeout(() => {
        setRedirectReady(true)
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [initialRoute])

  if (redirectReady && initialRoute) {
    return <Redirect href={initialRoute} />
  }

  return (
    <Container style={styles.container}>
      <Text style={styles.icon}>INV</Text>
      <Text variant="title">Bem vindo!</Text>
      <Text variant="subtitle">Carregando suas informacoes...</Text>
      <Loading />
    </Container>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  icon: {
    fontSize: 64,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
})
