import { View, Text, StyleSheet } from 'react-native'

import { MonthlyReport } from '@/types/types'

interface Props {
  data: MonthlyReport[]
}

export default function ProfitLossChart({ data }: Props) {
  const maxBarHeight = 100
  const maxValue = Math.max(...data.flatMap((d) => [d.profit, d.loss]))

  return (
    <View style={styles.container}>
      <View style={styles.graph}>
        {data.map((item, index) => {
          const profitHeight = (item.profit / maxValue) * maxBarHeight
          const lossHeight = (item.loss / maxValue) * maxBarHeight

          return (
            <View key={index} style={styles.barGroup}>
              <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                  <View
                    style={[
                      styles.bar,
                      styles.profitBar,
                      { height: profitHeight },
                    ]}
                  />
                  <View
                    style={[
                      styles.bar,
                      styles.lossBar,
                      { height: lossHeight, marginLeft: 4 },
                    ]}
                  />
                </View>
              </View>
              <Text style={styles.month}>{item.month}</Text>
            </View>
          )
        })}
      </View>

      <View style={styles.legend}>
        <View style={[styles.dot, { backgroundColor: '#b59a00' }]} />
        <Text style={styles.legendText}>Lucros</Text>
        <View style={[styles.dot, { backgroundColor: '#dbeafe' }]} />
        <Text style={styles.legendText}>Perdas</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 2,
  },
  graph: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 140,
  },
  barGroup: {
    alignItems: 'center',
    gap: 4,
  },
  bar: {
    width: 12,
    borderRadius: 6,
  },
  profitBar: {
    backgroundColor: '#b59a00',
  },
  lossBar: {
    backgroundColor: '#dbeafe',
    marginTop: 4,
  },
  month: {
    fontSize: 10,
    color: '#555',
    marginTop: 6,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
    marginTop: 16,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#333',
    marginRight: 12,
  },
})
