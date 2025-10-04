import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import { View, StyleSheet } from 'react-native'

import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import Button from '@/components/Button'
import Container from '@/components/Container'
import { DatePickerInput } from '@/components/DatePicker'
import Text from '@/components/Text'
import { TextInput } from '@/components/TextInput'
import { signUp } from '@/redux/features/auth/authThunk'
import { useAppDispatch } from '@/redux/hook'
import { ValidCPF } from '@/utils/validValues'

const SignUpSchema = z
  .object({
    nomeUsuario: z
      .string()
      .trim()
      .min(1, { message: 'Campo de nome e obrigatorio' }),
    cpf: z
      .string()
      .trim()
      .min(1, { message: 'Campo de CPF e obrigatorio' })
      .refine(ValidCPF, { message: 'CPF invalido' }),
    email: z
      .string()
      .trim()
      .min(1, { message: 'Campo de email e obrigatorio' })
      .email('Informe um email valido'),
    dtNascimento: z
      .string()
      .min(1, { message: 'Campo de data de nascimento e obrigatorio' }),
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

type SignUpInput = z.infer<typeof SignUpSchema>

export default function SignUpPage() {
  const dispatch = useAppDispatch()

  const methods = useForm<SignUpInput>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      nomeUsuario: '',
      cpf: '',
      email: '',
      dtNascimento: '',
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit: SubmitHandler<SignUpInput> = async (data) => {
    const birthDate = data.dtNascimento
      ? new Date(data.dtNascimento).toISOString().split('T')[0]
      : ''

    dispatch(
      signUp({
        nomeUsuario: data.nomeUsuario.trim(),
        cpf: data.cpf.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        dtNascimento: birthDate,
      }),
    )
  }

  return (
    <Container style={{ justifyContent: 'center' }}>
      <FormProvider {...methods}>
        <View style={styles.header}>
          <Text variant="title" style={{ marginBottom: 8 }}>
            Crie sua conta
          </Text>
          <Text variant="subtitle">Digite suas informacoes</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            name="nomeUsuario"
            label="Digite seu nome completo"
            placeholder="Nome"
          />
          <TextInput
            name="cpf"
            label="Digite seu CPF"
            placeholder="000.000.000-00"
            numeric
          />
          <TextInput
            name="email"
            label="Digite seu email"
            placeholder="email@exemplo.com"
          />
          <DatePickerInput
            name="dtNascimento"
            label="Data de nascimento"
            maximumDate={new Date()}
          />
          <TextInput
            name="password"
            label="Digite sua senha"
            placeholder="Senha"
            password
          />
          <TextInput
            name="confirmPassword"
            label="Confirme sua senha"
            placeholder="Confirmar senha"
            password
          />
          <Button title="Cadastrar" onPress={methods.handleSubmit(onSubmit)} />
        </View>
      </FormProvider>
    </Container>
  )
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  form: {
    gap: 8,
  },
})
