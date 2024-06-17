import React, { useEffect } from 'react';
import { Avatar } from 'antd';
import Zoom from 'react-medium-image-zoom';
import { getFirstLetters } from '../../utils/handleUltils';

const styleCSS = {
  position: 'absolute',
  right: '0px',
  bottom: '0px',
  borderRadius: '50%',
  border: '2px solid #ffffff',
  backgroundColor: '#1DA57A',
  width: '12px',
  height: '12px',
};

const AvatarUser = (props) => {
  const { image, children, zoom, size, style, name, isOnline } = props;
  return (
    <div
      className="avatar-container"
      style={{ position: 'relative', ...style }}
    >
      {zoom === true ? (
        <Zoom>
          <Avatar
            src={image}
            style={{
              border: '1px solid #ffffff',
              cursor: 'pointer',
              backgroundColor: image,
            }}
            size={{
              xl: size,
            }}
          >
            {getFirstLetters(name)}
          </Avatar>
        </Zoom>
      ) : (
        <Avatar
          size={{
            xl: size,
          }}
          src={(image && image?.substring(0, 3)) === 'rgb' ? null : image}
          style={{
            border: '1px solid #ffffff',
            cursor: 'pointer',
            backgroundColor: image,
          }}
        >
          {getFirstLetters(name)}
        </Avatar>
      )}
      {children}
      {isOnline && <div className="online" style={styleCSS}></div>}
    </div>
  );
};

export default AvatarUser;
