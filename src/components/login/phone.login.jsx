import React, { useEffect } from "react";
import { LockOutlined, PhoneOutlined } from '@ant-design/icons';
import { Button, Form, Input } from 'antd';
import './phone.login.scss';
import { useNavigate } from "react-router-dom";
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { notification } from 'antd'
import { useDispatch } from "react-redux";
import { loginStart, loginSuccess } from "../../redux/actions/action.app";
import axios, { setAuthorizationAxios } from '../../utils/axios';

const LoginPhone = () => {
    const dispatch = useDispatch();

    const navigate = useNavigate();

    const onFinish = async (values) => {
        let rs = await axios.post('/auth/login', values);
        if (rs.errCode === 0) {
            dispatch(loginStart(rs.data));
            navigate(`/verify?id=${rs?.data?.id}`);
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
                <Input style={{ gap: '5px' }} prefix={<PhoneOutlined className="site-form-item-icon" />} placeholder="Số điện thoại" />
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
                <Button type="primary" htmlType="submit" className="login-form-button" block>
                    <span>Đăng nhập</span>
                </Button>

            </Form.Item>
            <div>
                <p className="forgot-pw">
                    <a href="#">Quên mật khẩu ?</a>
                </p>
            </div>
        </Form>
    )
}

export default LoginPhone;