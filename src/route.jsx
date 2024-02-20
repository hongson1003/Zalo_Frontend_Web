// routes.js
import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import HomeLayout from './layouts/homeLayout';
import LoginPage from './pages/auth/auth.loginPage';
import HomeSubLayout from './layouts/homeSublayout';
import VerifyComponent from './components/verify.component';


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
];

export const router = createBrowserRouter(routes);
