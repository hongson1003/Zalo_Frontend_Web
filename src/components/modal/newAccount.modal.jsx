import { Button, Form, Input, Modal } from 'antd';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axios from '../../utils/axios';
const NewAccountModal = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const showModal = () => {
    setIsModalOpen(true);
  };
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (values) => {
    try {
      const res = await axios.post('/auth', values);
      if (res.errCode === 0) {
        toast.success('Tạo tài khoản thành công');
        form.resetFields();
        setIsModalOpen(false);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      console.log('error', error);
    }
  }

  const handleOk = async () => {
    form
      .validateFields()
      .then(async(values) => {
        console.log(values);
        setIsLoading(true);
        await handleRegister(values);
        setIsLoading(false);
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };


    return (
      <>
        <span onClick={showModal}>{children}</span>
        <Modal
          title="Tạo tài khoản mới"
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
          footer={[
            <Button key="back" onClick={handleCancel}>
              Hủy bỏ
            </Button>,
            <Button key="submit" type="primary" onClick={handleOk} loading={isLoading}>
              Xác nhận
            </Button>,
          ]}
        >
          <Form
      form={form}
      name="dependencies"
      autoComplete="off"
      style={{
        maxWidth: 600,
      }}
      layout="vertical"
    >

<Form.Item
        label="Họ và tên"
        name="userName"
        rules={[
          {
            required: true,
            message: 'Vui lòng nhập họ và tên!',
          },
        ]}
      >
        <Input/>
      </Form.Item>

      <Form.Item
        label="Phone"
        name="phoneNumber"
        rules={[
          {
            required: true,
            pattern: new RegExp(
              '^(0|84|\\+84)[3|5|7|8|9][0-9]{8}$',
            ),
            message: 'Vui lòng nhập đúng định dạng số điện thoại!',
          },
        ]}
      >
        <Input/>
      </Form.Item>

      <Form.Item
        label="Password"
        name="password"
        rules={[
          {
            required: true,
          },
        ]}
      >
        <Input />
      </Form.Item>

      {/* Field */}
      <Form.Item
        label="Confirm Password"
        name="password2"
        dependencies={['password']}
        rules={[
          {
            required: true,
          },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('The new password that you entered do not match!'));
            },
          }),
        ]}
      >
        <Input />
      </Form.Item>
    </Form>
        </Modal>
      </>
    );
  };

export default NewAccountModal;
