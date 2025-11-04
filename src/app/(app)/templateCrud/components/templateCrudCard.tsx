import { useCallback } from 'react'
import type { ReactNode } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'

import { useRouter } from 'expo-router'

import Card from '@/components/Card'
import FeatherIcon from '@/components/FeatherIcon'
import Text from '@/components/Text'
import { ITemplateCrudItem } from '@/types/types'
import { formatDateTimeToBR } from '@/utils/formatValues'

interface TemplateCrudCardProps {
  item: ITemplateCrudItem
  onPress?: () => void
  rightAccessory?: ReactNode
}

export default function TemplateCrudCard({
  item,
  onPress,
  rightAccessory,
}: TemplateCrudCardProps) {
  const router = useRouter()

  const handlePress = useCallback(() => {
    if (onPress) {
      onPress()
      return
    }

    router.push({
      pathname: '/(app)/templateCrud/[id]',
      params: { id: String(item.id) },
    })
  }, [item.id, onPress, router])

  return (
    <Pressable onPress={handlePress} style={styles.pressable}>
      <Card variant="flat" contentStyle={styles.cardContent}>
        <View style={styles.textContainer}>
          <Text variant="subtitle" numberOfLines={1} style={styles.title}>
            {item.nome}
          </Text>
          <Text
            variant="body"
            numberOfLines={2}
            style={styles.description}
            ellipsizeMode="tail"
          >
            {item.descricao || 'Adicione uma descricao para este item.'}
          </Text>
          <Text variant="caption" style={styles.dateLabel}>
            Atualizado em {formatDateTimeToBR(item.updatedAt || '')}
          </Text>
        </View>
        <View style={styles.accessory}>
          {rightAccessory || (
            <FeatherIcon icon="chevron-right" size={18} color="#7b8faa" />
          )}
        </View>
      </Card>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    paddingRight: 16,
  },
  title: {
    fontWeight: '600',
  },
  description: {
    marginTop: 6,
  },
  dateLabel: {
    marginTop: 12,
    color: '#7b8faa',
  },
  accessory: {
    width: 32,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
})
