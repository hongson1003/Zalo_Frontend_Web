import React, { useEffect, useRef, useState } from "react";
import axios from '../../utils/axios';
import ChatUser from "../../components/user/chat.user";
import { socket } from "../../utils/io";
import { toast } from "react-toastify";
import { STATE } from "../../redux/types/type.app";
import { accessChat } from "../../redux/actions/user.action";
import { useDispatch, useSelector } from "react-redux";


const ChatSidebar = () => {
    const [chats, setChats] = useState([]);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [status, setStatus] = useState(STATE.PENDING);
    const subNav = useSelector(state => state.appReducer.subNav);
    const user = useSelector(state => state.appReducer?.userInfo?.user);
    const dispatch = useDispatch();
    const chat = useSelector(state => state.appReducer?.subNav);
    const fetchChats = async () => {
        const res = await axios.get(`/chat/pagination?page=${page}&limit=${limit}`);
        if (res.errCode === 0) {
            setChats(res.data);
            setStatus(STATE.RESOLVE);
        } else {
            setStatus(STATE.REJECT);
        }
    }
    // lắng nghe sự kiện enter
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.key === 'Enter' && !chat) {
                dispatch(accessChat(chats[0]));
            }
        }
        if (chats.length) {
            window.addEventListener('keypress', handleKeyPress)
        }
        return () => {
            window.removeEventListener('keypress', handleKeyPress)
        }
    }, [chats.length, chat])

    useEffect(() => {
        if (user)
            fetchChats();
    }, [subNav])


    useEffect(() => {
        if (chats && chats.length > 0) {
            chats.forEach(item => {
                socket.then(socket => {
                    socket.emit('join-room', item._id);
                    // socket.on('joined-room', room => {
                    // })
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
                    <div style={{
                        padding: "10px",
                    }}>
                        <p>Không có cuộc trò chuyện nào</p>
                    </div>
                )
            }
        </div>
    );
}

export default ChatSidebar;