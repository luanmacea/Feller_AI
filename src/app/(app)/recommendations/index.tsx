import { StyleSheet, View } from 'react-native'

import Container from '@/components/Container'
import Text from '@/components/Text'

export default function RecommendationsPage() {
  return (
    <Container style={styles.container}>
      <View style={styles.card}>
        <Text variant="title" style={styles.title}>
          Recomendacoes
        </Text>
        <Text style={styles.description}>
          Em breve voce vera aqui sugestoes personalizadas do assistente para
          ajustar sua carteira com base no seu perfil de risco e objetivos.
        </Text>
      </View>
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
    color: '#ccccd6',
    textAlign: 'center',
    lineHeight: 20,
  },
})
