import { Modal } from "antd";
import React, { useState } from "react";
import { Input } from 'antd';
import axios from '../../utils/axios';
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginStart } from "../../redux/actions/action.app";
import { STATE } from "../../redux/types/type.app";


const style = {
    title: {
        textAlign: 'center',
        fontSize: '20px',
        fontWeight: 'bold'
    },
    label: {
        fontStyle: 'italic'
    },
    input: {
        margin: '10px 0'
    }

}

const ForgotPasswordModal = ({ children }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const showModal = () => {
        setIsModalOpen(true);
    };

    const fetchUserByPhone = async (phoneNumber) => {
        let rs = await axios.get(`/users/user-by-phone?phoneNumber=${phoneNumber}`);
        if (rs.errCode === 0 && rs?.data) {
            const data = rs.data;
            data.status = STATE.FORGOT_PASSWORD;
            dispatch(loginStart(data));
            navigate(`/verify?id=${rs?.data?.id}`);
            setIsModalOpen(false);
        } else {
            toast.error(rs.message);
        }
    }

    const handleOk = () => {
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
            <span style={{ cursor: 'pointer', margin: 'auto' }} onClick={showModal}>
                {children}
            </span>
            <Modal Modal title="Quên mật khẩu" open={isModalOpen} onOk={handleOk} onCancel={handleCancel} >
                <label style={{ ...style.label }}>Nhập số điện thoại của bạn:</label>
                <Input type="text"
                    style={{ ...style.input }} placeholder="Basic usage" value={phoneNumber}
                    onChange={onChange}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleOk();
                        }
                    }}
                />
            </Modal>
        </>
    )

}


export default ForgotPasswordModal;