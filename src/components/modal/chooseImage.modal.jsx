import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'antd';
import './chooseImage.modal.scss';
import axios from '../../utils/axios';
import { PictureOutlined } from '@ant-design/icons';
import Zoom from 'react-medium-image-zoom';
import { useDispatch, useSelector } from 'react-redux';
import { editUser } from '../../redux/actions/app.action';
import { toast } from 'react-toastify';
import { useForm } from 'antd/es/form/Form';

const uploadPreset = import.meta.env.VITE_APP_CLOUNDINARY_UPLOAD_PRESET;
const cloudName = import.meta.env.VITE_APP_CLOUNDINARY_CLOUD_NAME;
const folder = import.meta.env.VITE_APP_CLOUNDINARY_FOLDER;

const ChooseImageModal = ({
  children,
  setGroupPhoto,
  setFile,
  data,
  type,
  handleChangeAvatar,
  avatar,
  image,
  fetchInfoUser,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    setIsLoading(true);
    if (type === 'avatar') {
      const base64 = await convertBase64(image);
      uploadAvatar(base64);
    } else if (type === 'background-cover') {
      // edit background cover
      await uploadBackgroundToCloud(image);
    }
    setIsLoading(false);
    setIsModalOpen(false);
  };

  const uploadBackgroundToCloud = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      formData.append('cloud_name', cloudName);
      formData.append('folder', folder);
      if (file) {
        const image = file.name;
        const name = image.split('.')[0];
        const extName = image.split('.')[1];
        const imgUpload = name + '-' + new Date().getTime() + '.' + extName;
        formData.append('public_id', imgUpload); // Thêm tham số public_id vào formData
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );
        const data = await response.json();
        if (data && data.secure_url) {
          const res = await axios.put('/users/updateInfor', {
            coverImage: data.secure_url,
          });
          if (res.errCode === 0) {
            toast.success('Cập nhật ảnh bìa thành công');
            fetchInfoUser(res.data.id);
            handleChangeAvatar(null, null);
          }
        }
      }
    } catch (error) {
      console.log('Error when upload background cover: ', error);
      toast.error('Có lỗi xảy ra khi cập nhật ảnh bìa');
    }
  };

  const handleCancel = () => {
    if (handleChangeAvatar) handleChangeAvatar(null, null);
    setIsModalOpen(false);
  };

  const convertBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => {
        resolve(fileReader.result);
      };
      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  const uploadAvatar = async (base64) => {
    try {
      const res = await axios.put('/users/avatar', { avatar: base64 });
      if (res.errCode === 0) {
        dispatch(editUser(res.data));
      }
    } catch (error) {
      console.error('Failed to upload avatar:', error);
    }
  };

  const handleChooseGroupPhoto = (url) => {
    setGroupPhoto(url);
    setIsModalOpen(false);
  };

  const handleOnChangeImage = async (event) => {
    if (event.target.files && event.target.files[0]) {
      let img = event.target.files[0];
      if (type === 'avatar' || type === 'background-cover') {
        handleChangeAvatar(URL.createObjectURL(img), img);
      } else {
        setGroupPhoto(URL.createObjectURL(img));
        if (img) {
          saveGroupPhoto(img);
        }
      }
    }
  };

  const saveGroupPhoto = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('cloud_name', cloudName);
    formData.append('folder', folder);
    if (file) {
      const image = file.name;
      const name = image.split('.')[0];
      const extName = image.split('.')[1];
      const imgUpload = name + '-' + new Date().getTime() + '.' + extName;
      formData.append('public_id', imgUpload); // Thêm tham số public_id vào formData
      setFile(formData);
      handleOk();
    }
  };

  return (
    <>
      <span onClick={showModal}>{children}</span>
      <Modal
        title="Cập nhật ảnh đại diện"
        open={isModalOpen}
        centered
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Hủy
          </Button>,
          <Button
            disabled={!image}
            key="submit"
            type="primary"
            onClick={handleOk}
            loading={isLoading}
          >
            Cập nhật
          </Button>,
        ]}
        forceRender={false}
        destroyOnClose={true}
      >
        <hr />
        {avatar && (type === 'avatar' || type === 'background-cover') && (
          <Zoom>
            <img className="image-preview" src={avatar} alt="Ảnh preview" />
          </Zoom>
        )}
        <div className="group-photo-main">
          <div className="upload-groupPhoto">
            <label htmlFor="upload">
              <PictureOutlined />
              <span>Tải ảnh lên từ máy tính</span>
            </label>
            <input
              type="file"
              accept="image/png, image/gif, image/jpeg"
              hidden
              id="upload"
              onChange={handleOnChangeImage}
            />
          </div>

          <div className="group-collection">
            {data &&
              data.length > 0 &&
              data.map((collection) => (
                <div
                  key={collection.key}
                  className="group-collection-item"
                  onClick={() => handleChooseGroupPhoto(collection.url)}
                >
                  <img
                    className="collection-item"
                    src={collection.url}
                    alt="group"
                  />
                </div>
              ))}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ChooseImageModal;
