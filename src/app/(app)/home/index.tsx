import { ScrollView, View } from 'react-native'

import Container from '@/components/Container'
import Text from '@/components/Text'
import { investmentList, summary } from '@/mocks/investmentMocks'

import InvestmentListItem from './components/InvestmentListItem'
import InvestmentSummaryCard from './components/InvestmentSummaryCard'

export default function HomePage() {
  return (
    <Container>
      <ScrollView showsVerticalScrollIndicator={false}>
        <InvestmentSummaryCard data={summary} />

        <Text style={{ marginTop: 16, marginBottom: 8, fontWeight: 'bold' }}>
          Top Ações do Dia
        </Text>

        <View style={{ gap: 12 }}>
          {investmentList.map((item) => (
            <InvestmentListItem key={item.id} item={item} />
          ))}
        </View>
      </ScrollView>
    </Container>
  )
}
