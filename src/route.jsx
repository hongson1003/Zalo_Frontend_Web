// routes.js
import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import HomeLayout from './layouts/homeLayout';
import LoginPage from './pages/auth/auth.loginPage';
import HomeSubLayout from './layouts/homeSubLayout';
import VerifyComponent from './components/verify.component';
import ResetPassword from './components/resetPassword.component';
import OutsideLayout from './layouts/outsideLayout';
import ErrorPage from './pages/error.page';
import NotFound from './pages/notFound.page';
import TestPage from './pages/test.page';
import VideoCallWindow from './windows/videoCall.window';
import JoinGroup from './pages/ultils/joinGroup';

const routes = [
  {
    path: '/',
    element: <HomeLayout />,
    exact: true,
    children: [
      {
        path: 'home',
        element: <HomeSubLayout />,
      },
      {
        path: 'video-call',
        element: <VideoCallWindow />,
      },
      {
        path: 'chat/:id',
        element: <JoinGroup />,
      },
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/verify',
    element: <VerifyComponent />,
  },
  {
    path: '/reset-password',
    element: <ResetPassword />,
  },
  {
    path: '/outside',
    element: <OutsideLayout />,
    children: [
      {
        path: 'error',
        element: <ErrorPage />,
      },
    ],
  },
  {
    path: '/error',
    element: <ErrorPage />,
  },
  {
    path: '/test',
    element: <TestPage />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
];

export const router = createBrowserRouter(routes);
