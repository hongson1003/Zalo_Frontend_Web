import { loginFail, loginSuccess } from '../redux/actions/app.action'
import axios, { setAuthorizationAxios } from '../utils/axios'

export const checkUserIsLogin = async () => {
  try {
    let rs = await axios.post('/auth/check')
    if (rs.errCode === 0 || rs.errCode === 100) {
      setAuthorizationAxios(rs.data.access_token)
      return loginSuccess(rs.data)
    } else {
      return loginFail()
    }
  } catch (error) {
    console.log(error)
  }
}
