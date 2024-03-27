import React, { useEffect, useRef, useState } from "react";
import axios from '../../utils/axios';
import ChatUser from "../../components/user/chat.user";
import { socket } from "../../utils/io";
import { toast } from "react-toastify";
import { STATE } from "../../redux/types/type.app";
import { useSelector } from "react-redux";

const limit = 10;

const ChatSidebar = () => {
    const [chats, setChats] = useState([]);
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState(STATE.PENDING);
    const subNav = useSelector(state => state.appReducer.subNav);

    const fetchChats = async () => {
        const res = await axios.get(`/chat/pagination?page=${page}&limit=${limit}`);
        if (res.errCode === 0) {
            setChats(res.data);
            setStatus(STATE.RESOLVE);
        } else {
            toast.warn('Có lỗi xảy ra !')
            setStatus(STATE.REJECT);
        }
    }

    useEffect(() => {
        fetchChats();
    }, [subNav])
    useEffect(() => {
        if (chats && chats.length > 0) {
            chats.forEach(item => {
                socket.then(socket => {
                    socket.emit('join-chat', item._id);
                    socket.on('joined-chat', room => {
                    })
                })
            })
        }
    }, [chats])

    return (
        <div>
            {
                chats?.length > 0 && status === STATE.RESOLVE &&
                chats.map((chat, index) => {
                    return (
                        <ChatUser
                            key={index}
                            chat={chat}
                            activeKey={chat._id}
                        />
                    )
                })
            }
            {
                status === STATE.REJECT && (
                    <div>
                        <p>Không có cuộc trò chuyện nào</p>
                    </div>
                )
            }
        </div>
    );
}

export default ChatSidebar;