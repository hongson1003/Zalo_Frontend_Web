import { Outlet } from 'react-router-dom';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Layout } from 'antd';
const { Content, Sider } = Layout;
import './homelayout.scss';
import Sidebar from '../components/navigator/sidebar';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { socket } from '../utils/io';
import { STATE } from '../redux/types/type.app';
import { connectSocketSuccess } from '../redux/actions/app.action';

const HomeLayout = () => {
  const navigate = useNavigate();
  const state = useSelector(state => state?.appReducer);
  const dispatch = useDispatch();
  const onlyOneRef = useRef(false);
  // check authentication
  useEffect(() => {
    if (state.isLogin !== STATE.RESOLVE)
      navigate('/login');
    if (state.isLogin === STATE.RESOLVE) {
      navigate('/home');
    }
  }, [state])

  // connect to socket
  useState(() => {
    socket.then((socket) => {
      socket.emit('setup', state?.userInfo?.user);
      socket.on('connected', () => {
        if (state?.isConnectedSocket === false)
          dispatch(connectSocketSuccess());
      })
    })
  }, []);

  useEffect(() => {
    if (state?.isConnectedSocket === true && onlyOneRef.current === false) {
      toast.success('Đã đăng nhập thành công');
      onlyOneRef.current = true;
    }
  }, [state?.isConnectedSocket]);




  return (
    <>
      <Layout
        className='homelayout-container'
      >
        <Sider width={64}>
          {/* <div className="demo-logo-vertical" /> */}
          <Sidebar />
        </Sider>
        <Layout>
          <Content>
            <Outlet />
          </Content>
        </Layout>
        <ToastContainer
          position="top-right"
          autoClose={2000}
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
      </Layout >

    </>
  );
}

export default HomeLayout;
