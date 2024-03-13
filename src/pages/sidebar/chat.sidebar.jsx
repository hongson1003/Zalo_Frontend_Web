import React, { useEffect, useRef, useState } from "react";
import axios from '../../utils/axios';
import ChatUser from "../../components/user/chat.user";
import { socket } from "../../utils/io";

const limit = 10;

const ChatSidebar = () => {
    const [chats, setChats] = useState([]);
    const [page, setPage] = useState(1);
    const onlyRef = useRef(false);

    const fetchChats = async () => {
        const res = await axios.get(`/chat/pagination?page=${page}&limit=${limit}`);
        if (res.errCode === 0) {
            setChats(res.data);
        } else {
            setChats('none');
            toast.warn('Có lỗi xảy ra !')
        }
    }

    useEffect(() => {
        if (onlyRef.current === false) {
            fetchChats();
            onlyRef.current = true;
        }
    }, [])
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
                chats !== 'none' ? chats.map((chat, index) => {
                    return (
                        <ChatUser
                            key={index}
                            chat={chat}
                            activeKey={chat._id}
                        />
                    )
                }) : (
                    <div>
                        <h1>Không có cuộc trò chuyện nào</h1>
                    </div>
                )
            }
        </div>
    );
}

export default ChatSidebar;