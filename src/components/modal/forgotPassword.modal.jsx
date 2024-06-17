import { Button, Modal } from 'antd';
import React, { useEffect, useState } from 'react';
import { Input } from 'antd';
import axios from '../../utils/axios';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginStart } from '../../redux/actions/app.action';
import { STATE } from '../../redux/types/app.type';

const style = {
  title: {
    textAlign: 'center',
    fontSize: '20px',
    fontWeight: 'bold',
  },
  label: {
    fontStyle: 'italic',
  },
  input: {
    margin: '10px 0',
  },
};

const ForgotPasswordModal = ({ children, phoneNumberProp }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');

  const showModal = () => {
    setIsModalOpen(true);
  };

  useEffect(() => {
    setPhoneNumber(phoneNumberProp);
  }, [phoneNumberProp]);

  const fetchUserByPhone = async (phoneNumber) => {
    try {
      let rs = await axios.get(
        `/users/user-by-phone?phoneNumber=${phoneNumber}`
      );
      if (rs.errCode === 0 && rs?.data) {
        const data = rs.data;
        data.status = STATE.FORGOT_PASSWORD;
        dispatch(loginStart(data));
        navigate(`/verify?id=${rs?.data?.id}`);
        setIsModalOpen(false);
      } else {
        toast.error(rs.message);
      }
    } catch (error) {
      console.log('Failed to fetch user by phone:', error);
    }
  };

  const handleOk = () => {
    if (!phoneNumber) {
      toast.error('Vui lòng nhập số điện thoại');
      return;
    }
    fetchUserByPhone(phoneNumber);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const onChange = (event) => {
    if (event.target.value >= '0' && event.target.value <= '9')
      setPhoneNumber(event.target.value);
  };

  return (
    <>
      <span onClick={showModal}>{children}</span>
      <Modal
        title="Quên mật khẩu"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Hủy bỏ
          </Button>,
          <Button key="submit" type="primary" onClick={handleOk}>
            Xác nhận
          </Button>,
        ]}
      >
        <label style={{ ...style.label }}>Nhập số điện thoại của bạn:</label>
        <Input
          type="text"
          style={{ ...style.input }}
          placeholder="Số điện thoại"
          value={phoneNumber}
          onChange={onChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleOk();
            }
          }}
        />
      </Modal>
    </>
  );
};

export default ForgotPasswordModal;
