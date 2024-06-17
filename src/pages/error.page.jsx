import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { STATE } from '../redux/types/app.type';
import { useNavigate } from 'react-router-dom';
import { Result, Button } from 'antd';
import { Link } from 'react-router-dom';

const ErrorPage = () => {
  const state = useSelector((state) => state?.appReducer);
  const navigate = useNavigate();

  useEffect(() => {
    if (!state.error) {
      setTimeout(() => {
        navigate('/');
      }, 2000);
    }
  }, [state]);

  return (
    <div>
      <Result
        style={{ width: '100%' }}
        status="500"
        title="500 - Something went wrong !"
        subTitle=""
        extra={
          <Button type="primary">
            <Link to="/">Quay lại trang chính</Link>
          </Button>
        }
      />
    </div>
  );
};

export default ErrorPage;
