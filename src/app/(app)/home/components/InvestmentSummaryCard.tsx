import { View, StyleSheet } from 'react-native'

import { LinearGradient } from 'expo-linear-gradient'

import Text from '@/components/Text'
import { InvestmentSummary } from '@/types/types'

interface Props {
  data: InvestmentSummary
}

export default function InvestmentSummaryCard({ data }: Props) {
  return (
    <LinearGradient
      colors={['#F7CA02', '#000000']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1.4, y: 1 }}
      style={styles.gradient}
    >
      <Text style={styles.title}>Valor da Carteira</Text>
      <Text style={styles.percentage}>+{data.portfolioChange}%</Text>

      <View style={styles.row}>
        <View style={styles.column}>
          {data.actives.map((item, idx) => (
            <View key={idx} style={{ flexDirection: 'row', gap: 4 }}>
              <Text>{item.name}</Text>
              <Text style={{ color: 'limegreen' }}>
                ({item.variation.toFixed(1)}%)
              </Text>
            </View>
          ))}
        </View>
        <View style={styles.column}>
          {data.negatives.map((item, idx) => (
            <View key={idx} style={{ flexDirection: 'row', gap: 4 }}>
              <Text>{item.name}</Text>
              <Text style={{ color: 'red' }}>
                ({item.variation.toFixed(1)}%)
              </Text>
            </View>
          ))}
        </View>
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  gradient: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    fontWeight: '600',
  },
  percentage: {
    textAlign: 'center',
    fontSize: 32,
    color: 'limegreen',
    marginVertical: 8,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 16,
  },
  column: {
    flex: 1,
    gap: 6,
  },
})
