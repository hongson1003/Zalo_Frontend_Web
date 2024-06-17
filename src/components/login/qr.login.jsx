import React, { useEffect, useRef, useState } from 'react';
import { Flex } from 'antd';
import './qr.login.scss';
import QRCode from 'react-qr-code';
import { v4 as uuidv4 } from 'uuid';
import { socket } from '../../utils/io';
import { loginStart } from '../../redux/actions/app.action';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import ReactLoading from 'react-loading';

const LoginQR = () => {
  const [value, setValue] = useState('');
  const onlyRender = useRef(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!onlyRender.current && !isConnected) {
      let token = uuidv4() + JSON.stringify(Date.now());
      setValue(token);
      // fetchWaitScanner(token);
      socket.then((socket) => {
        socket.emit('setup', token);
        socket.on('connected', () => {
          setIsConnected(true);
          socket.emit('join-qr-room', token);
          socket.on('joined', () => {
            socket.on('need-to-verify', (data) => {
              // Khi người dùng quét mã
              setIsLoading(true);
              setTimeout(() => {
                setIsLoading(false);
                dispatch(loginStart(data));
                navigate(`/verify?id=${data.id}`);
              }, 1000);
            });
          });
        });
        onlyRender.current = true;
      });
    }
  }, []);
  return (
    <>
      <Flex justify="center" className="login-qr" vertical>
        <div
          style={{
            border: '1px solid #E5E5E5',
            borderRadius: '10px',
          }}
        >
          <QRCode value={value} />
          <p className="more-qr">
            <span
              style={{
                color: '#006AF5',
              }}
            >
              Chỉ dùng để đăng nhập
            </span>
            <br />
            <span>Zalo trên máy tính</span>
          </p>
        </div>
        <p
          style={{
            fontSize: 'calc(7px + 0.4vw)',
            textAlign: 'center',
            marginTop: '10px',
            fontWeight: 'bold',
            color: '#888',
          }}
        >
          Sử dụng ứng dụng Zalo để quét mã QR
        </p>
      </Flex>
      {isLoading && (
        <div className="loading">
          <ReactLoading type={'spin'} color={'blue'} />
          <p>Đang đăng nhập ...</p>
        </div>
      )}
    </>
  );
};

export default LoginQR;
