import { useMemo, useState } from 'react'
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native'

import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'

import Card from '@/components/Card'
import Container from '@/components/Container'
import Text from '@/components/Text'
import { investmentDetails } from '@/mocks/investmentMocks'
import { selectThemeState } from '@/redux/features/theme/themeSelectors'
import { useAppSelector } from '@/redux/hook'

interface InvestmentItem {
  id: string
  name: string
  symbol: string
  value: number
  variation: number
  category: string
}

const INVESTMENTS: InvestmentItem[] = Object.values(investmentDetails).map(
  (item) => ({
    id: item.id,
    name: item.name,
    symbol: item.name.slice(0, 3).toUpperCase(),
    value: item.value,
    variation: item.variation,
    category: item.category,
  }),
)

export default function InvestmentsPage() {
  const theme = useAppSelector(selectThemeState)
  const colors = theme.colors || {}
  const isDark = theme.mode === 'dark'

  const [query, setQuery] = useState('')
  const [minValue, setMinValue] = useState('')
  const [maxValue, setMaxValue] = useState('')
  const [category, setCategory] = useState('')
  const [variation, setVariation] = useState('')

  const filteredInvestments = useMemo(() => {
    return INVESTMENTS.filter((item) => {
      const matchesQuery = `${item.name} ${item.symbol}`
        .toLowerCase()
        .includes(query.toLowerCase())
      const matchesCategory = category
        ? item.category.toLowerCase().includes(category.toLowerCase())
        : true
      const matchesVariation = variation
        ? item.variation >= parseFloat(variation)
        : true
      const min = minValue ? parseFloat(minValue) : undefined
      const max = maxValue ? parseFloat(maxValue) : undefined
      const matchesPrice =
        (min === undefined || item.value >= min) &&
        (max === undefined || item.value <= max)

      return matchesQuery && matchesCategory && matchesVariation && matchesPrice
    })
  }, [query, category, variation, minValue, maxValue])

  return (
    <Container
      style={StyleSheet.flatten([
        styles.container,
        { backgroundColor: isDark ? '#0b111d' : '#f5f7fb' },
      ])}
    >
      <View style={styles.header}>
        <Text
          style={[styles.headerTitle, { color: colors.grey1 || '#1d2c44' }]}
        >
          Todos os Investimentos
        </Text>
        <Pressable
          style={StyleSheet.flatten([
            styles.headerButton,
            { backgroundColor: isDark ? '#1d2a3b' : '#dce5f4' },
          ])}
        >
          <Feather
            name="sliders"
            size={18}
            color={isDark ? '#d8e6ff' : '#24364c'}
          />
        </Pressable>
      </View>

      <Card contentStyle={styles.searchCard}>
        <View
          style={StyleSheet.flatten([
            styles.searchRow,
            { backgroundColor: isDark ? '#121b2a' : '#e7edfa' },
          ])}
        >
          <Feather
            name="search"
            size={18}
            color={isDark ? '#8fa5c4' : '#42536a'}
          />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar por nome ou simbolo"
            placeholderTextColor={isDark ? '#5f7090' : '#8a9bb5'}
            style={[styles.searchInput, { color: colors.grey1 || '#1d2c44' }]}
          />
        </View>

        <View style={styles.filtersRow}>
          <FilterInput
            label="Min"
            value={minValue}
            onChangeText={setMinValue}
            placeholder="0"
            colors={colors}
            isDark={isDark}
          />
          <FilterInput
            label="Max"
            value={maxValue}
            onChangeText={setMaxValue}
            placeholder="1000"
            colors={colors}
            isDark={isDark}
          />
          <FilterInput
            label="Categoria"
            value={category}
            onChangeText={setCategory}
            placeholder="Setor"
            colors={colors}
            isDark={isDark}
          />
          <FilterInput
            label="Variacao %"
            value={variation}
            onChangeText={setVariation}
            placeholder="0"
            colors={colors}
            isDark={isDark}
          />
        </View>
      </Card>

      <FlatList
        data={filteredInvestments}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => (
          <Card
            style={styles.investmentCard}
            contentStyle={StyleSheet.flatten([
              styles.investmentContent,
              { backgroundColor: isDark ? '#121a2b' : '#ffffff' },
            ])}
            gradientColors={
              item.variation >= 0
                ? ['#1b523d', '#0f2d22']
                : ['#59232d', '#301219']
            }
          >
            <View style={styles.investmentHeader}>
              <View>
                <Text style={[styles.investmentName, { color: '#f3f7ff' }]}>
                  {item.name}
                </Text>
                <Text style={[styles.investmentSymbol, { color: '#c6d2f2' }]}>
                  {item.symbol}
                </Text>
              </View>
              <Pressable onPress={() => handleGoToDetails(item.id)}>
                <Feather name="arrow-right" size={18} color="#e6ecff" />
              </Pressable>
            </View>
            <View style={styles.investmentFooter}>
              <Text style={[styles.investmentValue, { color: '#f3f7ff' }]}>
                {item.value.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </Text>
              <View style={styles.variationRow}>
                <Feather
                  name={item.variation >= 0 ? 'trending-up' : 'trending-down'}
                  size={16}
                  color={item.variation >= 0 ? '#65e0a2' : '#f27c7c'}
                />
                <Text
                  style={StyleSheet.flatten([
                    styles.investmentVariation,
                    { color: item.variation >= 0 ? '#65e0a2' : '#f27c7c' },
                  ])}
                >
                  {item.variation >= 0 ? '+' : ''}
                  {item.variation.toFixed(1)}%
                </Text>
              </View>
            </View>
          </Card>
        )}
      />
    </Container>
  )
}

function handleGoToDetails(id: string) {
  const router = useRouter()
  router.push({
    pathname: '/(app)/investmentDetails',
    params: { id },
  })
}

function FilterInput({
  label,
  value,
  onChangeText,
  placeholder,
  colors,
  isDark,
}: {
  label: string
  value: string
  onChangeText: (text: string) => void
  placeholder: string
  colors: any
  isDark: boolean
}) {
  return (
    <View style={styles.filterBlock}>
      <Text style={[styles.filterLabel, { color: colors.grey2 || '#596a82' }]}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType="numeric"
        placeholderTextColor={isDark ? '#5f7090' : '#8a9bb5'}
        style={StyleSheet.flatten([
          styles.filterInput,
          {
            backgroundColor: isDark ? '#1c2432' : '#e7edf8',
            color: colors.grey1 || '#1d2c44',
          },
        ])}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchCard: {
    borderRadius: 24,
    padding: 16,
    gap: 16,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  filtersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  filterBlock: {
    width: '48%',
    gap: 6,
  },
  filterLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  filterInput: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  list: {
    paddingVertical: 24,
    gap: 12,
  },
  investmentCard: {
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
    backgroundColor: 'transparent',
  },
  investmentContent: {
    borderRadius: 22,
    padding: 18,
    gap: 16,
  },
  investmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  investmentName: {
    fontSize: 16,
    fontWeight: '600',
  },
  investmentSymbol: {
    fontSize: 12,
    letterSpacing: 1,
  },
  investmentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  investmentValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  variationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  investmentVariation: {
    fontSize: 14,
    fontWeight: '600',
  },
})
