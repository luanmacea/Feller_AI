import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'expo-router'
import { z } from 'zod'

import logo from '@/assets/logoEscuro.png'
import Button from '@/components/Button'
import Container from '@/components/Container'
import Text from '@/components/Text'
import { TextInput } from '@/components/TextInput'
import { signIn } from '@/redux/features/auth/authThunk'
import { useAppDispatch } from '@/redux/hook'

const SignInSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: 'Campo de email e obrigatorio' })
    .email({ message: 'Informe um email valido' }),
  password: z.string().min(1, { message: 'Campo de senha e obrigatorio' }),
})

type SignInInput = z.infer<typeof SignInSchema>

export default function SignInPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()

  const methods = useForm<SignInInput>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit: SubmitHandler<SignInInput> = (data) => {
    dispatch(
      signIn({
        email: data.email.trim().toLowerCase(),
        password: data.password,
      }),
    )
  }

  return (
    <Container style={{ justifyContent: 'center' }}>
      <FormProvider {...methods}>
        <View style={styles.logoContainer}>
          <Image
            source={logo}
            style={{ width: '100%', height: '50%' }}
            resizeMode="contain"
          />
        </View>

        <View>
          <TextInput
            name="email"
            label="Digite seu email"
            placeholder="email@exemplo.com"
          />
          <TextInput
            name="password"
            label="Digite sua senha"
            placeholder="Senha"
            password
          />
        </View>

        <TouchableOpacity
          style={styles.forgotButton}
          onPress={() => router.push('reset-password')}
        >
          <Text style={styles.forgotText}>Esqueceu sua senha?</Text>
        </TouchableOpacity>

        <Button title="Login" onPress={methods.handleSubmit(onSubmit)} />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Nao possui uma conta? </Text>
          <TouchableOpacity onPress={() => router.push('sign-up')}>
            <Text style={styles.footerLink}>Cadastre-se</Text>
          </TouchableOpacity>
        </View>
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
