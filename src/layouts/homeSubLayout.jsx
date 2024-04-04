import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import './homeSubLayout.scss';
import SplitPane, { Pane } from 'split-pane-react';
import 'split-pane-react/esm/themes/default.css';
import SidebarHome from "../pages/sidebar/home.sidebar";
import ContentMain from "../pages/main/content.main";
import { useSelector } from "react-redux";

const homeSublayout = () => {
    const [sizes, setSizes] = useState([
        '22%',
        'auto',
    ]);
    const [visibleLeft, setVisibleLeft] = useState('d-show');
    const [visibleRight, setVisibleRight] = useState('d-show');
    const stateApp = useSelector(state => state?.appReducer);

    const [windowSize, setWindowSize] = useState([0, 0]);
    useLayoutEffect(() => {
        function updateSize() {
            setWindowSize([window.innerWidth, window.innerHeight]);
        }
        window.addEventListener('resize', updateSize);
        updateSize();
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    useEffect(() => {
        setVisibleLeft('d-show')
        if (windowSize[0] < 750 && windowSize[0]) {
            if (!stateApp?.subNav) {
                setVisibleRight('d-none')
                setSizes(['100%', '0.75%'])
            } else {
                setVisibleRight('d-show')
                setSizes(['0px', '100%'])
            }
        } else {
            if (windowSize[0] > 800) {
                setVisibleRight('d-show')
                setSizes(['22%', 'auto'])
            }
        }
    }, [windowSize, stateApp?.subNav]);

    const handleOnDoubleClick = () => {
        if (sizes[0] !== '0px') {
            setSizes(['0px', '100%'])
        } else {
            setSizes(['26%', 'auto'])
        }
    }

    useEffect(() => {
        const split = document.getElementsByClassName('split-sash-content')[0];
        if (split) {
            split.addEventListener('dblclick', handleOnDoubleClick)
        }
        return () => {
            if (split) {
                split.removeEventListener('dblclick', handleOnDoubleClick)
            }
        }
    }, [sizes[0]])

    const handleOnChange = (size) => {
        // handle resize event
        setSizes(size);
    }

    useEffect(() => {
        const handleKeyDown = (event) => {
            const key = event.key;
            if (key === 'f' && event.ctrlKey) {
                event.preventDefault();
                if (sizes[0] !== '0px') {
                    setSizes(['0px', '100%'])
                    setVisibleLeft('d-none')
                } else {
                    setSizes(['22%', 'auto'])
                    setVisibleLeft('d-show')
                }
            }
        }
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        }
    }, [visibleLeft])
    return (
        <div className="homeSublayout">
            <SplitPane
                split='vertical'
                sizes={sizes}
                onChange={size => handleOnChange(size)}
            >
                <Pane className={`${visibleLeft}`} minSize={280}>
                    <SidebarHome />
                </Pane>
                <Pane
                    className={`pane-content ${visibleRight}`}
                    minSize={400}
                >
                    <ContentMain />
                </Pane>
            </SplitPane>
        </div >
    )
}

export default homeSublayout;