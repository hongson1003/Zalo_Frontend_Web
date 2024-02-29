import React, { useEffect, useRef, useState } from "react";
import { Flex } from 'antd';
import './qr.login.scss';
import QRCode from "react-qr-code";
import { v4 as uuidv4 } from 'uuid';
import { socket } from '../../utils/io';
import { loginStart } from '../../redux/actions/action.app';
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

const LoginQR = () => {
    const [value, setValue] = useState('');
    const onlyRender = useRef(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [isConnected, setIsConnected] = useState(false);
    useEffect(() => {
        if (!onlyRender.current && !isConnected) {
            let token = uuidv4() + JSON.stringify(Date.now())
            setValue(token);
            // fetchWaitScanner(token);
            socket.emit('setup', token);
            socket.on('connected', (id) => {
                setIsConnected(true);
                socket.emit('join-qr-room', token);
                socket.on('joined', (data) => {
                    socket.on('need-to-verify', (data) => { // Khi người dùng quét mã
                        dispatch(loginStart(data));
                        navigate(`/verify?id=${data.id}`);
                    })
                })
            })
        }
        onlyRender.current = true;
    });
    useEffect(() => {
        if (isConnected) {
            toast.success('Đã kết nối với máy quét');
        }
    }, [isConnected]);
    return (
        <Flex
            justify="center"
            className="login-qr"
            vertical

        >
            <div style={{
                border: '1px solid #E5E5E5',
                borderRadius: '10px'

            }}>
                {/* <QRCode
                    type="canvas"
                    value="https://ant.design/"
                    className="qr"
                /> */}
                <QRCode
                    value={value}
                />
                <p className="more-qr">
                    <span style={{
                        color: '#006AF5'
                    }}>Chỉ dùng để đăng nhập</span>
                    <br />
                    <span>Zalo trên máy tính</span>
                </p>
            </div>
            <p style={{
                fontSize: 'calc(7px + 0.4vw)',
                textAlign: 'center',
                marginTop: '10px',
                fontWeight: 'bold',
                color: '#888'
            }}>Sử dụng ứng dụng Zalo để quét mã QR</p>
        </Flex>
    )
}

export default LoginQR;