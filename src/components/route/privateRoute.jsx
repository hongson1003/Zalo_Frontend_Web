import React from 'react';
import { Route } from 'react-router-dom';

const PrivateRoute = ({ path, element }) => {
  let isLogin = localStorage.isLogin;
  return isLogin ? (
    <Route path={path} element={element} />
  ) : (
    <Navigate to="/login" replace={true} /> // Nếu chưa đăng nhập, điều hướng đến trang login
  );
};
