import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { FlatList, Pressable, StyleSheet, View } from 'react-native'

import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import Button from '@/components/Button'
import Container from '@/components/Container'
import FeatherIcon from '@/components/FeatherIcon'
import InvestmentCard from '@/components/InvestmentCard'
import Modal from '@/components/Modal'
import Text from '@/components/Text'
import { TextInput } from '@/components/TextInput'
import { selectThemeState } from '@/redux/features/theme/themeSelectors'
import { useAppSelector } from '@/redux/hook'
import api from '@/services/api'
import { InvestmentItem } from '@/types/types'

const InvestmentFilterSchema = z.object({
  nome: z.string().optional(),
  simbolo: z.string().optional(),
  categoria: z.string().optional(),
  risco: z.string().optional(),
  precoMin: z.string().optional(),
  precoMax: z.string().optional(),
})

type InvestmentFilter = z.infer<typeof InvestmentFilterSchema>

export default function InvestmentsPage() {
  const theme = useAppSelector(selectThemeState)
  const isDark = theme.mode === 'dark'
  const [investments, setInvestments] = useState<InvestmentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filterVisible, setFilterVisible] = useState(false)

  const methods = useForm<InvestmentFilter>({
    resolver: zodResolver(InvestmentFilterSchema),
  })

  const fetchInvestments = async (filters?: InvestmentFilter) => {
    try {
      setLoading(true)
      const params = Object.fromEntries(
        Object.entries(filters || {}).filter(
          ([_, v]) => v !== undefined && v !== '', //eslint-disable-line
        ),
      )
      const response = await api.get<InvestmentItem[]>('/investimentos', {
        params,
      })
      setInvestments(response.data)
    } catch (error) {
      console.error('Erro ao carregar investimentos', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvestments()
  }, [])

  const onSubmit = (data: InvestmentFilter) => {
    fetchInvestments(data)
    setFilterVisible(false)
  }

  return (
    <Container>
      {/* Botão de filtro */}
      <View style={{ width: '100%', alignItems: 'flex-end', marginBottom: 20 }}>
        <Pressable
          onPress={() => setFilterVisible(true)}
          style={StyleSheet.flatten([
            styles.headerButton,
            { backgroundColor: isDark ? '#1d2a3b' : '#dce5f4' },
          ])}
        >
          <FeatherIcon
            icon="sliders"
            size={18}
            color={isDark ? '#d8e6ff' : '#24364c'}
          />
        </Pressable>
      </View>

      {/* Lista de investimentos */}
      <FlatList
        data={investments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <InvestmentCard item={item} />}
        refreshing={loading}
      />

      {/* Modal de Filtros */}
      <Modal open={filterVisible} onClose={() => setFilterVisible(false)}>
        <View style={styles.modalContainer}>
          <FormProvider {...methods}>
            <Text variant="title" style={styles.modalTitle}>
              Filtrar Investimentos
            </Text>

            <View style={styles.formContent}>
              <TextInput
                name="nome"
                label="Nome"
                placeholder="Digite o nome do ativo"
              />
              <TextInput
                name="simbolo"
                label="Símbolo"
                placeholder="Ex: PETR4"
              />
              <TextInput
                name="categoria"
                label="Categoria"
                placeholder="Ex: Energia, Tech..."
              />
              <TextInput
                name="risco"
                label="Risco"
                placeholder="baixo, médio ou alto"
              />
              <View style={styles.priceRow}>
                <View style={{ flex: 1 }}>
                  <TextInput
                    name="precoMin"
                    label="Preço Mínimo"
                    placeholder="Ex: 10"
                  />
                </View>
                <View style={{ width: 12 }} />
                <View style={{ flex: 1 }}>
                  <TextInput
                    name="precoMax"
                    label="Preço Máximo"
                    placeholder="Ex: 500"
                  />
                </View>
              </View>
            </View>

            <Button
              title="Aplicar Filtros"
              onPress={methods.handleSubmit(onSubmit)}
              style={styles.applyButton}
            />

            <Pressable
              onPress={() => {
                methods.reset()
                fetchInvestments()
                setFilterVisible(false)
              }}
            >
              <Text style={styles.clearText}>Limpar filtros</Text>
            </Pressable>
          </FormProvider>
        </View>
      </Modal>
    </Container>
  )
}

const styles = StyleSheet.create({
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    flex: 1,
    padding: 24,
  },
  modalTitle: {
    marginBottom: 24,
    textAlign: 'center',
  },
  formContent: {
    flexGrow: 1,
    gap: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  applyButton: {
    marginTop: 24,
  },
  clearText: {
    textAlign: 'center',
    color: '#60a5fa',
    marginTop: 16,
    fontSize: 14,
  },
})
