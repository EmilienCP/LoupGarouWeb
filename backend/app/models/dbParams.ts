const dbParams = {
  USER: '',
  PASSWORD: '',
  DB: 'myDb?retryWrites=true&w=majority',
  HOST: '',
  PORT: '',
  URL: '',
  TEST_URL: ''
}

dbParams.URL = 'postgres+srv://' + dbParams.USER + ':' + dbParams.PASSWORD + '@' + dbParams.HOST + '/' + dbParams.DB

export { dbParams }
