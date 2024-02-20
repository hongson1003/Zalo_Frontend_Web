import React, { useEffect, useState } from "react";
import { Flex } from 'antd';
import './homeSubLayout.scss';
import SplitPane, { Pane } from 'split-pane-react';
import 'split-pane-react/esm/themes/default.css';
import SidebarHome from "../pages/sidebar/home.message.sidebar";
import Welcome from "../pages/main/main.welcome";

const homeSublayout = () => {
    const [sizes, setSizes] = useState([
        '330px',
        'auto',
    ]);

    const layoutCSS = {
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    };

    useEffect(() => {
    })
    return (
        <div style={{ height: '100%', minHeight: '100vh' }}>
            <SplitPane
                split='vertical'
                sizes={sizes}
                onChange={setSizes}
            >
                <Pane minSize='70px' maxSize='350px' style={{ backgroundColor: '#ffffff' }}>
                    <SidebarHome />
                </Pane>

                {/* <div style={{ ...layoutCSS, background: '#a1a5a9' }}>
                    <Welcome />
                </div> */}
                <Pane style={{ ...layoutCSS }} minSize='70px'>
                    <Welcome />
                </Pane>
            </SplitPane>
        </div>
    )
}

export default homeSublayout;