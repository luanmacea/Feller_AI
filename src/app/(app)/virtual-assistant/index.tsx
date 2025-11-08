import { useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native'

import { Feather } from '@expo/vector-icons'

import Card from '@/components/Card'
import Container from '@/components/Container'
import Text from '@/components/Text'
import { selectThemeState } from '@/redux/features/theme/themeSelectors'
import { useAppSelector } from '@/redux/hook'
import api from '@/services/api'

interface Message {
  id: string
  role: 'assistant' | 'user'
  content: string
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content:
      'Ola! Sou o seu **Assistente Virtual**. Vou analisar sua carteira e propor ajustes para maximizar ganhos mantendo o seu perfil moderado.',
  },
]

function MarkdownText({ text, color }: { text: string; color: string }) {
  return (
    <View style={{ gap: 4 }}>
      {text.split(/\n+/).map((line, index) => {
        const isBullet = /^[-]/.test(line)
        const trimmed = line.replace(/^[-]\s*/, '')
        const segments = trimmed.split(/(\*\*[^*]+\*\*)/g).filter(Boolean)

        const rendered = segments.map((segment, idx) => {
          if (segment.startsWith('**') && segment.endsWith('**')) {
            const boldText = segment.slice(2, -2)
            return (
              <Text key={idx} style={[styles.bold, { color }]}>
                {' '}
                {boldText}
              </Text>
            )
          }
          return (
            <Text key={idx} style={{ color }}>
              {segment}
            </Text>
          )
        })

        if (isBullet) {
          return (
            <View key={index} style={styles.bulletRow}>
              <Text style={[styles.bulletDot, { color }]}>-</Text>
              <Text style={{ color }}>{rendered}</Text>
            </View>
          )
        }

        return (
          <Text key={index} style={{ color }}>
            {rendered}
          </Text>
        )
      })}
    </View>
  )
}

function MessageBubble({
  message,
  colorScheme,
}: {
  message: Message
  colorScheme: ReturnType<typeof useMessageColors>
}) {
  const { background, textColor, align, textSecondary } = colorScheme
  return (
    <View
      style={[
        styles.messageRow,
        align === 'flex-end' && { justifyContent: 'flex-end' },
      ]}
    >
      <Card
        variant="flat"
        style={styles.bubbleCard}
        contentStyle={[styles.bubbleContent, { backgroundColor: background }]}
      >
        <MarkdownText text={message.content} color={textColor} />
        {message.role === 'assistant' && (
          <Text style={[styles.metadata, { color: textSecondary }]}>
            Assistente Virtual
          </Text>
        )}
      </Card>
    </View>
  )
}

function useMessageColors(role: Message['role'], isDark: boolean) {
  if (role === 'assistant') {
    return {
      background: isDark ? '#1f2a44' : '#E0ECFF',
      textColor: isDark ? '#D9E6FF' : '#1B2B4B',
      textSecondary: isDark ? '#9CB5DD' : '#50658A',
      align: 'flex-start' as const,
    }
  }
  return {
    background: isDark ? '#354154' : '#DDE4F2',
    textColor: isDark ? '#F2F5FF' : '#1F2D3D',
    textSecondary: isDark ? '#A4B1C5' : '#5B6B7D',
    align: 'flex-end' as const,
  }
}

export default function RecommendationsPage() {
  const theme = useAppSelector(selectThemeState)
  const isDark = theme.mode === 'dark'

  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)

  const appendMessage = (message: Message) => {
    setMessages((prev) => [message, ...prev])
  }

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed || isSending) return

    const userMessage: Message = {
      id: `${Date.now()}-user`,
      role: 'user',
      content: trimmed,
    }

    appendMessage(userMessage)
    setInput('')
    setIsSending(true)

    try {
      const { data } = await api.post<{ response: string; timestamp: number }>(
        '/feller/chat',
        { prompt: trimmed },
      )

      appendMessage({
        id: `${data.timestamp}-${Math.random()}`,
        role: 'assistant',
        content: data.response,
      })
    } catch (error) {
      console.error('Erro ao enviar mensagem para o assistente', error)
      appendMessage({
        id: `${Date.now()}-error`,
        role: 'assistant',
        content:
          'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente em instantes.',
      })
    } finally {
      setIsSending(false)
    }
  }
  // if (!input) {
  //   return (
  //     <Container style={{ justifyContent: 'center', alignItems: 'center' }}>
  //       <Card>
  //         <Text variant="title">Recomendações</Text>
  //         <Text style={{ textAlign: 'center', lineHeight: 20 }}>
  //           Em breve voce vera aqui sugestoes personalizadas do assistente para
  //           ajustar sua carteira com base no seu perfil de risco e objetivos.
  //         </Text>
  //       </Card>
  //     </Container>
  //   )
  // }
  return (
    <Container
      style={{
        ...styles.container,
      }}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        <Card
          variant="flat"
          style={styles.headerCard}
          contentStyle={[
            styles.headerContent,
            { backgroundColor: isDark ? '#14213b' : '#dce9ff' },
          ]}
        >
          <View style={styles.headerRow}>
            <View style={styles.headerIconWrapper}>
              <Feather
                name="cpu"
                size={20}
                color={isDark ? '#D9E6FF' : '#1C3A68'}
              />
            </View>
            <View>
              <Text
                style={[
                  styles.headerTitle,
                  { color: isDark ? '#F3F7FF' : '#1A2C4A' },
                ]}
              >
                Assistente Virtual
              </Text>
              <Text
                style={[
                  styles.headerSubtitle,
                  { color: isDark ? '#9BB3D6' : '#4F678A' },
                ]}
              >
                Insights personalizados em segundos
              </Text>
            </View>
          </View>
        </Card>

        <FlatList
          style={styles.flex}
          contentContainerStyle={styles.messagesContent}
          data={messages}
          inverted
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              colorScheme={useMessageColors(item.role, isDark)}
            />
          )}
        />

        {isSending && (
          <View style={styles.typingRow}>
            <Card
              variant="flat"
              style={styles.bubbleCard}
              contentStyle={[
                styles.bubbleContent,
                { backgroundColor: isDark ? '#1f2a44' : '#E0ECFF' },
              ]}
            >
              <View style={styles.typingIndicator}>
                <ActivityIndicator
                  size="small"
                  color={isDark ? '#D9E6FF' : '#1B2B4B'}
                />
                <Text
                  style={[
                    styles.typingText,
                    { color: isDark ? '#D9E6FF' : '#1B2B4B' },
                  ]}
                >
                  Assistente digitando...
                </Text>
              </View>
              <Text
                style={[
                  styles.metadata,
                  { color: isDark ? '#9CB5DD' : '#50658A' },
                ]}
              >
                Assistente Virtual
              </Text>
            </Card>
          </View>
        )}

        <Card
          variant="flat"
          style={styles.inputWrapper}
          contentStyle={[
            styles.inputContent,
            { backgroundColor: isDark ? '#1a2333' : '#ffffff' },
          ]}
        >
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Pergunte sobre investimentos, riscos ou objetivos..."
            placeholderTextColor={isDark ? '#6d7b95' : '#9aaac7'}
            style={[styles.input, { color: isDark ? '#F4F7FF' : '#1A2C4A' }]}
            multiline
          />
          <Pressable
            style={[
              styles.sendButton,
              { backgroundColor: isDark ? '#2f60ff' : '#1E3AA9' },
              isSending && { opacity: 0.6 },
            ]}
            onPress={handleSend}
            disabled={isSending}
          >
            <Feather name="send" size={18} color="#ffffff" />
          </Pressable>
        </Card>
      </KeyboardAvoidingView>
    </Container>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 0,
  },
  flex: {
    flex: 1,
  },
  headerCard: {
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  headerContent: {
    borderRadius: 20,
    padding: 18,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 12,
  },
  messagesContent: {
    paddingBottom: 16,
    gap: 12,
  },
  messageRow: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  bubbleCard: {
    maxWidth: '90%',
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
    backgroundColor: 'transparent',
  },
  bubbleContent: {
    padding: 14,
    borderRadius: 18,
    gap: 6,
  },
  typingRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    justifyContent: 'flex-start',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  typingText: {
    fontSize: 13,
    fontWeight: '600',
  },
  metadata: {
    marginTop: 6,
    fontSize: 11,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: 6,
  },
  bulletDot: {
    fontSize: 14,
    marginTop: -2,
  },
  bold: {
    fontWeight: '700',
  },
  inputWrapper: {
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
    backgroundColor: 'transparent',
    marginTop: 8,
    marginBottom: 16,
  },
  inputContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    fontSize: 14,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
