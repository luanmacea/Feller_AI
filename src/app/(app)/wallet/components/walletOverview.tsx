import { View, StyleSheet } from 'react-native'

import { Feather } from '@expo/vector-icons'

import Text from '@/components/Text'

interface Props {
  profits: number
  losses: number
}

export default function WalletOverview({ profits, losses }: Props) {
  return (
    <View style={styles.container}>
      <View style={[styles.card, { backgroundColor: '#f0fff4' }]}>
        <Feather name="arrow-up" size={24} color="green" />
        <Text style={styles.title}>Lucros</Text>
        <Text style={styles.value}>${profits.toFixed(2)}</Text>
      </View>
      <View style={[styles.card, { backgroundColor: '#fff5f5' }]}>
        <Feather name="arrow-down" size={24} color="red" />
        <Text style={styles.title}>Perdas</Text>
        <Text style={styles.value}>${losses.toFixed(2)}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    marginTop: 4,
    fontSize: 14,
    color: '#444',
  },
  value: {
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 4,
  },
})
