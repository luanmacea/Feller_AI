import { JSX, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Alert,
  Animated,
  FlatList,
  Pressable,
  Share,
  StyleSheet,
  TextInput,
  View,
} from 'react-native'
import { Swipeable } from 'react-native-gesture-handler'

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
  const swipeableRefs = useRef(new Map<number, Swipeable | null>())

  const accentColor = '#F2C572'
  const headerBackground = isDark ? '#050A1A' : '#111827'
  const surfaceColor = isDark ? '#101726' : '#1F2937'
  const mutedTextColor = isDark ? '#9AA6C9' : '#9CA3AF'
  const lightTextColor = isDark ? '#F8FAFC' : '#F1F5F9'
  const borderColor = isDark
    ? 'rgba(248, 250, 252, 0.06)'
    : 'rgba(15, 23, 42, 0.08)'

  const registerSwipeable = useCallback((id: number, ref: Swipeable | null) => {
    if (ref) {
      swipeableRefs.current.set(id, ref)
    } else {
      swipeableRefs.current.delete(id)
    }
  }, [])

  const closeSwipeable = useCallback((id: number) => {
    const instance = swipeableRefs.current.get(id)
    instance?.close()
  }, [])

  const closeOtherSwipeables = useCallback((currentId: number) => {
    swipeableRefs.current.forEach((instance, key) => {
      if (key !== currentId) {
        instance?.close()
      }
    })
  }, [])

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

  const renderSwipeActions = useCallback(
    (
      item: IPlaylistItem,
      progress: Animated.AnimatedInterpolation<string | number>,
    ) => {
      const isBusy = !!actionLoading[item.id]
      const actions: JSX.Element[] = []

      const shareTranslate = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [80, 0],
      })

      actions.push(
        <Animated.View
          key="share"
          style={[
            styles.swipeAction,
            styles.shareAction,
            { transform: [{ translateX: shareTranslate }] },
          ]}
        >
          <Pressable
            onPress={() => {
              closeSwipeable(item.id)
              handleShare(item)
            }}
            disabled={isBusy}
            style={({ pressed }) => [
              styles.swipeButton,
              pressed && styles.swipeButtonPressed,
              isBusy && styles.swipeButtonDisabled,
            ]}
          >
            <Feather name="share-2" size={20} color="#FFFFFF" />
          </Pressable>
        </Animated.View>,
      )

      if (item.isCriador) {
        const deleteTranslate = progress.interpolate({
          inputRange: [0, 1],
          outputRange: [120, 0],
        })

        actions.push(
          <Animated.View
            key="delete"
            style={[
              styles.swipeAction,
              styles.deleteAction,
              { transform: [{ translateX: deleteTranslate }] },
            ]}
          >
            <Pressable
              onPress={() => {
                closeSwipeable(item.id)
                handleDelete(item)
              }}
              disabled={isBusy}
              style={({ pressed }) => [
                styles.swipeButton,
                pressed && styles.swipeButtonPressed,
                isBusy && styles.swipeButtonDisabled,
              ]}
            >
              <Feather name="trash-2" size={20} color="#FFFFFF" />
            </Pressable>
          </Animated.View>,
        )
      }

      return (
        <View style={styles.swipeActionsWrapper}>
          {actions.map((action, index) => (
            <View
              key={index}
              style={[
                styles.swipeActionSlot,
                index === 0 && styles.swipeActionSlotFirst,
              ]}
            >
              {action}
            </View>
          ))}
        </View>
      )
    },
    [actionLoading, closeSwipeable, handleDelete, handleShare],
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
        ? 'Voce ainda nao possui playlists. Crie a sua com o botao +.'
        : 'Nenhuma playlist publica encontrada. Tente ajustar sua busca.',
    [viewMode],
  )
  const renderPlaylistItem = useCallback(
    ({ item }: { item: IPlaylistItem }) => {
      const isOwner = item.isCriador
      const canFollow = item.publica && !isOwner
      const isBusy = actionLoading[item.id]
      const showPrivateIcon = item.privada
      const showSharedIcon = !showPrivateIcon && item.compartilhada

      return (
        <Swipeable
          ref={(ref: Swipeable | null) => registerSwipeable(item.id, ref)}
          overshootRight={false}
          friction={1.8}
          rightThreshold={40}
          onSwipeableWillOpen={() => closeOtherSwipeables(item.id)}
          renderRightActions={(
            progress: Animated.AnimatedInterpolation<string | number>,
          ) => renderSwipeActions(item, progress)}
        >
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
                  <View style={styles.cardTitleRow}>
                    <Text
                      variant="title"
                      style={[styles.cardTitle, { color: lightTextColor }]}
                      numberOfLines={1}
                    >
                      {item.nome}
                    </Text>
                    {showPrivateIcon && (
                      <Feather
                        name="lock"
                        size={16}
                        color={accentColor}
                        style={styles.statusIcon}
                      />
                    )}
                    {!showPrivateIcon && showSharedIcon && (
                      <Feather
                        name="link"
                        size={16}
                        color={accentColor}
                        style={styles.statusIcon}
                      />
                    )}
                  </View>
                  <Text
                    variant="body"
                    style={[styles.cardDescription, { color: mutedTextColor }]}
                    numberOfLines={2}
                  >
                    {item.descricao || 'Playlist sem descricao.'}
                  </Text>
                </View>
                <Feather name="chevron-right" size={20} color={accentColor} />
              </View>
            </Pressable>

            {canFollow && (
              <View style={styles.actionsRow}>
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
              </View>
            )}
          </Card>
        </Swipeable>
      )
    },
    [
      actionLoading,
      accentColor,
      borderColor,
      handleOpenPlaylist,
      handleToggleFollow,
      lightTextColor,
      mutedTextColor,
      registerSwipeable,
      renderSwipeActions,
      closeOtherSwipeables,
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
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  cardPressable: {
    gap: 12,
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
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusIcon: {
    marginLeft: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  swipeActionsWrapper: {
    height: '100%',
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingRight: 6,
  },
  swipeActionSlot: {
    width: 68,
    height: '100%',
    borderRadius: 22,
    overflow: 'hidden',
    marginLeft: 8,
    alignSelf: 'center',
  },
  swipeActionSlotFirst: {
    marginLeft: 0,
  },
  swipeAction: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareAction: {
    backgroundColor: '#2563EB',
  },
  deleteAction: {
    backgroundColor: '#DC2626',
  },
  swipeButton: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  swipeButtonPressed: {
    opacity: 0.85,
  },
  swipeButtonDisabled: {
    opacity: 0.5,
  },
  actionsRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(242, 197, 114, 0.18)',
  },
  actionText: {
    fontWeight: '600',
  },
  separator: {
    height: 12,
  },
})
