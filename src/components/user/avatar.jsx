import React, { useEffect } from "react";
import { Avatar } from 'antd';
import Zoom from 'react-medium-image-zoom'
const AvatarUser = (props) => {
    const { image, children, zoom, size, style } = props;
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
                                }}
                                size={{
                                    xl: size,
                                }}
                            />
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
                                cursor: 'pointer'
                            }} />
                    )
            }

            {children}
        </span>
    )
}

export default AvatarUser;