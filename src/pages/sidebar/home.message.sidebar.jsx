import React, { useState } from "react";
import SearchMessage from "./home.message.search";


const SidebarHome = () => {

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '10px 5px',
            backgroundColor: '#ffffff'
        }}>
            <SearchMessage />
        </div>
    )
}

export default SidebarHome;