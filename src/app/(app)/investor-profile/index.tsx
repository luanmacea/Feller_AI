import { useMemo } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'

import { Feather } from '@expo/vector-icons'

import Card from '@/components/Card'
import Container from '@/components/Container'
import Text from '@/components/Text'
import { selectThemeState } from '@/redux/features/theme/themeSelectors'
import { useAppSelector } from '@/redux/hook'

interface TimelineEntry {
  year: string
  profile: 'Conservador' | 'Moderado' | 'Arrojado'
  description: string
}

// interface QuizQuestion {
//   id: number
//   title: string
//   options: string[]
// }

const PROFILE_TIMELINE: TimelineEntry[] = [
  {
    year: '2019',
    profile: 'Conservador',
    description: 'Foco em liquidez e renda fixa de curto prazo.',
  },
  {
    year: '2021',
    profile: 'Moderado',
    description: 'Diversificacao inicial com fundos multimercado.',
  },
  {
    year: '2024',
    profile: 'Moderado',
    description: 'Carteira balanceada entre renda fixa, ações e multimercado.',
  },
]

// const QUIZ: QuizQuestion[] = [
//   {
//     id: 1,
//     title: 'Qual sua prioridade principal?',
//     options: [
//       'Preservar capital',
//       'Crescer com equilibrio',
//       'Maximizar ganhos',
//     ],
//   },
//   {
//     id: 2,
//     title: 'Como voce reagiria a uma queda de 10% na carteira?',
//     options: [
//       'Venderia para evitar perdas maiores',
//       'Manteria e revisaria a estrategia',
//       'Compraria mais para aproveitar descontos',
//     ],
//   },
//   {
//     id: 3,
//     title: 'Horizonte de investimento ideal',
//     options: ['Menos de 1 ano', 'Entre 1 e 3 anos', 'Mais de 5 anos'],
//   },
// ]

export default function InvestorProfilePage() {
  const theme = useAppSelector(selectThemeState)
  const isDark = theme.mode === 'dark'

  // const [quizVisible, setQuizVisible] = useState(false)
  // const [answers, setAnswers] = useState<Record<number, number>>({})

  const currentProfile = useMemo(
    () => PROFILE_TIMELINE[PROFILE_TIMELINE.length - 1],
    [],
  )

  // const handleSelectAnswer = (questionId: number, optionIndex: number) => {
  //   setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }))
  // }

  // const handleFinishQuiz = () => {
  //   setQuizVisible(false)
  // }

  return (
    <Container
      style={StyleSheet.flatten([
        styles.container,
        { backgroundColor: isDark ? '#0b141f' : '#f4f8fb' },
      ])}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <Card
          variant="flat"
          style={styles.profileCard}
          contentStyle={StyleSheet.flatten([
            styles.profileContent,
            { backgroundColor: isDark ? '#13273b' : '#e0eff6' },
          ])}
        >
          <View
            style={StyleSheet.flatten([
              styles.profileIcon,
              { backgroundColor: isDark ? '#1c3650' : '#c4deec' },
            ])}
          >
            <Feather
              name="user-check"
              size={26}
              color={isDark ? '#dcebf8' : '#1f3b53'}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.profileTitle]}>
              Investidor {currentProfile.profile}
            </Text>
            <Text style={[styles.profileSubtitle]}>
              Carteira alinhada a metas de crescimento com controle de risco.
            </Text>
          </View>
        </Card>

        <Card contentStyle={styles.timelineCard}>
          <Text style={[styles.sectionTitle]}>Linha do tempo</Text>
          <View style={styles.timelineTrack}>
            {PROFILE_TIMELINE.reverse().map((entry, index) => (
              <View key={entry.year} style={styles.timelineEntry}>
                <View style={styles.timelineIndicatorWrapper}>
                  <View
                    style={[
                      styles.timelineIndicator,
                      {
                        backgroundColor:
                          index === PROFILE_TIMELINE.length - 1
                            ? '#3f9b7c'
                            : '#7aa6d7',
                      },
                    ]}
                  />
                  {index < PROFILE_TIMELINE.length - 1 && (
                    <View
                      style={[
                        styles.timelineConnector,
                        { backgroundColor: '#7aa6d7' },
                      ]}
                    />
                  )}
                </View>
                <View style={styles.timelineContent}>
                  <Text style={[styles.timelineYear]}>{entry.year}</Text>
                  <Text style={[styles.timelineProfile, { color: '#3f9b7c' }]}>
                    {entry.profile}
                  </Text>
                  <Text style={[styles.timelineDescription]}>
                    {entry.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Card>

        {/* <Pressable onPress={() => setQuizVisible(true)}>
          <Card
            style={styles.ctaCard}
            gradientColors={['#1f7a8c', '#3fa2b2']}
            contentStyle={styles.ctaContent}
          >
            <View>
              <Text style={styles.ctaTitle}>Reavaliar perfil</Text>
              <Text style={styles.ctaSubtitle}>
                Refaca o quiz para ajustar a alocacao de acordo com seus
                objetivos atuais.
              </Text>
            </View>
            <Feather name="clipboard" size={20} color="#f4faff" />
          </Card>
        </Pressable> */}
      </ScrollView>

      {/* <Modal
        transparent
        animationType="slide"
        visible={quizVisible}
        onRequestClose={handleFinishQuiz}
      >
        <View style={styles.modalBackdrop}>
          <Card
            variant="flat"
            style={styles.modalCard}
            contentStyle={StyleSheet.flatten([
              styles.modalContent,
              { backgroundColor: isDark ? '#131b2d' : '#ffffff' },
            ])}
          >
            <View style={styles.modalHeader}>
              <Text
                style={[
                  styles.modalTitle,
                  { color: colors.grey1 || '#1c3147' },
                ]}
              >
                Quiz de perfil
              </Text>
              <Pressable onPress={handleFinishQuiz}>
                <Feather name="x" size={20} color={colors.grey2 || '#6b7b91'} />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ gap: 16 }}
            >
              {QUIZ.map((question) => (
                <View key={question.id} style={styles.questionBlock}>
                  <Text
                    style={[
                      styles.questionTitle,
                      { color: colors.grey1 || '#1d2a3a' },
                    ]}
                  >
                    {question.title}
                  </Text>
                  {question.options.map((option, index) => {
                    const isSelected = answers[question.id] === index
                    return (
                      <Pressable
                        key={option}
                        onPress={() => handleSelectAnswer(question.id, index)}
                        style={StyleSheet.flatten([
                          styles.optionButton,
                          {
                            borderColor: isSelected ? '#3f9b7c' : 'transparent',
                            backgroundColor: isSelected
                              ? 'rgba(63, 155, 124, 0.16)'
                              : isDark
                                ? '#1c2432'
                                : '#f1f4f9',
                          },
                        ])}
                      >
                        <Text
                          style={[
                            styles.optionLabel,
                            { color: colors.grey1 || '#1d2a3a' },
                          ]}
                        >
                          {option}
                        </Text>
                        {isSelected && (
                          <Feather name="check" size={18} color="#3f9b7c" />
                        )}
                      </Pressable>
                    )
                  })}
                </View>
              ))}
            </ScrollView>

            <Pressable onPress={handleFinishQuiz} style={{ marginTop: 16 }}>
              <Card
                style={styles.modalCta}
                gradientColors={['#3f9b7c', '#58c2a3']}
                contentStyle={styles.modalCtaContent}
              >
                <Text style={styles.modalCtaText}>Salvar respostas</Text>
                <Feather name="arrow-right" size={18} color="#f3fbf8" />
              </Card>
            </Pressable>
          </Card>
        </View>
      </Modal> */}
    </Container>
  )
}
const styles = StyleSheet.create({
  container: {
    paddingBottom: 0,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCard: {
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
    backgroundColor: 'transparent',
    marginBottom: 16,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    padding: 20,
    borderRadius: 24,
  },
  profileIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  profileSubtitle: {
    fontSize: 13,
  },
  timelineCard: {
    gap: 20,
    padding: 22,
    borderRadius: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  timelineTrack: {
    gap: 18,
  },
  timelineEntry: {
    flexDirection: 'row',
    gap: 16,
  },
  timelineIndicatorWrapper: {
    alignItems: 'center',
  },
  timelineIndicator: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  timelineConnector: {
    width: 2,
    height: 48,
    marginTop: 6,
  },
  timelineContent: {
    flex: 1,
    gap: 6,
  },
  timelineYear: {
    fontSize: 13,
    fontWeight: '600',
  },
  timelineProfile: {
    fontSize: 14,
    fontWeight: '700',
  },
  timelineDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  ctaCard: {
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
    backgroundColor: 'transparent',
    marginTop: 16,
  },
  ctaContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 22,
    gap: 12,
  },
  ctaTitle: {
    color: '#f4faff',
    fontSize: 16,
    fontWeight: '700',
  },
  ctaSubtitle: {
    color: '#dbe8f9',
    fontSize: 13,
    marginTop: 4,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
    backgroundColor: 'transparent',
    width: '100%',
  },
  modalContent: {
    borderRadius: 24,
    padding: 22,
    gap: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  questionBlock: {
    gap: 12,
  },
  questionTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  optionLabel: {
    fontSize: 14,
  },
  modalCta: {
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
    backgroundColor: 'transparent',
  },
  modalCtaContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 18,
  },
  modalCtaText: {
    color: '#f5fbf8',
    fontSize: 15,
    fontWeight: '600',
  },
})
