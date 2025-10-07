import { ActivityIndicator } from 'react-native'

import { selectThemeState } from '@/redux/features/theme/themeSelectors'
import { useAppSelector } from '@/redux/hook'

import Container from '../Container'
import Text from '../Text'

export default function LoadingList({
  text,
  status = 'loading',
}: {
  text?: string
  status?: 'loading' | 'empty'
}) {
  const theme = useAppSelector(selectThemeState)
  const colors = theme.colors || {}
  return (
    <Container
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
      }}
    >
      {status === 'loading' && (
        <ActivityIndicator size="large" color={colors.primary || '#C99A2E'} />
      )}
      {status === 'loading' && (
        <Text style={{ marginTop: 12, color: colors.grey2 || '#7b8faa' }}>
          {text || 'Carregando informações...'}
        </Text>
      )}
      {status === 'empty' && (
        <Text variant="title">Nâo foi possível carregar os dados.</Text>
      )}
    </Container>
  )
}
