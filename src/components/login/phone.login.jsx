import React, { useEffect, useState } from 'react';
import { LockOutlined, PhoneOutlined } from '@ant-design/icons';
import { Button, Form, Input } from 'antd';
import './phone.login.scss';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginStart } from '../../redux/actions/app.action';
import axios from '../../utils/axios';
import ForgotPasswordModal from '../modal/forgotPassword.modal';
import { toast } from 'react-toastify';
import NewAccountModal from '../modal/newAccount.modal';

const LoginPhone = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const onFinish = async (values) => {
    try {
      setIsLoading(true);
      let rs = await axios.post('/auth/login', values);
      const data = rs.data;
      if (rs.errCode === 0) {
        dispatch(loginStart(data));
        navigate(`/verify?id=${rs?.data?.id}`);
      } else {
        toast.error(rs.message);
        setPhoneNumber(values.phoneNumber);
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.log('error', error);
    }
  };

  return (
    <Form
      name="normal_login"
      className="login-form"
      initialValues={{ remember: true }}
      onFinish={onFinish}
      size="large"
    >
      <Form.Item
        name="phoneNumber"
        rules={[{ required: true, message: 'Please input your phone!' }]}
      >
        <Input
          style={{ gap: '5px' }}
          prefix={<PhoneOutlined className="site-form-item-icon" />}
          placeholder="Số điện thoại"
        />
      </Form.Item>
      <Form.Item
        name="password"
        rules={[{ required: true, message: 'Please input your Password!' }]}
      >
        <Input.Password
          prefix={<LockOutlined className="site-form-item-icon" />}
          type="password"
          placeholder="Password"
          style={{ gap: '5px' }}
          security="false"
        />
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          className="login-form-button"
          block
          loading={isLoading}
        >
          <span>Đăng nhập</span>
        </Button>
      </Form.Item>
      <div className="d-flex-center">
        <ForgotPasswordModal phoneNumberProp={phoneNumber}>
          <span className="forgot-pw">Quên mật khẩu</span>
        </ForgotPasswordModal>
        &nbsp;/&nbsp;
        <NewAccountModal>
          <span className="span-new-account">Tạo tài khoản</span>
        </NewAccountModal>
      </div>
    </Form>
  );
};

export default LoginPhone;
