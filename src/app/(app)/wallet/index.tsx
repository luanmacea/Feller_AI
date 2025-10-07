import { useEffect, useMemo, useState } from 'react'
import { FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native'

import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'

import Card from '@/components/Card'
import Container from '@/components/Container'
import LoadingList from '@/components/LoadingList'
import Text from '@/components/Text'
import { selectThemeState } from '@/redux/features/theme/themeSelectors'
import { useAppSelector } from '@/redux/hook'
import api from '@/services/api'
import type { IWalletSummary } from '@/types/typesCerto'

interface TrendPoint {
  label: string
  value: number
}

const CATEGORY_COLORS = ['#65E0A2', '#4C87FF', '#F2C572', '#F27C7C', '#7AB8F5']

export default function WalletPage() {
  const theme = useAppSelector(selectThemeState)
  const colors = theme.colors || {}
  const isDark = theme.mode === 'dark'
  const router = useRouter()

  const [summary, setSummary] = useState<IWalletSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await api.get<IWalletSummary>('/carteira', {
          params: { incluirResumo: true },
        })
        console.log('Resumo da carteira:', response.data)
        setSummary(response.data)
      } catch (error) {
        console.error('Erro ao carregar carteira', error)
        setSummary(null)
      } finally {
        setLoading(false)
      }
    }

    fetchSummary()
  }, [])

  const positions = useMemo(() => {
    if (!summary) return []
    return Array.isArray(summary.posicoes)
      ? summary.posicoes
      : [summary.posicoes].filter(Boolean)
  }, [summary])

  const distribution = useMemo(() => buildDistribution(positions), [positions])
  const movementData = useMemo(() => buildMovements(positions), [positions])

  if (loading) {
    return <LoadingList text="Carregando carteira..." />
  }

  if (!summary) {
    return <LoadingList status="empty" />
  }

  const handleSelectInvestment = (id: number) => {
    router.push({
      pathname: '/(app)/investmentDetails',
      params: { id: String(id) },
    })
  }
  // console.log('AAAAAAAAAAAAAAAAAAAA', summary.valorAtualCarteira)
  return (
    <Container
      style={StyleSheet.flatten([
        styles.container,
        { backgroundColor: isDark ? '#0b111d' : '#f5f7fb' },
      ])}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <Card contentStyle={styles.metricsCard}>
          <View style={styles.metricsRow}>
            <MetricBlock
              label="Valor atual"
              value={formatCurrency(summary.valorAtualCarteira)}
            />
            <MetricBlock
              label="Total investido"
              value={formatCurrency(summary.valorTotalInvestido)}
            />
          </View>
          <View style={styles.metricsRow}>
            <MetricBlock
              label="Ganho total"
              value={formatCurrency(summary.ganhoTotalCarteira)}
            />
            <MetricBlock
              label="Dividendos"
              value={formatCurrency(summary.totalDividendosCarteira)}
            />
            <MetricBlock
              label="Posicoes"
              value={summary?.quantidadePosicoes?.toString()}
            />
          </View>
          <TrendBadge value={summary.percentualGanhoCarteira} />
        </Card>

        <Card
          variant="flat"
          style={styles.movementCard}
          contentStyle={StyleSheet.flatten([
            styles.movementContent,
            { backgroundColor: isDark ? '#111827' : '#ffffff' },
          ])}
        >
          <Text variant="title">Movimento por ativo</Text>
          <TrendSparkline data={movementData} />
          <View style={styles.trendLabels}>
            {movementData.map((point) => (
              <Text key={point.label} variant="caption">
                {point.label}
              </Text>
            ))}
          </View>
        </Card>

        <Card
          variant="flat"
          style={styles.distributionCard}
          contentStyle={StyleSheet.flatten([
            styles.distributionContent,
            { backgroundColor: isDark ? '#121a2b' : '#ffffff' },
          ])}
        >
          <Text variant="title">Distribuicao por categoria</Text>
          <View style={styles.distributionList}>
            {distribution.map((item) => (
              <View key={item.label} style={styles.distributionRow}>
                <View
                  style={[
                    styles.distributionDot,
                    { backgroundColor: item.color },
                  ]}
                />
                <Text
                  style={[
                    styles.distributionLabel,
                    { color: colors.grey1 || '#1f2a3d' },
                  ]}
                >
                  {item.label}
                </Text>
                <View style={styles.distributionBarTrack}>
                  <View
                    style={[
                      styles.distributionBar,
                      {
                        width: `${item.percent}%`,
                        backgroundColor: item.color,
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.distributionValue,
                    { color: colors.grey2 || '#7487a1' },
                  ]}
                >
                  {item.percent?.toFixed(1)}%
                </Text>
              </View>
            ))}
          </View>
        </Card>

        <Card contentStyle={styles.positionsCard} style={{ marginTop: 16 }}>
          <Text variant="title">Minhas posicoes</Text>
          {positions.length === 0 ? (
            <Text style={{ marginTop: 12 }}>Nenhuma posicao encontrada.</Text>
          ) : (
            <FlatList
              data={positions}
              keyExtractor={(item) => String(item.id)}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
              renderItem={({ item }) => (
                <Pressable onPress={() => handleSelectInvestment(item.id)}>
                  <Card
                    style={styles.positionCard}
                    contentStyle={StyleSheet.flatten([
                      styles.positionContent,
                      { backgroundColor: isDark ? '#182235' : '#f2f4fb' },
                    ])}
                  >
                    <View>
                      <Text
                        style={[
                          styles.positionTitle,
                          { color: colors.grey1 || '#1f2a3d' },
                        ]}
                      >
                        {item.simboloInvestimento}
                      </Text>
                      <Text
                        style={[
                          styles.positionSubtitle,
                          { color: colors.grey2 || '#6f819f' },
                        ]}
                      >
                        {item.nomeInvestimento}
                      </Text>
                    </View>
                    <View style={styles.positionMetrics}>
                      <Text style={styles.positionValue}>
                        {formatCurrency(item.valorAtual)}
                      </Text>
                      <View style={styles.variationRow}>
                        <Feather
                          name={
                            item.percentualGanhoPerda >= 0
                              ? 'trending-up'
                              : 'trending-down'
                          }
                          size={16}
                          color={
                            item.percentualGanhoPerda >= 0
                              ? '#65e0a2'
                              : '#f27c7c'
                          }
                        />
                        <Text
                          style={[
                            styles.positionVariation,
                            {
                              color:
                                item.percentualGanhoPerda >= 0
                                  ? '#65e0a2'
                                  : '#f27c7c',
                            },
                          ]}
                        >
                          {item.percentualGanhoPerda >= 0 ? '+' : ''}
                          {item.percentualGanhoPerda?.toFixed(2)}%
                        </Text>
                      </View>
                    </View>
                  </Card>
                </Pressable>
              )}
            />
          )}
        </Card>
      </ScrollView>
    </Container>
  )
}

function buildDistribution(positions: IWalletSummary['posicoes']) {
  const totals: Record<string, number> = {}
  positions.forEach((pos) => {
    totals[pos.categoria] = (totals[pos.categoria] || 0) + pos.valorAtual
  })
  const totalValue =
    Object.values(totals).reduce((acc, value) => acc + value, 0) || 1

  return Object.entries(totals).map(([categoria, value], index) => ({
    label: categoria.replace('_', ' '),
    value,
    percent: (value / totalValue) * 100,
    color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
  }))
}

function buildMovements(positions: IWalletSummary['posicoes']): TrendPoint[] {
  const sorted = [...positions].sort(
    (a, b) =>
      Math.abs(b.percentualGanhoPerda) - Math.abs(a.percentualGanhoPerda),
  )

  return sorted.slice(0, 8).map((pos) => ({
    label: pos.simboloInvestimento.slice(0, 4),
    value: pos.percentualGanhoPerda,
  }))
}

function formatCurrency(value: number) {
  return value?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function TrendSparkline({ data }: { data: TrendPoint[] }) {
  if (data.length === 0) return null
  const values = data.map((p) => p.value)
  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = max - min || 1

  return (
    <View style={styles.sparklineRow}>
      {data.map((point) => {
        const normalized = (point.value - min) / range
        const height = 12 + normalized * 48
        const color = point.value >= 0 ? '#65e0a2' : '#f27c7c'
        return (
          <View key={point.label} style={styles.sparklineColumn}>
            <View
              style={[styles.sparklineBar, { height, backgroundColor: color }]}
            />
          </View>
        )
      })}
    </View>
  )
}

function TrendBadge({ value }: { value: number }) {
  const positive = value >= 0
  const icon = positive ? 'trending-up' : 'trending-down'
  const trendColor = positive ? '#65e0a2' : '#f27c7c'

  return (
    <View style={styles.trendBadgeContainer}>
      <Feather name={icon} size={16} color={trendColor} />
      <Text style={[styles.trendBadgeText, { color: trendColor }]}>
        {positive ? '+' : ''}
        {value?.toFixed(2)}%
      </Text>
    </View>
  )
}

function MetricBlock({ label, value }: { label: string; value: string }) {
  return (
    <View style={(styles.metricBlock, { gap: 3 })}>
      <Text variant="caption" style={{ textTransform: 'uppercase' }}>
        {label}
      </Text>
      <Text variant="subtitle">{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 0,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  metricsCard: {
    gap: 16,
    padding: 20,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  metricBlock: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 6,
  },
  movementCard: {
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
    backgroundColor: 'transparent',
    marginTop: 16,
  },
  movementContent: {
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 20,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  sparklineRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    height: 120,
  },
  sparklineColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  sparklineBar: {
    width: 12,
    borderRadius: 6,
  },
  trendLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  trendLabel: {
    fontSize: 11,
  },
  distributionCard: {
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
    backgroundColor: 'transparent',
    marginTop: 16,
  },
  distributionContent: {
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 20,
    gap: 18,
  },
  distributionList: {
    gap: 14,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  distributionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  distributionLabel: {
    minWidth: 90,
    fontSize: 13,
  },
  distributionBarTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  distributionBar: {
    height: 8,
    borderRadius: 4,
  },
  distributionValue: {
    width: 52,
    textAlign: 'right',
    fontSize: 12,
  },
  positionsCard: {
    padding: 20,
    gap: 16,
  },
  positionCard: {
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
    backgroundColor: 'transparent',
  },
  positionContent: {
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  positionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  positionSubtitle: {
    fontSize: 12,
    letterSpacing: 0.6,
  },
  positionMetrics: {
    alignItems: 'flex-end',
    gap: 6,
  },
  positionValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  variationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  positionVariation: {
    fontSize: 13,
    fontWeight: '600',
  },
  trendBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    gap: 6,
  },
  trendBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
})
