import { useEffect, useMemo, useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'

import { Feather } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'

import Card from '@/components/Card'
import Container from '@/components/Container'
import { Loading } from '@/components/Loading'
import Text from '@/components/Text'
import { fetchInvestmentById } from '@/services/investments'
import type { InvestmentDetails } from '@/types/types'
import { formatDateTimeToBR } from '@/utils/formatValues'

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const formatCurrency = (value?: number) => currencyFormatter.format(value ?? 0)

const formatPercentage = (value?: number) => {
  if (value === undefined || Number.isNaN(value)) {
    return '-'
  }
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

const categoryIcons: Record<string, keyof typeof Feather.glyphMap> = {
  RENDA_FIXA: 'shield',
  RENDA_VARIAVEL: 'trending-up',
  FUNDO_IMOBILIARIO: 'home',
  FUNDO: 'layers',
  CRIPTO: 'cpu',
  OUTROS: 'briefcase',
  TESOURO_DIRETO: 'dollar-sign',
}

const riskLabels: Record<string, string> = {
  BAIXO: 'Baixo',
  MEDIO: 'Medio',
  ALTO: 'Alto',
}

export default function InvestmentDetailsPage() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const investmentId = Number(params.id)

  const [investment, setInvestment] = useState<InvestmentDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!Number.isFinite(investmentId)) {
      setError('Identificador do investimento invalido.')
      return
    }

    const loadData = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetchInvestmentById(investmentId)
        setInvestment(response)
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          'Nao foi possivel carregar os dados do investimento.'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [investmentId])

  const iconName = useMemo(() => {
    if (!investment?.categoria) {
      return 'bar-chart-2'
    }
    return categoryIcons[investment.categoria] || 'bar-chart-2'
  }, [investment?.categoria])

  const variation = investment?.variacaoPercentual ?? 0
  const isPositive = variation >= 0

  const lastUpdate = investment?.ultimaAtualizacaoPreco
    ? formatDateTimeToBR(investment.ultimaAtualizacaoPreco)
    : 'Nao informado'

  if (loading) {
    return (
      <Container style={styles.centered}>
        <Loading />
      </Container>
    )
  }

  if (error) {
    return (
      <Container style={styles.centered}>
        <Card style={styles.errorCard}>
          <Text variant="subtitle">Algo deu errado</Text>
          <Text>{error}</Text>
        </Card>
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

  return (
    <Container>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Card style={styles.headerCard}>
          <View style={styles.headerIcon}>
            <Feather name={iconName} size={28} color="#1c3259" />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="title" style={styles.headerTitle}>
              {investment.nome}
            </Text>
            <Text variant="caption">{investment.simbolo}</Text>
            <Text style={styles.headerSubtitle}>
              Categoria: {investment.categoria || 'Nao informado'}
            </Text>
          </View>
        </Card>

        <Card style={styles.card}>
          <Text variant="subtitle" style={styles.sectionTitle}>
            Panorama geral
          </Text>
          <View style={styles.metricsRow}>
            <View style={styles.metricBlock}>
              <Text variant="caption">Preco atual</Text>
              <Text style={styles.metricValue}>
                {formatCurrency(investment.precoAtual)}
              </Text>
            </View>
            <View style={styles.metricBlock}>
              <Text variant="caption">Variacao</Text>
              <Text
                style={[
                  styles.metricValue,
                  isPositive ? styles.positive : styles.negative,
                ]}
              >
                {formatPercentage(variation)}
              </Text>
            </View>
          </View>
          <View style={styles.metricsRow}>
            <View style={styles.metricBlock}>
              <Text variant="caption">Dividend yield</Text>
              <Text style={styles.metricValue}>
                {investment.dividendYield !== undefined
                  ? formatPercentage(investment.dividendYield)
                  : 'Nao informado'}
              </Text>
            </View>
            <View style={styles.metricBlock}>
              <Text variant="caption">Atualizado em</Text>
              <Text style={styles.metricValue}>{lastUpdate}</Text>
            </View>
          </View>
        </Card>

        <Card style={styles.card}>
          <Text variant="subtitle" style={styles.sectionTitle}>
            Detalhes
          </Text>
          <View style={styles.detailRow}>
            <Text variant="caption">Risco</Text>
            <Text>{riskLabels[investment.risco || ''] || 'Nao informado'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text variant="caption">Liquidez</Text>
            <Text>{investment.liquidez || 'Nao informado'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text variant="caption">Quantidade disponivel</Text>
            <Text>{investment.quantidadeDisponivel ?? 'Nao informado'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text variant="caption">Descricao</Text>
            <Text style={styles.description}>
              {investment.descricao || 'Nao ha descricao cadastrada.'}
            </Text>
          </View>
        </Card>

        <Card style={styles.card}>
          <Text variant="subtitle" style={styles.sectionTitle}>
            Precisa de ajuda?
          </Text>
          <Text style={{ marginBottom: 12 }}>
            Chame o assistente virtual para analisar como este ativo se encaixa
            na sua carteira.
          </Text>
          <View style={styles.ctaButton}>
            <Feather name="message-square" size={18} color="#fff" />
            <Text
              style={styles.ctaText}
              onPress={() =>
                router.push({
                  pathname: '/(app)/virtual-assistant',
                  params: { assetId: investment.id },
                })
              }
            >
              Falar com o assistente
            </Text>
          </View>
        </Card>
      </ScrollView>
    </Container>
  )
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    gap: 16,
    paddingBottom: 32,
  },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 20,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#dfe7f7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  card: {
    gap: 16,
  },
  sectionTitle: {
    fontWeight: '600',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  metricBlock: {
    flex: 1,
    gap: 6,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  positive: {
    color: '#2E8B57',
  },
  negative: {
    color: '#B22222',
  },
  detailRow: {
    gap: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  errorCard: {
    gap: 8,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1c3259',
    paddingVertical: 12,
    borderRadius: 12,
  },
  ctaText: {
    color: '#fff',
    fontWeight: '600',
  },
})
