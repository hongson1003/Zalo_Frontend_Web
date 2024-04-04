import React, { useState } from 'react';
import { Button, Modal } from 'antd';
import { Menu } from 'antd';
import './setting.modal.scss';
import { Radio, Space, Select, Switch } from 'antd';
import ChangePasswordModal from './changePassword.modal';

const items = [
    {
        label: 'Cài đặt chung',
        key: 'setting-general',
        icon: <i className="fa-solid fa-gear"></i>,
    },
    {
        label: 'Quyền riêng tư & Bảo mật',
        key: 'setting-privacy',
        icon: <i className="fa-solid fa-display"></i>,
    },
    // {
    //     label: 'Giao diện',
    //     key: 'setting-display',
    //     icon: <i className="fa-solid fa-display"></i>,
    // },
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
        <div className='general'>
            <p className='title'>Danh bạ</p>
            <p className='dsbb'>Danh sách bạn bè được hiển thị trong danh bạn</p>
            <Radio.Group onChange={onChange} value={value} className='radio-group'>
                <Space direction="vertical">
                    <Radio value={1}>Hiển thị tất cả bạn bè</Radio>
                    <Radio value={2}>Chỉ hiển thị bạn bè đang online</Radio>
                </Space>
            </Radio.Group>
            <hr />
            <p className='title language'>Ngôn ngữ (Language)</p>
            <div className='group-language'>
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

}

export const PrivacySetting = () => {
    const onChange = (checked) => {
        // console.log(`switch to ${checked}`);
    };

    return (
        <div className='privacy'>
            <p className='title'>Mật khẩu đăng nhập</p>
            <ChangePasswordModal>
                <Button type='default'>Đổi mật khẩu</Button>
            </ChangePasswordModal>
            <p className='title'>Bảo mật</p>
            <div className='note-group'>
                <p className='note'>Sau khi bật, bạn có thể xác thực một vài chức năng bằng email thay vì số điện thoại</p>
                <Switch defaultChecked={false} disabled onChange={onChange} />
            </div>
            <Button type='default'>Xác thực</Button>
        </div>
    );

}

// export const DisplaySetting = () => {
//     return (
//         <div>
//             DisplaySetting
//         </div>
//     );
// }

export const NotifySetting = () => {
    const [value, setValue] = useState(2);

    const onChange = (e) => {
        // console.log('radio checked', e.target.value);
        setValue(e.target.value);
    };

    const handleOnChangeSpeaker = (checked) => {
        // console.log(`switch to ${checked}`);
    }

    return (
        <div className='notify'>
            <p className='title'>Hiển thị thông báo</p>
            <p className='note'>Popup thông báo mỗi khi có tin nhắn mới</p>
            <div className='group-notify'>
                <Radio.Group onChange={onChange} value={value} className='radio-group'>
                    <div className='notify-item notify'>
                        {
                            value === 1 ?
                                <img className='image' src='/images/notify-active.png' /> :
                                <img className='image' src='/images/notify.png' />
                        }
                        <Radio value={1}>Bật</Radio>
                    </div>
                    <div className='non-notify notify-item'>
                        <img className='image' src='/images/non-notify-active.png' />
                        <Radio value={2}>Tắt</Radio>
                    </div>
                </Radio.Group>

            </div>
            <p className='title'>Âm thanh thông báo</p>
            <div className='amthanh'>
                <p>Phát âm thanh khi có tin nhắn hoặc thông báo mới</p>
                <Switch defaultChecked onChange={handleOnChangeSpeaker} />
            </div>
        </div>
    );
}

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
            <span onClick={showModal}>
                {children}
            </span>
            <Modal
                title="Cài đặt"
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                className='setting-modal'
                width={750}
                footer={[]}
            >
                <div className='setting-container'>
                    <Menu
                        onClick={onClick}
                        selectedKeys={[current]}
                        mode="vertical" items={items}
                        className='setting-menu'
                    />
                    <div className='main-content'>
                        {current === 'setting-general' && <GeneralSetting />}
                        {current === 'setting-privacy' && <PrivacySetting />}
                        {/* {current === 'setting-display' && <DisplaySetting />} */}
                        {current === 'setting-notify' && <NotifySetting />}
                        {/* {current === 'setting-message' && <MessageSetting />} */}
                    </div>
                </div>
            </Modal>
        </>
    );
};
export default SettingModal;