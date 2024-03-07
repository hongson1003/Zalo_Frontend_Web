import React, { useState } from "react";
import './homeSubLayout.scss';
import SplitPane, { Pane } from 'split-pane-react';
import 'split-pane-react/esm/themes/default.css';
import SidebarHome from "../pages/sidebar/home.sidebar";
import ContentMain from "../pages/main/content.main";

const homeSublayout = () => {
    const [sizes, setSizes] = useState([
        document.body.offsetWidth <= 800 ? document.body.offsetWidth - 70 + 'px' : '330px',
        'auto',
    ]);


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




    return (
        <div className="homeSublayout">
            <SplitPane
                split='vertical'
                sizes={sizes}
                onChange={setSizes}
            >
                <Pane minSize='70px' maxSize={document.body.offsetWidth <= 800 ? document.body.offsetWidth + 'px' : '330px'} style={{ backgroundColor: '#ffffff' }}>
                    <SidebarHome />
                </Pane>

                {/* <div style={{ ...layoutCSS, background: '#a1a5a9' }}>
                    <Welcome />
                </div> */}
                <Pane minSize='200px' className="pane-content">
                    <ContentMain />
                </Pane>
            </SplitPane>
        </div>
    )
}

export default homeSublayout;