import React, { useEffect, useState } from "react";
import { Form, Input, Button, Image } from "antd";
import { ToastContainer, toast } from "react-toastify";
import './updateInfor.scss'

const UpdateInfo = () => {
    //const avatar = state?.userInfo?.avatar;
    const avatar = 'https://www.google.com/imgres?q=avatar&imgurl=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fvi%2Fthumb%2Fb%2Fb0%2FAvatar-Teaser-Poster.jpg%2F220px-Avatar-Teaser-Poster.jpg&imgrefurl=https%3A%2F%2Fvi.wikipedia.org%2Fwiki%2FAvatar_(phim_2009)&docid=p8GOuwDSp7mPEM&tbnid=WdkBIoBapq5_DM&vet=12ahUKEwjV_7rO746FAxXDslYBHdtGA6AQM3oECBsQAA..i&w=220&h=330&hcb=2&ved=2ahUKEwjV_7rO746FAxXDslYBHdtGA6AQM3oECBsQAA'
    return (
        <div className="infor-container">
            <h1 className="title">Cập nhật thông tin</h1>
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
            >
                <Form.Item className="form-item-header">
                    <Image source={avatar} className="avt-image"/>
                </Form.Item>
    
                <Form.Item className="form-item"
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
    
    
                <Form.Item className="form-item"
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
    
    
                <Form.Item className="form-item"
                    wrapperCol={{
                        offset: 8,
                        span: 16,
                    }}
                >
                    <Button type="primary" htmlType="submit">
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
}
export default UpdateInfo;


