import { useEffect, useState } from 'react'
import { FlatList } from 'react-native'

import Container from '@/components/Container'
import Text from '@/components/Text'
import api from '@/services/api'
import { InvestmentItem } from '@/types/typesCerto'

import InvestmentCard from './components/InvestmentCard'

export default function InvestmentsPage() {
  // const theme = useAppSelector(selectThemeState)

  const [investments, setInvestments] = useState<InvestmentItem[]>([])
  const [loading, setLoading] = useState(true)

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

  // const handleGoToDetails = (id: number) => {
  //   router.push({
  //     pathname: '/(app)/investmentDetails',
  //     params: { id: String(id) },
  //   })
  // }

  return (
    <Container>
      <FlatList
        data={investments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <InvestmentCard item={item} />}
        refreshing={loading}
      />
    </Container>
  )
}
