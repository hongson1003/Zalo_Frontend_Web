import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { Button, Checkbox, Form, Input } from 'antd';
import './resetPassword.component.scss';
import axios from '../utils/axios';

const ResetPassword = () => {
  const state = useSelector((state) => state.appReducer);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    if (!state.userInfo) {
      navigate('/login');
    }
  }, []);

  const onFinish = async (values) => {
    try {
      const data = {
        id: state?.userInfo?.id,
        phoneNumber: state?.userInfo?.phoneNumber,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      };
      if (values.newPassword !== values.confirmPassword) {
        toast.error('Mật khẩu không khớp');
        return;
      }
      if (values.newPassword.length < 6) {
        toast.error('Mật khẩu phải có ít nhất 6 ký tự');
        return;
      }
      delete data.confirmPassword;
      const res = await axios.post('/auth/reset-password', data);
      if (res.errCode === 0) {
        setIsLoading(true);
        toast.success('Đổi mật khẩu thành công');
        setTimeout(() => {
          setIsLoading(false);
          navigate('/login');
        }, 1000);
      } else toast.error(res.message);
    } catch (error) {
      console.log(error);
    }
  };
  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <div className="reset-container">
      <h1 className="title">Đặt lại mật khẩu</h1>
      <Form
        name="basic"
        className="reset-form"
        labelCol={{
          span: 8,
        }}
        wrapperCol={{
          span: 16,
        }}
        style={{
          maxWidth: 600,
          width: '100%',
        }}
        initialValues={{
          remember: true,
        }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item
          className="form-item"
          label="Số điện thoại"
          rules={[
            {
              required: true,
              message: 'Please input your phoneNumber!',
            },
          ]}
        >
          <Input
            accessKey="phoneNumber"
            value={state?.userInfo?.phoneNumber}
            disabled
          />
        </Form.Item>

        <Form.Item
          className="form-item"
          label="Nhập mật khẩu mới"
          name="newPassword"
          rules={[
            {
              required: true,
              message: 'Please input your new password!',
            },
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          className="form-item"
          label="Xác nhận mật khẩu mới"
          name="confirmPassword"
          rules={[
            {
              required: true,
              message: 'Please confirm input your new password!',
            },
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          className="form-item"
          wrapperCol={{
            offset: 8,
            span: 16,
          }}
        >
          <Button type="primary" htmlType="submit" loading={isLoading}>
            Hoàn thành
          </Button>
        </Form.Item>
      </Form>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition:Bounce
      />
    </div>
  );
};

export default ResetPassword;
