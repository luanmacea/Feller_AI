import { Pressable, View, StyleSheet } from 'react-native'

import { useRouter } from 'expo-router'

import Card from '@/components/Card'
import FeatherIcon from '@/components/FeatherIcon'
import Text from '@/components/Text'
import { InvestmentItem } from '@/types/typesCerto'

export default function InvestmentCard({ item }: { item: InvestmentItem }) {
  const router = useRouter()
  const handleGoToDetails = () => {
    router.push({
      pathname: '/(app)/investmentDetails',
      params: { id: String(item.id) },
    })
  }

  const isPositive = item.variacaoPercentual >= 0

  return (
    <Pressable onPress={() => handleGoToDetails()}>
      <Card style={{ marginBottom: 20 }}>
        <View style={styles.header}>
          <View>
            <Text style={styles.name}>{item.nome}</Text>
            <Text style={styles.symbol}>{item.simbolo}</Text>
          </View>
          <FeatherIcon icon="chevron-right" size={18} color="#888" />
        </View>

        <View style={styles.footer}>
          <Text style={styles.price}>
            {item.precoAtual.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </Text>
          <View
            style={[
              styles.variationContainer,
              {
                backgroundColor: isPositive
                  ? 'rgba(0, 255, 150, 0.1)'
                  : 'rgba(255, 70, 70, 0.1)',
              },
            ]}
          >
            <FeatherIcon
              icon={isPositive ? 'trending-up' : 'trending-down'}
              size={14}
              color={isPositive ? '#4ade80' : '#f87171'}
            />
            <Text
              style={[
                styles.variation,
                { color: isPositive ? '#4ade80' : '#f87171' },
              ]}
            >
              {isPositive ? '+' : ''}
              {item.variacaoPercentual.toFixed(2)}%
            </Text>
          </View>
        </View>
      </Card>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  symbol: {
    color: '#9ca3af',
    fontSize: 13,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  price: {
    color: '#f3f4f6',
    fontSize: 16,
    fontWeight: 'bold',
  },
  variationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  variation: {
    fontWeight: '600',
    fontSize: 13,
  },
})
