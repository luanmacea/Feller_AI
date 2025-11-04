import {
  Text,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  ActivityIndicator,
  View,
} from 'react-native'

import { LinearGradient } from 'expo-linear-gradient'

import { selectThemeState } from '@/redux/features/theme/themeSelectors'
import { useAppSelector } from '@/redux/hook'

interface ButtonProps {
  title: string
  onPress: () => void
  style?: ViewStyle
  loading?: boolean
  disabled?: boolean
  variant?: 'filled' | 'outlined'
}

export default function Button({
  title,
  onPress,
  style,
  loading = false,
  disabled = false,
  variant = 'filled',
}: ButtonProps) {
  const theme = useAppSelector(selectThemeState)
  const isDisabled = disabled || loading

  const styles = StyleSheet.create({
    buttonContainer: {
      borderRadius: 8,
      overflow: 'hidden',
      opacity: isDisabled ? 0.6 : 1,
    },
    base: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 8,
      minWidth: 120,
    },
    text: {
      fontSize: 16,
      fontWeight: 'bold',
      color:
        variant === 'filled'
          ? theme.colors?.grey0
          : (theme.colors?.primary ?? '#F7CA02'),
    },
    outlined: {
      borderWidth: 1.5,
      borderColor: theme.colors?.primary ?? '#F7CA02',
      backgroundColor: 'transparent',
    },
  })

  const renderContent = () => {
    if (loading)
      return (
        <ActivityIndicator
          color={
            variant === 'filled'
              ? theme.colors?.grey0
              : (theme.colors?.primary ?? '#F7CA02')
          }
        />
      )
    return <Text style={styles.text}>{title}</Text>
  }

  return (
    <TouchableOpacity
      style={[styles.buttonContainer, style]}
      onPress={!isDisabled ? onPress : undefined}
      activeOpacity={0.8}
      disabled={isDisabled}
    >
      {variant === 'filled' ? (
        <LinearGradient
          colors={[
            theme.colors?.primary ?? '#F7CA02',
            theme.colors?.black ?? '#000000',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1.6, y: 1 }}
          style={styles.base}
        >
          {renderContent()}
        </LinearGradient>
      ) : (
        <View style={[styles.base, styles.outlined]}>{renderContent()}</View>
      )}
    </TouchableOpacity>
  )
}
