import React, { useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native'

import { Feather } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'

import Alert from '@/components/Alert'
import Card from '@/components/Card'
import Container from '@/components/Container'
import LoadingList from '@/components/LoadingList'
import Text from '@/components/Text'
import { selectUser } from '@/redux/features/auth/authSelectors'
import { selectThemeState } from '@/redux/features/theme/themeSelectors'
import { useAppSelector } from '@/redux/hook'
import api from '@/services/api'
import type {
  IComment,
  ICommentSection,
  IPlaylistItem,
  InvestmentItem,
} from '@/types/typesCerto'

interface TrendPoint {
  label: string
  value: number
}

const CHART_HEIGHT = 120

const sectorIcons: Record<string, keyof typeof Feather.glyphMap> = {
  RENDA_VARIAVEL: 'trending-up',
  RENDA_FIXA: 'shield',
  INTERNACIONAL: 'globe',
  FUNDO_IMOBILIARIO: 'home',
  CRIPTOMOEDA: 'hexagon',
}

export default function InvestmentDetailsPage() {
  const user = useAppSelector(selectUser)
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id?: string }>()
  const theme = useAppSelector(selectThemeState)
  const colors = theme.colors || {}
  const isDark = theme.mode === 'dark'

  const [alertMessage, setAlertMessage] = useState('')

  const [investment, setInvestment] = useState<InvestmentItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [comments, setComments] = useState<ICommentSection | null>(null)
  const [newComment, setNewComment] = useState('')
  const [replyText, setReplyText] = useState('')
  const [replyTarget, setReplyTarget] = useState<number | null>(null)
  const [playlists, setPlaylists] = useState<IPlaylistItem[]>([])
  const [playlistsLoading, setPlaylistsLoading] = useState(false)
  const [playlistModalVisible, setPlaylistModalVisible] = useState(false)
  const [playlistActionLoading, setPlaylistActionLoading] = useState(false)

  async function fetchUserPlaylists() {
    if (!user?.id) return
    setPlaylistsLoading(true)
    try {
      const response = await api.get<IPlaylistItem[]>('/playlists/minhas')
      setPlaylists(response.data ?? [])
    } catch (error) {
      console.error('Erro ao buscar playlists do usuario', error)
      setPlaylists([])
    } finally {
      setPlaylistsLoading(false)
    }
  }

  useEffect(() => {
    const fetchInvestment = async () => {
      if (!id) {
        setLoading(false)
        return
      }

      try {
        const response = await api.get<InvestmentItem>(`/investimentos/${id}`)
        setInvestment(response.data)
      } catch (error) {
        console.error('Erro ao carregar investimento', error)
        setInvestment(null)
      } finally {
        setLoading(false)
      }
    }

    fetchInvestment()
  }, [id])

  useEffect(() => {
    if (id) fetchComments()
  }, [id])

  useEffect(() => {
    if (user?.id) {
      fetchUserPlaylists()
    }
  }, [user?.id])

  const fetchComments = async () => {
    try {
      const res = await api.get(`/comentarios/investimento/${id}`)
      setComments(res.data)
    } catch (err) {
      console.error('Erro ao buscar comentários', err)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    try {
      await api.post('/comentarios', {
        investimentoId: id,
        conteudo: newComment.trim(),
      })
      setNewComment('')
      fetchComments()
    } catch (err) {
      console.error('Erro ao adicionar comentário', err)
    }
  }

  const handleDeleteComment = async (comentarioId: string) => {
    try {
      await api.delete(`/comentarios/${comentarioId}`)
      if (replyTarget === Number(comentarioId)) {
        setReplyTarget(null)
        setReplyText('')
      }
      fetchComments()
    } catch (err) {
      console.error('Erro ao deletar comentario', err)
    }
  }

  const handleReply = async (comentarioId: number) => {
    if (!replyText.trim()) return
    try {
      await api.post('/comentarios', {
        investimentoId: id,
        conteudo: replyText.trim(),
        comentarioPaiId: comentarioId,
      })
      setReplyText('')
      setReplyTarget(null)
      fetchComments()
    } catch (err) {
      console.error('Erro ao responder comentario', err)
    }
  }

  const handleOpenPlaylistModal = () => {
    if (!playlists.length && !playlistsLoading) {
      fetchUserPlaylists()
    }
    setPlaylistModalVisible(true)
  }

  const handleClosePlaylistModal = () => {
    if (!playlistActionLoading) {
      setPlaylistModalVisible(false)
    }
  }

  const handleRefreshPlaylists = () => {
    if (!playlistsLoading) {
      fetchUserPlaylists()
    }
  }

  const handleAddToPlaylist = async (playlistId: number) => {
    if (!investment?.id) return
    setPlaylistActionLoading(true)
    try {
      await api.post(`/playlists/${playlistId}/investimentos`, {
        investimentoId: investment.id,
      })
      setAlertMessage('Investimento adicionado a playlist.')
      setPlaylistModalVisible(false)
    } catch (error) {
      console.error('Erro ao adicionar investimento na playlist', error)
    } finally {
      setPlaylistActionLoading(false)
    }
  }

  const rootComments = useMemo(
    () =>
      (comments?.comentarios ?? []).filter(
        (comment) => comment.comentarioPaiId === null,
      ),
    [comments],
  )

  const renderReplies = (
    replyList: IComment[] | undefined,
    depth = 1,
  ): React.ReactNode => {
    if (!replyList?.length) return null

    return replyList.map((reply) => {
      const ehAutorResposta = reply.usuarioId === user?.id
      return (
        <View
          key={reply.id}
          style={[
            styles.replyBlock,
            {
              marginLeft: depth * 20,
              borderLeftColor: depth > 1 ? '#4c87ff22' : '#4c87ff44',
              marginBottom: 10,
            },
          ]}
        >
          <View style={styles.commentHeader}>
            <Text variant="subtitle" style={{ fontWeight: 'bold' }}>
              {reply.nomeUsuario}
            </Text>
            <Text variant="caption">{formatDate(reply.dataCriacao)}</Text>
          </View>
          <Text style={styles.commentText}>{reply.conteudo}</Text>
          {ehAutorResposta && (
            <View style={styles.commentActions}>
              <Pressable onPress={() => handleDeleteComment(String(reply.id))}>
                <Text style={[styles.commentAction, { color: '#E15D6E' }]}>
                  Excluir
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      )
    })
  }

  const trendData = useMemo(
    () => buildTrend(investment?.variacaoPercentual ?? 0),
    [investment?.variacaoPercentual],
  )

  if (loading) {
    return <LoadingList text="Carregando detalhes..." status="loading" />
  }

  if (!investment) {
    return <LoadingList text="Investimento nao encontrado." status="empty" />
  }

  const isPositive = investment.variacaoPercentual >= 0
  const sectorIcon = sectorIcons[investment.categoria] || 'bar-chart'
  const highlightColor = isPositive ? '#44C18C' : '#E15D6E'

  const handleTalk = () => {
    router.push({
      pathname: '/(app)/virtual-assistant',
      params: { assetId: String(investment.id) },
    })
  }

  return (
    <Container
      style={StyleSheet.flatten([
        styles.container,
        { backgroundColor: isDark ? '#0b111d' : '#f5f7fb' },
      ])}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <Card
          variant="flat"
          style={styles.headerCard}
          contentStyle={StyleSheet.flatten([
            styles.headerContent,
            { backgroundColor: isDark ? '#131b2d' : '#dfe7f7' },
          ])}
        >
          <View
            style={StyleSheet.flatten([
              styles.headerIcon,
              { backgroundColor: isDark ? '#1e2940' : '#c8d6ef' },
            ])}
          >
            <Feather
              name={sectorIcon}
              size={22}
              color={isDark ? '#dce6ff' : '#1c3259'}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="title">{investment.nome}</Text>
            <Text variant="caption">
              {investment.simbolo} � {investment.categoria.replace('_', ' ')}
            </Text>
            <Text variant="caption">_{investment.descricao}_</Text>
          </View>
        </Card>

        <Card contentStyle={styles.metricsCard}>
          <View style={styles.metricsRow}>
            <MetricBlock
              label="Valor atual"
              value={formatCurrency(investment.precoAtual)}
              color={colors.grey2 || '#f4f7ff'}
            />
            <MetricBlock
              label="Variacao"
              value={`${isPositive ? '+' : ''}${investment.variacaoPercentual.toFixed(2)}%`}
              color={highlightColor}
              icon={isPositive ? 'trending-up' : 'trending-down'}
            />
          </View>
          <View style={styles.metricsRow}>
            <MetricBlock
              label="Atualizado em"
              value={formatDate(investment.updatedAt || investment.data)}
              color={colors.grey2 || '#7b8faa'}
            />
            <MetricBlock
              label="Dividend yield"
              value={`${investment.dividendYield.toFixed(1)}%`}
              color={colors.grey2 || '#7b8faa'}
            />
          </View>
        </Card>

        <Card
          variant="flat"
          style={styles.chartCard}
          contentStyle={StyleSheet.flatten([
            styles.chartContent,
            { backgroundColor: isDark ? '#111827' : '#ffffff' },
          ])}
        >
          <Text
            style={[styles.sectionTitle, { color: colors.grey1 || '#1f2a3d' }]}
          >
            Variacao recente
          </Text>
          <TrendSparkline data={trendData} color={highlightColor} />
          <View style={styles.trendLabels}>
            {trendData.map((point) => (
              <Text
                key={point.label}
                style={[
                  styles.trendLabel,
                  { color: colors.grey2 || '#6f819f' },
                ]}
              >
                {point.label}
              </Text>
            ))}
          </View>
        </Card>

        <Card
          variant="flat"
          style={styles.infoCard}
          contentStyle={StyleSheet.flatten([
            styles.infoContent,
            { backgroundColor: isDark ? '#121a2b' : '#ffffff' },
          ])}
        >
          <InfoRow label="Liquidez" value={investment.liquidez} />
          <InfoRow
            label="Frequencia de dividendo"
            value={`${investment.frequenciaDividendo}x ao ano`}
          />
          <InfoRow label="Risco" value={investment.risco} />
          <InfoRow
            label="Quantidade disponivel"
            value={investment.quantidadeDisponivel.toLocaleString('pt-BR')}
          />
        </Card>

        <Card
          variant="flat"
          style={styles.playlistCard}
          contentStyle={StyleSheet.flatten([
            styles.playlistContent,
            { backgroundColor: isDark ? '#121a2b' : '#ffffff' },
          ])}
        >
          <View style={styles.playlistHeader}>
            <Text
              style={[
                styles.sectionTitle,
                { color: colors.grey1 || '#1f2a3d' },
              ]}
            >
              Playlists
            </Text>
            <Pressable
              style={StyleSheet.flatten([
                styles.playlistActionButton,
                { backgroundColor: colors.primary || '#4c87ff' },
              ])}
              onPress={handleOpenPlaylistModal}
            >
              <Feather name="plus" size={16} color="#f4f7ff" />
              <Text style={styles.playlistActionText}>Adicionar</Text>
            </Pressable>
          </View>
          <Text
            variant="caption"
            style={[
              styles.playlistHintText,
              { color: isDark ? '#9aa6c9' : '#7a8aa6' },
            ]}
          >
            Escolha em qual playlist deseja guardar este investimento.
          </Text>
        </Card>

        <Card
          variant="flat"
          style={styles.commentsCard}
          contentStyle={StyleSheet.flatten([
            styles.commentsContent,
            { backgroundColor: isDark ? '#121a2b' : '#ffffff' },
          ])}
        >
          <Text
            style={[styles.sectionTitle, { color: colors.grey1 || '#1f2a3d' }]}
          >
            Comentários
          </Text>

          {/* Campo de novo comentário */}
          <View style={styles.commentInputContainer}>
            <TextInput
              style={[
                styles.commentInput,
                {
                  color: isDark ? '#fff' : '#000',
                  borderColor: colors.grey3 || '#ccc',
                },
              ]}
              placeholder="Escreva um comentário..."
              placeholderTextColor={isDark ? '#8893ac' : '#7a8aa6'}
              value={newComment}
              onChangeText={setNewComment}
            />
            <Pressable onPress={handleAddComment}>
              <Feather
                name="send"
                size={20}
                color={colors.primary || '#2f60ff'}
              />
            </Pressable>
          </View>

          {/* Lista de comentários */}
          {rootComments.length > 0 ? (
            rootComments.map((comment) => {
              const ehAutor = comment.usuarioId === user?.id
              const isReplying = replyTarget === comment.id
              return (
                <View key={comment.id} style={styles.commentBlock}>
                  <View style={styles.commentHeader}>
                    <Text variant="subtitle" style={{ fontWeight: 'bold' }}>
                      {comment.nomeUsuario}
                    </Text>
                    <Text variant="caption">
                      {formatDate(comment.dataCriacao)}
                    </Text>
                  </View>
                  <Text style={styles.commentText}>{comment.conteudo}</Text>

                  <View style={styles.commentActions}>
                    <Pressable
                      onPress={() => {
                        setReplyText('')
                        setReplyTarget((prev) =>
                          prev === comment.id ? null : comment.id,
                        )
                      }}
                    >
                      <Text style={styles.commentAction}>Responder</Text>
                    </Pressable>
                    {ehAutor && (
                      <Pressable
                        onPress={() => handleDeleteComment(String(comment.id))}
                      >
                        <Text
                          style={[styles.commentAction, { color: '#E15D6E' }]}
                        >
                          Excluir
                        </Text>
                      </Pressable>
                    )}
                  </View>

                  {renderReplies(comment.respostas)}

                  {isReplying && (
                    <View style={styles.replyInputContainer}>
                      <TextInput
                        style={[
                          styles.commentInput,
                          {
                            color: isDark ? '#fff' : '#000',
                            borderColor: colors.grey3 || '#ccc',
                          },
                        ]}
                        placeholder="Escreva uma resposta..."
                        placeholderTextColor={isDark ? '#8893ac' : '#7a8aa6'}
                        value={replyText}
                        onChangeText={setReplyText}
                      />
                      <Pressable onPress={() => handleReply(comment.id)}>
                        <Feather
                          name="send"
                          size={20}
                          color={colors.primary || '#2f60ff'}
                        />
                      </Pressable>
                    </View>
                  )}
                </View>
              )
            })
          ) : (
            <Text
              variant="caption"
              style={{ color: colors.grey4 || '#7a8aa6' }}
            >
              Nenhum comentario ainda.
            </Text>
          )}
        </Card>

        <Pressable onPress={handleTalk} style={{ marginTop: 16 }}>
          <Card
            style={styles.ctaCard}
            gradientColors={['#2f60ff', '#4c87ff']}
            contentStyle={styles.ctaContent}
          >
            <View>
              <Text style={styles.ctaTitle}>
                Conversar com Assistente sobre este ativo
              </Text>
              <Text style={styles.ctaSubtitle}>
                Receba orientacoes personalizadas, tese de investimento e riscos
              </Text>
            </View>
            <Feather name="message-circle" size={20} color="#f4f7ff" />
          </Card>
        </Pressable>
      </ScrollView>

      <Modal
        visible={playlistModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleClosePlaylistModal}
      >
        <View style={styles.playlistModalOverlay}>
          <View
            style={StyleSheet.flatten([
              styles.playlistModalContent,
              { backgroundColor: isDark ? '#0f172a' : '#ffffff' },
            ])}
          >
            <View style={styles.playlistModalHeader}>
              <Text
                variant="title"
                style={[
                  styles.playlistModalTitle,
                  { color: isDark ? '#f4f7ff' : '#1f2a3d' },
                ]}
              >
                Selecionar playlist
              </Text>
              <View style={styles.playlistModalActions}>
                <Pressable
                  onPress={handleRefreshPlaylists}
                  disabled={playlistsLoading}
                  style={StyleSheet.flatten([
                    styles.playlistIconButton,
                    {
                      backgroundColor: isDark ? '#16233a' : '#ecf2ff',
                      opacity: playlistsLoading ? 0.6 : 1,
                    },
                  ])}
                >
                  <Feather
                    name="refresh-cw"
                    size={18}
                    color={playlistsLoading ? '#9aa6c9' : '#4c87ff'}
                  />
                </Pressable>
                <Pressable
                  onPress={handleClosePlaylistModal}
                  style={StyleSheet.flatten([
                    styles.playlistIconButton,
                    { backgroundColor: isDark ? '#16233a' : '#ecf2ff' },
                  ])}
                >
                  <Feather
                    name="x"
                    size={20}
                    color={isDark ? '#f4f7ff' : '#1f2a3d'}
                  />
                </Pressable>
              </View>
            </View>

            {playlistsLoading ? (
              <View style={styles.playlistModalLoading}>
                <ActivityIndicator
                  size="small"
                  color={colors.primary || '#4c87ff'}
                />
                <Text
                  variant="caption"
                  style={[
                    styles.playlistLoadingText,
                    { color: isDark ? '#9aa6c9' : '#7a8aa6' },
                  ]}
                >
                  Carregando playlists...
                </Text>
              </View>
            ) : playlists.length ? (
              <ScrollView
                style={styles.playlistList}
                showsVerticalScrollIndicator={false}
              >
                {playlists.map((playlistItem) => (
                  <Pressable
                    key={playlistItem.id}
                    style={StyleSheet.flatten([
                      styles.playlistItem,
                      {
                        backgroundColor: isDark ? '#0f172a' : '#f4f7ff',
                        borderColor: isDark ? '#2f3b55' : '#d2dcf5',
                      },
                    ])}
                    onPress={() => handleAddToPlaylist(playlistItem.id)}
                    disabled={playlistActionLoading}
                  >
                    <Text
                      style={[
                        styles.playlistItemText,
                        { color: isDark ? '#f4f7ff' : '#1f2a3d' },
                      ]}
                    >
                      {playlistItem.nome}
                    </Text>
                    <Feather name="plus" size={16} color="#4c87ff" />
                  </Pressable>
                ))}
              </ScrollView>
            ) : (
              <Text
                variant="body"
                style={[
                  styles.playlistEmptyText,
                  { color: isDark ? '#9aa6c9' : '#7a8aa6' },
                ]}
              >
                Nenhuma playlist encontrada.
              </Text>
            )}

            {playlistActionLoading && (
              <View style={styles.playlistActionOverlay}>
                <ActivityIndicator size="small" color="#f4f7ff" />
              </View>
            )}
          </View>
        </View>
      </Modal>
      <Alert
        open={!!alertMessage}
        message={alertMessage}
        onClose={() => setAlertMessage('')}
        title="Adicionado à playlist"
        type="success"
      />
    </Container>
  )
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(value: string | undefined) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function buildTrend(variation: number): TrendPoint[] {
  const points: TrendPoint[] = []
  let base = 100
  for (let i = 0; i < 8; i++) {
    const factor = Math.sin(i * 0.8 + variation / 3) * (variation / 6)
    base += factor
    points.push({
      label: `D-${7 - i}`,
      value: parseFloat(base.toFixed(2)),
    })
  }
  return points
}

function TrendSparkline({
  data,
  color,
}: {
  data: TrendPoint[]
  color: string
}) {
  if (data.length === 0) return null
  const values = data.map((p) => p.value)
  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = max - min || 1

  return (
    <View style={styles.sparklineRow}>
      {data.map((point) => {
        const normalized = (point.value - min) / range
        const height = 12 + normalized * 48
        return (
          <View key={point.label} style={styles.sparklineColumn}>
            <View
              style={[styles.sparklineBar, { height, backgroundColor: color }]}
            />
          </View>
        )
      })}
    </View>
  )
}

function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.infoRow}>
      <Text variant="caption">{label}</Text>
      <Text>{value}</Text>
    </View>
  )
}

function MetricBlock({
  label,
  value,
  color,
  icon,
}: {
  label: string
  value: string
  color: string
  icon?: keyof typeof Feather.glyphMap
}) {
  return (
    <View style={styles.metricBlock}>
      <Text style={[styles.metricLabel, { color: '#7b8faa' }]}>{label}</Text>
      <View style={styles.metricValueRow}>
        {icon && (
          <View
            style={[
              styles.metricIconWrapper,
              { backgroundColor: `${color}22` },
            ]}
          >
            <Feather name={icon} size={16} color={color} />
          </View>
        )}
        <Text style={[styles.metricValue, { color }]}>{value}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 0,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  headerCard: {
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
    backgroundColor: 'transparent',
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    gap: 16,
    padding: 20,
    borderRadius: 24,
    alignItems: 'center',
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f3f7ff',
  },
  headerSubtitle: {
    fontSize: 13,
    marginBottom: 6,
    color: '#c7d5f3',
  },
  headerDescription: {
    fontStyle: 'italic',
    fontSize: 13,
    color: '#d8e1f9',
  },
  metricsCard: {
    gap: 16,
    padding: 20,
    borderRadius: 24,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  metricBlock: {
    flex: 1,
    gap: 10,
  },
  metricLabel: {
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metricIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  chartCard: {
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
    backgroundColor: 'transparent',
    marginTop: 16,
  },
  chartContent: {
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 20,
    gap: 16,
  },
  sparklineRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: CHART_HEIGHT,
    gap: 6,
  },
  sparklineColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  sparklineBar: {
    width: 8,
    borderRadius: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  trendLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  trendLabel: {
    fontSize: 11,
  },
  infoCard: {
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
    backgroundColor: 'transparent',
    marginTop: 16,
  },
  infoContent: {
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 20,
    gap: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 13,
    color: '#98a6c4',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f5f7ff',
  },
  playlistCard: {
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
    marginTop: 16,
    backgroundColor: 'transparent',
  },
  playlistContent: {
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 20,
    gap: 12,
  },
  playlistHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playlistActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  playlistActionText: {
    color: '#f4f7ff',
    fontWeight: '600',
    fontSize: 13,
  },
  playlistHintText: {
    color: '#7a8aa6',
  },
  ctaCard: {
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
    backgroundColor: 'transparent',
  },
  ctaContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 22,
    gap: 12,
  },
  ctaTitle: {
    color: '#f4f7ff',
    fontSize: 16,
    fontWeight: '700',
  },
  ctaSubtitle: {
    color: '#dce6ff',
    fontSize: 13,
    marginTop: 4,
  },
  commentsCard: {
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
    marginTop: 16,
  },
  commentsContent: {
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 20,
    gap: 16,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 8,
  },
  commentInput: {
    flex: 1,
    fontSize: 14,
  },
  commentBlock: {
    borderBottomWidth: 1,
    borderBottomColor: '#2a3550',
    paddingBottom: 10,
    marginBottom: 10,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  commentAuthor: {
    fontWeight: '600',
    color: '#cdd7f3',
  },
  commentDate: {
    fontSize: 12,
    color: '#9aa6c9',
  },
  commentText: {
    marginTop: 4,
  },
  commentActions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 6,
    marginBottom: 4,
  },
  commentAction: {
    fontSize: 13,
    color: '#4c87ff',
  },
  replyBlock: {
    marginLeft: 20,
    marginTop: 6,
    borderLeftWidth: 2,
    borderLeftColor: '#4c87ff44',
    paddingLeft: 8,
  },
  replyAuthor: {
    fontWeight: '500',
    color: '#cfd8fa',
  },
  replyText: {
    color: '#e5ebfa',
  },
  replyInputContainer: {
    marginTop: 6,
    marginLeft: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 8,
  },
  playlistModalOverlay: {
    flex: 1,
    backgroundColor: '#00000088',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  playlistModalContent: {
    width: '100%',
    borderRadius: 20,
    padding: 20,
    position: 'relative',
    gap: 12,
  },
  playlistModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playlistModalTitle: {
    fontWeight: '700',
    fontSize: 16,
  },
  playlistModalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playlistIconButton: {
    padding: 8,
    borderRadius: 999,
  },
  playlistModalLoading: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 20,
  },
  playlistLoadingText: {
    color: '#7a8aa6',
  },
  playlistList: {
    maxHeight: 260,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1f2a3d22',
    marginBottom: 10,
  },
  playlistItemText: {
    fontSize: 15,
    color: '#1f2a3d',
  },
  playlistEmptyText: {
    textAlign: 'center',
    color: '#7a8aa6',
    paddingVertical: 12,
  },
  playlistActionOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#00000055',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
