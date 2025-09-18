import { ScrollView, StyleSheet } from 'react-native'

import Container from '@/components/Container'
import Text from '@/components/Text'
import { walletMock } from '@/mocks/investmentMocks'

import ProfitLossChart from './components/profitLossChart'
import WalletOverview from './components/walletOverview'

export default function WalletPage() {
  return (
    <Container>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Saldo</Text>
        <Text style={styles.balance}>${walletMock.balance.toFixed(2)}</Text>

        <ProfitLossChart data={walletMock.history} />

        <Text style={styles.label}>Overview</Text>
        <WalletOverview
          profits={walletMock.profits}
          losses={walletMock.losses}
        />
      </ScrollView>
    </Container>
  )
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    color: '#555',
    marginTop: 16,
  },
  balance: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111',
  },
})
