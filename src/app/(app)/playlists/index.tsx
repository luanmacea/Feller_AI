import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Alert,
  FlatList,
  Pressable,
  Share,
  StyleSheet,
  TextInput,
  View,
} from 'react-native'

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

type ViewMode = 'mine' | 'explore'

type BadgeInfo = { label: string; color: string; background: string }

const toggleOptions: Array<{ label: string; value: ViewMode }> = [
  { label: 'Minhas Playlists', value: 'mine' },
  { label: 'Explorar Playlists', value: 'explore' },
]

export default function PlaylistsPage() {
  const router = useRouter()
  const theme = useAppSelector(selectThemeState)
  const colors = theme.colors || {}
  const isDark = theme.mode === 'dark'

  const requestIdRef = useRef(0)

  const [playlists, setPlaylists] = useState<IPlaylistItem[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>('mine')
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [actionLoading, setActionLoading] = useState<Record<number, boolean>>(
    {},
  )
  const [creating, setCreating] = useState(false)

  const accentColor = '#F2C572'
  const headerBackground = isDark ? '#050A1A' : '#111827'
  const surfaceColor = isDark ? '#101726' : '#1F2937'
  const mutedTextColor = isDark ? '#9AA6C9' : '#9CA3AF'
  const lightTextColor = isDark ? '#F8FAFC' : '#F1F5F9'
  const borderColor = isDark
    ? 'rgba(248, 250, 252, 0.06)'
    : 'rgba(15, 23, 42, 0.08)'

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim())
    }, 400)
    return () => clearTimeout(handler)
  }, [searchTerm])

  const loadPlaylists = useCallback(
    async (
      mode: ViewMode,
      term: string,
      options?: { showLoader?: boolean },
    ) => {
      const shouldShowLoader = options?.showLoader ?? true
      const currentRequest = ++requestIdRef.current

      if (shouldShowLoader) {
        setLoading(true)
      }

      try {
        const params: Record<string, string> = {
          tipo: mode === 'mine' ? 'minhas' : 'publicas',
        }
        if (term) {
          params.nome = term
        }

        const response = await api.get<IPlaylistItem[]>('/playlists')

        if (requestIdRef.current === currentRequest) {
          setPlaylists(response.data ?? [])
        }
      } catch (error) {
        console.error('Erro ao carregar playlists', error)
        if (requestIdRef.current === currentRequest) {
          setPlaylists([])
        }
      } finally {
        if (requestIdRef.current === currentRequest && shouldShowLoader) {
          setLoading(false)
        }
        if (requestIdRef.current === currentRequest && refreshing) {
          setRefreshing(false)
        }
      }
    },
    [refreshing],
  )

  useEffect(() => {
    loadPlaylists(viewMode, debouncedSearch)
  }, [viewMode, debouncedSearch, loadPlaylists])

  const handleOpenPlaylist = useCallback(
    (playlistId: number) => {
      router.push({
        pathname: '/(app)/playlists/[id]',
        params: { id: String(playlistId) },
      })
    },
    [router],
  )

  const setPlaylistActionLoading = useCallback((id: number, value: boolean) => {
    setActionLoading((prev) => ({ ...prev, [id]: value }))
  }, [])

  const handleToggleFollow = useCallback(
    async (playlist: IPlaylistItem) => {
      const playlistId = playlist.id
      setPlaylistActionLoading(playlistId, true)

      try {
        await api.post(`/playlists/${playlistId}/follow`, {
          acao: playlist.isFollowing ? 'unfollow' : 'follow',
        })

        setPlaylists((prev) =>
          prev.map((item) =>
            item.id === playlistId
              ? {
                  ...item,
                  isFollowing: !item.isFollowing,
                  totalSeguidores: item.isFollowing
                    ? Math.max(0, item.totalSeguidores - 1)
                    : item.totalSeguidores + 1,
                }
              : item,
          ),
        )
      } catch (error) {
        console.error('Erro ao atualizar seguimento da playlist', error)
      } finally {
        setPlaylistActionLoading(playlistId, false)
      }
    },
    [setPlaylistActionLoading],
  )

  const handleShare = useCallback(
    async (playlist: IPlaylistItem) => {
      const playlistId = playlist.id
      setPlaylistActionLoading(playlistId, true)

      try {
        const response = await api.post<{ link?: string }>(
          `/playlists/${playlistId}/share`,
        )

        const link = response.data?.link
        const message = link
          ? `Confira a playlist ${playlist.nome} no InvestApp: ${link}`
          : `Confira a playlist ${playlist.nome} no InvestApp!`

        await Share.share({
          message,
        })
      } catch (error) {
        console.error('Erro ao compartilhar playlist', error)
      } finally {
        setPlaylistActionLoading(playlistId, false)
      }
    },
    [setPlaylistActionLoading],
  )

  const performDeletePlaylist = useCallback(
    async (playlistId: number) => {
      setPlaylistActionLoading(playlistId, true)

      try {
        await api.delete(`/playlists/${playlistId}`)
        setPlaylists((prev) => prev.filter((item) => item.id !== playlistId))
      } catch (error) {
        console.error('Erro ao excluir playlist', error)
      } finally {
        setPlaylistActionLoading(playlistId, false)
      }
    },
    [setPlaylistActionLoading],
  )

  const handleDelete = useCallback(
    (playlist: IPlaylistItem) => {
      Alert.alert(
        'Excluir playlist',
        `Tem certeza que deseja excluir "${playlist.nome}"? Essa ação não pode ser desfeita.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Excluir',
            style: 'destructive',
            onPress: () => performDeletePlaylist(playlist.id),
          },
        ],
      )
    },
    [performDeletePlaylist],
  )

  const handleCreatePlaylist = useCallback(async () => {
    if (creating) {
      return
    }

    setCreating(true)

    try {
      await api.post('/playlists', {
        nome: `Nova playlist ${new Date().toLocaleTimeString('pt-BR')}`,
        descricao: 'Playlist criada a partir do aplicativo.',
      })

      const targetMode: ViewMode = 'mine'
      const nextSearch = ''

      setViewMode(targetMode)
      setSearchTerm(nextSearch)
      setDebouncedSearch(nextSearch)

      await loadPlaylists(targetMode, nextSearch)
    } catch (error) {
      console.error('Erro ao criar playlist', error)
    } finally {
      setCreating(false)
    }
  }, [creating, loadPlaylists])

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await loadPlaylists(viewMode, debouncedSearch, { showLoader: false })
    } finally {
      setRefreshing(false)
    }
  }, [loadPlaylists, viewMode, debouncedSearch])

  const emptyState = useMemo(
    () =>
      viewMode === 'mine'
        ? 'Você ainda não possui playlists. Crie a sua com o botão +.'
        : 'Nenhuma playlist pública encontrada. Tente ajustar sua busca.',
    [viewMode],
  )

  const renderPlaylistItem = useCallback(
    ({ item }: { item: IPlaylistItem }) => {
      const badges = buildBadges(item)
      const isOwner = item.isCriador
      const canFollow = item.publica && !isOwner
      const isBusy = actionLoading[item.id]

      return (
        <Card
          variant="flat"
          style={[styles.cardWrapper, { borderColor }]}
          contentStyle={[
            styles.cardContent,
            { backgroundColor: surfaceColor, borderColor },
          ]}
        >
          <Pressable
            onPress={() => handleOpenPlaylist(item.id)}
            style={styles.cardPressable}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleBlock}>
                <Text
                  variant="title"
                  style={[styles.cardTitle, { color: lightTextColor }]}
                >
                  {item.nome}
                </Text>
                <Text
                  variant="body"
                  style={[styles.cardDescription, { color: mutedTextColor }]}
                  numberOfLines={2}
                >
                  {item.descricao || 'Playlist sem descrição.'}
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color={accentColor} />
            </View>

            <View style={styles.metaRow}>
              <View style={[styles.metaPill, { borderColor }]}>
                <Feather name="layers" size={14} color={accentColor} />
                <Text
                  variant="caption"
                  style={[styles.metaText, { color: lightTextColor }]}
                >
                  {item.totalInvestimentos} investimentos
                </Text>
              </View>

              <View style={[styles.metaPill, { borderColor }]}>
                <Feather name="users" size={14} color={accentColor} />
                <Text
                  variant="caption"
                  style={[styles.metaText, { color: lightTextColor }]}
                >
                  {item.totalSeguidores} seguidores
                </Text>
              </View>
            </View>

            <View style={styles.creatorRow}>
              <Feather name="user" size={14} color={mutedTextColor} />
              <Text
                variant="caption"
                style={[styles.creatorText, { color: mutedTextColor }]}
              >
                {isOwner ? 'Criada por você' : `Criada por ${item.criadorNome}`}
              </Text>
            </View>

            {!!badges.length && (
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
            )}
          </Pressable>

          <View style={styles.actionsRow}>
            {canFollow && (
              <Pressable
                style={[
                  styles.actionButton,
                  item.isFollowing && {
                    backgroundColor: accentColor,
                  },
                ]}
                onPress={() => handleToggleFollow(item)}
                disabled={isBusy}
              >
                <Feather
                  name={item.isFollowing ? 'check' : 'plus'}
                  size={16}
                  color={item.isFollowing ? '#0F172A' : accentColor}
                />
                <Text
                  variant="caption"
                  style={[
                    styles.actionText,
                    item.isFollowing
                      ? { color: '#0F172A' }
                      : { color: accentColor },
                  ]}
                >
                  {item.isFollowing ? 'Deixar de seguir' : 'Seguir'}
                </Text>
              </Pressable>
            )}

            <Pressable
              style={styles.actionButton}
              onPress={() => handleShare(item)}
              disabled={isBusy}
            >
              <Feather name="share-2" size={16} color={accentColor} />
              <Text
                variant="caption"
                style={[styles.actionText, { color: accentColor }]}
              >
                Compartilhar
              </Text>
            </Pressable>

            {isOwner && (
              <Pressable
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDelete(item)}
                disabled={isBusy}
              >
                <Feather name="trash-2" size={16} color="#F87171" />
                <Text
                  variant="caption"
                  style={[styles.actionText, { color: '#F87171' }]}
                >
                  Excluir
                </Text>
              </Pressable>
            )}
          </View>
        </Card>
      )
    },
    [
      actionLoading,
      accentColor,
      borderColor,
      handleDelete,
      handleOpenPlaylist,
      handleShare,
      handleToggleFollow,
      lightTextColor,
      mutedTextColor,
      surfaceColor,
    ],
  )

  const header = (
    <View
      style={[
        styles.header,
        {
          backgroundColor: headerBackground,
          borderColor,
        },
      ]}
    >
      <View style={styles.headerTopRow}>
        <Text
          variant="title"
          style={[styles.headerTitle, { color: lightTextColor }]}
        >
          Playlists de Investimentos
        </Text>
        <Pressable
          onPress={handleCreatePlaylist}
          style={[
            styles.createButton,
            { borderColor: accentColor },
            creating && styles.createButtonDisabled,
          ]}
          disabled={creating}
        >
          <Feather
            name="plus"
            size={18}
            color={creating ? mutedTextColor : accentColor}
          />
        </Pressable>
      </View>

      <View
        style={[
          styles.toggleGroup,
          { backgroundColor: surfaceColor, borderColor },
        ]}
      >
        {toggleOptions.map((option) => {
          const active = viewMode === option.value
          return (
            <Pressable
              key={option.value}
              onPress={() => {
                if (!active) {
                  setViewMode(option.value)
                }
              }}
              style={[
                styles.toggleButton,
                active && { backgroundColor: accentColor },
              ]}
            >
              <Text
                variant="caption"
                style={[
                  styles.toggleLabel,
                  active ? { color: '#0F172A' } : { color: mutedTextColor },
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          )
        })}
      </View>

      <View
        style={[
          styles.searchWrapper,
          { backgroundColor: surfaceColor, borderColor },
        ]}
      >
        <Feather name="search" size={18} color={accentColor} />
        <TextInput
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholder="Buscar playlist pelo nome"
          placeholderTextColor={mutedTextColor}
          style={[styles.searchInput, { color: lightTextColor }]}
        />
      </View>
    </View>
  )

  const listEmptyComponent = (
    <LoadingList
      status={loading ? 'loading' : 'empty'}
      text={loading ? 'Carregando playlists...' : emptyState}
    />
  )

  return (
    <Container
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {header}
      <FlatList
        data={playlists}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderPlaylistItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={listEmptyComponent}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </Container>
  )
}

function buildBadges(item: IPlaylistItem): BadgeInfo[] {
  const badges: BadgeInfo[] = []

  if (item.isCriador) {
    badges.push({
      label: 'Minha playlist',
      color: '#60A5FA',
      background: '#60A5FA22',
    })
  }

  if (item.permiteColaboracao) {
    badges.push({
      label: 'Colaborativa',
      color: '#34D399',
      background: '#34D39922',
    })
  }

  if (item.publica) {
    badges.push({
      label: 'Pública',
      color: '#F2C572',
      background: '#F2C57233',
    })
  } else if (item.privada) {
    badges.push({
      label: 'Privada',
      color: '#F87171',
      background: '#F8717122',
    })
  } else if (item.compartilhada) {
    badges.push({
      label: 'Compartilhada',
      color: '#a855f7',
      background: '#a855f722',
    })
  }

  if (item.isFollowing && !item.isCriador) {
    badges.push({
      label: 'Seguindo',
      color: '#F2C572',
      background: '#F2C57222',
    })
  }

  return badges
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 24,
    paddingTop: 10,
  },
  header: {
    borderRadius: 24,
    borderWidth: 1,
    paddingVertical: 20,
    paddingHorizontal: 16,
    gap: 16,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  toggleGroup: {
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 4,
    gap: 6,
  },
  toggleButton: {
    flex: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  toggleLabel: {
    fontWeight: '600',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 52,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 40,
  },
  cardWrapper: {
    borderRadius: 24,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  cardContent: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 20,
  },
  cardPressable: {
    gap: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
  },
  cardTitleBlock: {
    flex: 1,
    gap: 6,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  metaText: {
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  creatorText: {
    fontSize: 13,
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
  actionsRow: {
    marginTop: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: 'rgba(242, 197, 114, 0.12)',
  },
  actionText: {
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: 'rgba(248, 113, 113, 0.12)',
  },
  separator: {
    height: 16,
  },
})
