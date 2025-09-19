import { useMemo, useState } from 'react'
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import Svg, { Path, Polyline } from 'react-native-svg'

import { Feather } from '@expo/vector-icons'

import Card from '@/components/Card'
import Container from '@/components/Container'
import Text from '@/components/Text'
import { walletMock } from '@/mocks/investmentMocks'
import { selectThemeState } from '@/redux/features/theme/themeSelectors'
import { useAppSelector } from '@/redux/hook'

interface ChartPoint {
  label: string
  value: number
}

interface PieItem {
  label: string
  value: number
  color: string
}

const periodOptions = [
  { label: '7D', key: '7d' as const },
  { label: '1M', key: '1m' as const },
  { label: '1A', key: '1y' as const },
]

const pieDistribution: PieItem[] = [
  { label: 'Tech', value: 32, color: '#65E0A2' },
  { label: 'Financeiro', value: 24, color: '#F2C572' },
  { label: 'Energia', value: 18, color: '#F27C7C' },
  { label: 'Internacional', value: 16, color: '#7AB8F5' },
  { label: 'Emergentes', value: 10, color: '#C99A2E' },
]

const scenarioOptions = [
  {
    label: 'Vender 10% das acoes tech',
    delta: -0.08,
    explanation:
      'Realiza ganhos recentes e reduz exposicao a volatilidade de curto prazo.',
  },
  {
    label: 'Comprar 5% em renda fixa',
    delta: 0.04,
    explanation: 'Aumenta previsibilidade de caixa e suaviza perdas futuras.',
  },
  {
    label: 'Rebalancear 15% para emergentes',
    delta: 0.06,
    explanation: 'Busca capturar crescimento global mantendo risco moderado.',
  },
]

type PeriodKey = (typeof periodOptions)[number]['key']

const { width: windowWidth } = Dimensions.get('window')
const CHART_WIDTH = windowWidth - 64
const CHART_HEIGHT = 140

function buildSeries(period: PeriodKey): ChartPoint[] {
  const history = walletMock.history
  if (period === '1y') {
    return history.map((entry) => ({
      label: entry.month,
      value: entry.profit - entry.loss,
    }))
  }

  if (period === '1m') {
    const recent = history.slice(-4)
    return recent.map((entry) => ({
      label: entry.month,
      value: entry.profit - entry.loss,
    }))
  }

  const base = history[history.length - 1]
  const net = base ? base.profit - base.loss : 0
  return Array.from({ length: 7 }, (_, index) => ({
    label: `D${index + 1}`,
    value: net * (0.6 + 0.1 * Math.sin((index + 1) * 1.2)),
  }))
}

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  }
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
) {
  const start = polarToCartesian(cx, cy, r, endAngle)
  const end = polarToCartesian(cx, cy, r, startAngle)
  const largeArcFlag = endAngle - startAngle <= Math.PI ? '0' : '1'

  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`
}

function PieChart({
  data,
  innerColor,
}: {
  data: PieItem[]
  innerColor: string
}) {
  const radius = 70
  const cx = radius
  const cy = radius
  const total = data.reduce((acc, item) => acc + item.value, 0) || 1

  let cumulative = -Math.PI / 2

  return (
    <Svg width={radius * 2} height={radius * 2}>
      {data.map((item) => {
        const angle = (item.value / total) * Math.PI * 2
        const startAngle = cumulative
        const endAngle = cumulative + angle
        cumulative = endAngle

        return (
          <Path
            key={item.label}
            d={describeArc(cx, cy, radius, startAngle, endAngle)}
            fill={item.color}
          />
        )
      })}
      <Path
        d={describeArc(cx, cy, radius * 0.55, -Math.PI / 2, Math.PI * 1.5)}
        fill={innerColor}
      />
    </Svg>
  )
}

function ProfitLossLineChart({
  data,
  positiveColor,
  negativeColor,
}: {
  data: ChartPoint[]
  positiveColor: string
  negativeColor: string
}) {
  if (!data.length) {
    return <Svg width={CHART_WIDTH} height={CHART_HEIGHT} />
  }

  const values = data.map((point) => point.value)
  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = max === min ? (max === 0 ? 1 : Math.abs(max)) : max - min

  const step = data.length > 1 ? CHART_WIDTH / (data.length - 1) : CHART_WIDTH
  const points = data.map((point, index) => {
    const x = index * step
    const normalized = (point.value - min) / range
    const y = CHART_HEIGHT - normalized * CHART_HEIGHT
    return { x, y }
  })

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ')
  const areaPath = `M 0 ${CHART_HEIGHT} ${points.map((p) => `L ${p.x} ${p.y}`).join(' ')} L ${CHART_WIDTH} ${CHART_HEIGHT} Z`

  const zeroY = CHART_HEIGHT - ((0 - min) / range) * CHART_HEIGHT

  return (
    <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
      <Path d={areaPath} fill={positiveColor} opacity={0.12} />
      <Polyline
        points={polylinePoints}
        fill="none"
        stroke={positiveColor}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {min < 0 && max > 0 && (
        <Path
          d={`M 0 ${zeroY} L ${CHART_WIDTH} ${zeroY}`}
          stroke={negativeColor}
          strokeDasharray="6 6"
          strokeWidth={1}
          opacity={0.4}
        />
      )}
    </Svg>
  )
}

export default function WalletPage() {
  const theme = useAppSelector(selectThemeState)
  const colors = theme.colors || {}
  const isDark = theme.mode === 'dark'

  const [selectedPeriod, setSelectedPeriod] = useState<PeriodKey>('1m')
  const [isModalVisible, setModalVisible] = useState(false)
  const [scenarioIndex, setScenarioIndex] = useState(0)

  const chartSeries = useMemo(
    () => buildSeries(selectedPeriod),
    [selectedPeriod],
  )

  const averageYield = useMemo(() => {
    const totalNet = walletMock.history.reduce(
      (acc, item) => acc + (item.profit - item.loss),
      0,
    )
    return totalNet / walletMock.history.length
  }, [])

  const activeScenario = scenarioOptions[scenarioIndex]
  const projectedBalance = walletMock.balance * (1 + activeScenario.delta)
  const projectedYield = averageYield * (1 + activeScenario.delta * 0.6)

  const positiveColor = theme?.colors?.success || '#65E0A2'
  const negativeColor = theme?.colors?.error || '#F27C7C'

  return (
    <Container style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Card contentStyle={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={[styles.balanceLabel]}>Saldo total</Text>
            <Card
              variant="flat"
              style={styles.balanceChipWrapper}
              contentStyle={styles.balanceChip}
            >
              <Feather name="shield" size={14} color={colors.primary} />
              <Text style={[styles.balanceChipText, { color: colors.primary }]}>
                Protegido
              </Text>
            </Card>
          </View>
          <Text style={[styles.balanceValue]}>
            {walletMock.balance.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </Text>
          <Text style={[styles.balanceSub]}>
            Disponivel para movimentacao imediata
          </Text>
        </Card>

        <Card
          variant="flat"
          style={styles.chartCardWrapper}
          contentStyle={[
            styles.chartContent,
            {
              backgroundColor: isDark
                ? 'rgba(255, 255, 255, 0.04)'
                : 'rgba(17, 17, 24, 0.05)',
            },
          ]}
        >
          <View style={styles.chartHeader}>
            <Text style={[styles.sectionTitle, { color: colors.grey1 }]}>
              Lucros x perdas
            </Text>
            <View style={styles.filtersRow}>
              {periodOptions.map((option) => {
                const isActive = option.key === selectedPeriod
                return (
                  <Pressable
                    key={option.key}
                    onPress={() => setSelectedPeriod(option.key)}
                    style={[
                      styles.filterButton,
                      isActive && {
                        backgroundColor: colors.primary || '#C99A2E',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterLabel,
                        { color: isActive ? '#241B0D' : colors.grey2 },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                )
              })}
            </View>
          </View>

          <ProfitLossLineChart
            data={chartSeries}
            positiveColor={positiveColor}
            negativeColor={negativeColor}
          />

          <View style={styles.chartLegend}>
            <View
              style={[styles.legendDot, { backgroundColor: positiveColor }]}
            />
            <Text style={[styles.legendText]}>Lucro liquido</Text>
          </View>
        </Card>

        <View style={styles.summarySection}>
          <Card
            variant="flat"
            style={styles.distributionWrapper}
            contentStyle={[
              styles.distributionCard,
              {
                backgroundColor: isDark
                  ? 'rgba(255, 255, 255, 0.04)'
                  : 'rgba(17, 17, 24, 0.05)',
              },
            ]}
          >
            <Text style={[styles.summaryLabel]}>Distribuicao de ativos</Text>
            <View style={styles.pieRow}>
              <View style={styles.pieChartWrapper}>
                <PieChart
                  data={pieDistribution}
                  innerColor={colors.background || '#0E0E10'}
                />
                <View style={styles.pieCenter}>
                  <Text style={[styles.pieCenterValue]}>
                    {pieDistribution.length}
                  </Text>
                  <Text style={[styles.pieCenterLabel]}>classes</Text>
                </View>
              </View>
              <View style={styles.pieLegend}>
                {pieDistribution.map((item) => (
                  <View key={item.label} style={styles.pieLegendRow}>
                    <View
                      style={[
                        styles.legendDot,
                        { backgroundColor: item.color },
                      ]}
                    />
                    <Text style={[styles.legendText]}>{item.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          </Card>

          <Card
            variant="flat"
            style={styles.summaryCardWrapper}
            contentStyle={[
              styles.summaryCard,
              {
                backgroundColor: isDark
                  ? 'rgba(255, 255, 255, 0.04)'
                  : 'rgba(17, 17, 24, 0.05)',
              },
            ]}
          >
            <Text style={[styles.summaryLabel]}>Rendimento medio</Text>
            <Text style={[styles.summaryValue, { color: positiveColor }]}>
              {averageYield.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </Text>
            <Text style={[styles.summaryCaption]}>
              Media mensal nos ultimos 12 meses
            </Text>
          </Card>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setModalVisible(true)}
        >
          <Card
            style={styles.simulateWrapper}
            gradientColors={['#D1A954', '#F2C572']}
            contentStyle={styles.simulateContent}
          >
            <View>
              <Text style={styles.simulateTitle}>Simular cenarios</Text>
              <Text style={styles.simulateCaption}>
                Projete vendas e rebalanceamentos antes de executar
              </Text>
            </View>
            <Feather name="chevron-right" size={22} color="#241B0D" />
          </Card>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        animationType="fade"
        transparent
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <Card
            variant="flat"
            style={styles.modalCardWrapper}
            contentStyle={[
              styles.modalCard,
              { backgroundColor: isDark ? '#15151C' : '#FFFFFF' },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.grey1 }]}>
                Simular cenarios
              </Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <Feather name="x" size={20} color={colors.grey2 || '#888'} />
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              {scenarioOptions.map((scenario, index) => {
                const isActive = index === scenarioIndex
                return (
                  <Pressable
                    key={scenario.label}
                    onPress={() => setScenarioIndex(index)}
                    style={[
                      styles.scenarioOption,
                      {
                        borderColor: isActive
                          ? colors.primary || '#C99A2E'
                          : 'transparent',
                        backgroundColor: isActive
                          ? isDark
                            ? 'rgba(209, 169, 84, 0.08)'
                            : 'rgba(201, 154, 46, 0.08)'
                          : 'transparent',
                      },
                    ]}
                  >
                    <Text
                      style={[styles.scenarioLabel, { color: colors.grey1 }]}
                    >
                      {scenario.label}
                    </Text>
                    <Text
                      style={[
                        styles.scenarioDescription,
                        { color: colors.grey2 },
                      ]}
                    >
                      {scenario.explanation}
                    </Text>
                  </Pressable>
                )
              })}
            </View>

            <View style={styles.modalFooter}>
              <View>
                <Text style={[styles.modalMetricLabel]}>Saldo projetado</Text>
                <Text
                  style={[styles.modalMetricValue, { color: colors.grey1 }]}
                >
                  {projectedBalance.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </Text>
              </View>
              <View>
                <Text style={[styles.modalMetricLabel]}>
                  Rendimento estimado
                </Text>
                <Text
                  style={[
                    styles.modalMetricValue,
                    {
                      color:
                        projectedYield >= 0 ? positiveColor : negativeColor,
                    },
                  ]}
                >
                  {projectedYield.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </Text>
              </View>
            </View>
          </Card>
        </View>
      </Modal>
    </Container>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 0,
  },
  scrollContent: {
    paddingBottom: 40,
    gap: 24,
  },
  balanceCard: {
    gap: 12,
    padding: 24,
    borderRadius: 24,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 16,
  },
  balanceChipWrapper: {
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
    backgroundColor: 'transparent',
  },
  balanceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(241, 234, 207, 0.18)',
  },
  balanceChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  balanceValue: {
    fontSize: 34,
    fontWeight: '700',
  },
  balanceSub: {
    fontSize: 14,
  },
  chartCardWrapper: {
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
    backgroundColor: 'transparent',
  },
  chartContent: {
    borderRadius: 24,
    padding: 20,
    gap: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: 'transparent',
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  chartLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
  },
  summarySection: {
    gap: 16,
  },
  distributionWrapper: {
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
    backgroundColor: 'transparent',
    width: '100%',
  },
  distributionCard: {
    padding: 20,
    borderRadius: 20,
    gap: 12,
  },
  summaryCardWrapper: {
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
    backgroundColor: 'transparent',
    width: '100%',
  },
  summaryCard: {
    padding: 20,
    borderRadius: 20,
    gap: 8,
  },
  summaryLabel: {
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  summaryCaption: {
    fontSize: 12,
  },
  pieRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16,
    flexWrap: 'wrap',
  },
  pieChartWrapper: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pieCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieCenterValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  pieCenterLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  pieLegend: {
    flex: 1,
    gap: 8,
    justifyContent: 'center',
    minWidth: 120,
  },
  pieLegendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  simulateWrapper: {
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  simulateContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  simulateTitle: {
    color: '#241B0D',
    fontSize: 16,
    fontWeight: '700',
  },
  simulateCaption: {
    color: '#433015',
    fontSize: 13,
    marginTop: 4,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCardWrapper: {
    width: '100%',
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
    backgroundColor: 'transparent',
  },
  modalCard: {
    borderRadius: 24,
    padding: 24,
    gap: 18,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalBody: {
    gap: 12,
  },
  scenarioOption: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    gap: 6,
  },
  scenarioLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  scenarioDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalMetricLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalMetricValue: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
})
