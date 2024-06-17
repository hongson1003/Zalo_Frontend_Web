import React from 'react';
import { Outlet } from 'react-router-dom';

const OutsideLayout = () => {
  return (
    <div>
      <Outlet />
    </div>
  );
};

export default OutsideLayout;
