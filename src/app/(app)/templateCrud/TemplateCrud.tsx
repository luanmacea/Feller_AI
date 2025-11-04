import { useCallback, useEffect, useMemo, useState } from 'react'
import { FlatList, StyleSheet, View } from 'react-native'
import type { ListRenderItem } from 'react-native'

import Container from '@/components/Container'
import LoadingList from '@/components/LoadingList'
import Text from '@/components/Text'

import { getTemplateCrud } from './components/requests'
import TemplateCrudCard from './components/templateCrudCard'
import { ITemplateCrudItem } from './components/type'

export default function TemplateCrud() {
  const [templateCrudList, setTemplateCrudList] = useState<ITemplateCrudItem[]>(
    [],
  )
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchTemplateCrud = useCallback(async () => {
    const response = await getTemplateCrud()

    if (response?.status < 300) {
      setTemplateCrudList(Array.isArray(response.data) ? response.data : [])
      return
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      setIsLoading(true)
      await fetchTemplateCrud()
      if (isMounted) {
        setIsLoading(false)
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [fetchTemplateCrud])

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    await fetchTemplateCrud()
    setIsRefreshing(false)
  }, [fetchTemplateCrud])

  const renderItem = useCallback<ListRenderItem<ITemplateCrudItem>>(
    ({ item }) => <TemplateCrudCard item={item} />,
    [],
  )

  const renderListHeader = useMemo(
    () => (
      <View style={styles.header}>
        <Text variant="title">TemplateCrud</Text>
        <Text variant="caption" style={styles.description}>
          Utilize esta tela como base para novos CRUDs. Ajuste os textos, campos
          e requisicoes conforme a necessidade da sua feature.
        </Text>
      </View>
    ),
    [],
  )

  const renderListEmpty = useCallback(() => <LoadingList status="empty" />, [])

  if (isLoading) {
    return <LoadingList />
  }

  return (
    <Container>
      <FlatList
        data={templateCrudList}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderListEmpty}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </Container>
  )
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 16,
  },
  description: {
    color: '#7b8faa',
    marginTop: 4,
  },
  listContent: {
    paddingBottom: 24,
  },
  separator: {
    height: 12,
  },
})
