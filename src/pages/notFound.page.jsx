import React, { useEffect } from 'react';
import { Result, Button, Table } from 'antd';
import { Link } from 'react-router-dom';
import './notFound.page.scss';
import { socket } from '../utils/io';

const NotFound = () => {
  return (
    <div className="container">
      <Result
        status="404"
        title="404 - Page not found !"
        subTitle="Xin lỗi, trang bạn đang tìm kiếm không tồn tại."
        extra={
          <Button type="primary">
            <Link to="/">Quay lại trang chính</Link>
          </Button>
        }
      />
    </div>
  );
};

export default NotFound;
