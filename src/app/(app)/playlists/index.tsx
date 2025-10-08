import { useEffect, useState } from 'react'
import { FlatList, Pressable, StyleSheet, View } from 'react-native'

import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'

import Card from '@/components/Card'
import Container from '@/components/Container'
import LoadingList from '@/components/LoadingList'
import Text from '@/components/Text'
import { selectThemeState } from '@/redux/features/theme/themeSelectors'
import { useAppSelector } from '@/redux/hook'
import api from '@/services/api'
import type { IPlaylistItem } from '@/types/typesCerto'

export default function PlaylistsPage() {
  const theme = useAppSelector(selectThemeState)
  const colors = theme.colors || {}
  const isDark = theme.mode === 'dark'

  const router = useRouter()

  const [playlists, setPlaylists] = useState<IPlaylistItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const response = await api.get<IPlaylistItem[]>('/playlists/minhas')
        setPlaylists(response.data ?? [])
      } catch (error) {
        console.error('Erro ao carregar playlists', error)
        setPlaylists([])
      } finally {
        setLoading(false)
      }
    }

    fetchPlaylists()
  }, [])

  const titleColor = colors.grey1 || (isDark ? '#f4f7ff' : '#1f2a3d')

  if (loading) {
    return <LoadingList text="Carregando playlists..." status="loading" />
  }

  if (!playlists.length) {
    return (
      <Container style={StyleSheet.flatten([styles.container])}>
        <LoadingList status="empty" text="Nenhuma playlist encontrada ainda." />
      </Container>
    )
  }

  const handleOpenPlaylist = (playlistId: number) => {
    router.push({
      pathname: '/(app)/playlists/[id]',
      params: { id: String(playlistId) },
    })
  }

  return (
    <Container style={styles.container}>
      <FlatList
        data={playlists}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const badges = buildBadges(item)
          return (
            <Card
              style={styles.cardWrapper}
              contentStyle={StyleSheet.flatten([
                styles.cardContent,
                { backgroundColor: isDark ? '#121a2b' : '#ffffff' },
              ])}
            >
              <Pressable
                onPress={() => handleOpenPlaylist(item.id)}
                style={styles.pressable}
              >
                <View style={styles.headerRow}>
                  <Text variant="title" style={{ color: titleColor }}>
                    {item.nome}
                  </Text>
                  <Feather name="chevron-right" size={20} color="#4c87ff" />
                </View>
                <Text
                  variant="body"
                  style={[
                    styles.description,
                    { color: isDark ? '#ccd6f6' : '#54617a' },
                  ]}
                >
                  {item.descricao || 'Playlist sem descricao.'}
                </Text>

                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Feather name="layers" size={14} color="#4c87ff" />
                    <Text variant="caption" style={styles.metaText}>
                      {item.totalInvestimentos} ativos
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Feather name="users" size={14} color="#4c87ff" />
                    <Text variant="caption" style={styles.metaText}>
                      {item.totalSeguidores} seguidores
                    </Text>
                  </View>
                </View>

                <View style={styles.badgeRow}>
                  {badges.map((badge) => (
                    <View
                      key={badge.label}
                      style={[
                        styles.badge,
                        { backgroundColor: badge.background },
                      ]}
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

                <View style={styles.footerRow}>
                  <Text variant="caption" style={styles.footerText}>
                    Criada por {item.criadorNome}
                  </Text>
                  <Text
                    variant="caption"
                    style={[styles.footerText, { color: '#9aa6c9' }]}
                  >
                    {formatDate(item.dataCriacao)}
                  </Text>
                </View>
              </Pressable>
            </Card>
          )
        }}
      />
    </Container>
  )
}

type BadgeInfo = { label: string; color: string; background: string }

function buildBadges(item: IPlaylistItem): BadgeInfo[] {
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 16,
    gap: 16,
  },
  cardWrapper: {
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
    backgroundColor: 'transparent',
  },
  cardContent: {
    borderRadius: 24,
    padding: 20,
  },
  pressable: {
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    color: '#9aa6c9',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    color: '#7a8aa6',
  },
})
