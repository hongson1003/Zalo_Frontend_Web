import React, { useEffect } from "react";
import { Avatar } from 'antd';
import Zoom from 'react-medium-image-zoom'
import { getFirstLetters } from "../../utils/handleUltils";



const AvatarUser = (props) => {
    const { image, children, zoom, size, style, name } = props;

    useEffect(() => {
        // console.log(image, name, children, zoom, size, style)
    }, [])

    return (
        <span className="avatar-container" style={{ position: 'relative', ...style }}>
            {
                zoom === true ?
                    (
                        <Zoom>
                            <Avatar
                                src={image}
                                style={{
                                    border: '1px solid #ffffff',
                                    cursor: 'pointer',
                                    backgroundColor: image
                                }}
                                size={{
                                    xl: size,
                                }}
                            >
                                {getFirstLetters(name)}
                            </Avatar>
                        </Zoom>
                    ) :
                    (
                        <Avatar
                            size={{
                                xl: size,
                            }}
                            src={image}
                            style={{
                                border: '1px solid #ffffff',
                                cursor: 'pointer',
                                backgroundColor: image
                            }}>
                            {getFirstLetters(name)}
                        </Avatar>
                    )
            }

            {children}
        </span>
    )
}

export default AvatarUser;