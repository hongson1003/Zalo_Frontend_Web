import React, { useEffect, useRef, useState } from "react";
import './homeSubLayout.scss';
import SplitPane, { Pane } from 'split-pane-react';
import 'split-pane-react/esm/themes/default.css';
import SidebarHome from "../pages/sidebar/home.sidebar";
import ContentMain from "../pages/main/content.main";
import { useSelector } from "react-redux";
import { compareSizes } from "../utils/handleUltils";

const homeSublayout = () => {
    const sizeRef = useRef(null);
    sizeRef.current = document.body.offsetWidth;
    const [sizes, setSizes] = useState([
        document.body.offsetWidth <= 800 ? document.body.offsetWidth - 70 + 'px' : '330px',
        'auto',
    ]);
    const stateApp = useSelector(state => state?.appReducer);

    useState(() => {
        window.addEventListener("resize", function (event) {
            if (document.body.offsetWidth <= 800) {
                setSizes([document.body.offsetWidth - 70 + 'px', 'auto'])
            }
        });
        return () => {
            window.removeEventListener("resize", function (event) {
            });
        }
    })

    useEffect(() => {
        if (stateApp?.subNav) {
            if (sizeRef.current <= 800) {
                setSizes([0 + 'px', 'auto'])
            }
        }
    }, [stateApp?.subNav])

    useEffect(() => {
        if (compareSizes(sizes[0], '70px') < 0 && stateApp.subNav) {
            setSizes([0 + 'px', 'auto'])
        }
    }, [sizes[0]])

    const handleOnChange = (size) => {
        setSizes([size[0] + 'px', 'auto'])
    }



    return (
        <div className="homeSublayout">
            <SplitPane
                split='vertical'
                sizes={0 || sizes}
                onChange={size => handleOnChange(size)}
            >
                <Pane minSize='70px' maxSize={document.body.offsetWidth <= 800 ? document.body.offsetWidth + 'px' : '330px'} style={{ backgroundColor: '#ffffff' }}>
                    <SidebarHome />
                </Pane>

                <Pane minSize={200} className="pane-content">
                    <ContentMain />
                </Pane>
            </SplitPane>
        </div>
    )
}

export default homeSublayout;