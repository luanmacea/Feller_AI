import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import { View, StyleSheet } from 'react-native'

import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import Button from '@/components/Button'
import Container from '@/components/Container'
import Logo from '@/components/Logo'
import { TextInput } from '@/components/TextInput'
import { selectAuthState } from '@/redux/features/auth/authSelectors'
import { signIn } from '@/redux/features/auth/authThunk'
import { useAppDispatch, useAppSelector } from '@/redux/hook'

const SignInSchema = z.object({
  cpf: z.string().min(1, { message: 'Campo de CPF é obrigatório' }),
  // .refine(ValidCPF, { message: 'CPF inválido' }),
  password: z.string().min(1, { message: 'Campo de senha e obrigatorio' }),
})

type SignInInput = z.infer<typeof SignInSchema>

export default function SignInPage() {
  const auth = useAppSelector(selectAuthState)
  const dispatch = useAppDispatch()

  const methods = useForm<SignInInput>({
    resolver: zodResolver(SignInSchema),
  })

  const onSubmit: SubmitHandler<SignInInput> = (data) => {
    dispatch(signIn(data))
  }

  return (
    <Container style={{ justifyContent: 'center' }}>
      <FormProvider {...methods}>
        <View style={styles.logoContainer}>
          <Logo style={{ width: '100%', height: '50%' }} resizeMode="contain" />
        </View>

        <View style={{ marginBottom: 16 }}>
          <TextInput
            name="cpf"
            label="Digite seu CPF"
            placeholder="CPF"
            numeric
          />
          <TextInput
            name="password"
            label="Digite sua senha"
            placeholder="Senha"
            password
          />
        </View>

        {/* <TouchableOpacity
          style={styles.forgotButton}
          onPress={() => router.push('reset-password')}
        >
          <Text style={styles.forgotText}>Esqueceu sua senha?</Text>
        </TouchableOpacity> */}

        <Button
          title="Login"
          loading={auth.isLoading}
          onPress={methods.handleSubmit(onSubmit)}
        />

        {/* <View style={styles.footer}>
          <Text style={styles.footerText}>Acessando pela primeira vez? </Text>
          <TouchableOpacity onPress={() => router.push('sign-up')}>
            <Text style={styles.footerLink}>Primeiro acesso</Text>
          </TouchableOpacity>
        </View> */}
      </FormProvider>
    </Container>
  )
}

const styles = StyleSheet.create({
  logoContainer: {
    marginBottom: 16,
    height: 150,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 12,
  },
  forgotText: {
    fontSize: 12,
    color: '#B8860B',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    color: '#DAA520',
    fontWeight: 'bold',
  },
})
