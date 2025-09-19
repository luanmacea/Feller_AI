import React, { useMemo } from 'react'
import {
  View,
  Pressable,
  StyleSheet,
  FlatList,
  type ListRenderItem,
} from 'react-native'

import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'

import Card from '@/components/Card'
import Container from '@/components/Container'
import Text from '@/components/Text'
import { navigationScreensOptions } from '@/mocks/navigation'
import { logOut } from '@/redux/features/auth/authThunk'
import { selectThemeState } from '@/redux/features/theme/themeSelectors'
import { useAppDispatch, useAppSelector } from '@/redux/hook'
import type { ScreenOption } from '@/types/types'

export default function MenuPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const theme = useAppSelector(selectThemeState)

  const isDark = theme.mode === 'dark'
  const colors = theme.colors

  const itemBackground = useMemo(
    () => (isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(17, 17, 24, 0.04)'),
    [isDark],
  )
  const textColor = colors?.grey1 || (isDark ? '#F7F3E8' : '#1F1F26')
  const iconTint = isDark ? '#F5E3B4' : colors?.primary || '#C99A2E'

  type MenuEntry = [string, ScreenOption]

  const appScreens = Object.entries(navigationScreensOptions)
    .filter(([_, options]) => options.isApp) // eslint-disable-line
    .map(([route, options]) => [route, options] as MenuEntry)

  const handleNavigate = (route: string) => {
    const removeIndex = route.lastIndexOf('/')
    router.push(route.slice(0, removeIndex))
  }

  const handleLogout = () => {
    dispatch(logOut())
    router.replace('loading')
  }

  const renderItem: ListRenderItem<MenuEntry> = ({
    item: [route, options],
  }) => {
    const iconElement = React.isValidElement(options.icon)
      ? React.cloneElement(
          options.icon as React.ReactElement<{ color?: string; size?: number }>,
          {
            color: iconTint,
            size: 22,
          },
        )
      : null

    return (
      <Pressable onPress={() => handleNavigate(route)}>
        <Card
          variant="flat"
          style={styles.menuCard}
          contentStyle={[
            styles.menuContent,
            { backgroundColor: itemBackground },
          ]}
        >
          <View
            style={[
              styles.icon,
              {
                backgroundColor: isDark
                  ? 'rgba(255, 255, 255, 0.07)'
                  : 'rgba(17, 17, 24, 0.08)',
              },
            ]}
          >
            {iconElement}
          </View>
          <Text style={[styles.title, { color: textColor }]}>
            {options.title}
          </Text>
        </Card>
      </Pressable>
    )
  }

  return (
    <Container>
      <FlatList<MenuEntry>
        data={appScreens}
        keyExtractor={([route]) => route}
        contentContainerStyle={styles.list}
        renderItem={renderItem}
        ListFooterComponent={
          <Pressable onPress={() => handleLogout()}>
            <Card
              variant="flat"
              style={styles.menuCard}
              contentStyle={[
                styles.menuContent,
                { backgroundColor: itemBackground },
              ]}
            >
              <View
                style={[
                  styles.icon,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255, 255, 255, 0.07)'
                      : 'rgba(17, 17, 24, 0.08)',
                  },
                ]}
              >
                <Feather name="log-out" size={22} color={iconTint} />
              </View>
              <Text style={[styles.title, { color: textColor }]}>Sair</Text>
            </Card>
          </Pressable>
        }
      />
    </Container>
  )
}

const styles = StyleSheet.create({
  list: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    gap: 16,
  },
  menuCard: {
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
    backgroundColor: 'transparent',
  },
  menuContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 16,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
  },
})
