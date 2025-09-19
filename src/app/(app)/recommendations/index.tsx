import { StyleSheet } from 'react-native'

import Card from '@/components/Card'
import Container from '@/components/Container'
import Text from '@/components/Text'

export default function RecommendationsPage() {
  return (
    <Container style={styles.container}>
      <Card>
        <Text variant="title">Recomendacoes</Text>
        <Text style={styles.description}>
          Em breve voce vera aqui sugestoes personalizadas do assistente para
          ajustar sua carteira com base no seu perfil de risco e objetivos.
        </Text>
      </Card>
    </Container>
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    borderRadius: 16,
    padding: 24,
    backgroundColor: '#1f1f24',
    borderWidth: 1,
    borderColor: '#d1a954',
    gap: 12,
  },
  title: {
    color: '#f5f5f5',
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    lineHeight: 20,
  },
})
