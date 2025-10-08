import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native'

import { Feather } from '@expo/vector-icons'

import Card from '@/components/Card'
import Container from '@/components/Container'
import LoadingList from '@/components/LoadingList'
import Text from '@/components/Text'
import { selectThemeState } from '@/redux/features/theme/themeSelectors'
import { useAppSelector } from '@/redux/hook'
import api from '@/services/api'
import type { IRecommendedInvestment } from '@/types/typesCerto'

export default function RecommendedWalletPage() {
  const theme = useAppSelector(selectThemeState)
  const isDark = theme.mode === 'dark'
  const colors = theme.colors || {}

  const [recommendations, setRecommendations] = useState<
    IRecommendedInvestment[]
  >([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [mounting, setMounting] = useState(false)

  const fetchRecommendations = useCallback(async () => {
    if (!refreshing) setLoading(true)
    try {
      const { data } = await api.get<IRecommendedInvestment[]>(
        '/investimentos/recomendados',
      )
      setRecommendations(data ?? [])
    } catch (error) {
      console.error('Erro ao buscar investimentos recomendados', error)
      setRecommendations([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [refreshing])

  useEffect(() => {
    fetchRecommendations()
  }, [fetchRecommendations])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchRecommendations()
  }

  const handleBuildWallet = async () => {
    if (mounting) return
    setMounting(true)
    try {
      const { data } = await api.post<{ mensagem?: string; message?: string }>(
        '/feller/montar-carteira-recomendada',
      )

      const mensagem =
        (typeof data === 'string' && data) ||
        data?.mensagem ||
        data?.message ||
        'Carteira montada com sucesso!'

      Alert.alert('Sucesso', mensagem)
      fetchRecommendations()
    } catch (error) {
      console.error('Erro ao montar carteira recomendada', error)
      Alert.alert(
        'Erro',
        'Nao foi possivel montar a carteira recomendada no momento.',
      )
    } finally {
      setMounting(false)
    }
  }

  const contentBackground = isDark ? '#0b111d' : '#f5f7fb'

  const listEmptyComponent = useMemo(
    () =>
      !loading ? (
        <Card
          variant="flat"
          style={styles.emptyCard}
          contentStyle={StyleSheet.flatten([
            styles.emptyContent,
            { backgroundColor: isDark ? '#121a2b' : '#ffffff' },
          ])}
        >
          <Feather
            name="inbox"
            size={28}
            color={isDark ? '#7c8dab' : '#6880a8'}
          />
          <Text
            variant="body"
            style={{
              textAlign: 'center',
              color: isDark ? '#9aaecb' : '#5a6f90',
            }}
          >
            Nenhum investimento recomendado no momento. Monte sua carteira para
            receber novas sugestoes.
          </Text>
        </Card>
      ) : null,
    [isDark, loading],
  )

  if (loading && !refreshing) {
    return <LoadingList text="Carregando carteira recomendada..." />
  }

  return (
    <Container
      style={StyleSheet.flatten([
        styles.container,
        { backgroundColor: contentBackground },
      ])}
    >
      <FlatList
        data={recommendations}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary || '#4c87ff'}
          />
        }
        ListHeaderComponent={
          <Card
            variant="flat"
            style={styles.headerCard}
            contentStyle={StyleSheet.flatten([
              styles.headerContent,
              { backgroundColor: isDark ? '#121a2b' : '#ffffff' },
            ])}
          >
            <View style={styles.headerTopRow}>
              <View>
                <Text
                  variant="title"
                  style={{ color: colors.grey1 || '#1f2a3d' }}
                >
                  Carteira Recomendada
                </Text>
                <Text
                  variant="caption"
                  style={{ color: isDark ? '#9aaecb' : '#5c6f90' }}
                >
                  Sugestoes personalizadas para o seu perfil
                </Text>
              </View>
              <Pressable
                onPress={handleBuildWallet}
                disabled={mounting}
                style={StyleSheet.flatten([
                  styles.buildButton,
                  {
                    backgroundColor: colors.primary || '#4c87ff',
                    opacity: mounting ? 0.6 : 1,
                  },
                ])}
              >
                {mounting ? (
                  <ActivityIndicator size="small" color="#f4f7ff" />
                ) : (
                  <>
                    <Feather name="play-circle" size={18} color="#f4f7ff" />
                    <Text style={styles.buildButtonText}>Montar carteira</Text>
                  </>
                )}
              </Pressable>
            </View>
          </Card>
        }
        ListEmptyComponent={listEmptyComponent}
        renderItem={({ item }) => (
          <Card
            variant="flat"
            style={styles.itemCard}
            contentStyle={StyleSheet.flatten([
              styles.itemContent,
              { backgroundColor: isDark ? '#101c32' : '#ffffff' },
            ])}
          >
            <View style={styles.itemHeader}>
              <View style={styles.itemIcon}>
                <Feather name="trending-up" size={18} color="#4c87ff" />
              </View>
              <View style={styles.itemTitle}>
                <Text
                  variant="title"
                  style={{ color: colors.grey1 || '#1f2a3d' }}
                >
                  {item.investimentoNome}
                </Text>
                <Text
                  variant="caption"
                  style={{ color: isDark ? '#9aaecb' : '#5c6f90' }}
                >
                  {item.investimentoSimbolo} • {item.categoria} • {item.risco}
                </Text>
              </View>
            </View>

            <View style={styles.itemDetails}>
              <InfoBadge
                label="ID recomendacao"
                value={String(item.id)}
                tone={isDark ? '#243354' : '#e0e8ff'}
                isDark={isDark}
              />
              <InfoBadge
                label="Recomendado em"
                value={formatDate(item.dataRecomendacao)}
                tone={isDark ? '#1b2a44' : '#f1f4ff'}
                isDark={isDark}
              />
            </View>
          </Card>
        )}
      />
    </Container>
  )
}

function formatDate(value: string | number) {
  if (!value) return '-'
  const parsed =
    typeof value === 'number' ? new Date(value) : new Date(String(value))
  if (Number.isNaN(parsed.getTime())) return String(value)
  return parsed.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function InfoBadge({
  label,
  value,
  tone,
  isDark,
}: {
  label: string
  value: string
  tone: string
  isDark: boolean
}) {
  const valueColor = isDark ? '#f4f7ff' : '#1f2a3d'
  return (
    <View style={StyleSheet.flatten([styles.badge, { backgroundColor: tone }])}>
      <Text style={styles.badgeLabel}>{label}</Text>
      <Text style={[styles.badgeValue, { color: valueColor }]}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 16,
  },
  headerCard: {
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
    backgroundColor: 'transparent',
  },
  headerContent: {
    borderRadius: 22,
    padding: 20,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  buildButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  },
  buildButtonText: {
    color: '#f4f7ff',
    fontWeight: '600',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemCard: {
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
    backgroundColor: 'transparent',
  },
  itemContent: {
    borderRadius: 20,
    padding: 18,
    gap: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4c87ff22',
  },
  itemTitle: {
    flex: 1,
    gap: 4,
  },
  itemDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badge: {
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: '45%',
  },
  badgeLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: '#6d7b95',
  },
  badgeValue: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2a3d',
  },
  emptyCard: {
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
    backgroundColor: 'transparent',
    marginTop: 24,
  },
  emptyContent: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
})
