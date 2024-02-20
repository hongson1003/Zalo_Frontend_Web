import React from "react";
import { Avatar } from 'antd';

const AvatarUser = (props) => {
    const { image } = props;
    return (
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
    )
}

export default AvatarUser;