import { useEffect, useMemo, useState } from 'react'
import { FlatList, Pressable, StyleSheet, View } from 'react-native'

import { Feather } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'

import Card from '@/components/Card'
import Container from '@/components/Container'
import FeatherIcon from '@/components/FeatherIcon'
import LoadingList from '@/components/LoadingList'
import Text from '@/components/Text'
import { selectThemeState } from '@/redux/features/theme/themeSelectors'
import { useAppSelector } from '@/redux/hook'
import api from '@/services/api'
import type { IPlaylistDetail } from '@/types/typesCerto'

export default function PlaylistDetailsPage() {
  const { id } = useLocalSearchParams<{ id?: string }>()
  const router = useRouter()

  const theme = useAppSelector(selectThemeState)
  const colors = theme.colors || {}
  const isDark = theme.mode === 'dark'
  const titleColor = colors.grey1 || (isDark ? '#f4f7ff' : '#1f2a3d')

  const [playlist, setPlaylist] = useState<IPlaylistDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) {
        setLoading(false)
        setPlaylist(null)
        return
      }

      try {
        const response = await api.get<IPlaylistDetail>(`/playlists/${id}`)
        setPlaylist(response.data)
      } catch (error) {
        console.error('Erro ao carregar detalhes da playlist', error)
        setPlaylist(null)
      } finally {
        setLoading(false)
      }
    }

    fetchDetails()
  }, [id])

  const badges = useMemo(
    () => (playlist ? buildBadges(playlist) : []),
    [playlist],
  )

  const investments = playlist?.investimentos ?? []
  const containerStyle = StyleSheet.flatten([styles.container])

  if (loading) {
    return <LoadingList text="Carregando playlist..." status="loading" />
  }

  if (!playlist) {
    return (
      <Container style={containerStyle}>
        <LoadingList
          status="empty"
          text="Playlist nao encontrada ou indisponivel."
        />
      </Container>
    )
  }

  const handleOpenInvestment = (investmentId: number) => {
    router.push({
      pathname: '/(app)/investmentDetails',
      params: { id: String(investmentId) },
    })
  }

  return (
    <Container style={containerStyle}>
      <FlatList
        data={investments}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <Card
            style={styles.headerCard}
            contentStyle={StyleSheet.flatten([
              styles.headerContent,
              { backgroundColor: isDark ? '#121a2b' : '#ffffff' },
            ])}
          >
            <View style={styles.titleRow}>
              <Text variant="title" style={{ color: titleColor }}>
                {playlist.nome}
              </Text>
              <View style={styles.smallBadge}>
                <Feather name="layers" size={14} color="#4c87ff" />
                <Text style={styles.smallBadgeText}>
                  {playlist.totalInvestimentos} ativos
                </Text>
              </View>
            </View>
            <Text
              variant="body"
              style={[
                styles.description,
                { color: isDark ? '#ccd6f6' : '#54617a' },
              ]}
            >
              {playlist.descricao || 'Playlist sem descricao.'}
            </Text>

            <View style={styles.badgeRow}>
              {badges.map((badge) => (
                <View
                  key={badge.label}
                  style={[styles.badge, { backgroundColor: badge.background }]}
                >
                  <Text
                    variant="caption"
                    style={[styles.badgeText, { color: badge.color }]}
                  >
                    {badge.label}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.metaRow}>
              <MetaItem
                icon="user"
                label={playlist.criadorNome}
                description="Criador"
                isDarkTheme={isDark}
              />
              <MetaItem
                icon="users"
                label={`${playlist.totalSeguidores} seguidores`}
                description="Popularidade"
                isDarkTheme={isDark}
              />
              <MetaItem
                icon="calendar"
                label={formatDate(playlist.dataCriacao)}
                description="Criada em"
                isDarkTheme={isDark}
              />
            </View>
          </Card>
        }
        ListEmptyComponent={
          <Card
            style={styles.emptyCard}
            contentStyle={StyleSheet.flatten([
              styles.emptyContent,
              { backgroundColor: isDark ? '#121a2b' : '#ffffff' },
            ])}
          >
            <Feather name="folder" size={32} color="#9aa6c9" />
            <Text
              variant="body"
              style={{ color: isDark ? '#c5d0eb' : '#5f6f8a' }}
            >
              Nenhum investimento nesta playlist ainda.
            </Text>
          </Card>
        }
        renderItem={({ item }) => {
          const numericVariation = Number.parseFloat(
            String(item?.variacaoPercentual || '').replace('%', ''),
          )

          const hasNumericVariation = Number.isFinite(numericVariation)
          const isPositive = hasNumericVariation ? numericVariation >= 0 : false

          return (
            <Pressable onPress={() => handleOpenInvestment(item.id)}>
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
                    {item.precoAtual?.toLocaleString('pt-BR', {
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
                      {item?.variacaoPercentual?.toFixed(2)}%
                    </Text>
                  </View>
                </View>
                {item.recomendadoParaVoce && (
                  <View style={styles.recommendedBadge}>
                    <FeatherIcon icon="star" size={14} color="#F2C572" />
                    <Text style={styles.recommendedText}>
                      Recomendado para voce
                    </Text>
                  </View>
                )}
              </Card>
            </Pressable>
          )
        }}
      />
    </Container>
  )
}

type BadgeInfo = { label: string; color: string; background: string }

function buildBadges(item: IPlaylistDetail): BadgeInfo[] {
  const badges: BadgeInfo[] = []

  if (item.isCriador) {
    badges.push({
      label: 'Minha playlist',
      color: '#4c87ff',
      background: '#4c87ff22',
    })
  }

  if (item.permiteColaboracao) {
    badges.push({
      label: 'Colaborativa',
      color: '#65E0A2',
      background: '#65E0A222',
    })
  }

  if (item.publica) {
    badges.push({
      label: 'Publica',
      color: '#F2C572',
      background: '#F2C57222',
    })
  } else if (item.privada) {
    badges.push({
      label: 'Privada',
      color: '#F27C7C',
      background: '#F27C7C22',
    })
  } else if (item.compartilhada) {
    badges.push({
      label: 'Compartilhada',
      color: '#7AB8F5',
      background: '#7AB8F522',
    })
  }

  if (item.isFollowing && !item.isCriador) {
    badges.push({
      label: 'Seguindo',
      color: '#c084fc',
      background: '#c084fc22',
    })
  }

  return badges
}

function formatDate(value: string) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function MetaItem({
  icon,
  label,
  description,
  isDarkTheme,
}: {
  icon: keyof typeof Feather.glyphMap
  label: string
  description: string
  isDarkTheme: boolean
}) {
  const labelColor = isDarkTheme ? '#f4f7ff' : '#1f2a3d'
  return (
    <View style={styles.metaItem}>
      <View style={styles.metaIconWrapper}>
        <Feather name={icon} size={16} color="#4c87ff" />
      </View>
      <View style={styles.metaTextBlock}>
        <Text variant="caption" style={styles.metaDescription}>
          {description}
        </Text>
        <Text variant="body" style={[styles.metaLabel, { color: labelColor }]}>
          {label}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 24,
  },
  headerCard: {
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
    backgroundColor: 'transparent',
    marginBottom: 16,
  },
  headerContent: {
    borderRadius: 26,
    padding: 22,
    gap: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 14,
    backgroundColor: '#4c87ff15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaTextBlock: {
    gap: 2,
  },
  metaDescription: {
    color: '#7a8aa6',
  },
  metaLabel: {
    fontWeight: '600',
  },
  investmentCard: {
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
    backgroundColor: 'transparent',
  },
  investmentContent: {
    borderRadius: 22,
    padding: 20,
  },
  investmentPressable: {
    gap: 10,
  },
  investmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  symbol: {
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  investmentDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  investmentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceBlock: {
    gap: 4,
  },
  priceLabel: {
    color: '#7a8aa6',
  },
  priceValue: {
    fontWeight: '700',
  },
  variationBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  variationValue: {
    fontWeight: '600',
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
  emptyCard: {
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
    backgroundColor: 'transparent',
    marginTop: 32,
  },
  emptyContent: {
    borderRadius: 22,
    paddingVertical: 32,
    alignItems: 'center',
    gap: 10,
  },
  smallBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#4c87ff22',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  smallBadgeText: {
    color: '#4c87ff',
    fontSize: 12,
    fontWeight: '600',
  },
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
})
