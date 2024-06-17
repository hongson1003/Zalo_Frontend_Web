import { Outlet } from 'react-router-dom';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from 'antd';
const { Content, Sider } = Layout;
import './homeLayout.scss';
import Sidebar from '../components/navigator/sidebar';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { socket } from '../utils/io';
import { STATE } from '../redux/types/app.type';
import { connectSocketSuccess } from '../redux/actions/app.action';
import axios from '../utils/axios';
import { getFriend } from '../utils/handleChat';

const HomeLayout = () => {
  const navigate = useNavigate();
  const state = useSelector((state) => state?.appReducer);
  const dispatch = useDispatch();
  const pathName = window.location.pathname;

  const updateOnline = async (time) => {
    try {
      await axios.put('/users/updateOnline', { time });
    } catch (error) {
      console.log(error);
      toast.error('Error when update online status');
    }
  };

  // check authentication
  useEffect(() => {
    if (state.error) {
      navigate('/outside/error');
    }
    if (state.isLogin === STATE.REJECT) {
      navigate('/login');
    }
    if (state.isLogin === STATE.RESOLVE) {
      const path = window.location.pathname;
      if (path === '/') navigate('/home');
    }
  }, [state]);

  useEffect(() => {
    if (state?.userInfo) {
      socket.then((socket) => {
        socket.emit('setup', state?.userInfo?.user);
        socket.on('connected', () => {
          if (state?.isConnectedSocket === false) {
            socket.emit('join-room', state?.userInfo?.user.id);
            dispatch(connectSocketSuccess());
          }
        });
      });
    }
  }, [state.userInfo]);

  useEffect(() => {
    const triggerOnline = async () => {
      await updateOnline(null);
      socket.then((socket) => {
        socket.emit('online', state?.userInfo?.user.id);
      });
    };
    const triggerOffline = async () => {
      socket.then((socket) => {
        window.addEventListener('beforeunload', async (e) => {
          socket.emit('offline', state?.userInfo?.user.id);
        });
      });
    };

    if (state?.isConnectedSocket === true) {
      triggerOnline();
      triggerOffline();
    }
  }, [state?.isConnectedSocket]);

  useEffect(() => {
    if (state?.isConnectedSocket === true) {
      socket.then((socket) => {
        socket.on('open-call', (data) => {
          if (state?.userInfo?.user?.peerId === data.peerId) {
            return;
          }
          // Kết nối peerjs
          const width = 1000; // Độ rộng của cửa sổ mới
          const height = 500; // Độ cao của cửa sổ mới
          const left = (window.screen.width - width) / 2; // Tính toán vị trí trung tâm theo trục X
          const top = (window.screen.height - height) / 2; // Tính toán vị trí trung tâm theo trục Y
          const newWindow = window.open(
            `/video-call?chat=${data.room}&isCalled=true`,
            '_blank',
            `width=${width},height=${height},left=${left},top=${top}`
          );
          if (newWindow) {
            // Thực hiện các hành động cần thiết khi cửa sổ mới được mở
          } else {
            alert('Popup blocked! Please enable popups for this site.');
          }
        });
      });
    }
  }, [state?.isConnectedSocket]);

  return (
    <>
      <Layout className="homelayout-container">
        {!pathName.includes('/chat') && (
          <Sider width={'calc(30px+2vw)'}>
            <Sidebar />
          </Sider>
        )}
        <Layout>
          <Content>
            <Outlet />
          </Content>
        </Layout>
        <ToastContainer
          position="top-right"
          autoClose={1000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          transition:Bounce
        />
      </Layout>
    </>
  );
};

export default HomeLayout;
