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
import axios from '../utils/axios';
import { getFriend } from '../utils/handleChat';

const HomeLayout = () => {
  const navigate = useNavigate();
  const state = useSelector(state => state?.appReducer);
  const dispatch = useDispatch();
  const [limit, setLimit] = useState(10);
  const [friends, setFriends] = useState([]);
  const onlyRenderRef = useRef(false);
  // check authentication
  useEffect(() => {
    if (state.isLogin !== STATE.RESOLVE)
      navigate('/login');
    if (state.isLogin === STATE.RESOLVE) {
      navigate('/home');
    }
  }, [state]);

  const fetchFriends = async () => {
    const { data } = await axios.get(`/users/friends?page=1&limit=${limit}`);
    const friends = [];
    data.forEach(item => {
      const friend = getFriend(state?.userInfo?.user, [item.user1, item.user2]);
      delete friend.avatar;
      friends.push(friend);
    })
    setFriends(friends);
  }

  // connect to socket
  useState(() => {
    socket.then((socket) => {
      socket.emit('setup', state?.userInfo?.user);
      socket.on('connected', () => {
        if (state?.isConnectedSocket === false)
          dispatch(connectSocketSuccess());
        updateOnline(null);
        // join room and online
        fetchFriends();
      })
    })
  }, []);

  useEffect(() => {
    if (onlyRenderRef.current === false && friends.length > 0) {
      socket.then((socket) => {
        friends.forEach(friend => {
          socket.emit('join-room', friend.id);
        })
        socket.on('joined-room', (room) => {
          socket.emit('online', state?.userInfo?.user?.id);
        })
      })
      onlyRenderRef.current = true;
    }
  }, [friends]);

  const updateOnline = async (time) => {
    await axios.put('/users/updateOnline', { time });
  }

  useEffect(() => {
    const handleBeforeUnload = async () => {
      updateOnline(new Date());
      socket.then((socket) => {
        socket.emit('offline', state?.userInfo?.user?.id);
      })
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);


  return (
    <>
      <Layout
        className='homelayout-container'
      >
        <Sider width={'calc(30px+2vw)'}>
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
      </Layout >

    </>
  );
}

export default HomeLayout;
