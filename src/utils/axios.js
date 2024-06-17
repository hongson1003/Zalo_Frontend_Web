import axios from 'axios';
import axiosRetry from 'axios-retry';
let isRefresh_token = false;
let newToken = null;
import store from '../redux/store';
import { loginSuccess } from '../redux/actions/app.action';

const instance = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL,
  withCredentials: true,
});

instance.defaults.headers.common['Authorization'] = '';

export const setAuthorizationAxios = (token) => {
  if (token) {
    newToken = token;
    instance.defaults.headers.common['Authorization'] = 'Bearer ' + token;
  } else {
    instance.defaults.headers.common['Authorization'] = '';
  }
};

axiosRetry(instance, {
  retries: 3, // number of retries
  retryDelay: (retryCount) => {
    console.log(`retry attempt: ${retryCount}`);
    return retryCount * 500; // time interval between retries
  },
  retryCondition: async (error) => {
    // if retry condition is not specified, by default idempotent requests are retried
    const status = error.response?.status;
    if (status === 401) {
      if (!isRefresh_token) {
        isRefresh_token = true;
        // call api refresh token
        try {
          let rs = await instance.post('/auth/check');
          if (rs.errCode === 100) {
            // if success then set new token
            setAuthorizationAxios(rs.data.access_token);
            // dispatch action login success to redux
            store.dispatch(loginSuccess(rs.data));
            // end dispatch
            isRefresh_token = false;
            return true;
          }
        } catch (refreshError) {
          return true;
        }
      }
      return true;
    }
    return false;
  },
});

// Add a request interceptor
instance.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    // console.log('config.header', config.headers)
    if (newToken) {
      config.headers.Authorization = 'Bearer ' + newToken;
    }
    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  }
);

// Add a response interceptor
instance.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data

    return response?.errCode === 0 ? response : response.data;
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return Promise.reject(error);
  }
);

export default instance;
