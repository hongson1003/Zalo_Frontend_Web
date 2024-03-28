import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'antd';
import './chooseGroupPhoto.modal.scss';

import { PictureOutlined } from '@ant-design/icons';
const uploadPreset = import.meta.env.VITE_APP_CLOUNDINARY_UPLOAD_PRESET;
const cloudName = import.meta.env.VITE_APP_CLOUNDINARY_CLOUD_NAME;
const folder = import.meta.env.VITE_APP_CLOUNDINARY_FOLDER;


const ChooseGroupPhotoModal = ({ children, setGroupPhoto, setFile }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [collections, setCollections] = useState([]);

    const showModal = () => {
        setIsModalOpen(true);
    };
    const handleOk = () => {
        setIsModalOpen(false);
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const fetchGroupPhotos = async () => {
        const response = await fetch("/groupPhoto/data.json");
        const images = await response.json();
        setCollections(images);
    }

    useEffect(() => {
        fetchGroupPhotos();
    }, [])

    const handleChooseGroupPhoto = (url) => {
        setGroupPhoto(url);
        setIsModalOpen(false);
    }


    const handleOnChangeImage = async (event) => {
        if (event.target.files && event.target.files[0]) {
            let img = event.target.files[0];
            setGroupPhoto(URL.createObjectURL(img));
            if (img) {
                saveGroupPhoto(img);
            }
        }
    }

    const saveGroupPhoto = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);
        formData.append("cloud_name", cloudName);
        formData.append("folder", folder);
        if (file) {
            const image = file.name;
            const name = image.split('.')[0];
            const extName = image.split('.')[1];
            const imgUpload = name + '-' + new Date().getTime() + '.' + extName;
            formData.append('public_id', imgUpload); // Thêm tham số public_id vào formData
            setFile(formData);
            handleOk();
        }
    }

    return (
        <>
            <span onClick={showModal}>{children}</span>
            <Modal
                title="Cập nhật ảnh đại diện"
                open={isModalOpen} onOk={handleOk} onCancel={handleCancel}
                centered
            >
                <hr />
                <div className='group-photo-main'>
                    <div className='upload-groupPhoto'>
                        <label htmlFor='upload'>
                            <PictureOutlined />
                            <span>Tải ảnh lên từ máy tính</span>
                        </label>
                        <input type='file' hidden id='upload' onChange={handleOnChangeImage} />
                    </div>

                    <div className='group-collection'>
                        {
                            collections && collections.length > 0 && collections.map((collection, index) => (
                                <div
                                    key={collection.key} className='group-collection-item'
                                    onClick={() => handleChooseGroupPhoto(collection.url)}
                                >
                                    <img className='collection-item' src={collection.url} alt='group' />
                                </div>
                            ))
                        }
                    </div>
                </div>
            </Modal>
        </>
    );
}

export default ChooseGroupPhotoModal;