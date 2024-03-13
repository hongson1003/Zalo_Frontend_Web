import React, { useEffect, useState } from "react";
import { Button, Flex, Modal } from 'antd';
import axios from '../../utils/axios';
import { toast } from "react-toastify";
import './changeBackground.modal.scss';


const ChangeBackgroundModal = ({ chat, children }) => {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(50);
    const [backgrounds, setBackgrounds] = useState([]);
    const [selectedBackground, setSelectedBackground] = useState(null);

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    useEffect(() => {
        fetchBackgroundPaginate(page, limit);
    }, [])

    const fetchBackgroundPaginate = async (page, limit) => {
        const response = await axios.get(`/chat/background/pagination?page=${page}&limit=${limit}`);
        if (response.errCode === 0) {
            setBackgrounds(response.data);
        } else {
            toast.warn(response.message);
        }
    }

    const handleSelectBackground = async (background) => {
        setSelectedBackground(background);
    }



    return (
        <React.Fragment>
            <span onClick={showModal}>{children}</span>

            <Modal title="Basic Modal" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                <Flex wrap="wrap" justify="center" gap={'10px'} className="background-container">
                    <div className="background-body">
                        {
                            backgrounds && backgrounds.length > 0 && backgrounds.map((background, index) => {
                                return (
                                    <div key={background._id} className={selectedBackground && selectedBackground._id === background._id ? 'background-item selected' : 'background-item'}
                                        onClick={() => handleSelectBackground(background)}>
                                        <img src={background.backgroundUrl} alt={background.name} style={{ width: '65px', height: '65px' }} />
                                    </div>
                                )
                            })
                        }
                    </div>
                </Flex>
            </Modal>
        </React.Fragment>
    )
}

export default ChangeBackgroundModal;