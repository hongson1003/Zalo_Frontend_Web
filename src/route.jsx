// routes.js
import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import HomeLayout from './layouts/homeLayout';
import LoginPage from './pages/auth/auth.loginPage';
import HomeSubLayout from './layouts/homeSublayout';
import VerifyComponent from './components/verify.component';
import ResetPassword from './components/resetPassword.component';
import OutsideLayout from './layouts/outsideLayout';
import ErrorPage from './pages/error.page';
import NotFound from './pages/notFound.page';


const routes = [
    {
        path: '/',
        element: <HomeLayout />,
        exact: true,
        children: [
            {
                path: 'home',
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
    {
        path: '/outside',
        element: <OutsideLayout />,
        children: [
            {
                path: 'error',
                element: <ErrorPage />
            },

        ],
    },
    {
        path: '*',
        element: <NotFound />
    },
];

export const router = createBrowserRouter(routes);
