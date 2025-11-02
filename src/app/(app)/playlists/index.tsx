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

import Button from '@/components/Button'
import Card from '@/components/Card'
import Container from '@/components/Container'
import LoadingList from '@/components/LoadingList'
import Modal from '@/components/Modal'
import Text from '@/components/Text'
import { selectThemeState } from '@/redux/features/theme/themeSelectors'
import { useAppSelector } from '@/redux/hook'
import api from '@/services/api'
import type { IPlaylistItem } from '@/types/typesCerto'

type ViewMode = 'mine' | 'explore'

export default function PlaylistsPage() {
  const router = useRouter()
  const theme = useAppSelector(selectThemeState)
  const colors = theme.colors || {}
  // const isDark = theme.mode === 'dark'

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
  const [showSearch, setShowSearch] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Form state
  const [formNome, setFormNome] = useState('')
  const [formDescricao, setFormDescricao] = useState('')
  const [formTipo, setFormTipo] = useState<'PUBLICA' | 'PRIVADA'>('PUBLICA')
  const [formPermiteColaboracao, setFormPermiteColaboracao] = useState(true)

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

        await Share.share({ message })
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

  const resetForm = useCallback(() => {
    setFormNome('')
    setFormDescricao('')
    setFormTipo('PUBLICA')
    setFormPermiteColaboracao(true)
  }, [])

  const handleOpenCreateModal = useCallback(() => {
    resetForm()
    setShowCreateModal(true)
  }, [resetForm])

  const handleCloseCreateModal = useCallback(() => {
    setShowCreateModal(false)
    resetForm()
  }, [resetForm])

  const handleCreatePlaylist = useCallback(async () => {
    if (creating) return

    if (!formNome.trim()) {
      Alert.alert('Atenção', 'Por favor, informe um nome para a playlist.')
      return
    }

    setCreating(true)

    try {
      await api.post('/playlists', {
        nome: formNome.trim(),
        descricao: formDescricao.trim(),
        tipo: formTipo,
        permiteColaboracao: formPermiteColaboracao,
      })

      handleCloseCreateModal()

      const targetMode: ViewMode = 'mine'
      const nextSearch = ''

      setViewMode(targetMode)
      setSearchTerm(nextSearch)
      setDebouncedSearch(nextSearch)

      await loadPlaylists(targetMode, nextSearch)
    } catch (error) {
      console.error('Erro ao criar playlist', error)
      Alert.alert('Erro', 'Não foi possível criar a playlist. Tente novamente.')
    } finally {
      setCreating(false)
    }
  }, [
    creating,
    formNome,
    formDescricao,
    formTipo,
    formPermiteColaboracao,
    handleCloseCreateModal,
    loadPlaylists,
  ])

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
        : 'Nenhuma playlist pública encontrada.',
    [viewMode],
  )

  const renderPlaylistItem = useCallback(
    ({ item }: { item: IPlaylistItem }) => {
      const isOwner = item.isCriador
      const canFollow = viewMode === 'explore' && !isOwner
      const isBusy = actionLoading[item.id]

      return (
        <Card style={styles.cardWrapper}>
          <Pressable
            onPress={() => handleOpenPlaylist(item.id)}
            onLongPress={() => {
              if (isOwner) {
                Alert.alert('Ações', `O que deseja fazer com "${item.nome}"?`, [
                  { text: 'Cancelar', style: 'cancel' },
                  {
                    text: 'Compartilhar',
                    onPress: () => handleShare(item),
                  },
                  {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: () => handleDelete(item),
                  },
                ])
              }
            }}
            style={({ pressed }) => [
              styles.playlistCard,
              pressed && styles.playlistCardPressed,
            ]}
          >
            <View style={styles.playlistImageContainer}>
              <View
                style={[
                  styles.playlistImage,
                  { backgroundColor: colors.primary },
                ]}
              >
                <Feather name="trending-up" size={25} color={colors.white} />
              </View>
            </View>

            <View style={styles.playlistInfo}>
              <View style={styles.playlistHeader}>
                <Text
                  variant="body"
                  style={[styles.playlistName, { color: colors.grey1 }]}
                  numberOfLines={1}
                >
                  {item.nome}
                </Text>
                {item.privada && (
                  <Feather name="lock" size={14} color={colors.grey2} />
                )}
                {item.compartilhada && !item.privada && (
                  <Feather name="users" size={14} color={colors.grey2} />
                )}
              </View>

              <View style={styles.playlistMeta}>
                <Text
                  variant="caption"
                  style={[styles.playlistMetaText, { color: colors.grey2 }]}
                  numberOfLines={1}
                >
                  {item.criadorNome}
                </Text>
                <View style={[styles.dot, { backgroundColor: colors.grey2 }]} />
                <Text
                  variant="caption"
                  style={[styles.playlistMetaText, { color: colors.grey2 }]}
                >
                  {item.totalInvestimentos}{' '}
                  {item.totalInvestimentos === 1
                    ? 'investimento'
                    : 'investimentos'}
                </Text>
              </View>

              {canFollow && (
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation()
                    handleToggleFollow(item)
                  }}
                  disabled={isBusy}
                  style={[
                    styles.followButton,
                    item.isFollowing && { backgroundColor: colors.primary },
                    !item.isFollowing && {
                      borderColor: colors.greyOutline,
                      borderWidth: 1,
                    },
                  ]}
                >
                  <Text
                    variant="caption"
                    style={[
                      styles.followButtonText,
                      { color: item.isFollowing ? colors.black : colors.grey2 },
                    ]}
                  >
                    {item.isFollowing ? 'Seguindo' : 'Seguir'}
                  </Text>
                </Pressable>
              )}
            </View>
          </Pressable>
        </Card>
      )
    },
    [
      viewMode,
      actionLoading,
      colors,
      handleOpenPlaylist,
      handleShare,
      handleDelete,
      handleToggleFollow,
    ],
  )

  const header = (
    <View style={[styles.header]}>
      <View style={styles.headerTop}>
        <View style={styles.headerLeft}>
          <Text
            variant="title"
            style={[styles.headerTitle, { color: colors.grey1 }]}
          >
            {viewMode === 'mine' ? 'Sua Biblioteca' : 'Explorar'}
          </Text>
        </View>

        <View style={styles.headerActions}>
          <Pressable
            onPress={() => setShowSearch(!showSearch)}
            style={styles.iconButton}
          >
            <Feather name="search" size={24} color={colors.grey2} />
          </Pressable>
          <Pressable onPress={handleOpenCreateModal} style={styles.iconButton}>
            <Feather name="plus" size={24} color={colors.grey2} />
          </Pressable>
        </View>
      </View>

      {showSearch && (
        <View
          style={[styles.searchContainer, { backgroundColor: colors.grey3 }]}
        >
          <Feather name="search" size={18} color={colors.grey2} />
          <TextInput
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder="Buscar playlists"
            placeholderTextColor={colors.grey2}
            style={[styles.searchInput, { color: colors.grey1 }]}
            autoFocus
          />
          {searchTerm.length > 0 && (
            <Pressable onPress={() => setSearchTerm('')}>
              <Feather name="x" size={18} color={colors.grey2} />
            </Pressable>
          )}
        </View>
      )}

      <View style={styles.filterChips}>
        <Pressable
          onPress={() => setViewMode('mine')}
          style={[
            styles.chip,
            viewMode === 'mine' && [
              styles.chipActive,
              { backgroundColor: colors.primary },
            ],
            viewMode !== 'mine' && { backgroundColor: colors.grey3 },
          ]}
        >
          <Text
            variant="caption"
            style={[
              styles.chipText,
              { color: viewMode === 'mine' ? colors.black : colors.grey1 },
            ]}
          >
            Minhas Playlists
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setViewMode('explore')}
          style={[
            styles.chip,
            viewMode === 'explore' && [
              styles.chipActive,
              { backgroundColor: colors.primary },
            ],
            viewMode !== 'explore' && { backgroundColor: colors.grey3 },
          ]}
        >
          <Text
            variant="caption"
            style={[
              styles.chipText,
              { color: viewMode === 'explore' ? colors.black : colors.grey1 },
            ]}
          >
            Explorar
          </Text>
        </Pressable>
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

      <Modal open={showCreateModal} onClose={handleCloseCreateModal}>
        <View style={styles.modalContent}>
          <Text
            variant="title"
            style={[styles.modalTitle, { color: colors.grey1 }]}
          >
            Nova Playlist
          </Text>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.grey2 }]}>Nome *</Text>
            <TextInput
              value={formNome}
              onChangeText={setFormNome}
              placeholder="Ex: Ações de Tecnologia"
              placeholderTextColor={colors.grey2}
              style={[
                styles.input,
                {
                  backgroundColor: colors.grey3,
                  color: colors.grey1,
                  borderColor: colors.greyOutline,
                },
              ]}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.grey2 }]}>
              Descrição
            </Text>
            <TextInput
              value={formDescricao}
              onChangeText={setFormDescricao}
              placeholder="Descreva o objetivo da playlist"
              placeholderTextColor={colors.grey2}
              multiline
              numberOfLines={3}
              style={[
                styles.input,
                styles.textArea,
                {
                  backgroundColor: colors.grey3,
                  color: colors.grey1,
                  borderColor: colors.greyOutline,
                },
              ]}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.grey2 }]}>Tipo</Text>
            <View style={styles.radioGroup}>
              <Pressable
                onPress={() => setFormTipo('PUBLICA')}
                style={styles.radioOption}
              >
                <View
                  style={[
                    styles.radioCircle,
                    { borderColor: colors.grey2 },
                    formTipo === 'PUBLICA' && {
                      backgroundColor: colors.primary,
                      borderColor: colors.primary,
                    },
                  ]}
                >
                  {formTipo === 'PUBLICA' && (
                    <View
                      style={[
                        styles.radioInner,
                        { backgroundColor: colors.white },
                      ]}
                    />
                  )}
                </View>
                <Text style={{ color: colors.grey1 }}>Pública</Text>
              </Pressable>

              <Pressable
                onPress={() => setFormTipo('PRIVADA')}
                style={styles.radioOption}
              >
                <View
                  style={[
                    styles.radioCircle,
                    { borderColor: colors.grey2 },
                    formTipo === 'PRIVADA' && {
                      backgroundColor: colors.primary,
                      borderColor: colors.primary,
                    },
                  ]}
                >
                  {formTipo === 'PRIVADA' && (
                    <View
                      style={[
                        styles.radioInner,
                        { backgroundColor: colors.white },
                      ]}
                    />
                  )}
                </View>
                <Text style={{ color: colors.grey1 }}>Privada</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Pressable
              onPress={() => setFormPermiteColaboracao(!formPermiteColaboracao)}
              style={styles.checkboxOption}
            >
              <View
                style={[
                  styles.checkbox,
                  { borderColor: colors.grey2 },
                  formPermiteColaboracao && {
                    backgroundColor: colors.primary,
                    borderColor: colors.primary,
                  },
                ]}
              >
                {formPermiteColaboracao && (
                  <Feather name="check" size={14} color={colors.white} />
                )}
              </View>
              <Text style={{ color: colors.grey1 }}>Permite colaboração</Text>
            </Pressable>
          </View>

          <View style={styles.modalActions}>
            <Button
              title="Cancelar"
              onPress={handleCloseCreateModal}
              // variant="outline"
              style={styles.modalButton}
            />
            <Button
              title={creating ? 'Criando...' : 'Criar Playlist'}
              onPress={handleCreatePlaylist}
              // disabled={creating || !formNome.trim()}
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>
    </Container>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 16,
    gap: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  filterChips: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chipActive: {},
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 8,
  },
  cardWrapper: {
    padding: 0,
    overflow: 'hidden',
  },
  playlistCard: {
    flexDirection: 'row',
    padding: 2,
    gap: 12,
  },
  playlistCardPressed: {
    opacity: 0.7,
  },
  playlistImageContainer: {
    justifyContent: 'center',
  },
  playlistImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playlistInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  playlistHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  playlistName: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  playlistMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  playlistMetaText: {
    fontSize: 13,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  followButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  followButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  separator: {
    height: 4,
  },
  modalContent: {
    gap: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  formGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 24,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  checkboxOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  modalButton: {
    flex: 1,
  },
})
