import React, { useEffect, useRef, useState } from "react";
import './verify.component.scss';
import OtpInput from 'react-otp-input';
import { Button, Flex } from "antd";
import { auth } from "../utils/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from '../utils/axios';
import { loginSuccess } from '../redux/actions/action.app';
import { toast } from "react-toastify";

const VerifyComponent = (props) => {
    const [otp, setOtp] = useState('');
    const state = useSelector(state => state.appReducer);
    const [phoneNumber, setPhoneNumber] = useState('');
    const navigate = useNavigate();
    const recaptchaRef = useRef(null);
    const dispatch = useDispatch();
    const onlyRef = useRef(0);
    useEffect(() => {
        if (state?.isLogin === true) {
            navigate('/');
        }
        if (state?.userInfo) {
            let phone = state.userInfo?.phoneNumber;
            if (phone) {
                setPhoneNumber("+84" + phone.slice(1))
            }
        } else {
            navigate('/login');
        }

    }, [state])

    useEffect(() => {
        if (phoneNumber && onlyRef.current === 0 && state.isLogin === false) {
            handleSend(phoneNumber);
            onlyRef.current = 1;
        }
    }, [phoneNumber, state])



    const generateRecaptcha = () => {
        try {
            window.recaptchaVerifier = new RecaptchaVerifier(
                "recaptcha-container",
                {},
                auth
            );
        } catch (error) {
            console.log(error)
        }
    };

    const handleSend = (phoneNumber) => {
        if (!phoneNumber) {
            toast.warning('Có lỗi xảy ra, vui lòng đăng nhập lại !')
            return;
        }

        generateRecaptcha();
        let appVerifier = window.recaptchaVerifier;
        signInWithPhoneNumber(auth, phoneNumber, appVerifier)
            .then((confirmationResult) => {
                // SMS sent. Prompt user to type the code from the message, then sign the
                // user in with confirmationResult.confirm(code).
                if (recaptchaRef.current) {
                    recaptchaRef.current.style.display = 'none'
                }
                window.confirmationResult = confirmationResult;
            }).catch((error) => {
                // Error; SMS not sent
                console.log(error)
            });
    }

    const verifyUser = async (id, phoneNumber) => {
        let rs = await axios.post('/auth/verify', {
            id, phoneNumber
        });
        if (rs.errCode === 0) {
            return loginSuccess(rs.data);
        }
    }

    const verifyOtp = async () => {
        // Kiểm tra thôi mà
        if (otp.length === 6) {
            // verifu otp
            let confirmationResult = window.confirmationResult;
            confirmationResult.confirm(otp).then(async (result) => {
                // gọi api xác nhận
                const action = await verifyUser(state?.userInfo?.id, state?.userInfo?.phoneNumber);
                dispatch(action);
                navigate('/');
            }).catch((error) => {
                alert('User couldn\'t sign in (bad verification code?)');
            });
        }
    }



    return (
        <div className="verify-container">
            <h1 className="title">Xác minh tài khoản</h1>
            <OtpInput
                value={otp}
                onChange={(value) => { setOtp(value) }}
                numInputs={6}
                renderSeparator={<span>-</span>}
                renderInput={(props) => <input {...props} />}
                inputStyle={{
                    width: 'calc(30px + 3.5vw)',
                    height: '45px',
                    fontSize: '20px'
                }}
                containerStyle={{
                    minWidth: '400px',
                    display: 'flex',
                    justifyContent: 'center',
                    margin: '40px 0px'
                }}
                shouldAutoFocus
                inputType="tel"
            />
            <div ref={recaptchaRef} id="recaptcha-container"></div>

            <Flex justify="space-around" gap='60px' className="btn-group">
                <Button className="verify" type="primary" onClick={() => verifyOtp()}>Verify</Button>
            </Flex>

            <div className="footer">
                <p>** Vui lòng kiểm tra điện thoại để nhận mã xác thực</p>
            </div>

        </div>
    )
}

export default VerifyComponent;