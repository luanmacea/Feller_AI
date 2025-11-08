import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native'

import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'

import Alert from '@/components/Alert'
import Button from '@/components/Button'
import Card from '@/components/Card'
import Container from '@/components/Container'
import LoadingList from '@/components/LoadingList'
import Modal from '@/components/Modal'
import Text from '@/components/Text'
import { selectThemeState } from '@/redux/features/theme/themeSelectors'
import { useAppSelector } from '@/redux/hook'
import api from '@/services/api'
import { IRecommendedInvestment } from '@/types/types'

type TipoRetorno = 'curto' | 'medio' | 'longo' | undefined
type TipoCarteira = 'Tipo1' | 'Tipo2' | 'Tipo3' | undefined

type Carteira = IRecommendedInvestment['carteira']
type CarteiraKey = keyof Carteira

const CATEGORIES_ORDER: CarteiraKey[] = [
  'renda_fixa',
  'tesouro_direto',
  'fundos_imobiliarios',
  'acoes',
  'criptomoedas',
]

export default function RecommendedWalletPage() {
  const router = useRouter()
  const theme = useAppSelector(selectThemeState)
  const isDark = theme.mode === 'dark'
  const colors = theme.colors || {}

  const [carteiraData, setCarteiraData] =
    useState<IRecommendedInvestment | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [mounting, setMounting] = useState(false)
  const [alertVisible, setAlertVisible] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertTitle, setAlertTitle] = useState('')
  const [alertType, setAlertType] = useState<'success' | 'error' | 'warning'>(
    'success',
  )

  const [updateWallet, setUpdateWallet] = useState(true)

  // Estados do modal
  const [modalVisible, setModalVisible] = useState(false)
  const [capital, setCapital] = useState('10000')
  const [retorno, setRetorno] = useState<TipoRetorno>(undefined)
  const [tipoCarteira, setTipoCarteira] = useState<TipoCarteira>(undefined)

  function normalizeCarteiraPercentuais(carteira: Carteira): Carteira {
    const entries = CATEGORIES_ORDER.filter((k) => carteira[k]).map(
      (k) => [k, carteira[k]] as const,
    )

    const nullKeys: CarteiraKey[] = []
    let sumFilled = 0

    for (const [key, obj] of entries) {
      const p = obj.porcentagem
      if (p === null || p === undefined) nullKeys.push(key)
      else sumFilled += p
    }

    let missing = 100 - sumFilled
    if (missing < 0) missing = 0

    const newCarteira: Carteira = { ...carteira }

    // Caso normal: há algo a distribuir entre nulos
    if (missing > 0 && nullKeys.length > 0) {
      const perNull = missing / nullKeys.length
      for (const key of nullKeys) {
        newCarteira[key] = {
          ...newCarteira[key],
          porcentagem: Number(perNull.toFixed(2)),
        }
      }
    }

    // Regra do roubo: faltava 0 e existe(m) nulo(s) -> rouba 10pp do maior
    if (missing === 0 && nullKeys.length > 0) {
      // acha maior entre os preenchidos
      let maxKey: CarteiraKey | null = null
      let maxVal = -Infinity

      for (const [key, obj] of entries) {
        const p = obj.porcentagem
        if (p !== null && p !== undefined && p > maxVal) {
          maxVal = p
          maxKey = key
        }
      }

      if (maxKey) {
        const totalSteal = Math.min(10, newCarteira[maxKey].porcentagem ?? 0) // evita negativo
        const perNull = totalSteal / nullKeys.length

        // subtrai do maior
        newCarteira[maxKey] = {
          ...newCarteira[maxKey],
          porcentagem: Number(
            ((newCarteira[maxKey].porcentagem ?? 0) - totalSteal).toFixed(2),
          ),
        }

        // reparte entre nulos
        for (const key of nullKeys) {
          const curr = newCarteira[key].porcentagem ?? 0
          newCarteira[key] = {
            ...newCarteira[key],
            porcentagem: Number((curr + perNull).toFixed(2)),
          }
        }
      }
    }

    // Ajuste fino de arredondamento para garantir soma == 100
    const newSum = CATEGORIES_ORDER.reduce(
      (acc, k) => acc + (newCarteira[k]?.porcentagem ?? 0),
      0,
    )
    const diff = Number((100 - newSum).toFixed(2))
    if (Math.abs(diff) >= 0.01) {
      // aplica o ajuste na última chave não-nula (ou no último nulo se houver)
      const candidates = [...CATEGORIES_ORDER].filter((k) => newCarteira[k])
      const targetKey =
        nullKeys.length > 0
          ? nullKeys[nullKeys.length - 1]
          : candidates[candidates.length - 1]

      newCarteira[targetKey] = {
        ...newCarteira[targetKey],
        porcentagem: Number(
          ((newCarteira[targetKey].porcentagem ?? 0) + diff).toFixed(2),
        ),
      }
    }

    return newCarteira
  }

  const fetchRecommendations = useCallback(async () => {
    if (!refreshing) setLoading(true)
    try {
      const { data } = await api.get<IRecommendedInvestment>(
        '/investimentos/recomendados/enriquecidos',
      )

      const carteiraNormalizada = normalizeCarteiraPercentuais(data.carteira)

      setCarteiraData({ ...data, carteira: carteiraNormalizada })
    } catch (error) {
      console.error('Erro ao buscar carteira recomendada', error)
      setCarteiraData(null)
    } finally {
      setLoading(false)
      setRefreshing(false)
      setUpdateWallet(false)
    }
  }, [refreshing])

  useEffect(() => {
    if (!updateWallet) return
    fetchRecommendations()
  }, [fetchRecommendations, updateWallet])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchRecommendations()
  }

  const handleOpenModal = () => {
    setModalVisible(true)
  }

  const handleCloseModal = () => {
    setModalVisible(false)
    // Reset para valores padrão
    setCapital('10000')
    setRetorno(undefined)
    setTipoCarteira(undefined)
  }

  const handleBuildWallet = async () => {
    if (mounting) return

    const capitalNumerico = parseFloat(capital) || 10000

    if (capitalNumerico < 100) {
      setAlertTitle('Atenção')
      setAlertMessage('O capital mínimo deve ser de R$ 100,00')
      setAlertType('warning')
      setAlertVisible(true)
      return
    }

    setMounting(true)
    setModalVisible(false)

    // try {
    const payload: any = {
      capital: capitalNumerico,
    }

    if (retorno) payload.retorno = retorno
    if (tipoCarteira) payload.tipo = tipoCarteira

    console.log('Payload para montar carteira:', payload)
    const response = await api.post(
      '/feller/montar-carteira-recomendada',
      payload,
    )

    if (response.status < 300) {
      setAlertTitle('Sucesso')
      setAlertMessage('Carteira montada com sucesso!')
      setAlertType('success')
      setAlertVisible(true)
      setUpdateWallet(true)
      setCapital('10000')
      setRetorno(undefined)
      setTipoCarteira(undefined)
    }

    setMounting(false)
    // }
  }

  // Preparar dados da carteira para renderização
  const categorias = useMemo(() => {
    if (!carteiraData?.carteira) return []

    const categoriasMap = {
      renda_fixa: { nome: 'Renda Fixa', icon: 'trending-up', color: '#10b981' },
      tesouro_direto: {
        nome: 'Tesouro Direto',
        icon: 'shield',
        color: '#3b82f6',
      },
      fundos_imobiliarios: {
        nome: 'Fundos Imobiliários',
        icon: 'home',
        color: '#8b5cf6',
      },
      acoes: { nome: 'Ações', icon: 'activity', color: '#f59e0b' },
      criptomoedas: { nome: 'Criptomoedas', icon: 'zap', color: '#ef4444' },
    }

    return Object.entries(carteiraData.carteira)
      .filter(([_, data]) => data && data.investimentos.length > 0) //eslint-disable-line
      .map(([key, data]) => ({
        key,
        ...categoriasMap[key as keyof typeof categoriasMap],
        ...data,
      }))
  }, [carteiraData])

  if (loading && !refreshing) {
    return <LoadingList text="Carregando carteira recomendada..." />
  }

  return (
    <Container style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary || '#4c87ff'}
          />
        }
      >
        {/* Header */}
        <Card
          variant="flat"
          style={styles.headerCard}
          contentStyle={StyleSheet.flatten([
            styles.headerContent,
            { backgroundColor: isDark ? '#0f1828' : '#ffffff' },
          ])}
        >
          <View style={styles.headerTopRow}>
            <View style={{ flex: 1 }}>
              <Text
                variant="title"
                style={{ color: colors.grey1 || '#1f2a3d', fontSize: 24 }}
              >
                Carteira Recomendada
              </Text>
              <Text
                variant="caption"
                style={{ color: isDark ? '#9aaecb' : '#5c6f90', marginTop: 4 }}
              >
                Sugestões personalizadas para o seu perfil
              </Text>
            </View>
          </View>

          <Pressable
            onPress={handleOpenModal}
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
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Feather name="sliders" size={18} color="#ffffff" />
                <Text style={styles.buildButtonText}>Montar Carteira</Text>
              </>
            )}
          </Pressable>
        </Card>

        {/* Distribuição da Carteira */}
        {categorias.length > 0 ? (
          <>
            {/* Gráfico de Distribuição */}
            <Card
              variant="flat"
              style={styles.card}
              contentStyle={StyleSheet.flatten([
                styles.cardContent,
                { backgroundColor: isDark ? '#0f1828' : '#ffffff' },
              ])}
            >
              <Text
                variant="subtitle"
                style={{ color: colors.grey1, marginBottom: 16 }}
              >
                Distribuição Recomendada
              </Text>

              <View style={styles.chartContainer}>
                {categorias.map((cat, index) => (
                  <View
                    key={cat.key}
                    style={[
                      styles.chartBar,
                      {
                        width: `${cat.porcentagem}%`,
                        backgroundColor: cat.color,
                        borderTopLeftRadius: index === 0 ? 8 : 0,
                        borderBottomLeftRadius: index === 0 ? 8 : 0,
                        borderTopRightRadius:
                          index === categorias.length - 1 ? 8 : 0,
                        borderBottomRightRadius:
                          index === categorias.length - 1 ? 8 : 0,
                      },
                    ]}
                  />
                ))}
              </View>

              <View style={styles.legendContainer}>
                {categorias.map((cat) => (
                  <View key={cat.key} style={styles.legendItem}>
                    <View
                      style={[styles.legendDot, { backgroundColor: cat.color }]}
                    />
                    <Text
                      variant="caption"
                      style={{ color: isDark ? '#9aaecb' : '#5c6f90' }}
                    >
                      {cat.nome} ({cat.porcentagem}%)
                    </Text>
                  </View>
                ))}
              </View>
            </Card>

            {/* Categorias */}
            {categorias.map((categoria) => (
              <Card
                key={categoria.key}
                variant="flat"
                style={styles.card}
                contentStyle={StyleSheet.flatten([
                  styles.cardContent,
                  { backgroundColor: isDark ? '#0f1828' : '#ffffff' },
                ])}
              >
                <View style={styles.categoriaHeader}>
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: `${categoria.color}20` },
                    ]}
                  >
                    <Feather
                      name={categoria.icon as any}
                      size={20}
                      color={categoria.color}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text variant="subtitle" style={{ color: colors.grey1 }}>
                      {categoria.nome}
                    </Text>
                    <Text
                      variant="caption"
                      style={{ color: isDark ? '#9aaecb' : '#5c6f90' }}
                    >
                      {categoria.porcentagem}% da carteira
                    </Text>
                  </View>
                </View>

                {/* Investimentos */}
                <View style={styles.investimentosContainer}>
                  {categoria.investimentos.map((inv) => (
                    <Pressable
                      key={inv.id}
                      onPress={() => {
                        router.push({
                          pathname: '/(app)/investmentDetails',
                          params: { id: String(inv.id) },
                        })
                      }}
                      style={StyleSheet.flatten([
                        styles.investimentoItem,
                        { backgroundColor: isDark ? '#1a2537' : '#f8fafc' },
                      ])}
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          variant="body"
                          style={{ color: colors.grey1, fontWeight: '600' }}
                          numberOfLines={1}
                        >
                          {inv.simbolo}
                        </Text>
                        <Text
                          variant="caption"
                          style={{
                            color: isDark ? '#9aaecb' : '#5c6f90',
                            marginTop: 2,
                          }}
                          numberOfLines={1}
                        >
                          {inv.nome}
                        </Text>
                      </View>

                      <View style={{ alignItems: 'flex-end' }}>
                        <Text
                          variant="body"
                          style={{
                            color:
                              inv.variacaoPercentual >= 0
                                ? '#10b981'
                                : '#ef4444',
                            fontWeight: '600',
                          }}
                        >
                          {inv.variacaoPercentual >= 0 ? '+' : ''}
                          {inv.variacaoPercentual.toFixed(2)}%
                        </Text>
                        <Text
                          variant="caption"
                          style={{ color: isDark ? '#9aaecb' : '#5c6f90' }}
                        >
                          R$ {inv.precoAtual.toFixed(2)}
                        </Text>
                      </View>

                      <Feather
                        name="chevron-right"
                        size={18}
                        color={isDark ? '#9aaecb' : '#5c6f90'}
                      />
                    </Pressable>
                  ))}
                </View>
              </Card>
            ))}
          </>
        ) : (
          <Card
            variant="flat"
            style={styles.emptyCard}
            contentStyle={StyleSheet.flatten([
              styles.emptyContent,
              { backgroundColor: isDark ? '#0f1828' : '#ffffff' },
            ])}
          >
            <Feather
              name="inbox"
              size={48}
              color={isDark ? '#7c8dab' : '#6880a8'}
            />
            <Text
              variant="subtitle"
              style={{
                textAlign: 'center',
                color: colors.grey1,
                marginTop: 16,
              }}
            >
              Nenhuma carteira montada
            </Text>
            <Text
              variant="body"
              style={{
                textAlign: 'center',
                color: isDark ? '#9aaecb' : '#5a6f90',
                marginTop: 8,
              }}
            >
              Clique em "Montar Carteira" para receber sugestões personalizadas
              de investimentos
            </Text>
          </Card>
        )}
      </ScrollView>

      {/* Modal de Configuração */}
      <Modal open={modalVisible} onClose={handleCloseModal}>
        <View style={styles.modalHeader}>
          <Text variant="title" style={{ color: colors.grey1, fontSize: 20 }}>
            Configurar Carteira
          </Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Capital */}
          <View style={styles.formGroup}>
            <Text
              variant="body"
              style={{ color: colors.grey1, fontWeight: '600' }}
            >
              Capital para Investir *
            </Text>
            <Text
              variant="caption"
              style={{
                color: isDark ? '#9aaecb' : '#5c6f90',
                marginTop: 4,
              }}
            >
              Valor mínimo: R$ 100,00
            </Text>
            <TextInput
              style={StyleSheet.flatten([
                styles.input,
                {
                  backgroundColor: isDark ? '#1a2537' : '#f8fafc',
                  color: colors.grey1,
                  borderColor: isDark ? '#2a3b52' : '#e2e8f0',
                },
              ])}
              value={capital}
              onChangeText={setCapital}
              keyboardType="numeric"
              placeholder="10000"
              placeholderTextColor={isDark ? '#7c8dab' : '#94a3b8'}
            />
          </View>

          {/* Prazo de Retorno */}
          <View style={styles.formGroup}>
            <Text
              variant="body"
              style={{ color: colors.grey1, fontWeight: '600' }}
            >
              Prazo de Retorno (opcional)
            </Text>
            <Text
              variant="caption"
              style={{
                color: isDark ? '#9aaecb' : '#5c6f90',
                marginTop: 4,
              }}
            >
              Quando você deseja resgatar?
            </Text>
            <View style={styles.optionsContainer}>
              {(['curto', 'medio', 'longo'] as const).map((option) => (
                <Pressable
                  key={option}
                  onPress={() =>
                    setRetorno(retorno === option ? undefined : option)
                  }
                  style={StyleSheet.flatten([
                    styles.optionButton,
                    {
                      backgroundColor:
                        retorno === option
                          ? colors.primary || '#4c87ff'
                          : isDark
                            ? '#1a2537'
                            : '#f8fafc',
                      borderColor:
                        retorno === option
                          ? colors.primary || '#4c87ff'
                          : isDark
                            ? '#2a3b52'
                            : '#e2e8f0',
                    },
                  ])}
                >
                  <Text
                    variant="body"
                    style={{
                      color: retorno === option ? '#ffffff' : colors.grey1,
                      fontWeight: retorno === option ? '600' : '400',
                      fontSize: 12,
                    }}
                  >
                    {option === 'curto'
                      ? 'Curto'
                      : option === 'medio'
                        ? 'Médio'
                        : 'Longo'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Tipo de Carteira */}
          <View style={styles.formGroup}>
            <Text
              variant="body"
              style={{ color: colors.grey1, fontWeight: '600' }}
            >
              Tipo de Carteira (opcional)
            </Text>
            <Text
              variant="caption"
              style={{
                color: isDark ? '#9aaecb' : '#5c6f90',
                marginTop: 4,
              }}
            >
              Selecione os tipos de investimentos
            </Text>

            {(['Tipo1', 'Tipo2', 'Tipo3'] as const).map((tipo) => (
              <Pressable
                key={tipo}
                onPress={() =>
                  setTipoCarteira(tipoCarteira === tipo ? undefined : tipo)
                }
                style={StyleSheet.flatten([
                  styles.tipoButton,
                  {
                    backgroundColor:
                      tipoCarteira === tipo
                        ? `${colors.primary || '#4c87ff'}15`
                        : isDark
                          ? '#1a2537'
                          : '#f8fafc',
                    borderColor:
                      tipoCarteira === tipo
                        ? colors.primary || '#4c87ff'
                        : isDark
                          ? '#2a3b52'
                          : '#e2e8f0',
                  },
                ])}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    variant="body"
                    style={{
                      color: colors.grey1,
                      fontWeight: tipoCarteira === tipo ? '600' : '400',
                    }}
                  >
                    {tipo === 'Tipo1'
                      ? 'Básica'
                      : tipo === 'Tipo2'
                        ? 'Intermediária'
                        : 'Avançada'}
                  </Text>
                  <Text
                    variant="caption"
                    style={{
                      color: isDark ? '#9aaecb' : '#5c6f90',
                      marginTop: 2,
                    }}
                  >
                    {tipo === 'Tipo1'
                      ? 'Renda Fixa + Tesouro Direto'
                      : tipo === 'Tipo2'
                        ? 'RF + TD + Ações + FIIs'
                        : 'RF + TD + Ações + FIIs + Cripto'}
                  </Text>
                </View>
                {tipoCarteira === tipo && (
                  <Feather
                    name="check-circle"
                    size={20}
                    color={colors.primary || '#4c87ff'}
                  />
                )}
              </Pressable>
            ))}
          </View>
          <View style={styles.modalActions}>
            <Button
              variant="outlined"
              onPress={handleCloseModal}
              title="Cancelar"
            />
            <Button onPress={handleBuildWallet} title="Montar Carteira" />
          </View>
        </ScrollView>
      </Modal>

      <Alert
        open={alertVisible}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
        onClose={() => setAlertVisible(false)}
      />
    </Container>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerCard: {
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
    backgroundColor: 'transparent',
    marginBottom: 16,
  },
  headerContent: {
    borderRadius: 20,
    padding: 20,
    gap: 16,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  buildButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buildButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  card: {
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
    backgroundColor: 'transparent',
    marginBottom: 16,
  },
  cardContent: {
    borderRadius: 20,
    padding: 20,
  },
  chartContainer: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  chartBar: {
    height: '100%',
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoriaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a253720',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  investimentosContainer: {
    gap: 12,
  },
  investimentoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
  },
  emptyCard: {
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
    backgroundColor: 'transparent',
    marginTop: 32,
  },
  emptyContent: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 24,
    padding: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 24,
  },
  input: {
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  optionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  tipoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginTop: 8,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {},
  confirmButton: {},
})
