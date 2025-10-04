import { useEffect, useState } from 'react'
import { StyleSheet } from 'react-native'

import AsyncStorage from '@react-native-async-storage/async-storage'
import { Redirect } from 'expo-router'
import * as SecureStore from 'expo-secure-store'

import Container from '@/components/Container'
import { Loading } from '@/components/Loading'
import Text from '@/components/Text'
import { LocalStore } from '@/constants/environment-variables'
import { selectAuthState } from '@/redux/features/auth/authSelectors'
import { clearAuth } from '@/redux/features/auth/authSlice'
import { getLogged } from '@/redux/features/auth/authThunk'
import { setThemeMode, THEME_KEY } from '@/redux/features/theme/themeSlice'
import { useAppDispatch, useAppSelector } from '@/redux/hook'

export default function LoadingPage() {
  const dispatch = useAppDispatch()
  const auth = useAppSelector(selectAuthState)
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
      const token = await SecureStore.getItemAsync(LocalStore.ACCESS_TOKEN)
      if (token) {
        dispatch(getLogged())
        setInitialRoute('/(app)/home')
      } else {
        setInitialRoute('/(auth)/sign-in')
      }
      dispatch(clearAuth())
    } catch (error) {
      console.log('NA TELA LOADING', error)
      setInitialRoute('/(auth)/sign-in')
    }
  }

  useEffect(() => {
    if (auth.user?.id) {
      setInitialRoute('/(app)/home')
    }
  }, [auth.user?.id])

  useEffect(() => {
    handleGetTheme()
    checkUserAuthentication()
  }, [])

  useEffect(() => {
    if (initialRoute) {
      const timer = setTimeout(() => {
        setRedirectReady(true)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [initialRoute])

  if (redirectReady && initialRoute) {
    return <Redirect href={initialRoute} />
  }

  return (
    <Container style={styles.container}>
      <Text style={styles.icon}>👍</Text>
      <Text variant="title">Bem vindo!</Text>
      <Text variant="subtitle">Carregando suas informações...</Text>
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
