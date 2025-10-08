import {
  Text,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'

import { LinearGradient } from 'expo-linear-gradient'

import { selectThemeState } from '@/redux/features/theme/themeSelectors'
import { useAppSelector } from '@/redux/hook'

interface ButtonProps {
  title: string
  onPress: () => void
  style?: ViewStyle
  loading?: boolean
}

export default function Button({
  title,
  onPress,
  style,
  loading = false,
}: ButtonProps) {
  const theme = useAppSelector(selectThemeState)

  const styles = StyleSheet.create({
    buttonContainer: {
      borderRadius: 8,
      overflow: 'hidden',
    },
    gradient: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 8,
    },
    text: {
      color: theme.colors?.grey0,
      fontSize: 16,
      fontWeight: 'bold',
    },
  })

  return (
    <TouchableOpacity
      style={[styles.buttonContainer, style]}
      onPress={!loading ? onPress : undefined}
      activeOpacity={0.8}
      disabled={loading}
    >
      <LinearGradient
        colors={[
          theme.colors?.primary ?? '#F7CA02',
          theme.colors?.black ?? '#000000',
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1.4, y: 1 }}
        style={styles.gradient}
      >
        {loading ? (
          <ActivityIndicator color={theme.colors?.grey0} />
        ) : (
          <Text style={styles.text}>{title}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  )
}
