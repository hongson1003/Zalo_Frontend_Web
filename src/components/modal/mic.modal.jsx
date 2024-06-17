import React, { useCallback, useEffect, useMemo, useState } from 'react';
import './mic.modal.scss';
import { Modal, Button } from 'antd';
import MicRecorder from 'mic-recorder-to-mp3';
var recorder = null;
import ReactLoading from 'react-loading';

const MicModal = ({ children, sendAudio }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [file, setFile] = useState(null);

  useMemo(() => {
    recorder = new MicRecorder({
      bitRate: 128,
    });
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = async () => {
    if (file) {
      sendAudio(file);
      setFile(null);
      setIsModalOpen(false);
    }
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
    setIsRecording(false);
    setFile(null);
  };

  const handleOnClick = () => {
    if (!isRecording) {
      setFile(null);
      // start recording
      // Start recording. Browser will request permission to use your microphone.
      recorder
        .start()
        .then(() => {
          // something else
        })
        .catch((e) => {
          console.error(e);
        });
    } else {
      // stop recording
      recorder
        .stop()
        .getMp3()
        .then(([buffer, blob]) => {
          // do what ever you want with buffer and blob
          // Example: Create a mp3 file and play
          const file = new File(buffer, 'me-at-thevoice.mp3', {
            type: blob.type,
            lastModified: Date.now(),
          });
          setFile(file);
        })
        .catch((e) => {
          alert('We could not retrieve your message');
          console.log(e);
        });
    }
    setIsRecording((prev) => !prev);
  };

  return (
    <React.Fragment>
      <span onClick={showModal}>{children}</span>

      <Modal
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        centered
        title="Record Audio"
        footer={[
          <Button key="back" onClick={handleCancel}>
            Quay lại
          </Button>,
          <Button key="submit" type="primary" onClick={handleOk}>
            Gửi
          </Button>,
        ]}
        destroyOnClose
      >
        <div className="mic-container">
          <div className="mic-item" onClick={handleOnClick}>
            {isRecording ? (
              <i className="fa-solid fa-microphone"></i>
            ) : (
              <i className="fa-solid fa-microphone-slash"></i>
            )}
          </div>
          {isRecording && (
            <ReactLoading
              type={'bars'}
              color={'#aadbdf'}
              height={'20%'}
              width={'20%'}
            />
          )}
          {file && (
            <div className="audio-item">
              <audio controls>
                <source src={URL.createObjectURL(file)} type="audio/mp3" />
              </audio>
            </div>
          )}
        </div>
      </Modal>
    </React.Fragment>
  );
};

export default MicModal;
