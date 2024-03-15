import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Picker from '@emoji-mart/react'
import data from '@emoji-mart/data'
import appleEmojisData from '@emoji-mart/data/sets/14/google.json'

const custom = [
    {
        id: 'github',
        name: 'GitHub',
        emojis: [
            {
                id: 'octocat',
                name: 'Octocat',
                keywords: ['github'],
                skins: [{ src: './octocat.png' }],
            },
            {
                id: 'shipit',
                name: 'Squirrel',
                keywords: ['github'],
                skins: [
                    { src: './shipit-1.png' }, { src: './shipit-2.png' }, { src: './shipit-3.png' },
                    { src: './shipit-4.png' }, { src: './shipit-5.png' }, { src: './shipit-6.png' },
                ],
            },
        ],
    },
    {
        id: 'gifs',
        name: 'GIFs',
        emojis: [
            {
                id: 'party_parrot',
                name: 'Party Parrot',
                keywords: ['dance', 'dancing'],
                skins: [{ src: './party_parrot.gif' }],
            },
        ],
    },
]
const TestPage = () => {
    const user = useSelector(state => state.appReducer?.userInfo?.user);


    return (
        <div>
            <h1>Test Page</h1>
            <Picker
                data={appleEmojisData}
                onEmojiSelect={console.log}
                set="facebook"
                custom={custom}
            />
        </div >
    )
}

export default TestPage;