import React, { useEffect, useRef, useState } from 'react';
import './verify.component.scss';
import OtpInput from 'react-otp-input';
import { Button, Flex } from 'antd';
import { auth } from '../utils/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios, { setAuthorizationAxios } from '../utils/axios';
import { loginSuccess } from '../redux/actions/app.action';
import { ToastContainer, toast } from 'react-toastify';
import ReactLoading from 'react-loading';
import { STATE } from '../redux/types/app.type';
import AvatarUser from '../components/user/avatar';

const VerifyComponent = (props) => {
  const [otp, setOtp] = useState('');
  const state = useSelector((state) => state.appReducer);
  const [phoneNumber, setPhoneNumber] = useState('');
  const navigate = useNavigate();
  const recaptchaRef = useRef(null);
  const dispatch = useDispatch();
  const onlyRef = useRef(0);
  const [recaptchaIsResolve, setRecaptchaIsResolve] = useState(false);
  const [isFocus, setIsFocus] = useState(false);
  const [time, setTime] = useState(60);
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (state?.isLogin === STATE.RESOLVE) {
      navigate('/');
    }
    if (state?.userInfo) {
      let phone = state.userInfo?.phoneNumber;
      if (phone) {
        setPhoneNumber('+84' + phone.slice(1));
      }
    } else {
      navigate('/login');
    }
  }, [state]);

  useEffect(() => {
    if (phoneNumber && onlyRef.current === 0 && state.isLogin !== true) {
      handleSend(phoneNumber);
      onlyRef.current = 1;
    }
  }, [phoneNumber, state]);

  useEffect(() => {
    let clock = null;
    if (sent) {
      clock = setInterval(() => {
        setTime((time) => {
          if (time === 0) {
            clearInterval(clock);
            setTimeout(() => {
              navigate('/login');
            }, 500);
            return time;
          }
          return time - 1;
        });
      }, 1000);
    }
    return () => {
      if (clock) {
        clearInterval(clock);
      }
    };
  }, [sent]);

  useEffect(() => {
    if (otp.length === 6) {
      verifyOtp();
    }
  }, [otp]);

  const generateRecaptcha = () => {
    try {
      window.recaptchaVerifier = new RecaptchaVerifier(
        'recaptcha-container',
        {
          // 'size': 'invisible',
          callback: (response) => {
            // reCAPTCHA solved, allow signInWithPhoneNumber.
            setRecaptchaIsResolve(true);
            setTimeout(() => {
              setIsFocus(true);
            }, 200);
          },
        },
        auth
      );
    } catch (error) {
      console.log(error);
    }
  };

  const handleSend = (phoneNumber) => {
    if (!phoneNumber) {
      toast.warning('Có lỗi xảy ra, vui lòng đăng nhập lại !');
      return;
    }
    generateRecaptcha();
    let appVerifier = window.recaptchaVerifier;
    signInWithPhoneNumber(auth, phoneNumber, appVerifier)
      .then((confirmationResult) => {
        // SMS sent. Prompt user to type the code from the message, then sign the
        // user in with confirmationResult.confirm(code).
        setSent(true);
        if (recaptchaRef.current) {
          recaptchaRef.current.style.display = 'none';
        }
        window.confirmationResult = confirmationResult;
      })
      .catch((error) => {
        // Error; SMS not sent
        console.log(error);
      });
  };

  const verifyUser = async (id, phoneNumber) => {
    try {
      let rs = await axios.post('/auth/verify', {
        id,
        phoneNumber,
      });
      if (rs.errCode === 0) {
        setAuthorizationAxios(rs.data.access_token);
        return loginSuccess(rs.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const verifyOtp = async () => {
    // Kiểm tra thôi mà
    if (otp.length === 6) {
      // verifu otp
      setIsLoading(true);
      let confirmationResult = window.confirmationResult;
      confirmationResult
        .confirm(otp)
        .then(async (result) => {
          // gọi api xác nhận
          setIsLoading(false);
          if (state.userInfo?.status === STATE.FORGOT_PASSWORD)
            navigate('/reset-password');
          else {
            const action = await verifyUser(
              state?.userInfo?.id,
              state?.userInfo?.phoneNumber
            );
            dispatch(action);
            navigate('/');
          }
        })
        .catch((error) => {
          toast.error('Mã OTP không chính xác, vui lòng thử lại !');
        });
    }
  };

  return (
    <div className="container">
      <div className="verify-container">
        <h1 className="title">XÁC THỰC TÀI KHOẢN</h1>
        {state.userInfo?.avatar && (
          <>
            <AvatarUser
              image={state?.userInfo?.avatar}
              name={state?.userInfo?.userName}
              zoom
              size={70}
            />

            <p
              style={{
                textAlign: 'center',
                marginTop: '5px',
                fontWeight: 'bold',
              }}
            >
              {state.userInfo.userName}
            </p>
            {recaptchaIsResolve === false ? (
              <p className="notify">
                Vui lòng xác thực bạn là người thật
                <img
                  className="xacminh-img"
                  src="/images/xacminhnguoithat.jpg"
                />
                ...
              </p>
            ) : (
              <p className="notify">
                Vui lòng nhập mã OTP để đăng nhập vào máy tính
              </p>
            )}
          </>
        )}
        {recaptchaIsResolve && (
          <>
            <OtpInput
              value={otp}
              onChange={(value) => setOtp(value)}
              numInputs={6}
              renderSeparator={<span>-</span>}
              renderInput={(props) => <input {...props} />}
              inputStyle={{
                width: 'calc(30px + 3.5vw)',
                height: '45px',
                fontSize: '20px',
              }}
              containerStyle={{
                minWidth: '400px',
                display: 'flex',
                justifyContent: 'center',
                margin: '20px 0px',
              }}
              shouldAutoFocus={isFocus}
              inputType="tel"
            />
            {sent &&
              (time === 0 ? (
                <>
                  <ReactLoading type={'cylon'} color={'blue'} />
                  <p style={{ textAlign: 'center' }}>
                    Hết thời gian, vui lòng đăng nhập lại
                  </p>
                </>
              ) : (
                <p style={{ textAlign: 'center' }}>{time} s</p>
              ))}
            <Flex justify="space-around" gap="60px" className="btn-group">
              <Button
                disabled={otp.length !== 6}
                loading={isLoading}
                className="verify"
                type="primary"
                onClick={() => verifyOtp()}
              >
                Verify
              </Button>
            </Flex>
          </>
        )}
        <div ref={recaptchaRef} id="recaptcha-container"></div>

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
    </div>
  );
};

export default VerifyComponent;
