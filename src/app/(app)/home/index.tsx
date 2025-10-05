import { useEffect, useMemo, useState } from 'react'
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'

import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'

import Card from '@/components/Card'
import Container from '@/components/Container'
import Text from '@/components/Text'
import { summary, walletMock } from '@/mocks/investmentMocks'
import { selectUser } from '@/redux/features/auth/authSelectors'
import { selectThemeState } from '@/redux/features/theme/themeSelectors'
import { useAppSelector } from '@/redux/hook'
import api from '@/services/api'
import { InvestmentItem } from '@/types/typesCerto'

interface SparklineProps {
  data: number[]
  color: string
}

interface TopStockItem extends InvestmentItem {
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
  const theme = useAppSelector(selectThemeState)

  const colors = theme.colors || {}
  const isDark = theme.mode === 'dark'

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bom dia'
    if (hour < 18) return 'Boa tarde'
    return 'Boa noite'
  }, [])

  const displayName = user?.nomeUsuario?.split(' ')[0] || 'Investidor'

  const balance = walletMock.balance
  const balanceFormatter = useMemo(
    () =>
      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }),
    [],
  )
  const formattedBalance = balanceFormatter.format(balance)
  const portfolioVariation = summary.portfolioChange

  const highlightBackground = useMemo(
    () => (isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(17, 17, 24, 0.06)'),
    [isDark],
  )

  const [stockData, setStockData] = useState<TopStockItem[]>([])

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const response = await api.get('/investimentos')
        const items = response.data as InvestmentItem[]

        const sorted = [...items].sort(
          (a, b) =>
            Math.abs(b.variacaoPercentual) - Math.abs(a.variacaoPercentual),
        )
        const limited = sorted.slice(0, 6).map((item, index) => {
          const direction = item.variacaoPercentual >= 0 ? 1 : -1
          const amplitude = Math.max(Math.abs(item.variacaoPercentual) * 2, 4)
          const series = Array.from({ length: 8 }, (_, idx) => {
            const trend =
              direction * idx * (Math.abs(item.variacaoPercentual) / 3)
            const wave = Math.sin((idx + 1) * 0.8 + index) * amplitude * 0.2
            const base = item.variacaoPercentual >= 0 ? 50 : 58
            return base + trend + wave
          })

          return {
            isPositive: item.variacaoPercentual >= 0,
            series,
            ...item,
          }
        })
        setStockData(limited)
      } catch (error) {
        console.error('Erro ao carregar investimentos', error)
      }
    }

    fetchStocks()
  }, [])

  const stockGradients = useMemo(
    () =>
      isDark
        ? {
            positive: ['#21372B', '#16161C'] as [string, string],
            negative: ['#3A1F1F', '#16161C'] as [string, string],
          }
        : {
            positive: ['#FFFFFF', '#E7F4EE'] as [string, string],
            negative: ['#FFF6F6', '#F7E8E8'] as [string, string],
          },
    [isDark],
  )

  const recommendationTarget = '/(app)/virtual-assistant'
  const handleSelectStock = (stock: TopStockItem) => {
    router.push({
      pathname: '/(app)/investmentDetails',
      params: { id: String(stock.id) },
    })
  }

  return (
    <Container>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <View>
            <Text
              variant="subtitle"
              style={[styles.headerSubtitle, { color: colors.grey2 }]}
            >
              {greeting},
            </Text>
            <Text
              variant="title"
              style={[styles.headerTitle, { color: colors.grey1 }]}
            >
              {displayName}
            </Text>
          </View>
          <Pressable onPress={() => router.push('/(app)/profile')}>
            <Card
              variant="flat"
              style={styles.avatarCard}
              contentStyle={[
                styles.avatarContent,
                { backgroundColor: highlightBackground },
              ]}
            >
              <Feather
                name="user"
                size={20}
                color={colors.primary || '#C99A2E'}
              />
            </Card>
          </Pressable>
        </View>

        <Card contentStyle={styles.portfolioCard}>
          <View style={styles.portfolioHeader}>
            <Text style={[styles.portfolioLabel]}>Sua carteira</Text>
            <Card
              variant="flat"
              style={styles.portfolioChipWrapper}
              contentStyle={[
                styles.portfolioChip,
                {
                  backgroundColor:
                    portfolioVariation >= 0
                      ? 'rgba(81, 210, 137, 0.16)'
                      : 'rgba(242, 107, 107, 0.16)',
                },
              ]}
            >
              <Feather
                name={portfolioVariation >= 0 ? 'trending-up' : 'trending-down'}
                size={14}
                color={
                  portfolioVariation >= 0
                    ? theme?.colors?.success || 'green'
                    : theme?.colors?.error || 'red'
                }
              />
              <Text
                style={[
                  styles.portfolioChipText,
                  {
                    color:
                      portfolioVariation >= 0
                        ? theme?.colors?.success || 'green'
                        : theme?.colors?.error || 'red',
                  },
                ]}
              >
                {portfolioVariation.toFixed(1)}%
              </Text>
            </Card>
          </View>

          <Text style={[styles.portfolioValue]}>{formattedBalance}</Text>
          <Text>Evolucao acumulada nos ultimos 12 meses</Text>

          <View style={styles.portfolioHighlights}>
            {summary.actives.slice(0, 2).map((item) => (
              <Card
                key={item.name}
                variant="flat"
                style={styles.highlightCard}
                contentStyle={[
                  styles.highlightContent,
                  { backgroundColor: highlightBackground },
                ]}
              >
                <Text style={[styles.highlightLabel]}>{item.name}</Text>
                <Text
                  style={[
                    styles.highlightValue,
                    {
                      color: item.isPositive
                        ? theme?.colors?.success
                        : theme?.colors?.error,
                    },
                  ]}
                >
                  {item.variation > 0 ? '+' : ''}
                  {item.variation.toFixed(1)}%
                </Text>
              </Card>
            ))}
          </View>
        </Card>

        <View style={styles.sectionHeader}>
          <Text variant="title">Top acoes do dia</Text>
          <Text>Monitoramos os destaques para voce decidir com confianca</Text>
          <Text variant="caption">
            (clique na acao desejada para mais detalhes)
          </Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carousel}
        >
          {stockData.map((stock, index) => {
            const positive = stock.isPositive
            const gradient = stockGradients[positive ? 'positive' : 'negative']
            return (
              <Pressable
                key={`${stock.id}-${index}`}
                style={styles.stockPressable}
                onPress={() => handleSelectStock(stock)}
              >
                <Card
                  style={styles.stockCardWrapper}
                  contentStyle={styles.stockCardContent}
                  gradientColors={gradient}
                >
                  <View style={styles.stockHeader}>
                    <Text variant="subtitle" style={{ maxWidth: '70%' }}>
                      {stock.simbolo}
                    </Text>
                    <Text
                      style={[
                        styles.stockVariation,
                        {
                          color: positive
                            ? theme?.colors?.success
                            : theme?.colors?.error,
                        },
                      ]}
                    >
                      {positive ? '+' : ''}
                      {stock.variacaoPercentual.toFixed(2)}%
                    </Text>
                  </View>
                  <Sparkline
                    data={stock.series}
                    color={positive ? '#51d289' : '#f26b6b'}
                  />
                </Card>
              </Pressable>
            )
          })}
        </ScrollView>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push(recommendationTarget)}
        >
          <Card
            style={styles.virtualAssistantWrapper}
            gradientColors={['#D1A954', '#F2C572']}
            contentStyle={styles.virtualAssistantButton}
          >
            <Text style={styles.virtualAssistantText}>
              Falar com assistente virtual
            </Text>
            <Feather name="arrow-right" size={20} color="#241B0D" />
          </Card>
        </TouchableOpacity>
      </ScrollView>
    </Container>
  )
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerSubtitle: {
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 26,
  },
  avatarCard: {
    width: 48,
    height: 48,
    borderWidth: 0,
    shadowOpacity: 0,
  },
  avatarContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    padding: 0,
  },
  portfolioCard: {
    gap: 16,
    padding: 24,
    borderRadius: 24,
  },
  portfolioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  portfolioLabel: {
    fontSize: 16,
  },
  portfolioChipWrapper: {
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
    backgroundColor: 'transparent',
  },
  portfolioChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  portfolioChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  portfolioValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  portfolioHighlights: {
    flexDirection: 'row',
    gap: 16,
  },
  highlightCard: {
    flex: 1,
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
    backgroundColor: 'transparent',
  },
  highlightContent: {
    borderRadius: 16,
    gap: 6,
  },
  highlightLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  highlightValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  sectionHeader: {
    gap: 6,
  },
  sectionTitle: {
    fontSize: 18,
  },
  sectionCaption: {
    fontSize: 13,
  },
  carousel: {
    paddingVertical: 4,
    gap: 16,
    paddingRight: 8,
  },
  stockPressable: {
    marginRight: 16,
  },
  stockCardWrapper: {
    width: 170,
    borderRadius: 18,
  },
  stockCardContent: {
    gap: 12,
    padding: 16,
    borderRadius: 18,
  },
  stockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockName: {
    fontWeight: '600',
  },
  stockVariation: {
    fontWeight: '600',
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
  virtualAssistantWrapper: {
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  virtualAssistantButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 18,
  },
  virtualAssistantText: {
    color: '#241B0D',
    fontSize: 16,
    fontWeight: '600',
  },
})
