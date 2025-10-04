import { useCallback, useEffect, useMemo, useState } from 'react'
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native'

import { Feather } from '@expo/vector-icons'

import Card from '@/components/Card'
import Container from '@/components/Container'
import { Loading } from '@/components/Loading'
import Text from '@/components/Text'
import { selectUser } from '@/redux/features/auth/authSelectors'
import { selectThemeState } from '@/redux/features/theme/themeSelectors'
import { useAppSelector } from '@/redux/hook'
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
  const formatted = value.toFixed(2)
  return `${value >= 0 ? '+' : ''}${formatted}%`
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

export default function HomePage() {
  const theme = useAppSelector(selectThemeState)
  const user = useAppSelector(selectUser)

  const [summary, setSummary] = useState<WalletSummary | null>(null)
  const [positions, setPositions] = useState<WalletPosition[]>([])
  const [statement, setStatement] = useState<WalletStatementEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const displayName = useMemo(() => {
    const base = user?.nomePreferencial || user?.nomeUsuario
    if (!base) return 'Investidor'
    return base.split(' ')[0]
  }, [user?.nomePreferencial, user?.nomeUsuario])

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bom dia'
    if (hour < 18) return 'Boa tarde'
    return 'Boa noite'
  }, [])

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
      setStatement(statementData.slice(0, 5))
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

  const gainers = useMemo(
    () =>
      positions
        .filter((item) => (item.percentualGanhoPerda ?? 0) > 0)
        .sort(
          (a, b) =>
            (b.percentualGanhoPerda ?? 0) - (a.percentualGanhoPerda ?? 0),
        )
        .slice(0, 3),
    [positions],
  )

  const losers = useMemo(
    () =>
      positions
        .filter((item) => (item.percentualGanhoPerda ?? 0) < 0)
        .sort(
          (a, b) =>
            (a.percentualGanhoPerda ?? 0) - (b.percentualGanhoPerda ?? 0),
        )
        .slice(0, 3),
    [positions],
  )

  return (
    <Container>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors?.primary}
          />
        }
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text variant="caption" style={styles.caption}>
              {greeting}
            </Text>
            <Text variant="title" style={styles.headline}>
              {displayName}
            </Text>
          </View>
          <Feather name="pie-chart" size={28} color={theme.colors?.primary} />
        </View>

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
              <View style={styles.summaryRow}>
                <View style={styles.summaryColumn}>
                  <Text variant="caption">Valor da carteira</Text>
                  <Text style={styles.summaryValue}>
                    {formatCurrency(summary?.valorAtualCarteira)}
                  </Text>
                </View>
                <View style={styles.summaryColumn}>
                  <Text variant="caption">Saldo disponivel</Text>
                  <Text style={styles.summaryValue}>
                    {formatCurrency(summary?.saldoDisponivel)}
                  </Text>
                </View>
              </View>
              <View style={styles.summaryRow}>
                <View style={styles.summaryColumn}>
                  <Text variant="caption">Ganho acumulado</Text>
                  <Text style={[styles.summaryValue, styles.positive]}>
                    {formatCurrency(summary?.ganhoTotalCarteira)}
                  </Text>
                </View>
                <View style={styles.summaryColumn}>
                  <Text variant="caption">Variacao</Text>
                  <Text
                    style={[
                      styles.summaryValue,
                      (summary?.percentualGanhoCarteira ?? 0) >= 0
                        ? styles.positive
                        : styles.negative,
                    ]}
                  >
                    {formatPercentage(summary?.percentualGanhoCarteira)}
                  </Text>
                </View>
              </View>
            </Card>

            <Card style={styles.card}>
              <Text variant="subtitle" style={styles.sectionTitle}>
                Maiores altas
              </Text>
              {gainers.length === 0 ? (
                <Text variant="caption">
                  Nenhuma posicao positiva encontrada.
                </Text>
              ) : (
                gainers.map((item) => (
                  <View key={item.id} style={styles.positionRow}>
                    <View style={styles.positionLeft}>
                      <Feather name="trending-up" size={18} color="#2E8B57" />
                      <View>
                        <Text style={styles.positionName}>
                          {item.nomeInvestimento}
                        </Text>
                        <Text variant="caption">
                          {item.simboloInvestimento}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.positionRight}>
                      <Text style={styles.positive}>
                        {formatPercentage(item.percentualGanhoPerda)}
                      </Text>
                      <Text variant="caption">
                        {formatCurrency(item.valorAtual)}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </Card>

            <Card style={styles.card}>
              <Text variant="subtitle" style={styles.sectionTitle}>
                Maiores quedas
              </Text>
              {losers.length === 0 ? (
                <Text variant="caption">
                  Nenhuma posicao negativa encontrada.
                </Text>
              ) : (
                losers.map((item) => (
                  <View key={item.id} style={styles.positionRow}>
                    <View style={styles.positionLeft}>
                      <Feather name="trending-down" size={18} color="#B22222" />
                      <View>
                        <Text style={styles.positionName}>
                          {item.nomeInvestimento}
                        </Text>
                        <Text variant="caption">
                          {item.simboloInvestimento}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.positionRight}>
                      <Text style={styles.negative}>
                        {formatPercentage(item.percentualGanhoPerda)}
                      </Text>
                      <Text variant="caption">
                        {formatCurrency(item.valorAtual)}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </Card>

            <Card style={styles.card}>
              <Text variant="subtitle" style={styles.sectionTitle}>
                Ultimas operacoes
              </Text>
              {statement.length === 0 ? (
                <Text variant="caption">Nenhuma operacao encontrada.</Text>
              ) : (
                statement.map((item) => {
                  const sign = getTransactionSign(item.tipoTransacao)
                  const color =
                    sign > 0 ? '#2E8B57' : sign < 0 ? '#B22222' : '#4A4A4A'
                  const value = item.valorTotal ?? item.saldoAtual ?? 0

                  return (
                    <View key={item.id} style={styles.operationRow}>
                      <View style={styles.operationLeft}>
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
                      <View style={styles.operationRight}>
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
    paddingBottom: 32,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  caption: {
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    fontSize: 12,
  },
  headline: {
    fontSize: 24,
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
  summaryRow: {
    flexDirection: 'row',
    gap: 16,
  },
  summaryColumn: {
    flex: 1,
    gap: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  positive: {
    color: '#2E8B57',
  },
  negative: {
    color: '#B22222',
  },
  card: {
    gap: 12,
  },
  sectionTitle: {
    marginBottom: 4,
  },
  positionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  positionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  positionRight: {
    alignItems: 'flex-end',
  },
  positionName: {
    fontWeight: '600',
  },
  operationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  operationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  operationRight: {
    alignItems: 'flex-end',
  },
})
