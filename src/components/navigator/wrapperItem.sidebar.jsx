import React from 'react';
import './wrapperItem.sidebar.scss';

const WrapperItemSidebar = ({ children, count }) => {
  return (
    <div className="wrapperItem-sidebar-container">
      {children}
      {!!count && <div className="notifications-item">{count}</div>}
    </div>
  );
};

export default WrapperItemSidebar;
