import { Outlet } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Layout } from 'antd';
const { Content, Sider } = Layout;
import './homelayout.scss';

import Sidebar from '../components/navigator/sidebar';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess } from '../redux/actions/action.app';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const HomeLayout = () => {
  const navigate = useNavigate();
  const state = useSelector(state => state?.appReducer);
  useEffect(() => {
    if (state.isLogin === false)
      navigate('/login');
    if (state.isLogin === true) {
      navigate('/home');
    }
  }, [state])



  return (
    <>
      <Layout
        className='homelayout-container'
      >
        <Sider width={64}>
          <div className="demo-logo-vertical" />
          <Sidebar />
        </Sider>
        <Layout>
          <Content>
            <Outlet />
          </Content>
        </Layout>

        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          transition:Bounce
        />
        <ToastContainer />
      </Layout >

    </>
  );
}

export default HomeLayout;
