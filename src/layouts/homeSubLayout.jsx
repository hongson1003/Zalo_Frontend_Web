import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import './homeSubLayout.scss';
import SplitPane, { Pane } from 'split-pane-react';
import 'split-pane-react/esm/themes/default.css';
import SidebarHome from "../pages/sidebar/home.sidebar";
import ContentMain from "../pages/main/content.main";
import { useSelector } from "react-redux";

const homeSublayout = () => {
    const [sizes, setSizes] = useState([
        '26%',
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
        if (windowSize[0] < 700 && windowSize[0]) {
            if (!stateApp?.subNav) {
                setVisibleRight('d-none')
                setSizes(['100%', 0])
            } else {
                setVisibleRight('d-show')
                setSizes(['0px', '100%'])
            }
        } else {
            if (windowSize[0] > 800) {
                setVisibleRight('d-show')
                setSizes(['26%', 'auto'])
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
    return (
        <div className="homeSublayout">
            <SplitPane
                split='vertical'
                sizes={sizes}
                onChange={size => handleOnChange(size)}
            >
                <Pane maxSize={500} className={`${visibleLeft}`}>
                    <SidebarHome />
                </Pane>
                <Pane
                    className={`pane-content ${visibleRight}`}>
                    <ContentMain />
                </Pane>
            </SplitPane>
        </div>
    )
}

export default homeSublayout;