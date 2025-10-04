import { useMemo } from 'react'
import { Image, StyleSheet, View } from 'react-native'

import Card from '@/components/Card'
import Container from '@/components/Container'
import Text from '@/components/Text'
import { selectUser } from '@/redux/features/auth/authSelectors'
import { selectThemeState } from '@/redux/features/theme/themeSelectors'
import { useAppSelector } from '@/redux/hook'

interface InfoItem {
  label: string
  value: string
}

const formatCpf = (cpf?: string | number) => {
  if (!cpf) {
    return 'Nao informado'
  }

  const digits = cpf.toString().replace(/\D/g, '')
  if (digits.length !== 11) {
    return digits
  }

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

export default function ProfilePage() {
  const user = useAppSelector(selectUser)
  const theme = useAppSelector(selectThemeState)

  const displayName = useMemo(() => {
    const base = user?.nomePreferencial || user?.nomeUsuario
    if (!base) {
      return 'Investidor'
    }
    return base
  }, [user?.nomePreferencial, user?.nomeUsuario])

  const avatarLetter = useMemo(
    () => displayName.charAt(0).toUpperCase(),
    [displayName],
  )

  const hasAvatar = Boolean(user?.avatarUrl && user.avatarUrl.trim().length > 0)

  const info: InfoItem[] = useMemo(
    () => [
      { label: 'Nome completo', value: user?.nomeUsuario || 'Nao informado' },
      { label: 'CPF', value: formatCpf(user?.cpf) },
      { label: 'E-mail', value: user?.email || 'Nao informado' },
      {
        label: 'Perfil de investidor',
        value: user?.tipo || 'Nao informado',
      },
      {
        label: 'Status',
        value: user?.userIsActive ? 'Ativo' : 'Inativo',
      },
    ],
    [user?.cpf, user?.email, user?.nomeUsuario, user?.tipo, user?.userIsActive],
  )

  return (
    <Container>
      <View style={styles.header}>
        {hasAvatar ? (
          <Image
            source={{ uri: user?.avatarUrl }}
            style={styles.avatarImage}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              styles.avatarFallback,
              { backgroundColor: theme.colors?.primary || '#F7CA02' },
            ]}
          >
            <Text variant="title" style={styles.avatarText}>
              {avatarLetter}
            </Text>
          </View>
        )}
        <View>
          <Text variant="title">{displayName}</Text>
          <Text variant="caption">
            {user?.role?.replace('ROLE_', '') || 'Usuario'} ativo
          </Text>
        </View>
      </View>

      <Card style={styles.card}>
        <Text variant="subtitle" style={styles.sectionTitle}>
          Dados pessoais
        </Text>
        {info.map(({ label, value }) => (
          <View key={label} style={styles.row}>
            <Text variant="caption" style={styles.label}>
              {label}
            </Text>
            <Text style={styles.value}>{value}</Text>
          </View>
        ))}
      </Card>
    </Container>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarFallback: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
  },
  card: {
    gap: 16,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  row: {
    gap: 4,
  },
  label: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
  },
})
