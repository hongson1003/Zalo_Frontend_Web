import React from "react";
import { QRCode, Flex } from 'antd';
import './qr.login.scss';


const LoginQR = () => {
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
                <QRCode
                    type="canvas"
                    value="https://ant.design/"
                    className="qr"
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