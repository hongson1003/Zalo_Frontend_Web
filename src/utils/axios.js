import axios from "axios";


const instance = axios.create({
    baseURL: import.meta.env.VITE_APP_API_URL,
    timeout: 5000,
    withCredentials: true,
});


instance.defaults.headers.common['Authorization'] = '';

export const setAuthorizationAxios = (token) => {
    if (token) {
        instance.defaults.headers.common['Authorization'] = 'Bearer ' + token
    }
}

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
