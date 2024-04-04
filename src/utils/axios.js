import axios from "axios";
import axiosRetry from 'axios-retry';


const instance = axios.create({
    baseURL: import.meta.env.VITE_APP_API_URL,
    withCredentials: true,
});

let isRefresh_token = false;

instance.defaults.headers.common['Authorization'] = '';

export const setAuthorizationAxios = (token) => {
    if (token) {
        instance.defaults.headers.common['Authorization'] = 'Bearer ' + token
    }
}

axiosRetry(instance, {
    retries: 3, // number of retries
    retryDelay: (retryCount) => {
        console.log(`retry attempt: ${retryCount}`);
        return retryCount * 2000; // time interval between retries
    },
    retryCondition: async (error) => {
        // if retry condition is not specified, by default idempotent requests are retried
        console.log('isRefresh', isRefresh_token)
        const status = error.response?.status;
        if (status === 401 && !isRefresh_token) {
            isRefresh_token = true;
            // call api refresh token
            try {
                let rs = await instance.post('/auth/check');
                if (rs.errCode === 100) {
                    // if 
                    setAuthorizationAxios(rs.data.access_token);
                    isRefresh_token = false;
                    console.log('isRefresh', isRefresh_token)
                    return false;
                }
            } catch (refreshError) {
                console.error('Error refreshing token:', refreshError);
                isRefresh_token = false;
                return true;
            }
        }
        return false;
    },
});

// Add a request interceptor
instance.interceptors.request.use(function (config) {
    // Do something before request is sent

    return config;
}, function (error) {
    // Do something with request error
    return Promise.reject(error);
});

// Add a response interceptor
instance.interceptors.response.use(function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response.data;
}, function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return Promise.reject(error);
});

export default instance;
