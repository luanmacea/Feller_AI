import { useCallback, useEffect, useMemo, useState } from 'react'
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native'

import { Feather } from '@expo/vector-icons'

import Card from '@/components/Card'
import Container from '@/components/Container'
import { Loading } from '@/components/Loading'
import Text from '@/components/Text'
import {
  fetchWalletPositions,
  fetchWalletStatement,
  fetchWalletSummary,
} from '@/services/portfolio'
import type {
  WalletPosition,
  WalletStatementEntry,
  WalletSummary,
} from '@/types/types'
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

const getTransactionLabel = (type?: string) => {
  switch (type) {
    case 'COMPRA_ACAO':
      return 'Compra de acao'
    case 'VENDA_ACAO':
      return 'Venda de acao'
    case 'DIVIDENDO_RECEBIDO':
      return 'Dividendo recebido'
    case 'DEPOSITO':
      return 'Deposito'
    case 'SAQUE':
      return 'Saque'
    default:
      return type || 'Operacao'
  }
}

const getTransactionSign = (type?: string) => {
  switch (type) {
    case 'VENDA_ACAO':
    case 'DIVIDENDO_RECEBIDO':
    case 'DEPOSITO':
      return 1
    case 'COMPRA_ACAO':
    case 'SAQUE':
      return -1
    default:
      return 0
  }
}

export default function WalletPage() {
  const [summary, setSummary] = useState<WalletSummary | null>(null)
  const [positions, setPositions] = useState<WalletPosition[]>([])
  const [statement, setStatement] = useState<WalletStatementEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    setError(null)

    try {
      const [summaryData, positionsData, statementData] = await Promise.all([
        fetchWalletSummary(),
        fetchWalletPositions(),
        fetchWalletStatement(),
      ])

      setSummary(summaryData)
      setPositions(positionsData)
      setStatement(statementData.slice(0, 10))
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Nao foi possivel carregar os dados da carteira.'
      setError(message)
    } finally {
      if (isRefresh) {
        setRefreshing(false)
      } else {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    loadData(false)
  }, [loadData])

  const onRefresh = useCallback(() => {
    loadData(true)
  }, [loadData])

  const categoryDistribution = useMemo(() => {
    const totals = positions.reduce<Record<string, number>>((acc, item) => {
      const key = item.categoria || 'OUTROS'
      acc[key] = (acc[key] || 0) + (item.valorAtual ?? 0)
      return acc
    }, {})

    const totalValue = Object.values(totals).reduce(
      (acc, value) => acc + value,
      0,
    )

    return Object.entries(totals)
      .map(([category, value]) => ({
        category,
        value,
        percent: totalValue > 0 ? (value / totalValue) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value)
  }, [positions])

  const totalRentabilidade = useMemo(() => {
    if (!positions.length) {
      return 0
    }
    const totalInvested = positions.reduce(
      (acc, item) => acc + (item.valorInvestido ?? 0),
      0,
    )
    const totalCurrent = positions.reduce(
      (acc, item) => acc + (item.valorAtual ?? 0),
      0,
    )
    if (totalInvested === 0) {
      return 0
    }
    return ((totalCurrent - totalInvested) / totalInvested) * 100
  }, [positions])

  return (
    <Container>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {loading ? (
          <Loading />
        ) : error ? (
          <Card style={styles.errorCard}>
            <Text variant="subtitle">Algo deu errado</Text>
            <Text>{error}</Text>
            <Text style={styles.retry} onPress={() => loadData(false)}>
              Tentar novamente
            </Text>
          </Card>
        ) : (
          <>
            <Card style={styles.summaryCard}>
              <Text variant="title" style={styles.summaryTitle}>
                Carteira geral
              </Text>
              <View style={styles.summaryGrid}>
                <View style={styles.summaryItem}>
                  <Text variant="caption">Valor atual</Text>
                  <Text style={styles.summaryValue}>
                    {formatCurrency(summary?.valorAtualCarteira)}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text variant="caption">Saldo disponivel</Text>
                  <Text style={styles.summaryValue}>
                    {formatCurrency(summary?.saldoDisponivel)}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text variant="caption">Total investido</Text>
                  <Text style={styles.summaryValue}>
                    {formatCurrency(summary?.valorTotalInvestido)}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text variant="caption">Rentabilidade</Text>
                  <Text
                    style={[
                      styles.summaryValue,
                      totalRentabilidade >= 0
                        ? styles.positive
                        : styles.negative,
                    ]}
                  >
                    {formatPercentage(totalRentabilidade)}
                  </Text>
                </View>
              </View>
            </Card>

            <Card style={styles.card}>
              <Text variant="subtitle" style={styles.sectionTitle}>
                Distribuicao por categoria
              </Text>
              {categoryDistribution.length === 0 ? (
                <Text variant="caption">Nenhuma posicao encontrada.</Text>
              ) : (
                categoryDistribution.map((item) => (
                  <View key={item.category} style={styles.distributionRow}>
                    <View style={styles.distributionLeft}>
                      <Feather name="pie-chart" size={18} color="#1c3259" />
                      <Text style={styles.positionName}>{item.category}</Text>
                    </View>
                    <View style={styles.distributionRight}>
                      <Text style={styles.positionName}>
                        {formatCurrency(item.value)}
                      </Text>
                      <Text variant="caption">{item.percent.toFixed(2)}%</Text>
                    </View>
                  </View>
                ))
              )}
            </Card>

            <Card style={styles.card}>
              <Text variant="subtitle" style={styles.sectionTitle}>
                Posicoes
              </Text>
              {positions.length === 0 ? (
                <Text variant="caption">Nenhum ativo na carteira.</Text>
              ) : (
                positions.map((item) => (
                  <View key={item.id} style={styles.positionRow}>
                    <View style={styles.positionInfo}>
                      <Text style={styles.positionName}>
                        {item.nomeInvestimento}
                      </Text>
                      <Text variant="caption">{item.simboloInvestimento}</Text>
                      <Text variant="caption">
                        {item.quantidadeTotal ?? 0} cotas | Preco medio{' '}
                        {formatCurrency(item.precoMedio)}
                      </Text>
                    </View>
                    <View style={styles.positionValues}>
                      <Text>{formatCurrency(item.valorAtual)}</Text>
                      <Text
                        style={[
                          (item.percentualGanhoPerda ?? 0) >= 0
                            ? styles.positive
                            : styles.negative,
                        ]}
                      >
                        {formatPercentage(item.percentualGanhoPerda)}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </Card>

            <Card style={styles.card}>
              <Text variant="subtitle" style={styles.sectionTitle}>
                Historico de operacoes
              </Text>
              {statement.length === 0 ? (
                <Text variant="caption">Nenhuma operacao registrada.</Text>
              ) : (
                statement.map((item) => {
                  const sign = getTransactionSign(item.tipoTransacao)
                  const color =
                    sign > 0 ? '#2E8B57' : sign < 0 ? '#B22222' : '#4A4A4A'
                  const value = item.valorTotal ?? item.saldoAtual ?? 0
                  return (
                    <View key={item.id} style={styles.operationRow}>
                      <View style={styles.operationInfo}>
                        <Feather name="clock" size={18} color={color} />
                        <View>
                          <Text style={styles.positionName}>
                            {getTransactionLabel(item.tipoTransacao)}
                          </Text>
                          <Text variant="caption">
                            {item.nomeInvestimento || 'Conta'}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.operationValues}>
                        <Text style={{ color }}>
                          {`${sign > 0 ? '+' : sign < 0 ? '-' : ''}${formatCurrency(Math.abs(value))}`}
                        </Text>
                        <Text variant="caption">
                          {formatDateTimeToBR(item.dataTransacao)}
                        </Text>
                      </View>
                    </View>
                  )
                })
              )}
            </Card>
          </>
        )}
      </ScrollView>
    </Container>
  )
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    paddingBottom: 32,
  },
  errorCard: {
    gap: 8,
  },
  retry: {
    marginTop: 8,
    color: '#1E90FF',
    fontWeight: '600',
  },
  summaryCard: {
    gap: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  summaryItem: {
    width: '48%',
    gap: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  card: {
    gap: 12,
  },
  sectionTitle: {
    fontWeight: '600',
  },
  distributionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  distributionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  distributionRight: {
    alignItems: 'flex-end',
  },
  positionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  positionInfo: {
    flex: 1,
    gap: 4,
  },
  positionName: {
    fontWeight: '600',
  },
  positionValues: {
    alignItems: 'flex-end',
    gap: 4,
  },
  positive: {
    color: '#2E8B57',
  },
  negative: {
    color: '#B22222',
  },
  operationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  operationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  operationValues: {
    alignItems: 'flex-end',
  },
})
