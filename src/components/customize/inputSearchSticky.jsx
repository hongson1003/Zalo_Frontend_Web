import React, { useEffect } from 'react';
import './inputSearchSticky.scss';
import { MESSAGES } from '../../redux/types/user.type';

const InputSearchSticky = ({ children, content, sendMessage, style }) => {
  // const [list, setList] = React.useState([]);

  // useEffect(() => {
  //     if (content?.trim()) {
  //         fetchSearchSticky(content.toLowerCase());
  //     } else if (content?.trim() === '') {
  //         setList([]);
  //     }
  // }, [content])

  // const fetchSearchSticky = async (search) => {
  //     try {
  //         const response = await fetch(`https://messenger.stipop.io/v1/search?userId=1&q=${search}&lang=vi&countryCode=VN&pageNumber=1&limit=20`, {
  //             method: 'GET',
  //             headers: {
  //                 'Accept': 'application/json',
  //                 'Content-Type': 'application/json',
  //                 apikey: import.meta.env.VITE_APP_API_KEY_STIPOP
  //             }
  //         });
  //         const data = await response.json();
  //         const stickers = data.body.stickerList;
  //         if (stickers?.length > 0) {
  //             setList(stickers);
  //         }
  //     } catch (error) {
  //         console.log(error)
  //     }
  // }

  // const handleOnClickSticker = (stickerImg) => {
  //     sendMessage(stickerImg, MESSAGES.STICKER);
  // }

  return (
    <div style={style} className="search-stickey-container">
      {/* {
                content && content.length < 10 && list?.length > 0 &&
                <div className="side-stickers">
                    {
                        list.map(item => {
                            return (
                                <div
                                    key={item.stickerId}
                                    className="side-stickers-item"
                                    onClick={() => handleOnClickSticker(item.stickerImg)}
                                >
                                    <img src={item.stickerImg} />
                                </div>
                            )
                        })
                    }
                </div>
            } */}

      {children}
    </div>
  );
};

export default InputSearchSticky;
