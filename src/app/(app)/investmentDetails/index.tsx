import { useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native'

import { Feather } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'

import Card from '@/components/Card'
import Container from '@/components/Container'
import Text from '@/components/Text'
import { selectThemeState } from '@/redux/features/theme/themeSelectors'
import { useAppSelector } from '@/redux/hook'
import api from '@/services/api'
import type { InvestmentItem } from '@/types/typesCerto'

interface TrendPoint {
  label: string
  value: number
}

const CHART_HEIGHT = 120

const sectorIcons: Record<string, keyof typeof Feather.glyphMap> = {
  RENDA_VARIAVEL: 'trending-up',
  RENDA_FIXA: 'shield',
  INTERNACIONAL: 'globe',
  FUNDO_IMOBILIARIO: 'home',
  CRIPTOMOEDA: 'hexagon',
}

export default function InvestmentDetailsPage() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id?: string }>()
  const theme = useAppSelector(selectThemeState)
  const colors = theme.colors || {}
  const isDark = theme.mode === 'dark'

  const [investment, setInvestment] = useState<InvestmentItem | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInvestment = async () => {
      if (!id) {
        setLoading(false)
        return
      }

      try {
        const response = await api.get<InvestmentItem>(`/investimentos/${id}`)
        setInvestment(response.data)
      } catch (error) {
        console.error('Erro ao carregar investimento', error)
        setInvestment(null)
      } finally {
        setLoading(false)
      }
    }

    fetchInvestment()
  }, [id])

  const trendData = useMemo(
    () => buildTrend(investment?.variacaoPercentual ?? 0),
    [investment?.variacaoPercentual],
  )

  if (loading) {
    return (
      <Container style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary || '#C99A2E'} />
        <Text style={{ marginTop: 12, color: colors.grey2 || '#7b8faa' }}>
          Carregando detalhes...
        </Text>
      </Container>
    )
  }

  if (!investment) {
    return (
      <Container style={styles.centered}>
        <Text variant="title">Investimento nao encontrado.</Text>
      </Container>
    )
  }

  const isPositive = investment.variacaoPercentual >= 0
  const sectorIcon = sectorIcons[investment.categoria] || 'bar-chart'
  const highlightColor = isPositive ? '#44C18C' : '#E15D6E'

  const handleTalk = () => {
    router.push({
      pathname: '/(app)/virtual-assistant',
      params: { assetId: String(investment.id) },
    })
  }

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
        <Card
          variant="flat"
          style={styles.headerCard}
          contentStyle={StyleSheet.flatten([
            styles.headerContent,
            { backgroundColor: isDark ? '#131b2d' : '#dfe7f7' },
          ])}
        >
          <View
            style={StyleSheet.flatten([
              styles.headerIcon,
              { backgroundColor: isDark ? '#1e2940' : '#c8d6ef' },
            ])}
          >
            <Feather
              name={sectorIcon}
              size={22}
              color={isDark ? '#dce6ff' : '#1c3259'}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>{investment.nome}</Text>
            <Text style={styles.headerSubtitle}>
              {investment.simbolo} � {investment.categoria.replace('_', ' ')}
            </Text>
            <Text style={styles.headerDescription}>
              _{investment.descricao}_
            </Text>
          </View>
        </Card>

        <Card contentStyle={styles.metricsCard}>
          <View style={styles.metricsRow}>
            <MetricBlock
              label="Valor atual"
              value={formatCurrency(investment.precoAtual)}
              color={colors.grey2 || '#f4f7ff'}
            />
            <MetricBlock
              label="Variacao"
              value={`${isPositive ? '+' : ''}${investment.variacaoPercentual.toFixed(2)}%`}
              color={highlightColor}
              icon={isPositive ? 'trending-up' : 'trending-down'}
            />
          </View>
          <View style={styles.metricsRow}>
            <MetricBlock
              label="Atualizado em"
              value={formatDate(investment.updatedAt || investment.data)}
              color={colors.grey2 || '#7b8faa'}
            />
            <MetricBlock
              label="Dividend yield"
              value={`${investment.dividendYield.toFixed(1)}%`}
              color={colors.grey2 || '#7b8faa'}
            />
          </View>
        </Card>

        <Card
          variant="flat"
          style={styles.chartCard}
          contentStyle={StyleSheet.flatten([
            styles.chartContent,
            { backgroundColor: isDark ? '#111827' : '#ffffff' },
          ])}
        >
          <Text
            style={[styles.sectionTitle, { color: colors.grey1 || '#1f2a3d' }]}
          >
            Variacao recente
          </Text>
          <TrendSparkline data={trendData} color={highlightColor} />
          <View style={styles.trendLabels}>
            {trendData.map((point) => (
              <Text
                key={point.label}
                style={[
                  styles.trendLabel,
                  { color: colors.grey2 || '#6f819f' },
                ]}
              >
                {point.label}
              </Text>
            ))}
          </View>
        </Card>

        <Card
          variant="flat"
          style={styles.infoCard}
          contentStyle={StyleSheet.flatten([
            styles.infoContent,
            { backgroundColor: isDark ? '#121a2b' : '#ffffff' },
          ])}
        >
          <InfoRow label="Liquidez" value={investment.liquidez} />
          <InfoRow
            label="Frequencia de dividendo"
            value={`${investment.frequenciaDividendo}x ao ano`}
          />
          <InfoRow label="Risco" value={investment.risco} />
          <InfoRow
            label="Quantidade disponivel"
            value={investment.quantidadeDisponivel.toLocaleString('pt-BR')}
          />
        </Card>

        <Pressable onPress={handleTalk} style={{ marginTop: 16 }}>
          <Card
            style={styles.ctaCard}
            gradientColors={['#2f60ff', '#4c87ff']}
            contentStyle={styles.ctaContent}
          >
            <View>
              <Text style={styles.ctaTitle}>
                Conversar com Assistente sobre este ativo
              </Text>
              <Text style={styles.ctaSubtitle}>
                Receba orientacoes personalizadas, tese de investimento e riscos
              </Text>
            </View>
            <Feather name="message-circle" size={20} color="#f4f7ff" />
          </Card>
        </Pressable>
      </ScrollView>
    </Container>
  )
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(value: string | undefined) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function buildTrend(variation: number): TrendPoint[] {
  const points: TrendPoint[] = []
  let base = 100
  for (let i = 0; i < 8; i++) {
    const factor = Math.sin(i * 0.8 + variation / 3) * (variation / 6)
    base += factor
    points.push({
      label: `D-${7 - i}`,
      value: parseFloat(base.toFixed(2)),
    })
  }
  return points
}

function TrendSparkline({
  data,
  color,
}: {
  data: TrendPoint[]
  color: string
}) {
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

function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  )
}

function MetricBlock({
  label,
  value,
  color,
  icon,
}: {
  label: string
  value: string
  color: string
  icon?: keyof typeof Feather.glyphMap
}) {
  return (
    <View style={styles.metricBlock}>
      <Text style={[styles.metricLabel, { color: '#7b8faa' }]}>{label}</Text>
      <View style={styles.metricValueRow}>
        {icon && (
          <View
            style={[
              styles.metricIconWrapper,
              { backgroundColor: `${color}22` },
            ]}
          >
            <Feather name={icon} size={16} color={color} />
          </View>
        )}
        <Text style={[styles.metricValue, { color }]}>{value}</Text>
      </View>
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
  headerCard: {
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
    backgroundColor: 'transparent',
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    gap: 16,
    padding: 20,
    borderRadius: 24,
    alignItems: 'center',
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f3f7ff',
  },
  headerSubtitle: {
    fontSize: 13,
    marginBottom: 6,
    color: '#c7d5f3',
  },
  headerDescription: {
    fontStyle: 'italic',
    fontSize: 13,
    color: '#d8e1f9',
  },
  metricsCard: {
    gap: 16,
    padding: 20,
    borderRadius: 24,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  metricBlock: {
    flex: 1,
    gap: 10,
  },
  metricLabel: {
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metricIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  chartCard: {
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
    backgroundColor: 'transparent',
    marginTop: 16,
  },
  chartContent: {
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 20,
    gap: 16,
  },
  sparklineRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: CHART_HEIGHT,
    gap: 6,
  },
  sparklineColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  sparklineBar: {
    width: 8,
    borderRadius: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  trendLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  trendLabel: {
    fontSize: 11,
  },
  infoCard: {
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
    backgroundColor: 'transparent',
    marginTop: 16,
  },
  infoContent: {
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 20,
    gap: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 13,
    color: '#98a6c4',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f5f7ff',
  },
  ctaCard: {
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
    backgroundColor: 'transparent',
  },
  ctaContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 22,
    gap: 12,
  },
  ctaTitle: {
    color: '#f4f7ff',
    fontSize: 16,
    fontWeight: '700',
  },
  ctaSubtitle: {
    color: '#dce6ff',
    fontSize: 13,
    marginTop: 4,
  },
})
