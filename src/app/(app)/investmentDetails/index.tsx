import { View, StyleSheet } from 'react-native'

import { useLocalSearchParams } from 'expo-router'

import Container from '@/components/Container'
import Text from '@/components/Text'
import { investmentDetails } from '@/mocks/investmentMocks'

export default function InvestmentDetailsPage() {
  const { id } = useLocalSearchParams()
  const investment = investmentDetails[id as string]

  if (!investment) return <Text>Investimento não encontrado.</Text>

  const isPositive = investment.variation >= 0

  return (
    <Container>
      <View style={styles.card}>
        <Text style={styles.title}>{investment.name}aaaaaaaaaaa</Text>
        <Text style={styles.description}>{investment.description}</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Valor Atual:</Text>
          <Text style={styles.value}>${investment.value.toFixed(2)}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Variação:</Text>
          <Text style={{ color: isPositive ? 'green' : 'red' }}>
            {isPositive ? '+' : '-'}
            {Math.abs(investment.variation)}%
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Última Atualização:</Text>
          <Text style={styles.text}>{investment.lastUpdate}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Categoria:</Text>
          <Text style={styles.text}>{investment.category}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Dividend Yield:</Text>
          <Text style={styles.text}>
            {investment.dividendYield.toFixed(1)}%
          </Text>
        </View>
      </View>
    </Container>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    marginTop: 24,
    gap: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  description: {
    fontStyle: 'italic',
    color: '#666',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  label: {
    color: '#888',
  },
  value: {
    fontWeight: '600',
  },
  text: {
    color: '#444',
  },
})
