import React, { useEffect, useState } from 'react';
import { Button, Input, Modal } from 'antd';
import { Menu } from 'antd';
import './setting.modal.scss';
import { Radio, Space, Select, Switch } from 'antd';
import ChangePasswordModal from './changePassword.modal';
import { CloseCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import { STATE } from '../../redux/types/app.type';
import axios from '../../utils/axios';
import { useSelector } from 'react-redux';
import { FILTER, SETTING } from '../../redux/types/user.type';

const items = [
  {
    label: 'Cài đặt chung',
    key: 'setting-general',
    icon: <i className="fa-solid fa-gear"></i>,
  },
  {
    label: 'Tài khoản & Bảo mật',
    key: 'setting-privacy',
    icon: <i className="fa-solid fa-display"></i>,
  },
  {
    label: 'Quyền riêng tư',
    key: 'setting-role-private',
    icon: <i className="fa-solid fa-lock"></i>,
  },
  {
    label: 'Thông báo',
    key: 'setting-notify',
    icon: <i className="fa-regular fa-bell"></i>,
  },
  // {
  //     label: 'Tin nhắn',
  //     key: 'setting-message',
  //     icon: <i className="fa-regular fa-comment"></i>,
  // }
];

export const GeneralSetting = () => {
  const [value, setValue] = useState(1);
  const onChange = (e) => {
    setValue(e.target.value);
  };

  const handleChange = (value) => {
    // console.log(`selected ${value}`);
  };

  return (
    <div className="general">
      <p className="title">Danh bạ</p>
      <p className="dsbb">Danh sách bạn bè được hiển thị trong danh bạn</p>
      <Radio.Group onChange={onChange} value={value} className="radio-group">
        <Space direction="vertical">
          <Radio value={1}>Hiển thị tất cả bạn bè</Radio>
          <Radio value={2}>Chỉ hiển thị bạn bè đang online</Radio>
        </Space>
      </Radio.Group>
      <hr />
      <p className="title language">Ngôn ngữ (Language)</p>
      <div className="group-language">
        <p>Thay đổi ngôn ngữ</p>
        <Select
          defaultValue="VI"
          style={{
            width: 120,
          }}
          onChange={handleChange}
          options={[
            {
              value: 'VI',
              label: 'Việt Nam',
            },
            {
              value: 'ENG',
              label: 'English',
            },
          ]}
        />
      </div>
    </div>
  );
};
const regexEmail = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[A-Za-z]+$/;

export const PrivacySetting = () => {
  const [email, setEmail] = useState('');
  const [text, setText] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [timeOut, setTimeOut] = useState(60);
  const user = useSelector((state) => state.appReducer?.userInfo?.user);

  const onChange = (checked) => {
    console.log(`switch to ${checked}`);
  };

  const getInfo = async () => {
    try {
      if (user) {
        const res = await axios.get('/users/info?id=' + user.id);
        if (res.errCode === 0) {
          const { data } = res;
          if (data.email) {
            setEmail(data.email);
            setStatus(STATE.RESOLVE);
          }
        }
      } else {
        setEmail('');
        toast.warn('Vui lòng đăng nhập để sử dụng chức năng này !!!');
      }
    } catch (error) {
      console.log('getInfo', error);
      toast.error('Có lỗi xảy ra, vui lòng thử lại sau !!!');
    }
  };

  useEffect(() => {
    getInfo();
  }, [user]);

  const handleAddEmail = () => {
    setStatus(STATE.READY);
  };

  const handleSendEmail = async () => {
    // send email
    try {
      setIsLoading(true);
      const res = await axios.post('/users/send-verify-email', { email: text });
      setIsLoading(false);
      if (res.errCode === 0) {
        setStatus(STATE.PENDING);
        toast.success(
          'Đã gửi email xác minh, vui lòng kiểm tra email để nhận mã xác thực !!!',
          {
            autoClose: 7000,
            position: 'top-center',
            closeButton: false,
          }
        );

        const interval = setInterval(() => {
          setTimeOut((prev) => {
            if (prev === 0) {
              clearInterval(interval);
              setStatus('');
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        toast.error('Có lỗi xảy ra, vui lòng thử lại sau !!!', {
          autoClose: 7000,
          position: 'top-center',
        });
      }
    } catch (error) {
      console.log('handleSendEmail', error);
      toast.error('Có lỗi xảy ra, vui lòng thử lại sau !!!');
    }
  };

  const handleVerify = async () => {
    try {
      setIsLoading(true);
      const res = await axios.post('/users/verify-email', {
        email: text,
        code: otp,
      });
      setIsLoading(false);
      if (res.errCode === 0) {
        setStatus(STATE.SUCCESS);
        getInfo();
        toast.success('Xác minh email thành công !!!');
      } else {
        toast.error('Mã xác minh không chính xác !!!');
      }
    } catch (error) {
      console.log('handleVerify', error);
      toast.error('Có lỗi xảy ra, vui lòng thử lại sau !!!');
    }
  };

  const handleChangeEmail = () => {
    console.log('change email');
  };

  return (
    <div className="privacy">
      <p className="title">Mật khẩu đăng nhập</p>
      <ChangePasswordModal>
        <Button type="default">Đổi mật khẩu</Button>
      </ChangePasswordModal>
      <p className="title">Bảo mật</p>
      <div className="note-group">
        <p className="note">
          Sau khi bật, bạn có thể xác thực một vài chức năng bằng email thay vì
          số điện thoại
        </p>
        <Switch defaultChecked={false} disabled={!email} onChange={onChange} />
      </div>
      <div className="add-email">
        {!status ? (
          <Button type="default" onClick={handleAddEmail}>
            Thêm email
          </Button>
        ) : status === STATE.READY ? (
          <>
            <Input value={text} onChange={(e) => setText(e.target.value)} />
            {!regexEmail.test(text) ? (
              <CloseCircleOutlined style={{ color: '#FF0000' }} />
            ) : (
              <CheckCircleOutlined style={{ color: '#52c41a' }} />
            )}
            <Button
              type="primary"
              onClick={handleSendEmail}
              loading={isLoading}
            >
              Xác minh
            </Button>
          </>
        ) : status === STATE.PENDING ? (
          <>
            <label>Nhập mã OTP</label>
            <Input value={otp} onChange={(e) => setOtp(e.target.value)} />
            <Button loading={isLoading} type="primary" onClick={handleVerify}>
              <span>Xác nhận</span>
              &nbsp;
              <span>{timeOut} s</span>
            </Button>
          </>
        ) : (
          <>
            <Input value={email} />
            <Button type="default" onClick={handleChangeEmail}>
              Thay đổi
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export const RolePrivate = () => {
  const [setting, setSetting] = useState([]);

  const onChange = (item) => {
    console.log(item);
  };

  return (
    <div className="role-private">
      <div className="session">
        <p className="session-title">Cá nhân</p>
        <div className="options">
          <div className="item">
            <p className="name">Hiện ngày sinh</p>
            <Switch onChange={() => onChange(SETTING.SHOW_DATE)} />
          </div>
          <div className="item">
            <p className="name">Hiển thị trạng thái truy cập</p>
            <Switch onChange={() => onChange(SETTING.SHOW_STATUS_ONLINE)} />
          </div>
        </div>
      </div>

      <div className="session">
        <p className="session-title">Tin nhắn và cuộc gọi</p>
        <div className="options">
          <div className="item">
            <p className="name">Hiển thị trạng thái đã xem</p>
            <Switch onChange={() => onChange(SETTING.SHOW_SEEN)} />
          </div>
          <div className="item">
            <p className="name">Cho phép nhắn tin</p>
            <Select
              defaultValue={FILTER.ALL}
              style={{
                width: 150,
              }}
              onChange={onChange}
              options={[
                {
                  value: FILTER.ALL,
                  label: 'Tất cả mọi người',
                },
                {
                  value: FILTER.FRIENDS,
                  label: 'Bạn bè',
                },
              ]}
            />
          </div>

          <div className="item">
            <p className="name">Cho phép gọi điện</p>
            <Select
              defaultValue={FILTER.FRIENDS}
              style={{
                width: 150,
              }}
              onChange={onChange}
              options={[
                {
                  value: FILTER.ALL,
                  label: 'Tất cả mọi người',
                },
                {
                  value: FILTER.FRIENDS,
                  label: 'Bạn bè',
                },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="session">
        <p className="session-title">Cho phép người lạ kết bạn</p>
        <div className="options">
          <div className="item">
            <p className="name">Mã QR của tôi</p>
            <Switch
              defaultChecked
              onChange={() => onChange(SETTING.SHOW_DATE)}
            />
          </div>
          <div className="item">
            <p className="name">Nhóm chung</p>
            <Switch
              defaultChecked
              onChange={() => onChange(SETTING.SHOW_STATUS_ONLINE)}
            />
          </div>
          <div className="item">
            <p className="name">Danh thiếp</p>
            <Switch
              defaultChecked
              onChange={() => onChange(SETTING.SHOW_STATUS_ONLINE)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const NotifySetting = () => {
  const [value, setValue] = useState(2);

  const onChange = (e) => {
    // console.log('radio checked', e.target.value);
    setValue(e.target.value);
  };

  const handleOnChangeSpeaker = (checked) => {
    // console.log(`switch to ${checked}`);
  };

  return (
    <div className="notify">
      <p className="title">Hiển thị thông báo</p>
      <p className="note">Popup thông báo mỗi khi có tin nhắn mới</p>
      <div className="group-notify">
        <Radio.Group onChange={onChange} value={value} className="radio-group">
          <div className="notify-item notify">
            {value === 1 ? (
              <img className="image" src="/images/notify-active.png" />
            ) : (
              <img className="image" src="/images/notify.png" />
            )}
            <Radio value={1}>Bật</Radio>
          </div>
          <div className="non-notify notify-item">
            <img className="image" src="/images/non-notify-active.png" />
            <Radio value={2}>Tắt</Radio>
          </div>
        </Radio.Group>
      </div>
      <p className="title">Âm thanh thông báo</p>
      <div className="amthanh">
        <p>Phát âm thanh khi có tin nhắn hoặc thông báo mới</p>
        <Switch defaultChecked onChange={handleOnChangeSpeaker} />
      </div>
    </div>
  );
};

// export const MessageSetting = () => {
//     return (
//         <div>
//             MessageSetting
//         </div>
//     );
// }

const SettingModal = ({ children }) => {
  const [current, setCurrent] = useState('setting-general');
  const onClick = (e) => {
    // console.log('click ', e);
    setCurrent(e.key);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };
  return (
    <>
      <span onClick={showModal}>{children}</span>
      <Modal
        title="Cài đặt"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        className="setting-modal"
        width={750}
        footer={[]}
      >
        <div className="setting-container">
          <Menu
            onClick={onClick}
            selectedKeys={[current]}
            mode="vertical"
            items={items}
            className="setting-menu"
          />
          <div className="main-content">
            {current === 'setting-general' && <GeneralSetting />}
            {current === 'setting-privacy' && <PrivacySetting />}
            {current === 'setting-role-private' && <RolePrivate />}
            {current === 'setting-notify' && <NotifySetting />}
            {/* {current === 'setting-message' && <MessageSetting />} */}
          </div>
        </div>
      </Modal>
    </>
  );
};
export default SettingModal;
