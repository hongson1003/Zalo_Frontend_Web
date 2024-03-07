// routes.js
import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import HomeLayout from './layouts/homeLayout';
import LoginPage from './pages/auth/auth.loginPage';
import HomeSubLayout from './layouts/homeSubLayout';
import VerifyComponent from './components/verify.component';
import ResetPassword from './components/resetPassword.component';


const routes = [
    {
        path: '/',
        element: <HomeLayout />,
        children: [
            {
                path: '/home',
                element: <HomeSubLayout />
            },
        ],
    },
    {
        path: '/login',
        element: <LoginPage />,
    },
    {
        path: '/verify',
        element: <VerifyComponent />
    },
    {
        path: '/reset-password',
        element: <ResetPassword />
    },
];

export const router = createBrowserRouter(routes);
