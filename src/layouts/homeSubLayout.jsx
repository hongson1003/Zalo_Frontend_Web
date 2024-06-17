import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import './homeSubLayout.scss';
import SplitPane, { Pane } from 'split-pane-react';
import 'split-pane-react/esm/themes/default.css';
import SidebarHome from '../pages/sidebar/home.sidebar';
import ContentMain from '../pages/main/content.main';
import { useSelector } from 'react-redux';
import { Drawer, theme } from 'antd';
import AvatarUser from '../components/user/avatar';

const homeSublayout = () => {
  const [sizes, setSizes] = useState(['350px', 'auto']);
  const [visibleLeft, setVisibleLeft] = useState('d-show');
  const [visibleRight, setVisibleRight] = useState('d-show');
  const [windowSize, setWindowSize] = useState(window.innerWidth);
  const subNav = useSelector((state) => state.appReducer.subNav);

  useEffect(() => {
    if (windowSize < 768) {
      if (!subNav) {
        setSizes(['100%', '0px']);
        setVisibleLeft('d-show');
        setVisibleRight('d-none');
      } else {
        setSizes(['0px', '100%']);
        setVisibleLeft('d-none');
        setVisibleRight('d-show');
      }
    } else {
    }
  }, [windowSize, subNav]);

  const handleOnDoubleClick = (e) => {
    if (
      'split-sash-content split-sash-content-active split-sash-content-vscode' ===
      e.target.className
    ) {
      if (visibleLeft === 'd-show') {
        setSizes(['0px', '100%']);
        setVisibleLeft('d-none');
      } else {
        setSizes(['350px', 'auto']);
        setVisibleLeft('d-show');
      }
    }
  };

  const handleOnChange = (size) => {
    // handle resize event
    setSizes(size);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key;
      if (key === 'M' && event.shiftKey && event.ctrlKey) {
        event.preventDefault();
        if (sizes[0] !== '0px') {
          setSizes(['0px', '100%']);
          setVisibleLeft('d-none');
          setVisibleRight('d-show');
          localStorage.setItem('show', 'false');
        } else {
          setSizes(['350px', 'auto']);
          setVisibleLeft('d-show');
          setVisibleRight('d-show');
          localStorage.setItem('show', 'true');
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [visibleLeft]);

  //Drawer
  const [open, setOpen] = useState(false);
  const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };
  const [searchDrawer, setSearchDrawer] = useState('');
  const listMessageRef = useRef([]);
  const [listMessages, setListMessages] = useState(listMessageRef.current);

  useEffect(() => {
    setListMessages(listMessageRef.current);
  }, [searchDrawer]);

  const handleScrollMessage = (element) => {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="homeSublayout">
      <SplitPane
        split="vertical"
        sizes={sizes}
        onChange={(size) => handleOnChange(size)}
        onDoubleClick={handleOnDoubleClick}
        resizerSize={3}
      >
        <Pane
          className={`${visibleLeft} pane-left`}
          minSize={280}
          maxSize={400}
        >
          <SidebarHome />
          <Drawer
            title="Kết quả tìm kiếm"
            placement="left"
            closable={false}
            onClose={onClose}
            open={open}
            getContainer={false}
            width={'100%'}
          >
            {searchDrawer && listMessages.length > 0 ? (
              <div className="search-drawer">
                {listMessages.map(({ message: item, ref }, index) => {
                  return (
                    <div className="group-search" key={item._id}>
                      <AvatarUser
                        image={item?.sender?.avatar}
                        name={item?.sender?.userName}
                      />
                      <p
                        className="search-item"
                        onClick={() => handleScrollMessage(ref)}
                      >
                        <span>{item?.sender?.userName}: </span>
                        <span>{item?.content}</span>
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="drawer-empty">
                <p>Nhập nội dung cần tìm trong hộp thoại</p>
                <img src="/images/search.png"></img>
              </div>
            )}
          </Drawer>
        </Pane>
        <Pane
          className={`pane-content ${visibleRight} pane-right`}
          minSize={400}
        >
          <ContentMain
            drawerMethods={{
              showDrawer,
              onClose,
              searchDrawer,
              setSearchDrawer,
              listMessages,
              setListMessages,
              listMessageRef,
            }}
          />
        </Pane>
      </SplitPane>
    </div>
  );
};

export default homeSublayout;
