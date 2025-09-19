import { Slot } from 'expo-router'

import GlobalAlert from '@/components/GlobalAlert'
import { Providers } from '@/redux/provider'

export default function RootLayout() {
  return (
    <Providers>
      <GlobalAlert />
      <Slot />
    </Providers>
  )
}
