import packageJson from '../../package.json'

const { version } = packageJson

const uri: { [key: string]: string } = {
  development: 'http://10.0.2.2:3000',
  production: 'http://10.0.2.2:3000',
  test: 'http://10.0.2.2:3000',
}

const NODE_ENV = process.env.NODE_ENV

const LocalStore = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  COMPANY: 'company',
}

export { uri, version, NODE_ENV, LocalStore }
