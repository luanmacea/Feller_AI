import packageJson from '../../package.json'

const { version } = packageJson

const defaultUri = 'https://projeto-api.arista.com.br'

const uri: { [key: string]: string } = {
  development: defaultUri,
  production: defaultUri,
  test: defaultUri,
}

const NODE_ENV = process.env.NODE_ENV

const LocalStore = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  COMPANY: 'company',
}

export { uri, version, NODE_ENV, LocalStore }
