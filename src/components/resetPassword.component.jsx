import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { Button, Checkbox, Form, Input } from 'antd';
import './resetPassword.component.scss';

const ResetPassword = () => {
    const state = useSelector(state => state.appReducer);
    const navigate = useNavigate();
    useEffect(() => {
        // if (!state.userInfo) {
        //     navigate('/login');
        // }
    }, [])

    const onFinish = ({ values }) => {
        console.log('Success:', values);
    };
    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };


    return (
        <div className="reset-container">
            <h1 className="title">Reset Password</h1>
            <Form
                name="basic"
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
                    label="Số điện thoại"
                    name="phoneNumber"
                    rules={[
                        {
                            required: true,
                            message: 'Please input your phoneNumber!',
                        },
                    ]}
                >
                    <Input disabled value={state?.userInfo?.phoneNumber} />
                </Form.Item>

                <Form.Item
                    label="New Password"
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
                    label="Confirm New Password"
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
                    wrapperCol={{
                        offset: 8,
                        span: 16,
                    }}
                >
                    <Button type="primary" htmlType="submit">
                        Submit
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
}

export default ResetPassword;