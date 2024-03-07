import { io } from 'socket.io-client';

// "undefined" means the URL will be computed from the `window.location` object
const URL = import.meta.env.VITE_APP_NODE_ENV === 'production' ? undefined : 'http://localhost:8080';
export const socket = customSocket(io, URL);


async function customSocket(io, url) {
    try {
        var socket = null;
        const result = await new Promise(async (resolve, reject) => {
            if (url) {
                socket = await io(url, { autoConnect: true, reconnection: false });
                resolve(socket);
            } else {
                resolve(io());
            }
        })
        return result;
    } catch (error) {
        console.log('Lỗi kết nối máy chủ socket:', error);
    }
}

