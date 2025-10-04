import { useEffect } from 'react'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import { View, StyleSheet } from 'react-native'

import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import Button from '@/components/Button'
import Container from '@/components/Container'
import Text from '@/components/Text'
import { TextInput } from '@/components/TextInput'
import {
  selectAuthError,
  selectAuthLoading,
} from '@/redux/features/auth/authSelectors'
import { clearAuth } from '@/redux/features/auth/authSlice'
import { changePassword } from '@/redux/features/auth/authThunk'
import { useAppDispatch, useAppSelector } from '@/redux/hook'
import { ValidCPF } from '@/utils/validValues'

const ResetPasswordSchema = z
  .object({
    cpf: z
      .string()
      .min(1, { message: 'Campo de CPF e obrigatorio' })
      .refine(ValidCPF, { message: 'CPF invalido' }),
    password: z
      .string()
      .min(6, { message: 'Senha deve ter ao menos 6 caracteres' }),
    confirmPassword: z
      .string()
      .min(1, { message: 'Campo de confirmacao de senha e obrigatorio' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Senhas diferentes',
    path: ['confirmPassword'],
  })

type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>

export default function ResetPasswordPage() {
  const dispatch = useAppDispatch()
  const isLoading = useAppSelector(selectAuthLoading)
  const authError = useAppSelector(selectAuthError)

  const methods = useForm<ResetPasswordInput>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      cpf: '',
      password: '',
      confirmPassword: '',
    },
  })

  useEffect(() => {
    dispatch(clearAuth())

    return () => {
      dispatch(clearAuth())
    }
  }, [dispatch])

  const handleSubmit: SubmitHandler<ResetPasswordInput> = (data) => {
    dispatch(
      changePassword({
        cpf: data.cpf,
        newPassword: data.password,
      }),
    )
  }

  return (
    <Container style={{ justifyContent: 'center' }}>
      <View style={styles.header}>
        <Text variant="title" style={{ marginBottom: 8 }}>
          Recuperar Senha
        </Text>
        <Text variant="subtitle">Preencha seu CPF e a nova senha</Text>
      </View>
      <FormProvider {...methods}>
        <TextInput
          name="cpf"
          label="Digite seu CPF"
          placeholder="000.000.000-00"
          numeric
        />
        <TextInput
          name="password"
          label="Nova senha"
          placeholder="Digite a nova senha"
          password
        />
        <TextInput
          name="confirmPassword"
          label="Confirmar senha"
          placeholder="Confirme a nova senha"
          password
        />
        {authError ? <Text style={styles.errorText}>{authError}</Text> : null}
        <Button
          style={{ marginTop: 16 }}
          title={isLoading ? 'Enviando...' : 'Alterar senha'}
          disabled={isLoading}
          onPress={methods.handleSubmit(handleSubmit)}
        />
      </FormProvider>
    </Container>
  )
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  errorText: {
    marginTop: 8,
    color: '#B22222',
    fontSize: 12,
  },
})
