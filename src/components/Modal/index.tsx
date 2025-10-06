import { ReactNode } from 'react'
import {
  Modal as RNModal,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'

import AntDesign from '@expo/vector-icons/AntDesign'

import { selectThemeState } from '@/redux/features/theme/themeSelectors'
import { useAppSelector } from '@/redux/hook'

type AppModalProps = {
  open: boolean
  onClose: () => void
  children: ReactNode
  showCloseIcon?: boolean
}

export default function Modal({
  open,
  children,
  onClose,
  showCloseIcon = true,
  ...modalProps
}: AppModalProps) {
  const theme = useAppSelector(selectThemeState)

  const overlayBackgroundColor =
    theme.mode === 'dark' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.4)'

  return (
    <RNModal
      transparent
      visible={open}
      animationType="fade"
      onRequestClose={onClose}
      {...modalProps}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View
          style={[styles.overlay, { backgroundColor: overlayBackgroundColor }]}
        />
      </TouchableWithoutFeedback>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.modalContainer]}>
          <ScrollView
            style={[
              styles.content,
              { backgroundColor: theme.colors?.background },
            ]}
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            {showCloseIcon && (
              <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.closeButton}>
                  <AntDesign
                    name="close"
                    size={22}
                    color={theme.colors?.grey1 || '#aaa'}
                  />
                </View>
              </TouchableWithoutFeedback>
            )}
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </RNModal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  modalContainer: {
    flex: 1,
    zIndex: 2,
  },
  content: {
    borderRadius: 16,
    padding: 24,
    width: '95%',
    maxHeight: '85%',
    alignSelf: 'center',
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginBottom: 8,
  },
})
