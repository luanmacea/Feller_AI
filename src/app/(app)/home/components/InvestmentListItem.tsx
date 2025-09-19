import { View, StyleSheet, TouchableOpacity } from 'react-native'

import { useRouter } from 'expo-router'

import Text from '@/components/Text'
import { InvestmentItem } from '@/types/types'

interface Props {
  item: InvestmentItem
}

export default function InvestmentListItem({ item }: Props) {
  const router = useRouter()
  const isPositive = item.amount >= 0

  const handleSelectInvestment = (id: string) => {
    router.push({
      pathname: '/investmentDetails',
      params: { id: id },
    })
  }
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => handleSelectInvestment(item.id)}
    >
      <View style={styles.info}>
        <Text>{item.name}</Text>
        <Text style={styles.date}>{item.date}</Text>
      </View>
      <View style={styles.valueBox}>
        <Text style={{ color: isPositive ? 'green' : 'red' }}>
          {isPositive ? '+' : '-'}${Math.abs(item.amount).toFixed(2)}
        </Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ddd',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  date: {
    fontSize: 12,
    color: '#888',
  },
  valueBox: {
    alignItems: 'flex-end',
  },
  time: {
    fontSize: 12,
    color: '#aaa',
  },
})
