import { Pressable, View, StyleSheet } from 'react-native'

import { useRouter } from 'expo-router'

import Card from '@/components/Card'
import FeatherIcon from '@/components/FeatherIcon'
import Text from '@/components/Text'
import { InvestmentItem } from '@/types/types'

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
            <Text variant="subtitle">{item.nome}</Text>
            <Text variant="caption">{item.simbolo}</Text>
            <Text variant="caption" numberOfLines={2}>
              {item.descricao || 'Sem descricao disponivel.'}
            </Text>
          </View>
          <FeatherIcon icon="chevron-right" size={18} color="#888" />
        </View>

        <View style={styles.footer}>
          <Text variant="body" style={{ fontWeight: 'bold' }}>
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
        {item.recomendadoParaVoce && (
          <View style={styles.recommendedBadge}>
            <FeatherIcon icon="star" size={14} color="#F2C572" />
            <Text style={styles.recommendedText}>Recomendado para voce</Text>
          </View>
        )}
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 7,
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
  recommendedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#F2C57222',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recommendedText: {
    color: '#F2C572',
    fontSize: 12,
    fontWeight: '600',
  },
})
