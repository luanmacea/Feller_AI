import { useMemo } from 'react'
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'

import { Feather } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'

import Container from '@/components/Container'
import Text from '@/components/Text'
import { summary, walletMock } from '@/mocks/investmentMocks'
import { selectUser } from '@/redux/features/auth/authSelectors'
import { useAppSelector } from '@/redux/hook'

interface SparklineProps {
  data: number[]
  color: string
}

interface TopStockItem {
  name: string
  variation: number
  isPositive: boolean
  series: number[]
}

function Sparkline({ data, color }: SparklineProps) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  return (
    <View style={styles.sparkline}>
      {data.map((value, index) => {
        const normalized = (value - min) / range
        const height = 12 + normalized * 28
        return (
          <View key={`${value}-${index}`} style={styles.sparklineColumn}>
            <View
              style={[styles.sparklineBar, { height, backgroundColor: color }]}
            />
          </View>
        )
      })}
    </View>
  )
}

export default function HomePage() {
  const router = useRouter()
  const user = useAppSelector(selectUser)

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bom dia'
    if (hour < 18) return 'Boa tarde'
    return 'Boa noite'
  }, [])

  const displayName = user?.name?.split(' ')[0] || 'Investidor'

  const balance = walletMock.balance
  const balanceFormatter = useMemo(
    () =>
      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }),
    [],
  )
  const formattedBalance = balanceFormatter.format(balance)
  const portfolioVariation = summary.portfolioChange

  const topStocks: TopStockItem[] = useMemo(() => {
    const baseStocks = [...summary.actives, ...summary.negatives]

    return baseStocks.map((item, index) => {
      const direction = item.isPositive ? 1 : -1
      const amplitude = Math.max(Math.abs(item.variation) * 2, 4)

      const series = Array.from({ length: 8 }, (_, idx) => {
        const trend = direction * idx * (Math.abs(item.variation) / 3)
        const wave = Math.sin((idx + 1) * 0.8 + index) * amplitude * 0.2
        const base = item.isPositive ? 50 : 58
        return base + trend + wave
      })

      return {
        name: item.name,
        variation: item.variation,
        isPositive: item.isPositive,
        series,
      }
    })
  }, [])

  const recommendationTarget = '/(app)/recommendations'

  return (
    <Container style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <View>
            <Text variant="subtitle" style={styles.headerSubtitle}>
              {greeting},
            </Text>
            <Text variant="title" style={styles.headerTitle}>
              {displayName}
            </Text>
          </View>
          <Image
            source={{ uri: user?.avatarUrl }}
            style={styles.avatarWrapper}
            resizeMode="cover"
          />
        </View>

        <LinearGradient
          colors={['#2a2a32', '#16161c']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.portfolioCard}
        >
          <View style={styles.portfolioHeader}>
            <Text style={styles.portfolioLabel}>Sua carteira</Text>
            <View
              style={[
                styles.portfolioChip,
                portfolioVariation >= 0
                  ? styles.portfolioChipPositive
                  : styles.portfolioChipNegative,
              ]}
            >
              <Feather
                name={portfolioVariation >= 0 ? 'trending-up' : 'trending-down'}
                size={14}
                color={portfolioVariation >= 0 ? '#132b16' : '#311512'}
              />
              <Text
                style={[
                  styles.portfolioChipText,
                  portfolioVariation >= 0
                    ? styles.portfolioChipTextPositive
                    : styles.portfolioChipTextNegative,
                ]}
              >
                {portfolioVariation.toFixed(1)}%
              </Text>
            </View>
          </View>

          <Text style={styles.portfolioValue}>{formattedBalance}</Text>
          <Text style={styles.portfolioHint}>
            Evolucao acumulada nos ultimos 12 meses
          </Text>

          <View style={styles.portfolioHighlights}>
            {summary.actives.slice(0, 2).map((item) => (
              <View key={item.name} style={styles.highlightItem}>
                <Text style={styles.highlightLabel}>{item.name}</Text>
                <Text
                  style={[
                    styles.highlightValue,
                    item.isPositive
                      ? styles.highlightPositive
                      : styles.highlightNegative,
                  ]}
                >
                  {item.variation > 0 ? '+' : ''}
                  {item.variation.toFixed(1)}%
                </Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        <View style={styles.sectionHeader}>
          <Text variant="subtitle" style={styles.sectionTitle}>
            Top acoes do dia
          </Text>
          <Text style={styles.sectionCaption}>
            Monitoramos os destaques para voce decidir com confianca
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carousel}
        >
          {topStocks.map((stock) => {
            const positive = stock.isPositive
            const color = positive ? '#51d289' : '#f26b6b'
            return (
              <View key={stock.name} style={styles.stockCard}>
                <View style={styles.stockHeader}>
                  <Text style={styles.stockName}>{stock.name}</Text>
                  <Text
                    style={[
                      styles.stockVariation,
                      positive ? styles.stockPositive : styles.stockNegative,
                    ]}
                  >
                    {positive ? '+' : ''}
                    {stock.variation.toFixed(1)}%
                  </Text>
                </View>
                <Sparkline data={stock.series} color={color} />
              </View>
            )
          })}
        </ScrollView>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push(recommendationTarget)}
        >
          <LinearGradient
            colors={['#d1a954', '#f2c572']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.recommendationsButton}
          >
            <Text style={styles.recommendationsText}>Ver Recomendacoes</Text>
            <Feather name="arrow-right" size={20} color="#241b0d" />
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </Container>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0e0e10',
  },
  scrollContent: {
    paddingBottom: 32,
    gap: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerSubtitle: {
    color: '#b3b3c7',
    marginBottom: 4,
  },
  headerTitle: {
    color: '#f7f3e8',
    fontSize: 26,
  },
  avatarWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#d1a954',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a21',
  },
  portfolioCard: {
    borderRadius: 20,
    padding: 24,
    gap: 12,
    borderWidth: 1,
    borderColor: '#d1a95422',
  },
  portfolioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  portfolioLabel: {
    color: '#d8d8e8',
    fontSize: 16,
  },
  portfolioChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  portfolioChipPositive: {
    backgroundColor: '#2d6539',
  },
  portfolioChipNegative: {
    backgroundColor: '#6b2d2d',
  },
  portfolioChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  portfolioChipTextPositive: {
    color: '#d6f5e2',
  },
  portfolioChipTextNegative: {
    color: '#ffd6d6',
  },
  portfolioValue: {
    color: '#f9f5e4',
    fontSize: 32,
    fontWeight: '700',
  },
  portfolioHint: {
    color: '#9e9eb0',
  },
  portfolioHighlights: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
  },
  highlightItem: {
    flex: 1,
    backgroundColor: '#232329',
    borderRadius: 12,
    padding: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: '#2f2f38',
  },
  highlightLabel: {
    color: '#b9b9cb',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  highlightValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  highlightPositive: {
    color: '#65e0a2',
  },
  highlightNegative: {
    color: '#f27c7c',
  },
  sectionHeader: {
    gap: 6,
  },
  sectionTitle: {
    color: '#f2f2ff',
    fontSize: 18,
  },
  sectionCaption: {
    color: '#9b9bb0',
    fontSize: 13,
  },
  carousel: {
    paddingVertical: 4,
    gap: 16,
    paddingRight: 8,
  },
  stockCard: {
    width: 160,
    backgroundColor: '#1d1d24',
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#2c2c35',
    gap: 12,
  },
  stockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockName: {
    color: '#f4f4fb',
    fontWeight: '600',
  },
  stockVariation: {
    fontWeight: '600',
  },
  stockPositive: {
    color: '#65e0a2',
  },
  stockNegative: {
    color: '#f27c7c',
  },
  sparkline: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 44,
    gap: 3,
  },
  sparklineColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  sparklineBar: {
    width: 4,
    borderRadius: 4,
  },
  recommendationsButton: {
    marginTop: 8,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recommendationsText: {
    color: '#241b0d',
    fontSize: 16,
    fontWeight: '600',
  },
})
