import React, { useState } from 'react';
import { Button, Modal } from 'antd';
import { Alert, Form, Input, Typography } from 'antd';
import axios from '../../utils/axios';
import { toast } from 'react-toastify';

const ChangePasswordModal = ({ children }) => {
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errors, setErrors] = useState([]);

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    try {
      form
        .validateFields()
        .then(async (values) => {
          form.resetFields();
          const data = {
            oldPassword: values.currentPassword,
            newPassword: values.newPassword,
          };
          const res = await axios.put('/auth/change-password', data);
          if (res.errCode === 0) {
            setIsModalOpen(false);
            toast.success('Đổi mật khẩu thành công!');
            return;
          }
          setErrors([{ name: 'currentPassword', errors: res.message }]);
        })
        .catch((info) => {
          console.log('Validate Failed:', info);
          setErrors(info.errorFields);
        });
    } catch (error) {
      console.error('Failed to change password:', error);
    }
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };
  return (
    <>
      <span type="primary" onClick={showModal}>
        {children}
      </span>
      <Modal
        title="Đổi mật khẩu"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
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
          {errors.length > 0 && (
            <Alert
              message={errors.map((item, index) => (
                <Typography.Text key={index}>{item.errors}</Typography.Text>
              ))}
              type="error"
              showIcon
              closable
            />
          )}
          <Form.Item
            label="Mật khẩu hiện tại"
            name="currentPassword"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Mật khẩu mới"
            name="newPassword"
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
            label="Nhập lại mật khẩu mới"
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              {
                required: true,
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error('The new password that you entered do not match!')
                  );
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
export default ChangePasswordModal;
