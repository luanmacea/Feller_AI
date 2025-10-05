import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { FlatList, Pressable, StyleSheet, View } from 'react-native'

import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import Container from '@/components/Container'
import FeatherIcon from '@/components/FeatherIcon'
import { selectThemeState } from '@/redux/features/theme/themeSelectors'
import { useAppSelector } from '@/redux/hook'
import api from '@/services/api'
import { InvestmentItem } from '@/types/typesCerto'

import InvestmentCard from './components/InvestmentCard'

const InvestmentFilterSchema = z.object({
  nome: z.string().optional(),
  simbolo: z.string().optional(),
  categoria: z.string().optional(),
  risco: z.enum(['baixo', 'medio', 'alto']).optional(),
  precoMin: z.number().optional(),
  precoMax: z.number().optional(),
})

type InvestmentFilter = z.infer<typeof InvestmentFilterSchema>

export default function InvestmentsPage() {
  const theme = useAppSelector(selectThemeState)
  const isDark = theme.mode === 'dark'
  const [investments, setInvestments] = useState<InvestmentItem[]>([])
  const [loading, setLoading] = useState(true)

  const methods = useForm<InvestmentFilter>({
    resolver: zodResolver(InvestmentFilterSchema),
  })

  useEffect(() => {
    const fetchInvestments = async () => {
      try {
        const response = await api.get<InvestmentItem[]>('/investimentos')
        setInvestments(response.data)
      } catch (error) {
        console.error('Erro ao carregar investimentos', error)
      } finally {
        setLoading(false)
      }
    }

    fetchInvestments()
  }, [])

  return (
    <Container>
      <View style={{ width: '100%', alignItems: 'flex-end', marginBottom: 20 }}>
        <Pressable
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
      <FlatList
        data={investments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <InvestmentCard item={item} />}
        refreshing={loading}
      />
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
})
