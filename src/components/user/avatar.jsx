import React from "react";
import { Avatar } from 'antd';
import Zoom from 'react-medium-image-zoom'

const AvatarUser = (props) => {
    const { image, children, zoom } = props;
    return (
        <span className="avatar-container" style={{ position: 'relative' }}>
            {
                zoom === true ?
                    (
                        <Zoom>
                            <Avatar
                                size={{
                                    xl: 50,
                                }}
                                src={image}
                                style={{
                                    border: '1px solid #ffffff',
                                    cursor: 'pointer'
                                }}
                            />
                        </Zoom>
                    ) :
                    (
                        <Avatar
                            size={{
                                xl: 50,
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